import type { ReactNode } from "react";

interface AuthLayoutProps {
  brandPanel: ReactNode;
  children: ReactNode;
}

export function AuthLayout({ brandPanel, children }: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-muted p-4 sm:p-6 lg:p-8">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border sm:min-h-[calc(100vh-3rem)] lg:min-h-[calc(100vh-4rem)]">
        {/* Brand panel */}
        <aside className="hidden w-[38%] shrink-0 lg:block">{brandPanel}</aside>

        {/* Form panel */}
        <section className="flex min-w-0 flex-1 items-center justify-center p-6 sm:p-10 lg:p-12">
          <div className="w-full max-w-md">{children}</div>
        </section>
      </div>
    </main>
  );
}
