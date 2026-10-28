import React, { Component } from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled exception:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl border border-[#e4dfd5] shadow-lg p-6 sm:p-8 text-center space-y-5">
            <div className="w-14 h-14 rounded-full bg-[#fef2f2] text-[#dc2626] mx-auto flex items-center justify-center border border-[#fecaca]">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h1 className="font-serif font-bold text-xl sm:text-2xl text-[#1a2e1d]">
                Something went wrong
              </h1>
              <p className="text-xs sm:text-sm text-[#526055] leading-relaxed">
                An unexpected interface error occurred. Please try reloading the page or returning to the dashboard.
              </p>
            </div>

            {import.meta.env.DEV && this.state.error && (
              <div className="text-left p-3 rounded-lg bg-[#faf8f5] border border-[#e4dfd5] text-[11px] text-[#991b1b] font-mono overflow-auto max-h-32">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-[#1b432a] hover:bg-[#143420] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-white border border-[#d6cfc3] hover:bg-[#faf8f5] text-[#1a2e1d] text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Go to Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
