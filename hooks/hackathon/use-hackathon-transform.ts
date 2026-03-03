'use client';

import * as React from 'react';
import type { Hackathon } from '@/lib/api/hackathons';

// Extended Hackathon type with additional properties that may come from API
interface ExtendedHackathon extends Omit<Hackathon, 'categories'> {
  _organizationName?: string;
  categories?: string[];
  featured?: boolean;
  organizerLogo?: string;
}

interface TransformedHackathon {
  hackathonId: string;
  organizationName: string;
  hackathonSlug: string;
  organizerName: string;
  organizerLogo: string;
  hackathonImage: string;
  hackathonTitle: string;
  tagline: string;
  hackathonDescription: string;
  status: 'Published' | 'Ongoing' | 'Completed' | 'Cancelled';
  deadlineInDays: number;
  // Add only these two date fields
  startDate?: string;
  submissionDeadline?: string;
  categories: string[];
  location?: string;
  venueType?: 'virtual' | 'physical';
  participantType?: 'individual' | 'team' | 'team_or_individual';
  participants?: {
    current: number;
    goal?: number;
  };
  prizePool?: {
    total: number;
    currency: string;
  };
  featured?: boolean;
}

export function useHackathonTransform() {
  const transformHackathonForCard = React.useCallback(
    (hackathon: Hackathon, organizationName?: string): TransformedHackathon => {
      let deadlineInDays: number = 0;

      try {
        if (hackathon.submissionDeadline) {
          const now = new Date();
          const deadline = new Date(hackathon.submissionDeadline);
          deadlineInDays = Math.ceil(
            (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          );
        }
      } catch {
        deadlineInDays = 0;
      }

      // Map hackathon status to card status
      const isLive = (
        ['UPCOMING', 'ACTIVE', 'JUDGING', 'COMPLETED'] as const
      ).includes(
        hackathon.status as 'UPCOMING' | 'ACTIVE' | 'JUDGING' | 'COMPLETED'
      );
      let cardStatus: 'Published' | 'Ongoing' | 'Completed' | 'Cancelled' =
        'Published';
      if (hackathon.status === 'UPCOMING') {
        cardStatus = 'Published';
      } else if (
        hackathon.status === 'ACTIVE' ||
        hackathon.status === 'JUDGING'
      ) {
        cardStatus = 'Ongoing';
      } else if (hackathon.status === 'COMPLETED') {
        cardStatus = 'Completed';
      } else if (
        hackathon.status === 'ARCHIVED' ||
        hackathon.status === 'CANCELLED'
      ) {
        cardStatus = 'Cancelled';
      } else if (isLive) {
        cardStatus = 'Published';
      }

      // Extract location information
      let locationText: string | undefined;
      if (hackathon.venueType === 'VIRTUAL') {
        locationText = 'Virtual';
      } else if (hackathon.venueType === 'PHYSICAL') {
        if (hackathon.city && hackathon.country) {
          locationText = `${hackathon.city}, ${hackathon.country}`;
        } else if (hackathon.country) {
          locationText = hackathon.country;
        } else if (hackathon.state) {
          locationText = hackathon.state;
        } else if (hackathon.venueName) {
          locationText = hackathon.venueName;
        } else if (hackathon.venueAddress) {
          locationText = hackathon.venueAddress;
        }
      }

      // Calculate prize pool total
      let prizePoolTotal = 0;
      let prizeCurrency = 'USDC';
      if (hackathon.prizeTiers && hackathon.prizeTiers.length > 0) {
        prizePoolTotal = hackathon.prizeTiers.reduce(
          (sum, tier) =>
            sum +
            Number(
              tier.prizeAmount ?? (tier as { amount?: string }).amount ?? 0
            ),
          0
        );
        prizeCurrency = hackathon.prizeTiers[0]?.currency || 'USDC';
      }

      // Get organization name
      const extendedHackathon = hackathon as ExtendedHackathon;
      const orgName =
        organizationName ||
        extendedHackathon._organizationName ||
        'organization';

      // Get organizer logo, fallback to default if not available
      const logoUrl = extendedHackathon.organizerLogo || '/avatar.png';

      // Extract categories
      const categories: string[] = [];
      if (hackathon.categories) {
        categories.push(...hackathon.categories);
      }
      if (
        extendedHackathon.categories &&
        Array.isArray(extendedHackathon.categories)
      ) {
        categories.push(...extendedHackathon.categories);
      }
      if (categories.length === 0) {
        categories.push('Other');
      }

      // Extract participantType

      return {
        hackathonId: hackathon.id,
        organizationName: orgName,
        hackathonSlug: hackathon.slug,
        organizerName: orgName,
        tagline: hackathon.tagline,
        organizerLogo: logoUrl,
        hackathonImage:
          hackathon.banner || '/landing/explore/project-placeholder-1.png',
        hackathonTitle: hackathon.name || 'Untitled Hackathon',
        hackathonDescription: hackathon.description || '',
        status: cardStatus,
        deadlineInDays: Math.max(0, deadlineInDays),
        // Add only the two dates needed
        startDate: hackathon.startDate,
        submissionDeadline: hackathon.submissionDeadline,
        categories: categories,
        location: locationText,
        venueType: hackathon.venueType === 'VIRTUAL' ? 'virtual' : 'physical',
        participantType: hackathon.participantType
          ? (hackathon.participantType as
              | 'individual'
              | 'team'
              | 'team_or_individual')
          : undefined,
        participants: {
          current: hackathon._count.participants || 0,
        },
        prizePool:
          prizePoolTotal > 0
            ? {
                total: prizePoolTotal,
                currency: prizeCurrency,
              }
            : undefined,
        featured: extendedHackathon.featured === true,
      };
    },
    []
  );

  return { transformHackathonForCard };
}
