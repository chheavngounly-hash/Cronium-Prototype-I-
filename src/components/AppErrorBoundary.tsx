import React from 'react';
import { RefreshCw, RotateCcw } from 'lucide-react';

interface AppErrorBoundaryProps {
  children: React.ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends React.Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  constructor(props: AppErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('Cronium runtime recovery triggered:', error, info);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetAndReload = () => {
    try {
      const keysToClear: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith('cronium_')) {
          keysToClear.push(key);
        }
      }
      keysToClear.forEach((key) => window.localStorage.removeItem(key));
    } catch {
      // ignore storage errors
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-[#F5F8FF] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-5 font-sans">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-200/90 dark:border-slate-800 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#EEEBFE] dark:bg-indigo-950 text-[#5B35F8] dark:text-indigo-400 flex items-center justify-center mx-auto">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Unable to load this view
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                A temporary browser cache or session issue prevented Cronium from opening cleanly. Reload or reset local cache to continue.
              </p>
            </div>
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full py-2.5 px-4 rounded-full bg-[#5B35F8] hover:bg-[#4B27E5] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Cronium</span>
              </button>
              <button
                type="button"
                onClick={this.handleResetAndReload}
                className="w-full py-2.5 px-4 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Cache &amp; Reload</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
