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
    <div className='grid gap-4 md:grid-cols-3'>
      {/* Country */}
      <FormField
        control={control}
        name='country'
        render={({ field }) => (
          <FormItem>
            <FormLabel className='text-sm font-medium text-zinc-400'>
              Country
            </FormLabel>
            <FormControl>
              <Select
                value={field.value}
                onValueChange={value => {
                  field.onChange(value);
                  onCountryChange(value);
                }}
              >
                <SelectTrigger className='h-11 border-zinc-800 bg-zinc-900/50 text-white'>
                  <SelectValue placeholder='Select country' />
                </SelectTrigger>
                <SelectContent className='max-h-60 border-zinc-800 bg-zinc-950'>
                  {countries.map(country => (
                    <SelectItem
                      key={country.iso2}
                      value={country.iso2}
                      className='text-white focus:bg-zinc-800 focus:text-white'
                    >
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage className='text-xs text-red-500' />
          </FormItem>
        )}
      />

      {/* State */}
      <FormField
        control={control}
        name='state'
        render={({ field }) => (
          <FormItem>
            <FormLabel className='text-sm font-medium text-zinc-400'>
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
                <SelectTrigger className='h-11 border-zinc-800 bg-zinc-900/50 text-white disabled:cursor-not-allowed disabled:opacity-50'>
                  <SelectValue
                    placeholder={
                      selectedCountry ? 'Select state' : 'Select country first'
                    }
                  />
                </SelectTrigger>
                <SelectContent className='max-h-60 border-zinc-800 bg-zinc-950'>
                  {states.length > 0
                    ? states.map((state, index) => (
                        <SelectItem
                          key={index}
                          value={state.state_code}
                          className='text-white focus:bg-zinc-800 focus:text-white'
                        >
                          {state.name}
                        </SelectItem>
                      ))
                    : selectedCountry && (
                        <SelectItem
                          value='other'
                          className='text-white focus:bg-zinc-800 focus:text-white'
                        >
                          Other
                        </SelectItem>
                      )}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage className='text-xs text-red-500' />
          </FormItem>
        )}
      />

      {/* City */}
      <FormField
        control={control}
        name='city'
        render={({ field }) => (
          <FormItem>
            <FormLabel className='text-sm font-medium text-zinc-400'>
              City
            </FormLabel>
            <FormControl>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={!selectedCountry || !selectedState}
              >
                <SelectTrigger className='h-11 border-zinc-800 bg-zinc-900/50 text-white disabled:cursor-not-allowed disabled:opacity-50'>
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
                <SelectContent className='max-h-60 border-zinc-800 bg-zinc-950'>
                  {cities.length > 0
                    ? cities.map((city, index) => (
                        <SelectItem
                          key={index}
                          value={city.name}
                          className='text-white focus:bg-zinc-800 focus:text-white'
                        >
                          {city.name}
                        </SelectItem>
                      ))
                    : selectedCountry &&
                      selectedState && (
                        <SelectItem
                          value='other'
                          className='text-white focus:bg-zinc-800 focus:text-white'
                        >
                          Other
                        </SelectItem>
                      )}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage className='text-xs text-red-500' />
          </FormItem>
        )}
      />
    </div>
  );
}
