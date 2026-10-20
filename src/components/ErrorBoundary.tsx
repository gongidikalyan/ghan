import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error?.message || 'An unexpected rendering error occurred.',
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console without breaking user experience
    console.error('Speed n Tension encountered a runtime error:', error, errorInfo);
  }

  private handleReload = () => {
    try {
      this.setState({ hasError: false, errorMessage: '' });
      window.location.reload();
    } catch {
      window.location.href = '/';
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div 
          className="fixed inset-0 w-full h-full flex flex-col items-center justify-center p-6 text-center select-none font-sans"
          style={{ backgroundColor: '#f8fafc', color: '#0f172a' }}
        >
          <div className="w-20 h-20 rounded-3xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-500 mb-6 shadow-xl">
            <AlertTriangle className="w-10 h-10" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black font-display uppercase tracking-tight mb-2 text-slate-900">
            Speed n Tension
          </h1>

          <p className="text-sm text-slate-600 max-w-xs mb-8">
            The game encountered a transient device glitch. Tap below to get right back into the action.
          </p>

          <button
            type="button"
            onClick={this.handleReload}
            className="h-14 px-8 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black font-display text-base tracking-wider uppercase shadow-xl shadow-rose-600/30 active:scale-95 transition-all flex items-center gap-2 cursor-pointer border border-rose-400/40"
          >
            <RotateCcw className="w-5 h-5 stroke-[2.5]" />
            RESTART GAME
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
