'use client';

import dynamic from 'next/dynamic';

const ProblemWorkspaceClient = dynamic(() => import('./ProblemWorkspaceClient'), {
  ssr: false,
  loading: () => <LoadingSkeleton />,
});

function LoadingSkeleton() {
  return (
    <div className="h-screen bg-brand-charcoal-base flex flex-col">
      <div className="flex-1 flex">
        <div className="w-1/3 min-w-[350px] p-6 space-y-4 border-r border-brand-charcoal-border">
          <div className="w-3/4 h-6 rounded bg-brand-charcoal-hover animate-pulse" />
          <div className="w-full h-4 rounded bg-brand-charcoal-hover animate-pulse" />
          <div className="w-full h-4 rounded bg-brand-charcoal-hover animate-pulse" />
          <div className="w-2/3 h-4 rounded bg-brand-charcoal-hover animate-pulse" />
          <div className="w-full h-3 rounded bg-brand-charcoal-hover animate-pulse mt-8" />
          <div className="w-full h-3 rounded bg-brand-charcoal-hover animate-pulse" />
          <div className="w-5/6 h-3 rounded bg-brand-charcoal-hover animate-pulse" />
        </div>
        <div className="flex-1 flex flex-col bg-[#0F1115]">
          <div className="h-10 border-b border-brand-charcoal-border" />
          <div className="flex-1 p-4">
            <div className="w-full h-full rounded-xl bg-brand-charcoal-hover/50 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DynamicWorkspace({ slug }: { slug: string }) {
  return <ProblemWorkspaceClient slug={slug} />;
}
