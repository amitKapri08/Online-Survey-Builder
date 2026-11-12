import { Link } from "react-router-dom";

import { ROUTES } from "@/lib/routes";

interface LegalLinksProps {
  className?: string;
}

function LegalLinks({ className }: LegalLinksProps) {
  return (
    <div className={className}>
      <Link
        to={ROUTES.PRIVACY_POLICY}
        className="text-muted-foreground transition-colors hover:text-foreground"
      >
        Privacy Policy
      </Link>
      <span aria-hidden="true" className="text-muted-foreground/50">
        ·
      </span>
      <Link
        to={ROUTES.TERMS_OF_USE}
        className="text-muted-foreground transition-colors hover:text-foreground"
      >
        Terms of Use
      </Link>
    </div>
  );
}

export { LegalLinks };
