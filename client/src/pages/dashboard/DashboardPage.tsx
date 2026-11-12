import { useNavigate } from "react-router-dom";
import { ClipboardList, Plus, BarChart3, Users } from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/context/useAuth";
import { ROUTES } from "@/lib/routes";

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const firstName = user?.name?.split(" ")[0] ?? "there";
  const isAdmin = user?.role === "ADMIN";

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Welcome back, {firstName}!
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create, manage and analyze your surveys from here.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card
          className="cursor-pointer transition-colors hover:ring-2 hover:ring-ring/50"
          onClick={() => navigate(ROUTES.SURVEYS)}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardList className="size-5 text-brand-600" />
              My surveys
            </CardTitle>
            <CardDescription>
              View, create and manage your surveys.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="success" className="w-full">
              <Plus data-icon="inline-start" />
              Create survey
            </Button>
          </CardContent>
        </Card>

        {isAdmin && (
          <Card
            className="cursor-pointer transition-colors hover:ring-2 hover:ring-ring/50"
            onClick={() => navigate(ROUTES.ADMIN)}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="size-5 text-success-600" />
                Admin panel
              </CardTitle>
              <CardDescription>
                Platform stats, user management and oversight.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="size-4" />
                Manage users and surveys
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
