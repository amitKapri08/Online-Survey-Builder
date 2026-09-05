import { Button } from "@/components/ui/button";

interface SocialAuthButtonsProps {
  disabled?: boolean;
}

export function SocialAuthButtons({
  disabled = false,
}: SocialAuthButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Button
        type="button"
        variant="outline"
        size="xl"
        className="w-full"
        disabled={disabled}
      >
        <GoogleIcon data-icon="inline-start" />
        Google
      </Button>

      <Button
        type="button"
        variant="outline"
        size="xl"
        className="w-full"
        disabled={disabled}
      >
        <GitHubIcon data-icon="inline-start" />
        GitHub
      </Button>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M21.35 12.23c0-.79-.07-1.55-.2-2.28H12v4.31h5.24a4.48 4.48 0 0 1-1.95 2.94v2.45h3.16c1.85-1.7 2.9-4.2 2.9-7.42Z"
      />
      <path
        fill="#34A853"
        d="M12 21.5c2.64 0 4.86-.87 6.48-2.35l-3.16-2.45c-.87.58-1.98.92-3.32.92-2.55 0-4.71-1.72-5.48-4.03H3.25v2.53A9.8 9.8 0 0 0 12 21.5Z"
      />
      <path
        fill="#FBBC05"
        d="M6.52 13.59a5.9 5.9 0 0 1 0-3.18V7.88H3.25a9.5 9.5 0 0 0 0 8.24l3.27-2.53Z"
      />
      <path
        fill="#EA4335"
        d="M12 6.38c1.44 0 2.73.5 3.75 1.48l2.81-2.81C16.85 3.5 14.63 2.5 12 2.5a9.8 9.8 0 0 0-8.75 5.38l3.27 2.53C7.29 8.1 9.45 6.38 12 6.38Z"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.05-.02-2.06-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.77.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.11-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6.01 0c2.29-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.62-5.48 5.92.43.37.81 1.1.81 2.22 0 1.6-.02 2.89-.02 3.28 0 .32.21.7.83.58C20.57 22.29 24 17.79 24 12.5 24 5.87 18.63.5 12 .5Z" />
    </svg>
  );
}
