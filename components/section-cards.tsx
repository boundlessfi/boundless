import { Package2, Users, Star, Trophy, LucideIcon } from 'lucide-react';

interface StatsData {
  projectsCreated?: number;
  followers?: number;
  reputation?: number;
  communityScore?: number;
}

interface CardConfig {
  title: string;
  value?: number;
  icon?: LucideIcon;
  accent: string;
}

interface SectionCardsProps {
  stats?: StatsData;
}

function formatNumber(num?: number): string {
  if (num === undefined || num === null) return '0';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
}

export function SectionCards({ stats }: SectionCardsProps) {
  const cards: CardConfig[] = [
    {
      title: 'Projects',
      value: stats?.projectsCreated,
      icon: Package2,
      accent: 'text-emerald-400',
    },
    {
      title: 'Followers',
      value: stats?.followers,
      icon: Users,
      accent: 'text-blue-400',
    },
    {
      title: 'Reputation',
      value: stats?.reputation,
      icon: Star,
      accent: 'text-amber-400',
    },
    {
      title: 'Score',
      value: stats?.communityScore,
      icon: Trophy,
      accent: 'text-purple-400',
    },
  ];

  return (
    <div className='grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4'>
      {cards.map(card => {
        const Icon = card.icon!;
        return (
          <div
            key={card.title}
            className='group relative overflow-hidden rounded-xl border border-white/6 bg-white/2 p-4 transition-colors hover:border-white/10 hover:bg-white/4'
          >
            <div className='flex items-center justify-between'>
              <span className='text-xs font-medium tracking-wide text-white/40 uppercase'>
                {card.title}
              </span>
              <Icon className={`h-4 w-4 ${card.accent} opacity-60`} />
            </div>
            <p className='mt-2 text-2xl font-semibold text-white tabular-nums sm:text-3xl'>
              {formatNumber(card.value)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
