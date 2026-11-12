import { BarChart3, MousePointerClick, Share2, Users } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

interface ResultsTabProps {
  responseCount: number;
  viewCount: number;
  questionCount: number;
  onShare?: () => void;
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Users;
  label: string;
  value: number;
  hint: string;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold text-foreground">{value}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

function ResultsTab({
  responseCount,
  viewCount,
  questionCount,
  onShare,
}: ResultsTabProps) {
  const handleShare = () => {
    if (onShare) {
      onShare();
    } else {
      toast.info("Share is coming soon");
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={Users}
          label="Responses"
          value={responseCount}
          hint={
            responseCount === 1
              ? "response collected"
              : "responses collected"
          }
        />
        <StatCard
          icon={MousePointerClick}
          label="Views"
          value={viewCount}
          hint="page views"
        />
        <StatCard
          icon={BarChart3}
          label="Questions"
          value={questionCount}
          hint={questionCount === 1 ? "question" : "questions"}
        />
      </div>

      {responseCount === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              icon={BarChart3}
              title="No responses yet"
              description="Your analytics will appear here once respondents start submitting answers."
              action={{
                label: "Share survey",
                onClick: handleShare,
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Response analytics</CardTitle>
            <CardDescription>
              Per-question breakdowns are coming soon.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center rounded-lg border border-dashed py-16 text-sm text-muted-foreground">
              Charts and breakdowns will appear here.
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={handleShare}>
          <Share2 data-icon="inline-start" />
          Share survey
        </Button>
      </div>
    </div>
  );
}

export { ResultsTab };