export default function ModuleDetailLoading() {
  return (
    <div className="max-w-screen-2xl mx-auto px-6 py-10 md:px-8 animate-pulse">
      <div className="h-5 w-28 bg-muted rounded-lg mb-8" />
      <div className="h-32 bg-muted rounded-2xl mb-6" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-muted rounded-xl" />
        ))}
      </div>
    </div>
  );
}
