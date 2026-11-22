import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Sparkles, ArrowRight, ArrowLeft, Mic, Square, Check, ChevronRight, ChevronDown, X, Lock, Target, Heart, History, Zap, Plus, Send, MessageSquare } from 'lucide-react';
import { Community, PromptHistoryItem, UserPlan } from '../types';
import { notificationService } from '../services/notifications';
import { PremiumUnlockModal } from './PremiumUnlockModal';
import { CroniumLogo } from './CroniumLogo';
import { ServerAvatar } from './ServerAvatar';
import { getTopFiveRelevantServers, extractTopicsFromPrompt, ensureUniqueServers } from '../utils/serverMatcher';
import { OnboardingGuidance } from './OnboardingGuidance';
import { PromptHistoryModal } from './PromptHistoryModal';
import { loadPromptHistory, savePromptHistoryItem, deletePromptHistoryItem, clearAllPromptHistory } from '../data/promptHistoryData';
import { GamificationDashboard } from './GamificationDashboard';
import { gamificationService } from '../utils/gamificationService';
import { useVoiceCapture, VoicePromptStage } from '../hooks/useVoiceCapture';

// Attached-image pill style: soft slate pill when unselected; solid indigo with checkmark when selected
const ML_BAR_STYLE = {
  bg: 'bg-[#EFF3F8] hover:bg-[#E2E8F0] dark:bg-slate-800 dark:hover:bg-slate-700',
  text: 'text-[#334155] dark:text-slate-200',
  selected: 'bg-[#4F46E5] text-white font-semibold shadow-xs',
};

// Popular interests bars: previous 2 rows + a few concise additions (no sideways overflow)
const ROW_1_INTERESTS = [
  { name: 'Machine Learning', ...ML_BAR_STYLE },
  { name: 'Space', ...ML_BAR_STYLE },
  { name: 'Gaming', ...ML_BAR_STYLE },
];

const ROW_2_INTERESTS = [
  { name: 'Physics', ...ML_BAR_STYLE },
  { name: 'Travel', ...ML_BAR_STYLE },
  { name: 'Music', ...ML_BAR_STYLE },
];

const ROW_3_INTERESTS = [
  { name: 'Robotics', ...ML_BAR_STYLE },
  { name: 'Biotech', ...ML_BAR_STYLE },
  { name: 'Security', ...ML_BAR_STYLE },
];

// Popular Hobbies for Step 2 Prompt: previous 2 rows + a few concise additions
const ROW_1_HOBBIES = [
  { name: 'Photography', ...ML_BAR_STYLE },
  { name: 'Chess', ...ML_BAR_STYLE },
  { name: 'Digital Art', ...ML_BAR_STYLE },
];

const ROW_2_HOBBIES = [
  { name: 'Reading', ...ML_BAR_STYLE },
  { name: 'Hiking', ...ML_BAR_STYLE },
  { name: 'Music Production', ...ML_BAR_STYLE },
];

const ROW_3_HOBBIES = [
  { name: '3D Printing', ...ML_BAR_STYLE },
  { name: 'Synths', ...ML_BAR_STYLE },
  { name: 'Coffee', ...ML_BAR_STYLE },
];

// Popular Goals for Step 3 Prompt: previous 2 rows + a few concise additions
const ROW_1_GOALS = [
  { name: 'Build an AI Startup', ...ML_BAR_STYLE },
  { name: 'Find Hackathon Team', ...ML_BAR_STYLE },
  { name: 'Publish Research', ...ML_BAR_STYLE },
];

const ROW_2_GOALS = [
  { name: 'Open-Source Projects', ...ML_BAR_STYLE },
  { name: 'Learn Robotics', ...ML_BAR_STYLE },
  { name: 'Career Mentorship', ...ML_BAR_STYLE },
];

const ROW_3_GOALS = [
  { name: 'Ship an MVP', ...ML_BAR_STYLE },
  { name: 'Study Group', ...ML_BAR_STYLE },
  { name: 'Co-Founder', ...ML_BAR_STYLE },
];

const VOICE_BAR_HEIGHT_CLASSES = ['h-1.5', 'h-2', 'h-2.5', 'h-3.5', 'h-4'];

interface HomeScreenProps {
  onFindCommunities?: (
    selectedInterests: string[],
    promptDetails?: { interests: string[]; hobbies: string[]; goals: string[] },
    isSilent?: boolean | { silent?: boolean }
  ) => void;
  onOpenNotifications?: () => void;
  unreadNotificationsCount?: number;
  communities?: Community[];
  onToggleJoin?: (communityId: string, community?: Community, forceJoin?: boolean) => void;
  onOpenCommunity?: (community: Community, justJoined?: boolean) => void;
  onNavigateToServers?: () => void;
  onNavigateToProfile?: () => void;
  hasPrompted?: boolean;
  savedInterests?: string[];
  savedHobbies?: string[];
  savedGoals?: string[];
  userPlan?: UserPlan;
  onUnlockPlan?: (plan: UserPlan) => void;
  bottomNav?: React.ReactNode;
}

