import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import type { Control } from 'react-hook-form';
import {
  ArrowLeft,
  FileText,
  Link as LinkIcon,
  Loader2,
  Plus,
  Trash2,
} from 'lucide-react';

import { BoundlessButton } from '@/components/buttons';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import ResourceFileUpload from '@/components/organization/hackathons/new/tabs/components/ResourceFileUpload';
import { resourcesSchema, ResourcesFormData } from './schemas/resourcesSchema';

interface ResourcesTabProps {
  onContinue?: () => void;
  onBack?: () => void;
  onSave?: (data: ResourcesFormData) => Promise<void>;
  initialData?: ResourcesFormData;
  isLoading?: boolean;
}

interface ResourceRowProps {
  index: number;
  onRemove: (index: number) => void;
  control: Control<ResourcesFormData>;
}

const ResourceRow = ({ index, onRemove, control }: ResourceRowProps) => {
  return (
    <div className='group space-y-4 rounded-lg border border-zinc-800 bg-zinc-900/30 p-4'>
      <div className='flex items-start justify-between gap-4'>
        <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-800'>
          <FileText className='h-5 w-5 text-zinc-500' />
        </div>
        <div className='flex-1 space-y-4'>
          {/* Link */}
          <FormField
            control={control}
            name={`resources.${index}.link`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-sm font-medium text-white'>
                  Link <span className='text-zinc-500'>(optional)</span>
                </FormLabel>
                <FormControl>
                  <div className='relative'>
                    <LinkIcon className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-500' />
                    <Input
                      {...field}
                      type='url'
                      placeholder='https://example.com/resource'
                      value={field.value || ''}
                      className='h-11 border-zinc-800 bg-zinc-900/50 pl-10 text-white placeholder:text-zinc-600'
                    />
                  </div>
                </FormControl>
                <FormMessage className='text-xs text-red-500' />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={control}
            name={`resources.${index}.description`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-sm font-medium text-white'>
                  Description <span className='text-zinc-500'>(optional)</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    value={field.value || ''}
                    placeholder='Describe this resource for contributors...'
                    className='min-h-24 resize-none border-zinc-800 bg-zinc-900/50 text-white placeholder:text-zinc-600'
                  />
                </FormControl>
                <FormMessage className='text-xs text-red-500' />
              </FormItem>
            )}
          />

          {/* File upload */}
          <FormField
            control={control}
            name={`resources.${index}.file`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-sm font-medium text-white'>
                  File <span className='text-zinc-500'>(optional)</span>
                </FormLabel>
                <FormControl>
                  <ResourceFileUpload
                    value={field.value}
                    onChange={field.onChange}
                    folder='boundless/bounties/resources'
                    tags={['bounty', 'resource']}
                    allowedExtensions={[
                      '.pdf',
                      '.doc',
                      '.docx',
                      '.ppt',
                      '.pptx',
                      '.md',
                      '.markdown',
                    ]}
                    allowedMimeTypes={[
                      'application/pdf',
                      'application/msword',
                      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                      'application/vnd.ms-powerpoint',
                      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                      'text/markdown',
                      'text/x-markdown',
                      'text/plain',
                    ]}
                  />
                </FormControl>
                <p className='text-xs text-zinc-500'>
                  Upload a PDF, Word, PowerPoint, or Markdown (.md) file (Max
                  10MB)
                </p>
                <FormMessage className='text-xs text-red-500' />
              </FormItem>
            )}
          />
        </div>

        <Button
          type='button'
          variant='ghost'
          size='icon'
          onClick={() => onRemove(index)}
          className='shrink-0 text-zinc-500 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400'
        >
          <Trash2 className='h-4 w-4' />
        </Button>
      </div>
    </div>
  );
};

export default function ResourcesTab({
  onContinue,
  onBack,
  onSave,
  initialData,
  isLoading = false,
}: ResourcesTabProps) {
  const form = useForm<ResourcesFormData>({
    resolver: zodResolver(resourcesSchema),
    mode: 'onChange',
    defaultValues: initialData || { resources: [] },
  });

  React.useEffect(() => {
    if (initialData) form.reset(initialData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  // Whether the organizer has added anything yet; drives the "Skip" vs
  // "Continue" label so the step reads as clearly optional.
  const hasResources = (form.watch('resources')?.length ?? 0) > 0;
  const hadInitialResources = (initialData?.resources?.length ?? 0) > 0;

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'resources',
  });

  const handleAdd = () => {
    append({
      id: `resource-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      link: '',
      description: '',
      file: undefined,
    });
  };

  const handleRemove = (index: number) => {
    remove(index);
    toast.success('Resource removed');
  };

  const onSubmit = async (data: ResourcesFormData) => {
    try {
      // Optional step: only persist when there's something to save or a prior
      // set to clear. Otherwise just advance without a wasted request.
      const shouldSave =
        (data.resources?.length ?? 0) > 0 || hadInitialResources;
      if (onSave && shouldSave) await onSave(data);
      if (onContinue) onContinue();
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string | string[] } };
        message?: string;
      };
      const message = err.response?.data?.message || err.message;
      const errorMessage = Array.isArray(message) ? message[0] : message;
      toast.error(
        errorMessage || 'Failed to save resources. Please try again.'
      );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <div>
          <h3 className='text-lg font-medium text-white'>
            Resources for contributors
          </h3>
          <p className='mt-1 text-sm text-zinc-500'>
            Share helpful links, documentation, or files to help contributors
            succeed. This step is optional.
          </p>
        </div>

        <div className='space-y-4'>
          {fields.length === 0 ? (
            <div className='flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-800 bg-zinc-900/30 p-12'>
              <FileText className='mb-4 h-12 w-12 text-zinc-600' />
              <p className='mb-2 text-sm font-medium text-white'>
                No resources added yet
              </p>
              <p className='mb-4 text-sm text-zinc-500'>
                Add links or files to give contributors everything they need.
              </p>
              <Button
                type='button'
                variant='outline'
                onClick={handleAdd}
                className='hover:border-primary hover:bg-primary/5 hover:text-primary border-zinc-700'
              >
                <Plus className='mr-2 h-4 w-4' />
                Add resource
              </Button>
            </div>
          ) : (
            <>
              {fields.map((resource, index) => (
                <ResourceRow
                  key={resource.id}
                  index={index}
                  onRemove={handleRemove}
                  control={form.control}
                />
              ))}

              <Button
                type='button'
                variant='outline'
                onClick={handleAdd}
                className='hover:border-primary hover:bg-primary/5 hover:text-primary h-11 w-full border-dashed border-zinc-700 text-zinc-400'
              >
                <Plus className='mr-2 h-4 w-4' />
                Add more resources
              </Button>
            </>
          )}
        </div>

        <div className='flex items-center justify-between pt-4'>
          {onBack ? (
            <BoundlessButton
              type='button'
              variant='outline'
              size='lg'
              onClick={onBack}
              disabled={isLoading}
            >
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back
            </BoundlessButton>
          ) : (
            <span />
          )}
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
            ) : hasResources ? (
              'Continue'
            ) : (
              'Skip for now'
            )}
          </BoundlessButton>
        </div>
      </form>
    </Form>
  );
}
