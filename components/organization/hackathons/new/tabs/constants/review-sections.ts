import {
  FileText,
  Calendar,
  Users,
  Trophy,
  Scale,
  Handshake,
} from 'lucide-react';

export const REVIEW_SECTION_CONFIG = [
  {
    id: 'information',
    title: 'Information',
    icon: FileText,
    key: 'information' as const,
  },
  {
    id: 'timeline',
    title: 'Timeline',
    icon: Calendar,
    key: 'timeline' as const,
  },
  {
    id: 'participation',
    title: 'Participation',
    icon: Users,
    key: 'participation' as const,
  },
  {
    id: 'rewards',
    title: 'Rewards',
    icon: Trophy,
    key: 'rewards' as const,
  },
  {
    id: 'judging',
    title: 'Judging Criteria',
    icon: Scale,
    key: 'judging' as const,
  },
  {
    id: 'collaboration',
    title: 'Collaboration',
    icon: Handshake,
    key: 'collaboration' as const,
  },
] as const;
