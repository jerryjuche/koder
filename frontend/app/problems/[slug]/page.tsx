import React from 'react';
import ProblemWorkspaceClient from './ProblemWorkspaceClient';

export default async function ProblemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProblemWorkspaceClient slug={slug} />;
}
