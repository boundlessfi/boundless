'use client';

import * as React from 'react';
import type { CrowdfundingProject } from '@/lib/api/types';

interface TransformedProject {
  projectId: string;
  creatorName: string;
  creatorLogo: string;
  projectImage: string;
  projectTitle: string;
  projectDescription: string;
  status: 'Validation' | 'Funding' | 'Funded' | 'Completed';
  deadlineInDays: number;
  funding: {
    current: number;
    goal: number;
    currency: string;
  };
  votes?: {
    current: number;
    goal: number;
  };
}

export function useProjectTransform() {
  const transformProjectForCard = React.useCallback(
    (project: CrowdfundingProject): TransformedProject => {
      let deadlineInDays: number | null = null;

      try {
        if (project.status === 'idea') {
          const now = new Date();
          const end = new Date(project.voting.endDate);
          deadlineInDays = Math.ceil(
            (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          );
        } else if (
          project.status === 'active' ||
          project.status === 'completed'
        ) {
          const now = new Date();
          const end = new Date(project.funding.endDate);
          deadlineInDays = Math.ceil(
            (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          );
        }
      } catch {
        // Handle error silently
        deadlineInDays = null;
      }

      // Map project status to card status
      let cardStatus: 'Validation' | 'Funding' | 'Funded' | 'Completed' =
        'Funding';
      if (project.status === 'draft' || project.status === 'idea') {
        cardStatus = 'Validation';
      } else if (project.status === 'active') {
        cardStatus = 'Funding';
      } else if (project.status === 'completed') {
        cardStatus = 'Completed';
      }

      return {
        projectId: project._id,
        creatorName:
          `${project.creator?.profile?.firstName ?? ''} ${project.creator?.profile?.lastName ?? ''}`.trim(),
        creatorLogo: '/avatar.png',
        projectImage:
          project.media?.logo ||
          project.media?.logo ||
          '/landing/explore/project-placeholder-1.png',
        projectTitle: project.title,
        projectDescription: project.vision || project.description,
        status: cardStatus,
        deadlineInDays: deadlineInDays || 0,
        funding: {
          current: project.funding?.raised || 0,
          goal: project.funding?.goal || 0,
          currency: project.funding?.currency || 'USDC',
        },
        votes:
          project.status === 'idea'
            ? {
                current: project.votes || 0,
                goal: project.voting?.totalVotes || 100,
              }
            : undefined,
      };
    },
    []
  );

  return { transformProjectForCard };
}
