import React from 'react';
import { AlertTriangle } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // In a real app, you would log this to Sentry or Datadog
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-white border border-red-100 rounded-xl shadow-sm">
          <AlertTriangle size={48} className="text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-brand-dark mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-6 max-w-md">
            We encountered an unexpected error rendering this part of the application. 
            Please refresh the page or try again later.
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            className="inline-flex items-center justify-center px-5 py-3 bg-brand-primary text-white text-sm font-semibold rounded transition-all hover:-translate-y-0.5 hover:bg-brand-primaryHover"
          >
            Return to Home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
