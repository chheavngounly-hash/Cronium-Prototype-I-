import React, { useState, useEffect, useMemo, useRef } from 'react';
import { getUserPosts } from '../data/userPostsData';
import { UserPostsSection } from './UserPostsSection';
import { UserPostsScreen } from './UserPostsScreen';
import {
  X,
  MessageSquare,
  Building2,
  Linkedin,
  Github,
  ExternalLink,
  Check,
  Copy,
  CheckCircle2,
  ShieldCheck,
  UserPlus,
  Mail,
  ArrowLeft,
  Trophy,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ServerMember, UserPlan } from '../types';
import { notificationService } from '../services/notifications';
import { getMemberProfile } from '../data/mockMemberProfiles';
import { ProfileNetworkSheet } from './ProfileNetworkSheet';

interface MemberProfileModalProps {
  member: ServerMember | null;
  serverName: string;
  onClose: () => void;
  onDirectMessage: (member: ServerMember) => void;
  isConnected?: boolean;
  onConnect?: (member: ServerMember) => void;
  userPlan?: UserPlan;
  onUnlockPlan?: (plan: UserPlan) => void;
}

export const MemberProfileModal: React.FC<MemberProfileModalProps> = ({
  member,
  onClose,
  onDirectMessage,
  isConnected = false,
  onConnect,
  userPlan = 'free',
  onUnlockPlan,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [networkSheetTab, setNetworkSheetTab] = useState<'communities' | 'connections' | null>(null);
  const [showAllAchievements, setShowAllAchievements] = useState(false);
  const achievementsSectionRef = useRef<HTMLDivElement>(null);
  const [selectedAchievement, setSelectedAchievement] = useState<{
    icon: string;
    title: string;
    org: string;
    year: string;
  } | null>(null);
  const [isFollowing, setIsFollowing] = useState(isConnected);
  const [showAllPostsScreen, setShowAllPostsScreen] = useState(false);
  const [targetPostId, setTargetPostId] = useState<string | null>(null);

  useEffect(() => {
    setIsFollowing(isConnected);
  }, [isConnected, member?.id]);

  const handleToggleFollow = () => {
    setIsFollowing((prev) => !prev);
    if (onConnect && member) {
      onConnect(member);
    }
  };

  const authorPosts = useMemo(() => {
    if (!member) return [];
    return getUserPosts(member.id, member.name, member.avatar, member.headline);
  }, [member?.id, member?.name, member?.avatar, member?.headline]);

  useEffect(() => {
    setShowAllAchievements(false);
    setSelectedAchievement(null);
    setShowAllPostsScreen(false);
    setTargetPostId(null);
    setNetworkSheetTab(null);
  }, [member?.id]);

  if (!member) return null;

  const profile = getMemberProfile(member.id, member.name, member.avatar, member.headline);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    notificationService.playSentChime();
    setTimeout(() => setCopiedField(null), 2000);
  };

  const linkedinHandle =
    profile.linkedinUrl || `linkedin.com/in/${profile.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  const githubHandle = profile.githubUrl || `github.com/${profile.username.replace('@', '')}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#F8FAFC] dark:bg-slate-950 rounded-3xl shadow-2xl overflow-hidden border border-slate-200/90 dark:border-slate-800 max-h-[92vh] flex flex-col text-left animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Scrollable Container including Static Top Header (scrolls off naturally just like ProfileScreen) */}
        <div className="overflow-y-auto flex-1 min-h-0">
          {/* Static Top Header */}
          <div className="shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800 shadow-2xs">
            <div className="px-4 py-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <button
                  onClick={onClose}
                  className="p-1.5 -ml-1 rounded-full text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                  title="Close Profile"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-xs shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 dark:text-white font-display leading-tight truncate">
                    Executive Profile
                  </h2>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-tight truncate">
                    Account &amp; Verified Credentials
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 text-[11px] font-bold shadow-2xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Verified Profile</span>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5 space-y-4">
            {/* Executive Profile Card (Exact Jennies Vance structure) */}
            <div className="rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm text-left relative transition-all">
              {/* Professional Cover Background Banner */}
              <div className="h-28 sm:h-32 bg-slate-900 relative overflow-hidden group w-full">
                <img
                  src={profile.coverUrl}
                  alt="Executive Profile Background"
                  className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-slate-950/20 pointer-events-none" />
              </div>

              {/* Profile Info Bar */}
              <div className="px-5 pb-5 pt-0 relative bg-white dark:bg-slate-900">
                <div className="flex items-start justify-between">
                  <div className="relative -mt-10 sm:-mt-11 z-10 shrink-0">
                    <img
                      src={profile.avatar}
                      alt={profile.name}
                      className="w-20 h-20 sm:w-22 sm:h-22 rounded-full object-cover border-4 border-white dark:border-slate-900 shadow-lg ring-2 ring-slate-900/10 dark:ring-white/10"
                    />
                    <span
                      className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 shadow-xs ${
                        member.status === 'online'
                          ? 'bg-emerald-500'
                          : member.status === 'away'
                          ? 'bg-amber-500'
                          : 'bg-slate-400'
                      }`}
                      title={`Status: ${member.status}`}
                    />
                  </div>

                  {/* Primary Actions: Follow + Message */}
                  <div className="flex items-center gap-2 pt-2.5 sm:pt-3">
                    <button
                      onClick={handleToggleFollow}
                      className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95 ${
                        isFollowing
                          ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                          : 'bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
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
                      onClick={() => {
                        onClose();
                        onDirectMessage(member);
                      }}
                      className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-indigo-600/30 transition-all cursor-pointer active:scale-95"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Message</span>
                    </button>
                  </div>
                </div>

                {/* Name, Verified Tick, @handle below name, Headline, Bio, Org */}
                <div className="space-y-1 mt-2 mb-4">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-lg font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
                        {profile.name}
                      </h3>
                      <span title="Cryptographically Verified Identity">
                        <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 fill-indigo-100 dark:fill-indigo-950/60" />
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-medium block mt-0.5">
                      {profile.username}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 pt-0.5">
                    {profile.title}
                  </p>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                    {profile.bio}
                  </p>

                  {profile.organization && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-normal pt-1.5 leading-normal truncate">
                      {profile.organization}
                    </p>
                  )}
                </div>

                {/* Executive Metrics: Communities & Connections clickable (LinkedIn-style); Achievements non-clickable */}
                <div className="grid grid-cols-3 gap-2 py-2 px-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800/80 text-center">
                  <button
                    type="button"
                    onClick={() => setNetworkSheetTab('communities')}
                    className="group py-2 px-1 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/40 active:scale-95 transition-all cursor-pointer text-center"
                    title={`View ${profile.name}'s communities`}
                  >
                    <span className="block text-sm sm:text-base font-extrabold text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform font-display tabular-nums">
                      {profile.communitiesCount}
                    </span>
                    <span className="text-[10px] text-slate-900 dark:text-slate-100 font-semibold uppercase tracking-wider block">
                      Communities
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNetworkSheetTab('connections')}
                    className="group py-2 px-1 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/40 active:scale-95 transition-all cursor-pointer text-center border-x border-slate-200/80 dark:border-slate-700"
                    title={`View ${profile.name}'s connections`}
                  >
                    <span className="block text-sm sm:text-base font-extrabold text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform font-display tabular-nums">
                      {(profile?.connectionsCount ?? 0).toLocaleString()}
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
                    className="group py-2 px-1 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/40 active:scale-95 transition-all cursor-pointer text-center"
                    title={`Jump to ${profile.name}'s achievements below`}
                  >
                    <span className="block text-sm sm:text-base font-extrabold text-amber-500 dark:text-amber-400 group-hover:scale-105 transition-transform font-display tabular-nums">
                      {profile.achievements?.length || 4}
                    </span>
                    <span className="text-[10px] text-slate-900 dark:text-slate-100 font-semibold uppercase tracking-wider block">
                      Achievements
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Section 1: Identity & Credentials */}
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Identity &amp; Credentials
                </span>
              </div>

              <div className="space-y-2.5">
                {/* Work Email */}
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[11px] text-slate-400 block">Work Email</span>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate block">
                        {profile.email}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 shrink-0">
                    Verified
                  </span>
                </div>

                {/* LinkedIn Profile */}
                <div className="flex items-center justify-between py-1 border-t border-slate-100 dark:border-slate-800 pt-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-xl bg-[#0A66C2]/10 flex items-center justify-center shrink-0">
                      <Linkedin className="w-4 h-4 text-[#0A66C2]" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] text-slate-400 block">LinkedIn Profile</span>
                      <a
                        href={`https://${linkedinHandle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 truncate block transition-colors"
                      >
                        {linkedinHandle}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleCopy(`https://${linkedinHandle}`, 'linkedin')}
                      className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0 cursor-pointer"
                      title="Copy LinkedIn URL"
                    >
                      {copiedField === 'linkedin' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <a
                      href={`https://${linkedinHandle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0"
                      title="Open LinkedIn in new tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* GitHub Profile */}
                <div className="flex items-center justify-between py-1 border-t border-slate-100 dark:border-slate-800 pt-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-xl bg-slate-900/10 dark:bg-white/10 flex items-center justify-center shrink-0">
                      <Github className="w-4 h-4 text-slate-900 dark:text-slate-100" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] text-slate-400 block">GitHub Profile</span>
                      <a
                        href={`https://${githubHandle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 truncate block transition-colors"
                      >
                        {githubHandle}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleCopy(`https://${githubHandle}`, 'github')}
                      className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0 cursor-pointer"
                      title="Copy GitHub URL"
                    >
                      {copiedField === 'github' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <a
                      href={`https://${githubHandle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0"
                      title="Open GitHub in new tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Key Achievements (Matching Jennies Vance's profile structure) */}
            {profile.achievements && profile.achievements.length > 0 && (
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
                    {profile.achievements.length} Key Honors
                  </span>
                </div>

                {/* Quick Metrics Bar for Achievements */}
                <div className="grid grid-cols-3 gap-2 py-2.5 px-2 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                  <div>
                    <span className="block text-sm font-extrabold text-amber-600 dark:text-amber-400 font-display">
                      {profile.metrics?.honors || '1st'}
                    </span>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                      Honors
                    </span>
                  </div>
                  <div className="border-x border-slate-200 dark:border-slate-700">
                    <span className="block text-sm font-extrabold text-slate-900 dark:text-white font-display">
                      {profile.metrics?.patentsCount ?? profile.achievements.length * 3 + 2}
                    </span>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                      Patents &amp; Papers
                    </span>
                  </div>
                  <div>
                    <span className="block text-sm font-extrabold text-indigo-600 dark:text-indigo-400 font-display">
                      {profile.metrics?.contributorRank || 'Top 1%'}
                    </span>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                      Contributor
                    </span>
                  </div>
                </div>

                {/* Detailed Accomplishments List */}
                <div
                  className={`space-y-2.5 pt-1 relative transition-all duration-300 ${
                    !showAllAchievements && profile.achievements.length > 2 ? 'max-h-[260px] overflow-hidden' : ''
                  }`}
                >
                  {profile.achievements.map((item, idx) => {
                    const isBlurred = !showAllAchievements && profile.achievements.length > 2 && idx >= 2;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedAchievement(item)}
                        className={`w-full p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-white dark:hover:bg-slate-800/80 hover:shadow-xs transition-all text-left cursor-pointer ${
                          isBlurred ? 'filter blur-[2px] opacity-60 pointer-events-none' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-2xs text-base">
                              {item.icon}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate">
                                {item.title}
                              </h4>
                              <p className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 truncate">
                                {item.org}
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 shrink-0">
                            {item.year}
                          </span>
                        </div>
                      </button>
                    );
                  })}

                  {/* View More overlay when collapsed */}
                  {!showAllAchievements && profile.achievements.length > 2 && (
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white via-white/85 to-transparent dark:from-slate-900 dark:via-slate-900/85 flex items-end justify-center pb-1.5 pointer-events-none z-10">
                      <button
                        type="button"
                        onClick={() => setShowAllAchievements(true)}
                        className="pointer-events-auto px-4 py-2 rounded-full bg-indigo-50/95 dark:bg-indigo-950/90 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200/90 dark:border-indigo-800 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer backdrop-blur-md"
                      >
                        <Trophy className="w-3.5 h-3.5 text-indigo-500" />
                        <span>View more</span>
                        <ChevronDown className="w-3.5 h-3.5 text-indigo-500" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Show Less button when expanded */}
                {showAllAchievements && profile.achievements.length > 2 && (
                  <div className="pt-2 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setShowAllAchievements(false)}
                      className="px-4 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/70 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>Show less</span>
                      <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Section 3: Posts for user below Key Achievements */}
            {authorPosts.length > 0 && (
              <UserPostsSection
                authorName={member.name}
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

      {/* Achievement Detail Modal */}
      {selectedAchievement && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
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
                    Verified Honor
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
                  {selectedAchievement.org}
                </span>
              </div>
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Year &amp; Verification</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span>{selectedAchievement.year}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedAchievement(null)}
              className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Dedicated All Posts Screen for Author */}
      {showAllPostsScreen && profile && (
        <UserPostsScreen
          user={{
            id: member.id,
            name: member.name,
            avatar: member.avatar,
            headline: member.headline || member.role,
            username: profile.username,
            organization: profile.organization,
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
      {/* LinkedIn-style Communities & Connections Network Viewer */}
      {networkSheetTab && (
        <ProfileNetworkSheet
          isOpen={!!networkSheetTab}
          onClose={() => setNetworkSheetTab(null)}
          initialTab={networkSheetTab}
          profileName={profile.name}
          profileId={profile.id}
          communitiesCount={profile.communitiesCount}
          connectionsCount={profile.connectionsCount}
          userPlan={userPlan}
          onUnlockPlan={onUnlockPlan}
        />
      )}
    </div>
  );
};
