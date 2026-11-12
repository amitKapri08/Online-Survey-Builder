import { AuthBrandPanel, AuthLayout, LoginForm } from "@/components/auth";
import { LegalLinks } from "@/components/legal/LegalLinks";

export default function LoginPage() {
  return (
    <AuthLayout brandPanel={<AuthBrandPanel variant="login" />}>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome back! <span className="sr-only">Waving hand</span>
            <span aria-hidden="true">👋</span>
          </h1>

          <p className="text-sm text-muted-foreground">
            Login to your account to continue
          </p>
        </div>

        <LoginForm />

        <LegalLinks className="flex items-center justify-center gap-2 text-xs" />
      </div>
    </AuthLayout>
  );
}
