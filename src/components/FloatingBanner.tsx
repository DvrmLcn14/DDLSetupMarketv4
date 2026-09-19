import React, { useState, useEffect, useRef } from 'react';
import {
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Trophy,
  Zap,
  Flag,
  MessageSquare,
  Edit3,
  Check,
  Save,
  RotateCcw,
  Upload,
  Image as ImageIcon,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import { FloatingBannerConfig, FloatingBannerItem } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { DEFAULT_FLOATING_BANNER_ITEMS, DEFAULT_FLOATING_BANNER_CONFIG } from '../data/bannerConfig';

/**
 * =========================================================================
 *  QUICK CONFIGURATION: EDIT YOUR ADVERTISEMENTS & ANNOUNCEMENTS HERE
 * =========================================================================
 * Modify, add, or replace slides in this array. The component will
 * automatically rotate through all items every 3 seconds.
 * =========================================================================
 */
export const adsData: FloatingBannerItem[] = DEFAULT_FLOATING_BANNER_ITEMS;

// Configuration constants: 3-second automatic rotation
export const BANNER_ROTATION_INTERVAL_SECONDS = 3;

interface FloatingBannerProps {
  config?: FloatingBannerConfig;
  items?: FloatingBannerItem[];
  onOpenSettings?: () => void;
  onSaveConfig?: (updated: FloatingBannerConfig) => void;
  isAdmin?: boolean;
}

// Official Discord SVG icon component
export const DiscordIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

// Color theme styling map
const themeMap: Record<
  string,
  {
    border: string;
    glow: string;
    badgeBg: string;
    iconBg: string;
    buttonBg: string;
    gradient: string;
  }
> = {
  indigo: {
    border: 'border-indigo-500/40 hover:border-indigo-500/70',
    glow: 'shadow-indigo-950/60 hover:shadow-indigo-600/20',
    badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    iconBg: 'bg-[#5865F2] text-white shadow-[#5865F2]/40',
    buttonBg: 'bg-[#5865F2] hover:bg-[#4752C4] text-white shadow-[#5865F2]/30',
    gradient: 'from-[#5865F2] via-indigo-400 to-sky-400',
  },
  red: {
    border: 'border-red-500/40 hover:border-red-500/70',
    glow: 'shadow-red-950/60 hover:shadow-red-600/20',
    badgeBg: 'bg-red-500/20 text-red-300 border-red-500/40',
    iconBg: 'bg-red-600 text-white shadow-red-600/40',
    buttonBg: 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30',
    gradient: 'from-red-600 via-rose-500 to-orange-400',
  },
  emerald: {
    border: 'border-emerald-500/40 hover:border-emerald-500/70',
    glow: 'shadow-emerald-950/60 hover:shadow-emerald-600/20',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    iconBg: 'bg-emerald-600 text-white shadow-emerald-600/40',
    buttonBg: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30',
    gradient: 'from-emerald-500 via-teal-400 to-cyan-400',
  },
  cyan: {
    border: 'border-cyan-500/40 hover:border-cyan-500/70',
    glow: 'shadow-cyan-950/60 hover:shadow-cyan-600/20',
    badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    iconBg: 'bg-cyan-600 text-white shadow-cyan-600/40',
    buttonBg: 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/30',
    gradient: 'from-cyan-500 via-sky-400 to-blue-500',
  },
  amber: {
    border: 'border-amber-500/40 hover:border-amber-500/70',
    glow: 'shadow-amber-950/60 hover:shadow-amber-600/20',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    iconBg: 'bg-amber-600 text-white shadow-amber-600/40',
    buttonBg: 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30',
    gradient: 'from-amber-500 via-yellow-400 to-orange-500',
  },
  purple: {
    border: 'border-purple-500/40 hover:border-purple-500/70',
    glow: 'shadow-purple-950/60 hover:shadow-purple-600/20',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    iconBg: 'bg-purple-600 text-white shadow-purple-600/40',
    buttonBg: 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30',
    gradient: 'from-purple-600 via-fuchsia-400 to-pink-500',
  },
};

export const FloatingBanner: React.FC<FloatingBannerProps> = ({
  config,
  onSaveConfig,
  isAdmin = false,
}) => {
  const { t } = useLanguage();
  // Active slide index (0 = Slide 1, 1 = Slide 2, etc.)
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // User collapsible / shrink toggle state (persisted in localStorage)
  const [isMinimized, setIsMinimized] = useState<boolean>(() => {
    try {
      return localStorage.getItem('ddl_banner_minimized') === 'true';
    } catch {
      return false;
    }
  });

  const toggleMinimized = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMinimized((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('ddl_banner_minimized', String(next));
      } catch {}
      return next;
    });
  };

  // Admin inline edit mode
  const [isEditingInline, setIsEditingInline] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<boolean>(false);

  // Determine active slides list: Use config.items if present, otherwise default to top adsData
  const slides: FloatingBannerItem[] = React.useMemo(() => {
    if (config?.items && config.items.length > 0) {
      return config.items;
    }
    return adsData;
  }, [config?.items]);

  const activeIndex = Math.min(currentSlideIndex, Math.max(0, slides.length - 1));
  const currentSlide = slides[activeIndex] || adsData[0];

  // Inline form state for admin
  const [editFormData, setEditFormData] = useState<FloatingBannerItem>({ ...currentSlide });

  // Sync form when active slide changes
  useEffect(() => {
    if (!isEditingInline) {
      setEditFormData({ ...currentSlide });
    }
  }, [currentSlideIndex, currentSlide, isEditingInline]);

  if (config && config.enabled === false && !isAdmin) {
    return null;
  }

  // Reliable Auto-rotation timer: Rotates every 5 seconds
  useEffect(() => {
    if (isPaused || isEditingInline || slides.length <= 1) {
      return;
    }

    const intervalSeconds = config?.intervalSeconds || BANNER_ROTATION_INTERVAL_SECONDS;
    const intervalMs = intervalSeconds * 1000;

    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [config?.intervalSeconds, isPaused, isEditingInline, slides.length]);

  const handleNextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
  };

  const handlePrevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Direct Live Save of the current slide
  const handleSaveInlineEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData) return;

    const updatedSlides = slides.map((s, idx) => (idx === activeIndex ? { ...editFormData } : s));

    const updatedConfig: FloatingBannerConfig = {
      ...(config || { enabled: true, autoRotate: true, intervalSeconds: 5 }),
      items: updatedSlides,
      title: updatedSlides[0]?.title,
      description: updatedSlides[0]?.description,
      buttonText: updatedSlides[0]?.buttonText,
      buttonUrl: updatedSlides[0]?.buttonUrl,
      badgeText: updatedSlides[0]?.badgeText,
      onlineCount: updatedSlides[0]?.onlineCount,
      iconType: updatedSlides[0]?.iconType,
      accentColor: updatedSlides[0]?.accentColor,
    };

    try {
      localStorage.setItem('ddl_floating_banner_config', JSON.stringify(updatedConfig));
    } catch (err) {
      console.warn('Could not write banner config to localStorage', err);
    }

    if (onSaveConfig) {
      onSaveConfig(updatedConfig);
    }

    setSaveSuccessMsg(true);
    setTimeout(() => {
      setSaveSuccessMsg(false);
      setIsEditingInline(false);
    }, 600);
  };

  // Reset to top adsData
  const handleResetToDefaultAds = (e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedConfig: FloatingBannerConfig = {
      ...(config || { enabled: true, autoRotate: true, intervalSeconds: 5 }),
      items: adsData,
      title: adsData[0].title,
      description: adsData[0].description,
      buttonText: adsData[0].buttonText,
      buttonUrl: adsData[0].buttonUrl,
      badgeText: adsData[0].badgeText,
      onlineCount: adsData[0].onlineCount,
      iconType: adsData[0].iconType,
      accentColor: adsData[0].accentColor,
    };

    try {
      localStorage.setItem('ddl_floating_banner_config', JSON.stringify(updatedConfig));
    } catch (err) {
      console.warn('Could not reset banner config', err);
    }

    if (onSaveConfig) {
      onSaveConfig(updatedConfig);
    }

    setEditFormData({ ...adsData[activeIndex] });
    setSaveSuccessMsg(true);
    setTimeout(() => {
      setSaveSuccessMsg(false);
      setIsEditingInline(false);
    }, 600);
  };

  const activeThemeColor = isEditingInline && editFormData?.accentColor
    ? editFormData.accentColor
    : currentSlide.accentColor || (activeIndex === 0 ? 'indigo' : 'amber');

  const currentTheme = themeMap[activeThemeColor] || themeMap.indigo;

  // Render icon for slide
  const renderSlideIcon = (item: FloatingBannerItem) => {
    if (item.iconType === 'custom' && item.customIconUrl) {
      return (
        <img
          src={item.customIconUrl}
          alt="Icon"
          referrerPolicy="no-referrer"
          className="w-5 h-5 rounded object-cover"
        />
      );
    }
    if (item.iconType === 'trophy') {
      return <Trophy className="w-5 h-5 text-white" />;
    }
    if (item.iconType === 'sparkles') {
      return <Sparkles className="w-5 h-5 text-white" />;
    }
    if (item.iconType === 'zap') {
      return <Zap className="w-5 h-5 text-white" />;
    }
    if (item.iconType === 'flag') {
      return <Flag className="w-5 h-5 text-white" />;
    }
    return <DiscordIcon className="w-5 h-5 text-white" />;
  };

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('input') ||
      target.closest('textarea') ||
      target.closest('select') ||
      target.closest('a')
    ) {
      return;
    }
    if (isEditingInline) return;

    if (currentSlide.buttonUrl) {
      window.open(currentSlide.buttonUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (isMinimized && !isEditingInline) {
    return (
      <div
        id="floating-discord-banner-minimized"
        onClick={handleCardClick}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className={`fixed bottom-3 right-3 z-40 bg-slate-900/95 backdrop-blur-md rounded-full border ${
          currentTheme.border
        } ${currentTheme.glow} shadow-xl flex items-center gap-2 p-1.5 pl-2.5 transition-all duration-300 hover:scale-[1.02] cursor-pointer animate-in fade-in select-none max-w-[260px]`}
        title={`${currentSlide.title} - ${currentSlide.buttonText} (${activeIndex + 1}/${slides.length})`}
      >
        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 shadow-xs ${currentTheme.iconBg}`}>
          {currentSlide.iconType === 'discord' ? (
            <DiscordIcon className="w-3 h-3 text-white" />
          ) : (
            renderSlideIcon(currentSlide)
          )}
        </div>
        <div className="flex-1 min-w-0 pr-1">
          <span className="text-[11px] font-black text-white block truncate">
            {currentSlide.title}
          </span>
        </div>
        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border shrink-0 ${currentTheme.badgeBg}`}>
          {currentSlide.badgeText?.split(' ')[0] || 'AD'}
        </span>
        <button
          type="button"
          onClick={toggleMinimized}
          title="Expand Banner"
          className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
        >
          <Maximize2 className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div
      id="floating-discord-banner"
      onClick={handleCardClick}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`fixed bottom-3 right-3 z-40 ${
        isEditingInline ? 'max-w-[380px] sm:max-w-[400px]' : 'max-w-[240px] sm:max-w-[260px]'
      } w-[calc(100vw-1.5rem)] bg-slate-900/95 backdrop-blur-md rounded-xl border ${
        currentTheme.border
      } ${currentTheme.glow} shadow-lg transition-all duration-300 overflow-hidden animate-in fade-in slide-in-from-bottom-5 ${
        !isEditingInline ? 'cursor-pointer hover:border-indigo-500/80 hover:shadow-indigo-500/20' : ''
      }`}
    >
      {/* Top Header Accent Line */}
      <div className={`h-0.5 w-full bg-gradient-to-r ${currentTheme.gradient}`} />

      <div className="p-2 sm:p-2.5 space-y-1.5">
        {/* Top bar: Badge, Online count, Page Indicators (1/5), Prev/Next controls, Minimize */}
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1 flex-wrap min-w-0">
            {isEditingInline ? (
              <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                <Edit3 className="w-2.5 h-2.5 text-amber-400" />
                <span>Editing {activeIndex + 1}/{slides.length}</span>
              </span>
            ) : (
              <>
                <span
                  className={`text-[8.5px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-full border transition-all duration-300 truncate max-w-[110px] ${currentTheme.badgeBg}`}
                >
                  {currentSlide.badgeText || (activeIndex === 0 ? 'AD' : 'ANNOUNCEMENT')}
                </span>
                {typeof currentSlide.onlineCount === 'number' && (
                  <span className="flex items-center gap-1 text-[9.5px] font-medium text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <span className="text-emerald-400 font-bold">{currentSlide.onlineCount}</span>
                  </span>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
            {/* Slider Controls: Prev (<), Slide Indicator (1/5), Next (>) */}
            {!isEditingInline && (
              <div className="flex items-center bg-slate-950/80 rounded border border-slate-800 p-0.5">
                <button
                  type="button"
                  id="banner-prev-slide-btn"
                  onClick={handlePrevSlide}
                  title="Previous Slide"
                  className="p-0.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-2.5 h-2.5" />
                </button>

                <span className="text-[8.5px] font-mono font-bold text-slate-300 px-1 select-none">
                  {activeIndex + 1}/{slides.length}
                </span>

                <button
                  type="button"
                  id="banner-next-slide-btn"
                  onClick={handleNextSlide}
                  title="Next Slide"
                  className="p-0.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-2.5 h-2.5" />
                </button>
              </div>
            )}

            {/* Minimize / Shrink Button */}
            {!isEditingInline && (
              <button
                type="button"
                id="banner-minimize-btn"
                onClick={toggleMinimized}
                title="Minimize banner"
                className="p-0.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Minimize2 className="w-2.5 h-2.5" />
              </button>
            )}

            {/* Admin Edit Button */}
            {isAdmin && (
              <button
                type="button"
                id="live-edit-banner-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  if (isEditingInline) {
                    setIsEditingInline(false);
                  } else {
                    setEditFormData({ ...currentSlide });
                    setIsEditingInline(true);
                  }
                }}
                title={isEditingInline ? 'Cancel Edit' : `Edit Slide ${activeIndex + 1} (Admin)`}
                className={`flex items-center gap-1 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border transition-all cursor-pointer ${
                  isEditingInline
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md'
                    : 'bg-slate-800/90 text-amber-300 border-amber-500/30 hover:bg-amber-500 hover:text-slate-950 hover:border-amber-400'
                }`}
              >
                <Edit3 className="w-2.5 h-2.5" />
                <span>{isEditingInline ? 'Exit' : 'Edit'}</span>
              </button>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* INLINE ADMIN EDIT FORM                                    */}
        {/* ========================================================= */}
        {isEditingInline && editFormData ? (
          <form
            onSubmit={handleSaveInlineEdit}
            onClick={(e) => e.stopPropagation()}
            className="space-y-3 bg-slate-950/90 p-3.5 rounded-xl border border-amber-500/30 text-xs animate-in fade-in zoom-in-95 cursor-default"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="font-extrabold text-amber-300 flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                <span>Editing Slide #{activeIndex + 1} of {slides.length}</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const nextIdx = (activeIndex + 1) % slides.length;
                    setCurrentSlideIndex(nextIdx);
                    setEditFormData({ ...slides[nextIdx] });
                  }}
                  className="text-[10px] text-indigo-300 hover:text-indigo-200 underline font-semibold cursor-pointer"
                >
                  Switch to Slide {((activeIndex + 1) % slides.length) + 1}
                </button>
                <button
                  type="button"
                  onClick={handleResetToDefaultAds}
                  title="Reset to default adsData defined in FloatingBanner.tsx"
                  className="text-[10px] text-slate-400 hover:text-amber-300 flex items-center gap-0.5 cursor-pointer"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>Reset Default</span>
                </button>
              </div>
            </div>

            {/* 1. Title */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Slide #{activeIndex + 1} Title:
              </label>
              <input
                type="text"
                required
                value={editFormData.title}
                onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                placeholder={activeIndex === 0 ? 'Join PRL League' : 'Custom Announcement Title'}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* 2. Description */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Description:
              </label>
              <textarea
                rows={2}
                required
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                placeholder="Enter advertisement or announcement text..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* 3. Link Target URL */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Button Target Link / URL:
              </label>
              <input
                type="text"
                required
                value={editFormData.buttonUrl}
                onChange={(e) => setEditFormData({ ...editFormData, buttonUrl: e.target.value })}
                placeholder="https://discord.gg/aFzAhfBy3"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono text-[11px]"
              />
            </div>

            {/* 4. Badge & Button Label */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Badge Tag:
                </label>
                <input
                  type="text"
                  value={editFormData.badgeText || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, badgeText: e.target.value })}
                  placeholder={activeIndex === 0 ? 'ADVERTISEMENT' : 'ANNOUNCEMENT'}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Button Text:
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.buttonText}
                  onChange={(e) => setEditFormData({ ...editFormData, buttonText: e.target.value })}
                  placeholder="Join PRL League"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* 5. Icon & Color Theme */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Icon:
                </label>
                <select
                  value={editFormData.iconType}
                  onChange={(e) => setEditFormData({ ...editFormData, iconType: e.target.value as any })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="discord">Discord</option>
                  <option value="custom">Custom Image / Logo</option>
                  <option value="trophy">Trophy</option>
                  <option value="sparkles">Sparkles</option>
                  <option value="zap">Zap (Speed)</option>
                  <option value="flag">Racing Flag</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Color Theme:
                </label>
                <select
                  value={editFormData.accentColor || 'indigo'}
                  onChange={(e) => setEditFormData({ ...editFormData, accentColor: e.target.value as any })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="indigo">Discord Blurple</option>
                  <option value="amber">Amber Gold</option>
                  <option value="emerald">Emerald Green</option>
                  <option value="cyan">Cyan Telemetry</option>
                  <option value="red">Racing Red</option>
                  <option value="purple">Esports Purple</option>
                </select>
              </div>
            </div>

            {/* Custom Image Upload / URL in Inline Mode */}
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-300">
                Custom Slot Image / Logo:
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={editFormData.customIconUrl || ''}
                  onChange={(e) => {
                    setEditFormData({
                      ...editFormData,
                      customIconUrl: e.target.value,
                      iconType: e.target.value ? 'custom' : editFormData.iconType,
                    });
                  }}
                  placeholder="https://... image link"
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none focus:border-amber-400 font-mono"
                />
                <label className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold rounded-lg border border-slate-700 flex items-center gap-1 transition-colors cursor-pointer shrink-0">
                  <Upload className="w-3 h-3" />
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          const dataUrl = ev.target?.result as string;
                          if (dataUrl) {
                            setEditFormData({
                              ...editFormData,
                              customIconUrl: dataUrl,
                              iconType: 'custom',
                            });
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-1.5 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setIsEditingInline(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                id="save-live-ad-btn"
                className="flex-1 px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-lg flex items-center justify-center gap-1.5 transition-all transform active:scale-95 cursor-pointer"
              >
                {saveSuccessMsg ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Saved Slide {activeIndex + 1}!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Slide {activeIndex + 1}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* ========================================================= */
          /* STANDARD ACTIVE SLIDE DISPLAY                             */
          /* ========================================================= */
          <>
            {/* Content Section: Compact Icon + Title + Description */}
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 shadow-xs ${currentTheme.iconBg}`}
              >
                {renderSlideIcon(currentSlide)}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-[11px] font-bold text-white tracking-tight flex items-center gap-1 truncate group-hover:text-indigo-300 transition-colors">
                  <span>{currentSlide.title}</span>
                </h4>
                <p className="text-[9.5px] text-slate-300 leading-tight truncate">
                  {currentSlide.description}
                </p>
              </div>
            </div>

            {/* Compact Action Button */}
            <div>
              <a
                id="action-floating-banner-btn"
                href={currentSlide.buttonUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className={`w-full flex items-center justify-center gap-1.5 py-1 px-2.5 rounded-lg text-[10.5px] font-bold shadow transition-all transform active:scale-95 cursor-pointer ${currentTheme.buttonBg}`}
              >
                {currentSlide.iconType === 'discord' ? (
                  <DiscordIcon className="w-3 h-3 shrink-0" />
                ) : currentSlide.iconType === 'trophy' ? (
                  <Trophy className="w-3 h-3 shrink-0" />
                ) : currentSlide.iconType === 'sparkles' ? (
                  <Sparkles className="w-3 h-3 shrink-0" />
                ) : currentSlide.iconType === 'zap' ? (
                  <Zap className="w-3 h-3 shrink-0" />
                ) : currentSlide.iconType === 'flag' ? (
                  <Flag className="w-3 h-3 shrink-0" />
                ) : (
                  <MessageSquare className="w-3 h-3 shrink-0" />
                )}
                <span className="truncate">{currentSlide.buttonText}</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-80 shrink-0" />
              </a>
            </div>

            {/* Slide Indicator Dots */}
            <div className="flex items-center justify-center gap-1 pt-0.5">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentSlideIndex(idx);
                  }}
                  title={`Go to Slide ${idx + 1}`}
                  className={`h-0.5 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === activeIndex
                      ? 'w-3.5 bg-indigo-400 shadow-xs shadow-indigo-500/50'
                      : 'w-1 bg-slate-700 hover:bg-slate-500'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
