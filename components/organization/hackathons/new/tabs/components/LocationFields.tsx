import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Control } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Country, State, City } from '@/lib/country-utils';

interface LocationFieldsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  countries: Country[];
  states: State[];
  cities: City[];
  selectedCountry: string;
  selectedState: string;
  onCountryChange: (value: string) => void;
  onStateChange: (value: string) => void;
}

export default function LocationFields({
  control,
  countries,
  states,
  cities,
  selectedCountry,
  selectedState,
  onCountryChange,
  onStateChange,
}: LocationFieldsProps) {
  return (
    <div className='space-y-4'>
      <FormField
        control={control}
        name='country'
        render={({ field }) => (
          <FormItem className='gap-3'>
            <FormLabel className='text-sm text-gray-500'>
              Country or Region
            </FormLabel>
            <FormControl>
              <Select
                value={field.value}
                onValueChange={value => {
                  field.onChange(value);
                  onCountryChange(value);
                }}
              >
                <SelectTrigger className='bg-background-card !h-12 w-full rounded-[12px] border border-gray-900 p-4 focus-visible:ring-0 focus-visible:ring-offset-0'>
                  <SelectValue placeholder='Select country' />
                </SelectTrigger>
                <SelectContent className='bg-background-card max-h-60 rounded-[12px] border-gray-900'>
                  {countries.map(country => (
                    <SelectItem
                      key={country.iso2}
                      value={country.iso2}
                      className='text-white hover:!bg-gray-800'
                    >
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage className='text-error-400 text-xs' />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name='state'
        render={({ field }) => (
          <FormItem className='gap-3'>
            <FormLabel className='text-sm text-gray-500'>
              State/Province
            </FormLabel>
            <FormControl>
              <Select
                value={field.value}
                onValueChange={value => {
                  field.onChange(value);
                  onStateChange(value);
                }}
                disabled={!selectedCountry}
              >
                <SelectTrigger className='bg-background-card !h-12 w-full rounded-[12px] border border-gray-900 p-4 focus-visible:ring-0 focus-visible:ring-offset-0'>
                  <SelectValue
                    placeholder={
                      selectedCountry ? 'Select state' : 'Select country first'
                    }
                  />
                </SelectTrigger>
                <SelectContent className='bg-background-card max-h-60 rounded-[12px] border-gray-900'>
                  {states.map((state, index) => (
                    <SelectItem
                      key={index}
                      value={state.state_code}
                      className='text-white hover:!bg-gray-800'
                    >
                      {state.name}
                    </SelectItem>
                  ))}
                  {states.length === 0 && selectedCountry && (
                    <SelectItem
                      value='other'
                      className='text-white hover:!bg-gray-800'
                    >
                      Other
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage className='text-error-400 text-xs' />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name='city'
        render={({ field }) => (
          <FormItem className='gap-3'>
            <FormLabel className='text-sm text-gray-500'>City</FormLabel>
            <FormControl>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={!selectedCountry || !selectedState}
              >
                <SelectTrigger className='bg-background-card !h-12 w-full rounded-[12px] border border-gray-900 p-4 focus-visible:ring-0 focus-visible:ring-offset-0'>
                  <SelectValue
                    placeholder={
                      !selectedCountry
                        ? 'Select country first'
                        : !selectedState
                          ? 'Select state first'
                          : 'Select city'
                    }
                  />
                </SelectTrigger>
                <SelectContent className='bg-background-card max-h-60 rounded-[12px] border-gray-900'>
                  {cities.map((city, index) => (
                    <SelectItem
                      key={index}
                      value={city.name}
                      className='text-white hover:!bg-gray-800'
                    >
                      {city.name}
                    </SelectItem>
                  ))}
                  {cities.length === 0 && selectedCountry && selectedState && (
                    <SelectItem
                      value='other'
                      className='text-white hover:!bg-gray-800'
                    >
                      Other
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage className='text-error-400 text-xs' />
          </FormItem>
        )}
      />
    </div>
  );
}
