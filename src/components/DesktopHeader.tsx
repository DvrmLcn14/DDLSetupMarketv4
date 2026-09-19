import React, { useState, useRef, useEffect } from 'react';
import { Plus, LogOut, Bookmark, ShieldCheck, Radio, ChevronDown, Globe } from 'lucide-react';
import { SupportedF1GameId, SimGame, UserAccount } from '../types';
import { useLanguage, Language } from '../i18n/LanguageContext';

interface DesktopHeaderProps {
  activeGame: SimGame;
  onSelectGame: (gameId: SupportedF1GameId) => void;
  currentUser: UserAccount | null;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onLogout: () => void;
  onOpenSubmitModal: () => void;
  favoritesCount?: number;
  isFavoritesActive?: boolean;
  onSelectFavorites?: () => void;
  onOpenAdminPanel?: () => void;
  pendingAdminCount?: number;
}

const LANGUAGES: { code: Language; flagImg: string; label: string }[] = [
  { code: 'en', flagImg: '/flags/en.png', label: 'English' },
  { code: 'tr', flagImg: '/flags/tr.png', label: 'Türkçe' },
  { code: 'it', flagImg: '/flags/it.png', label: 'Italiano' },
  { code: 'de', flagImg: '/flags/de.png', label: 'Deutsch' },
  { code: 'es', flagImg: '/flags/es.png', label: 'Español' },
];

