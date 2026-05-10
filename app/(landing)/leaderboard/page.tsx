import type { Metadata } from 'next';
import { LeaderboardPageClient } from './LeaderboardPageClient';

export const metadata: Metadata = {
  title: 'Leaderboard | Boundless',
  description:
    'Top community contributors ranked by reputation score. Voting weight is determined by tier.',
};

export default function LeaderboardPage() {
  return (
    <div className='relative mx-auto min-h-screen max-w-[1440px] px-5 py-12 md:px-[50px] lg:px-[100px]'>
      <LeaderboardPageClient />
    </div>
  );
}
