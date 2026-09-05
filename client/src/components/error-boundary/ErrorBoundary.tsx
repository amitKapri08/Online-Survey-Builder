import { Component, type ErrorInfo, type ReactNode } from "react";

import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleRetry = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-muted px-4 text-center">
          <div className="space-y-2">
            <p className="text-4xl font-extrabold text-brand-600">Oops!</p>

            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Something went wrong
            </h1>

            <p className="mx-auto max-w-sm text-sm text-muted-foreground">
              An unexpected error occurred while rendering this page. Please try
              again.
            </p>
          </div>

          <Button onClick={this.handleRetry}>Try again</Button>
        </div>
      );
    }

    return this.props.children;
  }
}
