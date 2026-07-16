import { Card } from "@/components/ui/card";

export default function CoursesLoading() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-10 md:px-8 animate-pulse">
      <div className="mb-12">
        <div className="h-9 w-56 bg-muted rounded-lg mb-3" />
        <div className="h-5 w-80 bg-muted rounded-lg" />
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden pt-0 border-0 shadow-lg">
            <div className="h-48 bg-muted" />
            <div className="p-6 space-y-4">
              <div className="h-5 w-3/4 bg-muted rounded" />
              <div className="h-4 w-full bg-muted rounded" />
              <div className="h-4 w-2/3 bg-muted rounded" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
