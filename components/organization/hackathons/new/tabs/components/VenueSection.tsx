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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Country, State, City } from '@/lib/country-utils';
import LocationFields from './LocationFields';
import MapPreview from './MapPreview';

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
    <div className='space-y-6'>
      <h3 className='text-sm text-white'>
        Venue <span className='text-error-400'>*</span>
      </h3>

      <div className='bg-background-card space-y-4 rounded-[12px] border border-gray-900 py-5'>
        <FormField
          control={control}
          name='venueType'
          render={({ field }) => (
            <FormItem className='gap-3 px-5'>
              <FormLabel className='text-sm text-gray-500'>
                Select Venue Type
              </FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className='flex flex-wrap gap-3'
                >
                  {[
                    { value: 'virtual', label: 'Virtual' },
                    { value: 'physical', label: 'Physical' },
                  ].map(option => (
                    <div
                      key={option.value}
                      className={cn(
                        'flex w-fit items-center space-x-3 rounded-[6px] border border-[#2B2B2B] bg-[#2B2B2B3D] p-3',
                        field.value === option.value && 'bg-[#A7F9501F]'
                      )}
                    >
                      <RadioGroupItem
                        value={option.value}
                        id={option.value}
                        className={cn(
                          'text-primary border-[#B5B5B5] bg-transparent',
                          field.value === option.value && 'border-primary'
                        )}
                      />
                      <Label
                        htmlFor={option.value}
                        className={cn(
                          'cursor-pointer text-sm font-normal',
                          field.value === option.value
                            ? 'text-primary'
                            : 'text-[#B5B5B5]'
                        )}
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage className='text-error-400 text-xs' />
            </FormItem>
          )}
        />

        <Separator className='bg-gray-900' />

        {venueType === 'physical' && (
          <>
            <div className='px-5'>
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

            <Separator className='bg-gray-900' />

            <div className='space-y-4 px-5'>
              <FormField
                control={control}
                name='venueName'
                render={({ field }) => (
                  <FormItem className='gap-3'>
                    <FormLabel className='text-sm text-gray-500'>
                      Venue Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type='text'
                        placeholder='Enter venue name (e.g., Eko Hotel and Suites)'
                        className='bg-background-card h-12 w-full rounded-[12px] border border-gray-900 p-4 placeholder:text-gray-600 focus-visible:ring-0 focus-visible:ring-offset-0'
                      />
                    </FormControl>
                    <FormMessage className='text-error-400 text-xs' />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name='venueAddress'
                render={({ field }) => (
                  <FormItem className='gap-3'>
                    <FormLabel className='text-sm text-gray-500'>
                      Venue Address
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder='Enter full venue address (e.g., 1415 Adetokunbo Ademola Street, Victoria Island, Lagos 106104, Lagos)'
                        className='bg-background-card min-h-[80px] w-full rounded-[12px] border border-gray-900 p-4 placeholder:text-gray-600 focus-visible:ring-0 focus-visible:ring-offset-0'
                      />
                    </FormControl>
                    <FormMessage className='text-error-400 text-xs' />
                  </FormItem>
                )}
              />

              <MapPreview
                mapLocation={mapLocation}
                hasAddress={!!venueAddress}
                city={city as string}
                state={state as string}
              />
            </div>
          </>
        )}

        {venueType === 'virtual' && (
          <div className='mx-5 rounded-lg border border-blue-500/30 bg-blue-900/20 p-4'>
            <p className='text-sm text-blue-300'>
              <strong>Virtual Event:</strong> This hackathon will be conducted
              online. You can specify the platform (Zoom, Discord, etc.) and
              meeting details in the timeline section.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
