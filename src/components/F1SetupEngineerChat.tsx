import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wrench,
  Radio,
  Send,
  X,
  RefreshCw,
  Sparkles,
  Sliders,
  Copy,
  Check,
  Search,
  ArrowRight,
  Maximize2,
  Minimize2,
  ChevronRight,
  Gauge,
  SlidersHorizontal,
  ClipboardPaste,
  ShieldAlert,
  Flame,
  Zap,
  RotateCcw,
  Compass,
  Activity,
  Disc,
  CornerDownRight,
  CheckCheck,
  Bot,
  User,
  SlidersVertical,
  Layers,
} from 'lucide-react';
import { TRACKS } from '../data/mockData';
import { TrackFlagIcon } from '../utils/trackFlags';
import { useLanguage } from '../i18n/LanguageContext';
import {
  DriverSetupValues,
  DEFAULT_SETUP_PRESETS,
  getCommonHandlingIssues,
  parseSetupFromText,
  diagnoseHandlingIssueWithSetup,
  SetupAdjustment,
} from '../utils/f1EngineerEngine';

export interface F1SetupEngineerChatProps {
  activeGameId?: string;
  activeTrackId?: string;
  onFilterMarketplace?: (trackId: string, gameId?: string) => void;
  onOpenSetupModal?: () => void;
}

type SetupCategoryTab = 'all' | 'aero' | 'transmission' | 'geometry' | 'suspension' | 'brakes' | 'tyres';

interface ChatMessage {
  id: string;
  sender: 'engineer' | 'user';
  text: string;
  timestamp: string;
  adjustments?: SetupAdjustment[];
  source?: 'gemini' | 'telemetry_engine';
  setupSnapshot?: DriverSetupValues;
  telemetryTip?: string;
}

