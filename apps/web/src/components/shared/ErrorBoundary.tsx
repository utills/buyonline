'use client';

import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="rounded-xl border border-gray-100 bg-gray-50 px-6 py-8 text-center">
            <p className="text-sm font-medium text-gray-700">Section unavailable</p>
            <p className="mt-1 text-xs text-gray-400">
              Please refresh the page or try again later.
            </p>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
