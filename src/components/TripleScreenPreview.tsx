import React from 'react';
import {
  Sparkles,
  Maximize2,
  ShieldCheck,
  MessageSquare,
  Users,
  Lock,
  ArrowRight,
  Check,
  Radio,
  Send,
  Share2,
} from 'lucide-react';
import { Community, DirectChat, User, UserPlan } from '../types';
import { ServerAvatar } from './ServerAvatar';
import { IPhoneStatusBar } from './IPhoneStatusBar';
import { CroniumLogo } from './CroniumLogo';
import { ROBOT_MASCOT_IMAGE } from '../data/mockData';

interface TripleScreenPreviewProps {
  communities: Community[];
  directChats: DirectChat[];
  onFindCommunities: (
    interests: string[],
    promptDetails?: { interests: string[]; hobbies: string[]; goals: string[] },
    options?: { silent?: boolean }
  ) => void;
  onSelectCommunity: (community: Community, justJoined?: boolean) => void;
  onSelectChat: (chatId: string) => void;
  onOpenDirectChat: (user: User) => void;
  onToggleJoin: (communityId: string, community?: Community) => void;
  onFocusScreen: (tab: 'home' | 'communities' | 'servers' | 'feed' | 'profile') => void;
  onOpenNotifications: () => void;
  userInterests?: string[];
  userHobbies?: string[];
  userGoals?: string[];
  userPlan: UserPlan;
  onUnlockPlan: (plan: UserPlan) => void;
  unreadNotificationsCount?: number;
}

