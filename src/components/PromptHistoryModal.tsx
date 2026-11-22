import React, { useState } from 'react';
import {
  History,
  X,
  Search,
  Sparkles,
  Heart,
  Target,
  ArrowRight,
  Trash2,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { PromptHistoryItem } from '../types';

interface PromptHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  historyItems: PromptHistoryItem[];
  onSelectPrompt: (item: PromptHistoryItem) => void;
  onDeletePrompt?: (id: string) => void;
  onClearHistory?: () => void;
  activeHistoryId?: string | null;
}

export const PromptHistoryModal: React.FC<PromptHistoryModalProps> = ({
  isOpen,
  onClose,
  historyItems,
  onSelectPrompt,
  onDeletePrompt,
  onClearHistory,
  activeHistoryId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredItems = historyItems.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const inTitle = item.title.toLowerCase().includes(q);
    const inRaw = item.rawInput?.toLowerCase().includes(q);
    const inInterests = item.interests.some((i) => i.toLowerCase().includes(q));
    const inHobbies = item.hobbies.some((h) => h.toLowerCase().includes(q));
    const inGoals = item.goals.some((g) => g.toLowerCase().includes(q));
    const inServers = item.matchedServers.some((s) => s.name.toLowerCase().includes(q));
    return inTitle || inRaw || inInterests || inHobbies || inGoals || inServers;
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[28px] shadow-2xl border border-slate-200/80 dark:border-slate-800 text-left relative overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-200/60 dark:border-indigo-800/60 shadow-xs">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-display">
                  Prompt History
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80">
                  {historyItems.length} {historyItems.length === 1 ? 'record' : 'records'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Select a previous prompt to restore its keywords and view its matched servers.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Actions Bar */}
        <div className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search previous prompts or servers..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {historyItems.length > 0 && onClearHistory && (
            <button
              type="button"
              onClick={onClearHistory}
              className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer shrink-0"
              title="Clear all history"
            >
              Clear all
            </button>
          )}
        </div>

        {/* History List */}
        <div className="p-4 space-y-3.5 overflow-y-auto flex-1">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center space-y-3 bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center mx-auto text-slate-400 shadow-2xs">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div className="space-y-1 px-4">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {searchQuery ? 'No matching prompts found' : 'No prompt history yet'}
                </h4>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  {searchQuery
                    ? 'Try searching for different keywords or clear the search query.'
                    : 'Submit prompts for your interests, hobbies, and goals to track your community discovery history here.'}
                </p>
              </div>
            </div>
          ) : (
            filteredItems.map((item) => {
              const isActive = activeHistoryId === item.id;
              return (
                <div
                  key={item.id}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all text-left relative group ${
                    isActive
                      ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-xs ring-2 ring-indigo-500/20'
                      : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-indigo-300 dark:hover:border-slate-700 hover:shadow-xs'
                  }`}
                >
                  {/* Top row: Stage / Type + Timestamp + Delete */}
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-100/80 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
                        {item.stage === 'interests'
                          ? '1 · Interests'
                          : item.stage === 'hobbies'
                          ? '2 · Hobbies'
                          : item.stage === 'goals'
                          ? '3 · Goals'
                          : 'Full Onboarding'}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {item.timestamp}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {isActive && (
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span>Active on Home</span>
                        </span>
                      )}

                      {onDeletePrompt && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeletePrompt(item.id);
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="Delete this prompt record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Prompt Title */}
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                    {item.title}
                  </h4>

                  {/* Signals Pills */}
                  <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                    {item.interests.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-indigo-500" />
                        {item.interests.map((interest, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-medium"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    )}

                    {item.hobbies.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3 text-rose-500" />
                        {item.hobbies.map((hobby, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-medium"
                          >
                            {hobby}
                          </span>
                        ))}
                      </div>
                    )}

                    {item.goals.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Target className="w-3 h-3 text-emerald-500" />
                        {item.goals.map((goal, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-medium"
                          >
                            {goal}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Past Matched Servers Received */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Past Servers Received ({item.matchedServers.length})
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {item.matchedServers.slice(0, 3).map((server, sIdx) => (
                        <div
                          key={sIdx}
                          className="flex items-center justify-between gap-2 p-1.5 px-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={server.avatar}
                              alt={server.name}
                              className="w-5 h-5 rounded-md object-cover shrink-0"
                            />
                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                              {server.name}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono shrink-0">
                            {server.activeMembers} online
                          </span>
                        </div>
                      ))}

                      {item.matchedServers.length > 3 && (
                        <span className="text-[10px] text-slate-400 italic block pl-1">
                          + {item.matchedServers.length - 3} more servers
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Click to Restore Button */}
                  <div className="mt-3 pt-2 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => onSelectPrompt(item)}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 cursor-pointer"
                    >
                      <span>Show Past Servers on Home</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 text-center shrink-0">
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Clicking any historical prompt will immediately display its past received servers under Matched Communities.
          </p>
        </div>
      </div>
    </div>
  );
};
