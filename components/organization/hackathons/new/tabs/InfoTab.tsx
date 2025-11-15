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
import { useState } from 'react';
import React from 'react';
import dynamic from 'next/dynamic';
import { zodResolver } from '@hookform/resolvers/zod';
import { infoSchema, InfoFormData } from './schemas/infoSchema';
import BannerUpload from './components/BannerUpload';
import CategorySelection from './components/CategorySelection';
import VenueSection from './components/VenueSection';
import { BoundlessButton } from '@/components/buttons';
import { toast } from 'sonner';
import { useLocationData } from '@/hooks/use-location-data';
import { useGeocoding } from '@/hooks/use-geocoding';

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
      category: Array.isArray(initialData?.category)
        ? initialData.category
        : initialData?.category
          ? [initialData.category]
          : [],
      venueType: initialData?.venueType || 'physical',
      country: initialData?.country || '',
      state: initialData?.state || '',
      city: initialData?.city || '',
      venueName: initialData?.venueName || '',
      venueAddress: initialData?.venueAddress || '',
    },
  });

  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');

  const { countries, states, cities } = useLocationData({
    selectedCountry,
    selectedState,
    setValue: form.setValue,
  });

  const { mapLocation } = useGeocoding({
    countries,
    states,
    cities,
    selectedCountry,
    selectedState,
    watch: form.watch,
  });

  const onSubmit = async (data: InfoFormData) => {
    try {
      if (onSave) {
        await onSave(data);
        // Navigation is handled automatically in saveInformationStep
        toast.success('Information saved successfully!');
      }
    } catch {
      toast.error('Failed to save information. Please try again.');
    }
  };

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
