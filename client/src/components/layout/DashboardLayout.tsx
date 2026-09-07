import { DashboardHeader } from "@/components/dashboard";
import { AppFooter } from "@/components/layout/AppFooter";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-muted">
      <DashboardHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
      <AppFooter />
    </div>
  );
}

export { DashboardLayout };
