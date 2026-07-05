import React, { Suspense } from 'react';
import DynamicWorkspace from './DynamicWorkspace';

export default async function ProblemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <Suspense fallback={null}>
      <DynamicWorkspace slug={slug} />
    </Suspense>
  );
}
