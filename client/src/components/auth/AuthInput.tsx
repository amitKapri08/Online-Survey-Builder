import type { InputHTMLAttributes, ReactNode } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
  icon?: ReactNode;
}

export function AuthInput({
  label,
  error,
  icon,
  id,
  ...props
}: AuthInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-foreground">
        {label}
      </Label>

      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}

        <Input
          id={id}
          aria-invalid={error ? true : undefined}
          className={cn("h-11", icon ? "pl-10 pr-3" : "px-3")}
          {...props}
        />
      </div>

      {error && <p className="text-xs font-medium text-danger-600">{error}</p>}
    </div>
  );
}