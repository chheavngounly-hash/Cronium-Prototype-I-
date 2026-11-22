import React, { useState, useEffect, useMemo, useRef } from 'react';
import { getUserPosts } from '../data/userPostsData';
import { UserPostsSection } from './UserPostsSection';
import { UserPostsScreen } from './UserPostsScreen';
import { GamificationDashboard } from './GamificationDashboard';
import {
  ShieldCheck,
  Fingerprint,
  Lock,
  Moon,
  Sun,
  Laptop,
  Bell,
  Volume2,
  VolumeX,
  Database,
  Wifi,
  WifiOff,
  RefreshCw,
  KeyRound,
  CheckCircle2,
  Trash2,
  Copy,
  Check,
  QrCode,
  Building2,
  Mail,
  Key,
  Sparkles,
  Edit3,
  ExternalLink,
  Smartphone,
  Tablet,
  X,
  Share2,
  Linkedin,
  Github,
  Trophy,
  Crown,
  Wand2,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ArrowLeft,
  Camera,
  Image as ImageIcon,
  Eye,
  TrendingUp,
  Briefcase,
  Plus,
  Pencil,
} from 'lucide-react';
import {
  CURRENT_USER,
  PLAN_CONFIGS,
  portraitAnnaSan,
  portraitHiroshiTanaka,
  portraitElenaRostova,
  portraitLiamChen,
} from '../data/mockData';
import { UserPlan, Community, User } from '../types';
import { Post } from '../types/social';
import { PremiumUnlockModal } from './PremiumUnlockModal';
import { BrandLevelModal } from './BrandLevelModal';
import { calculateBrandLevel, BrandLevelStatus } from '../utils/brandLevel';
import { biometricsService } from '../services/biometrics';
import { notificationService } from '../services/notifications';
import { syncService } from '../services/sync';
import {
  EditIdentityModal,
  EditAchievementsModal,
  SocialProfileLink,
  AchievementItem,
  AchievementMetrics,
  ProfileMetricsOverride,
  SocialPlatformIcon,
  getPlatformMeta,
  normalizeExternalHref,
  formatDisplayUrl,
} from './ProfileEditModals';
import { ProfileNetworkSheet } from './ProfileNetworkSheet';

const INITIAL_ACHIEVEMENTS: AchievementItem[] = [
  {
    id: 'ach_1',
    icon: '🏆',
    title: 'Systems Architect of the Year',
    organization: 'Autonomous Mesh Computing Initiative & IEEE',
    year: '2025',
    badge: 'Global Award',
    description: 'Awarded for pioneering zero-knowledge peer mesh routing supporting 10M+ concurrent nodes with sub-50ms cryptographic latency.',
  },
  {
    id: 'ach_2',
    icon: '📜',
    title: '12 Published International Patents',
    organization: 'USPTO & WIPO International Registries',
    year: '2021 – 2025',
    badge: 'Core IP',
    description: 'Lead inventor on hardware-enclave biometric handshakes, edge-inferencing neural meshes, and ratcheted forward-secret keychains.',
  },
  {
    id: 'ach_3',
    icon: '🚀',
    title: '10M+ Daily Active Users Milestone',
    organization: 'Cronium Infrastructure Core',
    year: '2025',
    badge: 'Scale',
    description: 'Designed and deployed the global mesh synchronization pipeline across 140 countries with 99.999% SLA reliability.',
  },
  {
    id: 'ach_4',
    icon: '🎓',
    title: 'NeurIPS Best Paper Contributor',
    organization: 'Neural Information Processing Systems',
    year: '2024',
    badge: 'Research',
    description: 'Co-authored foundational research on "Privacy-Preserving On-Device Latent Diffusion Models for Edge Robotics".',
  },
  {
    id: 'ach_5',
    icon: '🌐',
    title: 'Open Source Ecosystem Champion',
    organization: 'Open Cryptography & WebAssembly Foundations',
    year: '2023 – 2025',
    badge: '45K★ Stars',
    description: 'Creator and core maintainer of open WebAssembly cryptographic primitives and high-throughput audio stream codecs.',
  },
];

export const CURATED_COVER_BACKGROUNDS = [
  {
    id: 'glass_tower',
    name: 'Skyscraper Architectural Facade',
    tag: 'Executive Corporate',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
  },
  {
    id: 'tech_campus',
    name: 'Modern Glass Headquarters',
    tag: 'Silicon Valley Campus',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80',
  },
  {
    id: 'datacenter',
    name: 'Neural Datacenter Corridor',
    tag: 'Cloud Infrastructure',
    url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80',
  },
  {
    id: 'alpine',
    name: 'Alpine Executive Summit',
    tag: 'Mountain Horizon',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&auto=format&fit=crop&q=80',
  },
  {
    id: 'architectural',
    name: 'Minimalist Design Studio',
    tag: 'Creative Loft',
    url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1200&auto=format&fit=crop&q=80',
  },
];

// Clear any legacy persisted profile edits so refreshes/updates always revert cleanly to defaults
const LEGACY_PROFILE_EDIT_STORAGE_KEYS = [
  'cronium_profile_identity_v1',
  'cronium_profile_achievements_v1',
  'cronium_profile_ach_metrics_v1',
  'cronium_profile_metrics_override_v1',
  'cronium_profile_cover',
  'cronium_deleted_profile_post_ids_v1',
  'cronium_profile_privacy_v1',
];

try {
  LEGACY_PROFILE_EDIT_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
} catch {
  // ignore storage errors
}

// Session-only in-memory profile state (persists across tab switches during a session,
// but NEVER saved across page refreshes or platform updates)
const DEFAULT_WORK_EMAIL = 'jennies.vance@cronium.network';
const DEFAULT_LINKEDIN_URL = 'linkedin.com/in/jennies-vance';
const DEFAULT_GITHUB_URL = 'github.com/jennies-vance';
const DEFAULT_ORGANIZATION = 'Cronium Infrastructure Core • Stanford AI Lab Alum';
const DEFAULT_ACHIEVEMENT_METRICS: AchievementMetrics = {
  honors: '1st',
  patents: '14',
  contributor: 'Top 0.1%',
};

const sessionProfileStore: {
  coverUrl: string;
  userName: string;
  userTitle: string;
  userBio: string;
  userOrganization: string;
  workEmail: string;
  linkedinUrl: string;
  githubUrl: string;
  socialLinks: SocialProfileLink[];
  achievements: AchievementItem[];
  achievementMetrics: AchievementMetrics;
  profileMetricsOverride: ProfileMetricsOverride;
  deletedPostIds: Set<string>;
} = {
  coverUrl: CURATED_COVER_BACKGROUNDS[0].url,
  userName: CURRENT_USER.name,
  userTitle: CURRENT_USER.customStatus || '',
  userBio: CURRENT_USER.bio || '',
  userOrganization: DEFAULT_ORGANIZATION,
  workEmail: DEFAULT_WORK_EMAIL,
  linkedinUrl: DEFAULT_LINKEDIN_URL,
  githubUrl: DEFAULT_GITHUB_URL,
  socialLinks: [],
  achievements: INITIAL_ACHIEVEMENTS,
  achievementMetrics: DEFAULT_ACHIEVEMENT_METRICS,
  profileMetricsOverride: {},
  deletedPostIds: new Set<string>(),
};

