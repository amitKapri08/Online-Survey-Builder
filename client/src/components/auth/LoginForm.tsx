import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";

import {
  AuthDivider,
  AuthInput,
  PasswordInput,
  SocialAuthButtons,
} from "@/components/auth";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/useAuth";
import { useLogin } from "@/hooks/useAuthApi";
import { ROUTES } from "@/lib/routes";
import { loginSchema, type LoginFormValues } from "@/schemas/auth.schema";

export function LoginForm() {
  const { setUser } = useAuth();
  const loginMutation = useLogin();

  const [serverError, setServerError] = useState<string | null>(null);

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
          className="rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700"
        >
          {serverError}
        </div>
      )}

      <AuthInput
        id="login-email"
        label="Email address"
        type="email"
        placeholder="Enter your email"
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

      <div className="flex justify-end">
        <Button
          type="button"
          variant="link"
          className="h-auto px-0 text-sm font-medium"
        >
          Forgot password?
        </Button>
      </div>

      <Button
        type="submit"
        variant="brand"
        size="xl"
        className="w-full font-semibold"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Signing in..." : "Login"}
      </Button>

      <AuthDivider />

      <SocialAuthButtons disabled={isSubmitting} />

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          to={ROUTES.REGISTER}
          className="font-semibold text-brand-600 hover:text-brand-700"
        >
          Sign up
        </Link>
      </p>
    </form>
  );
}
