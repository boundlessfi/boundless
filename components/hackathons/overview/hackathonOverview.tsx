'use client';
import { useState, useEffect } from 'react';
import { useMarkdown } from '@/hooks/use-markdown';
import { HackathonTimeline } from './hackathonTimeline';
import { HackathonPrizes } from './hackathonPrizes';
import { PrizeTier } from '@/lib/api/hackathons';
import type { Venue } from '@/types/hackathon';
import dynamic from 'next/dynamic';
import { geocodeAddress } from '@/lib/country-utils';

const DynamicMap = dynamic(() => import('@/components/ui/MapWidget'), {
  ssr: false,
  loading: () => (
    <div className='flex h-64 w-full animate-pulse items-center justify-center rounded-lg bg-gray-800'>
      <span className='text-gray-500'>Loading map...</span>
    </div>
  ),
});

interface Timeline {
  event: string;
  date: string;
}
interface HackathonOverviewProps {
  content: string;
  timelineEvents?: Timeline[];
  prizes?: PrizeTier[];
  totalPrizePool: string;
  className?: string;
  hackathonSlugOrId?: string;
  organizationId?: string;
  venue?: Venue;
}

export function HackathonOverview({
  content,
  timelineEvents,
  prizes,
  className = '',
  totalPrizePool,
  venue,
}: HackathonOverviewProps) {
  // Use the markdown hook to parse and style the content
  const { styledContent, loading, error } = useMarkdown(content, {
    breaks: true,
    gfm: true,
    pedantic: true,
    loadingDelay: 0,
  });

  const [mapLocation, setMapLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);

  useEffect(() => {
    const geocodeVenueAddress = async () => {
      if (!venue || venue.type !== 'physical' || !venue.venueAddress) {
        setMapLocation(null);
        return;
      }

      setIsGeocoding(true);
      try {
        // Build search query with address, city, state, country
        let searchQuery = venue.venueAddress;
        if (venue.city) {
          searchQuery += `, ${venue.city}`;
        }
        if (venue.state) {
          searchQuery += `, ${venue.state}`;
        }
        if (venue.country) {
          searchQuery += `, ${venue.country}`;
        }

        const result = await geocodeAddress(searchQuery);
        if (result) {
          setMapLocation(result);
        }
      } catch {
        // Map will not be displayed if geocoding fails, but this is not critical
      } finally {
        setIsGeocoding(false);
      }
    };

    geocodeVenueAddress();
  }, [
    venue?.type,
    venue?.venueAddress,
    venue?.city,
    venue?.state,
    venue?.country,
  ]);

  const getVenueAddressString = () => {
    if (!venue) return null;
    const addressParts: string[] = [];
    if (venue.venueName) addressParts.push(venue.venueName);
    if (venue.venueAddress) addressParts.push(venue.venueAddress);
    if (venue.city) addressParts.push(venue.city);
    if (venue.state) addressParts.push(venue.state);
    if (venue.country) addressParts.push(venue.country);
    return addressParts.length > 0 ? addressParts.join(', ') : null;
  };

  return (
    <div className={`w-full pb-8 ${className}`}>
      <article className='max-w-none text-left'>
        {loading && <div className='text-gray-400'>Loading content...</div>}
        {error && (
          <div className='text-red-400'>Error loading content: {error}</div>
        )}
        {!loading && !error && styledContent}
      </article>

      {venue && venue.type === 'physical' && getVenueAddressString() && (
        <div className='mt-8 space-y-4'>
          <div className='space-y-2'>
            <h3 className='text-lg font-semibold text-white'>Venue Location</h3>
            <p className='text-sm text-gray-400'>{getVenueAddressString()}</p>
          </div>
          {venue.venueAddress && mapLocation && !isGeocoding && (
            <div className='space-y-2'>
              <div className='h-64 w-full overflow-hidden rounded-lg border border-gray-800'>
                <DynamicMap
                  lat={mapLocation.lat}
                  lng={mapLocation.lng}
                  address={mapLocation.address}
                  zoom={15}
                />
              </div>
              <p className='text-xs text-gray-500'>{mapLocation.address}</p>
            </div>
          )}
          {isGeocoding && (
            <div className='flex h-64 w-full items-center justify-center rounded-lg bg-gray-800'>
              <span className='text-gray-500'>Loading map...</span>
            </div>
          )}
        </div>
      )}

      {timelineEvents && <HackathonTimeline events={timelineEvents} />}
      {prizes && (
        <HackathonPrizes totalPrizePool={totalPrizePool} prizes={prizes} />
      )}
    </div>
  );
}
