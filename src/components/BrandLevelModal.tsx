import React, { useState } from 'react';
import {
  Crown,
  Sparkles,
  Trophy,
  Image as ImageIcon,
  Video,
  Users,
  Flame,
  CheckCircle2,
  ChevronRight,
  X,
  RotateCcw,
  Zap,
  Shield,
  Star,
  Award,
} from 'lucide-react';
import {
  BrandLevelStatus,
  QuestSimulationState,
  getStoredQuestState,
  saveStoredQuestState,
} from '../utils/brandLevel';
import { notificationService } from '../services/notifications';

interface BrandLevelModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandStatus: BrandLevelStatus;
  onUpdateStatus?: () => void;
}

export const BrandLevelModal: React.FC<BrandLevelModalProps> = ({
  isOpen,
  onClose,
  brandStatus,
  onUpdateStatus,
}) => {
  const [questState, setQuestState] = useState<QuestSimulationState>(() => getStoredQuestState());
  const [justLeveledUp, setJustLeveledUp] = useState(false);

  if (!isOpen) return null;

  const handleApplyQuest = (key: keyof QuestSimulationState, delta: number | boolean) => {
    notificationService.playSentChime();
    setJustLeveledUp(true);
    setTimeout(() => setJustLeveledUp(false), 2000);

    const updated: QuestSimulationState = { ...questState };
    if (typeof delta === 'number') {
      if (key === 'extraImages') updated.extraImages = Math.max(0, updated.extraImages + delta);
      if (key === 'extraVideos') updated.extraVideos = Math.max(0, updated.extraVideos + delta);
      if (key === 'extraConnections') updated.extraConnections = Math.max(0, updated.extraConnections + delta);
      if (key === 'extraCommunities') updated.extraCommunities = Math.max(0, updated.extraCommunities + delta);
    } else if (typeof delta === 'boolean' && key === 'isTopActive') {
      updated.isTopActive = delta;
    }

    setQuestState(updated);
    saveStoredQuestState(updated);
    onUpdateStatus?.();
  };

  const handleResetQuests = () => {
    const initial: QuestSimulationState = {
      extraImages: 0,
      extraVideos: 0,
      extraConnections: 0,
      extraCommunities: 0,
      isTopActive: true,
    };
    setQuestState(initial);
    saveStoredQuestState(initial);
    onUpdateStatus?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] p-5 shadow-2xl border border-slate-200/80 dark:border-slate-800 text-left relative overflow-hidden max-h-[90vh] flex flex-col">
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-40 bg-gradient-to-b from-amber-400/20 via-purple-500/10 to-transparent blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Crown className="w-4 h-4 fill-amber-500" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white font-display">
                Brand Level Status
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Mobile Legends Inspired Rank Tier System
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto space-y-4 pt-3 pb-2 pr-0.5 relative z-10">
          {/* Main Rank Emblem Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 text-white text-center relative overflow-hidden shadow-lg border border-amber-500/30">
            {/* Top Stars / Wings Badge */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 p-0.5 shadow-xl shadow-amber-500/30 mb-2.5 mx-auto">
              <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center text-3xl">
                {brandStatus.badgeEmoji}
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400 font-mono">
                  Tier Division
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Lv. {brandStatus.level}
                </span>
              </div>
              <h3 className="text-2xl font-black tracking-tight text-white font-display">
                {brandStatus.rankTitle}
              </h3>
              <p className="text-xs text-slate-300">
                {(brandStatus?.totalXp ?? 0).toLocaleString()} Total Reputation XP
              </p>
            </div>

            {/* Progress Bar toward next rank tier */}
            <div className="mt-3.5 space-y-1 text-left">
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span>Next Tier Threshold</span>
                <span className="font-bold text-amber-400 font-mono">
                  {brandStatus?.progressPercent ?? 0}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden border border-slate-700/60">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 rounded-full transition-all duration-500"
                  style={{ width: `${brandStatus?.progressPercent ?? 0}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-0.5">
                <span>{(brandStatus?.currentTierMinXp ?? 0).toLocaleString()} XP</span>
                <span>{(brandStatus?.nextTierMinXp ?? 0).toLocaleString()} XP</span>
              </div>
            </div>

            {justLeveledUp && (
              <div className="mt-2.5 py-1 px-3 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 animate-in fade-in zoom-in-95">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Status XP Recalibrated Dynamically!</span>
              </div>
            )}
          </div>

          {/* Dynamic Criteria Breakdown */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Ranking Metrics
            </h4>

            <div className="grid grid-cols-2 gap-2 text-left">
              {/* Images */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="w-6 h-6 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                    <ImageIcon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 font-mono">
                    +{brandStatus.stats.postedImages * 120} XP
                  </span>
                </div>
                <div className="text-sm font-extrabold text-slate-900 dark:text-white font-display">
                  {brandStatus.stats.postedImages} Images
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Published in Social Feed
                </p>
              </div>

              {/* Videos */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="w-6 h-6 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <Video className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 font-mono">
                    +{brandStatus.stats.postedVideos * 220} XP
                  </span>
                </div>
                <div className="text-sm font-extrabold text-slate-900 dark:text-white font-display">
                  {brandStatus.stats.postedVideos} Videos
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Streamed media uploads
                </p>
              </div>

              {/* Achievements */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="w-6 h-6 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Trophy className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 font-mono">
                    +{brandStatus.stats.achievements * 150} XP
                  </span>
                </div>
                <div className="text-sm font-extrabold text-slate-900 dark:text-white font-display">
                  {brandStatus.stats.achievements} Honors
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Global awards & patents
                </p>
              </div>

              {/* Connections */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    +{Math.min(2500, Math.floor(brandStatus.stats.connections * 1.2))} XP
                  </span>
                </div>
                <div className="text-sm font-extrabold text-slate-900 dark:text-white font-display">
                  {(brandStatus?.stats?.connections ?? 0).toLocaleString()}
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Verified Connections
                </p>
              </div>
            </div>

            {/* Community Activity Callout */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-indigo-50/90 via-purple-50/80 to-indigo-50/90 dark:from-indigo-950/60 dark:via-purple-950/40 dark:to-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/70 flex items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Flame className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-indigo-950 dark:text-indigo-200 truncate">
                    Top 1% Community Active Status
                  </p>
                  <p className="text-[11px] text-indigo-700 dark:text-indigo-300">
                    Active contributor across {brandStatus.stats.joinedCommunities} joined servers (+450 XP)
                  </p>
                </div>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            </div>
          </div>

          {/* Dynamic Quest Simulation Actions */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2.5 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Simulate Dynamic Level Advancements</span>
              </div>
              <button
                onClick={handleResetQuests}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                title="Reset simulation"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Test how completing posts, uploading videos, or adding connections dynamically ranks up your status figure:
            </p>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => handleApplyQuest('extraImages', 1)}
                className="py-1.5 px-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between transition-colors cursor-pointer shadow-2xs"
              >
                <span>+ Post Image</span>
                <span className="text-[10px] text-sky-600 font-bold">+120 XP</span>
              </button>

              <button
                onClick={() => handleApplyQuest('extraVideos', 1)}
                className="py-1.5 px-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between transition-colors cursor-pointer shadow-2xs"
              >
                <span>+ Post Video</span>
                <span className="text-[10px] text-purple-600 font-bold">+220 XP</span>
              </button>

              <button
                onClick={() => handleApplyQuest('extraConnections', 50)}
                className="py-1.5 px-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between transition-colors cursor-pointer shadow-2xs"
              >
                <span>+50 Connections</span>
                <span className="text-[10px] text-emerald-600 font-bold">+60 XP</span>
              </button>

              <button
                onClick={() => handleApplyQuest('extraCommunities', 1)}
                className="py-1.5 px-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between transition-colors cursor-pointer shadow-2xs"
              >
                <span>+ Join Hub</span>
                <span className="text-[10px] text-indigo-600 font-bold">+100 XP</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Bottom CTA */}
        <div className="pt-2 shrink-0 border-t border-slate-100 dark:border-slate-800 relative z-10">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white font-bold text-xs shadow-md transition-all active:scale-98 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
