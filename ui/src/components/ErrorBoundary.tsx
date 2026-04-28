import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;

    if (error) {
      return (
        <div className="flex h-full min-h-64 flex-col items-center justify-center gap-4 px-4 text-center">
          <div className="text-4xl">⚠️</div>
          <div>
            <p className="text-base font-medium text-gray-900">Something went wrong</p>
            <p className="mt-1 text-sm text-gray-500">{error.message}</p>
          </div>
          <button
            onClick={this.reset}
            className="bg-brand-600 hover:bg-brand-700 rounded-md px-3.5 py-2 text-sm font-medium text-white"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
