export function BestPracticesSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-[380px] animate-pulse rounded-xl border border-border bg-brand-charcoal-card"
          />
        ))}
      </div>
      <div className="space-y-2">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-12 w-full animate-pulse rounded-lg border border-border bg-brand-charcoal-card"
          />
        ))}
      </div>
    </div>
  );
}
