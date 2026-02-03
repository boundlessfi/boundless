import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
  description?: string;
}

interface SectionCardsProps {
  stats?: StatsData;
  cards?: CardConfig[];
}

function formatNumber(num?: number): string {
  if (num === undefined || num === null) return '0';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
}

export function SectionCards({ stats, cards }: SectionCardsProps = {}) {
  if (cards && cards.length > 0) {
    return (
      <div className='grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4'>
        {cards.map((card, index) => (
          <DashCard
            key={index}
            value={card.value}
            title={card.title}
            icon={card.icon}
            description={card.description}
          />
        ))}
      </div>
    );
  }

  const defaultCards: CardConfig[] = [
    {
      title: 'Projects Created',
      value: stats?.projectsCreated,
      icon: Package2,
    },
    {
      title: 'Followers',
      value: stats?.followers,
      icon: Users,
    },
    {
      title: 'Reputation',
      value: stats?.reputation,
      icon: Star,
    },
    {
      title: 'Community Score',
      value: stats?.communityScore,
      icon: Trophy,
    },
  ];

  return (
    <div className='grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4'>
      {defaultCards.map((card, index) => (
        <DashCard
          key={index}
          value={card.value}
          title={card.title}
          icon={card.icon}
        />
      ))}
    </div>
  );
}

interface DashCardProps {
  value?: number;
  title: string;
  icon?: LucideIcon;
  description?: string;
}

function DashCard({
  value,
  title,
  icon: Icon = Package2,
  description,
}: DashCardProps) {
  return (
    <Card className='bg-background border-border/10 hover:border-primary/30 shadow-primary/10 hover:shadow-primary/10 @container/card border transition-all duration-300 hover:shadow-lg'>
      <CardHeader>
        <CardDescription className='flex items-center justify-between text-white/80'>
          {description || title}
          {Icon && <Icon size={20} />}
        </CardDescription>
        <CardTitle className='text-2xl font-semibold text-white tabular-nums @[250px]/card:text-3xl'>
          {formatNumber(value)}
        </CardTitle>
      </CardHeader>
    </Card>
  );
}
