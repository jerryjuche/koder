export default function CourseDetailLoading() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10 md:px-8 animate-pulse">
      <div className="h-5 w-28 bg-muted rounded-lg mb-8" />
      <div className="h-48 bg-muted rounded-2xl mb-10" />
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 bg-muted rounded-xl" />
        ))}
      </div>
    </div>
  );
}
