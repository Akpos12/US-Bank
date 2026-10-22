import React, { Component, ErrorInfo, ReactNode } from 'react';
import { UsBankLogo } from './UsBankLogo.tsx';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[U.S. Bank App Error Boundary Caught]:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('usbank_session_token');
      sessionStorage.removeItem('usbank_session_token');
    } catch {}
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F4F6F8] flex flex-col justify-between font-sans text-slate-900">
          <header className="bg-white border-b border-slate-200 py-3 px-6 sm:px-8">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <UsBankLogo size="md" variant="dark" />
              <button
                onClick={this.handleReset}
                className="text-[#005A9C] font-bold text-xs sm:text-sm hover:underline"
              >
                Return to Homepage
              </button>
            </div>
          </header>

          <main className="max-w-lg w-full mx-auto p-6 sm:p-8 my-auto">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#005A9C] flex items-center justify-center mx-auto">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Secure Session Recovery
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-[#0C2340] mt-1">
                  Session Synchronization
                </h1>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Your banking session encountered a synchronization interruption. Click below to refresh your connection and safely access your accounts.
                </p>
              </div>

              {this.state.error && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-left text-[11px] font-mono text-slate-600 overflow-x-auto max-h-28">
                  {this.state.error.message}
                </div>
              )}

              <div className="pt-2 space-y-2">
                <button
                  onClick={this.handleReset}
                  className="w-full py-3 bg-[#005A9C] hover:bg-[#004578] text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                >
                  Reload Online Banking Portal
                </button>
                <div className="text-[11px] text-slate-400 font-mono">
                  Member FDIC • 256-Bit TLS Bank-Grade Encryption
                </div>
              </div>
            </div>
          </main>

          <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
            © 2026 U.S. Bank National Association. All rights reserved. Member FDIC.
          </footer>
        </div>
      );
    }

    return this.props.children;
  }
}
