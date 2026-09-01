import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-muted px-4 text-center">
      <div className="space-y-2">
        <p className="bg-gradient-to-br from-brand-600 to-success-600 bg-clip-text text-7xl font-extrabold text-transparent">
          404
        </p>

        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Page not found
        </h1>

        <p className="mx-auto max-w-sm text-sm text-muted-foreground">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
      </div>

      <Button onClick={() => navigate(ROUTES.HOME)}>Go back home</Button>
    </div>
  );
}