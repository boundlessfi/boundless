import { FormLabel } from '@/components/ui/form';
import dynamic from 'next/dynamic';
import { MapPin, Loader2, Info } from 'lucide-react';

const DynamicMap = dynamic(() => import('@/components/ui/MapWidget'), {
  ssr: false,
  loading: () => (
    <div className='flex h-64 w-full items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/30'>
      <div className='flex flex-col items-center gap-3'>
        <Loader2 className='h-8 w-8 animate-spin text-zinc-500' />
        <span className='text-sm text-zinc-500'>Loading map...</span>
      </div>
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
    <div className='space-y-3'>
      <div className='flex items-center gap-2'>
        <div className='flex h-6 w-6 items-center justify-center rounded-md bg-zinc-800'>
          <MapPin className='h-4 w-4 text-zinc-400' />
        </div>
        <FormLabel className='text-sm font-medium text-white'>
          {hasAddress ? 'Location Preview' : 'Area Preview'}
        </FormLabel>
      </div>

      <div className='overflow-hidden rounded-xl border border-zinc-800 shadow-lg'>
        <div className='h-64 w-full'>
          <DynamicMap
            lat={mapLocation.lat}
            lng={mapLocation.lng}
            address={mapLocation.address}
            zoom={getZoomLevel()}
          />
        </div>
      </div>

      <div className='space-y-2'>
        <div className='flex items-start gap-2 text-sm text-zinc-400'>
          <MapPin className='h-4 w-4 flex-shrink-0 text-zinc-500' />
          <span>{mapLocation.address}</span>
        </div>

        {!hasAddress && (
          <div className='flex items-start gap-2 rounded-lg border border-blue-900/50 bg-blue-500/5 p-3'>
            <div className='flex h-5 w-5 flex-shrink-0 items-center justify-center rounded bg-blue-500/10'>
              <Info className='h-3.5 w-3.5 text-blue-400' />
            </div>
            <p className='text-xs text-blue-300'>
              Enter a specific venue address for a more precise location pin
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
