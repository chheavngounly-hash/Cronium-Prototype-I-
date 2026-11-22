import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  ArrowLeft,
  Users,
  CheckCircle2,
  Lock,
  ChevronRight,
  Crown,
  UserPlus,
  Check,
  Sparkles,
  Eye,
  EyeOff,
  ShieldCheck,
  MessageSquare,
} from 'lucide-react';
import { UserPlan, Community, User } from '../types';
import {
  aiNexusAvatar,
  cosmicOrbitalAvatar,
  bipedalRoboticsAvatar,
  quantumTopologyAvatar,
  gameEngineAvatar,
  alpineExplorersAvatar,
  analogSynthAvatar,
  creativeCanvasAvatar,
  ventureBuildersAvatar,
  roboticsServerAvatar,
  startupServerAvatar,
  researchServerAvatar,
  portraitAnnaSan,
  portraitAlexanderPatrick,
  portraitClassieWilley,
  portraitGeorgeAllan,
  portraitHiroshiTanaka,
  portraitElenaRostova,
  portraitMarcusVance,
  portraitPriyaPatel,
  portraitLiamChen,
  portraitAmaraOkafor,
  portraitAstridLindholm,
  portraitCamilleLaurent,
  portraitEvelynFoster,
  portraitMayaLin,
  portraitNadiaChernova,
  portraitZoeKim,
  portraitAntonZeilinger,
  portraitJasonZhao,
  portraitKaelenMiller,
  portraitKenjiTakahashi,
  portraitMalikWashington,
  portraitMateoSilva,
  portraitTariqAlmansoor,
} from '../data/mockData';
import { PremiumUnlockModal } from './PremiumUnlockModal';

interface ProfileNetworkSheetProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab: 'communities' | 'connections';
  profileName: string;
  profileId: string;
  communitiesCount: number;
  connectionsCount: number;
  userPlan?: UserPlan;
  onUnlockPlan?: (plan: UserPlan) => void;
  isOwnProfile?: boolean;
  ownCommunities?: Community[];
  onMessageUser?: (user: User) => void;
}

interface NetworkCommunityItem {
  id: string;
  name: string;
  avatar: string;
  category: string;
  membersLabel: string;
  status: string;
  isOnlineStatus: boolean;
  mutualLabel: string;
}

interface NetworkConnectionItem {
  id: string;
  name: string;
  avatar: string;
  headline: string;
  company: string;
  status: string;
  isOnline: boolean;
  mutualLabel: string;
  degree: '1st' | '2nd';
}

const NETWORK_COMMUNITIES_POOL: NetworkCommunityItem[] = [
  {
    id: 'nc_ai_nexus',
    name: 'AI & Machine Learning Hub',
    avatar: aiNexusAvatar,
    category: 'Artificial Intelligence · Systems',
    membersLabel: '14.8K members',
    status: 'Active · 412 online',
    isOnlineStatus: true,
    mutualLabel: '19 mutual connections',
  },
  {
    id: 'nc_quantum_topo',
    name: 'Quantum Systems Collective',
    avatar: quantumTopologyAvatar,
    category: 'Quantum Computing · Cryptography',
    membersLabel: '6.2K members',
    status: 'Verified · 184 online',
    isOnlineStatus: true,
    mutualLabel: '11 mutual connections',
  },
  {
    id: 'nc_robotics_guild',
    name: 'Autonomous Robotics Guild',
    avatar: bipedalRoboticsAvatar,
    category: 'Robotics · Edge Perception',
    membersLabel: '9.4K members',
    status: 'Active · 236 online',
    isOnlineStatus: true,
    mutualLabel: '14 mutual connections',
  },
  {
    id: 'nc_venture_builders',
    name: 'Founders & Venture Builders',
    avatar: ventureBuildersAvatar,
    category: 'Startups · Deep Tech Capital',
    membersLabel: '18.1K members',
    status: 'Host · Live Discussion',
    isOnlineStatus: true,
    mutualLabel: '27 mutual connections',
  },
  {
    id: 'nc_cosmic_orbital',
    name: 'Beyond Earth Explorers',
    avatar: cosmicOrbitalAvatar,
    category: 'Aerospace · Orbital Telemetry',
    membersLabel: '7.9K members',
    status: 'Active · 129 online',
    isOnlineStatus: true,
    mutualLabel: '9 mutual connections',
  },
  {
    id: 'nc_research_fellows',
    name: 'Frontier Research Fellows',
    avatar: researchServerAvatar,
    category: 'Peer Review · Open Science',
    membersLabel: '11.3K members',
    status: 'Core Member · Active',
    isOnlineStatus: true,
    mutualLabel: '16 mutual connections',
  },
  {
    id: 'nc_startup_founders',
    name: 'Zero-to-One Product Leaders',
    avatar: startupServerAvatar,
    category: 'Product Architecture · Scale',
    membersLabel: '12.6K members',
    status: 'Active · 205 online',
    isOnlineStatus: true,
    mutualLabel: '22 mutual connections',
  },
  {
    id: 'nc_creative_canvas',
    name: 'Spatial Design & HCI Lab',
    avatar: creativeCanvasAvatar,
    category: 'Interaction Design · Interfaces',
    membersLabel: '8.5K members',
    status: 'Verified · 98 online',
    isOnlineStatus: true,
    mutualLabel: '8 mutual connections',
  },
  {
    id: 'nc_analog_synth',
    name: 'Acoustic DSP & Audio Craft',
    avatar: analogSynthAvatar,
    category: 'Audio Engineering · Signal Lab',
    membersLabel: '5.1K members',
    status: 'Quiet · 42 online',
    isOnlineStatus: false,
    mutualLabel: '6 mutual connections',
  },
  {
    id: 'nc_game_engine',
    name: 'Real-Time Simulation Engines',
    avatar: gameEngineAvatar,
    category: 'Graphics · Physics Compute',
    membersLabel: '10.2K members',
    status: 'Active · 167 online',
    isOnlineStatus: true,
    mutualLabel: '13 mutual connections',
  },
  {
    id: 'nc_alpine_explorers',
    name: 'Executive Alpine & Trail Guild',
    avatar: alpineExplorersAvatar,
    category: 'Endurance · Outdoor Leadership',
    membersLabel: '4.7K members',
    status: 'Weekend Sync · 61 online',
    isOnlineStatus: false,
    mutualLabel: '5 mutual connections',
  },
  {
    id: 'nc_robotics_core',
    name: 'Hardware Enclave & Silicon Core',
    avatar: roboticsServerAvatar,
    category: 'Semiconductors · Security',
    membersLabel: '6.8K members',
    status: 'Verified · 115 online',
    isOnlineStatus: true,
    mutualLabel: '12 mutual connections',
  },
];

