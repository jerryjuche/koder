'use client';

import dynamic from 'next/dynamic';

const ProblemWorkspaceClient = dynamic(() => import('./ProblemWorkspaceClient'), {
  ssr: false,
  loading: () => <LoadingSkeleton />,
});

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-brand-charcoal-base flex flex-col">
      <div className="h-14 border-b border-brand-charcoal-border bg-brand-charcoal-card flex items-center px-4 gap-3">
        <div className="w-6 h-6 rounded bg-brand-charcoal-hover animate-pulse" />
        <div className="w-48 h-4 rounded bg-brand-charcoal-hover animate-pulse" />
        <div className="w-20 h-6 rounded-full bg-brand-charcoal-hover animate-pulse ml-auto" />
        <div className="w-24 h-9 rounded-lg bg-brand-charcoal-hover animate-pulse" />
      </div>
      <div className="flex-1 flex">
        <div className="w-1/2 p-6 space-y-4">
          <div className="w-3/4 h-6 rounded bg-brand-charcoal-hover animate-pulse" />
          <div className="w-full h-4 rounded bg-brand-charcoal-hover animate-pulse" />
          <div className="w-full h-4 rounded bg-brand-charcoal-hover animate-pulse" />
          <div className="w-2/3 h-4 rounded bg-brand-charcoal-hover animate-pulse" />
          <div className="w-full h-3 rounded bg-brand-charcoal-hover animate-pulse mt-8" />
          <div className="w-full h-3 rounded bg-brand-charcoal-hover animate-pulse" />
          <div className="w-5/6 h-3 rounded bg-brand-charcoal-hover animate-pulse" />
        </div>
        <div className="w-0.5 bg-brand-charcoal-border" />
        <div className="w-1/2 p-4">
          <div className="w-full h-full rounded-xl bg-brand-charcoal-hover animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function DynamicWorkspace({ slug }: { slug: string }) {
  return <ProblemWorkspaceClient slug={slug} />;
}
