"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0A0A0F] text-foreground antialiased">
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="p-8 max-w-md w-full text-center space-y-4">
            <h1 className="text-6xl font-bold text-destructive/50">500</h1>
            <h2 className="text-xl font-bold text-foreground">
              Critical Error
            </h2>
            <p className="text-muted-foreground text-sm">
              A critical error occurred. Please refresh the page or try again later.
            </p>
            <button
              onClick={() => reset()}
              className="inline-flex items-center justify-center rounded-lg bg-foreground px-5 py-2 text-sm font-semibold text-background hover:bg-foreground/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
