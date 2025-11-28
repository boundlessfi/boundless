'use client';

import * as React from 'react';
import type { Hackathon } from '@/lib/api/hackathons';

// Extended Hackathon type with additional properties that may come from API
interface ExtendedHackathon extends Hackathon {
  _organizationName?: string;
  categories?: string[];
  participants?: number;
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
        if (hackathon.timeline?.submissionDeadline) {
          const now = new Date();
          const deadline = new Date(hackathon.timeline.submissionDeadline);
          deadlineInDays = Math.ceil(
            (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          );
        } else if (hackathon.timeline?.winnerAnnouncementDate) {
          const now = new Date();
          const end = new Date(hackathon.timeline.winnerAnnouncementDate);
          deadlineInDays = Math.ceil(
            (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          );
        }
      } catch {
        deadlineInDays = 0;
      }

      // Map hackathon status to card status
      let cardStatus: 'Published' | 'Ongoing' | 'Completed' | 'Cancelled' =
        'Published';
      if (hackathon.status === 'published') {
        cardStatus = 'Published';
      } else if (hackathon.status === 'ongoing') {
        cardStatus = 'Ongoing';
      } else if (hackathon.status === 'completed') {
        cardStatus = 'Completed';
      } else if (hackathon.status === 'cancelled') {
        cardStatus = 'Cancelled';
      }

      // Extract location information
      const venue = hackathon.information?.venue;
      let locationText: string | undefined;
      if (venue) {
        if (venue.type === 'physical') {
          if (venue.city && venue.country) {
            locationText = `${venue.city}, ${venue.country}`;
          } else if (venue.country) {
            locationText = venue.country;
          } else if (venue.state) {
            locationText = venue.state;
          } else if (venue.venueName) {
            locationText = venue.venueName;
          } else if (venue.venueAddress) {
            locationText = venue.venueAddress;
          }
        } else if (venue.type === 'virtual') {
          locationText = 'Virtual';
        }
      }

      // Calculate prize pool total
      let prizePoolTotal = 0;
      let prizeCurrency = 'USDC';
      if (
        hackathon.rewards?.prizeTiers &&
        hackathon.rewards.prizeTiers.length > 0
      ) {
        prizePoolTotal = hackathon.rewards.prizeTiers.reduce(
          (sum, tier) => sum + (tier.amount || 0),
          0
        );
        prizeCurrency = hackathon.rewards.prizeTiers[0]?.currency || 'USDC';
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
      if (hackathon.information?.categories) {
        if (Array.isArray(hackathon.information.categories)) {
          categories.push(...hackathon.information.categories);
        }
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
      const participantType = hackathon.participation?.participantType;

      return {
        hackathonId: hackathon._id,
        organizationName: orgName,
        hackathonSlug: hackathon.information.slug,
        organizerName: orgName,
        tagline: hackathon.information.tagline,
        organizerLogo: logoUrl,
        hackathonImage:
          hackathon.information?.banner ||
          '/landing/explore/project-placeholder-1.png',
        hackathonTitle:
          hackathon.information?.title ||
          hackathon.title ||
          'Untitled Hackathon',
        hackathonDescription: hackathon.information?.description || '',
        status: cardStatus,
        deadlineInDays: Math.max(0, deadlineInDays),
        // Add only the two dates needed
        startDate: hackathon.timeline?.startDate,
        submissionDeadline: hackathon.timeline?.submissionDeadline,
        categories: categories,
        location: locationText,
        venueType: venue?.type
          ? venue.type === 'virtual'
            ? 'virtual'
            : 'physical'
          : undefined,
        participantType: participantType
          ? (participantType as 'individual' | 'team' | 'team_or_individual')
          : undefined,
        participants: {
          current: extendedHackathon.participants || 0,
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
