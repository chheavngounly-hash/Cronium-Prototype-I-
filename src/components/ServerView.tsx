import React, { useState, useEffect, useMemo } from 'react';
import {
  ChevronLeft,
  MapPin,
  MessageCircle,
  Search,
  UserPlus,
  Check,
  MoreVertical,
  Trash2,
  Star,
  X,
} from 'lucide-react';
import { Community, CommunityChannel, Message, ServerMember, User, UserPlan } from '../types';
import { ChatView } from './ChatView';
import { ServerAvatar } from './ServerAvatar';
import { MemberProfileModal } from './MemberProfileModal';
import { getServerMembers, getChannelInitialMessages } from '../utils/serverDomainData';
import { notificationService } from '../services/notifications';

interface ServerViewProps {
  community: Community;
  onBack: () => void;
  onOpenDirectChat?: (user: User, initialGreeting?: string) => void;
  isOfflineMode?: boolean;
  onToggleJoin?: (communityId: string, community?: Community, forceJoin?: boolean) => void;
  connectedUserIds?: string[];
  onToggleConnect?: (member: ServerMember) => void;
  initialCollapsed?: boolean;
  userPlan?: UserPlan;
  onUnlockPlan?: (plan: UserPlan) => void;
}

type MemberFilter = 'all' | 'online' | 'verified' | 'open';
type MemberSortMode = 'relevance' | 'online' | 'name';

