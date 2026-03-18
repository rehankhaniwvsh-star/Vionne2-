import React, { Component } from 'react';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: any;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  constructor(props: Props) {
    super(props);
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let errorDetails = null;
      try {
        // Attempt to parse Firestore error JSON if available
        if (this.state.error?.message) {
          errorDetails = JSON.parse(this.state.error.message);
        }
      } catch (e) {
        // Not a JSON error
      }

      return (
        <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white p-10 rounded-3xl border border-zinc-100 shadow-xl text-center">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={32} />
            </div>
            <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
            <p className="text-zinc-500 mb-8 leading-relaxed">
              We encountered an unexpected error. This might be due to a connection issue or missing permissions.
            </p>

            {errorDetails && (
              <div className="mb-8 p-4 bg-zinc-50 rounded-xl text-left overflow-hidden">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Error Details</p>
                <div className="text-xs font-mono text-zinc-600 break-all space-y-1">
                  <p><span className="font-bold">Operation:</span> {errorDetails.operationType}</p>
                  <p><span className="font-bold">Path:</span> {errorDetails.path}</p>
                  <p><span className="font-bold">Error:</span> {errorDetails.error}</p>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button 
                onClick={() => window.location.reload()}
                className="w-full bg-black text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all"
              >
                <RefreshCcw size={18} />
                Try Again
              </button>
              <button 
                onClick={() => window.location.href = '/'}
                className="w-full py-4 rounded-xl border border-zinc-100 font-bold flex items-center justify-center gap-2 hover:bg-zinc-50 transition-all"
              >
                <Home size={18} />
                Go to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
