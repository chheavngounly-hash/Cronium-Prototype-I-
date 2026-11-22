import React, { useState } from 'react';
import { Sparkles, Check, ChevronRight } from 'lucide-react';
import { Community, UserPlan } from '../types';
import { ServerAvatar } from './ServerAvatar';
import { PremiumUnlockModal } from './PremiumUnlockModal';

interface CommunitiesScreenProps {
  communities: Community[];
  onSelectCommunity: (community: Community, fromFirstOpenAfterJoin?: boolean) => void;
  onToggleJoin: (communityId: string, community?: Community, forceJoin?: boolean) => void;
  selectedInterests?: string[];
  bottomNav?: React.ReactNode;
  userPlan?: UserPlan;
  onUnlockPlan?: (plan: UserPlan) => void;
}

export const CommunitiesScreen: React.FC<CommunitiesScreenProps> = ({
  communities,
  onSelectCommunity,
  onToggleJoin,
  bottomNav,
  userPlan = 'free',
  onUnlockPlan,
}) => {
  const [selectedTopic, setSelectedTopic] = useState<string>('All topics');
  const [showPremiumModal, setShowPremiumModal] = useState<boolean>(false);

  const topics = ['All topics', 'Academic', 'Creativity', 'Robotics', 'Space', 'Gaming'];

  const filteredCommunities = communities.filter((comm) => {
    if (selectedTopic === 'All topics') return true;
    if (selectedTopic === 'Academic') {
      return comm.tags.some((t) => ['AI', 'Python', 'Science', 'Astronomy'].includes(t));
    }
    if (selectedTopic === 'Creativity') {
      return comm.tags.some((t) => ['Creativity', 'Social Impact', 'Entrepreneurship'].includes(t));
    }
    if (selectedTopic === 'Robotics') {
      return comm.tags.includes('Robotics') || comm.tags.includes('AI');
    }
    if (selectedTopic === 'Space') {
      return comm.tags.includes('Space') || comm.tags.includes('Astronomy');
    }
    if (selectedTopic === 'Gaming') {
      return comm.tags.includes('Gaming') || comm.tags.includes('Esports');
    }
    return true;
  });

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-y-auto">
      {/* Static Header */}
      <div className="px-5 pt-2.5 pb-1.5 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-indigo-600 dark:text-indigo-400 font-bold text-lg">➔</span>
          <div className="text-left">
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5 font-display">
              Explore your communities
              <Sparkles className="w-4 h-4 text-indigo-500 fill-indigo-500" />
            </h1>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
              You might love!
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 no-scrollbar">
          {topics.map((topic) => {
            const isActive = selectedTopic === topic;
            return (
              <button
                key={topic}
                onClick={() => setSelectedTopic(topic)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300'
                }`}
              >
                {topic}
              </button>
            );
          })}
        </div>
      </div>

      {/* Community Cards Feed (Displays only the five most relevant servers) */}
      <div className="px-5 pb-6 space-y-3 max-w-lg mx-auto w-full">
        {filteredCommunities.slice(0, 5).map((community, idx) => {
          return (
            <div
              key={`${community.id}_${idx}`}
              onClick={() => onSelectCommunity(community)}
              className="p-3.5 sm:p-4 rounded-[26px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500/70 shadow-2xs hover:shadow-[0_4px_16px_rgba(99,102,241,0.09)] transition-all flex flex-col gap-2.5 cursor-pointer group text-left"
            >
              <div className="flex items-center justify-between gap-3.5">
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <ServerAvatar
                    community={community}
                    size="lg"
                    className="group-hover:scale-102 transition-transform shrink-0"
                  />
                  <div className="min-w-0 flex-1 flex flex-col justify-center">
                    <h2
                      title={community.name}
                      className="text-[14.5px] sm:text-[15px] font-extrabold text-[#11183E] dark:text-white truncate font-display tracking-tight leading-tight"
                    >
                      {community.name}
                    </h2>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="w-2 h-2 rounded-full bg-[#10B981] shrink-0" />
                      <span className="text-[12px] font-medium text-slate-500 dark:text-slate-400 truncate">
                        {community.activeMembers} active members
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Clean Action Chevron */}
                <div className="shrink-0 flex items-center gap-2">
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

              {/* Answer Justification Box */}
              {community.matchJustification && (
                <div className="px-3.5 py-2.5 rounded-2xl bg-white/95 dark:bg-slate-800/95 border border-indigo-100/90 dark:border-indigo-900/60 shadow-2xs text-left">
                  <div className="flex items-center justify-between gap-1.5 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500 fill-indigo-500 shrink-0" />
                      <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                        Answer Justification
                      </span>
                    </div>
                    {community.matchedSignals && community.matchedSignals.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap">
                        {community.matchedSignals.map((signal) => (
                          <span
                            key={signal}
                            className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200/60 dark:border-indigo-800/60 text-[9.5px] font-semibold text-indigo-700 dark:text-indigo-300"
                          >
                            ✓ {signal}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-[11.5px] text-slate-700 dark:text-slate-200 mt-1 leading-snug">
                    {community.matchJustification}
                  </p>
                </div>
              )}
            </div>
          );
        })}

        {/* More communities footer link */}
        <div className="pt-2 text-center">
          <button
            onClick={() => setShowPremiumModal(true)}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 cursor-pointer active:scale-95"
            title="Unlock more communities with a subscription"
          >
            <span>— More communities for you —</span>
          </button>
        </div>
      </div>

      <PremiumUnlockModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        onUnlock={(plan) => {
          onUnlockPlan?.(plan || 'pro');
          setShowPremiumModal(false);
        }}
        currentPlan={userPlan}
      />
    </div>
  );
};
