import React from 'react';
import { ArrowRight, Sparkles, X } from 'lucide-react';

export interface OnboardingGuidanceProps {
  step: 1 | 2;
  onNext: () => void;
  onSkip: () => void;
  className?: string;
}

export const OnboardingGuidance: React.FC<OnboardingGuidanceProps> = ({
  step,
  onNext,
  onSkip,
  className = '',
}) => {
  return (
    <aside
      aria-label={`Onboarding guidance step ${step}`}
      className={`w-full my-2 animate-in fade-in slide-in-from-top-2 duration-300 z-30 ${className}`}
    >
      {/* Indigo Guidance Card (Matching the colour of the History icon) with Speech-Bubble Pointer */}
      <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#EEF2FF] via-[#E0E7FF] to-[#EDE9FE] dark:from-[#0F172A] dark:via-[#1E1B4B] dark:to-[#0F172A] text-indigo-950 dark:text-indigo-100 p-4 sm:p-5 shadow-xl shadow-indigo-900/10 dark:shadow-2xl border-2 border-indigo-200 dark:border-indigo-800 ring-4 ring-indigo-400/20 dark:ring-indigo-500/15 text-left transition-all duration-300">
        {/* Soft Ambient Glow */}
        <div className="absolute -top-8 -right-8 w-28 h-28 bg-indigo-400/20 dark:bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-blue-400/15 dark:bg-blue-500/10 rounded-full blur-xl pointer-events-none" />

        {/* Top Header Badge & Quick Dismiss */}
        <div className="flex items-center justify-between gap-2 mb-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse shrink-0" />
            <span className="text-[11px] font-extrabold tracking-wider uppercase text-indigo-700 dark:text-indigo-300 bg-indigo-100/90 dark:bg-indigo-950/80 px-2.5 py-0.5 rounded-full border border-indigo-200/80 dark:border-indigo-800/60 flex items-center gap-1.5 shadow-2xs">
              <Sparkles className="w-3 h-3 text-indigo-600 dark:text-indigo-400 fill-indigo-500" />
              <span>Step {step} of 2</span>
            </span>
          </div>

          {/* Quick Skip X button */}
          <button
            onClick={onSkip}
            className="text-[11px] font-bold text-indigo-700/80 dark:text-indigo-300/80 hover:text-indigo-950 dark:hover:text-indigo-100 px-2 py-0.5 rounded-lg hover:bg-indigo-100/70 dark:hover:bg-indigo-900/40 transition-colors cursor-pointer flex items-center gap-1"
            title="Skip guidance and do not show again"
          >
            <span>Skip</span>
            <X className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
          </button>
        </div>

        {/* The Exact Guidance Text */}
        <p className="text-xs sm:text-[13.5px] font-semibold leading-relaxed text-indigo-950 dark:text-indigo-50 pr-1 relative z-10">
          {step === 1
            ? 'Step 1: Here, it is a prompt bar for you to type or tap the mic button to speak your topics, offline fun, and goals. Once you finish, tap Find my communities below.'
            : "Step 2: Lastly, if you don't have ideas for prompts, please tap Popular topics to see the trends."}
        </p>

        {/* Two Options: Skip or Next */}
        <div className="flex items-center justify-between gap-2.5 pt-3 mt-3 border-t border-indigo-200/80 dark:border-indigo-800/60 relative z-10">
          <button
            type="button"
            onClick={onSkip}
            className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:text-indigo-950 dark:hover:text-white hover:bg-indigo-100/70 dark:hover:bg-indigo-900/40 transition-all cursor-pointer active:scale-95 border border-indigo-200 dark:border-indigo-800 shadow-2xs"
          >
            Skip
          </button>

          <button
            type="button"
            onClick={onNext}
            className="px-4 py-1.5 sm:px-5 sm:py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-extrabold shadow-md shadow-indigo-600/25 flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            <span>{step === 1 ? 'Next' : 'Next (Finish)'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Pointer Arrow matching History icon indigo color */}
        <div
          aria-hidden="true"
          className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-[#E0E7FF] dark:bg-[#1E1B4B] border-r-2 border-b-2 border-indigo-200 dark:border-indigo-800 rotate-45 transform"
        />
      </div>
    </aside>
  );
};
