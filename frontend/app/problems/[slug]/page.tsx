import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import DynamicWorkspace from './DynamicWorkspace';

const DIFFICULTY_LABELS: Record<number, string> = {
  1: 'Beginner',
  2: 'Easy',
  3: 'Medium',
  4: 'Hard',
  5: 'Expert',
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  try {
    const res = await fetch(`${apiBase}/problems/${slug}/meta`, { next: { revalidate: 3600 } });
    if (!res.ok) return {};
    const body = await res.json();
    const problem = body.data;
    if (!problem) return {};

    const difficulty = DIFFICULTY_LABELS[problem.difficulty] || `Level ${problem.difficulty}`;
    const moduleImage = `/modules/${problem.module}.webp`;

    return {
      title: `${problem.title} — Koder`,
      description: `Solve "${problem.title}" on Koder. Difficulty: ${difficulty}. Language: ${problem.language || 'Go/Python'}.`,
      openGraph: {
        title: `${problem.title} — Koder`,
        description: `Solve "${problem.title}" on Koder. Difficulty: ${difficulty}.`,
        images: [{ url: moduleImage, width: 1200, height: 630 }],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${problem.title} — Koder`,
        description: `Solve "${problem.title}" on Koder. Difficulty: ${difficulty}.`,
        images: [moduleImage],
      },
    };
  } catch {
    return {};
  }
}

export default async function ProblemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <Suspense fallback={null}>
      <DynamicWorkspace slug={slug} />
    </Suspense>
  );
}