// Minimalist, compact progress indicator: simpler, sleek, and takes up minimal vertical space
const CurvedProgressBar: React.FC<{
  currentStep: 1 | 2 | 3 | 4; // 1 = Interests, 2 = Hobbies, 3 = Goals, 4 = Completed
  itemCount?: number;
  hasInput?: boolean;
}> = ({ currentStep, itemCount = 0, hasInput = false }) => {
  let progressPercent = 33;
  let stepTitle = 'Step 1 of 3 · Topics';

  if (currentStep === 1) {
    const filledBonus = (hasInput ? 8 : 0) + Math.min(15, itemCount * 7);
    progressPercent = Math.min(33.3, 15 + filledBonus);
    stepTitle = 'Step 1 of 3 · Topics';
  } else if (currentStep === 2) {
    const filledBonus = (hasInput ? 8 : 0) + Math.min(18, itemCount * 8);
    progressPercent = Math.min(66.6, 45 + filledBonus);
    stepTitle = 'Step 2 of 3 · Offline & Fun';
  } else if (currentStep === 3) {
    const filledBonus = (hasInput ? 8 : 0) + Math.min(18, itemCount * 8);
    progressPercent = Math.min(95, 76 + filledBonus);
    stepTitle = 'Step 3 of 3 · Right Now';
  } else {
    progressPercent = 100;
    stepTitle = 'All Prompts Completed';
  }

  return (
    <div className="w-full max-w-md mx-auto py-0.5 px-0.5 space-y-1 text-left">
      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse shrink-0" />
          <span>{stepTitle}</span>
        </span>
        <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono text-[11px]">
          {Math.round(progressPercent)}%
        </span>
      </div>

      {/* Minimalist 3-segment progress indicator - ultra clean, simple, and space-saving */}
      <div className="grid grid-cols-3 gap-1.5 w-full">
        <div className="h-1 rounded-full bg-slate-200/90 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-400 dark:to-indigo-500 rounded-full transition-all duration-300"
            style={{
              width: currentStep > 1 ? '100%' : `${Math.min(100, (progressPercent / 33.3) * 100)}%`,
            }}
          />
        </div>
        <div className="h-1 rounded-full bg-slate-200/90 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-rose-500 dark:from-indigo-400 dark:to-rose-400 rounded-full transition-all duration-300"
            style={{
              width:
                currentStep > 2
                  ? '100%'
                  : currentStep === 2
                  ? `${Math.min(100, Math.max(10, ((progressPercent - 33.3) / 33.3) * 100))}%`
                  : '0%',
            }}
          />
        </div>
        <div className="h-1 rounded-full bg-slate-200/90 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-rose-500 to-emerald-500 dark:from-rose-400 dark:to-emerald-400 rounded-full transition-all duration-300"
            style={{
              width:
                currentStep >= 4
                  ? '100%'
                  : currentStep === 3
                  ? `${Math.min(100, Math.max(10, ((progressPercent - 66.6) / 33.4) * 100))}%`
                  : '0%',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onFindCommunities,
  onOpenNotifications,
  unreadNotificationsCount = 0,
  communities = [],
  onToggleJoin,
  onOpenCommunity,
  onNavigateToServers,
  onNavigateToProfile,
  hasPrompted = false,
  savedInterests,
  savedHobbies,
  savedGoals,
  userPlan = 'free',
  onUnlockPlan,
  bottomNav,
}) => {
  // Multi-step onboarding prompts: 'interests' -> 'hobbies' -> 'goals' -> 'completed'
  const [promptStage, setPromptStage] = useState<'interests' | 'hobbies' | 'goals' | 'completed'>(
    hasPrompted ? 'completed' : 'interests'
  );

  // Active loop step once onboarding is finished or in loop mode: 'interests' | 'hobbies' | 'goals' | null
  // Defaults to null so no outline selection is shown by default until an interest/step is clicked
  const [loopStage, setLoopStage] = useState<'interests' | 'hobbies' | 'goals' | null>(null);

  // Prompt History & Past Servers state
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [promptHistory, setPromptHistory] = useState<PromptHistoryItem[]>(() => loadPromptHistory());
  const [activeHistoryPrompt, setActiveHistoryPrompt] = useState<PromptHistoryItem | null>(null);

  // Interests state (Prompt 1) - Popular interests with interest bars below shown by default (none pre-selected)
  const [interestInput, setInterestInput] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [promptedInterests, setPromptedInterests] = useState<string[] | null>(
    hasPrompted ? (savedInterests || null) : null
  );
  const [showBrainstormInterests, setShowBrainstormInterests] = useState(true);

  // Hobbies state (Prompt 2) - Starts in clean non-selected state
  const [hobbyInput, setHobbyInput] = useState('');
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);
  const [promptedHobbies, setPromptedHobbies] = useState<string[] | null>(
    hasPrompted ? (savedHobbies || null) : null
  );
  const [showBrainstormHobbies, setShowBrainstormHobbies] = useState(true);

  // Goals state (Prompt 3) - Starts in clean non-selected state
  const [goalInput, setGoalInput] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [promptedGoals, setPromptedGoals] = useState<string[] | null>(
    hasPrompted ? (savedGoals || null) : null
  );
  const [showBrainstormGoals, setShowBrainstormGoals] = useState(true);

  // Bonus server slots from gamification dashboard quests
  const [bonusSlotsState, setBonusSlotsState] = useState(() => gamificationService.getBonusServerSlots());
  const [showGamificationModal, setShowGamificationModal] = useState(false);

  useEffect(() => {
    return gamificationService.subscribe(() => {
      setBonusSlotsState(gamificationService.getBonusServerSlots());
    });
  }, []);

  const [pendingCommunity, setPendingCommunity] = useState<Community | null>(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [promptGuidanceMessage, setPromptGuidanceMessage] = useState<string | null>(null);

  // "All features unlocked! Continuous prompt loop active." temporary banner
  // Appears only once and shows shortly after sending three prompts each time
  const [showUnlockedStatement, setShowUnlockedStatement] = useState(false);
  const unlockedStatementTimerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerUnlockedStatement = () => {
    if (unlockedStatementTimerRef.current) {
      clearTimeout(unlockedStatementTimerRef.current);
    }
    // Show shortly (300ms) after sending three prompts
    setTimeout(() => {
      setShowUnlockedStatement(true);
      unlockedStatementTimerRef.current = setTimeout(() => {
        setShowUnlockedStatement(false);
      }, 4200); // Stays visible briefly then smoothly dismisses
    }, 300);
  };

  const homeScrollRef = useRef<HTMLDivElement>(null);
  const matchedCommunitiesRef = useRef<HTMLDivElement>(null);
  const pendingScrollToMatchesRef = useRef(false);
  const scrollTimerRef = useRef<number | null>(null);

  const scrollToMatchedCommunities = (behavior: ScrollBehavior = 'smooth') => {
    const container = homeScrollRef.current;
    const target =
      matchedCommunitiesRef.current || document.getElementById('matched-communities-section');
    if (container && target) {
      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const topOffset = container.scrollTop + (targetRect.top - containerRect.top) - 12;
      container.scrollTo({
        top: Math.max(0, topOffset),
        behavior,
      });
    } else if (target) {
      target.scrollIntoView({ behavior, block: 'start' });
    }
  };

  useEffect(() => {
    return () => {
      if (unlockedStatementTimerRef.current) {
        clearTimeout(unlockedStatementTimerRef.current);
      }
      if (scrollTimerRef.current !== null) {
        window.clearTimeout(scrollTimerRef.current);
      }
    };
  }, []);

  // Feedback bar -> send-only submission via server-side /api/feedback proxy (eliminates CORS errors on spreadsheet webhooks)
  const rawFeedbackWebhookUrl = (import.meta.env.VITE_FEEDBACK_WEBHOOK_URL || '').trim();
  const extractedClientWebhookMatch = rawFeedbackWebhookUrl.match(/https?:\/\/[^\s"'`<>]+/i);
  const FEEDBACK_WEBHOOK_URL = extractedClientWebhookMatch ? extractedClientWebhookMatch[0] : '';
  const feedbackInputRef = useRef<HTMLInputElement>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);
  const [feedbackSentNotice, setFeedbackSentNotice] = useState<string | null>(null);
  const [feedbackHint, setFeedbackHint] = useState<string | null>(null);

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSendingFeedback) return;

    const trimmed = feedbackText.trim();
    if (!trimmed) {
      setFeedbackHint('Write your feedback or comments before sending.');
      feedbackInputRef.current?.focus();
      return;
    }

    setFeedbackHint(null);
    setFeedbackSentNotice(null);
    setIsSendingFeedback(true);

    try {
      const apiRes = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: trimmed }),
      });

      if (apiRes.status !== 404) {
        const payload = await apiRes.json().catch(() => null);
        if (!apiRes.ok) {
          setFeedbackHint(
            payload?.error || 'Could not send feedback right now. Please try again.'
          );
          setIsSendingFeedback(false);
          return;
        }
        notificationService.playSentChime();
        setFeedbackText('');
        setFeedbackSentNotice('Feedback sent! Thank you.');
        setIsSendingFeedback(false);
        return;
      }

      // Fallback only if backend proxy route is unavailable (404)
      if (FEEDBACK_WEBHOOK_URL) {
        const lowerUrl = FEEDBACK_WEBHOOK_URL.toLowerCase();
        if (
          (lowerUrl.includes('sharepoint.com/:x:') ||
            lowerUrl.includes('onedrive.live.com') ||
            lowerUrl.includes('1drv.ms'))
        ) {
          setFeedbackHint(
            'A SharePoint Excel view link cannot accept direct writes. Use a Power Automate HTTP webhook URL.'
          );
          setIsSendingFeedback(false);
          return;
        }

        const body = JSON.stringify({
          comment: trimmed,
          feedback: trimmed,
          message: trimmed,
          submittedAt: new Date().toISOString(),
        });

        try {
          const directRes = await fetch(FEEDBACK_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body,
          });
          if (!directRes.ok) {
            throw new Error(`HTTP ${directRes.status}`);
          }
        } catch {
          // Retry with opaque no-cors simple POST when endpoint lacks CORS headers
          await fetch(FEEDBACK_WEBHOOK_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body,
          });
        }
      }

      notificationService.playSentChime();
      setFeedbackText('');
      setFeedbackSentNotice('Feedback sent! Thank you.');
    } catch {
      setFeedbackHint('Could not send feedback right now. Please try again.');
    } finally {
      setIsSendingFeedback(false);
    }
  };
  
  // Step-by-step guidance on first open: Step 1 (Prompt bar) -> Step 2 (Popular interests)
  const [guidanceStep, setGuidanceStep] = useState<1 | 2 | null>(() => {
    try {
      const dismissed = localStorage.getItem('cronium_onboarding_guidance_dismissed');
      return dismissed === 'true' ? null : 1;
    } catch {
      return 1;
    }
  });

  const handleSkipGuidance = () => {
    setGuidanceStep(null);
    try {
      localStorage.setItem('cronium_onboarding_guidance_dismissed', 'true');
    } catch {
      // ignore storage errors
    }
  };

  const handleNextGuidance = () => {
    if (guidanceStep === 1) {
      setGuidanceStep(2);
      setShowBrainstormInterests(true);
    } else {
      setGuidanceStep(null);
      try {
        localStorage.setItem('cronium_onboarding_guidance_dismissed', 'true');
      } catch {
        // ignore storage errors
      }
    }
  };

  const promptTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const hobbyTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const goalTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  const {
    isRecording,
    recordingStage,
    audioLevels,
    toggleRecording,
    stopRecording,
  } = useVoiceCapture();

  // Synchronize completed state if hasPrompted is true externally
  useEffect(() => {
    if (hasPrompted) {
      setPromptStage('completed');
    }
  }, [hasPrompted]);

  // Joined count & slot allowance
  const joinedCount = communities.filter((c) => c.joined).length;
  const maxAllowedSlots = userPlan === 'pro' ? 10 : userPlan === 'plus' ? 5 : 2 + bonusSlotsState;

  /**
   * Justifies answers accordingly by changing and re-ranking servers when users enter differently,
   * matching custom servers and tailored images dynamically, and advancing the prompt loop if requested.
   */
  const justifyAnswersAndShiftServers = (
    stage: 'interests' | 'hobbies' | 'goals',
    newItems: string[],
    advanceLoop: boolean = false
  ) => {
    let currentInterests = (promptedInterests && promptedInterests.length > 0) ? promptedInterests : selectedInterests;
    let currentHobbies = (promptedHobbies && promptedHobbies.length > 0) ? promptedHobbies : selectedHobbies;
    let currentGoals = (promptedGoals && promptedGoals.length > 0) ? promptedGoals : selectedGoals;

    if (stage === 'interests') {
      currentInterests = newItems;
      setPromptedInterests(newItems);
      if (!advanceLoop) setSelectedInterests(newItems);
    } else if (stage === 'hobbies') {
      currentHobbies = newItems;
      setPromptedHobbies(newItems);
      if (!advanceLoop) setSelectedHobbies(newItems);
    } else if (stage === 'goals') {
      currentGoals = newItems;
      setPromptedGoals(newItems);
      if (!advanceLoop) setSelectedGoals(newItems);
    }

    const allSignals = Array.from(
      new Set([...currentInterests, ...currentHobbies, ...currentGoals])
    );

    // Sound is ONLY heard after sending the last prompt (the third prompt - goals only)
    const isThirdPrompt = stage === 'goals' && advanceLoop;
    if (isThirdPrompt) {
      triggerUnlockedStatement();
    }
    onFindCommunities?.(
      allSignals,
      {
        interests: currentInterests,
        hobbies: currentHobbies,
        goals: currentGoals,
      },
      !isThirdPrompt // Silent while typing and for prompts 1 & 2; sound plays ONLY after sending the 3rd prompt!
    );

    if (advanceLoop) {
      if (stage === 'interests') {
        setLoopStage('hobbies');
      } else if (stage === 'hobbies') {
        setLoopStage('goals');
      } else {
        setLoopStage('interests');
      }
    }
  };

  // Helper to add or toggle an item in a comma-separated string
  const computeToggledItems = (currentInput: string, itemToToggle: string): string[] => {
    const trimmed = currentInput.trim();
    if (!trimmed) {
      return [itemToToggle];
    }
    const items = trimmed
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const existsIndex = items.findIndex(
      (item) => item.toLowerCase() === itemToToggle.toLowerCase()
    );
    if (existsIndex >= 0) {
      return items.filter((_, i) => i !== existsIndex);
    }
    return [...items, itemToToggle];
  };

  // When an interest box is clicked, add/toggle it directly in the prompt bar and activate outline selection
  const toggleInterest = (interestName: string) => {
    setPromptGuidanceMessage(null);
    if (hasPrompted) {
      setLoopStage('interests');
    }
    const updatedItems = computeToggledItems(interestInput, interestName);
    setInterestInput(updatedItems.join(', '));
    setSelectedInterests(updatedItems);
    if (hasPrompted && updatedItems.length > 0) {
      justifyAnswersAndShiftServers('interests', updatedItems, false);
    }
  };

  // Toggle hobby into Hobbies prompt bar
  const toggleHobby = (hobbyName: string) => {
    setPromptGuidanceMessage(null);
    if (hasPrompted) {
      setLoopStage('hobbies');
    }
    const updatedItems = computeToggledItems(hobbyInput, hobbyName);
    setHobbyInput(updatedItems.join(', '));
    setSelectedHobbies(updatedItems);
    if (hasPrompted && updatedItems.length > 0) {
      justifyAnswersAndShiftServers('hobbies', updatedItems, false);
    }
  };

  // Toggle goal into Goals prompt bar
  const toggleGoal = (goalName: string) => {
    setPromptGuidanceMessage(null);
    if (hasPrompted) {
      setLoopStage('goals');
    }
    const updatedItems = computeToggledItems(goalInput, goalName);
    setGoalInput(updatedItems.join(', '));
    setSelectedGoals(updatedItems);
    if (hasPrompted && updatedItems.length > 0) {
      justifyAnswersAndShiftServers('goals', updatedItems, false);
    }
  };

  const handleVoiceTranscript = (fullText: string, stage: VoicePromptStage) => {
    setPromptGuidanceMessage(null);
    const parsed = extractTopicsFromPrompt(fullText);

    if (stage === 'interests') {
      setInterestInput(fullText);
      setSelectedInterests(parsed);
      if (hasPrompted && parsed.length > 0) {
        justifyAnswersAndShiftServers('interests', parsed, false);
      }
    } else if (stage === 'hobbies') {
      setHobbyInput(fullText);
      setSelectedHobbies(parsed);
      if (hasPrompted && parsed.length > 0) {
        justifyAnswersAndShiftServers('hobbies', parsed, false);
      }
    } else {
      setGoalInput(fullText);
      setSelectedGoals(parsed);
      if (hasPrompted && parsed.length > 0) {
        justifyAnswersAndShiftServers('goals', parsed, false);
      }
    }
  };

  // Step 1: Submit Interests -> Transitions to Step 2 Hobbies in a separate interface
  // NOTE: Does NOT unlock the other two features yet!
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isRecording) stopRecording();
    const parsed = extractTopicsFromPrompt(interestInput);
    const toPrompt = parsed.length > 0 ? parsed : selectedInterests;

    if (toPrompt.length === 0 && !interestInput.trim()) {
      setPromptGuidanceMessage("Enter a prompt above to find people like you");
      promptTextareaRef.current?.focus();
      return;
    }

    setPromptedInterests(toPrompt);
    setSelectedInterests(toPrompt);
    setPromptGuidanceMessage(null);
    // Move to second prompt: Hobbies (separate interface; other two features remain hidden)
    setPromptStage('hobbies');
  };

  // Step 2: Submit Hobbies -> Transitions to Step 3 Goals in a separate interface
  // NOTE: Does NOT unlock the other two features yet!
  const handleHobbiesSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isRecording) stopRecording();
    const parsed = extractTopicsFromPrompt(hobbyInput);
    const toHobbies = parsed.length > 0 ? parsed : selectedHobbies;

    if (toHobbies.length === 0 && !hobbyInput.trim()) {
      setPromptGuidanceMessage("Enter your hobbies above or choose from popular suggestions");
      hobbyTextareaRef.current?.focus();
      return;
    }

    setPromptedHobbies(toHobbies);
    setSelectedHobbies(toHobbies);
    setPromptGuidanceMessage(null);
    // Move to third prompt: Goals (different interface; other two features still hidden)
    setPromptStage('goals');
  };

  // Step 3: Submit Goals -> Completes onboarding, unlocks all features & finds communities
  const handleGoalsSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isRecording) stopRecording();
    const parsed = extractTopicsFromPrompt(goalInput);
    const toGoals = parsed.length > 0 ? parsed : selectedGoals;

    if (toGoals.length === 0 && !goalInput.trim()) {
      setPromptGuidanceMessage("Enter your goals above or choose from popular suggestions");
      goalTextareaRef.current?.focus();
      return;
    }

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    setPromptedGoals(toGoals);
    setPromptGuidanceMessage(null);
    pendingScrollToMatchesRef.current = true;
    setPromptStage('completed');
    triggerUnlockedStatement();

    const finalInterestsList = (promptedInterests && promptedInterests.length > 0)
      ? promptedInterests
      : (selectedInterests.length > 0 ? selectedInterests : ['Machine Learning', 'Space']);
    const finalHobbiesList = (promptedHobbies && promptedHobbies.length > 0)
      ? promptedHobbies
      : (selectedHobbies.length > 0 ? selectedHobbies : ['Photography', 'Chess']);
    const finalGoalsList = toGoals;

    // Reset prompt bars & selected chips back to a clean non-selected state while keeping matched results
    setInterestInput('');
    setSelectedInterests([]);
    setHobbyInput('');
    setSelectedHobbies([]);
    setGoalInput('');
    setSelectedGoals([]);
    setLoopStage(null);

    // Combine all 3 prompt signals (interests + hobbies + goals) to unlock all features
    const allSignals = Array.from(new Set([
      ...finalInterestsList,
      ...finalHobbiesList,
      ...finalGoalsList,
    ]));

    onFindCommunities?.(
      allSignals,
      {
        interests: finalInterestsList,
        hobbies: finalHobbiesList,
        goals: finalGoalsList,
      },
      false // User is sending all prompts to find servers, so play confirmation sound!
    );

    const matched = getTopFiveRelevantServers(
      unjoinedCommunities,
      finalInterestsList,
      finalHobbiesList,
      finalGoalsList,
      userPlan,
      'goals',
      joinedNamesSet,
      joinedIdsSet
    );
    recordPromptToHistory('goals', finalInterestsList, finalHobbiesList, finalGoalsList, matched);
  };

  /**
   * Handles submitting in looping mode: justifies the answer, shifts servers accordingly,
   * records to history, and resets the prompt bars back to a clean non-selected state.
   */
  const handleLoopSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isRecording) stopRecording();
    setActiveHistoryPrompt(null);
    let toSave: string[] = [];
    const activeStage: 'interests' | 'hobbies' | 'goals' = loopStage || 'interests';
    if (activeStage === 'interests') {
      const parsed = extractTopicsFromPrompt(interestInput);
      toSave = parsed.length > 0 ? parsed : (selectedInterests.length > 0 ? selectedInterests : ['Machine Learning']);
      justifyAnswersAndShiftServers('interests', toSave, true);
    } else if (activeStage === 'hobbies') {
      const parsed = extractTopicsFromPrompt(hobbyInput);
      toSave = parsed.length > 0 ? parsed : (selectedHobbies.length > 0 ? selectedHobbies : ['Photography']);
      justifyAnswersAndShiftServers('hobbies', toSave, true);
    } else if (activeStage === 'goals') {
      const parsed = extractTopicsFromPrompt(goalInput);
      toSave = parsed.length > 0 ? parsed : (selectedGoals.length > 0 ? selectedGoals : ['Build an AI Startup']);
      justifyAnswersAndShiftServers('goals', toSave, true);
    }

    const currentInterests = activeStage === 'interests' ? toSave : (promptedInterests || selectedInterests);
    const currentHobbies = activeStage === 'hobbies' ? toSave : (promptedHobbies || selectedHobbies);
    const currentGoals = activeStage === 'goals' ? toSave : (promptedGoals || selectedGoals);
    const matched = getTopFiveRelevantServers(
      unjoinedCommunities,
      currentInterests,
      currentHobbies,
      currentGoals,
      userPlan,
      activeStage,
      joinedNamesSet,
      joinedIdsSet
    );
    recordPromptToHistory(activeStage, currentInterests, currentHobbies, currentGoals, matched);

    // Clear all prompt inputs & selected bars so the prompt restarts in a clean non-selected state
    setInterestInput('');
    setSelectedInterests([]);
    setHobbyInput('');
    setSelectedHobbies([]);
    setGoalInput('');
    setSelectedGoals([]);

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    requestAnimationFrame(() => {
      scrollToMatchedCommunities('smooth');
    });
  };

  const recordPromptToHistory = (
    stage: 'interests' | 'hobbies' | 'goals',
    interests: string[],
    hobbies: string[],
    goals: string[],
    servers: Community[]
  ) => {
    const titleParts = stage === 'interests' ? interests : stage === 'hobbies' ? hobbies : goals;
    const title = titleParts.slice(0, 3).join(', ') || 'Custom Mesh Exploration';
    const newItem = savePromptHistoryItem({
      title,
      stage,
      interests,
      hobbies,
      goals,
      rawInput: titleParts.join(', '),
      matchedServers: servers.slice(0, 5),
    });
    setPromptHistory((prev) => [newItem, ...prev.filter((p) => p.id !== newItem.id)].slice(0, 20));
  };

  const handleSelectHistoricalPrompt = (item: PromptHistoryItem) => {
    setActiveHistoryPrompt(item);
    setShowHistoryModal(false);

    if (item.interests && item.interests.length > 0) {
      setInterestInput(item.interests.join(', '));
      setSelectedInterests(item.interests);
      setPromptedInterests(item.interests);
    }
    if (item.hobbies && item.hobbies.length > 0) {
      setHobbyInput(item.hobbies.join(', '));
      setSelectedHobbies(item.hobbies);
      setPromptedHobbies(item.hobbies);
    }
    if (item.goals && item.goals.length > 0) {
      setGoalInput(item.goals.join(', '));
      setSelectedGoals(item.goals);
      setPromptedGoals(item.goals);
    }
    if (item.stage !== 'all') {
      setLoopStage(item.stage);
    }

    setTimeout(() => {
      scrollToMatchedCommunities('smooth');
    }, 120);
  };

  const handleDeleteHistoryItem = (id: string) => {
    const updated = deletePromptHistoryItem(id);
    setPromptHistory(updated);
    if (activeHistoryPrompt?.id === id) {
      setActiveHistoryPrompt(null);
    }
  };

  const handleClearHistory = () => {
    clearAllPromptHistory();
    setPromptHistory([]);
    setActiveHistoryPrompt(null);
  };

  // Only show unjoined communities; once joined, they are completely excluded from this section
  const { joinedIdsSet, joinedNamesSet, unjoinedCommunities, displayCommunities } = useMemo(() => {
    const jIds = new Set(communities.filter((c) => c.joined).map((c) => c.id));
    const jNames = new Set(
      communities.filter((c) => c.joined).map((c) => c.name.trim().toLowerCase())
    );

    const unjoined = communities.filter(
      (c) => !c.joined && !jIds.has(c.id) && !jNames.has(c.name.trim().toLowerCase())
    );

    const rawTopFive = getTopFiveRelevantServers(
      unjoined,
      (promptedInterests && promptedInterests.length > 0) ? promptedInterests : selectedInterests,
      (promptedHobbies && promptedHobbies.length > 0) ? promptedHobbies : selectedHobbies,
      (promptedGoals && promptedGoals.length > 0) ? promptedGoals : selectedGoals,
      userPlan,
      hasPrompted ? (loopStage || 'interests') : 'interests',
      jNames,
      jIds
    );

    const candidates = activeHistoryPrompt
      ? activeHistoryPrompt.matchedServers
      : rawTopFive;

    const filtered = ensureUniqueServers(
      candidates.filter(
        (c) => !c.joined && !jIds.has(c.id) && !jNames.has(c.name.trim().toLowerCase())
      )
    );

    return {
      joinedIdsSet: jIds,
      joinedNamesSet: jNames,
      unjoinedCommunities: unjoined,
      displayCommunities: filtered,
    };
  }, [
    communities,
    promptedInterests,
    promptedHobbies,
    promptedGoals,
    selectedInterests,
    selectedHobbies,
    selectedGoals,
    userPlan,
    hasPrompted,
    loopStage,
    activeHistoryPrompt,
  ]);

  useEffect(() => {
    if (promptStage === 'completed' && pendingScrollToMatchesRef.current) {
      pendingScrollToMatchesRef.current = false;
      let raf2Id: number | null = null;
      const raf1Id = requestAnimationFrame(() => {
        raf2Id = requestAnimationFrame(() => {
          // Jump directly to Matched Communities and the 5 servers below
          scrollToMatchedCommunities('auto');
          scrollTimerRef.current = window.setTimeout(() => {
            scrollToMatchedCommunities('smooth');
          }, 120);
        });
      });
      return () => {
        cancelAnimationFrame(raf1Id);
        if (raf2Id !== null) cancelAnimationFrame(raf2Id);
        if (scrollTimerRef.current !== null) {
          window.clearTimeout(scrollTimerRef.current);
          scrollTimerRef.current = null;
        }
      };
    }
  }, [promptStage, displayCommunities.length]);

  const handleJoinCommunity = (community: Community) => {
    // Free tier: 2 default servers + bonus slots earned via Gamification. Cronium Plus: 5. Cronium Pro: 10.
    const bonusSlots = gamificationService.getBonusServerSlots();
    const maxAllowed = userPlan === 'pro' ? 10 : userPlan === 'plus' ? 5 : 2 + bonusSlots;
    if (joinedCount >= maxAllowed) {
      setPendingCommunity(community);
      setShowGamificationModal(true);
      return;
    }
    if (onToggleJoin) {
      onToggleJoin(community.id, community, true);
    }
    const joinedComm = { ...community, joined: true };
    // Bring user directly to the server upon clicking Join (with channels visible for initial discovery)
    if (onOpenCommunity) {
      onOpenCommunity(joinedComm, true);
    } else if (onNavigateToServers) {
      onNavigateToServers();
    }
  };

  // Render Step 2: Hobbies in a separate interface
  // NOTE: The other two features remain hidden at this stage
  if (promptStage === 'hobbies' && !hasPrompted) {
    return (
      <div
        data-tab-scroller="home"
        className="flex flex-col flex-1 h-full min-h-0 bg-[#F7F9FC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-y-auto"
      >
        {/* Static Top Header */}
        <div className="px-5 pt-2.5 pb-2 flex items-center justify-between shrink-0 max-w-lg mx-auto w-full">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setPromptGuidanceMessage(null);
                setPromptStage('interests');
              }}
              className="p-1.5 -ml-1 rounded-full hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Back to Topics"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <CroniumLogo variant="app-icon" className="w-7 h-7 rounded-xl shadow-2xs" />
            <span className="text-[18px] font-extrabold tracking-tight text-slate-900 dark:text-white font-display">
              Cronium
            </span>
          </div>

          {/* Slots Pill + Notification Bell centered directly above the sparkle circle */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => (userPlan === 'free' ? setShowGamificationModal(true) : setShowPremiumModal(true))}
              className="px-3 py-1 rounded-full bg-indigo-50/90 dark:bg-indigo-950/70 border border-indigo-200/80 dark:border-indigo-800/70 text-[#4F46E5] dark:text-indigo-300 text-xs font-bold flex items-center gap-1 hover:bg-indigo-100/80 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer"
              title="Server slots & earn servers"
            >
              <span className="tabular-nums">{joinedCount}/{maxAllowedSlots} Slots</span>
              {userPlan !== 'pro' && <Plus className="w-3 h-3" />}
            </button>

            <div className="w-11 flex items-center justify-center shrink-0">
              <button
                onClick={onOpenNotifications}
                className="relative w-9 h-9 rounded-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs flex items-center justify-center text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Notifications"
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M17.8 16C16.8 14.8 16.2 12.8 16.2 10.2C16.2 7.3 14.5 5 12 5C9.5 5 7.8 7.3 7.8 10.2C7.8 12.8 7.2 14.8 6.2 16H17.8Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10.2 16.8C10.5 17.8 11.2 18.5 12 18.5C12.8 18.5 13.5 17.8 13.8 16.8"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Hobbies Main Content */}
        <div className="px-5 pb-6 pt-1 flex flex-col space-y-3.5 max-w-lg mx-auto w-full animate-in fade-in duration-200">
          {/* Hero Greeting matching screenshot typography & size */}
          <div className="flex items-center justify-between gap-3 text-left">
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400 tracking-tight mb-0.5">
                AI Community Matchmaker
              </p>
              <h1 className="text-[22px] sm:text-[24px] font-extrabold tracking-[-0.025em] leading-[1.18] font-hero">
                <span className="text-[#0F172A] dark:text-white">Welcome </span>
                <span className="bg-gradient-to-r from-[#4F46E5] via-[#2B8EF4] to-[#06B6D4] bg-clip-text text-transparent">
                  jennies
                </span>
                <span className="text-[#0F172A] dark:text-white">, to </span>
                <span className="bg-gradient-to-r from-[#4F46E5] via-[#2B8EF4] to-[#06B6D4] bg-clip-text text-transparent">
                  Cronium
                </span>
              </h1>
            </div>
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#6366F1] via-[#4F46E5] to-[#38BDF8] shadow-[0_6px_22px_rgba(79,70,229,0.42)] flex items-center justify-center text-white shrink-0 select-none pointer-events-none">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>

          {/* Progress Bar Preserved */}
          <CurvedProgressBar
            currentStep={2}
            itemCount={selectedHobbies.length}
            hasInput={Boolean(hobbyInput.trim())}
          />

          {/* Main White Prompt Card matching attached image */}
          <div className="p-4 sm:p-5 rounded-[26px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-[0_8px_30px_rgba(15,23,42,0.04)] space-y-3.5 text-left">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-[13px] font-bold text-black dark:text-white flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-[#4F46E5] dark:text-indigo-400 shrink-0" />
                <span>How do you spend your free time?</span>
              </label>
            </div>

            <form onSubmit={handleHobbiesSubmit} className="relative w-full">
              <textarea
                ref={hobbyTextareaRef}
                value={hobbyInput}
                onChange={(e) => {
                  const val = e.target.value;
                  setHobbyInput(val);
                  setPromptGuidanceMessage(null);
                  const parsed = val.split(',').map((s) => s.trim()).filter(Boolean);
                  setSelectedHobbies(parsed);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleHobbiesSubmit();
                  }
                }}
                placeholder="e.g., weekend hiking, mechanical keyboards, street photography..."
                rows={4}
                className="w-full h-[126px] py-3.5 pl-4 pr-14 text-sm sm:text-[15px] bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 rounded-2xl border-2 border-indigo-200/90 dark:border-indigo-900/80 shadow-xs focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-950/60 transition-all resize-none leading-relaxed"
              />
              {/* Voice Capture Button in the prompt bar */}
              {isRecording && recordingStage === 'hobbies' && (
                <div className="absolute left-3.5 bottom-3.5 flex items-center gap-2 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800/70 text-rose-600 dark:text-rose-300 text-[11px] font-semibold pointer-events-none animate-in fade-in duration-150">
                  <div className="flex items-center gap-0.5 h-4">
                    {audioLevels.map((lvl, idx) => (
                      <span
                        key={idx}
                        className={`w-0.5 rounded-full bg-rose-500 transition-all duration-100 ${VOICE_BAR_HEIGHT_CLASSES[lvl] || 'h-2'}`}
                      />
                    ))}
                  </div>
                  <span>Listening...</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => toggleRecording('hobbies', hobbyInput, handleVoiceTranscript)}
                className={`absolute right-3.5 bottom-3.5 w-10 h-10 rounded-full text-white flex items-center justify-center shadow-md transition-all active:scale-90 cursor-pointer ${
                  isRecording && recordingStage === 'hobbies'
                    ? 'bg-rose-500 hover:bg-rose-600 ring-4 ring-rose-300/60 dark:ring-rose-800/60 animate-pulse'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
                title={isRecording && recordingStage === 'hobbies' ? 'Stop voice capture' : 'Speak your offline & fun hobbies'}
                aria-label={isRecording && recordingStage === 'hobbies' ? 'Stop voice capture' : 'Start voice capture'}
              >
                {isRecording && recordingStage === 'hobbies' ? (
                  <Square className="w-3.5 h-3.5 fill-current" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </button>
            </form>

            {promptGuidanceMessage && (
              <div className="p-2.5 rounded-xl bg-indigo-50/90 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-900/60 flex items-center gap-2 text-indigo-900 dark:text-indigo-200 text-xs font-semibold animate-in fade-in duration-150">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>{promptGuidanceMessage}</span>
              </div>
            )}

            {/* Popular Offline & Fun Chips preserved in single pale-blue color */}
            <div className="space-y-2 text-left pt-0.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <Heart className="w-3.5 h-3.5 text-[#F43F5E] shrink-0" />
                <span>Popular offline &amp; fun (Tap to add)</span>
              </div>

              <div className="flex flex-col gap-2 w-full">
                {[ROW_1_HOBBIES, ROW_2_HOBBIES, ROW_3_HOBBIES].map((row, rowIdx) => (
                  <div key={rowIdx} className="flex flex-wrap items-center gap-2 py-0.5">
                    {row.map((item) => {
                      const isSelected = selectedHobbies.some(
                        (s) => s.toLowerCase() === item.name.toLowerCase()
                      );
                      return (
                        <button
                          key={item.name}
                          type="button"
                          onClick={() => toggleHobby(item.name)}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap transition-all active:scale-95 cursor-pointer ${
                            isSelected
                              ? item.selected
                              : `${item.bg} ${item.text} font-medium`
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />}
                          <span>{item.name}</span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Primary CTA */}
            <button
              onClick={handleHobbiesSubmit}
              className="relative overflow-hidden group w-full py-3.5 px-6 rounded-full bg-[#4F46E5] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_8px_22px_rgba(79,70,229,0.3)] hover:shadow-[0_10px_26px_rgba(6,182,212,0.34)] hover:scale-[1.01] active:scale-[0.98] transition-all duration-300 cursor-pointer"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-[#5549F6] via-[#2B8EF4] to-[#08B6DF] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <span className="relative z-10">Next: Right Now</span>
              <ArrowRight className="relative z-10 w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Premium Unlock Modal */}
        <PremiumUnlockModal
          isOpen={showPremiumModal}
          onClose={() => setShowPremiumModal(false)}
          onUnlock={(plan) => {
            const nextPlan = plan || 'pro';
            onUnlockPlan?.(nextPlan);
            setShowPremiumModal(false);
            if (pendingCommunity) {
              onToggleJoin?.(pendingCommunity.id, pendingCommunity, true);
              const comm = { ...pendingCommunity, joined: true };
              if (onOpenCommunity) {
                onOpenCommunity(comm, true);
              }
              setPendingCommunity(null);
            }
          }}
          joinedCount={joinedCount}
          currentPlan={userPlan}
        />

        {/* Gamification Dashboard Modal */}
        {showGamificationModal && (
          <GamificationDashboard
            isModal={true}
            onClose={() => setShowGamificationModal(false)}
            onServerSlotsUpdated={(newBonus) => setBonusSlotsState(newBonus)}
            onNavigateToServers={onNavigateToServers}
          />
        )}
      </div>
    );
  }

  // Render Step 3: Goals in a different interface
  // NOTE: The other two features remain hidden at this stage
  if (promptStage === 'goals' && !hasPrompted) {
    return (
      <div
        data-tab-scroller="home"
        className="flex flex-col flex-1 h-full min-h-0 bg-[#F7F9FC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-y-auto"
      >
        {/* Static Top Header */}
        <div className="px-5 pt-2.5 pb-2 flex items-center justify-between shrink-0 max-w-lg mx-auto w-full">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setPromptGuidanceMessage(null);
                setPromptStage('hobbies');
              }}
              className="p-1.5 -ml-1 rounded-full hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Back to Offline & Fun"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <CroniumLogo variant="app-icon" className="w-7 h-7 rounded-xl shadow-2xs" />
            <span className="text-[18px] font-extrabold tracking-tight text-slate-900 dark:text-white font-display">
              Cronium
            </span>
          </div>

          {/* Slots Pill + Notification Bell centered directly above the sparkle circle */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => (userPlan === 'free' ? setShowGamificationModal(true) : setShowPremiumModal(true))}
              className="px-3 py-1 rounded-full bg-indigo-50/90 dark:bg-indigo-950/70 border border-indigo-200/80 dark:border-indigo-800/70 text-[#4F46E5] dark:text-indigo-300 text-xs font-bold flex items-center gap-1 hover:bg-indigo-100/80 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer"
              title="Server slots & earn servers"
            >
              <span className="tabular-nums">{joinedCount}/{maxAllowedSlots} Slots</span>
              {userPlan !== 'pro' && <Plus className="w-3 h-3" />}
            </button>

            <div className="w-11 flex items-center justify-center shrink-0">
              <button
                onClick={onOpenNotifications}
                className="relative w-9 h-9 rounded-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs flex items-center justify-center text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Notifications"
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M17.8 16C16.8 14.8 16.2 12.8 16.2 10.2C16.2 7.3 14.5 5 12 5C9.5 5 7.8 7.3 7.8 10.2C7.8 12.8 7.2 14.8 6.2 16H17.8Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10.2 16.8C10.5 17.8 11.2 18.5 12 18.5C12.8 18.5 13.5 17.8 13.8 16.8"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Goals Main Content */}
        <div className="px-5 pb-6 pt-1 flex flex-col space-y-3.5 max-w-lg mx-auto w-full animate-in fade-in duration-200">
          {/* Hero Greeting matching screenshot typography & size */}
          <div className="flex items-center justify-between gap-3 text-left">
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400 tracking-tight mb-0.5">
                AI Community Matchmaker
              </p>
              <h1 className="text-[22px] sm:text-[24px] font-extrabold tracking-[-0.025em] leading-[1.18] font-hero">
                <span className="text-[#0F172A] dark:text-white">Welcome </span>
                <span className="bg-gradient-to-r from-[#4F46E5] via-[#2B8EF4] to-[#06B6D4] bg-clip-text text-transparent">
                  jennies
                </span>
                <span className="text-[#0F172A] dark:text-white">, to </span>
                <span className="bg-gradient-to-r from-[#4F46E5] via-[#2B8EF4] to-[#06B6D4] bg-clip-text text-transparent">
                  Cronium
                </span>
              </h1>
            </div>
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#6366F1] via-[#4F46E5] to-[#38BDF8] shadow-[0_6px_22px_rgba(79,70,229,0.42)] flex items-center justify-center text-white shrink-0 select-none pointer-events-none">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>

          {/* Progress Bar Preserved */}
          <CurvedProgressBar
            currentStep={3}
            itemCount={selectedGoals.length}
            hasInput={Boolean(goalInput.trim())}
          />

          {/* Main White Prompt Card matching attached image */}
          <div className="p-4 sm:p-5 rounded-[26px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-[0_8px_30px_rgba(15,23,42,0.04)] space-y-3.5 text-left">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-[13px] font-bold text-black dark:text-white flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-[#4F46E5]" />
                <span>What are you hoping to build, learn, or find here?</span>
              </label>
            </div>

            <form onSubmit={handleGoalsSubmit} className="relative w-full">
              <textarea
                ref={goalTextareaRef}
                value={goalInput}
                onChange={(e) => {
                  const val = e.target.value;
                  setGoalInput(val);
                  setPromptGuidanceMessage(null);
                  const parsed = val.split(',').map((s) => s.trim()).filter(Boolean);
                  setSelectedGoals(parsed);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleGoalsSubmit();
                  }
                }}
                placeholder="e.g., find a hackathon co-founder, join a study group, meet local hikers..."
                rows={4}
                className="w-full h-[126px] py-3.5 pl-4 pr-14 text-sm sm:text-[15px] bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 rounded-2xl border-2 border-indigo-200/90 dark:border-indigo-900/80 shadow-xs focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-950/60 transition-all resize-none leading-relaxed"
              />
              {/* Voice Capture Button in the prompt bar */}
              {isRecording && recordingStage === 'goals' && (
                <div className="absolute left-3.5 bottom-3.5 flex items-center gap-2 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800/70 text-rose-600 dark:text-rose-300 text-[11px] font-semibold pointer-events-none animate-in fade-in duration-150">
                  <div className="flex items-center gap-0.5 h-4">
                    {audioLevels.map((lvl, idx) => (
                      <span
                        key={idx}
                        className={`w-0.5 rounded-full bg-rose-500 transition-all duration-100 ${VOICE_BAR_HEIGHT_CLASSES[lvl] || 'h-2'}`}
                      />
                    ))}
                  </div>
                  <span>Listening...</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => toggleRecording('goals', goalInput, handleVoiceTranscript)}
                className={`absolute right-3.5 bottom-3.5 w-10 h-10 rounded-full text-white flex items-center justify-center shadow-md transition-all active:scale-90 cursor-pointer ${
                  isRecording && recordingStage === 'goals'
                    ? 'bg-rose-500 hover:bg-rose-600 ring-4 ring-rose-300/60 dark:ring-rose-800/60 animate-pulse'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
                title={isRecording && recordingStage === 'goals' ? 'Stop voice capture' : 'Speak your goals right now'}
                aria-label={isRecording && recordingStage === 'goals' ? 'Stop voice capture' : 'Start voice capture'}
              >
                {isRecording && recordingStage === 'goals' ? (
                  <Square className="w-3.5 h-3.5 fill-current" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </button>
            </form>

            {promptGuidanceMessage && (
              <div className="p-2.5 rounded-xl bg-indigo-50/90 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-900/60 flex items-center gap-2 text-indigo-900 dark:text-indigo-200 text-xs font-semibold animate-in fade-in duration-150">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>{promptGuidanceMessage}</span>
              </div>
            )}

            {/* Popular Right Now Chips preserved in single pale-blue color */}
            <div className="space-y-2 text-left pt-0.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <Target className="w-3.5 h-3.5 text-[#F43F5E] shrink-0" />
                <span>Popular right now (Tap to add)</span>
              </div>

              <div className="flex flex-col gap-2 w-full">
                {[ROW_1_GOALS, ROW_2_GOALS, ROW_3_GOALS].map((row, rowIdx) => (
                  <div key={rowIdx} className="flex flex-wrap items-center gap-2 py-0.5">
                    {row.map((item) => {
                      const isSelected = selectedGoals.some(
                        (s) => s.toLowerCase() === item.name.toLowerCase()
                      );
                      return (
                        <button
                          key={item.name}
                          type="button"
                          onClick={() => toggleGoal(item.name)}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap transition-all active:scale-95 cursor-pointer ${
                            isSelected
                              ? item.selected
                              : `${item.bg} ${item.text} font-medium`
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />}
                          <span>{item.name}</span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Primary CTA */}
            <button
              onClick={handleGoalsSubmit}
              className="relative overflow-hidden group w-full py-3.5 px-6 rounded-full bg-[#4F46E5] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_8px_22px_rgba(79,70,229,0.3)] hover:shadow-[0_10px_26px_rgba(6,182,212,0.34)] hover:scale-[1.01] active:scale-[0.98] transition-all duration-300 cursor-pointer"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-[#5549F6] via-[#2B8EF4] to-[#08B6DF] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <Sparkles className="relative z-10 w-4 h-4" />
              <span className="relative z-10">Complete & Discover Communities</span>
              <ArrowRight className="relative z-10 w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Premium Unlock Modal */}
        <PremiumUnlockModal
          isOpen={showPremiumModal}
          onClose={() => setShowPremiumModal(false)}
          onUnlock={(plan) => {
            const nextPlan = plan || 'pro';
            onUnlockPlan?.(nextPlan);
            setShowPremiumModal(false);
            if (pendingCommunity) {
              onToggleJoin?.(pendingCommunity.id, pendingCommunity, true);
              const comm = { ...pendingCommunity, joined: true };
              if (onOpenCommunity) {
                onOpenCommunity(comm, true);
              }
              setPendingCommunity(null);
            }
          }}
          joinedCount={joinedCount}
          currentPlan={userPlan}
        />

        {/* Gamification Dashboard Modal */}
        {showGamificationModal && (
          <GamificationDashboard
            isModal={true}
            onClose={() => setShowGamificationModal(false)}
            onServerSlotsUpdated={(newBonus) => setBonusSlotsState(newBonus)}
            onNavigateToServers={onNavigateToServers}
          />
        )}
      </div>
    );
  }

  return (
    <div
      ref={homeScrollRef}
      data-tab-scroller="home"
      className="flex flex-col flex-1 h-full min-h-0 bg-[#F7F9FC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-y-auto"
    >
      {/* Static Top Header matching attached screenshot */}
      <div className="px-5 pt-2.5 pb-2 flex items-center justify-between shrink-0 max-w-lg mx-auto w-full">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <CroniumLogo variant="app-icon" className="w-7 h-7 rounded-xl shadow-2xs" />
          <span className="text-[18px] font-extrabold tracking-tight text-slate-900 dark:text-white font-display">
            Cronium
          </span>
        </div>

        {/* Right Controls: Slots Pill + Circular Notification Bell centered directly above the sparkle circle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => (userPlan === 'free' ? setShowGamificationModal(true) : setShowPremiumModal(true))}
            className="px-3 py-1 rounded-full bg-indigo-50/90 dark:bg-indigo-950/70 border border-indigo-200/80 dark:border-indigo-800/70 text-[#4F46E5] dark:text-indigo-300 text-xs font-bold flex items-center gap-1 hover:bg-indigo-100/80 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer"
            title="Server slots & earn servers"
          >
            <span className="tabular-nums">{joinedCount}/{maxAllowedSlots} Slots</span>
            {userPlan !== 'pro' && <Plus className="w-3 h-3" />}
          </button>

          <div className="w-11 flex items-center justify-center shrink-0">
            <button
              onClick={onOpenNotifications}
              className="relative w-9 h-9 rounded-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs flex items-center justify-center text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group cursor-pointer"
              title="Notifications"
            >
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="transition-transform group-hover:scale-105"
              >
                {/* Bell Body */}
                <path
                  d="M17.8 16C16.8 14.8 16.2 12.8 16.2 10.2C16.2 7.3 14.5 5 12 5C9.5 5 7.8 7.3 7.8 10.2C7.8 12.8 7.2 14.8 6.2 16H17.8Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Bell Clapper */}
                <path
                  d="M10.2 16.8C10.5 17.8 11.2 18.5 12 18.5C12.8 18.5 13.5 17.8 13.8 16.8"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-5 pb-6 pt-1 flex flex-col space-y-3.5 max-w-lg mx-auto w-full">
        {/* Hero Greeting matching screenshot typography & size, keeping "Welcome jennies, to Cronium" */}
        <div className="flex items-center justify-between gap-3 text-left">
          <div className="min-w-0">
            <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400 tracking-tight mb-0.5">
              AI Community Matchmaker
            </p>
            <h1 className="text-[22px] sm:text-[24px] font-extrabold tracking-[-0.025em] leading-[1.18] font-hero">
              <span className="text-[#0F172A] dark:text-white">Welcome </span>
              <span className="bg-gradient-to-r from-[#4F46E5] via-[#2B8EF4] to-[#06B6D4] bg-clip-text text-transparent">
                jennies
              </span>
              <span className="text-[#0F172A] dark:text-white">, to </span>
              <span className="bg-gradient-to-r from-[#4F46E5] via-[#2B8EF4] to-[#06B6D4] bg-clip-text text-transparent">
                Cronium
              </span>
            </h1>
          </div>

          {/* Right: Glowing indigo AI sparkle emblem matching screenshot */}
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#6366F1] via-[#4F46E5] to-[#38BDF8] shadow-[0_6px_22px_rgba(79,70,229,0.42)] flex items-center justify-center text-white shrink-0 select-none pointer-events-none">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        {/* Curved Progress Bar Preserved */}
        {!hasPrompted && (
          <CurvedProgressBar
            currentStep={1}
            itemCount={selectedInterests.length}
            hasInput={Boolean(interestInput.trim())}
          />
        )}

        {/* The All features unlocked statement appears as a floating toast without pushing the prompt card down */}
        {showUnlockedStatement && (
          <div className="fixed top-14 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-md pointer-events-auto animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="p-2 px-3 bg-gradient-to-r from-emerald-50/95 via-indigo-50/90 to-emerald-50/95 dark:from-emerald-950/90 dark:via-indigo-950/85 dark:to-emerald-950/90 backdrop-blur-md rounded-xl border border-emerald-200/80 dark:border-emerald-900/60 flex items-center justify-between gap-2 text-left shadow-md">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-xs">✨</span>
                <p className="text-[11px] font-semibold text-emerald-900 dark:text-emerald-200 truncate">
                  All features unlocked! Continuous prompt loop active.
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {onNavigateToServers && (
                  <button
                    onClick={onNavigateToServers}
                    className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:underline cursor-pointer"
                  >
                    Servers ➔
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowUnlockedStatement(false)}
                  className="p-0.5 text-emerald-700/60 hover:text-emerald-900 dark:text-emerald-300/60 dark:hover:text-emerald-100 rounded-md cursor-pointer ml-0.5"
                  title="Dismiss"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main White Prompt Card */}
        <div className="p-4 sm:p-5 rounded-[26px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-[0_8px_30px_rgba(15,23,42,0.04)] space-y-4 text-left w-full">
          {hasPrompted ? (
            /* Post-prompt 3-stage pill switcher + History pill */
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setLoopStage('interests')}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer active:scale-95 whitespace-nowrap border ${
                    loopStage === 'interests'
                      ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-400 dark:border-indigo-500 ring-2 ring-indigo-500/20'
                      : 'bg-slate-50/90 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <Sparkles className="w-3 h-3 shrink-0" />
                  <span>1 · Topics</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLoopStage('hobbies')}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer active:scale-95 whitespace-nowrap border ${
                    loopStage === 'hobbies'
                      ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-400 dark:border-indigo-500 ring-2 ring-indigo-500/20'
                      : 'bg-slate-50/90 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <Heart className="w-3 h-3 shrink-0" />
                  <span>2 · Offline &amp; Fun</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLoopStage('goals')}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer active:scale-95 whitespace-nowrap border ${
                    loopStage === 'goals'
                      ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-400 dark:border-indigo-500 ring-2 ring-indigo-500/20'
                      : 'bg-slate-50/90 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <Target className="w-3 h-3 shrink-0" />
                  <span>3 · Right Now</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowHistoryModal(true)}
                  className="px-2.5 py-1 rounded-full text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50/90 dark:bg-indigo-950/80 border border-indigo-200/80 dark:border-indigo-800/80 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 flex items-center gap-1 transition-colors cursor-pointer active:scale-95 whitespace-nowrap"
                  title="View previous prompts and past matched servers"
                >
                  <History className="w-3 h-3 shrink-0" />
                  <span>History</span>
                </button>
              </div>

              <label className="text-xs sm:text-[13px] font-bold text-black dark:text-white flex items-center gap-1.5">
                {loopStage === 'hobbies' ? (
                  <>
                    <Heart className="w-3.5 h-3.5 text-[#4F46E5] dark:text-indigo-400 shrink-0" />
                    <span>How do you spend your free time?</span>
                  </>
                ) : loopStage === 'goals' ? (
                  <>
                    <Target className="w-3.5 h-3.5 text-[#4F46E5] dark:text-indigo-400 shrink-0" />
                    <span>What are you hoping to build, learn, or find here?</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-[#4F46E5] dark:text-indigo-400 shrink-0" />
                    <span>What topics could you talk about for hours?</span>
                  </>
                )}
              </label>
            </div>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs sm:text-[13px] font-bold text-black dark:text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#4F46E5] dark:text-indigo-400 shrink-0" />
                    <span>What topics could you talk about for hours?</span>
                  </label>
                </div>
              )}

              {/* Step 1 Guidance Bar: Points directly to prompt bar */}
              {guidanceStep === 1 && (
                <OnboardingGuidance
                  step={1}
                  onNext={handleNextGuidance}
                  onSkip={handleSkipGuidance}
                />
              )}

              {/* Prompt Bar Form (Preserving outline around the prompt bar) */}
              <form
                onSubmit={hasPrompted ? handleLoopSubmit : handleSearchSubmit}
                className="relative w-full"
              >
                <textarea
                  ref={promptTextareaRef}
                  value={
                    hasPrompted
                      ? loopStage === 'hobbies'
                        ? hobbyInput
                        : loopStage === 'goals'
                        ? goalInput
                        : interestInput
                      : interestInput
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    setPromptGuidanceMessage(null);
                    const parsed = extractTopicsFromPrompt(val);

                    if (hasPrompted) {
                      const stage = loopStage || 'interests';
                      if (!loopStage) {
                        setLoopStage('interests');
                      }
                      if (stage === 'interests') {
                        setInterestInput(val);
                        setSelectedInterests(parsed);
                        if (parsed.length > 0) {
                          justifyAnswersAndShiftServers('interests', parsed, false);
                        }
                      } else if (stage === 'hobbies') {
                        setHobbyInput(val);
                        setSelectedHobbies(parsed);
                        if (parsed.length > 0) {
                          justifyAnswersAndShiftServers('hobbies', parsed, false);
                        }
                      } else if (stage === 'goals') {
                        setGoalInput(val);
                        setSelectedGoals(parsed);
                        if (parsed.length > 0) {
                          justifyAnswersAndShiftServers('goals', parsed, false);
                        }
                      }
                    } else {
                      setInterestInput(val);
                      setSelectedInterests(parsed);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (hasPrompted) {
                        handleLoopSubmit();
                      } else {
                        handleSearchSubmit();
                      }
                    }
                  }}
                  placeholder={
                    hasPrompted
                      ? loopStage === 'hobbies'
                        ? 'e.g., weekend hiking, mechanical keyboards, street photography...'
                        : loopStage === 'goals'
                        ? 'e.g., find a hackathon co-founder, join a study group, meet local hikers...'
                        : 'e.g., AI agents, quantum physics, indie game design...'
                      : 'e.g., AI agents, quantum physics, indie game design...'
                  }
                  rows={4}
                  className={`w-full h-[118px] sm:h-[124px] py-3.5 pl-4 pr-14 text-sm sm:text-[15px] bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 rounded-2xl transition-all resize-none leading-relaxed ${
                    guidanceStep === 1
                      ? 'border-2 border-indigo-400 dark:border-indigo-500 ring-4 ring-indigo-400/40 shadow-xl shadow-indigo-400/20'
                      : 'border-2 border-indigo-200/90 dark:border-indigo-900/80 shadow-md focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-950/60'
                  }`}
                />

                {/* Voice Capture Button inside prompt bar */}
                {(() => {
                  const activeVoiceStage: VoicePromptStage = hasPrompted
                    ? loopStage || 'interests'
                    : 'interests';
                  const activeValue =
                    activeVoiceStage === 'hobbies'
                      ? hobbyInput
                      : activeVoiceStage === 'goals'
                      ? goalInput
                      : interestInput;
                  const isStageRecording = isRecording && recordingStage === activeVoiceStage;
                  return (
                    <>
                      {isStageRecording && (
                        <div className="absolute left-3.5 bottom-3.5 flex items-center gap-2 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800/70 text-rose-600 dark:text-rose-300 text-[11px] font-semibold pointer-events-none animate-in fade-in duration-150">
                          <div className="flex items-center gap-0.5 h-4">
                            {audioLevels.map((lvl, idx) => (
                              <span
                                key={idx}
                                className={`w-0.5 rounded-full bg-rose-500 transition-all duration-100 ${VOICE_BAR_HEIGHT_CLASSES[lvl] || 'h-2'}`}
                              />
                            ))}
                          </div>
                          <span>Listening...</span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => toggleRecording(activeVoiceStage, activeValue, handleVoiceTranscript)}
                        className={`absolute right-3.5 bottom-3.5 w-10 h-10 rounded-full text-white flex items-center justify-center shadow-md transition-all active:scale-90 cursor-pointer ${
                          isStageRecording
                            ? 'bg-rose-500 hover:bg-rose-600 ring-4 ring-rose-300/60 dark:ring-rose-800/60 animate-pulse'
                            : 'bg-indigo-600 hover:bg-indigo-700'
                        } ${guidanceStep === 1 && !isStageRecording ? 'ring-4 ring-indigo-400 shadow-xl shadow-indigo-500/40 scale-105' : ''}`}
                        title={isStageRecording ? 'Stop voice capture' : 'Tap to speak your interests'}
                        aria-label={isStageRecording ? 'Stop voice capture' : 'Start voice capture'}
                      >
                        {isStageRecording ? (
                          <Square className="w-3.5 h-3.5 fill-current" />
                        ) : (
                          <Mic className="w-4 h-4" />
                        )}
                      </button>
                    </>
                  );
                })()}
              </form>

              {promptGuidanceMessage && (
                <div className="p-2 rounded-xl bg-indigo-50/90 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-900/60 flex items-center gap-2 text-indigo-900 dark:text-indigo-200 text-xs font-semibold animate-in fade-in duration-150">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>{promptGuidanceMessage}</span>
                </div>
              )}

              {/* Suggestion Pills contextually based on loopStage or Step 1 (Preserving pale-blue interest bars) */}
              {(!hasPrompted || loopStage === 'interests' || loopStage === null) && (
                <div className="space-y-2 text-left pt-0.5 w-full relative">
                  {/* Step 2 Guidance Bar: Points directly to Popular Interests */}
                  {guidanceStep === 2 && (
                    <OnboardingGuidance
                      step={2}
                      onNext={handleNextGuidance}
                      onSkip={handleSkipGuidance}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => setShowBrainstormInterests((prev) => !prev)}
                    className={`flex items-center justify-between w-full px-3 py-2 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 hover:bg-slate-100/80 dark:hover:bg-slate-800 transition-all active:scale-[0.99] cursor-pointer group select-none text-xs font-semibold text-slate-700 dark:text-slate-200 ${
                      guidanceStep === 2
                        ? 'border-2 border-indigo-400 dark:border-indigo-500 ring-4 ring-indigo-400/40 shadow-md shadow-indigo-400/25 bg-indigo-50/80 dark:bg-indigo-950/40'
                        : 'border border-slate-200/80 dark:border-slate-700/80'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Sparkles className={`w-3.5 h-3.5 ${guidanceStep === 2 ? 'text-indigo-600 dark:text-indigo-400 fill-indigo-500' : 'text-[#F43F5E]'}`} />
                      <span className={guidanceStep === 2 ? 'text-indigo-950 dark:text-indigo-100 font-bold' : ''}>
                        Popular topics (Tap to add)
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showBrainstormInterests ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {showBrainstormInterests && (
                    <div className="flex flex-col gap-2 w-full pt-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
                      {[ROW_1_INTERESTS, ROW_2_INTERESTS, ROW_3_INTERESTS].map((row, rowIdx) => (
                        <div key={rowIdx} className="flex flex-wrap items-center gap-2 py-0.5">
                          {row.map((item) => {
                            const isSelected = selectedInterests.some(
                              (s) => s.toLowerCase() === item.name.toLowerCase()
                            );
                            return (
                              <button
                                key={item.name}
                                type="button"
                                onClick={() => toggleInterest(item.name)}
                                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap transition-all active:scale-95 cursor-pointer ${
                                  isSelected
                                    ? item.selected
                                    : `${item.bg} ${item.text} font-medium`
                                }`}
                              >
                                {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />}
                                <span>{item.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {hasPrompted && loopStage === 'hobbies' && (
                <div className="space-y-2 text-left pt-0.5 w-full">
                  <button
                    type="button"
                    onClick={() => setShowBrainstormHobbies((prev) => !prev)}
                    className="flex items-center justify-between w-full px-3 py-2 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-100/80 dark:hover:bg-slate-800 transition-all active:scale-[0.99] cursor-pointer group select-none text-xs font-semibold text-slate-700 dark:text-slate-200"
                  >
                    <div className="flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-rose-500" />
                      <span>Popular offline &amp; fun (Tap to add)</span>
                    </div>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showBrainstormHobbies ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {showBrainstormHobbies && (
                    <div className="flex flex-col gap-2 w-full pt-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
                      {[ROW_1_HOBBIES, ROW_2_HOBBIES, ROW_3_HOBBIES].map((row, rowIdx) => (
                        <div key={rowIdx} className="flex flex-wrap items-center gap-2 py-0.5">
                          {row.map((item) => {
                            const isSelected = selectedHobbies.some(
                              (s) => s.toLowerCase() === item.name.toLowerCase()
                            );
                            return (
                              <button
                                key={item.name}
                                type="button"
                                onClick={() => toggleHobby(item.name)}
                                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap transition-all active:scale-95 cursor-pointer ${
                                  isSelected
                                    ? item.selected
                                    : `${item.bg} ${item.text} font-medium`
                                }`}
                              >
                                {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />}
                                <span>{item.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {hasPrompted && loopStage === 'goals' && (
                <div className="space-y-2 text-left pt-0.5 w-full">
                  <button
                    type="button"
                    onClick={() => setShowBrainstormGoals((prev) => !prev)}
                    className="flex items-center justify-between w-full px-3 py-2 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-100/80 dark:hover:bg-slate-800 transition-all active:scale-[0.99] cursor-pointer group select-none text-xs font-semibold text-slate-700 dark:text-slate-200"
                  >
                    <div className="flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-[#F43F5E] shrink-0" />
                      <span>Popular right now (Tap to add)</span>
                    </div>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showBrainstormGoals ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {showBrainstormGoals && (
                    <div className="flex flex-col gap-2 w-full pt-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
                      {[ROW_1_GOALS, ROW_2_GOALS, ROW_3_GOALS].map((row, rowIdx) => (
                        <div key={rowIdx} className="flex flex-wrap items-center gap-2 py-0.5">
                          {row.map((item) => {
                            const isSelected = selectedGoals.some(
                              (s) => s.toLowerCase() === item.name.toLowerCase()
                            );
                            return (
                              <button
                                key={item.name}
                                type="button"
                                onClick={() => toggleGoal(item.name)}
                                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap transition-all active:scale-95 cursor-pointer ${
                                  isSelected
                                    ? item.selected
                                    : `${item.bg} ${item.text} font-medium`
                                }`}
                              >
                                {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />}
                                <span>{item.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Primary CTA Button inside Card matching attached screenshot */}
              <button
                type="button"
                onClick={() => {
                  if (hasPrompted) {
                    handleLoopSubmit();
                  } else if (interestInput.trim() || selectedInterests.length > 0) {
                    handleSearchSubmit();
                  } else {
                    promptTextareaRef.current?.focus();
                  }
                }}
                className="relative overflow-hidden group w-full py-3.5 px-6 rounded-full bg-[#4F46E5] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_8px_22px_rgba(79,70,229,0.3)] hover:shadow-[0_10px_26px_rgba(6,182,212,0.34)] hover:scale-[1.01] active:scale-[0.98] transition-all duration-300 cursor-pointer"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-[#5549F6] via-[#2B8EF4] to-[#08B6DF] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <Sparkles className="relative z-10 w-4 h-4" />
                <span className="relative z-10">Find my communities</span>
                <ArrowRight className="relative z-10 w-4 h-4" />
              </button>
        </div>

        {/* Dynamic Matched Communities Section (Only appears after all prompts are sent: hasPrompted) */}
        {hasPrompted && (
          <div className="space-y-3 pt-1 text-left animate-in fade-in slide-in-from-bottom-2 duration-200">
            {/* Unjoined matched communities - deleted as soon as they are joined */}
            {displayCommunities.length > 0 ? (
              <div
                id="matched-communities-section"
                ref={matchedCommunitiesRef}
                className="space-y-3 scroll-mt-3"
              >
                {/* Active History Mode Banner */}
                {activeHistoryPrompt && (
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-indigo-50/95 via-purple-50/90 to-indigo-50/95 dark:from-indigo-950/80 dark:via-purple-950/70 dark:to-indigo-950/80 border border-indigo-200/90 dark:border-indigo-800/80 flex items-center justify-between gap-3 text-left shadow-xs animate-in fade-in duration-150">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <History className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                            Viewing Past Servers From History
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            • {activeHistoryPrompt.timestamp}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          "{activeHistoryPrompt.title}"
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveHistoryPrompt(null)}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[11px] font-bold transition-all cursor-pointer shrink-0 shadow-2xs active:scale-95"
                      title="Return to latest live recommended servers"
                    >
                      Reset to Latest
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between gap-2 px-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 fill-indigo-600 dark:fill-indigo-400 shrink-0" />
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-display truncate">
                      Matched Communities for you
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200/70 dark:border-indigo-800 tabular-nums">
                      {joinedCount}/{maxAllowedSlots} Servers
                    </span>
                    <button
                      onClick={() => setPromptedInterests(null)}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg text-xs cursor-pointer"
                      title="Dismiss"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Banner when free limit reached (2 + bonusSlots servers), plus limit reached (5 servers), or pro limit reached (10 servers) */}
                {((userPlan === 'free' && joinedCount >= (2 + bonusSlotsState)) || (userPlan === 'plus' && joinedCount >= 5) || (userPlan === 'pro' && joinedCount >= 10)) && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-left flex items-center justify-between gap-3 shadow-xs animate-in fade-in duration-200">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Lock className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-amber-950 dark:text-amber-200">
                          {userPlan === 'pro'
                            ? 'Cronium Pro (10 curated servers allowed)'
                            : userPlan === 'plus'
                            ? 'Cronium Plus (With 5 curated servers joining)'
                            : `Free tier (${2 + bonusSlotsState} default servers)`}
                        </p>
                        <p className="text-[11px] text-amber-800 dark:text-amber-300 font-medium truncate">
                          {userPlan === 'free'
                            ? '2 default servers · Upgrade for 5 or 10 curated servers allowed'
                            : userPlan === 'plus'
                            ? 'Upgrade to Cronium Pro for 10 curated servers allowed and AI-driven Job application'
                            : '10 curated servers allowed on Cronium Pro'}
                        </p>
                      </div>
                    </div>
                    {userPlan !== 'pro' && (
                      <button
                        onClick={() => setShowGamificationModal(true)}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shrink-0 transition-transform active:scale-95 shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                        <span>Earn Servers</span>
                      </button>
                    )}
                  </div>
                )}

                {displayCommunities.map((community, cIdx) => (
                  <div
                    key={`${community.id}_${cIdx}`}
                    className="p-3.5 sm:p-4 rounded-[26px] transition-shadow duration-150 text-left flex flex-col gap-2.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500/70 shadow-2xs hover:shadow-[0_4px_16px_rgba(99,102,241,0.09)]"
                  >
                    <div className="flex items-center justify-between gap-3.5">
                      <div
                        onClick={() => onOpenCommunity?.(community)}
                        className="flex items-center gap-3.5 min-w-0 cursor-pointer flex-1 group"
                      >
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

                      {/* Right: Default Purple Join Button */}
                      <div className="shrink-0">
                        <button
                          onClick={() => handleJoinCommunity(community)}
                          className="px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all active:scale-95 cursor-pointer"
                        >
                          <span>Join</span>
                          <ChevronRight className="w-4 h-4 stroke-[2.2]" />
                        </button>
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

                <div className="pt-1 pb-0.5 text-center">
                  <button
                    type="button"
                    onClick={() => setShowPremiumModal(true)}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline inline-flex items-center gap-1 cursor-pointer transition-colors py-1 select-none active:scale-95"
                    title="Unlock more communities with a subscription"
                  >
                    <span>— More communities for you —</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-3xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 text-center">
                <p className="text-xs font-semibold text-indigo-900 dark:text-indigo-200">
                  All recommended communities joined!
                </p>
                {onNavigateToServers && (
                  <button
                    onClick={onNavigateToServers}
                    className="mt-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>View in Servers & DMs</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
            {/* Feedback Bar directly below "— More communities for you —" (Only visible after 3 prompts) */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-3.5 sm:p-4 shadow-xs text-left space-y-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white font-display leading-tight">
                    Feedback &amp; Comments
                  </h3>
                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400 truncate">
                    Share your feedback or comments
                  </p>
                </div>
              </div>

              {/* Compact Feedback Bar + Send Button */}
              <form onSubmit={handleSubmitFeedback} className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    ref={feedbackInputRef}
                    type="text"
                    value={feedbackText}
                    onChange={(e) => {
                      setFeedbackText(e.target.value);
                      if (feedbackSentNotice) setFeedbackSentNotice(null);
                      if (feedbackHint) setFeedbackHint(null);
                    }}
                    placeholder="Write your feedback or comments..."
                    disabled={isSendingFeedback}
                    className="flex-1 min-w-0 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-950/60 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all disabled:opacity-60"
                  />
                  <button
                    type="submit"
                    disabled={isSendingFeedback}
                    className="py-2.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold text-xs inline-flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSendingFeedback ? 'Sending...' : 'Send'}</span>
                  </button>
                </div>

                {feedbackHint && (
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 px-1">
                    {feedbackHint}
                  </p>
                )}

                {feedbackSentNotice && (
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/80 dark:border-indigo-900 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span>{feedbackSentNotice}</span>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

      </div>

      {/* Premium Unlock Modal */}
      <PremiumUnlockModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        onUnlock={(plan) => {
          const nextPlan = plan || 'pro';
          onUnlockPlan?.(nextPlan);
          setShowPremiumModal(false);
          if (pendingCommunity) {
            onToggleJoin?.(pendingCommunity.id, pendingCommunity, true);
            const comm = { ...pendingCommunity, joined: true };
            if (onOpenCommunity) {
              onOpenCommunity(comm, true);
            }
            setPendingCommunity(null);
          }
        }}
        joinedCount={joinedCount}
        currentPlan={userPlan}
      />

      {/* Prompt History & Past Matched Servers Modal */}
      <PromptHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        historyItems={promptHistory}
        onSelectPrompt={handleSelectHistoricalPrompt}
        onDeletePrompt={handleDeleteHistoryItem}
        onClearHistory={handleClearHistory}
        activeHistoryId={activeHistoryPrompt?.id}
      />

      {/* Gamification Dashboard Modal to earn server slots */}
      {showGamificationModal && (
        <GamificationDashboard
          isModal={true}
          onClose={() => setShowGamificationModal(false)}
          onServerSlotsUpdated={(newBonus) => setBonusSlotsState(newBonus)}
          onNavigateToServers={onNavigateToServers}
        />
      )}
    </div>
  );
};
