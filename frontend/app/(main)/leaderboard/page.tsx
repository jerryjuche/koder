import { Metadata } from 'next';
import LeaderboardClient from './LeaderboardClient';

export const metadata: Metadata = {
  title: 'Leaderboard - Koder',
  description: 'Top-ranked students by XP and problem-solving performance',
};

export default function LeaderboardPage() {
  return <LeaderboardClient />;
}
