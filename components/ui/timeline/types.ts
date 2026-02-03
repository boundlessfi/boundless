import React from 'react';

export interface TimelineItem {
  id: string;
  title: string;
  description: string;
  date?: string;
  dueDate?: string;
  amount?: number;
  percentage?: number;
  status?:
    | 'awaiting'
    | 'pending'
    | 'approved'
    | 'in-progress'
    | 'rejected'
    | 'submission'
    | 'in-review'
    | 'draft';
  icon?: React.ReactNode;
  headerText?: string;
  deadline?: string;
  feedbackDays?: number;
  isUnlocked?: boolean;
  campaignId?: string;
}

export interface TimelineProps {
  items: TimelineItem[];
  className?: string;
  showConnector?: boolean;
  orientation?: 'vertical' | 'horizontal';
  variant?: 'default' | 'compact' | 'detailed';
  projectSlug?: string;
}

export interface TimelineItemProps {
  item: TimelineItem;
  isLast: boolean;
  showConnector: boolean;
  projectSlug?: string;
}
