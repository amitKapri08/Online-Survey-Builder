import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, User } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
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
    watch,
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

  const password = watch("password");

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

  const passwordRequirements = [
    {
      label: "At least 8 characters",
      valid: password.length >= 8,
    },
    {
      label: "Contains an uppercase letter",
      valid: /[A-Z]/.test(password),
    },
    {
      label: "Contains a lowercase letter",
      valid: /[a-z]/.test(password),
    },
    {
      label: "Contains a number",
      valid: /[0-9]/.test(password),
    },
    {
      label: "Contains a special character",
      valid: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    },
  ];

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

      {/* Password requirements */}
      <div className="space-y-2">
        {passwordRequirements.map((requirement) => (
          <div
            key={requirement.label}
            className="flex items-center gap-2 text-xs"
          >
            <span
              className={cn(
                "flex size-4 items-center justify-center rounded-full text-[10px]",
                requirement.valid
                  ? "bg-success-100 text-success-600"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {requirement.valid ? "✓" : "•"}
            </span>

            <span
              className={
                requirement.valid ? "text-success-600" : "text-muted-foreground"
              }
            >
              {requirement.label}
            </span>
          </div>
        ))}
      </div>

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
        variant="success"
        size="xl"
        className="w-full font-semibold"
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
          className="font-semibold text-success-600 hover:text-success-700"
        >
          Login
        </Link>
      </p>
    </form>
  );
}
