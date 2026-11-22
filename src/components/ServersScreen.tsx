import React, { useState, useMemo } from 'react';
import {
  Users,
  MessageSquare,
  ChevronRight,
  ArrowRight,
  Crown,
  Calendar,
} from 'lucide-react';
import { Community, DirectChat, UserPlan, ServerMember, User } from '../types';
import { CroniumLogo } from './CroniumLogo';
import { ServerAvatar } from './ServerAvatar';
import { PremiumUnlockModal } from './PremiumUnlockModal';
import { CommunityEventsModal } from './CommunityEventsModal';
import { MemberProfileModal } from './MemberProfileModal';
import { ensureUniqueServers } from '../utils/serverMatcher';
import { getMemberProfile } from '../data/mockMemberProfiles';

interface ServersScreenProps {
  communities: Community[];
  directChats: DirectChat[];
  onSelectCommunity: (community: Community, fromFirstOpenAfterJoin?: boolean) => void;
  onSelectChat: (chatId: string) => void;
  onOpenDirectChat?: (user: User) => void;
  onSeeAllCommunities?: () => void;
  onSeeAllMessages?: () => void;
  onToggleJoin?: (communityId: string, community?: Community, forceJoin?: boolean) => void;
  userInterests?: string[];
  userHobbies?: string[];
  userGoals?: string[];
  hasPrompted?: boolean;
  userPlan?: UserPlan;
  onUnlockPlan?: (plan: UserPlan) => void;
  onNavigateToHome?: () => void;
  bottomNav?: React.ReactNode;
}

