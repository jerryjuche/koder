"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ProblemError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0A0A0F]">
      <Card className="p-8 max-w-md w-full text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
          <AlertTriangle size={32} className="text-destructive" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          Failed to Load Problem
        </h2>
        <p className="text-muted-foreground text-sm">
          Unable to load the problem workspace. The problem may not exist or an error occurred.
        </p>
        <Button onClick={reset} className="mt-2">
          Try Again
        </Button>
      </Card>
    </div>
  );
}
