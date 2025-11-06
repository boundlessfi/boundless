import { FormLabel } from '@/components/ui/form';
import dynamic from 'next/dynamic';

const DynamicMap = dynamic(() => import('@/components/ui/MapWidget'), {
  ssr: false,
  loading: () => (
    <div className='flex h-64 w-full animate-pulse items-center justify-center rounded-lg bg-gray-800'>
      <span className='text-gray-500'>Loading map...</span>
    </div>
  ),
});

interface MapPreviewProps {
  mapLocation: { lat: number; lng: number; address: string } | null;
  hasAddress: boolean;
  city: string;
  state: string;
}

export default function MapPreview({
  mapLocation,
  hasAddress,
  city,
  state,
}: MapPreviewProps) {
  if (!mapLocation) return null;

  const getZoomLevel = () => {
    if (hasAddress) return 15;
    if (city) return 12;
    if (state) return 8;
    return 4;
  };

  return (
    <div className='mt-4'>
      <FormLabel className='mb-2 block text-sm text-gray-500'>
        {hasAddress ? 'Location Preview' : 'Selected Area Preview'}
      </FormLabel>
      <div className='h-64 w-full overflow-hidden rounded-[12px] border border-gray-900'>
        <DynamicMap
          lat={mapLocation.lat}
          lng={mapLocation.lng}
          address={mapLocation.address}
          zoom={getZoomLevel()}
        />
      </div>
      <p className='mt-2 text-xs text-gray-500'>
        {mapLocation.address}
        {!hasAddress && (
          <span className='mt-1 block text-blue-400'>
            💡 Enter a specific address for more precise location
          </span>
        )}
      </p>
    </div>
  );
}
