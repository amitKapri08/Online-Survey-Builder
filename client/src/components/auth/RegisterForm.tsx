import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, User } from "lucide-react";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { AxiosError } from "axios";
import { Link } from "react-router-dom";

import {
  AuthDivider,
  AuthInput,
  PasswordInput,
  SocialAuthButtons,
} from "@/components/auth";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/useAuth";
import { useRegister } from "@/hooks/useAuthApi";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/routes";
import { registerSchema, type RegisterFormValues } from "@/schemas/auth.schema";

export function RegisterForm() {
  const { setUser } = useAuth();
  const registerMutation = useRegister();

  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
    },
  });

  const password = useWatch({ control, name: "password" });
  const passwordStrength = getPasswordStrength(password || "");

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null);

    try {
      const response = await registerMutation.mutateAsync({
        name: values.name,
        email: values.email,
        password: values.password,
      });

      setUser(response.data.user);
    } catch (error) {
      if (error instanceof AxiosError) {
        const status = error.response?.status;
        if (status === 409) {
          setServerError("An account with this email already exists.");
        } else if (status === 429) {
          setServerError(
            "Too many registration attempts. Please try again later.",
          );
        } else {
          const message = error.response?.data?.errors?.[0]?.message;
          setServerError(message || "Something went wrong. Please try again.");
        }
      } else {
        setServerError("Something went wrong. Please try again.");
      }
    }
  };

  const isSubmitting = registerMutation.isPending;

  function getPasswordStrength(pwd: string): {
    score: number;
    label: string;
    color: string;
    percent: number;
  } {
    if (!pwd)
      return { score: 0, label: "Not set", color: "bg-muted", percent: 0 };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 1)
      return { score, label: "Weak", color: "bg-danger-500", percent: 25 };
    if (score === 2)
      return { score, label: "Fair", color: "bg-amber-500", percent: 50 };
    if (score === 3)
      return { score, label: "Good", color: "bg-blue-500", percent: 75 };
    return { score, label: "Strong", color: "bg-emerald-500", percent: 100 };
  }

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

      {/* Name */}
      <AuthInput
        id="register-name"
        label="Full name"
        type="text"
        placeholder="Enter your full name"
        autoComplete="name"
        icon={<User className="size-4" />}
        error={errors.name?.message}
        disabled={isSubmitting}
        {...register("name")}
      />

      {/* Email */}
      <AuthInput
        id="register-email"
        label="Email address"
        type="email"
        placeholder="Enter your email"
        autoComplete="email"
        icon={<Mail className="size-4" />}
        error={errors.email?.message}
        disabled={isSubmitting}
        {...register("email")}
      />

      {/* Password */}
      <PasswordInput
        id="register-password"
        label="Password"
        placeholder="Create a password"
        autoComplete="new-password"
        error={errors.password?.message}
        disabled={isSubmitting}
        {...register("password")}
      />

      {/* Dynamic Password Strength Slider / Meter */}
      {password.length > 0 && (
        <div className="space-y-1.5 pt-0.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] text-muted-foreground">
              Password strength
            </span>
            <span
              className={cn(
                "font-semibold text-[11px]",
                passwordStrength.score <= 1
                  ? "text-danger-500"
                  : passwordStrength.score === 2
                    ? "text-amber-500"
                    : passwordStrength.score === 3
                      ? "text-blue-500"
                      : "text-emerald-500",
              )}
            >
              {passwordStrength.label}
            </span>
          </div>

          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300",
                passwordStrength.color,
              )}
              style={{ width: `${passwordStrength.percent}%` }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            Must be at least 8 chars with an uppercase, number & symbol.
          </p>
        </div>
      )}

      {/* Confirm password */}
      <PasswordInput
        id="register-confirm-password"
        label="Confirm password"
        placeholder="Confirm your password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        disabled={isSubmitting}
        {...register("confirmPassword")}
      />

      {/* Terms */}
      <div>
        <Controller
          name="termsAccepted"
          control={control}
          render={({ field }) => (
            <label
              htmlFor="register-terms"
              className="flex cursor-pointer items-start gap-2"
            >
              <Checkbox
                id="register-terms"
                className="mt-0.5"
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={isSubmitting}
              />

              <span className="text-xs leading-5 text-muted-foreground">
                I agree to the{" "}
                <Button
                  type="button"
                  variant="link"
                  className="h-auto px-0 text-xs font-medium"
                >
                  Terms of Service
                </Button>{" "}
                and{" "}
                <Button
                  type="button"
                  variant="link"
                  className="h-auto px-0 text-xs font-medium"
                >
                  Privacy Policy
                </Button>
              </span>
            </label>
          )}
        />

        {errors.termsAccepted && (
          <p className="mt-2 text-xs font-medium text-danger-600">
            {errors.termsAccepted.message}
          </p>
        )}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        variant="brand"
        className="w-full h-11 rounded-xl font-semibold shadow-md shadow-brand-500/20"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Creating account..." : "Create account"}
      </Button>

      <AuthDivider />

      <SocialAuthButtons disabled={isSubmitting} />

      {/* Login */}
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          to={ROUTES.LOGIN}
          className="font-semibold text-brand-600 hover:text-brand-700 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
