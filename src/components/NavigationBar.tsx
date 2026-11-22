import React from 'react';
import { Home, MessageSquare, Share2, User } from 'lucide-react';
import { NavTab, DirectChat } from '../types';

export interface NavigationBarProps {
  activeTab: NavTab;
  onSelectTab?: (tab: NavTab) => void;
  onTabChange?: (tab: NavTab) => void;
  hasPrompted?: boolean;
  directChats?: DirectChat[];
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  activeTab,
  onSelectTab,
  onTabChange,
}) => {
  const handleTab = (tab: NavTab) => {
    onSelectTab?.(tab);
    onTabChange?.(tab);
  };

  return (
    <nav className="sticky bottom-0 z-30 w-full bg-white/98 dark:bg-slate-900/98 border-t border-slate-200/80 dark:border-slate-800 px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shrink-0">
      <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
        {/* Home Tab */}
        <button
          onClick={() => handleTab('home')}
          className={`flex flex-col items-center justify-center py-1.5 px-4 rounded-2xl transition-colors duration-150 active:scale-95 cursor-pointer ${
            activeTab === 'home'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium'
          }`}
        >
          <Home className={`w-5 h-5 ${activeTab === 'home' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-0.5">Home</span>
        </button>

        {/* Servers & DMs Tab */}
        <button
          onClick={() => handleTab('servers')}
          className={`relative flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-colors duration-150 active:scale-95 cursor-pointer ${
            activeTab === 'servers'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium'
          }`}
        >
          <MessageSquare className={`w-5 h-5 ${activeTab === 'servers' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-0.5">Servers & DMs</span>
        </button>

        {/* Feed Tab */}
        <button
          onClick={() => handleTab('feed')}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-colors duration-150 active:scale-95 cursor-pointer ${
            activeTab === 'feed'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium'
          }`}
        >
          <Share2 className={`w-5 h-5 ${activeTab === 'feed' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-0.5">Feed</span>
        </button>

        {/* Profile Tab */}
        <button
          onClick={() => handleTab('profile')}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-colors duration-150 active:scale-95 cursor-pointer ${
            activeTab === 'profile'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium'
          }`}
        >
          <User className={`w-5 h-5 ${activeTab === 'profile' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-0.5">Profile</span>
        </button>
      </div>
    </nav>
  );
};
