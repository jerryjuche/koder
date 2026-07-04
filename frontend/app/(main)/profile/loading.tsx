export default function ProfileLoading() {
  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
        {/* Header skeleton */}
        <div className="bg-card rounded-2xl border border-border p-8">
          <div className="flex gap-6 items-start">
            <div className="w-24 h-24 rounded-full bg-muted shrink-0" />
            <div className="flex-1 space-y-4">
              <div className="h-8 w-48 bg-muted rounded-lg" />
              <div className="h-4 w-32 bg-muted rounded-md" />
              <div className="h-4 w-64 bg-muted rounded-md" />
              <div className="flex gap-3 mt-2">
                <div className="h-9 w-28 bg-muted rounded-lg" />
                <div className="h-9 w-24 bg-muted rounded-lg" />
              </div>
            </div>
            <div className="h-20 w-[130px] bg-muted rounded-xl shrink-0" />
          </div>
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-card rounded-xl border border-border" />
          ))}
        </div>

        {/* Graph skeleton */}
        <div className="h-48 bg-card rounded-xl border border-border" />

        {/* Two column skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-card rounded-xl border border-border" />
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="h-5 w-48 bg-muted rounded-md mb-6" />
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-square bg-muted rounded-xl" />
                ))}
              </div>
            </div>
          </div>
          <div className="h-80 bg-card rounded-xl border border-border" />
        </div>
      </div>
    </div>
  );
}
