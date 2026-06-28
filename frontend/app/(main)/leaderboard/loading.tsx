import { cn } from "@/lib/utils";

export default function LeaderboardLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-pulse pt-4 pb-12 px-4">
      <div className="h-10 w-48 bg-card rounded-xl mx-auto" />
      <div className="h-4 w-64 bg-card rounded-xl mx-auto" />
      <div className="flex justify-center gap-5 items-end mt-12">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "bg-card rounded-2xl border border-border",
              i === 2 ? "w-72 h-52" : "w-60 h-40"
            )}
          />
        ))}
      </div>
      <div className="h-16 bg-card rounded-2xl border border-border" />
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="h-9 w-64 bg-muted rounded-lg" />
        </div>
        <div className="divide-y divide-border/40">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4">
              <div className="w-8 h-8 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-muted rounded" />
                <div className="h-3 w-20 bg-muted rounded" />
              </div>
              <div className="h-4 w-16 bg-muted rounded" />
              <div className="h-4 w-12 bg-muted rounded" />
              <div className="h-4 w-14 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
