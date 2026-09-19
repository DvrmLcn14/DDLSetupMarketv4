import React, { useState, useRef } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Check,
  X,
  AlertCircle,
  Eye,
  Camera,
  Layers,
  Flag,
  FileCheck,
  Sparkles,
  Sliders,
  Trash2,
  ExternalLink,
  ChevronRight,
  Filter,
  Edit3,
  Plus,
  Image as ImageIcon,
  Upload,
  Globe,
  Link2,
} from 'lucide-react';
import { CarSetup, Track, VerificationStatus, FloatingBannerConfig, FloatingBannerItem } from '../types';
import { TRACKS } from '../data/mockData';
import { DEFAULT_FLOATING_BANNER_CONFIG, DEFAULT_FLOATING_BANNER_ITEMS } from '../data/bannerConfig';
import { getTrackFlagEmoji, TrackFlagIcon } from '../utils/trackFlags';
import { SubmitSetupModal } from './SubmitSetupModal';
import { DiscordIcon } from './FloatingBanner';

interface AdminVerificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  setups: CarSetup[];
  onUpdateStatus: (
    setupId: string,
    status: VerificationStatus,
    notes?: string
  ) => void;
  onDeleteSetup?: (setupId: string) => void;
  onUpdateSetup?: (updatedSetup: CarSetup) => void;
  onOpenBannerConfig?: () => void;
  bannerConfig?: FloatingBannerConfig;
  onSaveBannerConfig?: (updated: FloatingBannerConfig) => void;
}