export const DesktopHeader: React.FC<DesktopHeaderProps> = ({
  activeGame,
  onSelectGame,
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenSubmitModal,
  favoritesCount = 0,
  isFavoritesActive = false,
  onSelectFavorites,
  onOpenAdminPanel,
  pendingAdminCount = 0,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState<boolean>(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  const currentLangObj = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
        setIsLangDropdownOpen(false);
      }
    };
    if (isLangDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isLangDropdownOpen]);

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-30 select-none shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center font-black text-white text-xs tracking-tighter shadow-sm shadow-red-600/40 border border-red-500/30">
              DDL
            </div>
            <div>
              <h1 className="font-extrabold text-sm sm:text-base tracking-tight text-white leading-tight flex items-center gap-1.5">
                <span>DDLSetupMarket</span>
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">
                {t.brandSubtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Clean Game & Favorites Selection Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 shadow-inner">
            {/* F1 24 Tab */}
            <button
              type="button"
              id="game-tab-f1-24"
              onClick={() => onSelectGame('f1_24')}
              className={`px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                !isFavoritesActive && activeGame.id === 'f1_24'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <img
                src="/cars/redbull.jpg"
                alt="Red Bull F1 24"
                className="w-7 h-4 object-cover rounded shadow-sm border border-slate-700/60 shrink-0 brightness-105"
                referrerPolicy="no-referrer"
              />
              <span>F1® 24 {t.setupsTab}</span>
            </button>

            {/* F1 25 Tab */}
            <button
              type="button"
              id="game-tab-f1-25"
              onClick={() => onSelectGame('f1_25')}
              className={`px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                !isFavoritesActive && activeGame.id === 'f1_25'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <img
                src="/cars/mercedes.jpg"
                alt="Mercedes F1 25"
                className="w-7 h-4 object-cover rounded shadow-sm border border-slate-700/60 shrink-0 brightness-105"
                referrerPolicy="no-referrer"
              />
              <span>F1® 25 {t.setupsTab}</span>
            </button>

            {/* F1 26 Tab */}
            <button
              type="button"
              id="game-tab-f1-26"
              onClick={() => onSelectGame('f1_26')}
              className={`px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                !isFavoritesActive && activeGame.id === 'f1_26'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <img
                src="/cars/ferrari.jpg"
                alt="Ferrari F1 26"
                className="w-7 h-4 object-cover rounded shadow-sm border border-slate-700/60 shrink-0 brightness-105"
                referrerPolicy="no-referrer"
              />
              <span>F1® 26 {t.setupsTab}</span>
            </button>

            {/* Favorites Tab */}
            {onSelectFavorites && (
              <button
                type="button"
                id="header-tab-favorites"
                onClick={onSelectFavorites}
                className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ml-0.5 ${
                  isFavoritesActive
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-amber-300 hover:bg-slate-800/60'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isFavoritesActive ? 'fill-slate-950 text-slate-950' : 'text-amber-400'}`} />
                <span>{t.favoritesTab}</span>
                {favoritesCount > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                      isFavoritesActive
                        ? 'bg-slate-950 text-amber-300'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {favoritesCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Right Actions: Multi-language Switcher Toggle, Submit F1 Setup, Admin Review & Account */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Collapsible Language Dropdown Menu */}
          <div className="relative" ref={langDropdownRef}>
            <button
              type="button"
              id="header-language-dropdown-btn"
              onClick={() => setIsLangDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-xs font-bold text-slate-200 transition-all cursor-pointer shadow-xs"
              title={language === 'tr' ? 'Dili Değiştir' : 'Change Language'}
              aria-expanded={isLangDropdownOpen}
            >
              <img
                src={currentLangObj.flagImg}
                alt={currentLangObj.label}
                className="w-4 h-2.5 object-cover rounded-xs shadow-xs border border-slate-700/60 flex-shrink-0"
                referrerPolicy="no-referrer"
              />
              <span className="text-[11px] font-bold">{currentLangObj.label}</span>
              <ChevronDown
                className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
                  isLangDropdownOpen ? 'rotate-180 text-red-400' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu Panel */}
            {isLangDropdownOpen && (
              <div
                id="header-language-menu"
                className="absolute right-0 mt-1.5 w-36 bg-slate-900 border border-slate-800 rounded-xl shadow-xl p-1.5 z-50 space-y-0.5 animate-in fade-in zoom-in-95"
              >
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 py-1 flex items-center gap-1.5">
                  <Globe className="w-3 h-3 text-slate-400" />
                  <span>{language === 'tr' ? 'Dil Seçimi' : 'Language'}</span>
                </div>
                {LANGUAGES.map((lang) => {
                  const isActive = language === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      id={`lang-select-${lang.code}`}
                      onClick={() => {
                        setLanguage(lang.code);
                        setIsLangDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-red-600/20 text-red-300 border border-red-500/30 font-black'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={lang.flagImg}
                          alt={lang.label}
                          className="w-4 h-2.5 object-cover rounded-xs shadow-xs border border-slate-700/60 flex-shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <span>{lang.label}</span>
                      </div>
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-red-400" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Admin Verification Review Button */}
          {onOpenAdminPanel && (
            <button
              type="button"
              id="header-admin-panel-btn"
              onClick={onOpenAdminPanel}
              className="px-3 py-1.5 rounded-xl bg-sky-950 hover:bg-sky-900 border border-sky-500/40 text-sky-300 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-sky-950/40 transition-all cursor-pointer relative"
              title="Admin Screenshot & Lap Time Verification Panel"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">{t.adminReview}</span>
              {pendingAdminCount > 0 ? (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 shadow-sm animate-pulse">
                  {pendingAdminCount}
                </span>
              ) : (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300">
                  {t.panelBadge}
                </span>
              )}
            </button>
          )}

          {/* F1 Setup Engineer AI Assistant Trigger */}
          <button
            type="button"
            id="header-setup-engineer-btn"
            onClick={() => {
              const trigger = document.getElementById('f1-engineer-chat-trigger');
              if (trigger) trigger.click();
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 hover:border-red-500/60 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            title={language === 'tr' ? 'F1 Yarış Mühendisi / Telemetri Setup Asistanı' : 'F1 Race Engineer & Telemetry Assistant'}
          >
            <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
            <span className="hidden md:inline">
              {language === 'tr' ? 'Setup Mühendisi' : 'Setup Engineer'}
            </span>
            <span className="md:hidden">
              {language === 'tr' ? 'Mühendis' : 'Engineer'}
            </span>
          </button>

          {/* Submit F1 Setup Button */}
          <button
            type="button"
            id="header-submit-setup-btn"
            onClick={onOpenSubmitModal}
            className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-red-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.submitSetup}</span>
          </button>

          {/* User Account / Sign In */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <div className="w-5 h-5 rounded-full bg-red-600/30 border border-red-500/40 flex items-center justify-center text-[10px] font-bold text-red-300">
                  {currentUser.username.charAt(0).toUpperCase()}
                </div>
                <span className="font-semibold text-slate-200 max-w-[110px] truncate">
                  {currentUser.username}
                </span>
                <span className="text-[9px] px-1 rounded bg-slate-800 text-slate-400 font-mono">
                  {currentUser.badge}
                </span>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                title={t.signOut}
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                id="header-login-btn"
                onClick={() => onOpenAuth('login')}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
              >
                {t.signIn}
              </button>
              <button
                type="button"
                onClick={() => onOpenAuth('register')}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-950 bg-white hover:bg-slate-200 transition-colors cursor-pointer"
              >
                {t.register}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
