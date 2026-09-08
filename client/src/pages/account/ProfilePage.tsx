import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { KeyRound, Mail, UserRound } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { AuthInput, PasswordInput } from "@/components/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/context/useAuth";
import {
  useChangePassword,
  useUpdateProfile,
} from "@/hooks/useAuthApi";
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
      className="rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700"
    >
      {message}
    </div>
  );
}

function ProfilePage() {
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

  const onSaveProfile = async (values: ProfileFormValues) => {
    setProfileError(null);
    try {
      const updated = await updateProfileMutation.mutateAsync(values);
      setUser(updated);
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
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Account
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your profile and password.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserRound className="size-5 text-muted-foreground" />
            Profile
          </CardTitle>
          <CardDescription>
            Your name is shown to survey creators when you answer their
            surveys.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ServerAlert message={profileError} />
          <form
            onSubmit={profileForm.handleSubmit(onSaveProfile)}
            className="space-y-5"
            noValidate
          >
            <AuthInput
              id="profile-name"
              label="Name"
              type="text"
              icon={<UserRound className="size-4" />}
              error={profileForm.formState.errors.name?.message}
              disabled={updateProfileMutation.isPending}
              {...profileForm.register("name")}
            />
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={user?.email ?? ""}
                  readOnly
                  className="h-11 w-full rounded-lg border border-border bg-muted pl-10 pr-3 text-sm text-muted-foreground"
                />
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Email changes are not supported yet.
              </p>
            </div>
            <Button
              type="submit"
              variant="brand"
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? "Saving..." : "Save profile"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="size-5 text-muted-foreground" />
            Password
          </CardTitle>
          <CardDescription>
            Changing your password signs you out of all other devices.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ServerAlert message={passwordError} />
          <form
            onSubmit={passwordForm.handleSubmit(onChangePassword)}
            className="space-y-5"
            noValidate
          >
            <PasswordInput
              id="current-password"
              label="Current password"
              autoComplete="current-password"
              error={passwordForm.formState.errors.currentPassword?.message}
              disabled={changePasswordMutation.isPending}
              {...passwordForm.register("currentPassword")}
            />
            <PasswordInput
              id="new-password"
              label="New password"
              autoComplete="new-password"
              error={passwordForm.formState.errors.newPassword?.message}
              disabled={changePasswordMutation.isPending}
              {...passwordForm.register("newPassword")}
            />
            <PasswordInput
              id="confirm-new-password"
              label="Confirm new password"
              autoComplete="new-password"
              error={passwordForm.formState.errors.confirmNewPassword?.message}
              disabled={changePasswordMutation.isPending}
              {...passwordForm.register("confirmNewPassword")}
            />
            <Button
              type="submit"
              variant="brand"
              disabled={changePasswordMutation.isPending}
            >
              {changePasswordMutation.isPending
                ? "Changing..."
                : "Change password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProfilePage;