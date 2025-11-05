import { Loader2 } from "lucide-react";

export function AuthLoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
      <p className="text-sm text-muted-foreground">Authenticating...</p>
    </div>
  );
}
