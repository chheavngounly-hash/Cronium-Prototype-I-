import React, { useState, useMemo, useRef } from 'react';
import {
  X,
  ArrowLeft,
  CheckCircle2,
  MessageSquare,
  Mail,
  Building2,
  Trophy,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  UserPlus,
  ShieldCheck,
} from 'lucide-react';
import { UserProfile, UserPlan } from '../types';
import { getUserPosts } from '../data/userPostsData';
import { UserPostsSection } from './UserPostsSection';
import { UserPostsScreen } from './UserPostsScreen';
import { ProfileNetworkSheet } from './ProfileNetworkSheet';

const LinkedinIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.79v8.37H6.46v-8.37M7.86 6.72a1.63 1.63 0 1 0 0 3.26 1.63 1.63 0 0 0 0-3.26Z" />
  </svg>
);

const GithubIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
  </svg>
);

interface ProfileModalProps {
  user: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenDirectMessage?: (user: UserProfile) => void;
  userPlan?: UserPlan;
  onUnlockPlan?: (plan: UserPlan) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  onOpenDirectMessage,
  userPlan = 'free',
  onUnlockPlan,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [showAllPostsScreen, setShowAllPostsScreen] = useState(false);
  const [targetPostId, setTargetPostId] = useState<string | null>(null);
  const [networkSheetTab, setNetworkSheetTab] = useState<'communities' | 'connections' | null>(null);
  const achievementsSectionRef = useRef<HTMLDivElement>(null);

  const authorPosts = useMemo(() => {
    if (!user) return [];
    return getUserPosts(user.id, user.name, user.avatar, user.specialization);
  }, [user?.id, user?.name, user?.avatar, user?.specialization]);

  if (!isOpen || !user) return null;

