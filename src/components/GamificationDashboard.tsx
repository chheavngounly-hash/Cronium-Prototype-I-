import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Gift,
  ChevronDown,
  ChevronUp,
  X,
  Zap,
  Sparkles,
} from 'lucide-react';
import {
  gamificationService,
  INITIAL_GAMIFICATION_TASKS,
  GamificationTask,
} from '../utils/gamificationService';
import { notificationService } from '../services/notifications';

interface GamificationDashboardProps {
  onServerSlotsUpdated?: (newTotalBonus: number) => void;
  onFeedViewsUnlocked?: (bonusViews: number) => void;
  onNavigateToFeed?: () => void;
  onNavigateToServers?: () => void;
  mode?: 'servers' | 'feed';
  isModal?: boolean;
  onClose?: () => void;
  className?: string;
}

export const GamificationDashboard: React.FC<GamificationDashboardProps> = ({
  onServerSlotsUpdated,
  onFeedViewsUnlocked,
  mode = 'servers',
  isModal = false,
  onClose,
  className = '',
}) => {
  const [bonusSlots, setBonusSlots] = useState(() => gamificationService.getBonusServerSlots());
  const [bonusFeedViews, setBonusFeedViews] = useState(() => gamificationService.getBonusFeedViews());
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>(() =>
    gamificationService.getCompletedTaskIds()
  );
  const [completedFeedTaskIds, setCompletedFeedTaskIds] = useState<string[]>(() =>
    gamificationService.getCompletedFeedTaskIds()
  );
  const [showCompleted, setShowCompleted] = useState(mode === 'feed');

  useEffect(() => {
    return gamificationService.subscribe(() => {
      const updatedBonus = gamificationService.getBonusServerSlots();
      const updatedFeedBonus = gamificationService.getBonusFeedViews();
      setBonusSlots(updatedBonus);
      setBonusFeedViews(updatedFeedBonus);
      setCompletedTaskIds(gamificationService.getCompletedTaskIds());
      setCompletedFeedTaskIds(gamificationService.getCompletedFeedTaskIds());
      onServerSlotsUpdated?.(updatedBonus);
      onFeedViewsUnlocked?.(updatedFeedBonus);
    });
  }, [onServerSlotsUpdated, onFeedViewsUnlocked]);

  const activeCompletedIds = mode === 'feed' ? completedFeedTaskIds : completedTaskIds;
  const completedCount = activeCompletedIds.length;
  const totalTasks = INITIAL_GAMIFICATION_TASKS.length;
  const totalPossibleSlots = INITIAL_GAMIFICATION_TASKS.reduce(
    (sum, task) => sum + task.rewardSlots,
    0
  );

  const handleClaimTask = (task: GamificationTask) => {
    if (activeCompletedIds.includes(task.id)) return;

    if (mode === 'feed') {
      const res = gamificationService.completeFeedTask(task.id);
      if (res.success) {
        notificationService.playSentChime();
        notificationService.notify(
          `🎉 +${res.earnedViews} Feed Views Unlocked!`,
          `You completed "${task.title}" and unlocked +${res.earnedViews} extra daily post views!`
        );
      }
      return;
    }

    const res = gamificationService.completeTask(task.id);
    if (res.success) {
      notificationService.playSentChime();
      notificationService.notify(
        `🎉 Server Slot Unlocked!`,
        `You completed "${task.title}" and earned +${task.rewardSlots} extra server slot! Total capacity: ${2 + res.totalSlots} servers.`
      );
    }
  };

  const content = (
    <div id="gamification-dashboard" className={`w-full ${className}`}>
      {/* Standalone Earn Servers / Milestones Bar */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_10px_rgba(15,23,42,0.03)] overflow-hidden transition-all">
        {/* Clickable Header Bar */}
        <div
          onClick={() => setShowCompleted((prev) => !prev)}
          className="px-4 py-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors select-none group"
          title="Click to see tasks"
        >
          <div className="flex items-center gap-3.5 min-w-0 flex-1 text-left">
            <div className="w-11 h-11 rounded-2xl bg-[#EEF2FF] dark:bg-indigo-950/80 text-[#6366F1] dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Gift className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-[15px] font-bold text-slate-900 dark:text-white leading-snug truncate">
                {mode === 'feed' ? 'Milestones · +10 Views' : 'Earn Servers'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {mode === 'feed'
                  ? `${completedCount} of ${totalTasks} milestones claimed`
                  : `${bonusSlots} of ${totalPossibleSlots} slots claimed`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 text-xs font-semibold tabular-nums whitespace-nowrap">
              {mode === 'feed' ? `+${bonusFeedViews} views` : `+${bonusSlots} slots`}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${
                showCompleted ? 'rotate-180 text-indigo-600 dark:text-indigo-400' : ''
              }`}
            />
            {isModal && onClose && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Clickable Expanded View: Tasks to complete and earn server slots */}
        {showCompleted && (
          <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2.5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                Platform Tasks ({completedCount}/{totalTasks} Completed)
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                {mode === 'feed'
                  ? `+${bonusFeedViews} Feed Views Unlocked`
                  : `+${bonusSlots} Server Slots Unlocked`}
              </span>
            </div>

            <div className="space-y-2">
              {INITIAL_GAMIFICATION_TASKS.map((task) => {
                const isClaimed = activeCompletedIds.includes(task.id);
                const rewardLabel =
                  mode === 'feed' ? `+${task.rewardSlots * 10} Views` : `+${task.rewardSlots} Slot`;
                return (
                  <div
                    key={task.id}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 text-left ${
                      isClaimed
                        ? 'bg-slate-50/70 dark:bg-slate-800/40 border-emerald-100 dark:border-emerald-900/40 opacity-90'
                        : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700/80 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          isClaimed
                            ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400'
                            : 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400'
                        }`}
                      >
                        {isClaimed ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {task.title}
                          </h5>
                          <span
                            className={`px-2 py-0.2 rounded-full text-[10px] font-extrabold ${
                              isClaimed
                                ? 'bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                                : 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800'
                            }`}
                          >
                            {rewardLabel}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                          {task.description}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isClaimed ? (
                        <span className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold border border-emerald-200/60 dark:border-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Claimed</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleClaimTask(task)}
                          className="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-[11px] font-bold flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                        >
                          <Zap className="w-3 h-3 text-amber-300 fill-amber-300" />
                          <span>Claim</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-1 flex justify-center">
              <button
                type="button"
                onClick={() => setShowCompleted(false)}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors cursor-pointer active:scale-95"
              >
                <span>Show less</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      >
        <div
          className="w-full max-w-lg max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {content}
        </div>
      </div>
    );
  }

  return content;
};
