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
import { Loader2 } from 'lucide-react';

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
        toast.success('Information saved successfully');
      }
    } catch {
      toast.error('Failed to save information. Please try again.');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        {/* Title */}
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-sm font-medium text-white'>
                Hackathon Title <span className='text-red-500'>*</span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type='text'
                  placeholder='Enter hackathon title'
                  className='h-11 border-zinc-800 bg-zinc-900/50 text-white placeholder:text-zinc-600'
                />
              </FormControl>
              <FormMessage className='text-xs text-red-500' />
            </FormItem>
          )}
        />

        {/* Banner */}
        <BannerUpload
          control={form.control}
          name='banner'
          setValue={form.setValue}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-sm font-medium text-white'>
                Description <span className='text-red-500'>*</span>
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
                        backgroundColor: '#18181b',
                        fontFamily: 'inherit',
                        border: 'none',
                      },
                    }}
                    style={{
                      backgroundColor: '#18181b',
                      color: '#ffffff',
                      border: 'none',
                    }}
                  />
                </div>
              </FormControl>
              <FormMessage className='text-xs text-red-500' />
            </FormItem>
          )}
        />

        {/* Categories */}
        <CategorySelection control={form.control} name='categories' />

        {/* Venue */}
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

        {/* Submit Button */}
        <div className='flex justify-end pt-4'>
          <BoundlessButton
            type='submit'
            size='lg'
            disabled={isLoading}
            className='min-w-32'
          >
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Saving...
              </>
            ) : (
              'Continue'
            )}
          </BoundlessButton>
        </div>
      </form>
    </Form>
  );
}
