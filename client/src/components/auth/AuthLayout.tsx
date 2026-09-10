import type { ReactNode } from "react";

interface AuthLayoutProps {
  brandPanel: ReactNode;
  children: ReactNode;
}

export function AuthLayout({ brandPanel, children }: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-muted/40 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      <div className="mx-auto flex w-full max-w-6xl overflow-hidden rounded-3xl bg-card shadow-2xl ring-1 ring-border/60">
        {/* Brand panel */}
        <aside className="hidden w-[45%] shrink-0 lg:block">{brandPanel}</aside>

        {/* Form panel */}
        <section className="flex min-w-0 flex-1 items-center justify-center p-6 sm:p-10 lg:p-14">
          <div className="w-full max-w-md">{children}</div>
        </section>
      </div>
    </main>
  );
}