export const ServersScreen: React.FC<ServersScreenProps> = ({
  communities,
  directChats,
  onSelectCommunity,
  onSelectChat,
  onOpenDirectChat,
  onSeeAllMessages,
  onToggleJoin,
  hasPrompted = false,
  userPlan = 'free',
  onUnlockPlan,
  onNavigateToHome,
  bottomNav,
}) => {
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showEventsModal, setShowEventsModal] = useState(false);
  const [selectedMemberForProfile, setSelectedMemberForProfile] = useState<ServerMember | null>(null);

  // ONLY my joined servers should display on Servers & DMs
  const joinedCommunities = useMemo(
    () => ensureUniqueServers(communities.filter((c) => c.joined)),
    [communities]
  );
  const joinedCount = joinedCommunities.length;

  return (
    <div
      data-tab-scroller="servers"
      className="flex flex-col flex-1 h-full min-h-0 bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-y-auto"
    >
      {/* Static Top Header */}
      <div className="px-5 pt-2.5 pb-2 flex items-center justify-between shrink-0 border-b border-slate-200/50 dark:border-slate-800/60">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
            Your servers
          </h1>
        </div>

        <div className="flex items-center gap-1">
          <CroniumLogo variant="app-icon" className="w-5 h-5 rounded-md shadow-2xs" />
          <span className="text-base font-bold tracking-tight font-display text-slate-900 dark:text-white">
            Cronium
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-5 pb-6 pt-2 space-y-4 max-w-lg mx-auto w-full">
        {/* Events & Community Hubs Section - Replaced 'Joined servers (2)' and Users icon with Events */}
        <div className="space-y-3 text-left">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowEventsModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-sm text-slate-900 dark:text-white transition-all cursor-pointer group active:scale-95"
              title="Explore community events and meetups"
            >
              <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-2xs group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold font-display tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Events
              </span>
              <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
            </button>
            <div className="flex items-center gap-2">
              {userPlan !== 'pro' && (
                <button
                  onClick={() => setShowPremiumModal(true)}
                  className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-xs transition-transform active:scale-95 cursor-pointer flex items-center gap-1.5 shrink-0"
                  title="Unlock more servers"
                >
                  <Crown className="w-3.5 h-3.5 shrink-0" />
                  <span>{userPlan === 'plus' ? 'Upgrade Pro' : 'Unlock More'}</span>
                </button>
              )}
            </div>
          </div>

          {joinedCommunities.length === 0 ? (
            /* Empty State when no servers joined yet */
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-3 shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400">
                <Users className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  No joined servers yet
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                  Submit your prompts on Home to discover your 5 most relevant servers and join communities.
                </p>
              </div>
              {onNavigateToHome && (
                <button
                  onClick={onNavigateToHome}
                  className="px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 mx-auto shadow-sm transition-all cursor-pointer"
                >
                  <span>Explore Servers on Home</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            /* Joined Servers List - Consistent white cards & uniform sizing across the platform */
            <div className="space-y-3">
              {joinedCommunities.map((community, idx) => (
                <div
                  key={`${community.id}_${idx}`}
                  onClick={() => onSelectCommunity(community)}
                  className="p-3.5 sm:p-4 rounded-[26px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500/70 shadow-2xs hover:shadow-[0_4px_16px_rgba(99,102,241,0.09)] transition-shadow duration-150 flex flex-col gap-2.5 cursor-pointer group text-left active:scale-[0.99]"
                >
                  <div className="flex items-center justify-between gap-3.5">
                    {/* Left: Server Icon + Name + Active Members */}
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <ServerAvatar
                        community={community}
                        size="lg"
                        className="group-hover:scale-102 transition-transform shrink-0"
                      />
                      <div className="min-w-0 flex-1 flex flex-col justify-center">
                        <h3
                          title={community.name}
                          className="text-[14.5px] sm:text-[15px] font-extrabold text-[#11183E] dark:text-white truncate font-display tracking-tight leading-tight"
                        >
                          {community.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="w-2 h-2 rounded-full bg-[#10B981] shrink-0" />
                          <span className="text-[12px] font-medium text-slate-500 dark:text-slate-400 truncate">
                            {community.activeMembers} active members
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Clean Chevron Arrow */}
                    <div className="shrink-0 flex items-center">
                      <ChevronRight className="w-5 h-5 text-[#4338CA] dark:text-indigo-400 stroke-[2.2] group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>

                  {community.tags && community.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-nowrap overflow-x-auto no-scrollbar">
                      {community.tags.slice(0, 3).map((tag, tagIdx) => (
                        <span
                          key={`${tag}_${tagIdx}`}
                          className="px-2.5 py-0.5 rounded-full bg-slate-100/90 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-[11px] font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap shrink-0"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Direct Messages Section - Only joined servers and messages display */}
        <div className="space-y-3 text-left pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white">
              <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-sm font-bold font-display">Direct Messages</h2>
            </div>
          </div>

          {directChats.length === 0 ? (
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-2 shadow-2xs">
              <MessageSquare className="w-6 h-6 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No active direct messages yet. Connect with members inside servers to start chats.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {directChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => onSelectChat(chat.id)}
                  className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-shadow duration-150 flex items-center justify-between gap-3 cursor-pointer group text-left active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMemberForProfile({
                          id: chat.user.id,
                          name: chat.user.name,
                          avatar: chat.user.avatar,
                          status: chat.user.status === 'typing' ? 'online' : chat.user.status,
                          role: chat.user.customStatus || 'Verified Member',
                          company: 'Autonomous Systems & AI Architecture',
                          headline: chat.user.customStatus || 'Cronium Network Member',
                          bio: chat.user.bio || 'Active participant and builder on Cronium mesh messaging.',
                          location: 'San Francisco, CA',
                          skills: ['Autonomous Agents', 'Systems Engineering', 'P2P Networking'],
                          contributionsCount: 184,
                          joinedDate: 'Joined Sep 2024',
                        });
                      }}
                      className="relative shrink-0 cursor-pointer rounded-full hover:ring-2 hover:ring-indigo-500 transition-shadow focus:outline-hidden"
                      title={`View ${chat.user.name}'s profile`}
                    >
                      <img
                        src={chat.user.avatar}
                        alt={chat.user.name}
                        decoding="async"
                        className="w-10 h-10 rounded-full object-cover border border-slate-100 dark:border-slate-800"
                      />
                      <span
                        className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 ${
                          chat.user.status === 'online' ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}
                      />
                    </button>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {chat.user.name}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {chat.lastMessageTime}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {chat.lastMessage}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Premium Unlock Modal */}
      <PremiumUnlockModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        onUnlock={(plan) => {
          onUnlockPlan?.(plan || 'pro');
          setShowPremiumModal(false);
        }}
        joinedCount={joinedCount}
        currentPlan={userPlan}
      />

      {/* Community Meetup & External Events Modal */}
      <CommunityEventsModal
        isOpen={showEventsModal}
        onClose={() => setShowEventsModal(false)}
        joinedCommunities={joinedCommunities}
        hasPrompted={hasPrompted}
        onNavigateToHome={() => {
          setShowEventsModal(false);
          onNavigateToHome?.();
        }}
        onOpenCommunity={(community) => {
          setShowEventsModal(false);
          onSelectCommunity(community);
        }}
      />

      {/* Member Profile Modal */}
      {selectedMemberForProfile && (
        <MemberProfileModal
          member={selectedMemberForProfile}
          serverName="Direct Messages"
          onClose={() => setSelectedMemberForProfile(null)}
          userPlan={userPlan}
          onUnlockPlan={onUnlockPlan}
          onDirectMessage={(member) => {
            setSelectedMemberForProfile(null);
            const userObj: User = {
              id: member.id,
              name: member.name,
              avatar: member.avatar,
              status: member.status,
              customStatus: member.role || member.headline,
              bio: member.bio,
              safetyNumber: member.safetyNumber,
            };
            if (onOpenDirectChat) {
              onOpenDirectChat(userObj);
            } else {
              const matched = directChats.find(
                (c) =>
                  c.user.id === member.id ||
                  c.id === member.id ||
                  c.id === `chat_${member.id}` ||
                  c.user.name.toLowerCase() === member.name.toLowerCase()
              );
              if (matched) {
                onSelectChat(matched.id);
              } else {
                onSelectChat(member.id);
              }
            }
          }}
        />
      )}
    </div>
  );
};