interface ProfileScreenProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onLockApp: () => void;
  onOpenDeviceSync: () => void;
  isOfflineMode: boolean;
  onToggleOfflineMode: () => void;
  onTriggerTestPush: () => void;
  userPlan?: UserPlan;
  onUnlockPlan?: (plan: UserPlan) => void;
  communities?: Community[];
  connectedUserIds?: string[];
  onStartDirectChatWithUser?: (user: User) => void;
  bottomNav?: React.ReactNode;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  darkMode,
  onToggleDarkMode,
  onLockApp,
  onOpenDeviceSync,
  isOfflineMode,
  onToggleOfflineMode,
  onTriggerTestPush,
  userPlan = 'free',
  onUnlockPlan,
  communities,
  connectedUserIds,
  onStartDirectChatWithUser,
  bottomNav,
}) => {
  const [biometricsEnabled, setBiometricsEnabled] = useState(biometricsService.isEnabled());
  const [soundEnabled, setSoundEnabled] = useState(notificationService.isSoundEnabled());
  const [cacheCleared, setCacheCleared] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planModalTargetTab, setPlanModalTargetTab] = useState<'free' | 'plus' | 'pro'>('plus');
  const [showImpressionsModal, setShowImpressionsModal] = useState(false);
  const [showAllAchievements, setShowAllAchievements] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<AchievementItem | null>(null);
  const [metricToast, setMetricToast] = useState<string | null>(null);
  const [networkSheetTab, setNetworkSheetTab] = useState<'communities' | 'connections' | null>(null);
  const achievementsSectionRef = useRef<HTMLDivElement>(null);
  const [showAllPostsScreen, setShowAllPostsScreen] = useState(false);
  const [targetPostId, setTargetPostId] = useState<string | null>(null);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [activeSettingsSection, setActiveSettingsSection] = useState<
    'security' | 'devices' | 'vault' | 'notifications' | 'appearance' | null
  >(null);
  const [dmAlertsEnabled, setDmAlertsEnabled] = useState(true);
  const [communityAlertsEnabled, setCommunityAlertsEnabled] = useState(true);
  const [connectionAlertsEnabled, setConnectionAlertsEnabled] = useState(true);

  const [jenniesPosts, setJenniesPosts] = useState<Post[]>(() => {
    const basePosts = getUserPosts(
      CURRENT_USER.id,
      CURRENT_USER.name,
      CURRENT_USER.avatar,
      CURRENT_USER.customStatus
    );
    return basePosts.filter((p) => !sessionProfileStore.deletedPostIds.has(p.id));
  });

  const handleDeleteJenniesPost = (postId: string) => {
    sessionProfileStore.deletedPostIds.add(postId);
    setJenniesPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const handleRepostJenniesPost = (post: Post, _thoughts: string) => {
    setJenniesPosts((prev) =>
      prev.map((p) =>
        p.id === post.id ? { ...p, sharesCount: (p.sharesCount || 78) + 1 } : p
      )
    );
    notificationService.playSentChime();
  };

  useEffect(() => {
    if (!metricToast) return;
    const t = setTimeout(() => setMetricToast(null), 3000);
    return () => clearTimeout(t);
  }, [metricToast]);

  // Professional Cover Background state (session-only; resets on refresh/update)
  const [coverUrl, setCoverUrl] = useState<string>(() => sessionProfileStore.coverUrl);
  const [showCoverModal, setShowCoverModal] = useState(false);

  // Dynamic Brand Level Status state (Mobile Legends-inspired tier structure)
  const [showBrandLevelModal, setShowBrandLevelModal] = useState(false);
  const [brandStatusVersion, setBrandStatusVersion] = useState(0);

  // Editable Profile, Identity, Metrics & Achievements state (session-only; NOT saved on refresh/update)
  const [isEditing, setIsEditing] = useState(false);
  const [inlineEditSnapshot, setInlineEditSnapshot] = useState<{
    userName: string;
    userTitle: string;
    userBio: string;
    userOrganization: string;
    workEmail: string;
    linkedinUrl: string;
    githubUrl: string;
  } | null>(null);
  const [showEditIdentityModal, setShowEditIdentityModal] = useState(false);
  const [showEditAchievementsModal, setShowEditAchievementsModal] = useState(false);
  const [editingAchievementId, setEditingAchievementId] = useState<string | null>(null);
  const [profileMetricsOverride, setProfileMetricsOverride] = useState<ProfileMetricsOverride>(
    () => sessionProfileStore.profileMetricsOverride
  );

  const [userName, setUserName] = useState(() => sessionProfileStore.userName);
  const [userTitle, setUserTitle] = useState(() => sessionProfileStore.userTitle);
  const [userBio, setUserBio] = useState(() => sessionProfileStore.userBio);
  const [userOrganization, setUserOrganization] = useState(
    () => sessionProfileStore.userOrganization
  );

  const [workEmail, setWorkEmail] = useState<string>(() => sessionProfileStore.workEmail);
  const [linkedinUrl, setLinkedinUrl] = useState<string>(() => sessionProfileStore.linkedinUrl);
  const [githubUrl, setGithubUrl] = useState<string>(() => sessionProfileStore.githubUrl);
  const [socialLinks, setSocialLinks] = useState<SocialProfileLink[]>(
    () => sessionProfileStore.socialLinks
  );

  const [achievements, setAchievements] = useState<AchievementItem[]>(
    () => sessionProfileStore.achievements
  );

  const [achievementMetrics, setAchievementMetrics] = useState<AchievementMetrics>(
    () => sessionProfileStore.achievementMetrics
  );

  const joinedCommunitiesCount = communities ? communities.filter((c) => c.joined).length : 2;
  const connectionsCount = 1480 + (connectedUserIds ? connectedUserIds.length : 0);

  const displayedCommunitiesCount =
    profileMetricsOverride.communities !== undefined
      ? profileMetricsOverride.communities
      : joinedCommunitiesCount;
  const displayedConnectionsCount =
    profileMetricsOverride.connections !== undefined
      ? profileMetricsOverride.connections
      : connectionsCount;
  const displayedAchievementsCount =
    profileMetricsOverride.achievements !== undefined
      ? profileMetricsOverride.achievements
      : achievements.length;
  const hasCustomMetricsOverride =
    profileMetricsOverride.communities !== undefined ||
    profileMetricsOverride.connections !== undefined ||
    profileMetricsOverride.achievements !== undefined;

  const brandStatus = calculateBrandLevel(
    displayedConnectionsCount,
    displayedCommunitiesCount,
    displayedAchievementsCount
  );

  const handleSelectCover = (url: string) => {
    sessionProfileStore.coverUrl = url;
    setCoverUrl(url);
    setShowCoverModal(false);
    notificationService.playSentChime();
  };

  const handleSaveProfileMetrics = (next: ProfileMetricsOverride) => {
    sessionProfileStore.profileMetricsOverride = next;
    setProfileMetricsOverride(next);
    setMetricToast('Profile metrics updated');
    notificationService.playSentChime();
  };

  const handleResetProfileMetrics = () => {
    sessionProfileStore.profileMetricsOverride = {};
    setProfileMetricsOverride({});
    setMetricToast('Profile metrics reset to automatic');
  };

  const persistIdentity = (next: {
    workEmail: string;
    linkedinUrl: string;
    githubUrl: string;
    socialLinks: SocialProfileLink[];
  }) => {
    sessionProfileStore.workEmail = next.workEmail;
    sessionProfileStore.linkedinUrl = next.linkedinUrl;
    sessionProfileStore.githubUrl = next.githubUrl;
    sessionProfileStore.socialLinks = next.socialLinks;
    setWorkEmail(next.workEmail);
    setLinkedinUrl(next.linkedinUrl);
    setGithubUrl(next.githubUrl);
    setSocialLinks(next.socialLinks);
  };

  const handleSaveAchievements = (
    nextAchievements: AchievementItem[],
    nextMetrics: AchievementMetrics,
    options?: { silent?: boolean }
  ) => {
    const countChanged = nextAchievements.length !== achievements.length;
    sessionProfileStore.achievements = nextAchievements;
    sessionProfileStore.achievementMetrics = nextMetrics;
    setAchievements(nextAchievements);
    setAchievementMetrics(nextMetrics);
    if (countChanged && profileMetricsOverride.achievements !== undefined) {
      const updatedOverride: ProfileMetricsOverride = { ...profileMetricsOverride };
      delete updatedOverride.achievements;
      sessionProfileStore.profileMetricsOverride = updatedOverride;
      setProfileMetricsOverride(updatedOverride);
    }
    if (!options?.silent) {
      setMetricToast('Key achievements updated');
      notificationService.playSentChime();
    }
  };

  const handleToggleBiometrics = () => {
    const nextVal = !biometricsEnabled;
    setBiometricsEnabled(nextVal);
    biometricsService.setEnabled(nextVal);
  };

  const handleToggleSound = () => {
    const nextVal = notificationService.toggleSound();
    setSoundEnabled(nextVal);
  };

  const handleClearCache = () => {
    try {
      localStorage.removeItem('cronium_cached_messages');
      setCacheCleared(true);
      setTimeout(() => setCacheCleared(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleCopy = (text: string, label: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedField(label);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div
      data-tab-scroller="profile"
      className="flex flex-col flex-1 h-full min-h-0 bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-y-auto"
    >
      {/* Static Top Header - sits at top of page and scrolls off cleanly when scrolling past it */}
      <div className="shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800 shadow-2xs">
        <div className="px-5 py-3 max-w-lg mx-auto w-full flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-xs shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 dark:text-white font-display leading-tight truncate">
                Executive Profile
              </h1>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-tight truncate">
                Account &amp; Verified Credentials
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 text-[11px] font-bold shrink-0 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Verified Profile</span>
            </div>

            {/* Three-row menu vector button next to Verified Profile */}
            <button
              type="button"
              onClick={() => {
                setActiveSettingsSection(null);
                setShowSettingsMenu(true);
              }}
              className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200/90 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 transition-colors duration-150 active:scale-95 cursor-pointer shrink-0 shadow-2xs"
              title="Settings & Account Controls"
              aria-label="Open profile settings menu"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <line
                  x1="4"
                  y1="6.5"
                  x2="20"
                  y2="6.5"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <line
                  x1="4"
                  y1="12"
                  x2="20"
                  y2="12"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <line
                  x1="4"
                  y1="17.5"
                  x2="20"
                  y2="17.5"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="px-5 pt-4 pb-6 space-y-4 max-w-lg mx-auto w-full text-left">
        {/* Executive Profile Card */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden text-left relative transition-all">
          {/* Professional Cover Background Banner */}
          <div className="h-28 sm:h-32 bg-slate-900 relative overflow-hidden group">
            <img
              src={coverUrl}
              alt="Executive Profile Background"
              className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            />
            {/* Elegant gradient overlay for crisp contrast and executive presence */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-slate-950/20 pointer-events-none" />

            {/* Top Camera Action */}
            <div className="absolute right-3 top-3 flex items-center gap-2 z-10">
              <button
                onClick={() => setShowCoverModal(true)}
                className="px-2.5 py-1 rounded-full bg-slate-900/70 hover:bg-slate-900/95 text-white text-[11px] font-semibold backdrop-blur-md border border-white/25 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                title="Change professional background cover"
              >
                <Camera className="w-3.5 h-3.5 text-slate-200" />
                <span className="hidden sm:inline">Change Cover</span>
              </button>
            </div>
          </div>

          <div className="px-5 pb-5 pt-0 relative bg-white dark:bg-slate-900">
            {/* Avatar & Floating Status: positioned so the background banner stays from the half of the rounding photo to its top */}
            <div className="flex items-start justify-between">
              <div className="relative -mt-10 sm:-mt-11 z-10 shrink-0">
                <img
                  src={CURRENT_USER.avatar}
                  alt={userName}
                  className="w-20 h-20 sm:w-22 sm:h-22 rounded-full object-cover border-4 border-white dark:border-slate-900 shadow-lg ring-2 ring-slate-900/10 dark:ring-white/10"
                />
                <span
                  className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 shadow-xs"
                  title="Online & Verified on Cronium Mesh"
                />
              </div>

              <div className="flex items-center gap-2 pt-2.5 sm:pt-3">
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => {
                      if (inlineEditSnapshot) {
                        setUserName(inlineEditSnapshot.userName);
                        setUserTitle(inlineEditSnapshot.userTitle);
                        setUserBio(inlineEditSnapshot.userBio);
                        setUserOrganization(inlineEditSnapshot.userOrganization);
                        setWorkEmail(inlineEditSnapshot.workEmail);
                        setLinkedinUrl(inlineEditSnapshot.linkedinUrl);
                        setGithubUrl(inlineEditSnapshot.githubUrl);
                      }
                      setInlineEditSnapshot(null);
                      setIsEditing(false);
                    }}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={() => {
                    if (isEditing) {
                      sessionProfileStore.userName = userName;
                      sessionProfileStore.userTitle = userTitle;
                      sessionProfileStore.userBio = userBio;
                      sessionProfileStore.userOrganization = userOrganization;
                      persistIdentity({
                        workEmail: workEmail.trim() || DEFAULT_WORK_EMAIL,
                        linkedinUrl: formatDisplayUrl(linkedinUrl),
                        githubUrl: formatDisplayUrl(githubUrl),
                        socialLinks,
                      });
                      setInlineEditSnapshot(null);
                      setIsEditing(false);
                    } else {
                      setInlineEditSnapshot({
                        userName,
                        userTitle,
                        userBio,
                        userOrganization,
                        workEmail,
                        linkedinUrl,
                        githubUrl,
                      });
                      setIsEditing(true);
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                  <span>{isEditing ? 'Save Profile' : 'Edit'}</span>
                </button>
                <button
                  onClick={() => setShowQrModal(true)}
                  className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-2xs transition-colors cursor-pointer"
                  title="View Public QR Card"
                >
                  <QrCode className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Editable or Display Profile Info */}
            {isEditing ? (
              <div className="space-y-2 mb-4 animate-in fade-in duration-150">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full text-sm font-bold p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">
                    Executive Title
                  </label>
                  <input
                    type="text"
                    value={userTitle}
                    onChange={(e) => setUserTitle(e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">
                    Bio & Focus Area
                  </label>
                  <textarea
                    rows={2}
                    value={userBio}
                    onChange={(e) => setUserBio(e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white resize-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">
                    Organization
                  </label>
                  <input
                    type="text"
                    value={userOrganization}
                    onChange={(e) => setUserOrganization(e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">
                    Work Email
                  </label>
                  <input
                    type="email"
                    value={workEmail}
                    onChange={(e) => setWorkEmail(e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">
                      LinkedIn Handle
                    </label>
                    <input
                      type="text"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">
                      GitHub Handle
                    </label>
                    <input
                      type="text"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="pt-1 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEditIdentityModal(true)}
                    className="flex-1 py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>
                      Social &amp; Links{socialLinks.length > 0 ? ` (${socialLinks.length})` : ''}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingAchievementId(null);
                      setShowEditAchievementsModal(true);
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    <span>Edit Achievements</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-1 mb-4">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
                      {userName}
                    </h2>
                    <span
                      title={
                        userPlan === 'pro'
                          ? 'Gold badge verification active'
                          : userPlan === 'plus'
                          ? 'Green badge verification active'
                          : 'Cryptographically Verified Identity'
                      }
                    >
                      <CheckCircle2
                        className={`w-4 h-4 ${
                          userPlan === 'pro'
                            ? 'text-amber-500 dark:text-amber-400 fill-amber-100 dark:fill-amber-950/60'
                            : userPlan === 'plus'
                            ? 'text-emerald-600 dark:text-emerald-400 fill-emerald-100 dark:fill-emerald-950/60'
                            : 'text-indigo-600 dark:text-indigo-400 fill-indigo-100 dark:fill-indigo-950/60'
                        }`}
                      />
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-medium block mt-0.5">
                    @jennies
                  </span>
                </div>
                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 pt-0.5">
                  {userTitle}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                  {userBio}
                </p>

                {/* Concise organization name in pale font (not bold), without navigation bar wrapper */}
                {userOrganization && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-normal pt-1.5 leading-normal truncate">
                    {userOrganization}
                  </p>
                )}
              </div>
            )}

            {/* Executive Metrics Bar: Communities (Indigo), Connections (Emerald), Achievements (Amber) */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800/80 py-2.5 px-2.5">
              <div className="grid grid-cols-3 gap-2 text-center">
                <button
                  type="button"
                  onClick={() => setNetworkSheetTab('communities')}
                  className="group py-1.5 px-1 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/40 active:scale-95 transition-all cursor-pointer text-center"
                  title={`View ${displayedCommunitiesCount} joined communities`}
                >
                  <span className="block text-sm sm:text-base font-extrabold text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform font-display tabular-nums">
                    {displayedCommunitiesCount}
                  </span>
                  <span className="text-[10px] text-slate-900 dark:text-slate-100 font-semibold uppercase tracking-wider block">
                    Communities
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setNetworkSheetTab('connections')}
                  className="group py-1.5 px-1 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/40 active:scale-95 transition-all cursor-pointer text-center border-x border-slate-200/80 dark:border-slate-700"
                  title={`View ${displayedConnectionsCount.toLocaleString()} verified connections`}
                >
                  <span className="block text-sm sm:text-base font-extrabold text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform font-display tabular-nums">
                    {displayedConnectionsCount.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-900 dark:text-slate-100 font-semibold uppercase tracking-wider block">
                    Connections
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAllAchievements(true);
                    setTimeout(() => {
                      achievementsSectionRef.current?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                      });
                    }, 50);
                  }}
                  className="group py-1.5 px-1 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/40 active:scale-95 transition-all cursor-pointer text-center"
                  title={`Jump to ${displayedAchievementsCount} achievements below`}
                >
                  <span className="block text-sm sm:text-base font-extrabold text-amber-500 dark:text-amber-400 group-hover:scale-105 transition-transform font-display tabular-nums">
                    {displayedAchievementsCount}
                  </span>
                  <span className="text-[10px] text-slate-900 dark:text-slate-100 font-semibold uppercase tracking-wider block">
                    Achievements
                  </span>
                </button>
              </div>
            </div>

            {/* Interactive Metric Toast Feedback */}
            {metricToast && (
              <div className="mt-2 text-center animate-fadeIn">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md">
                  <Sparkles className="w-3 h-3 text-amber-400 dark:text-amber-500" />
                  <span>{metricToast}</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Boost impressions & profile viewers (Above Identity & Credentials) */}
        <button
          type="button"
          onClick={() => setShowImpressionsModal(true)}
          className="w-full p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-indigo-300 dark:hover:border-slate-700 transition-all flex items-center justify-between cursor-pointer group text-left"
          title="View profile impressions and visitors analytics"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Eye className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Boost impressions & profile viewers
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+340% (4,820 views)</span>
            </span>
          </div>
        </button>

        {/* Section 1: Professional Identity & Credentials */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider truncate">
                Identity &amp; Credentials
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowEditIdentityModal(true)}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:border-indigo-300 dark:hover:border-indigo-700 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors cursor-pointer active:scale-95 shrink-0"
              title="Edit Identity, Credentials & Social Links"
              aria-label="Edit Identity, Credentials and Social Links"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {/* Work Email */}
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2 min-w-0">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[11px] text-slate-400 block">Work Email</span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate block">
                    {workEmail}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 shrink-0">
                Verified
              </span>
            </div>

            {/* LinkedIn Profile */}
            {linkedinUrl && (
              <div className="flex items-center justify-between py-1 border-t border-slate-100 dark:border-slate-800 pt-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-xl bg-[#0A66C2]/10 flex items-center justify-center shrink-0">
                    <Linkedin className="w-4 h-4 text-[#0A66C2]" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] text-slate-400 block">LinkedIn Profile</span>
                    <a
                      href={normalizeExternalHref(linkedinUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 truncate block transition-colors"
                    >
                      {formatDisplayUrl(linkedinUrl)}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopy(normalizeExternalHref(linkedinUrl), 'linkedin')}
                    className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0 cursor-pointer"
                    title="Copy LinkedIn URL"
                  >
                    {copiedField === 'linkedin' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <a
                    href={normalizeExternalHref(linkedinUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0"
                    title="Open LinkedIn in new tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}

            {/* GitHub Profile */}
            {githubUrl && (
              <div className="flex items-center justify-between py-1 border-t border-slate-100 dark:border-slate-800 pt-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-xl bg-slate-900/10 dark:bg-white/10 flex items-center justify-center shrink-0">
                    <Github className="w-4 h-4 text-slate-900 dark:text-slate-100" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] text-slate-400 block">GitHub Profile</span>
                    <a
                      href={normalizeExternalHref(githubUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 truncate block transition-colors"
                    >
                      {formatDisplayUrl(githubUrl)}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopy(normalizeExternalHref(githubUrl), 'github')}
                    className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0 cursor-pointer"
                    title="Copy GitHub URL"
                  >
                    {copiedField === 'github' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <a
                    href={normalizeExternalHref(githubUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0"
                    title="Open GitHub in new tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}

            {/* User-Added Social Media & Other Links */}
            {socialLinks.map((link) => {
              const meta = getPlatformMeta(link.platform);
              const href = normalizeExternalHref(link.url);
              return (
                <div
                  key={link.id}
                  className="flex items-center justify-between py-1 border-t border-slate-100 dark:border-slate-800 pt-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-xl ${meta.bgClass} ${meta.colorClass} flex items-center justify-center shrink-0`}
                    >
                      <SocialPlatformIcon platform={link.platform} className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] text-slate-400 block truncate">
                        {link.label}
                      </span>
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 truncate block transition-colors"
                      >
                        {formatDisplayUrl(link.url)}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopy(href, link.id)}
                      className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0 cursor-pointer"
                      title={`Copy ${link.label} URL`}
                    >
                      {copiedField === link.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0"
                      title={`Open ${link.label} in new tab`}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gamification Dashboard (Located below Identity & Credentials to complete tasks and earn server slots) */}
        <GamificationDashboard />


        {/* Section: Achievements (Honors & Accomplishments) */}
        <div
          ref={achievementsSectionRef}
          id="achievements-section"
          className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_10px_rgba(15,23,42,0.03)] overflow-hidden scroll-mt-4"
        >
          {/* Card Header */}
          <div className="px-5 py-4 flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Trophy className="w-4 h-4" />
              </div>
              <h3 className="text-[15px] font-bold text-slate-900 dark:text-white truncate leading-tight">
                Key Achievements
              </h3>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingAchievementId(null);
                setShowEditAchievementsModal(true);
              }}
              className="p-2 -mr-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer active:scale-95 shrink-0"
              title="Edit Key Achievements"
              aria-label="Edit Key Achievements"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </div>

          {/* 3-Column Summary Metrics Strip */}
          <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-800 py-4 px-2 border-b border-slate-100 dark:border-slate-800 text-center">
            <div className="px-1">
              <span className="block text-[15px] font-bold text-amber-600 dark:text-amber-400 leading-tight">
                {achievementMetrics.honors}
              </span>
              <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Honors
              </span>
            </div>
            <div className="px-1">
              <span className="block text-[15px] font-bold text-slate-900 dark:text-white leading-tight tabular-nums">
                {achievementMetrics.patents}
              </span>
              <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Patents &amp; Papers
              </span>
            </div>
            <div className="px-1">
              <span className="block text-[15px] font-bold text-[#4F46E5] dark:text-indigo-400 leading-tight">
                {achievementMetrics.contributor}
              </span>
              <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Contributor
              </span>
            </div>
          </div>

          {/* Clean Hairline-Separated Honors List */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800 px-5">
            {(showAllAchievements ? achievements : achievements.slice(0, 2)).map((item, index) => (
              <button
                key={item.id || index}
                type="button"
                onClick={() => setSelectedAchievement(item)}
                className="w-full py-4 flex items-start gap-3.5 text-left transition-colors cursor-pointer group"
              >
                <div className="w-11 h-11 rounded-full bg-amber-50/90 dark:bg-amber-950/50 flex items-center justify-center shrink-0 text-lg mt-0.5">
                  {item.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug group-hover:text-[#4F46E5] dark:group-hover:text-indigo-400 transition-colors">
                      {item.title}
                    </h4>
                    <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0 tabular-nums pt-0.5">
                      {item.year.replace(/\s*–\s*/g, '–')}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-[#4F46E5] dark:text-indigo-400 truncate mt-0.5">
                    {item.organization}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 mt-1.5">
                    {item.description}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Expand / Collapse Footer */}
          {achievements.length > 2 && (
            <div className="border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowAllAchievements((prev) => !prev)}
                className="w-full py-3.5 px-4 flex items-center justify-center gap-1.5 text-xs font-semibold text-[#4F46E5] dark:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
              >
                {showAllAchievements ? (
                  <>
                    <span>Show less</span>
                    <ChevronUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>View all {achievements.length} honors</span>
                    <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Section: Posts by User below Key Achievements */}
        <UserPostsSection
          authorName={CURRENT_USER.name}
          posts={jenniesPosts}
          onOpenAllPosts={(postId) => {
            setTargetPostId(postId || null);
            setShowAllPostsScreen(true);
          }}
          onDeletePost={handleDeleteJenniesPost}
          onRepostPost={handleRepostJenniesPost}
        />
      </div>

      {/* Profile Settings Menu & Section Detail Modal */}
      {showSettingsMenu && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 flex items-end sm:items-center justify-center sm:p-4 animate-in fade-in duration-150"
          onClick={() => {
            setShowSettingsMenu(false);
            setActiveSettingsSection(null);
          }}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 max-h-[85dvh] flex flex-col overflow-hidden text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
              {activeSettingsSection === null ? (
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white font-display leading-tight">
                    Settings &amp; Controls
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    Select any section to view and manage details
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    type="button"
                    onClick={() => setActiveSettingsSection(null)}
                    className="p-1.5 -ml-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer active:scale-95 shrink-0"
                    title="Back to settings sections"
                    aria-label="Back to settings sections"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div className="min-w-0">
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white font-display leading-tight truncate">
                      {activeSettingsSection === 'security'
                        ? 'Security & Authentication'
                        : activeSettingsSection === 'devices'
                        ? 'Connected Devices'
                        : activeSettingsSection === 'vault'
                        ? 'Offline Mesh Vault'
                        : activeSettingsSection === 'notifications'
                        ? 'Notifications'
                        : 'Interface Appearance'}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {activeSettingsSection === 'security'
                        ? 'Passkeys, biometrics & session lock'
                        : activeSettingsSection === 'devices'
                        ? 'Synced hardware & multi-device mesh'
                        : activeSettingsSection === 'vault'
                        ? 'Encrypted offline cache & connectivity'
                        : activeSettingsSection === 'notifications'
                        ? 'Push alerts, channels & audio preferences'
                        : 'Light & dark workspace display theme'}
                    </p>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setShowSettingsMenu(false);
                  setActiveSettingsSection(null);
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                aria-label="Close settings menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 overflow-y-auto space-y-2.5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              {activeSettingsSection === null ? (
                <>
                  {/* 1. Security & Authentication */}
                  <button
                    type="button"
                    onClick={() => setActiveSettingsSection('security')}
                    className="w-full p-3.5 rounded-2xl bg-slate-50/80 hover:bg-indigo-50/60 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3 transition-colors duration-150 active:scale-[0.99] cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-800/70 flex items-center justify-center shrink-0">
                        <Lock className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
                          Security &amp; Authentication
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate mt-0.5">
                          {biometricsEnabled
                            ? 'Biometric Passkey active · Enclave protected'
                            : 'Passkey disabled · PIN unlock available'}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </button>

                  {/* 2. Connected Devices */}
                  <button
                    type="button"
                    onClick={() => setActiveSettingsSection('devices')}
                    className="w-full p-3.5 rounded-2xl bg-slate-50/80 hover:bg-indigo-50/60 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3 transition-colors duration-150 active:scale-[0.99] cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/70 dark:border-indigo-800/70 flex items-center justify-center shrink-0">
                        <Laptop className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
                          Connected Devices
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate mt-0.5">
                          MacBook Pro, iPhone 17 Pro, iPad Pro
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        3 Synced
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                    </div>
                  </button>

                  {/* 3. Offline Mesh Vault */}
                  <button
                    type="button"
                    onClick={() => setActiveSettingsSection('vault')}
                    className="w-full p-3.5 rounded-2xl bg-slate-50/80 hover:bg-indigo-50/60 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3 transition-colors duration-150 active:scale-[0.99] cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200/70 dark:border-sky-800/70 flex items-center justify-center shrink-0">
                        <Database className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
                          Offline Mesh Vault
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate mt-0.5">
                          {isOfflineMode ? 'Simulate Offline' : 'Online Mode'} · 32.4 MB local cache
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </button>

                  {/* 4. Notifications */}
                  <button
                    type="button"
                    onClick={() => setActiveSettingsSection('notifications')}
                    className="w-full p-3.5 rounded-2xl bg-slate-50/80 hover:bg-indigo-50/60 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3 transition-colors duration-150 active:scale-[0.99] cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 border border-violet-200/70 dark:border-violet-800/70 flex items-center justify-center shrink-0">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
                          Notifications
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate mt-0.5">
                          {soundEnabled
                            ? 'Push alerts & notification audio active'
                            : 'Push alerts active · Audio muted'}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </button>

                  {/* 5. Interface Appearance */}
                  <button
                    type="button"
                    onClick={() => setActiveSettingsSection('appearance')}
                    className="w-full p-3.5 rounded-2xl bg-slate-50/80 hover:bg-indigo-50/60 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3 transition-colors duration-150 active:scale-[0.99] cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-indigo-950/60 text-amber-500 dark:text-indigo-400 border border-amber-200/70 dark:border-indigo-800/70 flex items-center justify-center shrink-0">
                        {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
                          Interface Appearance
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate mt-0.5">
                          {darkMode ? 'Dark Obsidian Theme' : 'Light Executive Theme (Default)'}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </button>
                </>
              ) : activeSettingsSection === 'security' ? (
                <div className="space-y-3">
                  {/* Biometric Login */}
                  <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Fingerprint className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-900 dark:text-white block">
                            Biometric Passkey Auth
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                            Touch ID &amp; Face ID secure enclave
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleToggleBiometrics}
                        className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer shrink-0 ${
                          biometricsEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                        aria-label="Toggle Biometric Passkey Auth"
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                            biometricsEnabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-3 border-t border-slate-200/70 dark:border-slate-700/70 pt-3">
                      <div className="text-xs text-slate-600 dark:text-slate-300 min-w-0">
                        <span className="font-semibold block text-slate-900 dark:text-white">
                          Lock Session Immediately
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                          Requires Face ID or PIN to unlock
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setShowSettingsMenu(false);
                          setActiveSettingsSection(null);
                          onLockApp();
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs shrink-0"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Lock Now</span>
                      </button>
                    </div>
                  </div>

                  {/* Cryptographic Enclave Details */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2.5 text-xs">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Hardware Enclave Protection</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400">Passkey Status</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {biometricsEnabled ? 'Verified & Active' : 'Standby'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400">Cipher Suite</span>
                      <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                        X25519 · AES-256-GCM
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400">Session Policy</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        Zero-Log Forward Secrecy
                      </span>
                    </div>
                  </div>
                </div>
              ) : activeSettingsSection === 'devices' ? (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Active Mesh Hardware
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        3 Synced
                      </span>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-700/70 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Laptop className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                          <div className="min-w-0">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">
                              MacBook Pro 16&quot; (M3 Max)
                            </span>
                            <span className="text-[10.5px] text-slate-400 block truncate">
                              Verified Mesh Key · Desktop Relay
                            </span>
                          </div>
                        </div>
                        <span className="text-[11px] text-emerald-600 font-semibold shrink-0">
                          Active Now
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-700/70 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Smartphone className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                          <div className="min-w-0">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">
                              iPhone 17 Pro
                            </span>
                            <span className="text-[10.5px] text-slate-400 block truncate">
                              Primary Hardware Enclave · Biometrics Linked
                            </span>
                          </div>
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium shrink-0">
                          This Device
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-700/70 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Tablet className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                          <div className="min-w-0">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">
                              iPad Pro 13&quot;
                            </span>
                            <span className="text-[10.5px] text-slate-400 block truncate">
                              Encrypted Companion · Auto-Sync Enabled
                            </span>
                          </div>
                        </div>
                        <span className="text-[11px] text-slate-400 shrink-0">
                          Synced 10m ago
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setShowSettingsMenu(false);
                        setActiveSettingsSection(null);
                        onOpenDeviceSync();
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Manage Device Sync &amp; Passkeys</span>
                    </button>
                  </div>
                </div>
              ) : activeSettingsSection === 'vault' ? (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">
                          Mesh Connection Mode
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                          {isOfflineMode
                            ? 'Simulating offline local encrypted queue'
                            : 'Live peer relay synchronized in real time'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={onToggleOfflineMode}
                        className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                          isOfflineMode
                            ? 'bg-amber-500 text-white'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {isOfflineMode ? (
                          <WifiOff className="w-3.5 h-3.5" />
                        ) : (
                          <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                        )}
                        <span>{isOfflineMode ? 'Simulate Offline' : 'Online Mode'}</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-3 border-t border-slate-200/70 dark:border-slate-700/70 pt-3">
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">
                          Local Encrypted Cache
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                          {cacheCleared
                            ? '0.0 MB cached · Local vault refreshed'
                            : '32.4 MB encrypted messages in secure storage'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleClearCache}
                        className="px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-xl font-semibold flex items-center gap-1 transition-colors cursor-pointer border border-rose-200 dark:border-rose-900 shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{cacheCleared ? 'Cleared!' : 'Clear Cache'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Storage Breakdown */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2.5 text-xs">
                    <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-bold uppercase tracking-wider text-[11px]">
                      <Database className="w-4 h-4" />
                      <span>Vault Storage Breakdown</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400">Encrypted Messages</span>
                      <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                        {cacheCleared ? '0.0 MB' : '18.6 MB'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400">Cached Media Previews</span>
                      <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                        {cacheCleared ? '0.0 MB' : '11.2 MB'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400">Mesh Routing Keys</span>
                      <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                        {cacheCleared ? '0.0 MB' : '2.6 MB'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : activeSettingsSection === 'notifications' ? (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {soundEnabled ? (
                          <Volume2 className="w-5 h-5 text-violet-600 dark:text-violet-400 shrink-0" />
                        ) : (
                          <VolumeX className="w-5 h-5 text-slate-400 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-900 dark:text-white block">
                            Notification Audio
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                            {soundEnabled
                              ? 'Play audio tone on incoming alerts'
                              : 'Audio alerts currently muted'}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleToggleSound}
                        className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer shrink-0 ${
                          soundEnabled ? 'bg-violet-600' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                        aria-label="Toggle notification audio"
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                            soundEnabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={onTriggerTestPush}
                      className="w-full py-2.5 px-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>Simulate Incoming Push Notification</span>
                    </button>
                  </div>

                  {/* Notification Channels */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      Alert Categories
                    </span>

                    <div className="flex items-center justify-between py-1.5 border-t border-slate-100 dark:border-slate-800">
                      <div className="min-w-0 pr-2">
                        <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                          Direct Messages
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                          Encrypted 1-on-1 message alerts
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDmAlertsEnabled((v) => !v)}
                        className={`w-10 h-5.5 rounded-full transition-colors relative p-0.5 cursor-pointer shrink-0 ${
                          dmAlertsEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                        aria-label="Toggle Direct Messages notifications"
                      >
                        <div
                          className={`w-4.5 h-4.5 rounded-full bg-white shadow-xs transition-transform ${
                            dmAlertsEnabled ? 'translate-x-4.5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-1.5 border-t border-slate-100 dark:border-slate-800">
                      <div className="min-w-0 pr-2">
                        <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                          Community Mentions
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                          Replies &amp; highlights in joined servers
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCommunityAlertsEnabled((v) => !v)}
                        className={`w-10 h-5.5 rounded-full transition-colors relative p-0.5 cursor-pointer shrink-0 ${
                          communityAlertsEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                        aria-label="Toggle Community Mentions notifications"
                      >
                        <div
                          className={`w-4.5 h-4.5 rounded-full bg-white shadow-xs transition-transform ${
                            communityAlertsEnabled ? 'translate-x-4.5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-1.5 border-t border-slate-100 dark:border-slate-800">
                      <div className="min-w-0 pr-2">
                        <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                          Network Connections
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                          New verified connection requests
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setConnectionAlertsEnabled((v) => !v)}
                        className={`w-10 h-5.5 rounded-full transition-colors relative p-0.5 cursor-pointer shrink-0 ${
                          connectionAlertsEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                        aria-label="Toggle Network Connections notifications"
                      >
                        <div
                          className={`w-4.5 h-4.5 rounded-full bg-white shadow-xs transition-transform ${
                            connectionAlertsEnabled ? 'translate-x-4.5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Visual Theme Picker */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (darkMode) onToggleDarkMode();
                      }}
                      className={`p-3.5 rounded-2xl border text-left transition-colors cursor-pointer space-y-2 ${
                        !darkMode
                          ? 'bg-indigo-50/70 dark:bg-indigo-950/50 border-indigo-500 ring-2 ring-indigo-500/20'
                          : 'bg-slate-50/80 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                          <Sun className="w-4 h-4" />
                        </div>
                        {!darkMode && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">
                          Light Executive
                        </span>
                        <span className="text-[10.5px] text-slate-500 dark:text-slate-400 block">
                          Crisp high-contrast default
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (!darkMode) onToggleDarkMode();
                      }}
                      className={`p-3.5 rounded-2xl border text-left transition-colors cursor-pointer space-y-2 ${
                        darkMode
                          ? 'bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/20'
                          : 'bg-slate-50/80 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-xl bg-slate-900 text-indigo-400 flex items-center justify-center">
                          <Moon className="w-4 h-4" />
                        </div>
                        {darkMode && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">
                          Dark Obsidian
                        </span>
                        <span className="text-[10.5px] text-slate-500 dark:text-slate-400 block">
                          Low-glare night mode
                        </span>
                      </div>
                    </button>
                  </div>

                  {/* Quick Switch Bar */}
                  <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        Active Workspace Theme
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                        {darkMode ? 'Dark Obsidian Theme' : 'Light Executive Theme (Default)'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={onToggleDarkMode}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
                    >
                      {darkMode ? 'Switch to Light' : 'Switch to Dark'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Public Mesh QR Key Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-xs bg-white dark:bg-slate-900 rounded-3xl p-6 text-center shadow-2xl border border-slate-200 dark:border-slate-800 relative space-y-4">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute right-4 top-4 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
              <QrCode className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-display">
                Public Mesh Key
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Scan to verify Jennies Vance on Cronium
              </p>
            </div>

            {/* Simulated Clean SVG QR Code */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 flex justify-center">
              <svg width="140" height="140" viewBox="0 0 140 140" fill="none" className="text-slate-900 dark:text-white">
                <rect width="140" height="140" rx="8" fill="white" />
                {/* QR Finder 1 */}
                <rect x="14" y="14" width="36" height="36" rx="4" fill="currentColor" />
                <rect x="20" y="20" width="24" height="24" rx="2" fill="white" />
                <rect x="25" y="25" width="14" height="14" rx="2" fill="currentColor" />
                {/* QR Finder 2 */}
                <rect x="90" y="14" width="36" height="36" rx="4" fill="currentColor" />
                <rect x="96" y="20" width="24" height="24" rx="2" fill="white" />
                <rect x="101" y="25" width="14" height="14" rx="2" fill="currentColor" />
                {/* QR Finder 3 */}
                <rect x="14" y="90" width="36" height="36" rx="4" fill="currentColor" />
                <rect x="20" y="96" width="24" height="24" rx="2" fill="white" />
                <rect x="25" y="101" width="14" height="14" rx="2" fill="currentColor" />
                {/* Matrix dots */}
                <rect x="58" y="18" width="8" height="8" rx="2" fill="currentColor" />
                <rect x="72" y="18" width="8" height="8" rx="2" fill="currentColor" />
                <rect x="58" y="32" width="8" height="8" rx="2" fill="currentColor" />
                <rect x="58" y="60" width="22" height="8" rx="2" fill="currentColor" />
                <rect x="20" y="60" width="18" height="8" rx="2" fill="currentColor" />
                <rect x="90" y="60" width="16" height="8" rx="2" fill="currentColor" />
                <rect x="112" y="60" width="14" height="8" rx="2" fill="currentColor" />
                <rect x="58" y="74" width="8" height="18" rx="2" fill="currentColor" />
                <rect x="74" y="74" width="8" height="18" rx="2" fill="currentColor" />
                <rect x="90" y="74" width="36" height="8" rx="2" fill="currentColor" />
                <rect x="58" y="100" width="22" height="8" rx="2" fill="currentColor" />
                <rect x="90" y="94" width="16" height="16" rx="2" fill="currentColor" />
                <rect x="112" y="94" width="14" height="16" rx="2" fill="currentColor" />
                <rect x="58" y="116" width="68" height="8" rx="2" fill="currentColor" />
              </svg>
            </div>

            <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 break-all">
              0x7F9B · 48C2 · E390 · 812F
            </p>

            <button
              onClick={() => handleCopy('0x7F9B48C2E390812F', 'modalMesh')}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer"
            >
              {copiedField === 'modalMesh' ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Key Copied to Clipboard</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Public Key</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Premium & Quota Tier Modal */}
      <PremiumUnlockModal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        onUnlock={(plan) => {
          onUnlockPlan?.(plan || 'pro');
          setShowPlanModal(false);
        }}
        currentPlan={userPlan}
        initialPlanTab={planModalTargetTab}
      />

      {/* Professional Cover Background Selector Modal */}
      {showCoverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[28px] p-5 shadow-2xl border border-slate-200/80 dark:border-slate-800 text-left relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
                    Profile Cover Background
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Select a verified professional executive backdrop
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCoverModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-3 space-y-2.5 max-h-[60vh] overflow-y-auto">
              {CURATED_COVER_BACKGROUNDS.map((bg) => {
                const isSelected = coverUrl === bg.url;
                return (
                  <div
                    key={bg.id}
                    onClick={() => handleSelectCover(bg.url)}
                    className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 shadow-xs'
                        : 'border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <img
                      src={bg.url}
                      alt={bg.name}
                      className="w-16 h-12 rounded-xl object-cover shrink-0 shadow-2xs"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {bg.name}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                        {bg.tag}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setShowCoverModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Boost Impressions & Visitors Analytics Modal */}
      {showImpressionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200/80 dark:border-slate-800 text-left space-y-3.5">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
                    Profile Impressions
                  </h3>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {userPlan === 'free'
                      ? 'Upgrade to unlock full viewer insights'
                      : '+340% Impressions Boost Active'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowImpressionsModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Total Impressions</span>
                <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">4,820</span>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Growth Rate</span>
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">+340%</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  Recent Profile Viewers (Last 24h):
                </span>
                {userPlan === 'free' && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                    <Lock className="w-3 h-3" />
                    Blurred on Free
                  </span>
                )}
              </div>

              <div className="space-y-1.5 max-h-[210px] overflow-y-auto">
                {[
                  { name: 'Anna San', role: 'Staff ML Engineer', hint: 'AI Systems Research Lab', time: '12m ago', avatar: portraitAnnaSan },
                  { name: 'Dr. Hiroshi Tanaka', role: 'Quantum Cryptographer', hint: 'Quantum Mesh Group', time: '45m ago', avatar: portraitHiroshiTanaka },
                  { name: 'Elena Rostova', role: 'Robotics Systems Lead', hint: 'Autonomous Robotics Hub', time: '2h ago', avatar: portraitElenaRostova },
                  { name: 'Liam Chen', role: 'Founding Partner', hint: 'Venture & Frontier Tech', time: '4h ago', avatar: portraitLiamChen },
                ].map((visitor, i) => {
                  const isFree = userPlan === 'free';
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 shadow-2xs shrink-0">
                          <img
                            src={visitor.avatar}
                            alt={isFree ? 'Private profile visitor' : visitor.name}
                            className={`w-full h-full object-cover transition-all ${
                              isFree ? 'blur-[6px] scale-110 select-none pointer-events-none' : ''
                            }`}
                          />
                        </div>
                        <div className="min-w-0">
                          {isFree ? (
                            <>
                              <span className="text-xs font-semibold text-slate-900 dark:text-white block leading-tight">
                                Someone at {visitor.hint}
                              </span>
                              <span className="text-[10px] text-slate-400 block truncate">
                                <span className="blur-[3.5px] select-none mr-1">{visitor.name}</span>
                                · {visitor.role}
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="text-xs font-semibold text-slate-900 dark:text-white block leading-tight">
                                {visitor.name}
                              </span>
                              <span className="text-[10px] text-slate-400 block truncate">
                                {visitor.role}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium shrink-0 ml-2">
                        {visitor.time}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {userPlan === 'free' ? (
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowImpressionsModal(false);
                    setShowPlanModal(true);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/25 transition-all active:scale-[0.98] cursor-pointer"
                >
                  <Crown className="w-3.5 h-3.5" />
                  <span>Enjoy your first month for $0</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowImpressionsModal(false)}
                  className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowImpressionsModal(false)}
                className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}

      {/* Achievement Detail Modal */}
      {selectedAchievement && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedAchievement(null)}
        >
          <div
            className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200/80 dark:border-slate-800 text-left space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-800/80 flex items-center justify-center text-2xl shrink-0 shadow-2xs">
                  {selectedAchievement.icon}
                </div>
                <div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800 text-[10px] font-bold mb-1">
                    {selectedAchievement.badge}
                  </span>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
                    {selectedAchievement.title}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAchievement(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Issuing Organization</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 text-right max-w-[190px]">
                  {selectedAchievement.organization}
                </span>
              </div>
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Year &amp; Verification</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span>{selectedAchievement.year}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed">
                {selectedAchievement.description}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const targetId = selectedAchievement.id;
                  setSelectedAchievement(null);
                  setEditingAchievementId(targetId);
                  setShowEditAchievementsModal(true);
                }}
                className="flex-1 py-2.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/70 text-xs font-bold text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedAchievement(null)}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Identity & Social Links Modal */}
      <EditIdentityModal
        isOpen={showEditIdentityModal}
        onClose={() => setShowEditIdentityModal(false)}
        workEmail={workEmail}
        linkedinUrl={linkedinUrl}
        githubUrl={githubUrl}
        socialLinks={socialLinks}
        onSave={(data, options) => {
          persistIdentity(data);
          if (!options?.silent) {
            setMetricToast('Identity & links updated');
            notificationService.playSentChime();
          }
        }}
      />

      {/* Edit Key Achievements Modal */}
      <EditAchievementsModal
        isOpen={showEditAchievementsModal}
        onClose={() => {
          setShowEditAchievementsModal(false);
          setEditingAchievementId(null);
        }}
        achievements={achievements}
        metrics={achievementMetrics}
        initialEditId={editingAchievementId}
        onSave={handleSaveAchievements}
      />

      {/* Dedicated All Posts Screen for Author */}
      {showAllPostsScreen && (
        <UserPostsScreen
          user={{
            id: CURRENT_USER.id,
            name: CURRENT_USER.name,
            avatar: CURRENT_USER.avatar,
            headline: CURRENT_USER.customStatus,
            username: '@jennies',
            organization: userOrganization,
          }}
          posts={jenniesPosts}
          isOpen={showAllPostsScreen}
          onClose={() => {
            setShowAllPostsScreen(false);
            setTargetPostId(null);
          }}
          targetPostId={targetPostId}
          onDeletePost={handleDeleteJenniesPost}
          onRepostPost={handleRepostJenniesPost}
        />
      )}
      {/* Communities & Connections Viewer for Jennies Vance */}
      {networkSheetTab && (
        <ProfileNetworkSheet
          isOpen={!!networkSheetTab}
          onClose={() => setNetworkSheetTab(null)}
          initialTab={networkSheetTab}
          profileName={userName}
          profileId={CURRENT_USER.id}
          communitiesCount={displayedCommunitiesCount}
          connectionsCount={displayedConnectionsCount}
          userPlan={userPlan}
          onUnlockPlan={onUnlockPlan}
          isOwnProfile
          ownCommunities={communities}
          onMessageUser={onStartDirectChatWithUser}
        />
      )}
    </div>
  );
};
