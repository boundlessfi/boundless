'use client';

import React, { useState, useEffect } from 'react';
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
import { zodResolver } from '@hookform/resolvers/zod';
import {
  infoSchema,
  InfoFormData,
} from '@/components/organization/hackathons/new/tabs/schemas/infoSchema';
import { BoundlessButton } from '@/components/buttons';
import dynamic from 'next/dynamic';
import BannerUpload from '@/components/organization/hackathons/new/tabs/components/BannerUpload';
import CategorySelection from '@/components/organization/hackathons/new/tabs/components/CategorySelection';
import VenueSection from '@/components/organization/hackathons/new/tabs/components/VenueSection';
import {
  loadCountries,
  loadStatesByCountry,
  loadCitiesByState,
  Country,
  State,
  City,
} from '@/lib/country-utils';
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

interface GeneralSettingsTabProps {
  organizationId: string;
  hackathonId: string;
  initialData?: Partial<InfoFormData>;
  onSave?: (data: InfoFormData) => Promise<void>;
  isLoading?: boolean;
}

export default function GeneralSettingsTab({
  initialData,
  onSave,
  isLoading = false,
}: GeneralSettingsTabProps) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>(
    initialData?.country || ''
  );
  const [selectedState, setSelectedState] = useState<string>(
    initialData?.state || ''
  );
  const [mapLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);

  const form = useForm<InfoFormData>({
    resolver: zodResolver(infoSchema),
    defaultValues: {
      name: initialData?.name || '',
      banner: initialData?.banner || '',
      description: initialData?.description || '',
      categories: Array.isArray(initialData?.categories)
        ? initialData.categories
        : [],
      venueType: initialData?.venueType || 'virtual',
      country: initialData?.country || '',
      state: initialData?.state || '',
      city: initialData?.city || '',
      venueName: initialData?.venueName || '',
      venueAddress: initialData?.venueAddress || '',
    },
  });

  useEffect(() => {
    const loadCountriesData = async () => {
      try {
        const countriesData = await loadCountries();
        setCountries(countriesData);
      } catch {
        toast.error('Failed to load countries');
      }
    };
    loadCountriesData();
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      const loadStatesData = async () => {
        try {
          const statesData = await loadStatesByCountry(selectedCountry);
          setStates(statesData);
        } catch {
          toast.error('Failed to load states');
        }
      };
      loadStatesData();
    } else {
      setStates([]);
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedCountry && selectedState) {
      const loadCitiesData = async () => {
        try {
          const citiesData = await loadCitiesByState(
            selectedCountry,
            selectedState
          );
          setCities(citiesData);
        } catch {
          toast.error('Failed to load cities');
        }
      };
      loadCitiesData();
    } else {
      setCities([]);
    }
  }, [selectedCountry, selectedState]);

  const onSubmit = async (data: InfoFormData) => {
    if (onSave) {
      // Pass organizationId and hackathonId to onSave for API calls
      await onSave(data);
    }
  };

  return (
    <div className='bg-background-card rounded-xl border border-gray-900 p-6'>
      <div className='mb-6'>
        <h2 className='text-xl font-semibold text-white'>
          General Information
        </h2>
        <p className='mt-1 text-sm text-gray-400'>
          Update your hackathon's basic information, banner, and venue details.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
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

          <CategorySelection control={form.control} name='categories' />

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

          <div className='flex justify-end pt-4'>
            <BoundlessButton
              type='submit'
              variant='default'
              size='lg'
              disabled={isLoading}
              className='min-w-[120px]'
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </BoundlessButton>
          </div>
        </form>
      </Form>
    </div>
  );
}
