import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Control } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Country, State, City } from '@/lib/country-utils';
import LocationFields from './LocationFields';
import MapPreview from './MapPreview';
import { MapPin, Globe, Info } from 'lucide-react';

interface VenueSectionProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  watch: (name: string) => unknown;
  countries: Country[];
  states: State[];
  cities: City[];
  selectedCountry: string;
  selectedState: string;
  mapLocation: { lat: number; lng: number; address: string } | null;
  onCountryChange: (value: string) => void;
  onStateChange: (value: string) => void;
}

export default function VenueSection({
  control,
  watch,
  countries,
  states,
  cities,
  selectedCountry,
  selectedState,
  mapLocation,
  onCountryChange,
  onStateChange,
}: VenueSectionProps) {
  const venueType = watch('venueType');
  const venueAddress = watch('venueAddress');
  const city = watch('city');
  const state = watch('state');

  return (
    <div className='space-y-4'>
      <div>
        <h3 className='text-sm font-medium text-white'>
          Venue <span className='text-red-500'>*</span>
        </h3>
        <p className='mt-1 text-sm text-zinc-500'>
          Choose how participants will attend your hackathon
        </p>
      </div>

      <div className='space-y-6 rounded-xl border border-zinc-800 bg-zinc-900/30 p-6'>
        {/* Venue Type Selection */}
        <FormField
          control={control}
          name='venueType'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-sm font-medium text-white'>
                Venue Type
              </FormLabel>
              <FormControl>
                <div className='grid grid-cols-2 gap-3'>
                  {[
                    { value: 'virtual', label: 'Virtual', icon: Globe },
                    { value: 'physical', label: 'Physical', icon: MapPin },
                  ].map(option => {
                    const Icon = option.icon;
                    const isSelected = field.value === option.value;

                    return (
                      <button
                        key={option.value}
                        type='button'
                        onClick={() => field.onChange(option.value)}
                        className={cn(
                          'flex items-center gap-3 rounded-lg border p-4 text-left transition-all',
                          isSelected
                            ? 'border-primary/50 bg-primary/10 shadow-primary/10 shadow-sm'
                            : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900'
                        )}
                      >
                        <div
                          className={cn(
                            'flex h-10 w-10 items-center justify-center rounded-lg transition-all',
                            isSelected
                              ? 'bg-primary/20 text-primary'
                              : 'bg-zinc-800 text-zinc-500'
                          )}
                        >
                          <Icon className='h-5 w-5' />
                        </div>
                        <div className='flex-1'>
                          <p
                            className={cn(
                              'text-sm font-medium',
                              isSelected ? 'text-primary' : 'text-white'
                            )}
                          >
                            {option.label}
                          </p>
                          <p className='text-xs text-zinc-500'>
                            {option.value === 'virtual'
                              ? 'Online event'
                              : 'In-person event'}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </FormControl>
              <FormMessage className='text-xs text-red-500' />
            </FormItem>
          )}
        />

        {/* Virtual Event Info */}
        {venueType === 'virtual' && (
          <div className='flex gap-3 rounded-lg border border-blue-900/50 bg-blue-500/5 p-4'>
            <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-500/10'>
              <Info className='h-4 w-4 text-blue-400' />
            </div>
            <div className='flex-1'>
              <p className='text-sm font-medium text-white'>Virtual Event</p>
              <p className='mt-1 text-xs text-zinc-400'>
                This hackathon will be conducted online. Add platform details
                (Zoom, Discord, etc.) in the timeline section.
              </p>
            </div>
          </div>
        )}

        {/* Physical Event Fields */}
        {venueType === 'physical' && (
          <div className='space-y-6'>
            <div className='h-px bg-zinc-800' />

            {/* Location Fields */}
            <div>
              <h4 className='mb-3 text-sm font-medium text-white'>Location</h4>
              <LocationFields
                control={control}
                countries={countries}
                states={states}
                cities={cities}
                selectedCountry={selectedCountry}
                selectedState={selectedState}
                onCountryChange={onCountryChange}
                onStateChange={onStateChange}
              />
            </div>

            <div className='h-px bg-zinc-800' />

            {/* Venue Details */}
            <div className='space-y-4'>
              <h4 className='text-sm font-medium text-white'>Venue Details</h4>

              <FormField
                control={control}
                name='venueName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-sm font-medium text-zinc-400'>
                      Venue Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type='text'
                        placeholder='e.g., Eko Hotel and Suites'
                        className='h-11 border-zinc-800 bg-zinc-900/50 text-white placeholder:text-zinc-600'
                      />
                    </FormControl>
                    <FormMessage className='text-xs text-red-500' />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name='venueAddress'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-sm font-medium text-zinc-400'>
                      Venue Address
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder='e.g., 1415 Adetokunbo Ademola Street, Victoria Island'
                        className='min-h-20 resize-y border-zinc-800 bg-zinc-900/50 text-white placeholder:text-zinc-600'
                      />
                    </FormControl>
                    <FormMessage className='text-xs text-red-500' />
                  </FormItem>
                )}
              />

              {/* Map Preview */}
              <MapPreview
                mapLocation={mapLocation}
                hasAddress={!!venueAddress}
                city={city as string}
                state={state as string}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
