import React, { useState } from 'react';
import {
  Sparkles,
  Crown,
  Check,
  X,
  ArrowRight,
  Wand2,
  RefreshCw,
  CheckCircle2,
  Briefcase,
  Eye,
  TrendingUp,
} from 'lucide-react';
import { UserPlan } from '../types';
import { PLAN_CONFIGS } from '../data/mockData';

interface PremiumUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlock: (plan?: UserPlan) => void;
  joinedCount?: number;
  currentPlan?: UserPlan;
  initialPlanTab?: 'free' | 'plus' | 'pro';
  zIndexClassName?: string;
}

export const PremiumUnlockModal: React.FC<PremiumUnlockModalProps> = ({
  isOpen,
  onClose,
  onUnlock,
  currentPlan = 'free',
  zIndexClassName = 'z-50',
}) => {
  const [unlockedPlan, setUnlockedPlan] = useState<UserPlan | null>(null);
  const [showJobModal, setShowJobModal] = useState<boolean>(false);
  const [selectedJobRole, setSelectedJobRole] = useState<'ai_architect' | 'distributed_lead' | 'crypto_engineer'>('ai_architect');
  const [generatedJobPitch, setGeneratedJobPitch] = useState<string>('');
  const [isGeneratingJob, setIsGeneratingJob] = useState<boolean>(false);

  React.useEffect(() => {
    if (isOpen) {
      setUnlockedPlan(null);
    }
  }, [isOpen, currentPlan]);

  const [isRegeneratingAi, setIsRegeneratingAi] = useState(false);
  const [aiSummary, setAiSummary] = useState(
    'Distinguished software engineer & machine learning researcher with 480+ GitHub contributions. Specialized in real-time WebCrypto protocols, distributed systems, and collaborative AI applications. Certified AWS Solutions Architect & open-source maintainer.'
  );

  if (!isOpen) return null;

  const handleSelectAndUnlock = (plan: UserPlan) => {
    if (plan === currentPlan) return;
    setUnlockedPlan(plan);
    onUnlock(plan);
    onClose();
  };

  const handleRegenerateAi = () => {
    setIsRegeneratingAi(true);
    setTimeout(() => {
      const summaries = [
        'Distinguished software engineer & machine learning researcher with 480+ GitHub contributions. Specialized in real-time WebCrypto protocols, distributed systems, and collaborative AI applications. Certified AWS Solutions Architect & open-source maintainer.',
        'High-impact full-stack engineer and open-source enthusiast. 14+ public repositories on GitHub across TypeScript and Python. Proven track record leading distributed team architectures with verified LinkedIn milestones.',
        'Pioneering developer specializing in privacy-first networking, AI-driven tooling, and community infrastructure. Active contributor to top decentralized tech with 500+ stars across GitHub projects.',
      ];
      const nextIndex = Math.floor(Math.random() * summaries.length);
      setAiSummary(summaries[nextIndex]);
      setIsRegeneratingAi(false);
    }, 600);
  };

  const handleGenerateJobPitch = (role: 'ai_architect' | 'distributed_lead' | 'crypto_engineer') => {
    setIsGeneratingJob(true);
    setSelectedJobRole(role);
    setTimeout(() => {
      const pitches = {
        ai_architect:
          'Dear Hiring Team, as a Senior AI Systems Architect with production experience deploying real-time low-latency LLM agent pipelines and edge inferencing clusters, I bring a strong background in distributed systems and verified GitHub open-source contributions. My work on decentralized WebCrypto infrastructure directly aligns with your high-throughput technical vision.',
        distributed_lead:
          'Hi team, I am writing to express my interest in the Distributed Systems Lead role. Having architected peer-to-peer federated mesh networks with zero-log guarantees and end-to-end encryption protocols on Cronium, I excel in fault-tolerant distributed consensus, high-availability data pipelines, and scalable microservices.',
        crypto_engineer:
          'Greetings, with specialized research in zero-knowledge proofs, hardware enclave attestation, and WebCrypto AES-GCM/ECDH encryption primitives, I am eager to contribute to your core security layer. My verified open-source cryptographic benchmarks demonstrate high reliability and mathematically verifiable privacy.',
      };
      setGeneratedJobPitch(pitches[role]);
      setIsGeneratingJob(false);
    }, 500);
  };

  return (
    <div className={`fixed inset-0 ${zIndexClassName} bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200`}>
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 relative overflow-hidden max-h-[90vh] flex flex-col transition-all duration-300">
        {/* Subtle decorative glow */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-80 h-80 bg-gradient-to-b from-indigo-500/20 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* State 1: Active Subscription Overview */}
        {unlockedPlan ? (
          <div className="p-5 sm:p-6 overflow-y-auto space-y-4 relative z-10 text-left">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer z-20"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header Badge */}
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-500 via-indigo-600 to-amber-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-purple-500/25 mb-3">
                <Crown className="w-7 h-7" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold mb-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>{PLAN_CONFIGS[unlockedPlan].name} Active</span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
                {PLAN_CONFIGS[unlockedPlan].price}
              </h2>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {PLAN_CONFIGS[unlockedPlan].tagline}
                </span>
                {unlockedPlan === 'plus' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 fill-emerald-100 dark:fill-emerald-950/60" />
                    Green badge verification
                  </span>
                )}
                {unlockedPlan === 'pro' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                    <CheckCircle2 className="w-3 h-3 text-amber-500 fill-amber-100 dark:fill-amber-950/60" />
                    Gold badge verification
                  </span>
                )}
              </div>
            </div>

            {/* Active Plan Limits Summary */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-medium">Servers</span>
                <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                  {unlockedPlan === 'pro'
                    ? '10 curated servers allowed'
                    : unlockedPlan === 'plus'
                    ? 'With 5 curated servers joining'
                    : '2 default servers'}
                </span>
              </div>
              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-medium">Connections</span>
                <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                  {unlockedPlan === 'pro'
                    ? 'Unlimited connections'
                    : unlockedPlan === 'plus'
                    ? 'Up to 50 connections / day'
                    : 'No more than 20 connections per day'}
                </span>
              </div>
              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-medium">Posts / day</span>
                <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                  {unlockedPlan === 'pro'
                    ? 'Daily feeds up to 40 posts / day'
                    : unlockedPlan === 'plus'
                    ? 'Read up to 30 posts / day'
                    : 'Only 20 posts views / day'}
                </span>
              </div>
            </div>

            {/* Boost impressions and know who views your profile (Plus & Pro) */}
            {(unlockedPlan === 'plus' || unlockedPlan === 'pro') && (
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-indigo-100 dark:border-indigo-900/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                      <Eye className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        Boost impressions and know who views your profile
                      </h4>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> +340% Impressions Boost Active
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                    4,820 Impressions
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-700/60 text-xs">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1.5">
                    Recent Profile Visitors (Last 24h):
                  </span>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {[
                      { name: 'Anna San', role: 'Staff ML Engineer', time: '12m ago' },
                      { name: 'Dr. Hiroshi Tanaka', role: 'Quantum Cryptographer', time: '45m ago' },
                      { name: 'Elena Rostova', role: 'Robotics Lead', time: '2h ago' },
                      { name: 'Liam Chen', role: 'Founding Partner', time: '4h ago' },
                    ].map((visitor, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0"
                      >
                        <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-[10px] flex items-center justify-center">
                          {visitor.name[0]}
                        </div>
                        <div className="text-[11px]">
                          <span className="font-semibold text-slate-900 dark:text-white block">{visitor.name}</span>
                          <span className="text-[9px] text-slate-400">{visitor.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* AI-driven Job application (Pro Feature) */}
            {unlockedPlan === 'pro' && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-50/90 to-indigo-50/90 dark:from-purple-950/40 dark:to-indigo-950/40 border border-purple-200/80 dark:border-purple-800/70 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        AI-driven Job application
                      </h4>
                      <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                        Custom AI Pitches for Verified Tech Opportunities
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (!generatedJobPitch) handleGenerateJobPitch('ai_architect');
                      setShowJobModal(true);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
                  >
                    <span>Generate Pitch</span>
                    <Wand2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* AI-powered profile and post editing (Pro Feature) */}
            {unlockedPlan === 'pro' && (
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                      <Wand2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        AI-powered profile and post editing
                      </h4>
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
                        Synthesizes GitHub, LinkedIn & Credentials
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleRegenerateAi}
                    disabled={isRegeneratingAi}
                    className="p-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Regenerate Bio with AI"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRegeneratingAi ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-indigo-100 dark:border-indigo-900/60 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                  {isRegeneratingAi ? (
                    <div className="py-2 text-center text-slate-400 flex items-center justify-center gap-2">
                      <Wand2 className="w-3.5 h-3.5 animate-pulse text-indigo-500" />
                      <span>Cronium AI is synthesizing your achievements...</span>
                    </div>
                  ) : (
                    <p>"{aiSummary}"</p>
                  )}
                </div>
              </div>
            )}

            {/* Ads Status Statement */}
            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Ads Experience:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {unlockedPlan === 'pro' ? 'No ads' : unlockedPlan === 'plus' ? 'Reduce Ads' : 'Ads'}
              </span>
            </div>

            {/* Upgrade to Cronium Pro button if user is currently on Cronium Plus */}
            {unlockedPlan === 'plus' && (
              <button
                onClick={() => {
                  handleSelectAndUnlock('pro');
                }}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 transition-transform active:scale-95 cursor-pointer mt-2"
              >
                <Sparkles className="w-4 h-4 fill-white" />
                <span>Upgrade to Cronium Pro — $0 first month, then $9.99 / month</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {/* Compare other plans link */}
            <button
              onClick={() => setUnlockedPlan(null)}
              className="w-full py-1 text-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer block"
            >
              Compare all subscription statements &amp; plans
            </button>

            {/* Done CTA */}
            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Continue with {PLAN_CONFIGS[unlockedPlan].name}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* State 0: Vertical Subscription Plans Layout (preserving exact Cronium statements & color palette) */
          <>
            {/* Fixed Modal Header */}
            <div className="px-5 pt-5 pb-3.5 flex items-start justify-between gap-3 shrink-0 relative z-10 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-start gap-3 text-left min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 via-indigo-600 to-amber-500 text-white flex items-center justify-center shadow-md shadow-purple-500/25 shrink-0">
                  <Crown className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white font-display tracking-tight leading-snug">
                    Choose Your Membership Tier
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                    Select the plan that matches your networking, community, and feed access needs.
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                aria-label="Close membership plans"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Vertical Stacked Subscription Plan Cards */}
            <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1 text-left relative z-10">
              {/* 1. Free tier Card */}
              <div
                className={`p-4 rounded-3xl transition-all ${
                  currentPlan === 'free'
                    ? 'bg-slate-50 dark:bg-slate-800/80 border-2 border-indigo-400 dark:border-indigo-500 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-display">
                      {PLAN_CONFIGS.free.name}
                    </h3>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mt-0.5">
                      {PLAN_CONFIGS.free.tagline}
                    </span>
                  </div>
                  <div className="text-right shrink-0 whitespace-nowrap">
                    <span className="text-base font-black text-slate-900 dark:text-white">$ 0</span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400"> / Month</span>
                  </div>
                </div>

                <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 mt-3.5">
                  {PLAN_CONFIGS.free.statements.map((statement, idx) => (
                    <li key={idx} className="flex items-start gap-2 font-medium leading-snug">
                      <Check className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 mt-0.5 shrink-0 stroke-[2.5]" />
                      <span>{statement}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4">
                  {currentPlan === 'free' ? (
                    <div
                      aria-disabled="true"
                      className="w-full py-2.5 px-4 rounded-full font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 bg-white dark:bg-slate-900 border-2 border-indigo-400 dark:border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-2xs cursor-default select-none pointer-events-none"
                    >
                      <span>Current Plan ✓</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSelectAndUnlock('free')}
                      className="w-full py-2.5 px-4 rounded-full font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-[0.98] bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200"
                    >
                      <span>Select Free tier</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 2. Cronium Plus Card */}
              <div
                className={`p-4 rounded-3xl transition-all ${
                  currentPlan === 'plus'
                    ? 'bg-indigo-50/80 dark:bg-indigo-950/50 border-2 border-indigo-500 dark:border-indigo-400 shadow-md'
                    : 'bg-indigo-50/70 dark:bg-indigo-950/40 border-2 border-indigo-300 dark:border-indigo-700 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-extrabold text-indigo-950 dark:text-white font-display">
                        {PLAN_CONFIGS.plus.name}
                      </h3>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-600 text-white uppercase tracking-wider shadow-2xs">
                        Popular
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 block mt-0.5">
                      {PLAN_CONFIGS.plus.tagline}
                    </span>
                  </div>
                  <div className="text-right shrink-0 whitespace-nowrap leading-tight">
                    <div className="flex items-baseline justify-end gap-1">
                      <span className="text-lg font-black text-indigo-950 dark:text-white">$0</span>
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        1st mo
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 block mt-0.5">
                      then $4.99 / month
                    </span>
                  </div>
                </div>

                <ul className="space-y-2 text-xs text-slate-800 dark:text-slate-200 mt-3.5">
                  {PLAN_CONFIGS.plus.statements.map((statement, idx) => (
                    <li key={idx} className="flex items-start gap-2 font-medium leading-snug">
                      <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0 stroke-[2.5]" />
                      <span className="flex items-center gap-1.5 flex-wrap">
                        <span>{statement}</span>
                        {statement.toLowerCase().includes('green badge') && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 fill-emerald-100 dark:fill-emerald-950/60 shrink-0" />
                        )}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4">
                  {currentPlan === 'plus' ? (
                    <div
                      aria-disabled="true"
                      className="w-full py-2.5 px-4 rounded-full font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 bg-white dark:bg-slate-900 border-2 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-2xs cursor-default select-none pointer-events-none"
                    >
                      <span>Current Plan ✓</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSelectAndUnlock('plus')}
                      className="w-full py-2.5 px-4 rounded-full font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-[0.98] bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20"
                    >
                      <span>Switch to Cronium Plus</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 3. Cronium Pro Card */}
              <div
                className={`p-4 rounded-3xl transition-all ${
                  currentPlan === 'pro'
                    ? 'bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/50 dark:to-indigo-950/50 border-2 border-purple-500 dark:border-purple-400 shadow-md'
                    : 'bg-gradient-to-br from-purple-50/90 to-indigo-50/90 dark:from-purple-950/40 dark:to-indigo-950/40 border-2 border-purple-400 dark:border-purple-600 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-extrabold text-purple-950 dark:text-white font-display flex items-center gap-1">
                        <span>{PLAN_CONFIGS.pro.name}</span>
                        <Sparkles className="w-3.5 h-3.5 text-purple-600 fill-purple-600" />
                      </h3>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white uppercase tracking-wider shadow-2xs">
                        Best Value
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-purple-700 dark:text-purple-300 block mt-0.5">
                      {PLAN_CONFIGS.pro.tagline}
                    </span>
                  </div>
                  <div className="text-right shrink-0 whitespace-nowrap leading-tight">
                    <div className="flex items-baseline justify-end gap-1">
                      <span className="text-lg font-black text-purple-950 dark:text-white">$0</span>
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        1st mo
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 block mt-0.5">
                      then $9.99 / month
                    </span>
                  </div>
                </div>

                <ul className="space-y-2 text-xs text-slate-800 dark:text-slate-200 mt-3.5">
                  {PLAN_CONFIGS.pro.statements.map((statement, idx) => (
                    <li key={idx} className="flex items-start gap-2 font-medium leading-snug">
                      <Check className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 mt-0.5 shrink-0 stroke-[2.5]" />
                      <span className="flex items-center gap-1.5 flex-wrap">
                        <span>{statement}</span>
                        {statement.toLowerCase().includes('job application') && (
                          <Briefcase className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                        )}
                        {statement.toLowerCase().includes('gold badge') && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 fill-amber-100 dark:fill-amber-950/60 shrink-0" />
                        )}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4">
                  {currentPlan === 'pro' ? (
                    <div
                      aria-disabled="true"
                      className="w-full py-2.5 px-4 rounded-full font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 bg-white dark:bg-slate-900 border-2 border-purple-500 text-purple-700 dark:text-purple-300 shadow-2xs cursor-default select-none pointer-events-none"
                    >
                      <span>Current Plan ✓</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSelectAndUnlock('pro')}
                      className="w-full py-2.5 px-4 rounded-full font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-[0.98] bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md shadow-purple-600/25"
                    >
                      <span>Switch to Cronium Pro</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* AI Job Application Modal (Pro Feature) */}
      {showJobModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 text-left space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
                    AI-driven Job application
                  </h3>
                  <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                    Cronium Pro Verified Pitch Generator
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowJobModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Target Role
              </label>
              <div className="grid grid-cols-3 gap-1.5 text-xs font-semibold">
                {[
                  { id: 'ai_architect', label: 'AI Architect' },
                  { id: 'distributed_lead', label: 'Systems Lead' },
                  { id: 'crypto_engineer', label: 'Crypto Eng' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleGenerateJobPitch(tab.id as 'ai_architect' | 'distributed_lead' | 'crypto_engineer')}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedJobRole === tab.id
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans min-h-[110px] flex items-center">
              {isGeneratingJob ? (
                <div className="flex items-center justify-center gap-2 w-full text-slate-400">
                  <Wand2 className="w-4 h-4 animate-spin text-purple-600" />
                  <span>Synthesizing application pitch with verified credentials...</span>
                </div>
              ) : (
                <p>{generatedJobPitch}</p>
              )}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedJobPitch);
                  setShowJobModal(false);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Copy Application Pitch</span>
              </button>
              <button
                onClick={() => setShowJobModal(false)}
                className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
