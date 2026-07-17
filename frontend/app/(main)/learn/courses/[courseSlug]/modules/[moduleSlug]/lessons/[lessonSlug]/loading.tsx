export default function LessonLoading() {
  return (
    <div className="max-w-screen-2xl mx-auto p-8 animate-pulse">
      <div className="flex gap-8">
        <div className="w-72 shrink-0 space-y-4">
          <div className="h-5 w-24 bg-muted rounded-lg" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
        <div className="flex-1 space-y-6">
          <div className="h-5 w-48 bg-muted rounded-lg" />
          <div className="h-8 w-96 bg-muted rounded-lg" />
          <div className="h-4 w-64 bg-muted rounded-lg" />
          <div className="h-64 bg-muted rounded-xl" />
        </div>
      </div>
    </div>
  );
}
