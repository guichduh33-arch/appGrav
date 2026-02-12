import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { logError } from '@/utils/logger'

interface ModuleErrorBoundaryProps {
  children: ReactNode;
  /** Name of the module for display in error messages */
  moduleName: string;
  /** Optional callback when user clicks retry */
  onReset?: () => void;
}

interface ModuleErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * Granular ErrorBoundary for individual modules (POS, KDS, Reports, Settings).
 * Prevents a crash in one module from taking down the entire application.
 * The root-level ErrorBoundary remains as the final safety net.
 */
export class ModuleErrorBoundary extends Component<ModuleErrorBoundaryProps, ModuleErrorBoundaryState> {
  constructor(props: ModuleErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ModuleErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logError(`[${this.props.moduleName}] Error caught by ModuleErrorBoundary:`, error);
    logError(`[${this.props.moduleName}] Component stack:`, errorInfo.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[400px] p-6">
          <div className="max-w-md w-full bg-white rounded-lg shadow-md border border-gray-200 p-6 text-center">
            <div className="mx-auto w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-7 h-7 text-amber-500" />
            </div>

            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {this.props.moduleName} encountered an error
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              An unexpected error occurred in this module. Other parts of the application are still working normally.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <details className="mb-4 p-3 bg-gray-50 rounded border border-gray-200 text-left">
                <summary className="cursor-pointer font-medium text-xs text-gray-600">
                  Error details (dev only)
                </summary>
                <pre className="mt-2 text-xs text-red-600 overflow-auto whitespace-pre-wrap">
                  {this.state.error.message}
                </pre>
                {this.state.error.stack && (
                  <pre className="mt-1 text-xs text-gray-500 overflow-auto max-h-32 whitespace-pre-wrap">
                    {this.state.error.stack}
                  </pre>
                )}
              </details>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors"
              >
                <Home className="w-4 h-4" />
                Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