  const handleCopy = (field: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleMessageClick = () => {
    if (onOpenDirectMessage) {
      onOpenDirectMessage(user);
    }
    onClose();
  };

  const achievements = user.achievements || [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[92vh] bg-[#F8FAFC] dark:bg-slate-950 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col overflow-hidden text-slate-800 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overflow-y-auto flex-1 min-h-0">
          {/* Static Top Header */}
          <div className="shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800 shadow-2xs">
            <div className="px-4 py-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <button
                  onClick={onClose}
                  className="p-1.5 -ml-1 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                  title="Back"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-xs shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white font-display leading-tight truncate">
                    Executive Profile
                  </h2>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-tight truncate">
                    Account &amp; Verified Credentials
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 shadow-2xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Verified Profile</span>
                </span>
                <button
                  onClick={onClose}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-4 sm:p-5 space-y-4 text-left">
            {/* Hero Banner Card (Exact Jennies Vance structure) */}
            <div className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-sm">
              <div className="h-28 sm:h-32 w-full bg-slate-900 relative overflow-hidden group">
                <img
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80"
                  alt="Banner"
                  className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-slate-950/20 pointer-events-none" />
              </div>

              <div className="px-5 pb-5 pt-0 relative bg-white dark:bg-slate-900">
                <div className="flex items-start justify-between">
                  <div className="relative -mt-10 sm:-mt-11 z-10 shrink-0">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-20 h-20 sm:w-22 sm:h-22 rounded-full object-cover border-4 border-white dark:border-slate-900 shadow-lg ring-2 ring-slate-900/10 dark:ring-white/10"
                    />
                    <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 shadow-xs" />
                  </div>

                  <div className="flex items-center gap-2 pt-2.5 sm:pt-3">
                    <button
                      onClick={() => setIsFollowing((prev) => !prev)}
                      className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95 ${
                        isFollowing
                          ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                          : 'bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                      }`}
                    >
                      {isFollowing ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Following</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                          <span>Follow</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleMessageClick}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xs shadow-sm shadow-indigo-600/30 active:scale-95 transition-all cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Message</span>
                    </button>
                  </div>
                </div>

                {/* Names, Verified Tick, @handle below name, Headline, Bio, Org */}
                <div className="space-y-1 mt-2 mb-4">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-lg font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
                        {user.name}
                      </h3>
                      <span title="Cryptographically Verified Identity">
                        <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 fill-indigo-100 dark:fill-indigo-950/60" />
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-medium block mt-0.5">
                      @{(user.username || user.name.toLowerCase().replace(/[^a-z0-9]/g, '')).replace(/^@/, '')}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 pt-0.5">
                    {user.specialization}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                    {user.bio}
                  </p>
                  {user.company && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-normal pt-1.5 leading-normal truncate">
                      {user.company}
                    </p>
                  )}
                </div>

                {/* Metrics Bar */}
                <div className="grid grid-cols-3 gap-2 py-2 px-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800/80 text-center">
                  <button
                    type="button"
                    onClick={() => setNetworkSheetTab('communities')}
                    className="group py-2 px-1 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/40 active:scale-95 transition-all cursor-pointer text-center"
                    title={`View ${user.name}'s communities`}
                  >
                    <div className="text-sm sm:text-base font-extrabold text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform font-display tabular-nums">
                      {user.stats.communitiesCount ?? 8}
                    </div>
                    <div className="text-[10px] font-semibold tracking-wider text-slate-900 dark:text-slate-100 uppercase">
                      Communities
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNetworkSheetTab('connections')}
                    className="group py-2 px-1 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/40 active:scale-95 transition-all cursor-pointer text-center border-x border-slate-200/80 dark:border-slate-700"
                    title={`View ${user.name}'s connections`}
                  >
                    <div className="text-sm sm:text-base font-extrabold text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform font-display tabular-nums">
                      {user.stats.connectionsCount.toLocaleString()}
                    </div>
                    <div className="text-[10px] font-semibold tracking-wider text-slate-900 dark:text-slate-100 uppercase">
                      Connections
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsExpanded(true);
                      setTimeout(() => {
                        achievementsSectionRef.current?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'start',
                        });
                      }, 50);
                    }}
                    className="group py-2 px-1 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/40 active:scale-95 transition-all cursor-pointer text-center"
                    title={`Jump to ${user.name}'s achievements below`}
                  >
                    <div className="text-sm sm:text-base font-extrabold text-amber-500 dark:text-amber-400 group-hover:scale-105 transition-transform font-display tabular-nums">
                      {user.stats.achievementsCount || achievements.length || 5}
                    </div>
                    <div className="text-[10px] font-semibold tracking-wider text-slate-900 dark:text-slate-100 uppercase">
                      Achievements
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Identity & Credentials Card */}
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Identity &amp; Credentials
                </span>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[11px] text-slate-400 block">Work Email</span>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate block">
                        {user.workEmail}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 shrink-0">
                    Verified
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-t border-slate-100 dark:border-slate-800 pt-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-xl bg-[#0A66C2]/10 flex items-center justify-center shrink-0">
                      <LinkedinIcon className="w-4 h-4 text-[#0A66C2]" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] text-slate-400 block">LinkedIn Profile</span>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate block">
                        {user.linkedin}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleCopy('linkedin', user.linkedin || '')}
                      className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                      title="Copy"
                    >
                      {copiedField === 'linkedin' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <a
                      href={`https://${user.linkedin}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                <div className="flex items-center justify-between py-1 border-t border-slate-100 dark:border-slate-800 pt-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-xl bg-slate-900/10 dark:bg-white/10 flex items-center justify-center shrink-0">
                      <GithubIcon className="w-4 h-4 text-slate-900 dark:text-slate-100" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] text-slate-400 block">GitHub Profile</span>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate block">
                        {user.github}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleCopy('github', user.github || '')}
                      className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                      title="Copy"
                    >
                      {copiedField === 'github' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <a
                      href={`https://${user.github}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* KEY ACHIEVEMENTS */}
            {achievements.length > 0 && (
              <div
                ref={achievementsSectionRef}
                className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 scroll-mt-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Key Achievements
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/80">
                    {achievements.length} Key Honors
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2.5 px-2 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                  <div>
                    <span className="block text-sm font-extrabold text-amber-600 dark:text-amber-400 font-display">
                      {user.stats.honors}
                    </span>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                      Honors
                    </span>
                  </div>
                  <div className="border-x border-slate-200 dark:border-slate-700">
                    <span className="block text-sm font-extrabold text-slate-900 dark:text-white font-display">
                      {user.stats.patentsAndPapers}
                    </span>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                      Patents &amp; Papers
                    </span>
                  </div>
                  <div>
                    <span className="block text-sm font-extrabold text-indigo-600 dark:text-indigo-400 font-display">
                      {user.stats.contributorRank}
                    </span>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                      Contributor
                    </span>
                  </div>
                </div>

                <div
                  className={`space-y-2.5 pt-1 relative transition-all duration-300 ${
                    !isExpanded && achievements.length > 2 ? 'max-h-[260px] overflow-hidden' : ''
                  }`}
                >
                  {achievements.map((item, idx) => {
                    const isBlurred = !isExpanded && achievements.length > 2 && idx >= 2;
                    return (
                      <div
                        key={item.id || idx}
                        className={`p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-start justify-between gap-2 ${
                          isBlurred ? 'filter blur-[2px] opacity-60 pointer-events-none' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-2xs text-base">
                            {item.icon}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate">
                              {item.title}
                            </h4>
                            <p className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 truncate">
                              {item.organization}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">
                          {item.year}
                        </span>
                      </div>
                    );
                  })}

                  {!isExpanded && achievements.length > 2 && (
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white via-white/85 to-transparent dark:from-slate-900 dark:via-slate-900/85 flex items-end justify-center pb-1.5 pointer-events-none z-10">
                      <button
                        type="button"
                        onClick={() => setIsExpanded(true)}
                        className="pointer-events-auto px-4 py-2 rounded-full bg-indigo-50/95 dark:bg-indigo-950/90 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200/90 dark:border-indigo-800 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-500/10 cursor-pointer backdrop-blur-md"
                      >
                        <Trophy className="w-3.5 h-3.5 text-indigo-500" />
                        <span>View more</span>
                        <ChevronDown className="w-3.5 h-3.5 text-indigo-500" />
                      </button>
                    </div>
                  )}
                </div>

                {isExpanded && achievements.length > 2 && (
                  <div className="pt-2 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setIsExpanded(false)}
                      className="px-4 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/70 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>Show less</span>
                      <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Section: Posts for user below Key Achievements */}
            {authorPosts.length > 0 && (
              <UserPostsSection
                authorName={user.name}
                posts={authorPosts}
                onOpenAllPosts={(postId) => {
                  setTargetPostId(postId || null);
                  setShowAllPostsScreen(true);
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Dedicated All Posts Screen for Author */}
      {showAllPostsScreen && (
        <UserPostsScreen
          user={{
            id: user.id,
            name: user.name,
            avatar: user.avatar,
            headline: user.specialization,
            username: user.username,
            organization: user.company,
          }}
          posts={authorPosts}
          isOpen={showAllPostsScreen}
          onClose={() => {
            setShowAllPostsScreen(false);
            setTargetPostId(null);
          }}
          targetPostId={targetPostId}
        />
      )}
      {networkSheetTab && (
        <ProfileNetworkSheet
          isOpen={!!networkSheetTab}
          onClose={() => setNetworkSheetTab(null)}
          initialTab={networkSheetTab}
          profileName={user.name}
          profileId={user.id}
          communitiesCount={user.stats.communitiesCount ?? 8}
          connectionsCount={user.stats.connectionsCount}
          userPlan={userPlan}
          onUnlockPlan={onUnlockPlan}
        />
      )}
    </div>
  );
};
