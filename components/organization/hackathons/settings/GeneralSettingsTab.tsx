'use client';

import React, { useState, useEffect } from 'react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
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

const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then(mod => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className='flex h-32 w-full items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/30'>
        <Loader2 className='h-6 w-6 animate-spin text-zinc-500' />
      </div>
    ),
  }
);

interface GeneralSettingsTabProps {
  organizationId: string;
  hackathonId: string;
  initialData?: Partial<InfoFormData>;
  onSave?: (data: InfoFormData) => Promise<void>;
  isLoading?: boolean;
  isPublished?: boolean;
}

import TurndownService from 'turndown';

export default function GeneralSettingsTab({
  organizationId,
  hackathonId,
  initialData,
  onSave,
  isLoading = false,
  isPublished = false,
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

  // Normalize HTML to Markdown for existing descriptions
  const normalizedDescription = React.useMemo(() => {
    let desc = initialData?.description || '';
    if (desc && /<[a-z][\\s\\S]*>/i.test(desc)) {
      try {
        const turndownService = new TurndownService({
          headingStyle: 'atx',
          codeBlockStyle: 'fenced',
          bulletListMarker: '-',
        });
        desc = turndownService.turndown(desc);
      } catch (err) {
        console.error('Failed to convert HTML to Markdown', err);
      }
    }
    return desc;
  }, [initialData?.description]);

  const form = useForm<InfoFormData>({
    resolver: zodResolver(infoSchema),
    defaultValues: {
      name: initialData?.name || '',
      tagline: initialData?.tagline || '',
      slug: initialData?.slug || '',
      banner: initialData?.banner || '',
      description: normalizedDescription,
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

  const inputClassName =
    'h-12 w-full rounded-[12px] border border-zinc-700 bg-zinc-900/80 p-4 text-white placeholder:text-zinc-500 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-0 focus-visible:border-primary/50';

  return (
    <div className='rounded-xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-sm'>
      <div className='mb-6'>
        <h2 className='text-xl font-semibold text-white'>
          General Information
        </h2>
        <p className='mt-1 text-sm text-zinc-400'>
          Update your hackathon&apos;s basic information, banner, and venue
          details.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem className='gap-3'>
                <FormLabel className='text-sm font-medium text-zinc-200'>
                  Title <span className='text-red-400'>*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type='text'
                    placeholder='Enter a title for your hackathon'
                    className={inputClassName}
                  />
                </FormControl>
                <FormMessage className='text-xs text-red-400' />
              </FormItem>
            )}
          />

          {isPublished && (
            <Alert className='border-amber-900 bg-amber-950/20 text-amber-200'>
              <AlertCircle className='h-4 w-4' />
              <AlertTitle>Slug cannot be changed</AlertTitle>
              <AlertDescription>
                The URL slug cannot be modified once a hackathon has been
                published to avoid breaking existing links.
              </AlertDescription>
            </Alert>
          )}

          <FormField
            control={form.control}
            name='slug'
            render={({ field }) => (
              <FormItem className='gap-3'>
                <FormLabel className='text-sm font-medium text-zinc-200'>
                  URL Slug
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type='text'
                    placeholder='e.g. my-awesome-hackathon'
                    readOnly={isPublished}
                    disabled={isPublished}
                    className={`${inputClassName} disabled:cursor-not-allowed disabled:opacity-60`}
                  />
                </FormControl>
                <FormDescription className='text-xs text-zinc-500'>
                  Lowercase letters, numbers, and hyphens only.
                </FormDescription>
                <FormMessage className='text-xs text-red-400' />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='tagline'
            render={({ field }) => (
              <FormItem className='gap-3'>
                <FormLabel className='text-sm font-medium text-zinc-200'>
                  Tagline <span className='text-red-400'>*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type='text'
                    placeholder='Enter a short tagline for your hackathon'
                    className={inputClassName}
                  />
                </FormControl>
                <FormMessage className='text-xs text-red-400' />
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
                <FormLabel className='text-sm font-medium text-zinc-200'>
                  Details <span className='text-red-400'>*</span>
                </FormLabel>
                <FormControl>
                  <div className='overflow-hidden rounded-xl border border-zinc-800'>
                    <MDEditor
                      value={field.value}
                      onChange={value => field.onChange(value || '')}
                      height={300}
                      data-color-mode='dark'
                      preview='edit'
                      hideToolbar={false}
                      visibleDragbar={true}
                      textareaProps={{
                        placeholder:
                          "Tell your hackathon's story...\n\nUse markdown for formatting: headings, lists, links, and more.",
                        style: {
                          fontSize: 14,
                          lineHeight: 1.6,
                          color: '#ffffff',
                          backgroundColor: '#18181b', // matching InfoTab style
                          fontFamily: 'inherit',
                          border: 'none',
                        },
                      }}
                      style={{
                        backgroundColor: '#18181b', // matching InfoTab style
                        color: '#ffffff',
                        border: 'none',
                      }}
                    />
                  </div>
                </FormControl>
                <FormMessage className='text-xs text-red-400' />
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
