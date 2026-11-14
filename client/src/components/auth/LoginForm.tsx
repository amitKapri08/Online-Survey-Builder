import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";

import {
  AuthDivider,
  AuthInput,
  PasswordInput,
  SocialAuthButtons,
} from "@/components/auth";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/useAuth";
import { useLogin } from "@/hooks/useAuthApi";
import { getPostAuthRedirect } from "@/lib/authRedirect";
import { ROUTES } from "@/lib/routes";
import { loginSchema, type LoginFormValues } from "@/schemas/auth.schema";

export function LoginForm() {
  const { setUser } = useAuth();
  const loginMutation = useLogin();
  const navigate = useNavigate();
  const location = useLocation();

  const [serverError, setServerError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);

    try {
      const response = await loginMutation.mutateAsync(values);

      setUser(response.data.user);
      navigate(getPostAuthRedirect(location.state), { replace: true });
    } catch (error) {
      if (error instanceof AxiosError) {
        const status = error.response?.status;

        if (status === 401) {
          setServerError("Invalid email or password.");
        } else if (status === 429) {
          setServerError("Too many login attempts. Please try again later.");
        } else {
          setServerError("Unable to sign in. Please try again.");
        }
      } else {
        setServerError("Something went wrong. Please try again.");
      }
    }
  };

  const isSubmitting = loginMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {serverError && (
        <div
          role="alert"
          className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700 dark:border-danger-900/50 dark:bg-danger-950/40 dark:text-danger-400"
        >
          {serverError}
        </div>
      )}

      <AuthInput
        id="login-email"
        label="Email address"
        type="email"
        placeholder="name@example.com"
        autoComplete="email"
        icon={<Mail className="size-4" />}
        error={errors.email?.message}
        disabled={isSubmitting}
        {...register("email")}
      />

      <PasswordInput
        id="login-password"
        label="Password"
        placeholder="Enter your password"
        autoComplete="current-password"
        error={errors.password?.message}
        disabled={isSubmitting}
        {...register("password")}
      />

      <div className="flex items-center justify-between">
        <label
          htmlFor="login-remember"
          className="flex cursor-pointer items-center gap-2 text-xs font-medium text-muted-foreground select-none hover:text-foreground"
        >
          <input
            id="login-remember"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="size-4 rounded border-border text-brand-600 focus:ring-brand-500 focus:ring-offset-background"
          />
          Remember me
        </label>

        <Button
          type="button"
          variant="link"
          className="h-auto p-0 text-xs font-semibold text-brand-600 hover:text-brand-700"
        >
          Forgot password?
        </Button>
      </div>

      <Button
        type="submit"
        variant="brand"
        className="w-full h-11 rounded-xl font-semibold shadow-md shadow-brand-500/20"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Signing in..." : "Sign in to Dashboard"}
      </Button>

      <AuthDivider />

      <SocialAuthButtons disabled={isSubmitting} />

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          to={ROUTES.REGISTER}
          state={location.state}
          className="font-semibold text-brand-600 hover:text-brand-700 hover:underline"
        >
          Sign up
        </Link>
      </p>
    </form>
  );
}