export const AdminVerificationPanel: React.FC<AdminVerificationPanelProps> = ({
  isOpen,
  onClose,
  setups,
  onUpdateStatus,
  onDeleteSetup,
  onUpdateSetup,
  onOpenBannerConfig,
  bannerConfig = DEFAULT_FLOATING_BANNER_CONFIG,
  onSaveBannerConfig,
}) => {
  const [adminTab, setAdminTab] = useState<'setups' | 'floating_banner'>('setups');
  const [bannerFormData, setBannerFormData] = useState<FloatingBannerConfig>(() => {
    const items = (bannerConfig && bannerConfig.items && bannerConfig.items.length > 0)
      ? bannerConfig.items
      : DEFAULT_FLOATING_BANNER_ITEMS;
    return {
      ...bannerConfig,
      items,
      autoRotate: bannerConfig.autoRotate !== false,
      intervalSeconds: bannerConfig.intervalSeconds || 5,
    };
  });
  const [activeSlideTab, setActiveSlideTab] = useState<number>(0);
  const [bannerSaveSuccess, setBannerSaveSuccess] = useState<boolean>(false);

  // Sync banner form data when prop changes
  React.useEffect(() => {
    if (bannerConfig) {
      const items = (bannerConfig.items && bannerConfig.items.length > 0)
        ? bannerConfig.items
        : DEFAULT_FLOATING_BANNER_ITEMS;
      setBannerFormData({
        ...bannerConfig,
        items,
        autoRotate: bannerConfig.autoRotate !== false,
        intervalSeconds: bannerConfig.intervalSeconds || 5,
      });
    }
  }, [bannerConfig]);

  const [filterStatus, setFilterStatus] = useState<
    'pending' | 'verified' | 'rejected' | 'all'
  >('pending');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSetupId, setSelectedSetupId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [showRejectDialog, setShowRejectDialog] = useState<boolean>(false);
  const [previewProofImage, setPreviewProofImage] = useState<string | null>(null);
  const [editingSetup, setEditingSetup] = useState<CarSetup | null>(null);

  if (!isOpen) return null;

  // Filter setups
  const pendingSetups = setups.filter(
    (s) => s.verificationStatus === 'pending' || (!s.verificationStatus && s.isUserSubmitted && !s.isProofVerified)
  );
  const verifiedSetups = setups.filter(
    (s) => s.verificationStatus === 'verified' || s.isProofVerified
  );
  const rejectedSetups = setups.filter(
    (s) => s.verificationStatus === 'rejected'
  );

  const filteredSetups = setups.filter((s) => {
    const isPending =
      s.verificationStatus === 'pending' ||
      (!s.verificationStatus && s.isUserSubmitted && !s.isProofVerified);
    const isVerified =
      s.verificationStatus === 'verified' || (s.isProofVerified && s.verificationStatus !== 'rejected');
    const isRejected = s.verificationStatus === 'rejected';

    if (filterStatus === 'pending' && !isPending) return false;
    if (filterStatus === 'verified' && !isVerified) return false;
    if (filterStatus === 'rejected' && !isRejected) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const trackObj = TRACKS[s.trackId];
      const trackName = trackObj ? trackObj.name.toLowerCase() : s.trackId;
      return (
        s.title.toLowerCase().includes(q) ||
        s.creatorUsername.toLowerCase().includes(q) ||
        s.carName.toLowerCase().includes(q) ||
        trackName.includes(q) ||
        s.bestLapTime.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeSetup = setups.find((s) => s.id === selectedSetupId) || filteredSetups[0] || null;

  // Track analysis helper
  const getTrackAnalysis = (setup: CarSetup) => {
    const track = TRACKS[setup.trackId];
    if (!track) {
      return {
        trackName: setup.customTrackName || setup.trackId,
        lapRecord: 'N/A',
        status: 'Unknown Track',
        statusColor: 'text-slate-400',
        bgColor: 'bg-slate-800/40',
        borderColor: 'border-slate-700',
      };
    }

    // Convert track lapRecord (e.g. 1:31.447) to seconds
    let recordSecs = 90;
    if (track.lapRecord) {
      const parts = track.lapRecord.split(':');
      if (parts.length === 2) {
        recordSecs = parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
      }
    }

    const claimedSecs = setup.lapTimeSeconds || 90;
    const diff = claimedSecs - recordSecs;

    if (claimedSecs < 45) {
      return {
        track,
        trackName: track.name,
        lapRecord: track.lapRecord,
        recordHolder: track.recordHolder,
        diffText: `Physically impossible time (${claimedSecs}s vs record ${track.lapRecord})`,
        status: 'Unrealistic / Flagged',
        statusColor: 'text-rose-400 font-bold',
        bgColor: 'bg-rose-950/40',
        borderColor: 'border-rose-500/50',
      };
    } else if (diff < -3) {
      return {
        track,
        trackName: track.name,
        lapRecord: track.lapRecord,
        recordHolder: track.recordHolder,
        diffText: `${Math.abs(diff).toFixed(2)}s faster than official F1 record (${track.lapRecord})`,
        status: 'World Record Candidate (Verify Telemetry)',
        statusColor: 'text-amber-300 font-bold',
        bgColor: 'bg-amber-950/40',
        borderColor: 'border-amber-500/50',
      };
    } else {
      return {
        track,
        trackName: track.name,
        lapRecord: track.lapRecord,
        recordHolder: track.recordHolder,
        diffText: diff >= 0 ? `+${diff.toFixed(2)}s vs official F1 lap record (${track.lapRecord})` : `${Math.abs(diff).toFixed(2)}s faster than record`,
        status: 'Valid Competitive Pace',
        statusColor: 'text-emerald-400 font-bold',
        bgColor: 'bg-emerald-950/40',
        borderColor: 'border-emerald-500/50',
      };
    }
  };

  const handleApprove = (setupId: string) => {
    onUpdateStatus(setupId, 'verified', 'Approved by Admin: In-game proof screenshot verified and lap time validated.');
  };

  const handleRejectConfirm = () => {
    if (selectedSetupId) {
      onUpdateStatus(selectedSetupId, 'rejected', rejectionReason.trim() || 'Rejected by Admin: Lap time proof could not be verified.');
      setShowRejectDialog(false);
      setRejectionReason('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-6xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Admin Panel Header with Primary Navigation Tabs */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 shadow-md shadow-sky-500/10">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Admin Command &amp; Verification Center
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 uppercase tracking-wide">
                  Admin Access
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Manage setup verifications, lap telemetry, and live floating Discord/ad marketing banners.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Primary Section Selector Tabs */}
            <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl">
              <button
                type="button"
                id="admin-tab-setups-btn"
                onClick={() => setAdminTab('setups')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  adminTab === 'setups'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Setup Queue</span>
                {pendingSetups.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 ml-0.5">
                    {pendingSetups.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                id="admin-tab-floating-banner-btn"
                onClick={() => setAdminTab('floating_banner')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  adminTab === 'floating_banner'
                    ? 'bg-[#5865F2] text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <DiscordIcon className="w-3.5 h-3.5 text-white" />
                <span>Floating Discord / Ad Box</span>
                {bannerFormData.enabled && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {adminTab === 'setups' ? (
          <>
            {/* Filter Bar & Search */}
            <div className="px-5 py-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 flex-shrink-0 text-xs">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                filterStatus === 'pending'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Pending Review</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-slate-900/60 text-amber-300">
                {pendingSetups.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilterStatus('verified')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                filterStatus === 'verified'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Setups</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-slate-900/60 text-emerald-300">
                {verifiedSetups.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilterStatus('rejected')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                filterStatus === 'rejected'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Rejected</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-slate-900/60 text-rose-300">
                {rejectedSetups.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-slate-700 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All ({setups.length})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[200px] max-w-xs flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by creator, title or circuit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* Main Split Body: Submissions List (Left) & Verification Detail Inspector (Right) */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Queue List */}
          <div className="w-full sm:w-1/3 md:w-2/5 border-r border-slate-800 overflow-y-auto bg-slate-950/50 p-3 space-y-2">
            {filteredSetups.length === 0 ? (
              <div className="p-8 text-center text-slate-500 space-y-2">
                <FileCheck className="w-8 h-8 mx-auto text-slate-600" />
                <p className="font-semibold text-xs text-slate-400">
                  No submissions match current filter
                </p>
                <p className="text-[11px] text-slate-500">
                  All setups in this queue have been processed or no setups match your search.
                </p>
              </div>
            ) : (
              filteredSetups.map((s) => {
                const isSelected = activeSetup?.id === s.id;
                const trackObj = TRACKS[s.trackId];
                const isVerified = s.verificationStatus === 'verified' || s.isProofVerified;
                const isPending = s.verificationStatus === 'pending' || (!s.verificationStatus && s.isUserSubmitted && !s.isProofVerified);
                const isRejected = s.verificationStatus === 'rejected';

                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedSetupId(s.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-slate-800/90 border-sky-500 shadow-md ring-1 ring-sky-500/40'
                        : 'bg-slate-900/80 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <TrackFlagIcon trackId={s.trackId} countryOrTrackName={trackObj?.country} size="sm" />
                        <span className="font-bold text-white text-xs line-clamp-1">
                          {s.title}
                        </span>
                      </div>

                      {/* Status Badge */}
                      {isVerified && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                          <ShieldCheck className="w-2.5 h-2.5" />
                          Verified
                        </span>
                      )}
                      {isPending && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          Pending
                        </span>
                      )}
                      {isRejected && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                          <XCircle className="w-2.5 h-2.5" />
                          Rejected
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-medium text-slate-300">@{s.creatorUsername}</span>
                      <span className="font-mono text-amber-300 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        ⏱️ {s.bestLapTime || '1:30.000'}
                      </span>
                    </div>

                    {/* Screenshot Proof Preview in Pending Setup Queue */}
                    <div className="mt-2.5 pt-2 border-t border-slate-800/80">
                      {s.proofScreenshot || (s.setupScreenshots && s.setupScreenshots.length > 0) ? (
                        <div className="flex items-center gap-2.5 bg-slate-950/80 p-2 rounded-lg border border-slate-800/90 hover:border-slate-700 transition-colors">
                          <div
                            className="relative w-16 h-12 rounded overflow-hidden bg-black border border-slate-700/80 flex-shrink-0 group/thumb cursor-pointer shadow"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSetupId(s.id);
                              setPreviewProofImage(s.proofScreenshot || s.setupScreenshots![0].imageUrl);
                            }}
                            title="Click to zoom proof screenshot"
                          >
                            <img
                              src={s.proofScreenshot || s.setupScreenshots![0].imageUrl}
                              alt="Proof preview"
                              className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform"
                            />
                            <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                              <Eye className="w-3.5 h-3.5 text-white" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0 text-[10px]">
                            <div className="flex items-center gap-1 text-emerald-400 font-bold">
                              <Camera className="w-3 h-3 text-emerald-400" />
                              <span>Proof Attached</span>
                            </div>
                            <div className="text-slate-300 truncate mt-0.5 font-medium">
                              {s.carName}
                            </div>
                            <div className="text-slate-500 text-[9px]">
                              Click thumbnail to enlarge
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-[10px] text-slate-500 py-0.5">
                          <span className="flex items-center gap-1 text-slate-400">
                            <AlertCircle className="w-3 h-3 text-amber-400/80" />
                            <span>No screenshot proof</span>
                          </span>
                          <span>{s.carName}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-slate-800/60">
                      <span>{s.dateAdded}</span>
                      {isPending && (
                        <span className="text-amber-400 font-semibold text-[9px] uppercase tracking-wider">
                          Awaiting Review
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right: Detailed Inspection Panel */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-900 space-y-5">
            {activeSetup ? (
              <>
                {/* Active Setup Top Identity Header */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <TrackFlagIcon
                        trackId={activeSetup.trackId}
                        countryOrTrackName={TRACKS[activeSetup.trackId]?.country}
                        size="lg"
                      />
                      <div>
                        <h3 className="font-black text-white text-base">
                          {activeSetup.title}
                        </h3>
                        <p className="text-xs text-slate-400">
                          Submitted by <span className="text-sky-400 font-bold">@{activeSetup.creatorUsername}</span> • {activeSetup.gameId === 'f1_24' ? 'F1® 24' : activeSetup.gameId === 'f1_26' ? 'F1® 26' : 'F1® 25'}
                        </p>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <div>
                      {activeSetup.verificationStatus === 'verified' || activeSetup.isProofVerified ? (
                        <div className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-black flex items-center gap-1.5 shadow-sm shadow-emerald-500/20">
                          <ShieldCheck className="w-4 h-4 text-emerald-400 fill-emerald-500/20" />
                          <span>Verified Esports Spec</span>
                        </div>
                      ) : activeSetup.verificationStatus === 'rejected' ? (
                        <div className="px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-1.5">
                          <XCircle className="w-4 h-4 text-rose-400" />
                          <span>Verification Rejected</span>
                        </div>
                      ) : (
                        <div className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-amber-400" />
                          <span>Pending Verification</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Specs Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-semibold">Claimed Lap Time</span>
                      <span className="font-mono text-amber-300 font-black text-sm">{activeSetup.bestLapTime || '1:30.000'}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-semibold">Chassis / Car</span>
                      <span className="font-bold text-slate-200 text-xs truncate block">{activeSetup.carName}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-semibold">Aero Wings</span>
                      <span className="font-mono text-sky-300 font-bold text-xs">{activeSetup.specs.frontWing} / {activeSetup.specs.rearWing}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-semibold">Input Device</span>
                      <span className="font-semibold text-slate-300 text-xs">{activeSetup.inputDevice || 'Wheel'}</span>
                    </div>
                  </div>
                </div>

                {/* TRACK TELEMETRY SANITY ANALYSIS */}
                {(() => {
                  const analysis = getTrackAnalysis(activeSetup);
                  return (
                    <div className={`p-4 rounded-2xl border ${analysis.borderColor} ${analysis.bgColor} space-y-2`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Flag className="w-4 h-4 text-sky-400" />
                          <span className="font-extrabold text-xs text-white uppercase tracking-wider">
                            Circuit Telemetry &amp; Lap Time Validation
                          </span>
                        </div>
                        <span className={`text-xs ${analysis.statusColor} px-2.5 py-0.5 rounded-md bg-slate-950/80 border border-slate-800`}>
                          {analysis.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                        <div>
                          <span className="text-slate-400 block text-[11px]">Official Circuit Record:</span>
                          <span className="font-mono text-white font-bold">{analysis.lapRecord}</span>
                          {analysis.recordHolder && (
                            <span className="text-[10px] text-slate-400 block">by {analysis.recordHolder}</span>
                          )}
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">Claimed Hotlap Time:</span>
                          <span className="font-mono text-amber-300 font-bold">{activeSetup.bestLapTime}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">Pace Differential:</span>
                          <span className="font-mono text-slate-200 font-medium">{analysis.diffText}</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* IN-GAME PROOF SCREENSHOT INSPECTOR */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4 text-amber-400" />
                      <span className="font-bold text-white text-xs uppercase tracking-wider">
                        In-Game Screenshot Proof Inspection
                      </span>
                    </div>
                    {activeSetup.proofTimestamp && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        Captured: {activeSetup.proofTimestamp}
                      </span>
                    )}
                  </div>

                  {activeSetup.proofScreenshot ? (
                    <div className="space-y-3">
                      <div
                        className="rounded-xl overflow-hidden border border-slate-800 bg-black max-h-[340px] flex items-center justify-center relative group cursor-pointer shadow-inner"
                        onClick={() => setPreviewProofImage(activeSetup.proofScreenshot || null)}
                      >
                        <img
                          src={activeSetup.proofScreenshot}
                          alt="In-Game Proof Screenshot"
                          className="max-h-[340px] w-full object-contain"
                        />
                        <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-xs font-bold text-white">
                          <Eye className="w-4 h-4" />
                          <span>Click to Inspect Fullscreen</span>
                        </div>
                      </div>

                      {/* Visual Verification Decision Controls */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewProofImage(activeSetup.proofScreenshot || null)}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-sky-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect Full Resolution</span>
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setShowRejectDialog(true)}
                            className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-rose-950 text-rose-300 border border-slate-700 hover:border-rose-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5 text-rose-400" />
                            <span>Reject</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApprove(activeSetup.id)}
                            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            <span>Approve &amp; Grant Verified</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : activeSetup.setupScreenshots && activeSetup.setupScreenshots.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {activeSetup.setupScreenshots.map((shot) => (
                        <div
                          key={shot.id}
                          className="rounded-xl overflow-hidden border border-slate-800 bg-black cursor-pointer group relative"
                          onClick={() => setPreviewProofImage(shot.imageUrl)}
                        >
                          <img src={shot.imageUrl} alt={shot.title} className="h-28 w-full object-cover" />
                          <div className="p-1.5 bg-slate-950/90 text-[10px] font-bold text-slate-300 truncate">
                            {shot.title}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 rounded-xl border border-dashed border-slate-800 bg-slate-900/30 text-center space-y-3">
                      <AlertCircle className="w-6 h-6 mx-auto text-amber-400/80" />
                      <div>
                        <p className="text-xs text-slate-200 font-bold">
                          No In-Game Proof Screenshot Attached
                        </p>
                        <p className="text-[11px] text-slate-400 max-w-md mx-auto mt-0.5">
                          This setup was submitted without an in-game screenshot proof. Review the calibration specs below before deciding.
                        </p>
                      </div>
                      <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setShowRejectDialog(true)}
                          className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-rose-950 text-rose-300 border border-slate-700 hover:border-rose-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5 text-rose-400" />
                          <span>Reject</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApprove(activeSetup.id)}
                          className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Approve &amp; Grant Verified</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* SETUP PARAMETERS BREAKDOWN */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-sky-400" />
                    <span className="font-bold text-white text-xs uppercase tracking-wider">
                      Setup Parameter Calibration Sheet
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-sans block">Front / Rear Wing</span>
                      <span className="text-sky-300 font-bold">{activeSetup.specs.frontWing} / {activeSetup.specs.rearWing}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-sans block">Diff On / Off Throttle</span>
                      <span className="text-sky-300 font-bold">{activeSetup.specs.diffOnThrottle}% / {activeSetup.specs.diffOffThrottle}%</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-sans block">Front / Rear Camber</span>
                      <span className="text-sky-300 font-bold">{activeSetup.specs.frontCamber}° / {activeSetup.specs.rearCamber}°</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-sans block">Suspension Front / Rear</span>
                      <span className="text-sky-300 font-bold">{activeSetup.specs.frontSuspension} / {activeSetup.specs.rearSuspension}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-sans block">Anti-Roll Bars F / R</span>
                      <span className="text-sky-300 font-bold">{activeSetup.specs.frontAntiRollBar} / {activeSetup.specs.rearAntiRollBar}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-sans block">Brake Pressure &amp; Bias</span>
                      <span className="text-sky-300 font-bold">{activeSetup.specs.brakePressure}% ({activeSetup.specs.brakeBias}%)</span>
                    </div>
                  </div>
                </div>

                {/* ADMIN VERIFICATION ACTION BAR */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3 sticky bottom-0">
                  <div className="text-xs">
                    <span className="text-slate-400 block font-medium">Administrator Decision:</span>
                    <span className="text-slate-200 text-[11px]">
                      Verified setups receive a glowing "Verified Esports Spec" badge visible to all users.
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {onUpdateSetup && (
                      <button
                        type="button"
                        id="admin-edit-setup-btn"
                        onClick={() => setEditingSetup(activeSetup)}
                        className="px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 hover:text-amber-100 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                        title="Edit setup parameters, lap time, wing angles, or notes"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                        <span>Edit Setup</span>
                      </button>
                    )}

                    {onDeleteSetup && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this submission?')) {
                            onDeleteSetup(activeSetup.id);
                          }
                        }}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    )}

                    {activeSetup.verificationStatus === 'verified' || activeSetup.isProofVerified ? (
                      <button
                        type="button"
                        onClick={() => setShowRejectDialog(true)}
                        className="px-4 py-2 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-500/50 text-rose-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <XCircle className="w-4 h-4 text-rose-400" />
                        <span>Revoke Verification</span>
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setShowRejectDialog(true)}
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-950 text-rose-300 border border-slate-700 hover:border-rose-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <XCircle className="w-4 h-4 text-rose-400" />
                          <span>Reject</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleApprove(activeSetup.id)}
                          className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Approve &amp; Grant Verified Badge</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500 space-y-3">
                <ShieldCheck className="w-12 h-12 text-slate-600" />
                <h3 className="font-bold text-slate-300 text-sm">Select a setup to review</h3>
                <p className="text-xs text-slate-500 max-w-sm">
                  Choose a submission from the queue on the left to inspect screenshot proof, parameters, and telemetry metrics.
                </p>
              </div>
            )}
          </div>
        </div>
        </>
      ) : (
        /* =========================================================================
           DEDICATED ADMIN FLOATING DISCORD / AD BANNER MANAGEMENT SECTION
           ========================================================================= */
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 bg-slate-950/80">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Intro Card */}
            <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#5865F2] flex items-center justify-center text-white shadow-lg shadow-[#5865F2]/30">
                  <DiscordIcon className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    Floating Announcements &amp; Ad Slideshow Manager
                  </h3>
                  <p className="text-xs text-slate-400 max-w-xl">
                    Configure automated rotating announcement slides, interval duration (default 5s), Discord invites, and visual accents for the floating bottom-right box.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-300">Widget Status:</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                    bannerFormData.enabled
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  }`}
                >
                  {bannerFormData.enabled ? '● Active / Visible' : '○ Disabled'}
                </span>
              </div>
            </div>

            {/* Form & Live Preview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Form Controls (7 Cols) */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (onSaveBannerConfig) {
                    onSaveBannerConfig(bannerFormData);
                  }
                  try {
                    localStorage.setItem('ddl_floating_banner_config', JSON.stringify(bannerFormData));
                  } catch (err) {
                    console.warn('Failed to save to localStorage', err);
                  }
                  setBannerSaveSuccess(true);
                  setTimeout(() => setBannerSaveSuccess(false), 2500);
                }}
                className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Slideshow Settings &amp; Queue
                  </h4>
                  <span className="text-xs text-indigo-400 font-bold">
                    {(bannerFormData.items || []).length} Announcement Slide{(bannerFormData.items || []).length > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Enable & Auto-Rotate Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">
                        Enable Floating Banner
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Shows bottom-right widget
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-2">
                      <input
                        type="checkbox"
                        checked={bannerFormData.enabled}
                        onChange={(e) =>
                          setBannerFormData({ ...bannerFormData, enabled: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#5865F2]"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0 sm:pl-3">
                    <div>
                      <span className="text-xs font-bold text-white block flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        Rotation Timer
                      </span>
                      <span className="text-[11px] text-slate-400">Advance interval</span>
                    </div>
                    <select
                      value={bannerFormData.intervalSeconds || 5}
                      onChange={(e) =>
                        setBannerFormData({
                          ...bannerFormData,
                          intervalSeconds: parseInt(e.target.value, 10) || 5,
                        })
                      }
                      className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-indigo-500"
                    >
                      <option value={3}>3s per slide</option>
                      <option value={5}>5s (Default)</option>
                      <option value={8}>8s per slide</option>
                      <option value={10}>10s per slide</option>
                    </select>
                  </div>
                </div>

                {/* Slide Selection Tabs & Add Slide Button */}
                {(() => {
                  const slides = bannerFormData.items && bannerFormData.items.length > 0 ? bannerFormData.items : DEFAULT_FLOATING_BANNER_ITEMS;
                  const safeIndex = Math.min(Math.max(0, activeSlideTab), slides.length - 1);
                  const currentSlide = slides[safeIndex] || slides[0];

                  const updateSlideField = (field: keyof FloatingBannerItem, val: any) => {
                    const updated = slides.map((s, idx) => {
                      if (idx === safeIndex) return { ...s, [field]: val };
                      return s;
                    });
                    setBannerFormData({
                      ...bannerFormData,
                      items: updated,
                      ...(safeIndex === 0 ? { [field]: val } : {}),
                    });
                  };

                  const handleAddNewSlide = () => {
                    const newS: FloatingBannerItem = {
                      id: `slide-${Date.now()}`,
                      title: 'New Community Announcement',
                      highlightText: 'Notice',
                      description: 'Add info about hot setups, esports tournaments, or discord telemetry coaching.',
                      buttonText: 'Join Discord',
                      buttonUrl: 'https://discord.gg/aFzAhfBy3',
                      badgeText: 'ANNOUNCEMENT',
                      onlineCount: 200,
                      iconType: 'sparkles',
                      accentColor: 'indigo',
                    };
                    const updated = [...slides, newS];
                    setBannerFormData({ ...bannerFormData, items: updated });
                    setActiveSlideTab(updated.length - 1);
                  };

                  const handleDeleteCurrentSlide = () => {
                    if (slides.length <= 1) {
                      alert('You must have at least one announcement slide.');
                      return;
                    }
                    const updated = slides.filter((_, idx) => idx !== safeIndex);
                    setBannerFormData({ ...bannerFormData, items: updated });
                    setActiveSlideTab(Math.max(0, safeIndex - 1));
                  };

                  return (
                    <div className="space-y-3">
                      {/* Slide Tabs */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-[calc(100%-110px)]">
                          {slides.map((s, idx) => (
                            <button
                              key={s.id || idx}
                              type="button"
                              onClick={() => setActiveSlideTab(idx)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all shrink-0 cursor-pointer ${
                                idx === safeIndex
                                  ? 'bg-indigo-600/30 text-indigo-200 border-indigo-500'
                                  : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-white'
                              }`}
                            >
                              Slide {idx + 1}
                            </button>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={handleAddNewSlide}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1 transition-all shrink-0 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Slide</span>
                        </button>
                      </div>

                      {/* Active Slide Form Details */}
                      <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                          <span className="text-xs font-black text-indigo-400">
                            Slide #{safeIndex + 1} Parameters
                          </span>
                          {slides.length > 1 && (
                            <button
                              type="button"
                              onClick={handleDeleteCurrentSlide}
                              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          )}
                        </div>

                        {/* Title & Badge */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                              Slide Title:
                            </label>
                            <input
                              type="text"
                              required
                              value={currentSlide.title}
                              onChange={(e) => updateSlideField('title', e.target.value)}
                              placeholder="e.g. Join DDL Setup Discord"
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5865F2]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                              Badge Tag:
                            </label>
                            <input
                              type="text"
                              value={currentSlide.badgeText || ''}
                              onChange={(e) => updateSlideField('badgeText', e.target.value)}
                              placeholder="e.g. HOT COMMUNITY, PRIZE POOL"
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5865F2]"
                            />
                          </div>
                        </div>

                        {/* Description */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Description Body:
                          </label>
                          <textarea
                            rows={2}
                            required
                            value={currentSlide.description}
                            onChange={(e) => updateSlideField('description', e.target.value)}
                            placeholder="Catchy text describing announcement perks..."
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#5865F2]"
                          />
                        </div>

                        {/* Button Label & Online Count */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                              Action Button Text:
                            </label>
                            <input
                              type="text"
                              required
                              value={currentSlide.buttonText}
                              onChange={(e) => updateSlideField('buttonText', e.target.value)}
                              placeholder="e.g. Join Discord"
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5865F2]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                              Online Count (Optional):
                            </label>
                            <input
                              type="number"
                              min={0}
                              value={currentSlide.onlineCount || 0}
                              onChange={(e) =>
                                updateSlideField('onlineCount', parseInt(e.target.value, 10) || 0)
                              }
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5865F2]"
                            />
                          </div>
                        </div>

                        {/* Target Link */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Target Link URL / Discord Invite:
                          </label>
                          <input
                            type="text"
                            required
                            value={currentSlide.buttonUrl}
                            onChange={(e) => updateSlideField('buttonUrl', e.target.value)}
                            placeholder="https://discord.gg/... or #marketplace"
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5865F2]"
                          />
                        </div>

                        {/* Accent Color & Icon Selection */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                              Icon Style / Visual Graphic:
                            </label>
                            <select
                              value={currentSlide.iconType}
                              onChange={(e) => updateSlideField('iconType', e.target.value as any)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5865F2]"
                            >
                              <option value="discord">Discord Icon</option>
                              <option value="custom">Custom Image / Logo</option>
                              <option value="trophy">Trophy (Esports / Lap Times)</option>
                              <option value="sparkles">Sparkles (Hot / Contest)</option>
                              <option value="zap">Zap (Telemetry / Guides)</option>
                              <option value="flag">Racing Flag (Championship)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                              Color Accent:
                            </label>
                            <select
                              value={currentSlide.accentColor || 'indigo'}
                              onChange={(e) => updateSlideField('accentColor', e.target.value as any)}
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

                        {/* Custom Image Upload & URL input */}
                        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                              <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                              <span>Custom Slot Image / Sponsor Logo</span>
                            </span>
                            <span className="text-[10px] text-slate-400">URL or Device Upload</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={currentSlide.customIconUrl || ''}
                              onChange={(e) => {
                                updateSlideField('customIconUrl', e.target.value);
                                if (e.target.value) updateSlideField('iconType', 'custom');
                              }}
                              placeholder="https://... image link or upload below"
                              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
                            />
                            <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0">
                              <Upload className="w-3.5 h-3.5" />
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
                                        updateSlideField('customIconUrl', dataUrl);
                                        updateSlideField('iconType', 'custom');
                                      }
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>
                          </div>

                          {currentSlide.customIconUrl && (
                            <div className="flex items-center gap-2 pt-1">
                              <img
                                src={currentSlide.customIconUrl}
                                alt="Custom"
                                referrerPolicy="no-referrer"
                                className="w-7 h-7 rounded object-cover border border-indigo-500/40"
                              />
                              <span className="text-[11px] text-emerald-400 font-medium">Image active</span>
                              <button
                                type="button"
                                onClick={() => {
                                  updateSlideField('customIconUrl', '');
                                  updateSlideField('iconType', 'discord');
                                }}
                                className="text-[11px] text-rose-400 hover:text-rose-300 ml-auto cursor-pointer"
                              >
                                Remove Image
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Save Button */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setBannerFormData({ ...DEFAULT_FLOATING_BANNER_CONFIG });
                        setActiveSlideTab(0);
                      }}
                      className="text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                    >
                      Reset All Defaults
                    </button>
                    <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      <span>Saves globally for all users</span>
                    </span>
                  </div>

                  <button
                    type="submit"
                    id="save-floating-banner-admin-btn"
                    className="px-6 py-2.5 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-extrabold text-xs shadow-lg shadow-[#5865F2]/30 flex items-center gap-2 transition-all cursor-pointer transform active:scale-95"
                  >
                    <span>{bannerSaveSuccess ? '✓ Saved Globally to Database!' : 'Save & Publish Globally'}</span>
                  </button>
                </div>
              </form>

              {/* Live Preview Box (5 Cols) */}
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl flex flex-col">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
                  Live Real-Time Preview
                </h4>

                <p className="text-[11px] text-slate-400">
                  Preview of the active rotating announcement slideshow (changes automatically every {bannerFormData.intervalSeconds || 5}s):
                </p>

                {/* Interactive Preview of Active Slide */}
                {(() => {
                  const slides = bannerFormData.items && bannerFormData.items.length > 0 ? bannerFormData.items : DEFAULT_FLOATING_BANNER_ITEMS;
                  const safeIndex = Math.min(Math.max(0, activeSlideTab), slides.length - 1);
                  const previewSlide = slides[safeIndex] || slides[0];

                  return (
                    <div className="flex-1 flex flex-col items-center justify-center p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 space-y-3">
                      <div className="w-full max-w-[340px] bg-slate-900/95 backdrop-blur-md rounded-2xl border border-indigo-500/40 shadow-2xl overflow-hidden">
                        <div className="h-1 w-full bg-gradient-to-r from-[#5865F2] via-indigo-400 to-sky-400" />
                        <div className="p-4 space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              {previewSlide.badgeText && (
                                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border bg-indigo-500/20 text-indigo-300 border-indigo-500/40">
                                  {previewSlide.badgeText}
                                </span>
                              )}
                              {typeof previewSlide.onlineCount === 'number' && previewSlide.onlineCount > 0 && (
                                <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                  <span className="text-emerald-400 font-bold">
                                    {previewSlide.onlineCount}
                                  </span>{' '}
                                  online
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] font-mono text-slate-400 px-1">
                                {safeIndex + 1}/{slides.length}
                              </span>
                              <span className="p-1 rounded-lg text-slate-500">
                                <X className="w-3.5 h-3.5" />
                              </span>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md bg-[#5865F2] text-white overflow-hidden">
                              {previewSlide.iconType === 'custom' && previewSlide.customIconUrl ? (
                                <img
                                  src={previewSlide.customIconUrl}
                                  alt="Custom"
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />
                              ) : previewSlide.iconType === 'trophy' ? (
                                <Sparkles className="w-5 h-5" />
                              ) : previewSlide.iconType === 'sparkles' ? (
                                <Sparkles className="w-5 h-5" />
                              ) : previewSlide.iconType === 'flag' ? (
                                <Flag className="w-5 h-5" />
                              ) : (
                                <DiscordIcon className="w-5 h-5" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-black text-white truncate">
                                {previewSlide.title || 'Untitled Banner'}
                              </h4>
                              <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5 line-clamp-2">
                                {previewSlide.description || 'No description provided.'}
                              </p>
                            </div>
                          </div>

                          <div className="pt-1">
                            <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-black bg-[#5865F2] text-white shadow-lg">
                              <DiscordIcon className="w-4 h-4 shrink-0" />
                              <span>{previewSlide.buttonText || 'Join'}</span>
                              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                            </div>
                          </div>

                          {/* Indicator dots preview */}
                          {slides.length > 1 && (
                            <div className="flex items-center justify-center gap-1 pt-1">
                              {slides.map((_, dotIdx) => (
                                <button
                                  key={dotIdx}
                                  type="button"
                                  onClick={() => setActiveSlideTab(dotIdx)}
                                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                                    dotIdx === safeIndex ? 'w-4 bg-white' : 'w-1.5 bg-slate-700'
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                  <span className="font-bold text-slate-300 block">Persistence Note:</span>
                  <span>
                    Slideshow queue is stored to <code className="text-indigo-300 font-mono">localStorage (ddl_floating_banner_config)</code> and rotates dynamically every 5 seconds on the live site.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* Rejection Reason Modal */}
      {showRejectDialog && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 space-y-4 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-400" />
                <h3 className="font-black text-white text-sm">Reject Setup Verification</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRejectDialog(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Provide a reason or feedback for rejecting this setup submission (visible to administrators and setup owner).
            </p>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Rejection Note / Reason:
              </label>
              <textarea
                rows={3}
                placeholder="e.g., In-game screenshot proof does not display telemetry HUD, or lap time is unsupported by track physics..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRejectDialog(false)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectConfirm}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Proof Image Lightbox */}
      {previewProofImage && (
        <div
          className="fixed inset-0 z-[70] bg-black/95 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPreviewProofImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] flex flex-col items-center">
            <button
              type="button"
              onClick={() => setPreviewProofImage(null)}
              className="absolute -top-10 right-0 p-1.5 rounded-full bg-slate-800 text-white hover:bg-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewProofImage}
              alt="Full Resolution Proof"
              className="max-h-[85vh] w-auto object-contain rounded-xl border border-slate-800"
            />
          </div>
        </div>
      )}

      {/* Admin Edit Setup Modal */}
      {editingSetup && (
        <SubmitSetupModal
          activeGameId={editingSetup.gameId || 'f1_25'}
          defaultTrackId={editingSetup.trackId || 'spa'}
          isOpen={Boolean(editingSetup)}
          setupToEdit={editingSetup}
          onClose={() => setEditingSetup(null)}
          onSubmit={() => {}}
          onUpdate={(updated) => {
            if (onUpdateSetup) {
              onUpdateSetup(updated);
            }
            setEditingSetup(null);
          }}
        />
      )}
    </div>
  );
};