export const TripleScreenPreview: React.FC<TripleScreenPreviewProps> = ({
  communities,
  directChats,
  onSelectCommunity,
  onSelectChat,
  onFocusScreen,
  userInterests = ['Machine Learning', 'Space'],
}) => {
  const topCommunities = communities.slice(0, 3);
  const sampleChat = directChats[0];

  return (
    <div className="flex-1 w-full h-full min-h-0 bg-slate-900 text-slate-100 overflow-y-auto p-4 sm:p-6 flex flex-col items-center">
      {/* Header Info */}
      <div className="text-center max-w-xl mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Multi-Device Experience</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-display">
          Cronium Mobile Interface Suite
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Explore the three core experiences: AI-matched community discovery, decentralized channels, and zero-knowledge encrypted messaging.
        </p>
      </div>

      {/* 3 Mockup Screens Container */}
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6 pb-8 items-start justify-center">
        {/* Device 1: Home & Discovery */}
        <div className="flex flex-col items-center">
          <div className="w-full flex items-center justify-between px-2 mb-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 font-display">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              1. AI Community Matching
            </span>
            <button
              onClick={() => onFocusScreen('home')}
              className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <span>Launch</span>
              <Maximize2 className="w-3 h-3" />
            </button>
          </div>

          <div
            onClick={() => onFocusScreen('home')}
            className="w-full max-w-[340px] h-[640px] bg-[#F5F8FF] rounded-[36px] shadow-2xl border-[6px] border-slate-800 overflow-hidden flex flex-col cursor-pointer hover:border-indigo-500/60 transition-all hover:scale-[1.01] group text-slate-900 relative"
          >
            <IPhoneStatusBar bgClassName="bg-[#F5F8FF]" />

            <div className="p-4 flex-1 overflow-hidden flex flex-col text-left">
              {/* Mascot & Greeting */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white shadow-xs border border-indigo-50 mb-3">
                <img
                  src={ROBOT_MASCOT_IMAGE}
                  alt="Cronium Mascot"
                  className="w-10 h-10 rounded-xl object-cover shrink-0"
                />
                <div>
                  <h4 className="text-xs font-black text-slate-900 font-display">
                    Welcome to Cronium!
                  </h4>
                  <p className="text-[10px] text-slate-500">
                    Tell me what you love, and I will connect you with like-minded minds.
                  </p>
                </div>
              </div>

              {/* Interests Tags */}
              <div className="mb-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Your Matched Topics
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {userInterests.map((interest) => (
                    <span
                      key={interest}
                      className="px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-semibold"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              {/* Matched Servers List */}
              <div className="flex-1 space-y-2 overflow-hidden">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Top Recommended Servers
                </span>
                {topCommunities.map((comm) => (
                  <div
                    key={comm.id}
                    className="p-2.5 rounded-xl bg-white border border-slate-100 shadow-2xs flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <ServerAvatar community={comm} size="sm" />
                      <div className="min-w-0">
                        <h5 className="text-[11px] font-bold text-slate-900 truncate">
                          {comm.name}
                        </h5>
                        <span className="text-[9px] text-emerald-600 font-medium flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {comm.activeMembers} online
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                      View
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-white border-t border-slate-100 text-center">
              <span className="text-[10px] font-bold text-indigo-600 group-hover:underline flex items-center justify-center gap-1">
                Tap to enter Interactive Home <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>

        {/* Device 2: Servers & Communities */}
        <div className="flex flex-col items-center">
          <div className="w-full flex items-center justify-between px-2 mb-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 font-display">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              2. Channels & Communities
            </span>
            <button
              onClick={() => onFocusScreen('servers')}
              className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <span>Launch</span>
              <Maximize2 className="w-3 h-3" />
            </button>
          </div>

          <div
            onClick={() => onFocusScreen('servers')}
            className="w-full max-w-[340px] h-[640px] bg-slate-900 rounded-[36px] shadow-2xl border-[6px] border-slate-800 overflow-hidden flex flex-col cursor-pointer hover:border-indigo-500/60 transition-all hover:scale-[1.01] group text-white relative"
          >
            <IPhoneStatusBar bgClassName="bg-slate-900" />

            <div className="p-4 flex-1 overflow-hidden flex flex-col text-left">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <div className="flex items-center gap-2">
                  <CroniumLogo variant="app-icon" className="w-5 h-5 rounded-lg" />
                  <span className="text-xs font-extrabold tracking-tight">Machine Learning Hub</span>
                </div>
              </div>

              {/* Channels List */}
              <div className="space-y-1 mb-4">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Text Channels
                </span>
                {['# general-discussion', '# model-showcase', '# papers-and-code', '# local-conversation'].map((ch, i) => (
                  <div
                    key={ch}
                    className={`px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between ${
                      i === 0 ? 'bg-indigo-600/30 text-indigo-300 font-semibold' : 'text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <span>{ch}</span>
                    {i === 1 && (
                      <span className="w-4 h-4 rounded-full bg-indigo-600 text-[9px] font-bold flex items-center justify-center text-white">
                        3
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Members List preview */}
              <div className="flex-1 overflow-hidden">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Online Researchers
                </span>
                <div className="space-y-2">
                  {[
                    { name: 'Dr. Marcus Vance', role: 'Staff Systems Fellow', status: 'online' },
                    { name: 'Anna San', role: 'Lead ML Architect', status: 'online' },
                    { name: 'Alexander Patrick', role: 'Robotics Fellow', status: 'online' },
                  ].map((m) => (
                    <div key={m.name} className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-700 flex items-center justify-center font-bold text-[10px]">
                          {m.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-[11px] font-bold leading-none">{m.name}</div>
                          <div className="text-[9px] text-slate-400 mt-0.5">{m.role}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded-full border border-indigo-800">
                        Connect
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-950 border-t border-slate-800 text-center">
              <span className="text-[10px] font-bold text-indigo-400 group-hover:underline flex items-center justify-center gap-1">
                Tap to enter Servers & DMs <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>

        {/* Device 3: Encrypted Chat */}
        <div className="flex flex-col items-center">
          <div className="w-full flex items-center justify-between px-2 mb-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 font-display">
              <Lock className="w-3.5 h-3.5 text-indigo-400" />
              3. Zero-Knowledge E2EE Chat
            </span>
            <button
              onClick={() => {
                if (sampleChat) onSelectChat(sampleChat.id);
                else onFocusScreen('servers');
              }}
              className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <span>Launch</span>
              <Maximize2 className="w-3 h-3" />
            </button>
          </div>

          <div
            onClick={() => {
              if (sampleChat) onSelectChat(sampleChat.id);
              else onFocusScreen('servers');
            }}
            className="w-full max-w-[340px] h-[640px] bg-slate-950 rounded-[36px] shadow-2xl border-[6px] border-slate-800 overflow-hidden flex flex-col cursor-pointer hover:border-indigo-500/60 transition-all hover:scale-[1.01] group text-white relative"
          >
            <IPhoneStatusBar bgClassName="bg-slate-950" />

            <div className="p-4 flex-1 overflow-hidden flex flex-col text-left">
              {/* Chat Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-xs">
                    AS
                  </div>
                  <div>
                    <h5 className="text-xs font-bold leading-none">Anna San</h5>
                    <span className="text-[9px] text-emerald-400 flex items-center gap-1 mt-0.5 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> E2EE Verified
                    </span>
                  </div>
                </div>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>

              {/* Chat Bubbles */}
              <div className="flex-1 space-y-2.5 overflow-hidden text-xs">
                <div className="p-2.5 rounded-2xl rounded-tl-xs bg-slate-800 text-slate-200 max-w-[85%]">
                  <p className="text-[11px] leading-relaxed">
                    Hey Jennies! We finished profiling the zero-bubble sharding kernel on the cluster.
                  </p>
                  <span className="text-[9px] text-slate-400 block text-right mt-1 font-mono">
                    10:15 AM · Read
                  </span>
                </div>

                <div className="p-2.5 rounded-2xl rounded-tr-xs bg-indigo-600 text-white ml-auto max-w-[85%]">
                  <p className="text-[11px] leading-relaxed">
                    Awesome Anna! What was the latency delta compared to Triton 3.0?
                  </p>
                  <span className="text-[9px] text-indigo-200 block text-right mt-1 font-mono">
                    10:18 AM · Read
                  </span>
                </div>

                <div className="p-2.5 rounded-2xl rounded-tl-xs bg-slate-800 text-slate-200 max-w-[85%]">
                  <p className="text-[11px] leading-relaxed">
                    18.4% faster throughput with dynamic FP8 scaling enabled!
                  </p>
                  <span className="text-[9px] text-slate-400 block text-right mt-1 font-mono">
                    10:20 AM · Read
                  </span>
                </div>
              </div>

              {/* Chat Input Mockup */}
              <div className="pt-2">
                <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between text-xs text-slate-400">
                  <span>Send an encrypted message...</span>
                  <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                    <Send className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-900 border-t border-slate-800 text-center">
              <span className="text-[10px] font-bold text-indigo-400 group-hover:underline flex items-center justify-center gap-1">
                Tap to open Full Encrypted Chat <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
