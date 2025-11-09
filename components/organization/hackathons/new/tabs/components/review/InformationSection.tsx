import React, { useState, useEffect } from 'react';
import { InfoFormData } from '../../schemas/infoSchema';
import Image from 'next/image';
import InfoItem from './InfoItem';
import { Separator } from '@/components/ui/separator';
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

interface InformationSectionProps {
  data: InfoFormData;
  onEdit?: () => void;
}

export default function InformationSection({
  data,
  onEdit,
}: InformationSectionProps) {
  const [mapLocation, setMapLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);

  useEffect(() => {
    const geocodeVenueAddress = async () => {
      if (data.venueType !== 'physical' || !data.venueAddress) {
        setMapLocation(null);
        return;
      }

      setIsGeocoding(true);
      try {
        // Build search query with address, city, state, country
        let searchQuery = data.venueAddress;
        if (data.city) {
          searchQuery += `, ${data.city}`;
        }
        if (data.state) {
          searchQuery += `, ${data.state}`;
        }
        if (data.country) {
          searchQuery += `, ${data.country}`;
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
  }, [data.venueType, data.venueAddress, data.city, data.state, data.country]);
  return (
    <div className='space-y-4'>
      {data.banner && (
        <div className='relative h-48 w-full overflow-hidden rounded-lg border border-gray-800'>
          <Image
            src={data.banner}
            alt='Hackathon banner'
            fill
            className='object-cover'
          />
        </div>
      )}
      <div className='grid grid-cols-1 gap-4'>
        <InfoItem label='Title' value={data.name} />
        <Separator className='bg-gray-900' />
        <InfoItem label='Category' value={data.category} />
        <Separator className='bg-gray-900' />
        <InfoItem label='Venue Type' value={data.venueType} />
        <Separator className='bg-gray-900' />
        {data.venueType === 'physical' && (
          <>
            <InfoItem
              label='Venue'
              value={(() => {
                const addressParts: string[] = [];
                if (data.venueName) addressParts.push(data.venueName);
                if (data.venueAddress) addressParts.push(data.venueAddress);
                if (data.city) addressParts.push(data.city);
                if (data.state) addressParts.push(data.state);
                if (data.country) addressParts.push(data.country);
                return addressParts.length > 0 ? addressParts.join(', ') : null;
              })()}
            />
            {data.venueAddress && mapLocation && !isGeocoding && (
              <>
                <Separator className='bg-gray-900' />
                <div className='space-y-2'>
                  <p className='text-xs font-medium tracking-wide text-gray-500 uppercase'>
                    Location Map
                  </p>
                  <div className='h-64 w-full overflow-hidden rounded-[12px] border border-gray-900'>
                    <DynamicMap
                      lat={mapLocation.lat}
                      lng={mapLocation.lng}
                      address={mapLocation.address}
                      zoom={15}
                    />
                  </div>
                  <p className='text-xs text-gray-500'>{mapLocation.address}</p>
                </div>
              </>
            )}
            {isGeocoding && (
              <>
                <Separator className='bg-gray-900' />
                <div className='flex h-64 w-full items-center justify-center rounded-lg bg-gray-800'>
                  <span className='text-gray-500'>Loading map...</span>
                </div>
              </>
            )}
          </>
        )}
      </div>
      {data.description && (
        <div className='space-y-1'>
          <p className='text-xs font-medium tracking-wide text-gray-500 uppercase'>
            Description
          </p>
          <div
            className='prose prose-invert max-w-none text-sm text-gray-300'
            dangerouslySetInnerHTML={{ __html: data.description }}
          />
        </div>
      )}
      {onEdit && (
        <button
          onClick={onEdit}
          className='text-primary mt-2 text-sm hover:underline'
        >
          Edit Information
        </button>
      )}
    </div>
  );
}
