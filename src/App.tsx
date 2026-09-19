import React, { useState, useEffect } from 'react';
import { SimGame, CarSetup, UserAccount, SupportedF1GameId, VerificationStatus, FloatingBannerConfig } from './types';
import { SIM_GAMES, INITIAL_SETUPS } from './data/mockData';
import { DEFAULT_FLOATING_BANNER_CONFIG, DEFAULT_FLOATING_BANNER_ITEMS } from './data/bannerConfig';
import { SetupMarketplace } from './components/SetupMarketplace';
import { AuthBarrier } from './components/AuthBarrier';
import { AuthModal } from './components/AuthModal';
import { DesktopHeader } from './components/DesktopHeader';
import { AdminVerificationPanel } from './components/AdminVerificationPanel';
import { AdminPage } from './components/AdminPage';
import { FloatingBanner } from './components/FloatingBanner';
import { BannerConfigModal } from './components/BannerConfigModal';
import { F1SetupEngineerChat } from './components/F1SetupEngineerChat';
import {
  isSupabaseConfigured,
  fetchSetupsFromSupabase,
  saveSetupToSupabase,
  deleteSetupFromSupabase,
  subscribeToSupabaseSetups,
} from './lib/supabase';

export default function App() {
  // Active game selected in the marketplace (defaults to F1 25)
  const [activeGame, setActiveGame] = useState<SimGame>(SIM_GAMES[0]);
  const [activeTrackId, setActiveTrackId] = useState<string>('spa');
  const [activeViewMode, setActiveViewMode] = useState<'all' | 'favorites' | 'my-setups'>('all');

  // Favorites / Bookmarks state persisted in localStorage
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('sim_marketplace_favorites');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read saved favorites', e);
    }
    return [];
  });

  const handleToggleFavorite = (setupId: string) => {
    setFavoriteIds((prev) => {
      const isFav = prev.includes(setupId);
      const updated = isFav ? prev.filter((id) => id !== setupId) : [...prev, setupId];
      try {
        localStorage.setItem('sim_marketplace_favorites', JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not persist favorites', e);
      }
      return updated;
    });
  };

  // Switch game tab instantly between F1 25 and F1 26
  const handleSelectGameById = (gameId: SupportedF1GameId) => {
    const matched = SIM_GAMES.find((g) => g.id === gameId);
    if (matched) {
      setActiveGame(matched);
    }
    setActiveViewMode('all');
  };

  // Switch to Favorites tab from header
  const handleSelectFavorites = () => {
    setActiveViewMode('favorites');
  };

  // Authentication state (Mandatory barrier when null)
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const stored = localStorage.getItem('sim_marketplace_current_user');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not restore user session', e);
    }
    return null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [isSubmitModalTriggered, setIsSubmitModalTriggered] = useState<boolean>(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState<boolean>(false);
  const [isBannerConfigOpen, setIsBannerConfigOpen] = useState<boolean>(false);

  // SPA Route State ('marketplace' | 'admin')
  const [currentRoute, setCurrentRoute] = useState<'marketplace' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      if (window.location.pathname === '/admin' || window.location.hash === '#/admin') {
        return 'admin';
      }
    }
    return 'marketplace';
  });

  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname === '/admin' || window.location.hash === '#/admin') {
        setCurrentRoute('admin');
      } else {
        setCurrentRoute('marketplace');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToAdmin = () => {
    setCurrentRoute('admin');
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/admin');
    }
  };

  const navigateToHome = () => {
    setCurrentRoute('marketplace');
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/');
    }
  };

  // Floating Banner / Ad Box state with global server sync and local cache fallback
  const [bannerConfig, setBannerConfig] = useState<FloatingBannerConfig>(() => {
    try {
      const stored = localStorage.getItem('ddl_floating_banner_config');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read local banner cache', e);
    }
    return DEFAULT_FLOATING_BANNER_CONFIG;
  });

  // Global Synchronizer: fetch latest global banner advertisement configuration from server
  useEffect(() => {
    let isMounted = true;

    const fetchGlobalBannerConfig = async () => {
      try {
        const res = await fetch('/api/banner-config');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.config && isMounted) {
            setBannerConfig(data.config);
            try {
              localStorage.setItem('ddl_floating_banner_config', JSON.stringify(data.config));
            } catch (err) {
              // ignore cache write error
            }
          }
        }
      } catch (err) {
        console.warn('Using cached banner configuration (server offline or starting)', err);
      }
    };

    fetchGlobalBannerConfig();

    // Poll every 8 seconds so all active visitors see any changes made by administrators in real-time
    const pollInterval = setInterval(fetchGlobalBannerConfig, 8000);
    window.addEventListener('focus', fetchGlobalBannerConfig);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      window.removeEventListener('focus', fetchGlobalBannerConfig);
    };
  }, []);

  const handleSaveBannerConfig = async (updated: FloatingBannerConfig) => {
    // 1. Optimistic local update
    setBannerConfig(updated);
    try {
      localStorage.setItem('ddl_floating_banner_config', JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not persist banner config to local cache', e);
    }

    // 2. Persist globally to server database so all visitors see the new advertisement slots and images
    try {
      const res = await fetch('/api/banner-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updated),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.config) {
          setBannerConfig(data.config);
          console.log('✅ Global advertisement banner saved successfully to server database');
        }
      } else {
        console.error('Server returned error while saving global banner config:', res.statusText);
      }
    } catch (err) {
      console.error('Failed to save banner config globally to server:', err);
    }
  };

  // Setups state (seeded with initial community setups, merged with user-submitted ones and user ratings)
  const [setups, setSetups] = useState<CarSetup[]>(() => {
    let baseList = INITIAL_SETUPS;
    try {
      const stored = localStorage.getItem('sim_marketplace_custom_setups');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          baseList = [...parsed, ...INITIAL_SETUPS];
        }
      }
    } catch (e) {
      console.warn('Could not read saved setups', e);
    }

    try {
      const storedRatings = localStorage.getItem('sim_marketplace_user_ratings');
      if (storedRatings) {
        const parsedRatings = JSON.parse(storedRatings);
        baseList = baseList.map((s) => {
          if (parsedRatings[s.id]) {
            return {
              ...s,
              averageRating: parsedRatings[s.id].avg,
              ratingCount: parsedRatings[s.id].count,
              userRating: parsedRatings[s.id].rating,
            };
          }
          return s;
        });
      }
    } catch (e) {
      console.warn('Could not read saved ratings', e);
    }

    return baseList;
  });

  // Helper: Persist single user-submitted setup globally to cloud database (Supabase + Server API)
  const saveSingleSetupToServer = async (setup: CarSetup) => {
    try {
      if (isSupabaseConfigured()) {
        await saveSetupToSupabase(setup);
      }
      await fetch('/api/setups/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(setup),
      });
    } catch (err) {
      console.warn('Failed to save setup globally to server/Supabase:', err);
    }
  };

  // Helper: Delete setup globally from cloud database (Supabase + Server API)
  const deleteSetupFromServer = async (setupId: string) => {
    try {
      if (isSupabaseConfigured()) {
        await deleteSetupFromSupabase(setupId);
      }
      await fetch(`/api/setups/${setupId}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.warn('Failed to delete setup globally on server/Supabase:', err);
    }
  };

  // Helper: Persist user-submitted setups globally to cloud database
  const syncGlobalSetupsToServer = async (allCurrentSetups: CarSetup[]) => {
    try {
      const userSubmittedOnly = allCurrentSetups.filter((s) => s.isUserSubmitted);
      if (isSupabaseConfigured()) {
        for (const setup of userSubmittedOnly) {
          await saveSetupToSupabase(setup);
        }
      }
      await fetch('/api/setups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userSubmittedOnly),
      });
    } catch (err) {
      console.warn('Failed to sync setups globally to server/Supabase:', err);
    }
  };

  // Global Synchronizer: fetch & listen for latest global community setups in real-time
  useEffect(() => {
    let isMounted = true;

    const fetchGlobalSetups = async () => {
      // 1. Try fetching directly from Supabase Cloud Database if configured
      if (isSupabaseConfigured()) {
        const supabaseData = await fetchSetupsFromSupabase();
        if (supabaseData && isMounted) {
          setSetups((prev) => {
            const customMap = new Map<string, CarSetup>();
            supabaseData.forEach((s) => customMap.set(s.id, { ...s, isUserSubmitted: true }));
            prev.filter((s) => s.isUserSubmitted).forEach((s) => {
              if (!customMap.has(s.id)) {
                customMap.set(s.id, { ...s, isUserSubmitted: true });
              }
            });
            const mergedCustomList = Array.from(customMap.values());
            try {
              localStorage.setItem('sim_marketplace_custom_setups', JSON.stringify(mergedCustomList));
            } catch (e) {}
            return [...mergedCustomList, ...INITIAL_SETUPS];
          });
        }
      }

      // 2. Fetch from Express API Backend
      try {
        const res = await fetch('/api/setups');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.setups) && isMounted) {
            const serverSetups: CarSetup[] = data.setups;

            setSetups((prev) => {
              const customMap = new Map<string, CarSetup>();

              // Add all server-persisted community setups from all users
              serverSetups.forEach((s) => customMap.set(s.id, { ...s, isUserSubmitted: true }));

              // Add local custom setups that might be pending
              prev.filter((s) => s.isUserSubmitted).forEach((s) => {
                if (!customMap.has(s.id)) {
                  customMap.set(s.id, { ...s, isUserSubmitted: true });
                }
              });

              const mergedCustomList = Array.from(customMap.values());

              try {
                localStorage.setItem('sim_marketplace_custom_setups', JSON.stringify(mergedCustomList));
              } catch (e) {}

              return [...mergedCustomList, ...INITIAL_SETUPS];
            });
          }
        }
      } catch (err) {
        console.warn('Using local setups cache (server offline or starting)', err);
      }
    };

    // Initial fetch on mount
    fetchGlobalSetups();

    // Active Supabase Realtime Subscription if configured
    let unsubscribeSupabase = () => {};
    if (isSupabaseConfigured()) {
      unsubscribeSupabase = subscribeToSupabaseSetups(() => {
        fetchGlobalSetups();
      });
    }

    // Real-time Server-Sent Events (SSE) listener for instantaneous 0-delay updates
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/events');
      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'SETUPS_UPDATED' && Array.isArray(payload.payload) && isMounted) {
            const serverSetups: CarSetup[] = payload.payload;
            setSetups((prev) => {
              const customMap = new Map<string, CarSetup>();
              serverSetups.forEach((s) => customMap.set(s.id, { ...s, isUserSubmitted: true }));
              prev.filter((s) => s.isUserSubmitted).forEach((s) => {
                if (!customMap.has(s.id)) {
                  customMap.set(s.id, { ...s, isUserSubmitted: true });
                }
              });
              const mergedCustomList = Array.from(customMap.values());
              try {
                localStorage.setItem('sim_marketplace_custom_setups', JSON.stringify(mergedCustomList));
              } catch (e) {}
              return [...mergedCustomList, ...INITIAL_SETUPS];
            });
          } else if (payload.type === 'BANNER_UPDATED' && payload.payload && isMounted) {
            setBannerConfig(payload.payload);
          }
        } catch (e) {}
      };
    } catch (err) {
      console.warn('SSE EventSource connection fallback to polling:', err);
    }

    // Fast fallback interval polling (5 seconds)
    const setupPollInterval = setInterval(fetchGlobalSetups, 5000);
    window.addEventListener('focus', fetchGlobalSetups);

    return () => {
      isMounted = false;
      unsubscribeSupabase();
      if (eventSource) eventSource.close();
      clearInterval(setupPollInterval);
      window.removeEventListener('focus', fetchGlobalSetups);
    };
  }, []);

  // Calculate pending verification submissions for admin badge
  const pendingAdminCount = setups.filter(
    (s) => s.verificationStatus === 'pending' || (!s.verificationStatus && s.isUserSubmitted && !s.isProofVerified)
  ).length;

  // Admin status update handler for verification workflow
  const handleUpdateSetupStatus = (
    setupId: string,
    status: VerificationStatus,
    notes?: string
  ) => {
    setSetups((prev) => {
      const updated = prev.map((s) => {
        if (s.id === setupId) {
          return {
            ...s,
            verificationStatus: status,
            isProofVerified: status === 'verified',
            verificationNotes: notes || s.verificationNotes,
          };
        }
        return s;
      });
      try {
        const userOnly = updated.filter((s) => s.isUserSubmitted);
        localStorage.setItem('sim_marketplace_custom_setups', JSON.stringify(userOnly));
        syncGlobalSetupsToServer(updated);
      } catch (e) {
        console.warn('Could not persist setup verification status', e);
      }
      return updated;
    });
  };

  // Handle User Login
  const handleLogin = (user: UserAccount) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    try {
      localStorage.setItem('sim_marketplace_current_user', JSON.stringify(user));
    } catch (e) {
      console.warn('Could not persist user session', e);
    }
  };

  // Handle User Logout
  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('sim_marketplace_current_user');
    } catch (e) {
      console.warn('Could not clear user session', e);
    }
  };

  // Handle Game change
  const handleGameChange = (game: SimGame) => {
    setActiveGame(game);
  };

  // Handle Track change
  const handleTrackChange = (trackId: string) => {
    setActiveTrackId(trackId);
  };

  // Handle adding a manual setup
  const handleAddSetup = (newSetup: CarSetup) => {
    saveSingleSetupToServer(newSetup);

    setSetups((prev) => {
      const updated = [newSetup, ...prev];
      try {
        const userOnly = updated.filter((s) => s.isUserSubmitted);
        localStorage.setItem('sim_marketplace_custom_setups', JSON.stringify(userOnly));
        syncGlobalSetupsToServer(updated);
      } catch (e) {
        console.warn('Could not persist custom setups', e);
      }
      return updated;
    });

    // Record setup ID in creator list
    try {
      const raw = localStorage.getItem('sim_marketplace_my_setup_ids');
      const ids: string[] = raw ? JSON.parse(raw) : [];
      if (!ids.includes(newSetup.id)) {
        ids.push(newSetup.id);
        localStorage.setItem('sim_marketplace_my_setup_ids', JSON.stringify(ids));
      }
    } catch (e) {
      console.warn('Could not record setup creator ID', e);
    }

    // Automatically switch game and track to match submitted setup
    const matchedGame = SIM_GAMES.find((g) => g.id === newSetup.gameId);
    if (matchedGame) {
      setActiveGame(matchedGame);
    }
    setActiveTrackId(newSetup.trackId);
  };

  // Handle updating / editing an existing setup
  const handleUpdateSetup = (updatedSetup: CarSetup) => {
    setSetups((prev) => {
      const updated = prev.map((s) => (s.id === updatedSetup.id ? updatedSetup : s));
      try {
        const userOnly = updated.filter((s) => s.isUserSubmitted);
        localStorage.setItem('sim_marketplace_custom_setups', JSON.stringify(userOnly));
        syncGlobalSetupsToServer(updated);
      } catch (e) {
        console.warn('Could not persist custom setups after update', e);
      }
      return updated;
    });
  };

  // Handle deleting a setup created by the user
  const handleDeleteSetup = (setupId: string) => {
    deleteSetupFromServer(setupId);

    setSetups((prev) => {
      const updated = prev.filter((s) => s.id !== setupId);
      try {
        const userOnly = updated.filter((s) => s.isUserSubmitted);
        localStorage.setItem('sim_marketplace_custom_setups', JSON.stringify(userOnly));
      } catch (e) {
        console.warn('Could not persist custom setups after deletion', e);
      }
      return updated;
    });

    try {
      const raw = localStorage.getItem('sim_marketplace_my_setup_ids');
      if (raw) {
        const ids = JSON.parse(raw);
        if (Array.isArray(ids)) {
          const filtered = ids.filter((id: string) => id !== setupId);
          localStorage.setItem('sim_marketplace_my_setup_ids', JSON.stringify(filtered));
        }
      }
    } catch (e) {
      console.warn('Could not update saved setup IDs', e);
    }
  };

  // Handle downloading / exporting setup
  const handleDownloadSetup = (setup: CarSetup) => {
    setSetups((prev) =>
      prev.map((s) => (s.id === setup.id ? { ...s, downloads: s.downloads + 1 } : s))
    );
  };

  // Handle rating a setup dynamically
  const handleRateSetup = (setupId: string, rating: number) => {
    setSetups((prev) => {
      const updated = prev.map((s) => {
        if (s.id === setupId) {
          const hadPreviousRating = Boolean(s.userRating);
          let newCount: number;
          let newAvg: number;

          if (hadPreviousRating && s.userRating) {
            // User is changing their existing rating
            const totalSum = s.averageRating * s.ratingCount - s.userRating + rating;
            newCount = s.ratingCount;
            newAvg = Number((totalSum / Math.max(1, newCount)).toFixed(1));
          } else {
            // New review submitted by user
            newCount = (s.ratingCount || 0) + 1;
            const currentSum = (s.averageRating || 0) * (s.ratingCount || 0);
            newAvg = Number(((currentSum + rating) / newCount).toFixed(1));
          }

          return {
            ...s,
            averageRating: newAvg,
            ratingCount: newCount,
            userRating: rating,
          };
        }
        return s;
      });

      try {
        const userRated: Record<string, { rating: number; count: number; avg: number }> = {};
        updated.forEach((s) => {
          if (s.userRating) {
            userRated[s.id] = { rating: s.userRating, count: s.ratingCount, avg: s.averageRating };
          }
        });
        localStorage.setItem('sim_marketplace_user_ratings', JSON.stringify(userRated));

        const userOnly = updated.filter((s) => s.isUserSubmitted);
        if (userOnly.length > 0) {
          localStorage.setItem('sim_marketplace_custom_setups', JSON.stringify(userOnly));
        }
      } catch (e) {
        console.warn('Could not persist ratings', e);
      }

      return updated;
    });
  };

  if (currentRoute === 'admin') {
    return (
      <AdminPage
        currentUser={currentUser}
        onLoginSuccess={handleLogin}
        onNavigateHome={navigateToHome}
        setups={setups}
        onUpdateSetupStatus={handleUpdateSetupStatus}
        onUpdateSetup={handleUpdateSetup}
        onDeleteSetup={handleDeleteSetup}
        bannerConfig={bannerConfig}
        onSaveBannerConfig={handleSaveBannerConfig}
      />
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Clean Top Navigation Bar with F1 25 / F1 26 / Favorites Tab Switcher */}
      <DesktopHeader
        activeGame={activeGame}
        onSelectGame={handleSelectGameById}
        currentUser={currentUser}
        onOpenAuth={(mode = 'login') => {
          setAuthModalMode(mode);
          setIsAuthModalOpen(true);
        }}
        onLogout={handleLogout}
        onOpenSubmitModal={() => {
          setIsSubmitModalTriggered(true);
        }}
        favoritesCount={favoriteIds.length}
        isFavoritesActive={activeViewMode === 'favorites'}
        onSelectFavorites={handleSelectFavorites}
        onOpenAdminPanel={navigateToAdmin}
        pendingAdminCount={pendingAdminCount}
      />

      {/* Main Marketplace Area - Freely accessible without login barrier */}
      <main className="flex-1 flex flex-col bg-slate-950 relative overflow-x-hidden">
        <SetupMarketplace
          setups={setups}
          activeGame={activeGame}
          onGameChange={handleGameChange}
          activeTrackId={activeTrackId}
          onTrackChange={handleTrackChange}
          currentUser={currentUser}
          onOpenAuth={(mode = 'login') => {
            setAuthModalMode(mode);
            setIsAuthModalOpen(true);
          }}
          onLogout={handleLogout}
          onDownloadSetup={handleDownloadSetup}
          onRateSetup={handleRateSetup}
          onAddSetup={handleAddSetup}
          onUpdateSetup={handleUpdateSetup}
          onDeleteSetup={handleDeleteSetup}
          isExternalSubmitOpen={isSubmitModalTriggered}
          onCloseExternalSubmit={() => setIsSubmitModalTriggered(false)}
          favoriteIds={favoriteIds}
          onToggleFavorite={handleToggleFavorite}
          activeViewMode={activeViewMode}
          onViewModeChange={setActiveViewMode}
        />
      </main>

      {/* Optional Auth Modal for account sign in / registration */}
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          initialMode={authModalMode}
          onClose={() => setIsAuthModalOpen(false)}
          onLoginSuccess={handleLogin}
        />
      )}

      {/* Admin Screenshot & Lap Time Verification Panel & Banner Manager */}
      <AdminVerificationPanel
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        setups={setups}
        onUpdateStatus={handleUpdateSetupStatus}
        onUpdateSetup={handleUpdateSetup}
        onDeleteSetup={handleDeleteSetup}
        onOpenBannerConfig={() => setIsBannerConfigOpen(true)}
        bannerConfig={bannerConfig}
        onSaveBannerConfig={handleSaveBannerConfig}
      />

      {/* Floating Bottom-Right Ad / Discord Community Box (Live Admin Editable) */}
      <FloatingBanner
        config={bannerConfig}
        isAdmin={Boolean(
          currentUser?.badge?.includes('Admin') ||
          currentUser?.username?.toLowerCase().includes('admin') ||
          currentUser?.username === 'DDLSetup' ||
          currentUser?.role === 'admin'
        )}
        onOpenSettings={() => setIsBannerConfigOpen(true)}
        onSaveConfig={handleSaveBannerConfig}
      />

      {/* Specialized F1 Setup Engineer AI Chatbot Assistant (Bottom-Left Floating Widget) */}
      <F1SetupEngineerChat
        activeGameId={activeGame.id}
        activeTrackId={activeTrackId}
        onFilterMarketplace={(trackId, gameId) => {
          if (trackId) handleTrackChange(trackId);
          if (gameId) handleSelectGameById(gameId as SupportedF1GameId);
        }}
      />

      {/* Admin Banner Configuration Modal */}
      {isBannerConfigOpen && (
        <BannerConfigModal
          isOpen={isBannerConfigOpen}
          config={bannerConfig}
          onClose={() => setIsBannerConfigOpen(false)}
          onSaveConfig={handleSaveBannerConfig}
        />
      )}
    </div>
  );
}
