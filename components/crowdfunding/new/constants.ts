import {
  Info,
  BookOpen,
  Target,
  ListChecks,
  Users,
  Link2,
  Eye,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface WizardStep {
  key: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export const WIZARD_STEPS: WizardStep[] = [
  {
    key: 'basics',
    title: 'Basics',
    description: 'Name, logo, banner',
    icon: Info,
  },
  {
    key: 'story',
    title: 'Story',
    description: 'Vision and description',
    icon: BookOpen,
  },
  {
    key: 'funding',
    title: 'Funding',
    description: 'Goal and fees',
    icon: Target,
  },
  {
    key: 'milestones',
    title: 'Milestones',
    description: 'Delivery checkpoints',
    icon: ListChecks,
  },
  {
    key: 'team',
    title: 'Team',
    description: 'Contact, team optional',
    icon: Users,
  },
  {
    key: 'links',
    title: 'Links',
    description: 'Repo, website, socials',
    icon: Link2,
  },
  {
    key: 'review',
    title: 'Review',
    description: 'Submit for review',
    icon: Eye,
  },
];

export const TOTAL_STEPS = WIZARD_STEPS.length;