const NETWORK_CONNECTIONS_POOL: NetworkConnectionItem[] = [
  {
    id: 'conn_anna',
    name: 'Anna San',
    avatar: portraitAnnaSan,
    headline: 'Lead Architect @ Cerebras Systems • Wafer-Scale AI',
    company: 'Cerebras Systems',
    status: 'Online',
    isOnline: true,
    mutualLabel: '34 mutual connections',
    degree: '1st',
  },
  {
    id: 'conn_hiroshi',
    name: 'Dr. Hiroshi Tanaka',
    avatar: portraitHiroshiTanaka,
    headline: 'Principal Quantum Physicist & JAXA Fellow',
    company: 'JAXA Quantum Lab',
    status: 'Active now',
    isOnline: true,
    mutualLabel: '28 mutual connections',
    degree: '1st',
  },
  {
    id: 'conn_elena',
    name: 'Elena Rostova',
    avatar: portraitElenaRostova,
    headline: 'Neuromorphic Hardware Researcher • ETH Zurich Alum',
    company: 'Quantum Neuromorphic Lab',
    status: 'Online',
    isOnline: true,
    mutualLabel: '21 mutual connections',
    degree: '2nd',
  },
  {
    id: 'conn_alexander',
    name: 'Alexander Patrick',
    avatar: portraitAlexanderPatrick,
    headline: 'Staff Research Fellow @ Stanford AI & Robotics Lab',
    company: 'Stanford Robotics Lab',
    status: 'Verified · Online',
    isOnline: true,
    mutualLabel: '41 mutual connections',
    degree: '1st',
  },
  {
    id: 'conn_marcus',
    name: 'Dr. Marcus Vance',
    avatar: portraitMarcusVance,
    headline: 'Distributed Systems Fellow • Compiler Architect',
    company: 'Decentralized Protocol Core',
    status: 'Active 10m ago',
    isOnline: false,
    mutualLabel: '19 mutual connections',
    degree: '2nd',
  },
  {
    id: 'conn_priya',
    name: 'Priya Patel',
    avatar: portraitPriyaPatel,
    headline: 'CleanTech Microgrid Specialist • Energy Researcher',
    company: 'Global CleanTech Alliance',
    status: 'Online',
    isOnline: true,
    mutualLabel: '16 mutual connections',
    degree: '2nd',
  },
  {
    id: 'conn_liam',
    name: 'Liam Chen',
    avatar: portraitLiamChen,
    headline: 'Lead Engine Architect • Low-Latency Systems',
    company: 'Engine Labs',
    status: 'Active 4m ago',
    isOnline: true,
    mutualLabel: '25 mutual connections',
    degree: '1st',
  },
  {
    id: 'conn_classie',
    name: 'Classie Willey',
    avatar: portraitClassieWilley,
    headline: 'AI Product Lead • Workplace Culture Advocate',
    company: 'World Changers Mindset',
    status: 'Online',
    isOnline: true,
    mutualLabel: '18 mutual connections',
    degree: '2nd',
  },
  {
    id: 'conn_george',
    name: 'George Allan',
    avatar: portraitGeorgeAllan,
    headline: 'Senior Infrastructure Engineer @ TensorCloud',
    company: 'TensorCloud Infrastructure',
    status: 'Online · Open to collaborate',
    isOnline: true,
    mutualLabel: '15 mutual connections',
    degree: '2nd',
  },
  {
    id: 'conn_amara',
    name: 'Amara Okafor',
    avatar: portraitAmaraOkafor,
    headline: 'Bio-Computing Systems Researcher • Oxford Alum',
    company: 'Pan-African Genomics',
    status: 'Online',
    isOnline: true,
    mutualLabel: '23 mutual connections',
    degree: '2nd',
  },
  {
    id: 'conn_kenji',
    name: 'Kenji Takahashi',
    avatar: portraitKenjiTakahashi,
    headline: 'Aerospace Propulsion & Spacecraft Guidance Lead',
    company: 'Spacecraft Dynamics Core',
    status: 'Away',
    isOnline: false,
    mutualLabel: '12 mutual connections',
    degree: '2nd',
  },
  {
    id: 'conn_camille',
    name: 'Camille Laurent',
    avatar: portraitCamilleLaurent,
    headline: 'Spatial Audio DSP & Procedural Acoustics Researcher',
    company: 'Paris Audio Labs',
    status: 'Verified · Online',
    isOnline: true,
    mutualLabel: '14 mutual connections',
    degree: '2nd',
  },
  {
    id: 'conn_zoe',
    name: 'Zoe Kim',
    avatar: portraitZoeKim,
    headline: 'Design Systems Architect & HCI Research Lead',
    company: 'Interaction Science Institute',
    status: 'Online',
    isOnline: true,
    mutualLabel: '29 mutual connections',
    degree: '2nd',
  },
  {
    id: 'conn_tariq',
    name: 'Tariq Al-Mansoor',
    avatar: portraitTariqAlmansoor,
    headline: 'Smart Urban Grids & Autonomous Mobility Architect',
    company: 'Future Cities Core',
    status: 'Active 15m ago',
    isOnline: false,
    mutualLabel: '11 mutual connections',
    degree: '2nd',
  },
  {
    id: 'conn_astrid',
    name: 'Astrid Lindholm',
    avatar: portraitAstridLindholm,
    headline: 'Principal Cryptography Engineer • Nordic Mesh',
    company: 'Nordic Security Labs',
    status: 'Online',
    isOnline: true,
    mutualLabel: '17 mutual connections',
    degree: '2nd',
  },
  {
    id: 'conn_jason',
    name: 'Jason Zhao',
    avatar: portraitJasonZhao,
    headline: 'Staff ML Infrastructure Engineer • Edge Compute',
    company: 'HyperScale AI',
    status: 'Active now',
    isOnline: true,
    mutualLabel: '20 mutual connections',
    degree: '2nd',
  },
  {
    id: 'conn_maya',
    name: 'Maya Lin',
    avatar: portraitMayaLin,
    headline: 'Director of Robotics Perception & Sensor Fusion',
    company: 'Apex Autonomy',
    status: 'Online',
    isOnline: true,
    mutualLabel: '13 mutual connections',
    degree: '2nd',
  },
  {
    id: 'conn_kaelen',
    name: 'Kaelen Miller',
    avatar: portraitKaelenMiller,
    headline: 'Founding Partner • Frontier Hardware Ventures',
    company: 'Frontier Ventures',
    status: 'Away',
    isOnline: false,
    mutualLabel: '26 mutual connections',
    degree: '2nd',
  },
  {
    id: 'conn_evelyn',
    name: 'Evelyn Foster',
    avatar: portraitEvelynFoster,
    headline: 'VP of Systems Engineering • Sovereign Cloud',
    company: 'Sovereign Systems',
    status: 'Online',
    isOnline: true,
    mutualLabel: '19 mutual connections',
    degree: '2nd',
  },
  {
    id: 'conn_malik',
    name: 'Malik Washington',
    avatar: portraitMalikWashington,
    headline: 'Distributed Consensus & Zero-Knowledge Researcher',
    company: 'ZK Core Foundation',
    status: 'Active now',
    isOnline: true,
    mutualLabel: '22 mutual connections',
    degree: '2nd',
  },
  {
    id: 'conn_nadia',
    name: 'Nadia Chernova',
    avatar: portraitNadiaChernova,
    headline: 'Principal Photonic Computing Scientist',
    company: 'Optical Compute Lab',
    status: 'Online',
    isOnline: true,
    mutualLabel: '10 mutual connections',
    degree: '2nd',
  },
  {
    id: 'conn_mateo',
    name: 'Mateo Silva',
    avatar: portraitMateoSilva,
    headline: 'Lead Autonomous Flight Systems Engineer',
    company: 'AeroMesh Dynamics',
    status: 'Active 8m ago',
    isOnline: false,
    mutualLabel: '14 mutual connections',
    degree: '2nd',
  },
  {
    id: 'conn_anton',
    name: 'Dr. Anton Zeilinger',
    avatar: portraitAntonZeilinger,
    headline: 'Quantum Entanglement & Photonics Advisor',
    company: 'Vienna Quantum Institute',
    status: 'Verified · Online',
    isOnline: true,
    mutualLabel: '31 mutual connections',
    degree: '2nd',
  },
];

function computeHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Clear any legacy persisted privacy setting and keep session-only in-memory state
try {
  localStorage.removeItem('cronium_profile_privacy_v1');
} catch {
  // ignore
}

const sessionPrivacyStore: {
  hideCommunitiesEnabled: boolean;
  hideConnectionsEnabled: boolean;
  hiddenCommunityIds: string[];
  hiddenConnectionIds: string[];
} = {
  hideCommunitiesEnabled: false,
  hideConnectionsEnabled: false,
  hiddenCommunityIds: [],
  hiddenConnectionIds: [],
};

export const ProfileNetworkSheet: React.FC<ProfileNetworkSheetProps> = ({
  isOpen,
  onClose,
  initialTab,
  profileName,
  profileId,
  communitiesCount,
  connectionsCount,
  userPlan = 'free',
  onUnlockPlan,
  isOwnProfile = false,
  ownCommunities,
  onMessageUser,
}) => {
  const [activeTab, setActiveTab] = useState<'communities' | 'connections'>(initialTab);
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set());
  const [requestedCommunityIds, setRequestedCommunityIds] = useState<Set<string>>(new Set());
  const [offerPreview, setOfferPreview] = useState<{
    name: string;
    status: string;
    avatar: string;
    kind: 'community' | 'connection';
  } | null>(null);
  const [showSubscriptionsModal, setShowSubscriptionsModal] = useState(false);
  const [privacyOfferTab, setPrivacyOfferTab] = useState<'communities' | 'connections' | null>(null);
  const [pendingPrivacyToggle, setPendingPrivacyToggle] = useState<'communities' | 'connections' | null>(null);
  const [privacyPickerTab, setPrivacyPickerTab] = useState<'communities' | 'connections' | null>(null);
  const [pickerNotice, setPickerNotice] = useState<string | null>(null);
  const [privacySettings, setPrivacySettings] = useState<{
    hideCommunitiesEnabled: boolean;
    hideConnectionsEnabled: boolean;
    hiddenCommunityIds: string[];
    hiddenConnectionIds: string[];
  }>(() => ({
    hideCommunitiesEnabled: sessionPrivacyStore.hideCommunitiesEnabled,
    hideConnectionsEnabled: sessionPrivacyStore.hideConnectionsEnabled,
    hiddenCommunityIds: [...sessionPrivacyStore.hiddenCommunityIds],
    hiddenConnectionIds: [...sessionPrivacyStore.hiddenConnectionIds],
  }));

  const updatePrivacySettings = (next: {
    hideCommunitiesEnabled: boolean;
    hideConnectionsEnabled: boolean;
    hiddenCommunityIds: string[];
    hiddenConnectionIds: string[];
  }) => {
    sessionPrivacyStore.hideCommunitiesEnabled = next.hideCommunitiesEnabled;
    sessionPrivacyStore.hideConnectionsEnabled = next.hideConnectionsEnabled;
    sessionPrivacyStore.hiddenCommunityIds = [...next.hiddenCommunityIds];
    sessionPrivacyStore.hiddenConnectionIds = [...next.hiddenConnectionIds];
    setPrivacySettings(next);
  };

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setOfferPreview(null);
      setShowSubscriptionsModal(false);
      setPrivacyOfferTab(null);
      setPendingPrivacyToggle(null);
      setPrivacyPickerTab(null);
      setPickerNotice(null);
    }
  }, [isOpen, initialTab, profileId]);

  const hash = useMemo(() => computeHash(`${profileId}::${profileName}`), [profileId, profileName]);

  const communitiesList = useMemo<NetworkCommunityItem[]>(() => {
    if (isOwnProfile && ownCommunities) {
      return ownCommunities
        .filter((c) => c.joined)
        .map((c) => {
          const total = c.totalMembers || c.membersCount || 1200;
          const online = c.onlineCount || c.activeMembers || 48;
          const membersLabel =
            total >= 1000 ? `${(total / 1000).toFixed(1)}K members` : `${total} members`;
          return {
            id: c.id,
            name: c.name,
            avatar: c.avatar,
            category: c.category || c.tags?.slice(0, 2).join(' · ') || 'Verified Community',
            membersLabel,
            status: `Active · ${online} online`,
            isOnlineStatus: true,
            mutualLabel: 'Joined member',
          };
        });
    }

    const count = Math.max(6, Math.min(9, communitiesCount || 9));
    const offset = hash % NETWORK_COMMUNITIES_POOL.length;
    const rotated: NetworkCommunityItem[] = [];
    for (let i = 0; i < count; i++) {
      rotated.push(NETWORK_COMMUNITIES_POOL[(offset + i) % NETWORK_COMMUNITIES_POOL.length]);
    }
    return rotated;
  }, [isOwnProfile, ownCommunities, hash, communitiesCount]);

  const connectionsList = useMemo(() => {
    const normOwner = profileName.trim().toLowerCase();
    const eligible = NETWORK_CONNECTIONS_POOL.filter(
      (c) => c.name.trim().toLowerCase() !== normOwner
    );
    const count = 12;
    const offset = (hash * 3) % eligible.length;
    const rotated: NetworkConnectionItem[] = [];
    for (let i = 0; i < Math.min(count, eligible.length); i++) {
      rotated.push(eligible[(offset + i) % eligible.length]);
    }
    return rotated;
  }, [hash, profileName]);

  if (!isOpen) return null;

  const isFreePlan = userPlan === 'free';
  const communitiesBlurStart = Math.ceil((communitiesList.length * 2) / 3);
  const connectionsBlurStart = Math.ceil((connectionsList.length * 2) / 3);

  const toggleFollow = (id: string) => {
    setFollowedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleRequestCommunity = (id: string) => {
    setRequestedCommunityIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
        onClick={onClose}
      >
        <div
          className="w-full max-w-lg bg-[#F8FAFC] dark:bg-slate-950 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 max-h-[88dvh] flex flex-col overflow-hidden text-left"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 shrink-0">
            <div className="px-4 py-3.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-9 h-9 -ml-1 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  aria-label="Back to profile"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white font-display leading-tight truncate">
                    {profileName}
                  </h3>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                    {activeTab === 'communities'
                      ? `${communitiesCount} Verified Communities`
                      : `${connectionsCount.toLocaleString()} Network Connections`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                aria-label="Close network viewer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* LinkedIn-style Tab Switcher */}
            <div className="grid grid-cols-2 border-t border-slate-100 dark:border-slate-800/80">
              <button
                type="button"
                onClick={() => setActiveTab('communities')}
                className={`py-3 px-3 text-xs font-bold transition-colors relative cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'communities'
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <span>Communities</span>
                <span className="text-[11px] font-semibold tabular-nums text-slate-400 dark:text-slate-500">
                  ({communitiesCount})
                </span>
                {activeTab === 'communities' && (
                  <span className="absolute bottom-0 inset-x-6 h-0.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('connections')}
                className={`py-3 px-3 text-xs font-bold transition-colors relative cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'connections'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <span>Connections</span>
                <span className="text-[11px] font-semibold tabular-nums text-slate-400 dark:text-slate-500">
                  ({connectionsCount.toLocaleString()})
                </span>
                {activeTab === 'connections' && (
                  <span className="absolute bottom-0 inset-x-6 h-0.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                )}
              </button>
            </div>
          </div>

          {/* Scrollable LinkedIn-style List */}
          <div className="flex-1 overflow-y-auto px-4 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] flex flex-col">
            <div className="space-y-2.5 shrink-0">
            {activeTab === 'communities' ? (
              communitiesList.length === 0 ? (
                <div className="py-12 px-4 text-center space-y-1.5">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    No communities joined yet
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Join matched servers on Home to see your active communities here.
                  </p>
                </div>
              ) : (
                communitiesList.map((community, idx) => {
                  const isBlurred = !isOwnProfile && isFreePlan && idx >= communitiesBlurStart;
                  const isRequested = requestedCommunityIds.has(community.id);
                  const isHiddenFromOthers =
                    isOwnProfile &&
                    !isFreePlan &&
                    privacySettings.hideCommunitiesEnabled &&
                    privacySettings.hiddenCommunityIds.includes(community.id);

                  return (
                    <div
                      key={community.id}
                      onClick={() => {
                        if (isBlurred) {
                          setOfferPreview({
                            name: community.name,
                            status: community.status,
                            avatar: community.avatar,
                            kind: 'community',
                          });
                        }
                      }}
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
                        isHiddenFromOthers
                          ? 'bg-slate-50/90 dark:bg-slate-900/70 border-slate-200/90 dark:border-slate-800/90'
                          : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
                      } ${
                        isBlurred
                          ? 'cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700'
                          : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Community Avatar — blurred in bottom 1/3 */}
                        <button
                          type="button"
                          onClick={(e) => {
                            if (isBlurred) {
                              e.stopPropagation();
                              setOfferPreview({
                                name: community.name,
                                status: community.status,
                                avatar: community.avatar,
                                kind: 'community',
                              });
                            }
                          }}
                          className={`relative w-12 h-12 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 ${
                            isBlurred ? 'cursor-pointer group' : 'cursor-default'
                          }`}
                          aria-label={
                            isBlurred
                              ? `Unlock ${community.name} details`
                              : community.name
                          }
                        >
                          <img
                            src={community.avatar}
                            alt={community.name}
                            referrerPolicy="no-referrer"
                            className={`w-full h-full object-cover transition-transform ${
                              isBlurred
                                ? 'blur-[6px] scale-110 select-none'
                                : isHiddenFromOthers
                                ? 'opacity-65'
                                : ''
                            }`}
                          />
                          {isBlurred && (
                            <div className="absolute inset-0 bg-slate-950/25 flex items-center justify-center">
                              <Lock className="w-4 h-4 text-white drop-shadow-xs" />
                            </div>
                          )}
                          {isHiddenFromOthers && (
                            <div className="absolute inset-0 bg-slate-950/35 flex items-center justify-center">
                              <EyeOff className="w-4 h-4 text-white drop-shadow-xs" />
                            </div>
                          )}
                        </button>

                        {/* Details: Name, Status & Server Info ALWAYS visible and crisp */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white truncate">
                              {community.name}
                            </h4>
                            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                            {isHiddenFromOthers && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[9px] font-bold shrink-0">
                                <EyeOff className="w-2.5 h-2.5" />
                                Hidden
                              </span>
                            )}
                          </div>

                          {/* Status — ALWAYS visible and crisp */}
                          <p
                            className={`text-[11px] font-semibold mt-0.5 truncate ${
                              community.isOnlineStatus
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {community.status}
                          </p>

                          {/* Server Category & Member Count — ALWAYS visible and crisp */}
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                            <span className="truncate">{community.category}</span>
                            <span aria-hidden="true">·</span>
                            <span className="shrink-0 tabular-nums">{community.membersLabel}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Action */}
                      {isBlurred ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOfferPreview({
                              name: community.name,
                              status: community.status,
                              avatar: community.avatar,
                              kind: 'community',
                            });
                          }}
                          className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800 text-[11px] font-bold flex items-center gap-1 shrink-0 cursor-pointer transition-colors"
                        >
                          <Lock className="w-3 h-3" />
                          <span>Unlock</span>
                        </button>
                      ) : isOwnProfile ? (
                        <span className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold flex items-center gap-1 shrink-0">
                          <Check className="w-3 h-3" />
                          <span>Joined</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => toggleRequestCommunity(community.id)}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 shrink-0 cursor-pointer transition-colors ${
                            isRequested
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-700 dark:text-slate-200 hover:text-indigo-700 dark:hover:text-indigo-300 border border-slate-200/80 dark:border-slate-700'
                          }`}
                        >
                          {isRequested ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Requested</span>
                            </>
                          ) : (
                            <span>Request</span>
                          )}
                        </button>
                      )}
                    </div>
                  );
                })
              )
            ) : (
              connectionsList.map((person, idx) => {
                const isBlurred = !isOwnProfile && isFreePlan && idx >= connectionsBlurStart;
                const isFollowing = followedIds.has(person.id);
                const isHiddenFromOthers =
                  isOwnProfile &&
                  !isFreePlan &&
                  privacySettings.hideConnectionsEnabled &&
                  privacySettings.hiddenConnectionIds.includes(person.id);

                return (
                  <div
                    key={person.id}
                    onClick={() => {
                      if (isBlurred) {
                        setOfferPreview({
                          name: person.name,
                          status: person.status,
                          avatar: person.avatar,
                          kind: 'connection',
                        });
                      }
                    }}
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
                      isHiddenFromOthers
                        ? 'bg-slate-50/90 dark:bg-slate-900/70 border-slate-200/90 dark:border-slate-800/90'
                        : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
                    } ${
                      isBlurred
                        ? 'cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700'
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Portrait Image — blurred in bottom 1/3 */}
                      <button
                        type="button"
                        onClick={(e) => {
                          if (isBlurred) {
                            e.stopPropagation();
                            setOfferPreview({
                              name: person.name,
                              status: person.status,
                              avatar: person.avatar,
                              kind: 'connection',
                            });
                          }
                        }}
                        className={`relative w-12 h-12 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 ${
                          isBlurred ? 'cursor-pointer' : 'cursor-default'
                        }`}
                        aria-label={
                          isBlurred ? `Unlock ${person.name}'s profile` : person.name
                        }
                      >
                        <img
                          src={person.avatar}
                          alt={person.name}
                          referrerPolicy="no-referrer"
                          className={`w-full h-full object-cover ${
                            isBlurred
                              ? 'blur-[6px] scale-110 select-none'
                              : isHiddenFromOthers
                              ? 'opacity-65'
                              : ''
                          }`}
                        />
                        {isBlurred && (
                          <div className="absolute inset-0 bg-slate-950/25 flex items-center justify-center">
                            <Lock className="w-4 h-4 text-white drop-shadow-xs" />
                          </div>
                        )}
                        {isHiddenFromOthers && (
                          <div className="absolute inset-0 bg-slate-950/35 flex items-center justify-center">
                            <EyeOff className="w-4 h-4 text-white drop-shadow-xs" />
                          </div>
                        )}
                      </button>

                      {/* Details: Name, Online Status & Role/Headline ALWAYS visible and crisp */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white truncate">
                            {person.name}
                          </h4>
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                          <span className="text-[10px] font-medium text-slate-400 shrink-0">
                            · {person.degree}
                          </span>
                          {isHiddenFromOthers && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[9px] font-bold shrink-0">
                              <EyeOff className="w-2.5 h-2.5" />
                              Hidden
                            </span>
                          )}
                        </div>

                        {/* Status — ALWAYS visible and crisp */}
                        <p
                          className={`text-[11px] font-semibold mt-0.5 truncate ${
                            person.isOnline
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {person.status}
                        </p>

                        {/* Role / Professional Status — ALWAYS visible and crisp */}
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                          {person.headline}
                        </p>
                      </div>
                    </div>

                    {/* Right Action */}
                    {isBlurred ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOfferPreview({
                            name: person.name,
                            status: person.status,
                            avatar: person.avatar,
                            kind: 'connection',
                          });
                        }}
                        className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800 text-[11px] font-bold flex items-center gap-1 shrink-0 cursor-pointer transition-colors"
                      >
                        <Lock className="w-3 h-3" />
                        <span>Unlock</span>
                      </button>
                    ) : isOwnProfile ? (
                      <button
                        type="button"
                        onClick={() => {
                          const targetUser: User = {
                            id: person.id,
                            name: person.name,
                            avatar: person.avatar,
                            status: person.isOnline ? 'online' : 'away',
                            customStatus: person.headline,
                            bio: `${person.headline} · ${person.company}`,
                          };
                          onClose();
                          onMessageUser?.(targetUser);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-[11px] font-bold flex items-center gap-1.5 shrink-0 cursor-pointer transition-all shadow-xs active:scale-95"
                        title={`Message ${person.name}`}
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Message</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => toggleFollow(person.id)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 shrink-0 cursor-pointer transition-colors ${
                          isFollowing
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                        }`}
                      >
                        {isFollowing ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Following</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3 h-3" />
                            <span>Follow</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                );
              })
            )}
            </div>

            {/* Own Profile Privacy Control & "$0 this month" Subscription Bar — scrolls naturally at the bottom of the list */}
            {isOwnProfile && (
              <div className="mt-auto pt-4 space-y-2.5 shrink-0">
                {(() => {
                  const isCommTab = activeTab === 'communities';
                  const validHiddenCommIds = privacySettings.hiddenCommunityIds.filter((id) =>
                    communitiesList.some((c) => c.id === id)
                  );
                  const validHiddenConnIds = privacySettings.hiddenConnectionIds.filter((id) =>
                    connectionsList.some((p) => p.id === id)
                  );
                  const activeHiddenCount = isCommTab
                    ? privacySettings.hideCommunitiesEnabled
                      ? validHiddenCommIds.length
                      : 0
                    : privacySettings.hideConnectionsEnabled
                    ? validHiddenConnIds.length
                    : 0;
                  const isPrivacyActive =
                    !isFreePlan &&
                    (isCommTab
                      ? privacySettings.hideCommunitiesEnabled && validHiddenCommIds.length > 0
                      : privacySettings.hideConnectionsEnabled && validHiddenConnIds.length > 0);

                  const handleOpenSelectivePicker = () => {
                    if (isFreePlan) {
                      const tabKind = isCommTab ? 'communities' : 'connections';
                      setPendingPrivacyToggle(tabKind);
                      setPrivacyOfferTab(tabKind);
                      return;
                    }
                    setPickerNotice(null);
                    setPrivacyPickerTab(isCommTab ? 'communities' : 'connections');
                  };

                  const handleToggleSwitch = (e: React.MouseEvent) => {
                    e.stopPropagation();
                    if (isFreePlan) {
                      const tabKind = isCommTab ? 'communities' : 'connections';
                      setPendingPrivacyToggle(tabKind);
                      setPrivacyOfferTab(tabKind);
                      return;
                    }
                    if (isCommTab) {
                      if (privacySettings.hideCommunitiesEnabled && validHiddenCommIds.length > 0) {
                        updatePrivacySettings({
                          ...privacySettings,
                          hideCommunitiesEnabled: false,
                        });
                      } else if (validHiddenCommIds.length > 0) {
                        updatePrivacySettings({
                          ...privacySettings,
                          hideCommunitiesEnabled: true,
                        });
                      } else {
                        setPickerNotice(null);
                        setPrivacyPickerTab('communities');
                      }
                    } else {
                      if (privacySettings.hideConnectionsEnabled && validHiddenConnIds.length > 0) {
                        updatePrivacySettings({
                          ...privacySettings,
                          hideConnectionsEnabled: false,
                        });
                      } else if (validHiddenConnIds.length > 0) {
                        updatePrivacySettings({
                          ...privacySettings,
                          hideConnectionsEnabled: true,
                        });
                      } else {
                        setPickerNotice(null);
                        setPrivacyPickerTab('connections');
                      }
                    }
                  };

                  return (
                    <>
                      <div
                        onClick={handleOpenSelectivePicker}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleOpenSelectivePicker();
                          }
                        }}
                        className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 flex items-center justify-between gap-3 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                              isPrivacyActive
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                                : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                            }`}
                          >
                            <EyeOff className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {isCommTab ? 'Hide my communities' : 'Hide my connections'}
                              </span>
                              {isFreePlan ? (
                                <Lock className="w-3 h-3 text-amber-500 shrink-0" />
                              ) : isPrivacyActive ? (
                                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                                  · {activeHiddenCount} hidden
                                </span>
                              ) : null}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                              {isFreePlan
                                ? isCommTab
                                  ? 'Hide selected servers from others with a subscription'
                                  : 'Hide selected connections from others with a subscription'
                                : isPrivacyActive
                                ? isCommTab
                                  ? `${activeHiddenCount} selected server${activeHiddenCount === 1 ? '' : 's'} hidden · Tap to edit`
                                  : `${activeHiddenCount} selected connection${activeHiddenCount === 1 ? '' : 's'} hidden · Tap to edit`
                                : isCommTab
                                ? 'Tap to choose specific communities to hide'
                                : 'Tap to choose specific connections to hide'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {!isFreePlan && (
                            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60">
                              Select
                            </span>
                          )}
                          {/* Toggle Switch */}
                          <button
                            type="button"
                            onClick={handleToggleSwitch}
                            aria-label={isCommTab ? 'Toggle hide selected communities' : 'Toggle hide selected connections'}
                            className={`w-10 h-6 rounded-full p-0.5 transition-colors shrink-0 flex items-center cursor-pointer ${
                              isPrivacyActive
                                ? 'bg-emerald-500 justify-end'
                                : 'bg-slate-300 dark:bg-slate-700 justify-start'
                            }`}
                          >
                            <span className="w-5 h-5 rounded-full bg-white shadow-xs block" />
                          </button>
                        </div>
                      </div>

                      {/* Subscription Statement Bar: "Start for $0 this month" */}
                      {isFreePlan && (
                        <button
                          type="button"
                          onClick={() => {
                            setPendingPrivacyToggle(isCommTab ? 'communities' : 'connections');
                            setShowSubscriptionsModal(true);
                          }}
                          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-700 hover:via-violet-700 hover:to-purple-700 text-white shadow-md shadow-indigo-600/20 flex items-center justify-between gap-2 transition-all active:scale-[0.98] cursor-pointer group"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Crown className="w-4 h-4 text-amber-300 shrink-0" />
                            <span className="text-xs sm:text-[13px] font-extrabold tracking-tight truncate">
                              Start for $0 this month
                            </span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-white/90 group-hover:translate-x-0.5 transition-transform shrink-0" />
                        </button>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* First Month Free ($0) Interface triggered when clicking blurred items */}
      {offerPreview && !showSubscriptionsModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setOfferPreview(null)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  type="button"
                  onClick={() => setOfferPreview(null)}
                  className="w-9 h-9 -ml-1 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  aria-label="Back to list"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="min-w-0">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white font-display truncate">
                    Unlock Full Network Access
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    Complimentary introductory access
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOfferPreview(null)}
                className="w-9 h-9 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                aria-label="Close offer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
              {/* Locked Preview Context */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-3">
                <div
                  className={`relative w-12 h-12 overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 ${
                    offerPreview.kind === 'community' ? 'rounded-2xl' : 'rounded-full'
                  }`}
                >
                  <img
                    src={offerPreview.avatar}
                    alt={offerPreview.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover blur-[5px] scale-110"
                  />
                  <div className="absolute inset-0 bg-indigo-950/30 flex items-center justify-center">
                    <Lock className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white block truncate">
                    {offerPreview.name}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block truncate">
                    {offerPreview.status}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    Full {offerPreview.kind === 'community' ? 'community details' : 'connection profile'} available with membership
                  </span>
                </div>
              </div>

              {/* Hero Intro */}
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-amber-500 text-white flex items-center justify-center mx-auto shadow-md shadow-indigo-500/25">
                  <Crown className="w-6 h-6" />
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
                  See Every Community &amp; Connection
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                  Reveal hidden communities, mutual connections, and complete executive profiles across the Cronium network.
                </p>
              </div>

              {/* Clickable Statement Bar: "Your first month is on us — $0" -> loads Subscriptions */}
              <button
                type="button"
                onClick={() => setShowSubscriptionsModal(true)}
                className="w-full p-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-700 hover:via-violet-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-600/25 flex items-center justify-between gap-3 transition-transform active:scale-[0.98] cursor-pointer text-left group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm sm:text-[15px] font-extrabold tracking-tight block leading-snug">
                      Your first month is on us — $0
                    </span>
                    <span className="text-[11px] text-indigo-100 font-medium block mt-0.5">
                      Tap to compare subscription plans &amp; start free
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/90 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </button>

              {/* Concise Value Points */}
              <div className="space-y-2.5 pt-1 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>Unblur all communities &amp; connections on every profile</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Boost impressions and see who views your profile</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Cancel anytime before renewal · $0 due today</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOfferPreview(null)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selective Hide Picker Modal (Unlocked Subscribers: choose specific connections or communities to hide, never all) */}
      {isOwnProfile && !isFreePlan && privacyPickerTab && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[75] flex items-end sm:items-center justify-center sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setPrivacyPickerTab(null)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 max-h-[86dvh] flex flex-col overflow-hidden text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Picker Header */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <EyeOff className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white font-display truncate">
                    Select Who to Hide
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    Hide selected items only — at least 1 must stay visible
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPrivacyPickerTab(null)}
                className="w-9 h-9 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                aria-label="Close selective hide picker"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tab Switcher inside Selective Picker */}
            <div className="grid grid-cols-2 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
              <button
                type="button"
                onClick={() => {
                  setPickerNotice(null);
                  setPrivacyPickerTab('communities');
                }}
                className={`py-2.5 px-3 text-xs font-bold transition-colors relative cursor-pointer ${
                  privacyPickerTab === 'communities'
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Communities ({privacySettings.hiddenCommunityIds.filter((id) => communitiesList.some((c) => c.id === id)).length} hidden)
                {privacyPickerTab === 'communities' && (
                  <span className="absolute bottom-0 inset-x-6 h-0.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setPickerNotice(null);
                  setPrivacyPickerTab('connections');
                }}
                className={`py-2.5 px-3 text-xs font-bold transition-colors relative cursor-pointer ${
                  privacyPickerTab === 'connections'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Connections ({privacySettings.hiddenConnectionIds.filter((id) => connectionsList.some((p) => p.id === id)).length} hidden)
                {privacyPickerTab === 'connections' && (
                  <span className="absolute bottom-0 inset-x-6 h-0.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                )}
              </button>
            </div>

            {/* Notice / Rule Banner */}
            <div className="px-4 pt-3 shrink-0">
              {pickerNotice ? (
                <div className="px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/80 text-[11px] font-semibold text-amber-800 dark:text-amber-300">
                  {pickerNotice}
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {privacyPickerTab === 'communities'
                    ? `Choose specific servers to hide from other profiles (max ${Math.max(0, communitiesList.length - 1)} of ${communitiesList.length}).`
                    : `Choose specific connections to hide from other profiles (max ${Math.max(0, connectionsList.length - 1)} of ${connectionsList.length}).`}
                </p>
              )}
            </div>

            {/* Scrollable Selectable Items */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
              {privacyPickerTab === 'communities' ? (
                communitiesList.length <= 1 ? (
                  <div className="py-8 px-4 text-center space-y-1.5">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      {communitiesList.length === 0
                        ? 'No communities joined yet'
                        : 'At least 1 community must stay visible'}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {communitiesList.length === 0
                        ? 'Join servers on Home first to manage community visibility.'
                        : 'Join at least 2 communities to hide selected servers without hiding all of them.'}
                    </p>
                  </div>
                ) : (
                  communitiesList.map((community) => {
                    const currentHidden = privacySettings.hiddenCommunityIds.filter((id) =>
                      communitiesList.some((c) => c.id === id)
                    );
                    const isSelectedHidden = currentHidden.includes(community.id);
                    const maxHidden = Math.max(0, communitiesList.length - 1);
                    const atLimit = !isSelectedHidden && currentHidden.length >= maxHidden;

                    const toggleCommunityHide = () => {
                      if (isSelectedHidden) {
                        setPickerNotice(null);
                        const nextIds = currentHidden.filter((id) => id !== community.id);
                        updatePrivacySettings({
                          ...privacySettings,
                          hiddenCommunityIds: nextIds,
                          hideCommunitiesEnabled: nextIds.length > 0,
                        });
                      } else if (atLimit) {
                        setPickerNotice(
                          'At least 1 community must remain visible to others — you cannot hide all of them.'
                        );
                      } else {
                        setPickerNotice(null);
                        const nextIds = [...currentHidden, community.id];
                        updatePrivacySettings({
                          ...privacySettings,
                          hiddenCommunityIds: nextIds,
                          hideCommunitiesEnabled: true,
                        });
                      }
                    };

                    return (
                      <button
                        key={community.id}
                        type="button"
                        onClick={toggleCommunityHide}
                        className={`w-full p-2.5 rounded-2xl border flex items-center justify-between gap-3 text-left transition-colors cursor-pointer ${
                          isSelectedHidden
                            ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700'
                            : atLimit
                            ? 'bg-slate-50/70 dark:bg-slate-900/50 border-slate-200/70 dark:border-slate-800 opacity-75'
                            : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <img
                            src={community.avatar}
                            alt={community.name}
                            referrerPolicy="no-referrer"
                            className={`w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 ${
                              isSelectedHidden ? 'opacity-65' : ''
                            }`}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {community.name}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              {community.category} · {community.membersLabel}
                            </p>
                          </div>
                        </div>

                        <div
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 shrink-0 ${
                            isSelectedHidden
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {isSelectedHidden ? (
                            <>
                              <EyeOff className="w-3 h-3" />
                              <span>Hidden</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3 h-3" />
                              <span>Visible</span>
                            </>
                          )}
                        </div>
                      </button>
                    );
                  })
                )
              ) : (
                connectionsList.map((person) => {
                  const currentHidden = privacySettings.hiddenConnectionIds.filter((id) =>
                    connectionsList.some((p) => p.id === id)
                  );
                  const isSelectedHidden = currentHidden.includes(person.id);
                  const maxHidden = Math.max(0, connectionsList.length - 1);
                  const atLimit = !isSelectedHidden && currentHidden.length >= maxHidden;

                  const toggleConnectionHide = () => {
                    if (isSelectedHidden) {
                      setPickerNotice(null);
                      const nextIds = currentHidden.filter((id) => id !== person.id);
                      updatePrivacySettings({
                        ...privacySettings,
                        hiddenConnectionIds: nextIds,
                        hideConnectionsEnabled: nextIds.length > 0,
                      });
                    } else if (atLimit) {
                      setPickerNotice(
                        'At least 1 connection must remain visible to others — you cannot hide everyone.'
                      );
                    } else {
                      setPickerNotice(null);
                      const nextIds = [...currentHidden, person.id];
                      updatePrivacySettings({
                        ...privacySettings,
                        hiddenConnectionIds: nextIds,
                        hideConnectionsEnabled: true,
                      });
                    }
                  };

                  return (
                    <button
                      key={person.id}
                      type="button"
                      onClick={toggleConnectionHide}
                      className={`w-full p-2.5 rounded-2xl border flex items-center justify-between gap-3 text-left transition-colors cursor-pointer ${
                        isSelectedHidden
                          ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700'
                          : atLimit
                          ? 'bg-slate-50/70 dark:bg-slate-900/50 border-slate-200/70 dark:border-slate-800 opacity-75'
                          : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <img
                          src={person.avatar}
                          alt={person.name}
                          referrerPolicy="no-referrer"
                          className={`w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0 ${
                            isSelectedHidden ? 'opacity-65' : ''
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {person.name}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {person.headline}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 shrink-0 ${
                          isSelectedHidden
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {isSelectedHidden ? (
                          <>
                            <EyeOff className="w-3 h-3" />
                            <span>Hidden</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3 h-3" />
                            <span>Visible</span>
                          </>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Picker Footer */}
            <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2 shrink-0 pb-[max(0.875rem,env(safe-area-inset-bottom))]">
              <button
                type="button"
                onClick={() => {
                  setPickerNotice(null);
                  if (privacyPickerTab === 'communities') {
                    updatePrivacySettings({
                      ...privacySettings,
                      hiddenCommunityIds: [],
                      hideCommunitiesEnabled: false,
                    });
                  } else {
                    updatePrivacySettings({
                      ...privacySettings,
                      hiddenConnectionIds: [],
                      hideConnectionsEnabled: false,
                    });
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              >
                Show All
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab(privacyPickerTab);
                  setPrivacyPickerTab(null);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer active:scale-[0.98]"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Done</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Subscribe Interface triggered when clicking Hide my connections / communities on Free Plan */}
      {privacyOfferTab && !showSubscriptionsModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={privacyOfferTab === 'connections' ? 'Hide my connections subscription' : 'Hide my communities subscription'}
          className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setPrivacyOfferTab(null)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden text-left animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  type="button"
                  onClick={() => setPrivacyOfferTab(null)}
                  className="w-9 h-9 -ml-1 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  aria-label="Back"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="min-w-0">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white font-display truncate">
                    {privacyOfferTab === 'connections' ? 'Hide My Connections' : 'Hide My Communities'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    Subscriber privacy control
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPrivacyOfferTab(null)}
                className="w-9 h-9 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
              {/* Hero Icon & Subscribe Message */}
              <div className="text-center space-y-2.5 pt-1">
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/25">
                  <EyeOff className="w-6 h-6" />
                  <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-xs">
                    <Lock className="w-3 h-3 stroke-[2.5]" />
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
                  {privacyOfferTab === 'connections'
                    ? 'Subscribe to Hide Your Connections'
                    : 'Subscribe to Hide Your Communities'}
                </h2>
                <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                  {privacyOfferTab === 'connections'
                    ? 'Control who can see your network. Subscribe to selectively hide specific connections from other profile visitors.'
                    : 'Control which servers appear on your profile. Subscribe to selectively hide specific communities from others.'}
                </p>
              </div>

              {/* Key Privacy Benefits */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2.5">
                  <EyeOff className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>
                    {privacyOfferTab === 'connections'
                      ? 'Hide selected connections while keeping your profile active'
                      : 'Hide selected servers while staying active in every channel'}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Toggle privacy on or off anytime with instant updates</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Crown className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Includes full access to all Cronium subscriber perks</span>
                </div>
              </div>

              {/* Clickable CTA Bar: "Try it free for one month" -> opens Subscription Plans */}
              <button
                type="button"
                onClick={() => setShowSubscriptionsModal(true)}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-700 hover:via-violet-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-600/25 flex items-center justify-between gap-3 transition-all active:scale-[0.98] cursor-pointer text-left group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm sm:text-[15px] font-extrabold tracking-tight block leading-snug">
                      Try it free for one month
                    </span>
                    <span className="text-[11px] text-indigo-100 font-medium block mt-0.5">
                      Tap to view subscription plans · Cancel anytime
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/90 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => setPrivacyOfferTab(null)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vertical Subscription Plans Modal (exact same modal as Unlock More / Upgrade) */}
      <PremiumUnlockModal
        isOpen={showSubscriptionsModal}
        onClose={() => {
          setShowSubscriptionsModal(false);
          setPrivacyOfferTab(null);
          setOfferPreview(null);
          setPendingPrivacyToggle(null);
        }}
        onUnlock={(plan) => {
          const targetPicker = pendingPrivacyToggle;
          if (plan) {
            onUnlockPlan?.(plan);
            if (plan !== 'free' && targetPicker) {
              setPickerNotice(null);
              setPrivacyPickerTab(targetPicker);
            }
          }
          setShowSubscriptionsModal(false);
          setPrivacyOfferTab(null);
          setOfferPreview(null);
          setPendingPrivacyToggle(null);
        }}
        currentPlan={userPlan}
        zIndexClassName="z-[80]"
      />
    </>
  );
};
