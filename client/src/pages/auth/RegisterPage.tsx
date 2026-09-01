import { AuthBrandPanel, AuthLayout, RegisterForm } from "@/components/auth";

export default function RegisterPage() {
  return (
    <AuthLayout brandPanel={<AuthBrandPanel variant="register" />}>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Create your account
          </h1>

          <p className="text-sm text-muted-foreground">
            Join SurveyHub and get started today!
          </p>
        </div>

        <RegisterForm />
      </div>
    </AuthLayout>
  );
}
