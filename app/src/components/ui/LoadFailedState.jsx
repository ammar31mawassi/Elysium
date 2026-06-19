import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoadFailedState({
  title = "Loading failed",
  message = "Something went wrong while loading this page.",
  onRetry,
}) {
  return (
    <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-destructive/10 text-destructive">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <h2 className="mt-4 text-base font-bold text-foreground">{title}</h2>
      <p className="mx-auto mt-1 max-w-md text-sm leading-relaxed text-muted-foreground">{message}</p>
      {onRetry && (
        <Button className="mt-5 gap-2" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      )}
    </div>
  );
}