export const ServerView: React.FC<ServerViewProps> = ({
  community,
  onBack,
  onOpenDirectChat,
  isOfflineMode = false,
  onToggleJoin,
  connectedUserIds = [],
  onToggleConnect,
  initialCollapsed: _initialCollapsed = true,
  userPlan = 'free',
  onUnlockPlan,
}) => {
  // Ensure local-conversation channel is present in the server
  const allChannels: CommunityChannel[] = useMemo(() => {
    const list = [...community.channels];
    if (!list.some((c) => c.name.toLowerCase().includes('local'))) {
      list.push({
        id: `${community.id}_ch_local`,
        name: 'local-conversation',
        topic: `Local city chapters, regional hubs & member meetups for ${community.name}`,
        type: 'text',
        unreadCount: 2,
      });
    }
    return list;
  }, [community.channels, community.id, community.name]);

  const [selectedChannel, setSelectedChannel] = useState<CommunityChannel>(
    allChannels[0] || { id: 'default', name: 'general', type: 'text' }
  );
  const [activeTab, setActiveTab] = useState<'chat' | 'members'>('chat');

  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [memberFilter, setMemberFilter] = useState<MemberFilter>('all');
  const [sortMode, setSortMode] = useState<MemberSortMode>('relevance');
  const [selectedMemberForProfile, setSelectedMemberForProfile] = useState<ServerMember | null>(null);
  const [quickMessageMember, setQuickMessageMember] = useState<ServerMember | null>(null);
  const [quickMessageText, setQuickMessageText] = useState('');
  const [showServerMenu, setShowServerMenu] = useState(false);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.server-view-menu-container')) {
        setShowServerMenu(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // Retrieve 18 domain-specific verified & community members for this server
  const serverMembers: ServerMember[] = useMemo(() => getServerMembers(community), [community]);

  const channelMessages: Message[] = useMemo(
    () => getChannelInitialMessages(community, selectedChannel, serverMembers),
    [community, selectedChannel, serverMembers]
  );

  const onlineMembersCount = useMemo(
    () => serverMembers.filter((m) => m.status === 'online').length,
    [serverMembers]
  );

  const filteredMembers = useMemo(() => {
    let list = [...serverMembers];

    if (memberFilter === 'online') {
      list = list.filter((m) => m.status === 'online');
    } else if (memberFilter === 'verified') {
      list = list.filter((m) => m.verified !== false);
    } else if (memberFilter === 'open') {
      list = list.filter((m) => m.openToConnect !== false);
    }

    if (memberSearchQuery.trim()) {
      const q = memberSearchQuery.toLowerCase();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.role.toLowerCase().includes(q) ||
          m.company.toLowerCase().includes(q) ||
          m.location.toLowerCase().includes(q) ||
          m.headline.toLowerCase().includes(q) ||
          m.skills.some((s) => s.toLowerCase().includes(q))
      );
    }

    if (sortMode === 'online') {
      const rank = { online: 0, away: 1, offline: 2 };
      list.sort((a, b) => rank[a.status] - rank[b.status]);
    } else if (sortMode === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      list.sort((a, b) => (b.sharedInterestsCount || 3) - (a.sharedInterestsCount || 3));
    }

    return list;
  }, [serverMembers, memberFilter, memberSearchQuery, sortMode]);

  const cycleSortMode = () => {
    setSortMode((prev) =>
      prev === 'relevance' ? 'online' : prev === 'online' ? 'name' : 'relevance'
    );
  };

  const sortLabel =
    sortMode === 'relevance'
      ? 'Sorted by Relevance'
      : sortMode === 'online'
      ? 'Sorted by Online'
      : 'Sorted A–Z';

  const handleStartChatWithMember = (member: ServerMember, initialGreeting?: string) => {
    setSelectedMemberForProfile(null);
    setQuickMessageMember(null);
    setQuickMessageText('');
    const userObj: User = {
      id: member.id,
      name: member.name,
      avatar: member.avatar,
      status: member.status,
      customStatus: member.role,
      bio: member.bio,
      safetyNumber: member.safetyNumber,
    };
    onOpenDirectChat?.(userObj, initialGreeting);
  };

  const handleOpenQuickMessage = (member: ServerMember) => {
    setQuickMessageMember(member);
    setQuickMessageText('');
  };

  const handleSubmitQuickMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!quickMessageMember) return;
    const trimmed = quickMessageText.trim();
    if (!trimmed) return;
    handleStartChatWithMember(quickMessageMember, trimmed);
  };

  return (
    <div
      className={`flex flex-col h-full ${
        activeTab === 'chat' ? 'bg-white dark:bg-slate-950' : 'bg-[#F8FAFC] dark:bg-slate-950'
      } text-slate-900 dark:text-slate-100 overflow-hidden`}
    >
      {/* Top Header Bar */}
      <div className="px-3 sm:px-4 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 z-20 shrink-0">
        {/* Left: Back Arrow + Circular Server Avatar + Title & Green Online Status */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <button
            onClick={onBack}
            className="p-1.5 -ml-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors shrink-0 cursor-pointer"
            title="Back to servers list"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <ServerAvatar
            community={community}
            size="md"
            shape="circle"
            className="!w-[44px] !h-[44px] shrink-0 shadow-2xs"
          />

          <div className="text-left min-w-0">
            <h2
              title={community.name}
              className="text-sm sm:text-[15px] font-bold text-slate-900 dark:text-white truncate max-w-[165px] sm:max-w-xs font-display leading-tight"
            >
              {community.name}
            </h2>
            <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300 truncate leading-tight mt-0.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>
                {community.activeMembers}{' '}
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">online</span>
              </span>
            </p>
          </div>
        </div>

        {/* Header Right Controls: Pill Chat / Members Switcher (1.2x taller) & Server Menu */}
        <div className="flex items-center justify-end gap-1 shrink-0">
          <div className="flex items-center h-[39px] p-1 bg-[#F1F5F9] dark:bg-slate-800 rounded-full">
            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              className={`h-full px-3.5 text-xs sm:text-[13px] font-semibold rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center justify-center ${
                activeTab === 'chat'
                  ? 'bg-white dark:bg-slate-900 text-[#4F46E5] dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Chat
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('members')}
              className={`h-full px-3.5 text-xs sm:text-[13px] font-semibold rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center justify-center ${
                activeTab === 'members'
                  ? 'bg-white dark:bg-slate-900 text-[#4F46E5] dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Members
            </button>
          </div>

          {/* Three-dot menu for optional deletion / leave server */}
          <div className="relative server-view-menu-container">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowServerMenu((prev) => !prev);
              }}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer select-none"
              title="Server options"
              aria-label="Server options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showServerMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowServerMenu(false)}
                />
                <div
                  className="absolute right-0 top-full mt-1.5 w-44 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-800 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-left"
                  onClick={(e) => e.stopPropagation()}
                >
                  {community.joined ? (
                    <button
                      type="button"
                      onClick={() => {
                        setShowServerMenu(false);
                        onToggleJoin?.(community.id, community, false);
                        notificationService.notify({
                          id: `leave_${community.id}_${Date.now()}`,
                          title: `Left ${community.name}`,
                          body: `You have left ${community.name}.`,
                          avatar: community.avatar,
                          type: 'system',
                        });
                        onBack();
                      }}
                      className="w-full px-3.5 py-2.5 text-left text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 flex items-center gap-2.5 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-rose-500" />
                      <span>Leave Server</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setShowServerMenu(false);
                        onToggleJoin?.(community.id, community, true);
                      }}
                      className="w-full px-3.5 py-2.5 text-left text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 flex items-center gap-2.5 cursor-pointer transition-colors"
                    >
                      <UserPlus className="w-4 h-4 text-indigo-500" />
                      <span>Join Server</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Horizontal Channel Selector Pills Row (shown only in Chat view) */}
      {activeTab === 'chat' && (
        <div className="px-3.5 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          {allChannels
            .filter((c) => c.type !== 'voice')
            .map((channel) => {
              const isSelected = selectedChannel.id === channel.id;
              return (
                <button
                  key={channel.id}
                  type="button"
                  onClick={() => {
                    setSelectedChannel(channel);
                    setActiveTab('chat');
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 border transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#4F46E5] text-white border-[#4F46E5] shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200/90 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                  }`}
                >
                  <span>#{channel.name}</span>
                </button>
              );
            })}
        </div>
      )}

      {/* Main Content Area: Full-Width Chat or Redesigned Members Directory */}
      <div className="flex-1 flex flex-col overflow-hidden relative min-w-0">
        {activeTab === 'chat' ? (
          <ChatView
            hideHeader={true}
            chatId={selectedChannel.id}
            chatTitle={selectedChannel.name}
            chatAvatar={community.avatar}
            isServerChannel={true}
            channelTopic={selectedChannel.topic}
            initialMessages={channelMessages}
            onBack={onBack}
            isOfflineMode={isOfflineMode}
            serverCommunity={community}
            serverMembers={serverMembers}
            selectedChannel={selectedChannel}
            onOpenDirectChat={onOpenDirectChat}
            userPlan={userPlan}
            onUnlockPlan={onUnlockPlan}
          />
        ) : (
          /* Redesigned Members Directory matching blueprint */
          <div
            data-subview-scroller="server-members"
            className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5"
          >
            {/* Title + Sort Pill */}
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-[15px] font-bold text-slate-900 dark:text-white font-display tracking-tight">
                Server Members{' '}
                <span className="font-normal text-slate-500 dark:text-slate-400">
                  ({filteredMembers.length} shown)
                </span>
              </h3>
              <button
                type="button"
                onClick={cycleSortMode}
                className="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 text-[11px] font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer shrink-0 active:scale-95"
                title="Click to change sort order"
              >
                {sortLabel}
              </button>
            </div>

            {/* Pill Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={memberSearchQuery}
                onChange={(e) => setMemberSearchQuery(e.target.value)}
                placeholder="Search by name, role, company, or skill..."
                className="w-full pl-10 pr-9 py-2.5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-full text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all shadow-2xs"
              />
              {memberSearchQuery && (
                <button
                  type="button"
                  onClick={() => setMemberSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Horizontal Filter Pills Strip */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
              {(
                [
                  { id: 'all', label: `All (${serverMembers.length})` },
                  { id: 'online', label: `Online (${onlineMembersCount})` },
                  { id: 'verified', label: 'Verified' },
                  { id: 'open', label: 'Open to Follow' },
                ] as const
              ).map((chip) => {
                const isActive = memberFilter === chip.id;
                return (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => setMemberFilter(chip.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 border transition-all cursor-pointer active:scale-95 ${
                      isActive
                        ? 'bg-[#4F46E5] text-white border-[#4F46E5] shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200/90 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700'
                    }`}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>

            {/* Single-Column Stacked Member Cards */}
            {filteredMembers.length === 0 ? (
              <div className="py-10 px-4 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  No members match your filter
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Try clearing your search or switching back to All members.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setMemberSearchQuery('');
                    setMemberFilter('all');
                  }}
                  className="mt-1 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-100 transition-colors cursor-pointer"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="space-y-3 pb-2">
                {filteredMembers.map((member) => {
                  const isRequested = connectedUserIds.includes(member.id);
                  const visibleSkills = member.skills.slice(0, 3);
                  const remainingSkills = Math.max(0, member.skills.length - 3);
                  const sharedCount = member.sharedInterestsCount ?? 3;

                  return (
                    <div
                      key={member.id}
                      className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_12px_rgba(15,23,42,0.03)] hover:border-indigo-200/90 dark:hover:border-indigo-800/70 transition-all text-left"
                    >
                      {/* Top Profile Row */}
                      <div
                        onClick={() => setSelectedMemberForProfile(member)}
                        className="flex items-start gap-3.5 cursor-pointer group"
                      >
                        {/* Circular Avatar with Purple-Indigo Ring + Status Dot */}
                        <div className="relative shrink-0">
                          <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-[#A855F7] via-[#6366F1] to-[#818CF8] shadow-xs">
                            <img
                              src={member.avatar}
                              alt={member.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full rounded-full object-cover bg-white dark:bg-slate-900 group-hover:scale-[1.03] transition-transform"
                            />
                          </div>
                          <span
                            className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full ring-2 ring-white dark:ring-slate-900 ${
                              member.status === 'online'
                                ? 'bg-emerald-500'
                                : member.status === 'away'
                                ? 'bg-amber-400'
                                : 'bg-slate-400'
                            }`}
                            title={`Status: ${member.status}`}
                          />
                        </div>

                        {/* Name, Verified Badge, Role • Company, Location • Shared Interests */}
                        <div className="min-w-0 flex-1 space-y-0.5 pt-0.5">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-[15px] font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {member.name}
                            </h4>
                            {member.verified !== false && (
                              <span
                                className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-950/90 text-indigo-600 dark:text-indigo-400 inline-flex items-center justify-center shrink-0"
                                title="Verified member"
                              >
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-600 dark:text-slate-300 truncate">
                            <span>{member.role}</span>
                            <span className="text-slate-300 dark:text-slate-600 mx-1">•</span>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {member.company}
                            </span>
                          </p>

                          <div className="flex items-center gap-1.5 text-[11px] flex-wrap pt-0.5">
                            <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 truncate">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{member.location}</span>
                            </span>
                            <span className="text-slate-300 dark:text-slate-600">•</span>
                            <span className="inline-flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 shrink-0">
                              <Star className="w-3 h-3 fill-indigo-500 text-indigo-500 shrink-0" />
                              <span>{sharedCount} shared interests</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Clean Bio / Headline Summary */}
                      <p className="mt-3 text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                        {member.headline}
                      </p>

                      {/* Skills Tag Pills + Overflow Counter */}
                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        {visibleSkills.map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2.5 py-1 rounded-lg bg-[#F1F5F9] dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[11px] font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                        {remainingSkills > 0 && (
                          <span className="px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 text-[11px] font-bold">
                            +{remainingSkills}
                          </span>
                        )}
                      </div>

                      {/* Hairline Divider */}
                      <div className="border-t border-slate-100 dark:border-slate-800 my-3.5" />

                      {/* Dual Pill Action Row: Follow/Following + Message */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => onToggleConnect?.(member)}
                          className={`py-2.5 px-3 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer ${
                            isRequested
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/90 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                              : 'bg-white dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-indigo-300 hover:text-indigo-600 dark:hover:text-indigo-400'
                          }`}
                          title={isRequested ? `Following ${member.name}` : `Follow ${member.name}`}
                        >
                          {isRequested ? (
                            <>
                              <Check className="w-3.5 h-3.5 stroke-[2.5] text-emerald-600 dark:text-emerald-400" />
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
                          type="button"
                          onClick={() => handleOpenQuickMessage(member)}
                          className="py-2.5 px-3 rounded-full bg-gradient-to-r from-[#4F46E5] via-[#6338F2] to-[#8B2CF5] hover:brightness-105 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-500/20 transition-all active:scale-[0.98] cursor-pointer"
                          title={`Send direct message to ${member.name}`}
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Message</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Direct Message Bottom Sheet Modal (triggered from Members "Message" CTA) */}
      {quickMessageMember && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-[2px] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150"
          onClick={() => setQuickMessageMember(null)}
        >
          <form
            onSubmit={handleSubmitQuickMessage}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[28px] sm:rounded-[28px] px-5 pt-3 pb-6 shadow-2xl border-t sm:border border-slate-200/80 dark:border-slate-800 animate-in slide-in-from-bottom-6 duration-200 text-left"
          >
            {/* Top Drag Handle */}
            <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mb-5" />

            {/* Recipient Header Row */}
            <div className="flex items-center gap-3.5 mb-5">
              <img
                src={quickMessageMember.avatar}
                alt={quickMessageMember.name}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-full object-cover border border-slate-200/80 dark:border-slate-700 shrink-0 shadow-2xs"
              />
              <div className="min-w-0 flex-1">
                <h3 className="text-[17px] font-bold text-slate-900 dark:text-white truncate leading-snug">
                  Message {quickMessageMember.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {quickMessageMember.role} @ {quickMessageMember.company}
                </p>
              </div>
            </div>

            {/* Quick Icebreakers */}
            <div className="mb-3.5">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                Quick Icebreakers
              </p>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                {(() => {
                  const primaryTopic = quickMessageMember.skills[0] || community.name;
                  return (
                    <button
                      type="button"
                      onClick={() =>
                        setQuickMessageText(
                          `Loved your work on ${primaryTopic}! Would love to connect and swap notes.`
                        )
                      }
                      className="px-3.5 py-2 rounded-full bg-[#EEF2FF] dark:bg-indigo-950/70 hover:bg-indigo-100 dark:hover:bg-indigo-900/70 text-[#4F46E5] dark:text-indigo-300 text-xs font-semibold transition-colors cursor-pointer active:scale-95 whitespace-nowrap shrink-0"
                    >
                      “Loved your work on {primaryTopic}...”
                    </button>
                  );
                })()}
              </div>
            </div>

            {/* Direct Message Textarea */}
            <textarea
              value={quickMessageText}
              onChange={(e) => setQuickMessageText(e.target.value)}
              placeholder={`Write a direct message to ${quickMessageMember.name}...`}
              rows={4}
              autoFocus
              className="w-full p-3.5 rounded-2xl border-2 border-[#6366F1]/85 focus:border-[#4F46E5] bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 resize-none transition-all"
            />

            {/* Bottom Action Buttons */}
            <div className="flex items-center gap-3 mt-4">
              <button
                type="button"
                onClick={() => setQuickMessageMember(null)}
                className="px-5 py-3 rounded-full bg-[#F1F5F9] dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold transition-colors cursor-pointer shrink-0"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!quickMessageText.trim()}
                className="flex-1 py-3 px-6 rounded-full bg-gradient-to-r from-[#4F46E5] via-[#6338F2] to-[#8B2CF5] hover:brightness-105 disabled:opacity-55 disabled:cursor-not-allowed text-white text-sm font-bold shadow-md shadow-indigo-500/25 transition-all active:scale-[0.98] cursor-pointer"
              >
                Send Message
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Full Professional Member Profile Modal */}
      {selectedMemberForProfile && (
        <MemberProfileModal
          member={selectedMemberForProfile}
          serverName={community.name}
          onClose={() => setSelectedMemberForProfile(null)}
          onDirectMessage={(m) => handleStartChatWithMember(m)}
          isConnected={
            selectedMemberForProfile
              ? connectedUserIds.includes(selectedMemberForProfile.id)
              : false
          }
          onConnect={onToggleConnect}
          userPlan={userPlan}
          onUnlockPlan={onUnlockPlan}
        />
      )}
    </div>
  );
};
