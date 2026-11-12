import { Separator } from "@/components/ui/separator";

interface AuthDividerProps {
  text?: string;
}

export function AuthDivider({ text = "or continue with" }: AuthDividerProps) {
  return (
    <div className="flex items-center gap-4">
      <Separator className="flex-1" />

      <span className="shrink-0 text-xs text-muted-foreground">{text}</span>

      <Separator className="flex-1" />
    </div>
  );
}
