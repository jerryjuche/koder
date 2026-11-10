export default function LeaderboardLoading() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse px-4 pb-10 pt-3 sm:px-6 lg:px-8">
      <div className="flex items-end justify-between gap-3 pb-1">
        <div className="space-y-2">
          <div className="h-3 w-12 rounded bg-card" />
          <div className="h-7 w-40 rounded-lg bg-card" />
        </div>
        <div className="h-8 w-24 rounded-xl bg-card" />
      </div>
      <div className="grid grid-cols-3 items-end gap-2 pt-5 sm:gap-3">
        <div className="h-36 rounded-2xl bg-card" />
        <div className="h-44 rounded-2xl bg-card" />
        <div className="h-36 rounded-2xl bg-card" />
      </div>
      <div className="mt-5 h-16 rounded-2xl bg-card" />
      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex flex-col gap-2.5 border-b border-border p-3">
          <div className="h-10 rounded-xl bg-muted" />
          <div className="h-10 rounded-lg bg-muted" />
        </div>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 border-t border-border/50 px-4 py-3">
            <div className="h-4 w-4 rounded bg-muted" />
            <div className="size-10 shrink-0 rounded-full bg-muted" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-28 rounded bg-muted" />
              <div className="h-3 w-20 rounded bg-muted" />
            </div>
            <div className="h-4 w-14 rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
