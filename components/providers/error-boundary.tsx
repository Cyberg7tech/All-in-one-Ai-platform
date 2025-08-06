'use client';

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className='flex h-screen w-full items-center justify-center'>
            <div className='text-center'>
              <h2 className='text-2xl font-bold mb-4'>Something went wrong</h2>
              <p className='text-gray-600 mb-4'>
                We're sorry, but something went wrong. Please try refreshing the page.
              </p>
              <button
                onClick={() => window.location.reload()}
                className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'>
                Refresh Page
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
