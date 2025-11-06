import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { useState, useEffect, useCallback } from 'react';
import React from 'react';
import {
  loadCountries,
  loadStatesByCountry,
  loadCitiesByState,
  geocodeAddress,
  Country,
  State,
  City,
} from '@/lib/country-utils';
import dynamic from 'next/dynamic';
import { zodResolver } from '@hookform/resolvers/zod';
import { infoSchema, InfoFormData } from './schemas/infoSchema';
import BannerUpload from './components/BannerUpload';
import CategorySelection from './components/CategorySelection';
import VenueSection from './components/VenueSection';
import { BoundlessButton } from '@/components/buttons';
import { toast } from 'sonner';

const DynamicMinimalTiptap = dynamic(
  () =>
    import('@/components/ui/shadcn-io/minimal-tiptap').then(mod => ({
      default: mod.MinimalTiptap,
    })),
  {
    ssr: false,
    loading: () => (
      <div className='h-32 w-full animate-pulse rounded-lg bg-gray-800' />
    ),
  }
);

interface InfoTabProps {
  onContinue?: () => void;
  onSave?: (data: InfoFormData) => Promise<void>;
  initialData?: Partial<InfoFormData>;
  isLoading?: boolean;
}

export default function InfoTab({
  onContinue,
  onSave,
  initialData,
  isLoading = false,
}: InfoTabProps) {
  const form = useForm<InfoFormData>({
    resolver: zodResolver(infoSchema),
    defaultValues: {
      name: initialData?.name || '',
      banner: initialData?.banner || '',
      description: initialData?.description || '',
      category: initialData?.category || '',
      venueType: initialData?.venueType || 'physical',
      country: initialData?.country || '',
      state: initialData?.state || '',
      city: initialData?.city || '',
      venueName: initialData?.venueName || '',
      venueAddress: initialData?.venueAddress || '',
    },
  });

  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [mapLocation, setMapLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);

  const onSubmit = async (data: InfoFormData) => {
    try {
      if (onSave) {
        await onSave(data);
        toast.success('Information saved successfully!');
      }
      if (onContinue) {
        onContinue();
      }
    } catch {
      toast.error('Failed to save information. Please try again.');
    }
  };

  useEffect(() => {
    const loadCountriesData = async () => {
      try {
        const countriesData = await loadCountries();
        setCountries(countriesData);
      } catch {}
    };
    loadCountriesData();
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      const loadStatesData = async () => {
        try {
          const statesData = await loadStatesByCountry(selectedCountry);
          setStates(statesData);
          setCities([]);
          setSelectedState('');
          form.setValue('state', '');
          form.setValue('city', '');
        } catch {
          setStates([]);
        }
      };
      loadStatesData();
    } else {
      setStates([]);
      setCities([]);
      setSelectedState('');
    }
  }, [selectedCountry, form]);

  useEffect(() => {
    if (selectedCountry && selectedState) {
      const loadCitiesData = async () => {
        try {
          const citiesData = await loadCitiesByState(
            selectedCountry,
            selectedState
          );
          setCities(citiesData);

          form.setValue('city', '');
        } catch {
          setCities([]);
        }
      };
      loadCitiesData();
    } else {
      setCities([]);
    }
  }, [selectedCountry, selectedState, form]);

  const getLocationCenter = useCallback(() => {
    const country = countries.find(c => c.iso2 === selectedCountry);
    const state = states.find(s => s.state_code === selectedState);
    const city = cities.find(c => c.name === form.watch('city'));

    if (city) {
      return {
        lat: city.latitude,
        lng: city.longitude,
        address: `${city.name}, ${state?.name || ''}, ${country?.name || ''}`
          .replace(/,\s*,/g, ',')
          .replace(/,$/, ''),
      };
    } else if (state) {
      return {
        lat: state.latitude,
        lng: state.longitude,
        address: `${state.name}, ${country?.name || ''}`
          .replace(/,\s*,/g, ',')
          .replace(/,$/, ''),
      };
    } else if (country) {
      return {
        lat: country.latitude,
        lng: country.longitude,
        address: country.name,
      };
    }
    return null;
  }, [countries, states, cities, selectedCountry, selectedState, form]);

  const geocodeAddressHandler = useCallback(
    async (address: string) => {
      if (!address.trim()) return;

      try {
        const country = countries.find(c => c.iso2 === selectedCountry);
        const state = states.find(s => s.state_code === selectedState);
        const city = form.watch('city');

        let searchQuery = address;
        if (city && city !== 'other') {
          searchQuery = `${address}, ${city}`;
        }
        if (state && state.name) {
          searchQuery += `, ${state.name}`;
        }
        if (country && country.name) {
          searchQuery += `, ${country.name}`;
        }

        const result = await geocodeAddress(searchQuery);
        if (result) {
          setMapLocation(result);
        }
      } catch {}
    },
    [countries, states, selectedCountry, selectedState, form]
  );

  useEffect(() => {
    const address = form.watch('venueAddress');
    const country = form.watch('country');
    const state = form.watch('state');
    const city = form.watch('city');

    if (form.watch('venueType') === 'physical') {
      if (address && address.trim()) {
        const timeoutId = setTimeout(() => {
          geocodeAddressHandler(address);
        }, 1000);

        return () => clearTimeout(timeoutId);
      } else if (country || state || city) {
        const locationCenter = getLocationCenter();
        if (locationCenter) {
          setMapLocation(locationCenter);
        }
      }
    }
  }, [form, geocodeAddressHandler, getLocationCenter]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem className='gap-3'>
              <FormLabel className='text-sm'>
                Title <span className='text-error-400'>*</span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type='text'
                  placeholder='Enter a title for your hackathon'
                  className='bg-background-card h-12 w-full rounded-[12px] border border-gray-900 p-4 placeholder:text-gray-600 focus-visible:ring-0 focus-visible:ring-offset-0'
                />
              </FormControl>
              <FormMessage className='text-error-400 text-xs' />
            </FormItem>
          )}
        />

        <BannerUpload
          control={form.control}
          name='banner'
          setValue={form.setValue}
        />

        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem className='gap-3'>
              <FormLabel className='text-sm'>
                Details <span className='text-error-400'>*</span>
              </FormLabel>
              <FormControl>
                <DynamicMinimalTiptap
                  content={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage className='text-error-400 text-xs' />
            </FormItem>
          )}
        />

        <CategorySelection control={form.control} name='category' />

        <VenueSection
          control={form.control}
          watch={form.watch}
          countries={countries}
          states={states}
          cities={cities}
          selectedCountry={selectedCountry}
          selectedState={selectedState}
          mapLocation={mapLocation}
          onCountryChange={setSelectedCountry}
          onStateChange={setSelectedState}
        />
        <BoundlessButton type='submit' size='xl' disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Continue'}
        </BoundlessButton>
      </form>
    </Form>
  );
}
