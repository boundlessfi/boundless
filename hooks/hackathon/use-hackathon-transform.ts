'use client';

import * as React from 'react';
import type { Hackathon } from '@/lib/api/hackathons';

// Extended Hackathon type with additional properties that may come from API
interface ExtendedHackathon extends Hackathon {
  _organizationName?: string;
  categories?: string[];
  participants?: number;
  featured?: boolean;
}

interface TransformedHackathon {
  hackathonId: string;
  organizationName: string;
  hackathonSlug: string;
  organizerName: string;
  organizerLogo: string;
  hackathonImage: string;
  hackathonTitle: string;
  hackathonDescription: string;
  status: 'Published' | 'Ongoing' | 'Completed' | 'Cancelled';
  deadlineInDays: number;
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
          // For physical venues, prioritize city + country, then country, then state, then venue name
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
          // If still no location, we'll rely on venueType in the card component
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

      // Generate slug from title (simple version)
      // const title =
      //   hackathon.information?.title || hackathon.title || 'untitled';
      // const slug = title
      //   .toLowerCase()
      //   .replace(/[^a-z0-9]+/g, '-')
      //   .replace(/(^-|-$)/g, '');

      // Get organization name - check if it's in the hackathon object or use provided
      const extendedHackathon = hackathon as ExtendedHackathon;
      const orgName =
        organizationName ||
        extendedHackathon._organizationName ||
        'organization';

      // Extract categories
      const categories: string[] = [];
      if (hackathon.information?.categories) {
        // If categories is an array, use it
        if (Array.isArray(hackathon.information.categories)) {
          categories.push(...hackathon.information.categories);
        }
      }
      // Add additional categories if they exist in the hackathon object
      if (
        extendedHackathon.categories &&
        Array.isArray(extendedHackathon.categories)
      ) {
        categories.push(...extendedHackathon.categories);
      }
      // Ensure at least one category
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
        organizerLogo: '/avatar.png', // This should come from organization data
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
          current: extendedHackathon.participants || 0, // Use participants from public API if available
          // goal could be calculated from participation settings
        },
        prizePool:
          prizePoolTotal > 0
            ? {
                total: prizePoolTotal,
                currency: prizeCurrency,
              }
            : undefined,
        featured: extendedHackathon.featured === true, // Check for featured flag
      };
    },
    []
  );

  return { transformHackathonForCard };
}
