import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import {
  Check,
  CheckCircle2,
  ChevronRight,
  KeyRound,
  LayoutDashboard,
  Mail,
  Shield,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { AuthInput, PasswordInput } from "@/components/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/context/useAuth";
import { useChangePassword, useUpdateProfile } from "@/hooks/useAuthApi";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import {
  changePasswordSchema,
  profileSchema,
  type ChangePasswordFormValues,
  type ProfileFormValues,
} from "@/schemas/auth.schema";

function ServerAlert({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700 dark:border-danger-900/50 dark:bg-danger-950/40 dark:text-danger-400"
    >
      {message}
    </div>
  );
}

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

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();

  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? "" },
  });

  const passwordForm = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const newPasswordValue =
    useWatch({ control: passwordForm.control, name: "newPassword" }) || "";
  const strength = getPasswordStrength(newPasswordValue);

  const passwordRequirements = [
    { label: "At least 8 characters", valid: newPasswordValue.length >= 8 },
    { label: "Uppercase letter (A-Z)", valid: /[A-Z]/.test(newPasswordValue) },
    { label: "Number (0-9)", valid: /[0-9]/.test(newPasswordValue) },
    {
      label: "Special symbol (!@#$)",
      valid: /[^A-Za-z0-9]/.test(newPasswordValue),
    },
  ];

  const initials = (user?.name || user?.email || "U")
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const onSaveProfile = async (values: ProfileFormValues) => {
    setProfileError(null);
    try {
      const updated = await updateProfileMutation.mutateAsync(values);
      setUser(updated);
      toast.success("Profile updated successfully!");
    } catch (error) {
      if (error instanceof AxiosError) {
        setProfileError(
          error.response?.status === 429
            ? "Too many attempts. Please try again later."
            : "Could not update your profile. Please try again.",
        );
      } else {
        setProfileError("Something went wrong. Please try again.");
      }
    }
  };

  const onChangePassword = async (values: ChangePasswordFormValues) => {
    setPasswordError(null);
    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      passwordForm.reset();
      toast.success("Password changed successfully!");
    } catch (error) {
      if (error instanceof AxiosError) {
        const status = error.response?.status;
        if (status === 400) {
          setPasswordError("Current password is incorrect.");
        } else if (status === 429) {
          setPasswordError("Too many attempts. Please try again later.");
        } else {
          setPasswordError("Could not change your password. Please try again.");
        }
      } else {
        setPasswordError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      {/* Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-sm text-muted-foreground"
      >
        <Link
          to={ROUTES.DASHBOARD}
          className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
        >
          <LayoutDashboard className="size-4" />
          <span>Dashboard</span>
        </Link>
        <ChevronRight className="size-4 text-muted-foreground/60" />
        <span className="font-medium text-foreground">Profile & Settings</span>
      </nav>

      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Account & Security
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your personal profile, credentials, and security preferences.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Badge
            variant="outline"
            className="gap-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium px-3 py-1"
          >
            <CheckCircle2 className="size-3.5" />
            Verified Account
          </Badge>
        </div>
      </div>

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Personal Profile & Identity */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="rounded-2xl border border-border shadow-xs overflow-hidden">
            <CardHeader className="border-b border-border/50 pb-5">
              <CardTitle className="flex items-center gap-2.5 text-base font-semibold">
                <div className="flex size-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
                  <UserRound className="size-4" />
                </div>
                Personal Identity
              </CardTitle>
              <CardDescription>
                Your public name and workspace credentials.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-4">
                <div className="flex size-18 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-indigo-500 text-2xl font-bold text-white shadow-md shadow-brand-500/20 ring-4 ring-brand-500/15 shrink-0">
                  {initials}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-semibold text-foreground text-base">
                      {user?.name || "Anonymous User"}
                    </h3>
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                  </div>
                  <p className="truncate text-xs text-muted-foreground mt-0.5">
                    {user?.email}
                  </p>
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    <ShieldCheck className="size-3" />
                    <span>Active Account</span>
                  </div>
                </div>
              </div>

              <ServerAlert message={profileError} />

              {/* Profile Form */}
              <form
                onSubmit={profileForm.handleSubmit(onSaveProfile)}
                className="space-y-4"
                noValidate
              >
                <AuthInput
                  id="profile-name"
                  label="Display Name"
                  type="text"
                  placeholder="Enter your name"
                  icon={<UserRound className="size-4" />}
                  error={profileForm.formState.errors.name?.message}
                  disabled={updateProfileMutation.isPending}
                  {...profileForm.register("name")}
                />

                <div className="space-y-2">
                  <label
                    htmlFor="profile-email"
                    className="flex items-center justify-between text-sm font-medium text-foreground"
                  >
                    <span>Email Address</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <Check className="size-3" /> Verified
                    </span>
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="profile-email"
                      type="email"
                      value={user?.email ?? ""}
                      readOnly
                      disabled
                      className="h-11 w-full rounded-xl border border-border bg-muted/60 pl-10 pr-3 text-sm text-muted-foreground cursor-not-allowed"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Primary account email address used for login and
                    notifications.
                  </p>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="brand"
                    className="h-11 rounded-xl w-full font-semibold shadow-md shadow-brand-500/20"
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending
                      ? "Saving..."
                      : "Save Profile Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Security & Password Management */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="rounded-2xl border border-border shadow-xs overflow-hidden">
            <CardHeader className="border-b border-border/50 pb-5">
              <CardTitle className="flex items-center gap-2.5 text-base font-semibold">
                <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <ShieldCheck className="size-4" />
                </div>
                Password & Security
              </CardTitle>
              <CardDescription>
                Keep your account protected with a strong cryptographic
                password.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              <ServerAlert message={passwordError} />

              <form
                onSubmit={passwordForm.handleSubmit(onChangePassword)}
                className="space-y-4"
                noValidate
              >
                <PasswordInput
                  id="current-password"
                  label="Current Password"
                  placeholder="Enter your current password"
                  autoComplete="current-password"
                  error={passwordForm.formState.errors.currentPassword?.message}
                  disabled={changePasswordMutation.isPending}
                  {...passwordForm.register("currentPassword")}
                />

                <div className="space-y-2">
                  <PasswordInput
                    id="new-password"
                    label="New Password"
                    placeholder="Create a strong new password"
                    autoComplete="new-password"
                    error={passwordForm.formState.errors.newPassword?.message}
                    disabled={changePasswordMutation.isPending}
                    {...passwordForm.register("newPassword")}
                  />

                  {/* Password Strength Meter */}
                  {newPasswordValue.length > 0 && (
                    <div className="rounded-xl border border-border/60 bg-muted/30 p-3.5 space-y-2.5 mt-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-muted-foreground flex items-center gap-1.5">
                          <Shield className="size-3.5" /> Password Strength:
                        </span>
                        <span
                          className={cn(
                            "font-bold uppercase tracking-wider text-[11px]",
                            strength.score <= 1
                              ? "text-danger-500"
                              : strength.score === 2
                                ? "text-amber-500"
                                : strength.score === 3
                                  ? "text-blue-500"
                                  : "text-emerald-500",
                          )}
                        >
                          {strength.label}
                        </span>
                      </div>

                      {/* 4-bar progress indicator */}
                      <div className="grid grid-cols-4 gap-1.5">
                        {[1, 2, 3, 4].map((step) => (
                          <div
                            key={step}
                            className={cn(
                              "h-1.5 rounded-full transition-all duration-300",
                              strength.score >= step
                                ? strength.color
                                : "bg-muted",
                            )}
                          />
                        ))}
                      </div>

                      {/* Requirements checklist */}
                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        {passwordRequirements.map((req) => (
                          <div
                            key={req.label}
                            className="flex items-center gap-1.5 text-[11px]"
                          >
                            <span
                              className={cn(
                                "flex size-3.5 items-center justify-center rounded-full text-[9px]",
                                req.valid
                                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold"
                                  : "bg-muted text-muted-foreground",
                              )}
                            >
                              {req.valid ? "✓" : "•"}
                            </span>
                            <span
                              className={
                                req.valid
                                  ? "text-foreground font-medium"
                                  : "text-muted-foreground"
                              }
                            >
                              {req.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <PasswordInput
                  id="confirm-new-password"
                  label="Confirm New Password"
                  placeholder="Re-type your new password"
                  autoComplete="new-password"
                  error={
                    passwordForm.formState.errors.confirmNewPassword?.message
                  }
                  disabled={changePasswordMutation.isPending}
                  {...passwordForm.register("confirmNewPassword")}
                />

                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-3.5 text-xs text-muted-foreground flex items-start gap-2.5">
                  <KeyRound className="size-4 text-brand-500 shrink-0 mt-0.5" />
                  <span>
                    Changing your password will invalidate active sessions on
                    other devices for maximum security.
                  </span>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="brand"
                    className="h-11 rounded-xl w-full font-semibold shadow-md shadow-brand-500/20"
                    disabled={changePasswordMutation.isPending}
                  >
                    {changePasswordMutation.isPending
                      ? "Updating Password..."
                      : "Update Password"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
