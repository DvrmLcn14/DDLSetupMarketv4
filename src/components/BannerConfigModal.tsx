import React, { useState, useMemo, useRef } from 'react';
import {
  X,
  Save,
  RefreshCw,
  Sparkles,
  Trophy,
  Zap,
  Flag,
  Plus,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Clock,
  Layers,
  Image as ImageIcon,
  Upload,
  Globe,
  Link2,
  CheckCircle2,
} from 'lucide-react';
import { FloatingBannerConfig, FloatingBannerItem } from '../types';
import { DEFAULT_FLOATING_BANNER_CONFIG, DEFAULT_FLOATING_BANNER_ITEMS } from '../data/bannerConfig';
import { DiscordIcon } from './FloatingBanner';

interface BannerConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: FloatingBannerConfig;
  onSaveConfig: (updated: FloatingBannerConfig) => void;
}

export const BannerConfigModal: React.FC<BannerConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ensure items list is initialized
  const initialItems = useMemo(() => {
    if (config.items && config.items.length > 0) return config.items;
    if (config.title || config.description) {
      return [
        {
          id: 'slide-1',
          title: config.title || 'Join PRL League',
          highlightText: config.highlightText || 'Official League',
          description:
            config.description ||
            'Access exclusive PRL League setups, race results, and connect with fellow league drivers.',
          buttonText: config.buttonText || 'Join PRL League',
          buttonUrl: config.buttonUrl || 'https://discord.gg/aFzAhfBy3',
          badgeText: config.badgeText || 'ADVERTISEMENT',
          onlineCount: config.onlineCount || 428,
          iconType: config.iconType || 'discord',
          customIconUrl: config.customIconUrl,
          bannerImageUrl: config.bannerImageUrl,
          accentColor: config.accentColor || 'indigo',
        },
      ];
    }
    return DEFAULT_FLOATING_BANNER_ITEMS;
  }, [config]);

  const [formData, setFormData] = useState<FloatingBannerConfig>({
    ...config,
    items: initialItems,
    autoRotate: config.autoRotate !== false,
    intervalSeconds: config.intervalSeconds || 3,
  });

  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentItems =
    formData.items && formData.items.length > 0 ? formData.items : DEFAULT_FLOATING_BANNER_ITEMS;
  const safeSlideIndex = Math.min(Math.max(0, activeSlideIndex), currentItems.length - 1);
  const currentSlide = currentItems[safeSlideIndex] || currentItems[0];

  const handleUpdateCurrentSlide = (field: keyof FloatingBannerItem, value: any) => {
    const updated = currentItems.map((item, idx) => {
      if (idx === safeSlideIndex) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setFormData({
      ...formData,
      items: updated,
      // sync top-level backwards compatibility fields with slide 0
      ...(safeSlideIndex === 0 ? { [field]: value } : {}),
    });
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (4MB)
    if (file.size > 4 * 1024 * 1024) {
      alert('Image file must be under 4MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        handleUpdateCurrentSlide('customIconUrl', dataUrl);
        handleUpdateCurrentSlide('iconType', 'custom');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddSlide = () => {
    const newSlide: FloatingBannerItem = {
      id: `slide-${Date.now()}`,
      title: 'New Advertisement Slot',
      highlightText: 'Featured Partner',
      description: 'Highlight hot telemetry setups, championship leagues, sponsors, or custom discord invites.',
      buttonText: 'Visit Link',
      buttonUrl: 'https://discord.gg/aFzAhfBy3',
      badgeText: 'SPONSOR / AD',
      onlineCount: 250,
      iconType: 'sparkles',
      accentColor: 'indigo',
    };
    const updated = [...currentItems, newSlide];
    setFormData({ ...formData, items: updated });
    setActiveSlideIndex(updated.length - 1);
  };

  const handleDeleteSlide = (idxToDelete: number) => {
    if (currentItems.length <= 1) {
      alert('You must have at least one advertisement slide.');
      return;
    }
    const updated = currentItems.filter((_, idx) => idx !== idxToDelete);
    setFormData({ ...formData, items: updated });
    setActiveSlideIndex(Math.max(0, idxToDelete - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSaveConfig(formData);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 700);
    } catch (err) {
      console.error('Failed to save banner config:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setFormData({ ...DEFAULT_FLOATING_BANNER_CONFIG });
    setActiveSlideIndex(0);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-hidden">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#5865F2] flex items-center justify-center text-white shadow-md shadow-[#5865F2]/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-base">
                  Advertisement &amp; Banner Slot Manager
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  <span>Public Global Sync</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Configured advertisement slots, sponsor images, and links are saved to the server and visible to all visitors.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Edit Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto flex-1 pr-1">
          {/* Global Controls: Enable & Auto-Rotate Timer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
            {/* Enabled Switch */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Enable Advertisement Banner</span>
                <span className="text-[11px] text-slate-400">Display widget on bottom-right for all users</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-2">
                <input
                  type="checkbox"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#5865F2]"></div>
              </label>
            </div>

            {/* Auto Rotate & Interval */}
            <div className="flex items-center justify-between border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0 sm:pl-3">
              <div>
                <span className="text-xs font-bold text-white block flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  Auto-Rotate Interval
                </span>
                <span className="text-[11px] text-slate-400">Rotate slides automatically</span>
              </div>
              <div className="flex items-center gap-1.5">
                <select
                  value={formData.intervalSeconds || 3}
                  onChange={(e) =>
                    setFormData({ ...formData, intervalSeconds: parseInt(e.target.value, 10) })
                  }
                  className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500"
                >
                  <option value={2}>2 sec (Fast)</option>
                  <option value={3}>3 sec (Recommended)</option>
                  <option value={5}>5 sec</option>
                  <option value={8}>8 sec</option>
                  <option value={10}>10 sec</option>
                </select>
              </div>
            </div>
          </div>

          {/* Slide Tabs Navigation & Add Button */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <span>Configured Advertisement Slots</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 font-mono">
                  {currentItems.length} Slot{currentItems.length > 1 ? 's' : ''}
                </span>
              </span>
              <button
                type="button"
                onClick={handleAddSlide}
                className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Slot</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {currentItems.map((slide, idx) => (
                <button
                  key={slide.id || idx}
                  type="button"
                  onClick={() => setActiveSlideIndex(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    idx === safeSlideIndex
                      ? 'bg-indigo-600/30 text-indigo-200 border-indigo-500 shadow-sm shadow-indigo-500/20'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span>Slot #{idx + 1}</span>
                  <span className="max-w-[110px] truncate text-[11px] opacity-80 font-normal">
                    {slide.title}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Slide Form Fields */}
          <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-black text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>Editing Slot #{safeSlideIndex + 1} Details</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  (ID: {currentSlide.id || `slot-${safeSlideIndex + 1}`})
                </span>
              </span>
              {currentItems.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleDeleteSlide(safeSlideIndex)}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 hover:bg-rose-950/40 px-2 py-1 rounded transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Slot</span>
                </button>
              )}
            </div>

            {/* Title & Badge */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Advertisement / Slot Title:
                </label>
                <input
                  type="text"
                  required
                  value={currentSlide.title}
                  onChange={(e) => handleUpdateCurrentSlide('title', e.target.value)}
                  placeholder="e.g. Join PRL League, Apex Tuning"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5865F2]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Badge Tag (Top label):
                </label>
                <input
                  type="text"
                  value={currentSlide.badgeText || ''}
                  onChange={(e) => handleUpdateCurrentSlide('badgeText', e.target.value)}
                  placeholder="e.g. ADVERTISEMENT, SPONSOR, OFFICIAL LEAGUE"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5865F2]"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Description &amp; Highlights:
              </label>
              <textarea
                rows={2}
                required
                value={currentSlide.description}
                onChange={(e) => handleUpdateCurrentSlide('description', e.target.value)}
                placeholder="Short catchy explanation of advertisement, sponsor perks, or league registration..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#5865F2]"
              />
            </div>

            {/* Target Link & Preset Helpers */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                  <Link2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Destination / Click Link URL:</span>
                </label>
                <span className="text-[10px] text-slate-400">Where visitors are redirected on click</span>
              </div>
              <input
                type="text"
                required
                value={currentSlide.buttonUrl}
                onChange={(e) => handleUpdateCurrentSlide('buttonUrl', e.target.value)}
                placeholder="https://discord.gg/... or https://yoursite.com"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5865F2] font-mono text-[11px]"
              />
              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                <span className="text-[10px] text-slate-400">Quick URL Presets:</span>
                <button
                  type="button"
                  onClick={() => handleUpdateCurrentSlide('buttonUrl', 'https://discord.gg/aFzAhfBy3')}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 text-[10px] font-mono transition-colors cursor-pointer"
                >
                  PRL Discord
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateCurrentSlide('buttonUrl', 'https://youtube.com')}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-rose-300 text-[10px] font-mono transition-colors cursor-pointer"
                >
                  YouTube
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateCurrentSlide('buttonUrl', 'https://twitch.tv')}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-purple-300 text-[10px] font-mono transition-colors cursor-pointer"
                >
                  Twitch
                </button>
              </div>
            </div>

            {/* Button Text & Online Count */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Action Button Label:
                </label>
                <input
                  type="text"
                  required
                  value={currentSlide.buttonText}
                  onChange={(e) => handleUpdateCurrentSlide('buttonText', e.target.value)}
                  placeholder="e.g. Join PRL League, Visit Store"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5865F2]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Active Count / Drivers (Optional):
                </label>
                <input
                  type="number"
                  min={0}
                  value={currentSlide.onlineCount || 0}
                  onChange={(e) =>
                    handleUpdateCurrentSlide('onlineCount', parseInt(e.target.value, 10) || 0)
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5865F2]"
                />
              </div>
            </div>

            {/* Icon / Image & Color Theme */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-800/80">
              {/* Icon Type Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Slot Icon / Visual Graphic:
                </label>
                <select
                  value={currentSlide.iconType}
                  onChange={(e) => handleUpdateCurrentSlide('iconType', e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5865F2]"
                >
                  <option value="discord">Discord Icon</option>
                  <option value="custom">Custom Image / Logo Upload</option>
                  <option value="trophy">Trophy (Esports / Laps)</option>
                  <option value="sparkles">Sparkles (Featured / New)</option>
                  <option value="zap">Zap (Pro Tuning / Speed)</option>
                  <option value="flag">Racing Flag (Championship)</option>
                </select>
              </div>

              {/* Accent Color */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Color Accent Theme:
                </label>
                <select
                  value={currentSlide.accentColor || 'indigo'}
                  onChange={(e) => handleUpdateCurrentSlide('accentColor', e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5865F2]"
                >
                  <option value="indigo">Discord Blurple (Indigo)</option>
                  <option value="amber">Amber Gold</option>
                  <option value="emerald">Emerald Green</option>
                  <option value="cyan">Cyan Telemetry</option>
                  <option value="red">Racing Red</option>
                  <option value="purple">Esports Purple</option>
                </select>
              </div>
            </div>

            {/* Custom Image Upload / URL Controls (Visible when iconType is custom or url present) */}
            <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Custom Advertisement Image / Sponsor Logo</span>
                </span>
                <span className="text-[10px] text-slate-400">Direct URL or Device Upload</span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={currentSlide.customIconUrl || ''}
                  onChange={(e) => {
                    handleUpdateCurrentSlide('customIconUrl', e.target.value);
                    if (e.target.value) handleUpdateCurrentSlide('iconType', 'custom');
                  }}
                  placeholder="https://example.com/logo.png or upload image below"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
                />

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageFileUpload}
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Image</span>
                </button>
              </div>

              {/* Preview of custom image */}
              {currentSlide.customIconUrl && (
                <div className="flex items-center gap-2 pt-1">
                  <div className="w-9 h-9 rounded-lg bg-slate-950 border border-indigo-500/50 p-1 flex items-center justify-center shrink-0">
                    <img
                      src={currentSlide.customIconUrl}
                      alt="Custom visual"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                  <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Custom image loaded</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      handleUpdateCurrentSlide('customIconUrl', '');
                      handleUpdateCurrentSlide('iconType', 'discord');
                    }}
                    className="text-[11px] text-rose-400 hover:text-rose-300 ml-auto cursor-pointer"
                  >
                    Clear Image
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800 shrink-0">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Default Slots</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-bold shadow-lg shadow-[#5865F2]/30 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saveSuccess ? '✓ Saved Globally to Database!' : 'Save & Publish Globally'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