export const F1SetupEngineerChat: React.FC<F1SetupEngineerChatProps> = ({
  activeGameId = 'f1_25',
  activeTrackId = 'spa',
  onFilterMarketplace,
}) => {
  const { language } = useLanguage();
  const isTr = language === 'tr';

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTelemetryDrawer, setShowTelemetryDrawer] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [appliedNotification, setAppliedNotification] = useState<string | null>(null);

  // Active Car Baseline Telemetry
  const [selectedTrack, setSelectedTrack] = useState<string>(activeTrackId || 'spa');
  const [currentSetup, setCurrentSetup] = useState<DriverSetupValues>(DEFAULT_SETUP_PRESETS.balanced.values);
  const [activePresetKey, setActivePresetKey] = useState<string>('balanced');
  const [categoryTab, setCategoryTab] = useState<SetupCategoryTab>('all');
  const [pasteMode, setPasteMode] = useState(false);
  const [pastedSetupText, setPastedSetupText] = useState('');

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Initial natural greeting
  const getGreetingMessage = (): ChatMessage => ({
    id: 'welcome-natural',
    sender: 'engineer',
    text: isTr
      ? `📻 **F1 Pit Wall Canlı Telsiz Hattı Bağlandı.**\n\nSelam sürücüm! Ben F1 Baş Yarış & Setup Mühendisin. ${activeGameId === 'f1_24' ? '2024 Zemin Etkisi' : activeGameId === 'f1_26' ? '2026 Aktif Aerodinamik' : '2025 FIA'} regülasyonlarında pistteki araç dengesini birlikte yöneteceğiz.\n\nBana virajlarda ne hissettiğini doğal bir dille söyle (örn: *"Spa'da Pouhon çıkışında arka tekerlekler aniden kopuyor"* veya *"Monza için 24-19 kanat kullanıyorum, şikan girişinde ne yapmalıyım?"*). İstersen sağdaki **'Araç Telemetrisi'** panelinden setup değerlerini inceleyip anında güncelleyebilirsin.`
      : `📻 **F1 Pit Wall Radio Intercom Connected.**\n\nRadio check driver! I am your Senior Race & Setup Engineer. I'm connected to your live car telemetry under ${activeGameId === 'f1_24' ? '2024 Ground Effect' : activeGameId === 'f1_26' ? '2026 Active Aero' : '2025 FIA'} regulations.\n\nDescribe your handling balance naturally (e.g. *"The car snaps on exit out of Turn 4 at Silverstone"* or *"Running 36-32 wings at Spa, need more straight-line speed"*). You can also tweak your active 6-category setup in the **'Car Telemetry'** drawer anytime.`,
    timestamp: isTr ? 'Şimdi' : 'Now',
    setupSnapshot: currentSetup,
  });

  const [messages, setMessages] = useState<ChatMessage[]>([getGreetingMessage()]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Synchronize when parent active track changes
  useEffect(() => {
    if (activeTrackId && activeTrackId !== selectedTrack) {
      setSelectedTrack(activeTrackId);
    }
  }, [activeTrackId]);

  // Auto-scroll on new message
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  // Apply preset
  const handleApplyPreset = (presetKey: string) => {
    const preset = DEFAULT_SETUP_PRESETS[presetKey];
    if (preset) {
      setActivePresetKey(presetKey);
      setCurrentSetup({ ...preset.values });
      setAppliedNotification(presetKey);
      setTimeout(() => setAppliedNotification(null), 2500);
    }
  };

  // Quick field updater
  const handleUpdateSetupField = (field: keyof DriverSetupValues, val: number) => {
    setCurrentSetup((prev) => ({
      ...prev,
      [field]: val,
    }));
  };

  // Handle parse pasted text
  const handleParsePastedSetup = () => {
    if (!pastedSetupText.trim()) return;
    const parsed = parseSetupFromText(pastedSetupText, currentSetup);
    setCurrentSetup(parsed);
    setPasteMode(false);
    setPastedSetupText('');
    setAppliedNotification('pasted');
    setTimeout(() => setAppliedNotification(null), 2500);
  };

  // Apply single or all suggested adjustments to current setup
  const handleApplyAdjustments = (adjs: SetupAdjustment[]) => {
    setCurrentSetup((prev) => {
      const updated = { ...prev };
      adjs.forEach((a) => {
        const pLower = a.parameter.toLowerCase();
        const numVal = typeof a.recommendedValue === 'number' ? a.recommendedValue : parseFloat(String(a.recommendedValue));

        if (!isNaN(numVal)) {
          // 1. Aerodynamics
          if (pLower.includes('front wing') || pLower.includes('ön kanat')) updated.frontWing = numVal;
          else if (pLower.includes('rear wing') || pLower.includes('arka kanat')) updated.rearWing = numVal;
          // 2. Transmission
          else if (pLower.includes('on-throttle') || pLower.includes('on throttle') || pLower.includes('gaza basarken')) updated.diffOnThrottle = numVal;
          else if (pLower.includes('off-throttle') || pLower.includes('off throttle') || pLower.includes('gaz keserken')) updated.diffOffThrottle = numVal;
          // 3. Suspension Geometry
          else if (pLower.includes('front camber') || pLower.includes('ön kamber')) updated.frontCamber = numVal;
          else if (pLower.includes('rear camber') || pLower.includes('arka kamber')) updated.rearCamber = numVal;
          else if (pLower.includes('front toe') || pLower.includes('ön toe')) updated.frontToe = numVal;
          else if (pLower.includes('rear toe') || pLower.includes('arka toe')) updated.rearToe = numVal;
          // 4. Suspension
          else if (pLower.includes('front suspension') || pLower.includes('ön süspansiyon') || pLower.includes('front spring')) updated.frontSuspension = numVal;
          else if (pLower.includes('rear suspension') || pLower.includes('arka süspansiyon') || pLower.includes('rear spring')) updated.rearSuspension = numVal;
          else if (pLower.includes('rear arb') || pLower.includes('arka arb') || pLower.includes('arka viraj demiri') || pLower.includes('rear anti-roll')) updated.rearARB = numVal;
          else if (pLower.includes('front arb') || pLower.includes('ön arb') || pLower.includes('ön viraj demiri') || pLower.includes('front anti-roll')) updated.frontARB = numVal;
          else if (pLower.includes('front ride') || pLower.includes('ön sürüş') || pLower.includes('ön taban')) updated.frontRideHeight = numVal;
          else if (pLower.includes('rear ride') || pLower.includes('arka sürüş') || pLower.includes('arka taban')) updated.rearRideHeight = numVal;
          // 5. Brakes
          else if (pLower.includes('bias') || pLower.includes('fren dengesi')) updated.brakeBias = numVal;
          else if (pLower.includes('brake pressure') || pLower.includes('fren basınç')) updated.brakePressure = numVal;
          // 6. Tyres (4 individual corners)
          else if (pLower.includes('front left') || pLower.includes('ön sol') || pLower.includes('fl tyre') || pLower.includes('fl pressure')) {
            updated.flTyrePressure = numVal;
          } else if (pLower.includes('front right') || pLower.includes('ön sağ') || pLower.includes('fr tyre') || pLower.includes('fr pressure')) {
            updated.frTyrePressure = numVal;
          } else if (pLower.includes('rear left') || pLower.includes('arka sol') || pLower.includes('rl tyre') || pLower.includes('rl pressure')) {
            updated.rlTyrePressure = numVal;
          } else if (pLower.includes('rear right') || pLower.includes('arka sağ') || pLower.includes('rr tyre') || pLower.includes('rr pressure')) {
            updated.rrTyrePressure = numVal;
          } else if (pLower.includes('front tyre') || pLower.includes('front tire') || pLower.includes('ön lastik') || pLower.includes('fl & fr')) {
            updated.flTyrePressure = numVal;
            updated.frTyrePressure = numVal;
          } else if (pLower.includes('rear tyre') || pLower.includes('rear tire') || pLower.includes('arka lastik') || pLower.includes('rl & rr')) {
            updated.rlTyrePressure = numVal;
            updated.rrTyrePressure = numVal;
          }
        }
      });
      return updated;
    });

    setAppliedNotification('applied_tweaks');
    setTimeout(() => setAppliedNotification(null), 2500);
  };

  // Copy adjustments to clipboard
  const handleCopyAdjustments = (adjs: SetupAdjustment[], msgId: string) => {
    const textToCopy = adjs
      .map((a) => `[${a.category}] ${a.parameter}: ${a.currentValue} -> ${a.recommendedValue} (${a.changeDelta}) | ${a.adjustment}`)
      .join('\n');
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Reset conversation
  const handleResetChat = () => {
    setMessages([getGreetingMessage()]);
  };

  // Natural Send Message Handler (Interacts with /api/engineer/chat)
  const handleSendMessage = async (customQuery?: string) => {
    const query = (customQuery || inputText).trim();
    if (!query || isTyping) return;

    if (!customQuery) setInputText('');

    // Check if query contains raw setup telemetry text (e.g. wings 36-32, diff 55)
    const newlyParsed = parseSetupFromText(query, currentSetup);
    if (JSON.stringify(newlyParsed) !== JSON.stringify(currentSetup)) {
      setCurrentSetup(newlyParsed);
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      setupSnapshot: { ...newlyParsed },
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const historyForApi = messages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        content: m.text,
      }));

      const res = await fetch('/api/engineer/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: historyForApi,
          userQuery: query,
          currentSetup: newlyParsed,
          trackId: selectedTrack,
          gameId: activeGameId,
          language: isTr ? 'tr' : 'en',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const engineerMsg: ChatMessage = {
            id: `eng-${Date.now()}`,
            sender: 'engineer',
            text: data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            adjustments: data.adjustments && data.adjustments.length > 0 ? data.adjustments : undefined,
            source: data.source,
            setupSnapshot: data.parsedSetup || newlyParsed,
            telemetryTip: data.telemetryTip,
          };

          if (data.parsedSetup) {
            setCurrentSetup(data.parsedSetup);
          }

          setMessages((prev) => [...prev, engineerMsg]);
          setIsTyping(false);
          return;
        }
      }
      throw new Error('API route returned error');
    } catch (err) {
      console.warn('Network or server error in engineer chat, using client physics fallback:', err);
      // Client-side fallback dynamic response
      const diag = diagnoseHandlingIssueWithSetup(query, newlyParsed, selectedTrack, language);

      const trackObj = TRACKS[selectedTrack];
      const trackName = trackObj ? trackObj.name : selectedTrack.toUpperCase();

      const fallbackText = isTr
        ? `📻 **Pit Wall Telsizi — Telemetri Alındı:**\n\n` +
          `"Telsiz anlaşıldı sürücüm. **${trackName}** telemetrisi ve bildirdiğiniz *'${query}'* durumu incelendi.\n\n` +
          `🔍 **Mühendislik Değerlendirmesi:**\n` +
          `Mevcut setup telemetrinizde ön/arka kanat **${newlyParsed.frontWing}/${newlyParsed.rearWing}**, diferansiyel **%${newlyParsed.diffOnThrottle} on / %${newlyParsed.diffOffThrottle} off**, yay sertlikleri **${newlyParsed.frontSuspension}/${newlyParsed.rearSuspension}** ve taban yüksekliği **${newlyParsed.frontRideHeight}/${newlyParsed.rearRideHeight}**.\n\n` +
          `${diag.problemAnalysis}\n\n` +
          `🎯 **Önerilen Hassas Tık / Sayı Değişimleri:**\n` +
          diag.adjustments
            .map(
              (a) =>
                `• **[${a.category}] ${a.parameter}:** ${a.currentValue} ➔ **${a.recommendedValue}** (${a.changeDelta})\n  _${a.adjustment} — ${a.impact}_`
            )
            .join('\n\n') +
          `\n\n💡 **Sürüş Notu:** ${diag.telemetryTip}`
        : `📻 **Pit Wall Radio — Telemetry Checked:**\n\n` +
          `"Copy that driver. Telemetry reviewed for **${trackName}** against your feedback *'${query}'*.\n\n` +
          `🔍 **Mechanical & Aero Analysis:**\n` +
          `Your wings are at **${newlyParsed.frontWing}/${newlyParsed.rearWing}**, diff at **${newlyParsed.diffOnThrottle}% on / ${newlyParsed.diffOffThrottle}% off**, springs at **${newlyParsed.frontSuspension}/${newlyParsed.rearSuspension}**, and ride at **${newlyParsed.frontRideHeight}/${newlyParsed.rearRideHeight}**.\n\n` +
          `${diag.problemAnalysis}\n\n` +
          `🎯 **Target Click Adjustments:**\n` +
          diag.adjustments
            .map(
              (a) =>
                `• **[${a.category}] ${a.parameter}:** ${a.currentValue} ➔ **${a.recommendedValue}** (${a.changeDelta})\n  _${a.adjustment} — ${a.impact}_`
            )
            .join('\n\n') +
          `\n\n💡 **Track Tip:** ${diag.telemetryTip}`;

      const engineerMsg: ChatMessage = {
        id: `eng-${Date.now()}`,
        sender: 'engineer',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        adjustments: diag.adjustments,
        source: 'telemetry_engine',
        setupSnapshot: newlyParsed,
        telemetryTip: diag.telemetryTip,
      };

      setMessages((prev) => [...prev, engineerMsg]);
      setIsTyping(false);
    }
  };

  const commonIssues = getCommonHandlingIssues(language);
  const trackObj = TRACKS[selectedTrack];

  return (
    <>
      {/* Floating Intercom Launcher Button (Bottom-Left) */}
      <div className="fixed bottom-5 left-5 z-40">
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setIsOpen(!isOpen);
            setHasUnread(false);
          }}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-full shadow-2xl transition-all border cursor-pointer ${
            isOpen
              ? 'bg-slate-900 text-white border-red-500/50 ring-2 ring-red-500/30'
              : 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white border-red-400/40 shadow-red-600/30 hover:shadow-red-600/50'
          }`}
          title={isTr ? 'F1 AI Yarış Mühendisi' : 'F1 AI Race Engineer'}
        >
          <div className="relative">
            <Radio className="w-5 h-5 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-slate-950 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-slate-950" />
          </div>

          <div className="text-left leading-tight hidden sm:block">
            <div className="text-[10px] font-black uppercase tracking-widest text-red-100 flex items-center gap-1">
              <span>PIT WALL INTERCOM</span>
            </div>
            <div className="text-xs font-black tracking-tight">
              {isTr ? 'AI Setup Mühendisi' : 'AI Setup Engineer'}
            </div>
          </div>

          {hasUnread && !isOpen && (
            <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase">
              LIVE
            </span>
          )}
        </motion.button>
      </div>

      {/* Main Conversational Pit Wall Intercom Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className={`fixed z-50 bg-slate-950/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100 font-sans ${
              isExpanded
                ? 'inset-4 sm:inset-10'
                : 'bottom-20 left-4 right-4 sm:right-auto sm:left-6 sm:w-[580px] md:w-[640px] h-[640px] max-h-[88vh]'
            }`}
          >
            {/* Header: Radio Bar & Circuit Selector */}
            <div className="px-4 py-3 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border-b border-slate-800/80 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                  <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-xs sm:text-sm font-black text-white tracking-tight flex items-center gap-1.5">
                      <span>F1 AI Race Engineer</span>
                    </h3>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 font-bold uppercase">
                      {activeGameId === 'f1_24' ? 'F1 24' : activeGameId === 'f1_26' ? 'F1 26' : 'F1 25'}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      PIT RADIO LIVE
                    </span>
                  </div>

                  {/* Circuit selector */}
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5 truncate">
                    <TrackFlagIcon
                      trackId={selectedTrack}
                      countryOrTrackName={trackObj?.country}
                      size="sm"
                    />
                    <select
                      value={selectedTrack}
                      onChange={(e) => {
                        setSelectedTrack(e.target.value);
                        if (onFilterMarketplace) onFilterMarketplace(e.target.value, activeGameId);
                      }}
                      className="bg-transparent border-0 text-slate-200 text-xs font-bold focus:outline-none cursor-pointer py-0 px-1 hover:text-white"
                    >
                      {Object.values(TRACKS).map((t) => (
                        <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Telemetry Drawer, Expand, Clear, Close */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowTelemetryDrawer(!showTelemetryDrawer)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all border cursor-pointer ${
                    showTelemetryDrawer
                      ? 'bg-red-600 text-white border-red-500 shadow-sm'
                      : 'bg-slate-900 text-slate-300 hover:text-white border-slate-700 hover:border-slate-600'
                  }`}
                  title={isTr ? 'Araç Telemetrisi ve Setup Ayarları' : 'Car Telemetry & Setup Parameters'}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-sky-400" />
                  <span className="hidden sm:inline">{isTr ? 'Araç Telemetrisi' : 'Telemetry'}</span>
                  <span className="font-mono text-[10px] bg-slate-950/60 px-1 py-0.2 rounded">
                    {currentSetup.frontWing}/{currentSetup.rearWing}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleResetChat}
                  className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  title={isTr ? 'Sohbeti Sıfırla' : 'Reset Chat'}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer hidden sm:block"
                  title={isExpanded ? 'Küçült' : 'Genişlet'}
                >
                  {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="Kapat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notification Toast */}
            {appliedNotification && (
              <div className="bg-emerald-500/20 border-b border-emerald-500/30 px-3 py-1.5 text-xs text-emerald-300 flex items-center justify-between font-bold animate-fadeIn">
                <span className="flex items-center gap-1.5">
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    {appliedNotification === 'applied_tweaks'
                      ? isTr
                        ? 'Önerilen telemetri ayarları aktif aracınıza uygulandı!'
                        : 'Suggested telemetry tweaks applied to active car!'
                      : isTr
                      ? 'Yeni setup telemetrisi aktif araca yüklendi.'
                      : 'Setup telemetry loaded into active car.'}
                  </span>
                </span>
                <span className="font-mono text-[10px] text-emerald-400/80">
                  W:{currentSetup.frontWing}/{currentSetup.rearWing} | D:{currentSetup.diffOnThrottle}%
                </span>
              </div>
            )}

            {/* Main Content: Chat Stream + Slide-out Telemetry Drawer */}
            <div className="flex-1 relative flex overflow-hidden">
              {/* Message Stream */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5 scrollbar-thin">
                {messages.map((msg) => {
                  const isEng = msg.sender === 'engineer';
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 ${isEng ? 'justify-start' : 'justify-end'}`}
                    >
                      {isEng && (
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-600 to-rose-700 text-white flex items-center justify-center shrink-0 text-xs shadow-sm shadow-red-600/30 border border-red-500/30 font-black">
                          AI
                        </div>
                      )}

                      <div
                        className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-3.5 text-xs shadow-md ${
                          isEng
                            ? 'bg-slate-900/90 text-slate-100 border border-slate-800'
                            : 'bg-red-600 text-white ml-auto'
                        }`}
                      >
                        {/* Header & Source tag */}
                        <div className="flex items-center justify-between gap-2 text-[10px] text-slate-400 mb-1.5">
                          <span className={`font-bold ${isEng ? 'text-red-400' : 'text-red-100'}`}>
                            {isEng ? 'Chief Race Engineer' : 'Driver'}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">{msg.timestamp}</span>
                        </div>

                        {/* Formatted Text */}
                        <div className="whitespace-pre-line leading-relaxed break-words space-y-1">
                          {msg.text}
                        </div>

                        {/* Structured Adjustments Card (If AI recommended parameter tweaks) */}
                        {msg.adjustments && msg.adjustments.length > 0 && (
                          <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-2">
                            <div className="flex items-center justify-between text-[11px] font-bold text-sky-400">
                              <span className="flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-sky-400" />
                                <span>{isTr ? 'Önerilen Telemetri Değişimleri' : 'Suggested Telemetry Adjustments'}</span>
                              </span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleCopyAdjustments(msg.adjustments!, msg.id)}
                                  className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-750 flex items-center gap-1 transition-colors cursor-pointer"
                                >
                                  {copiedId === msg.id ? (
                                    <>
                                      <Check className="w-2.5 h-2.5 text-emerald-400" />
                                      <span>{isTr ? 'Kopyalandı' : 'Copied'}</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-2.5 h-2.5" />
                                      <span>{isTr ? 'Kopyala' : 'Copy'}</span>
                                    </>
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleApplyAdjustments(msg.adjustments!)}
                                  className="text-[10px] text-slate-950 font-black px-2.5 py-0.5 rounded bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                                >
                                  <SlidersHorizontal className="w-2.5 h-2.5" />
                                  <span>{isTr ? 'Araca Uygula' : 'Apply to Car'}</span>
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                              {msg.adjustments.map((adj, i) => (
                                <div
                                  key={i}
                                  className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 flex flex-col justify-between"
                                >
                                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                                    <span className="font-bold text-slate-300">{adj.parameter}</span>
                                    <span className="px-1.5 py-0.2 rounded bg-slate-800 text-sky-400 font-mono font-bold text-[9px]">
                                      {adj.category}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between font-mono font-bold text-xs my-0.5">
                                    <span className="text-slate-400">{adj.currentValue}</span>
                                    <ArrowRight className="w-3 h-3 text-slate-500" />
                                    <span className="text-emerald-400">{adj.recommendedValue}</span>
                                    <span className="text-[10px] text-amber-400 ml-1">({adj.changeDelta})</span>
                                  </div>
                                  <div className="text-[10px] text-slate-400 mt-1 leading-tight">
                                    {adj.impact}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 animate-pulse pl-9">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <span>{isTr ? 'Yarış mühendisi telemetriyi analiz ediyor...' : 'Race engineer analyzing telemetry...'}</span>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Collapsible Telemetry & Setup Drawer (All 6 Categories) */}
              <AnimatePresence>
                {showTelemetryDrawer && (
                  <motion.div
                    initial={{ x: '100%', opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: '100%', opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="absolute inset-y-0 right-0 w-full sm:w-[360px] bg-slate-950/98 border-l border-slate-800 flex flex-col z-20 shadow-2xl backdrop-blur-md"
                  >
                    {/* Drawer Header */}
                    <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <SlidersVertical className="w-4 h-4 text-red-500" />
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          {isTr ? 'Aktif Araç Telemetrisi (6 Kategori)' : 'Active Car Telemetry (6 Categories)'}
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowTelemetryDrawer(false)}
                        className="p-1 text-slate-400 hover:text-white rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Presets & Paste Switcher */}
                    <div className="p-2.5 border-b border-slate-800/80 bg-slate-900/50 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-bold">{isTr ? 'Espor Şablonları:' : 'Esports Presets:'}</span>
                        <button
                          type="button"
                          onClick={() => setPasteMode(!pasteMode)}
                          className="text-[10px] text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <ClipboardPaste className="w-3 h-3" />
                          <span>{pasteMode ? (isTr ? 'Sürgülere Dön' : 'Back to Sliders') : (isTr ? 'Metin Yapıştır' : 'Paste Setup')}</span>
                        </button>
                      </div>

                      {!pasteMode && (
                        <>
                          <div className="grid grid-cols-2 gap-1.5">
                            {Object.entries(DEFAULT_SETUP_PRESETS).map(([k, p]) => (
                              <button
                                key={k}
                                type="button"
                                onClick={() => handleApplyPreset(k)}
                                className={`px-2 py-1.5 rounded-lg text-[10px] font-bold text-left truncate transition-colors border cursor-pointer ${
                                  activePresetKey === k
                                    ? 'bg-red-600 text-white border-red-500 shadow-sm'
                                    : 'bg-slate-900 text-slate-300 hover:text-white border-slate-800'
                                }`}
                              >
                                {isTr ? p.labelTr : p.labelEn}
                              </button>
                            ))}
                          </div>

                          {/* Category Filter Tabs */}
                          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none text-[10px]">
                            {[
                              { id: 'all', label: isTr ? 'Tümü (6 Kategori)' : 'All (6 Categories)' },
                              { id: 'aero', label: isTr ? 'Aero' : 'Aero' },
                              { id: 'transmission', label: isTr ? 'Şanzıman' : 'Transmission' },
                              { id: 'geometry', label: isTr ? 'Geometri' : 'Geometry' },
                              { id: 'suspension', label: isTr ? 'Süspansiyon' : 'Suspension' },
                              { id: 'brakes', label: isTr ? 'Frenler' : 'Brakes' },
                              { id: 'tyres', label: isTr ? 'Lastikler' : 'Tyres' },
                            ].map((t) => (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() => setCategoryTab(t.id as SetupCategoryTab)}
                                className={`px-2 py-1 rounded-md font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                                  categoryTab === t.id
                                    ? 'bg-red-600 text-white shadow-sm'
                                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                                }`}
                              >
                                {t.label}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Drawer Body: Sliders or Paste Input */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin text-xs">
                      {pasteMode ? (
                        <div className="space-y-2">
                          <p className="text-[11px] text-slate-400">
                            {isTr
                              ? 'Discord, SimGrid veya oyun içinden kopyaladığınız setup metnini yapıştırın:'
                              : 'Paste your raw setup text from Discord, SimGrid, or notes:'}
                          </p>
                          <textarea
                            rows={6}
                            value={pastedSetupText}
                            onChange={(e) => setPastedSetupText(e.target.value)}
                            placeholder="Örn: Front Wing 36 Rear Wing 32, Diff on 58% off 52%, Engine Braking 60%, Front Camber -3.00 Rear Camber -1.50, Front Susp 32 Rear Susp 10, Front ARB 8 Rear ARB 5, Ride Height 35/40, Brake Pressure 100%, Bias 55%, PSI 22.5/20.5"
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-red-500 font-mono"
                          />
                          <button
                            type="button"
                            onClick={handleParsePastedSetup}
                            className="w-full py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{isTr ? 'Telemetriyi Ayrıştır ve Yükle' : 'Parse & Load Telemetry'}</span>
                          </button>
                        </div>
                      ) : (
                        <>
                          {/* 1. Aerodynamics */}
                          {(categoryTab === 'all' || categoryTab === 'aero') && (
                            <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
                              <div className="text-[11px] font-bold text-sky-400 flex items-center justify-between">
                                <span>1. {isTr ? 'Aerodinamik' : 'Aerodynamics'}</span>
                                <span className="font-mono text-white text-[10px]">{currentSetup.frontWing} / {currentSetup.rearWing}</span>
                              </div>
                              <div className="space-y-1.5">
                                <div>
                                  <div className="flex justify-between text-[10px] text-slate-400">
                                    <span>{isTr ? 'Ön Kanat (0-50):' : 'Front Wing (0-50):'}</span>
                                    <span className="font-mono text-white font-bold">{currentSetup.frontWing}</span>
                                  </div>
                                  <input
                                    type="range"
                                    min="0"
                                    max="50"
                                    value={currentSetup.frontWing}
                                    onChange={(e) => handleUpdateSetupField('frontWing', Number(e.target.value))}
                                    className="w-full accent-red-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                                  />
                                </div>
                                <div>
                                  <div className="flex justify-between text-[10px] text-slate-400">
                                    <span>{isTr ? 'Arka Kanat (0-50):' : 'Rear Wing (0-50):'}</span>
                                    <span className="font-mono text-white font-bold">{currentSetup.rearWing}</span>
                                  </div>
                                  <input
                                    type="range"
                                    min="0"
                                    max="50"
                                    value={currentSetup.rearWing}
                                    onChange={(e) => handleUpdateSetupField('rearWing', Number(e.target.value))}
                                    className="w-full accent-red-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 2. Transmission */}
                          {(categoryTab === 'all' || categoryTab === 'transmission') && (
                            <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
                              <div className="text-[11px] font-bold text-sky-400 flex items-center justify-between">
                                <span>2. {isTr ? 'Şanzıman / Diferansiyel' : 'Transmission / Diff'}</span>
                                <span className="font-mono text-white text-[10px]">On: %{currentSetup.diffOnThrottle} | Off: %{currentSetup.diffOffThrottle}</span>
                              </div>
                              <div className="space-y-1.5">
                                <div>
                                  <div className="flex justify-between text-[10px] text-slate-400">
                                    <span>{isTr ? 'Gaza Basarken Diferansiyel (%):' : 'Diff On-Throttle (%):'}</span>
                                    <span className="font-mono text-white font-bold">%{currentSetup.diffOnThrottle}</span>
                                  </div>
                                  <input
                                    type="range"
                                    min="10"
                                    max="100"
                                    value={currentSetup.diffOnThrottle}
                                    onChange={(e) => handleUpdateSetupField('diffOnThrottle', Number(e.target.value))}
                                    className="w-full accent-red-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                                  />
                                </div>
                                <div>
                                  <div className="flex justify-between text-[10px] text-slate-400">
                                    <span>{isTr ? 'Gaz Keserken Diferansiyel (%):' : 'Diff Off-Throttle (%):'}</span>
                                    <span className="font-mono text-white font-bold">%{currentSetup.diffOffThrottle}</span>
                                  </div>
                                  <input
                                    type="range"
                                    min="10"
                                    max="100"
                                    value={currentSetup.diffOffThrottle}
                                    onChange={(e) => handleUpdateSetupField('diffOffThrottle', Number(e.target.value))}
                                    className="w-full accent-red-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 3. Suspension Geometry */}
                          {(categoryTab === 'all' || categoryTab === 'geometry') && (
                            <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
                              <div className="text-[11px] font-bold text-sky-400 flex items-center justify-between">
                                <span>3. {isTr ? 'Süspansiyon Geometrisi' : 'Suspension Geometry'}</span>
                                <span className="font-mono text-white text-[10px]">{currentSetup.frontCamber}° / {currentSetup.rearCamber}°</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <div className="text-[10px] text-slate-400 mb-0.5">{isTr ? 'Ön Kamber:' : 'Front Camber:'} <span className="font-mono text-white font-bold">{currentSetup.frontCamber}°</span></div>
                                  <input
                                    type="range"
                                    min="-3.50"
                                    max="-2.50"
                                    step="0.05"
                                    value={currentSetup.frontCamber}
                                    onChange={(e) => handleUpdateSetupField('frontCamber', Number(e.target.value))}
                                    className="w-full accent-red-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                                  />
                                </div>
                                <div>
                                  <div className="text-[10px] text-slate-400 mb-0.5">{isTr ? 'Arka Kamber:' : 'Rear Camber:'} <span className="font-mono text-white font-bold">{currentSetup.rearCamber}°</span></div>
                                  <input
                                    type="range"
                                    min="-2.20"
                                    max="-0.70"
                                    step="0.05"
                                    value={currentSetup.rearCamber}
                                    onChange={(e) => handleUpdateSetupField('rearCamber', Number(e.target.value))}
                                    className="w-full accent-red-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <div className="text-[10px] text-slate-400 mb-0.5">{isTr ? 'Ön Toe-Out:' : 'Front Toe-Out:'} <span className="font-mono text-white font-bold">{currentSetup.frontToe}°</span></div>
                                  <input
                                    type="range"
                                    min="0.00"
                                    max="0.50"
                                    step="0.01"
                                    value={currentSetup.frontToe}
                                    onChange={(e) => handleUpdateSetupField('frontToe', Number(e.target.value))}
                                    className="w-full accent-red-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                                  />
                                </div>
                                <div>
                                  <div className="text-[10px] text-slate-400 mb-0.5">{isTr ? 'Arka Toe-In:' : 'Rear Toe-In:'} <span className="font-mono text-white font-bold">{currentSetup.rearToe}°</span></div>
                                  <input
                                    type="range"
                                    min="0.00"
                                    max="0.50"
                                    step="0.01"
                                    value={currentSetup.rearToe}
                                    onChange={(e) => handleUpdateSetupField('rearToe', Number(e.target.value))}
                                    className="w-full accent-red-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 4. Suspension & ARBs */}
                          {(categoryTab === 'all' || categoryTab === 'suspension') && (
                            <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
                              <div className="text-[11px] font-bold text-sky-400 flex items-center justify-between">
                                <span>4. {isTr ? 'Süspansiyon & Denge Kolları' : 'Suspension & ARBs'}</span>
                                <span className="font-mono text-white text-[10px]">ARB: {currentSetup.frontARB}/{currentSetup.rearARB}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <div className="text-[10px] text-slate-400 mb-0.5">{isTr ? 'Ön Süspansiyon (1-41):' : 'Front Susp (1-41):'} <span className="font-mono text-white font-bold">{currentSetup.frontSuspension}</span></div>
                                  <input
                                    type="range"
                                    min="1"
                                    max="41"
                                    value={currentSetup.frontSuspension}
                                    onChange={(e) => handleUpdateSetupField('frontSuspension', Number(e.target.value))}
                                    className="w-full accent-red-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                                  />
                                </div>
                                <div>
                                  <div className="text-[10px] text-slate-400 mb-0.5">{isTr ? 'Arka Süspansiyon (1-41):' : 'Rear Susp (1-41):'} <span className="font-mono text-white font-bold">{currentSetup.rearSuspension}</span></div>
                                  <input
                                    type="range"
                                    min="1"
                                    max="41"
                                    value={currentSetup.rearSuspension}
                                    onChange={(e) => handleUpdateSetupField('rearSuspension', Number(e.target.value))}
                                    className="w-full accent-red-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <div className="text-[10px] text-slate-400 mb-0.5">{isTr ? 'Ön ARB (1-21):' : 'Front ARB (1-21):'} <span className="font-mono text-white font-bold">{currentSetup.frontARB}</span></div>
                                  <input
                                    type="range"
                                    min="1"
                                    max="21"
                                    value={currentSetup.frontARB}
                                    onChange={(e) => handleUpdateSetupField('frontARB', Number(e.target.value))}
                                    className="w-full accent-red-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                                  />
                                </div>
                                <div>
                                  <div className="text-[10px] text-slate-400 mb-0.5">{isTr ? 'Arka ARB (1-21):' : 'Rear ARB (1-21):'} <span className="font-mono text-white font-bold">{currentSetup.rearARB}</span></div>
                                  <input
                                    type="range"
                                    min="1"
                                    max="21"
                                    value={currentSetup.rearARB}
                                    onChange={(e) => handleUpdateSetupField('rearARB', Number(e.target.value))}
                                    className="w-full accent-red-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <div className="text-[10px] text-slate-400 mb-0.5">{isTr ? 'Ön Taban (10-45):' : 'Front Ride (10-45):'} <span className="font-mono text-white font-bold">{currentSetup.frontRideHeight}</span></div>
                                  <input
                                    type="range"
                                    min="10"
                                    max="45"
                                    value={currentSetup.frontRideHeight}
                                    onChange={(e) => handleUpdateSetupField('frontRideHeight', Number(e.target.value))}
                                    className="w-full accent-red-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                                  />
                                </div>
                                <div>
                                  <div className="text-[10px] text-slate-400 mb-0.5">{isTr ? 'Arka Taban (30-65):' : 'Rear Ride (30-65):'} <span className="font-mono text-white font-bold">{currentSetup.rearRideHeight}</span></div>
                                  <input
                                    type="range"
                                    min="30"
                                    max="65"
                                    value={currentSetup.rearRideHeight}
                                    onChange={(e) => handleUpdateSetupField('rearRideHeight', Number(e.target.value))}
                                    className="w-full accent-red-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 5. Brakes */}
                          {(categoryTab === 'all' || categoryTab === 'brakes') && (
                            <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
                              <div className="text-[11px] font-bold text-sky-400 flex items-center justify-between">
                                <span>5. {isTr ? 'Fren Sistemi' : 'Brakes'}</span>
                                <span className="font-mono text-white text-[10px]">Bias: %{currentSetup.brakeBias} | Press: %{currentSetup.brakePressure}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <div className="text-[10px] text-slate-400 mb-0.5">{isTr ? 'Fren Basıncı (%):' : 'Brake Pressure (%):'} <span className="font-mono text-white font-bold">%{currentSetup.brakePressure}</span></div>
                                  <input
                                    type="range"
                                    min="80"
                                    max="100"
                                    value={currentSetup.brakePressure}
                                    onChange={(e) => handleUpdateSetupField('brakePressure', Number(e.target.value))}
                                    className="w-full accent-red-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                                  />
                                </div>
                                <div>
                                  <div className="text-[10px] text-slate-400 mb-0.5">{isTr ? 'Ön Fren Dengesi (%):' : 'Front Brake Bias (%):'} <span className="font-mono text-white font-bold">%{currentSetup.brakeBias}</span></div>
                                  <input
                                    type="range"
                                    min="50"
                                    max="70"
                                    value={currentSetup.brakeBias}
                                    onChange={(e) => handleUpdateSetupField('brakeBias', Number(e.target.value))}
                                    className="w-full accent-red-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 6. Tyres (4 Individual Corners) */}
                          {(categoryTab === 'all' || categoryTab === 'tyres') && (
                            <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
                              <div className="text-[11px] font-bold text-sky-400 flex items-center justify-between">
                                <span>6. {isTr ? 'Lastik Basınçları (4 Tekerlek)' : 'Tyre Pressures (4 Corners)'}</span>
                                <span className="font-mono text-white text-[10px]">
                                  {currentSetup.flTyrePressure} / {currentSetup.frTyrePressure} | {currentSetup.rlTyrePressure} / {currentSetup.rrTyrePressure} PSI
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <div className="text-[10px] text-slate-400 mb-0.5">
                                    {isTr ? 'Ön Sol (FL):' : 'Front Left (FL):'} <span className="font-mono text-white font-bold">{currentSetup.flTyrePressure} PSI</span>
                                  </div>
                                  <input
                                    type="range"
                                    min="20.0"
                                    max="29.5"
                                    step="0.1"
                                    value={currentSetup.flTyrePressure}
                                    onChange={(e) => handleUpdateSetupField('flTyrePressure', Number(e.target.value))}
                                    className="w-full accent-red-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                                  />
                                </div>
                                <div>
                                  <div className="text-[10px] text-slate-400 mb-0.5">
                                    {isTr ? 'Ön Sağ (FR):' : 'Front Right (FR):'} <span className="font-mono text-white font-bold">{currentSetup.frTyrePressure} PSI</span>
                                  </div>
                                  <input
                                    type="range"
                                    min="20.0"
                                    max="29.5"
                                    step="0.1"
                                    value={currentSetup.frTyrePressure}
                                    onChange={(e) => handleUpdateSetupField('frTyrePressure', Number(e.target.value))}
                                    className="w-full accent-red-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                                  />
                                </div>
                                <div>
                                  <div className="text-[10px] text-slate-400 mb-0.5">
                                    {isTr ? 'Arka Sol (RL):' : 'Rear Left (RL):'} <span className="font-mono text-white font-bold">{currentSetup.rlTyrePressure} PSI</span>
                                  </div>
                                  <input
                                    type="range"
                                    min="19.0"
                                    max="26.5"
                                    step="0.1"
                                    value={currentSetup.rlTyrePressure}
                                    onChange={(e) => handleUpdateSetupField('rlTyrePressure', Number(e.target.value))}
                                    className="w-full accent-red-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                                  />
                                </div>
                                <div>
                                  <div className="text-[10px] text-slate-400 mb-0.5">
                                    {isTr ? 'Arka Sağ (RR):' : 'Rear Right (RR):'} <span className="font-mono text-white font-bold">{currentSetup.rrTyrePressure} PSI</span>
                                  </div>
                                  <input
                                    type="range"
                                    min="19.0"
                                    max="26.5"
                                    step="0.1"
                                    value={currentSetup.rrTyrePressure}
                                    onChange={(e) => handleUpdateSetupField('rrTyrePressure', Number(e.target.value))}
                                    className="w-full accent-red-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick Context Prompt Chips */}
            <div className="px-3 pt-2 pb-1 bg-slate-900/80 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
              <span className="text-[10px] font-bold text-slate-500 uppercase shrink-0">
                {isTr ? 'Hızlı Telsiz:' : 'Quick Prompt:'}
              </span>
              {commonIssues.slice(0, 5).map((iss) => (
                <button
                  key={iss.id}
                  type="button"
                  onClick={() => handleSendMessage(iss.label)}
                  className="px-2 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-[10px] font-medium text-slate-300 hover:text-white whitespace-nowrap flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                >
                  <span>{iss.icon}</span>
                  <span>{iss.label.split('/')[0].trim()}</span>
                </button>
              ))}
            </div>

            {/* Natural Chat Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-slate-950 border-t border-slate-800/80 flex items-center gap-2"
            >
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    isTr
                      ? "Yarış mühendisine söyle (örn: 'Pouhon çıkışında arkası kopuyor' veya 'Kanat 36-32')..."
                      : "Talk to race engineer (e.g., 'Snapping on exit of Turn 4' or 'Running 36-32 wings')..."
                  }
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={!inputText.trim() || isTyping}
                className={`p-2.5 rounded-xl transition-all flex items-center justify-center shrink-0 cursor-pointer ${
                  inputText.trim() && !isTyping
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/30'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
                title={isTr ? 'Telsizden Gönder' : 'Transmit via Radio'}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
