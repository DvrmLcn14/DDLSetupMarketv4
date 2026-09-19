import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  UserPlus,
  Trash2,
  Lock,
  Edit3,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Shield,
  KeyRound,
  ArrowLeft,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  Sliders,
  Check,
  X,
  Plus,
  Eye,
  Megaphone,
  Radio,
  ChevronRight,
} from 'lucide-react';
import { UserAccount, CarSetup, VerificationStatus, FloatingBannerConfig } from '../types';
import { SubmitSetupModal } from './SubmitSetupModal';

interface AdminPageProps {
  currentUser: UserAccount | null;
  onLoginSuccess: (user: UserAccount) => void;
  onNavigateHome: () => void;
  setups: CarSetup[];
  onUpdateSetupStatus: (setupId: string, status: VerificationStatus, notes?: string) => void;
  onUpdateSetup?: (updatedSetup: CarSetup) => void;
  onDeleteSetup?: (setupId: string) => void;
  bannerConfig?: FloatingBannerConfig;
  onSaveBannerConfig?: (config: FloatingBannerConfig) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  currentUser,
  onLoginSuccess,
  onNavigateHome,
  setups,
  onUpdateSetupStatus,
  onUpdateSetup,
  onDeleteSetup,
  bannerConfig,
  onSaveBannerConfig,
}) => {
  // Check if current user is an admin
  const isAdmin = Boolean(
    currentUser?.isAdmin ||
    currentUser?.role === 'admin' ||
    currentUser?.username?.toLowerCase() === 'admin'
  );

  // Admin Login State for unauthorized users
  const [adminUsername, setAdminUsername] = useState<string>('admin');
  const [adminPassword, setAdminPassword] = useState<string>('admin123');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Admin Dashboard Tabs
  const [activeTab, setActiveTab] = useState<'users' | 'setups' | 'banner'>('users');

  // Users Management State
  const [usersList, setUsersList] = useState<UserAccount[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(false);
  const [userSearchQuery, setUserSearchQuery] = useState<string>('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [userActionSuccess, setUserActionSuccess] = useState<string | null>(null);

  // Create User Modal State
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState<boolean>(false);
  const [newUsername, setNewUsername] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [newBadge, setNewBadge] = useState<string>('Community');
  const [newIsAdmin, setNewIsAdmin] = useState<boolean>(false);
  const [newBio, setNewBio] = useState<string>('');
  const [createUserError, setCreateUserError] = useState<string | null>(null);

  // Password Reset Modal State
  const [resetUserTarget, setResetUserTarget] = useState<UserAccount | null>(null);
  const [resetPasswordValue, setResetPasswordValue] = useState<string>('');

  // Setup Verification Tab State
  const [setupFilterStatus, setSetupFilterStatus] = useState<'pending' | 'verified' | 'rejected' | 'all'>('pending');
  const [setupSearchQuery, setSetupSearchQuery] = useState<string>('');
  const [rejectionModalSetup, setRejectionModalSetup] = useState<CarSetup | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [previewScreenshot, setPreviewScreenshot] = useState<string | null>(null);

  // Fetch registered users from backend API
  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.users)) {
          setUsersList(data.users);
        }
      }
    } catch (err) {
      console.warn('Could not fetch users from server API, reading local storage:', err);
      try {
        const stored = localStorage.getItem('sim_marketplace_users');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) setUsersList(parsed);
        }
      } catch (e) {
        // ignore
      }
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  // Handle direct admin login from unauthorized screen
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: adminUsername, password: adminPassword }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          if (data.user.isAdmin || data.user.role === 'admin' || data.user.username.toLowerCase() === 'admin') {
            onLoginSuccess(data.user);
            setIsLoggingIn(false);
            return;
          } else {
            setLoginError('Girdiğiniz hesap yönetici (admin) yetkisine sahip değil.');
            setIsLoggingIn(false);
            return;
          }
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        setLoginError(errData.error || 'Hatalı kullanıcı adı veya şifre.');
        setIsLoggingIn(false);
        return;
      }
    } catch (err) {
      // Local check fallback
      if (adminUsername.toLowerCase() === 'admin' && adminPassword === 'admin123') {
        const localAdmin: UserAccount = {
          username: 'admin',
          password: 'admin123',
          badge: 'Admin / Founder',
          role: 'admin',
          isAdmin: true,
          bio: 'Sistem Yöneticisi',
          createdAt: '2026-01-01',
        };
        onLoginSuccess(localAdmin);
        setIsLoggingIn(false);
        return;
      }
      setLoginError('Giriş yapılırken bağlantı hatası oluştu.');
      setIsLoggingIn(false);
    }
  };

  // Toggle User Admin Status
  const handleToggleAdminStatus = async (user: UserAccount) => {
    const updatedIsAdmin = !user.isAdmin;
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(user.username)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isAdmin: updatedIsAdmin,
          role: updatedIsAdmin ? 'admin' : 'user',
        }),
      });

      if (res.ok) {
        setUserActionSuccess(`@${user.username} kullanıcısının admin yetkisi ${updatedIsAdmin ? 'verildi' : 'kaldırıldı'}.`);
        fetchUsers();
        setTimeout(() => setUserActionSuccess(null), 3000);
      } else {
        alert('Kullanıcı güncellenemedi.');
      }
    } catch (err) {
      console.error('Error toggling admin status:', err);
      // Local fallback update
      setUsersList((prev) =>
        prev.map((u) => (u.username === user.username ? { ...u, isAdmin: updatedIsAdmin, role: updatedIsAdmin ? 'admin' : 'user' } : u))
      );
    }
  };

  // Change User Badge
  const handleChangeUserBadge = async (username: string, newBadgeVal: string) => {
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(username)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ badge: newBadgeVal }),
      });

      if (res.ok) {
        setUserActionSuccess(`@${username} rozeti "${newBadgeVal}" olarak güncellendi.`);
        fetchUsers();
        setTimeout(() => setUserActionSuccess(null), 3000);
      }
    } catch (err) {
      console.error('Error updating badge:', err);
    }
  };

  // Create New User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateUserError(null);

    if (!newUsername.trim()) {
      setCreateUserError('Lütfen bir kullanıcı adı girin.');
      return;
    }
    if (!newPassword || newPassword.length < 4) {
      setCreateUserError('Şifre en az 4 karakter olmalıdır.');
      return;
    }

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newUsername.trim(),
          password: newPassword,
          badge: newBadge,
          isAdmin: newIsAdmin,
          role: newIsAdmin ? 'admin' : 'user',
          bio: newBio,
        }),
      });

      if (res.ok) {
        setIsCreateUserModalOpen(false);
        setNewUsername('');
        setNewPassword('');
        setNewBio('');
        setNewIsAdmin(false);
        setUserActionSuccess(`✅ @${newUsername.trim()} başarıyla eklendi.`);
        fetchUsers();
        setTimeout(() => setUserActionSuccess(null), 3000);
      } else {
        const errData = await res.json().catch(() => ({}));
        setCreateUserError(errData.error || 'Kullanıcı eklenemedi.');
      }
    } catch (err) {
      setCreateUserError('Kullanıcı eklenirken sunucu hatası oluştu.');
    }
  };

  // Reset User Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetUserTarget || !resetPasswordValue) return;

    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(resetUserTarget.username)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: resetPasswordValue }),
      });

      if (res.ok) {
        setUserActionSuccess(`🔒 @${resetUserTarget.username} şifresi başarıyla güncellendi.`);
        setResetUserTarget(null);
        setResetPasswordValue('');
        fetchUsers();
        setTimeout(() => setUserActionSuccess(null), 3000);
      }
    } catch (err) {
      alert('Şifre güncellenemedi.');
    }
  };

  // Delete User Account
  const handleDeleteUser = async (username: string) => {
    if (username.toLowerCase() === 'admin') {
      alert('Ana admin hesabı silinemez!');
      return;
    }

    if (!window.confirm(`@${username} kullanıcısını ve hesabını kalıcı olarak silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(username)}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setUserActionSuccess(`🗑️ @${username} hesabı başarıyla silindi.`);
        fetchUsers();
        setTimeout(() => setUserActionSuccess(null), 3000);
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Kullanıcı silinemedi.');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  // Filtered Users List
  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.username.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      (u.bio && u.bio.toLowerCase().includes(userSearchQuery.toLowerCase())) ||
      (u.badge && u.badge.toLowerCase().includes(userSearchQuery.toLowerCase()));

    const isUserAdmin = Boolean(u.isAdmin || u.role === 'admin' || u.username.toLowerCase() === 'admin');

    if (userRoleFilter === 'admin') return matchesSearch && isUserAdmin;
    if (userRoleFilter === 'user') return matchesSearch && !isUserAdmin;
    return matchesSearch;
  });

  // Filtered Setups List for Verification
  const filteredSetups = setups.filter((s) => {
    const status = s.verificationStatus || (s.isProofVerified ? 'verified' : 'pending');
    if (setupFilterStatus !== 'all' && status !== setupFilterStatus) return false;
    if (!setupSearchQuery) return true;
    const q = setupSearchQuery.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      s.creatorUsername.toLowerCase().includes(q) ||
      s.carName.toLowerCase().includes(q) ||
      s.trackId.toLowerCase().includes(q)
    );
  });

  const pendingSetupsCount = setups.filter(
    (s) => s.verificationStatus === 'pending' || (!s.verificationStatus && s.isUserSubmitted && !s.isProofVerified)
  ).length;

  // Render Access Denied Screen if user is not Admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-amber-500 to-rose-600" />

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/80 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span>403 - Yetkisiz Erişim</span>
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Admin paneline yalnızca <span className="text-rose-400 font-mono font-bold">isAdmin: true</span> yetkili hesaplar erişebilir.
              </p>
            </div>
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-rose-950/90 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Direct Admin Login Form */}
          <form onSubmit={handleAdminLogin} className="space-y-4 pt-2 border-t border-slate-800">
            <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>Yönetici (Admin) Girişi Yapın:</span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                Yönetici Kullanıcı Adı
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="admin"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                Yönetici Şifresi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="admin123"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs transition-all shadow-md shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Doğrulanıyor...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin Olarak Giriş Yap</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center border-t border-slate-800">
            <button
              type="button"
              onClick={onNavigateHome}
              className="text-xs font-bold text-slate-400 hover:text-white flex items-center justify-center gap-1.5 mx-auto transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Ana Sayfaya Dön</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render Full Admin Control Panel
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Admin Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 font-black shadow-inner">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-base text-white flex items-center gap-2">
                <span>DDLSetupMarket Admin Panel</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-600 text-white uppercase tracking-wider">
                  isAdmin: true
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Kayıtlı kullanıcılar, veritabanı hesapları ve sistem yönetimi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onNavigateHome}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Ana Sayfaya Dön</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Success Action Banner */}
        {userActionSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-xs font-bold flex items-center gap-2.5 animate-in fade-in shadow-lg">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{userActionSuccess}</span>
          </div>
        )}

        {/* Metrics Overview Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-md">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span>Kayıtlı Kullanıcılar</span>
              <Users className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl font-black text-white">{usersList.length}</div>
            <div className="text-[10px] text-slate-500">Veritabanı hesapları</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-md">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span>Yöneticiler (Admins)</span>
              <Shield className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400">
              {usersList.filter((u) => u.isAdmin || u.role === 'admin' || u.username.toLowerCase() === 'admin').length}
            </div>
            <div className="text-[10px] text-slate-500">isAdmin: true yetkili</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-md">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span>Toplam Setuplar</span>
              <Sliders className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400">{setups.length}</div>
            <div className="text-[10px] text-slate-500">Pazar yeri setup sayısı</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-md">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span>Onay Bekleyenler</span>
              <Clock className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-black text-rose-400">{pendingSetupsCount}</div>
            <div className="text-[10px] text-slate-500">Ekran görüntüsü doğrulaması</div>
          </div>
        </div>

        {/* Tab Selection Navigation */}
        <div className="flex rounded-2xl bg-slate-900 p-1.5 border border-slate-800 text-xs font-bold flex-wrap gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'users'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Kullanıcılar & Hesaplar ({usersList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('setups')}
            className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'setups'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Setup Onayları ({pendingSetupsCount})</span>
          </button>
        </div>

        {/* TAB 1: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-5 shadow-xl">
            {/* Header & Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Users className="w-5 h-5 text-red-400" />
                <div>
                  <h3 className="font-extrabold text-base text-white">Kullanıcı Veritabanı & Yetkiler</h3>
                  <p className="text-xs text-slate-400">
                    Sistemdeki tüm kayıtlı hesapları görüntüleyin, yönetici yetkilerini (`isAdmin`) düzenleyin.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCreateUserModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-red-600/20 transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Yeni Kullanıcı Ekle</span>
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder="Kullanıcı adı veya rozet ara..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                {(['all', 'admin', 'user'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setUserRoleFilter(r)}
                    className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-all cursor-pointer ${
                      userRoleFilter === r
                        ? 'bg-red-600 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {r === 'all' ? 'Tüm Hesaplar' : r === 'admin' ? 'Yöneticiler' : 'Sürücüler'}
                  </button>
                ))}
              </div>
            </div>

            {/* Users Table / List */}
            {isLoadingUsers ? (
              <div className="p-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-red-500" />
                <span>Kullanıcı veritabanı yükleniyor...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs bg-slate-950/60 rounded-xl border border-slate-800">
                Aramanızla eşleşen kullanıcı bulunamadı.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-extrabold uppercase tracking-wider text-[10px] bg-slate-950/80">
                      <th className="p-3">Kullanıcı</th>
                      <th className="p-3">Yetki / Rol</th>
                      <th className="p-3">Sürücü Rozeti</th>
                      <th className="p-3">Kayıt Tarihi</th>
                      <th className="p-3 text-right">Yönetim İşlemleri</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 font-medium">
                    {filteredUsers.map((u) => {
                      const userIsAdmin = Boolean(u.isAdmin || u.role === 'admin' || u.username.toLowerCase() === 'admin');
                      return (
                        <tr key={u.username} className="hover:bg-slate-950/50 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white uppercase text-xs">
                                {u.username.charAt(0)}
                              </div>
                              <div>
                                <div className="font-bold text-white flex items-center gap-1.5">
                                  <span>@{u.username}</span>
                                  {userIsAdmin && (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                      ADMIN
                                    </span>
                                  )}
                                </div>
                                {u.bio && <div className="text-[10px] text-slate-400 truncate max-w-[180px]">{u.bio}</div>}
                              </div>
                            </div>
                          </td>

                          <td className="p-3">
                            <button
                              type="button"
                              onClick={() => handleToggleAdminStatus(u)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold flex items-center gap-1 border transition-all cursor-pointer ${
                                userIsAdmin
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                              }`}
                              title="Tıklayarak admin yetkisini açıp kapatın"
                            >
                              <ShieldCheck className="w-3 h-3 text-amber-400" />
                              <span>{userIsAdmin ? 'isAdmin: true' : 'isAdmin: false'}</span>
                            </button>
                          </td>

                          <td className="p-3">
                            <select
                              value={u.badge || 'Community'}
                              onChange={(e) => handleChangeUserBadge(u.username, e.target.value)}
                              className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 font-bold focus:outline-none focus:border-red-500"
                            >
                              <option value="Community">Community</option>
                              <option value="Pro">Pro</option>
                              <option value="Esports">Esports</option>
                              <option value="Verified">Verified</option>
                              <option value="Admin / Founder">Admin / Founder</option>
                            </select>
                          </td>

                          <td className="p-3 text-slate-400 font-mono text-[11px]">
                            {u.createdAt || '2026-01-01'}
                          </td>

                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setResetUserTarget(u);
                                  setResetPasswordValue('');
                                }}
                                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-[11px] border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                                title="Şifre Sıfırla"
                              >
                                <Lock className="w-3 h-3 text-amber-400" />
                                <span>Şifre</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteUser(u.username)}
                                disabled={u.username.toLowerCase() === 'admin'}
                                className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-[11px] transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Hesabı Sil"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Sil</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SETUP VERIFICATION */}
        {activeTab === 'setups' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-extrabold text-base text-white">Setup & Tur Zamanı Onay Paneli</h3>
                  <p className="text-xs text-slate-400">
                    Sürücülerin gönderdiği tur zamanı kanıtı ekran görüntülerini inceleyin ve onaylayın.
                  </p>
                </div>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs w-fit">
              {(['pending', 'verified', 'rejected', 'all'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setSetupFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-all cursor-pointer ${
                    setupFilterStatus === st
                      ? 'bg-red-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {st === 'pending' ? `Bekleyenler (${pendingSetupsCount})` : st === 'verified' ? 'Onaylananlar' : st === 'rejected' ? 'Reddedilenler' : 'Tümü'}
                </button>
              ))}
            </div>

            {/* Setups List */}
            {filteredSetups.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs bg-slate-950/60 rounded-xl border border-slate-800">
                Bu filtrede incelenecek setup kaydı bulunmuyor.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredSetups.map((setup) => {
                  const status = setup.verificationStatus || (setup.isProofVerified ? 'verified' : 'pending');
                  return (
                    <div key={setup.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <h4 className="font-extrabold text-sm text-white">{setup.title}</h4>
                          <div className="text-xs text-slate-400 flex items-center gap-2">
                            <span>@{setup.creatorUsername}</span>
                            <span>•</span>
                            <span className="font-mono text-emerald-400 font-bold">{setup.bestLapTime}</span>
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          status === 'verified'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : status === 'rejected'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}>
                          {status}
                        </span>
                      </div>

                      {/* Proof Screenshot */}
                      {setup.proofScreenshot && (
                        <div className="relative group rounded-xl overflow-hidden border border-slate-800 bg-black max-h-36">
                          <img
                            src={setup.proofScreenshot}
                            alt="Proof Screenshot"
                            className="w-full h-36 object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setPreviewScreenshot(setup.proofScreenshot || null)}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-1 cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Büyük Boyut Tam Ekran</span>
                          </button>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => onUpdateSetupStatus(setup.id, 'verified')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Onayla (Verified)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onUpdateSetupStatus(setup.id, 'rejected')}
                          className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 font-bold text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reddet</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* CREATE USER MODAL */}
      {isCreateUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-red-500" />
                <span>Yeni Kullanıcı Oluştur</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateUserModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {createUserError && (
              <div className="p-2.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs">
                {createUserError}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Kullanıcı Adı</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="e.g. SpeedDemon"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Şifre</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="En az 4 karakter"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Sürücü Rozeti</label>
                <select
                  value={newBadge}
                  onChange={(e) => setNewBadge(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-red-500"
                >
                  <option value="Community">Community</option>
                  <option value="Pro">Pro</option>
                  <option value="Esports">Esports</option>
                  <option value="Verified">Verified</option>
                  <option value="Admin / Founder">Admin / Founder</option>
                </select>
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <input
                    type="checkbox"
                    checked={newIsAdmin}
                    onChange={(e) => setNewIsAdmin(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 text-red-600 focus:ring-0"
                  />
                  <div>
                    <span className="font-bold text-white text-xs">Yönetici Yetkisi Ver (isAdmin: true)</span>
                    <p className="text-[10px] text-slate-400">Kullanıcının admin paneline tam erişimi olur.</p>
                  </div>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-all cursor-pointer shadow-md shadow-red-600/30"
              >
                Kullanıcıyı Oluştur
              </button>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {resetUserTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>@{resetUserTarget.username} Şifresini Sıfırla</span>
              </h3>
              <button
                type="button"
                onClick={() => setResetUserTarget(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Yeni Şifre</label>
                <input
                  type="password"
                  value={resetPasswordValue}
                  onChange={(e) => setResetPasswordValue(e.target.value)}
                  placeholder="Yeni şifreyi girin"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition-all cursor-pointer shadow-md"
              >
                Şifreyi Güncelle
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SCREENSHOT PREVIEW MODAL */}
      {previewScreenshot && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setPreviewScreenshot(null)}
        >
          <div className="max-w-4xl w-full relative" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setPreviewScreenshot(null)}
              className="absolute -top-10 right-0 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
              <span>Kapat</span>
            </button>
            <img src={previewScreenshot} alt="Full Screenshot" className="w-full max-h-[85vh] object-contain rounded-xl border border-slate-800" />
          </div>
        </div>
      )}
    </div>
  );
};
