import { Plus } from "lucide-react";

import { DashboardHeader } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/context/useAuth";

export default function DashboardPage() {
  const { user } = useAuth();

  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="min-h-screen bg-muted">
      <DashboardHeader />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Welcome back, {firstName}!
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Create, manage and analyze your surveys from here.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your surveys</CardTitle>
            <CardDescription>
              Your surveys will appear here once you create one.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <p className="max-w-sm text-sm text-muted-foreground">
              This is the dashboard shell. Survey creation and management will
              be added here as the project evolves.
            </p>

            <Button
              variant="success"
              size="xl"
              className="w-full max-w-xs"
              disabled
            >
              <Plus data-icon="inline-start" />
              Create your first survey
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}