import React from 'react';
import { BoundlessButton } from '@/components/buttons';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  resourcesSchema,
  ResourcesFormData,
  ResourceItem,
} from './schemas/resourcesSchema';
import type { Control } from 'react-hook-form';
import {
  Plus,
  Trash2,
  Loader2,
  FileText,
  Link as LinkIcon,
} from 'lucide-react';
import ResourceFileUpload from './components/ResourceFileUpload';

interface ResourcesTabProps {
  onContinue?: () => void;
  onSave?: (data: ResourcesFormData) => Promise<void>;
  initialData?: ResourcesFormData;
  isLoading?: boolean;
}

interface ResourceRowProps {
  resource: Omit<ResourceItem, 'id'> & { id: string };
  index: number;
  onRemove: (index: number) => void;
  canRemove: boolean;
  control: Control<ResourcesFormData>;
}

const ResourceRow = ({
  index,
  onRemove,
  canRemove,
  control,
}: ResourceRowProps) => {
  return (
    <div className='group space-y-4 rounded-lg border border-zinc-800 bg-zinc-900/30 p-4'>
      <div className='flex items-start justify-between gap-4'>
        <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-800'>
          <FileText className='h-5 w-5 text-zinc-500' />
        </div>
        <div className='flex-1 space-y-4'>
          {/* Link Input */}
          <FormField
            control={control}
            name={`resources.${index}.link`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-sm font-medium text-white'>
                  Link <span className='text-zinc-500'>(Optional)</span>
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
                  Description <span className='text-zinc-500'>(Optional)</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    value={field.value || ''}
                    placeholder='Describe this resource for participants...'
                    className='min-h-24 resize-none border-zinc-800 bg-zinc-900/50 text-white placeholder:text-zinc-600'
                  />
                </FormControl>
                <FormMessage className='text-xs text-red-500' />
              </FormItem>
            )}
          />

          {/* File Upload */}
          <FormField
            control={control}
            name={`resources.${index}.file`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-sm font-medium text-white'>
                  File <span className='text-zinc-500'>(Optional)</span>
                </FormLabel>
                <FormControl>
                  <ResourceFileUpload
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <p className='text-xs text-zinc-500'>
                  Upload PDF, PowerPoint, or Word document (Max 10MB)
                </p>
                <FormMessage className='text-xs text-red-500' />
              </FormItem>
            )}
          />
        </div>

        {/* Remove Button */}
        {canRemove && (
          <Button
            type='button'
            variant='ghost'
            size='icon'
            onClick={() => onRemove(index)}
            className='shrink-0 text-zinc-500 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400'
          >
            <Trash2 className='h-4 w-4' />
          </Button>
        )}
      </div>
    </div>
  );
};

export default function ResourcesTab({
  onSave,
  initialData,
  isLoading = false,
}: ResourcesTabProps) {
  const form = useForm<ResourcesFormData>({
    resolver: zodResolver(resourcesSchema),
    mode: 'onChange',
    defaultValues: initialData || {
      resources: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'resources',
  });

  const handleAdd = () => {
    append({
      id: `resource-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      link: '',
      description: '',
      file: undefined,
    });
  };

  const handleRemove = (index: number) => {
    if (fields.length > 0) {
      remove(index);
      toast.success('Resource removed');
    }
  };

  const onSubmit = async (data: ResourcesFormData) => {
    try {
      if (onSave) {
        await onSave(data);
        toast.success('Resources saved successfully');
      }
    } catch {
      toast.error('Failed to save resources. Please try again.');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        {/* Header */}
        <div>
          <h3 className='text-lg font-medium text-white'>
            Resources for Participants
          </h3>
          <p className='mt-1 text-sm text-zinc-500'>
            Provide helpful resources, documentation, or guides for your
            hackathon participants
          </p>
        </div>

        {/* Resources List */}
        <div className='space-y-4'>
          {fields.length === 0 ? (
            <div className='flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-800 bg-zinc-900/30 p-12'>
              <FileText className='mb-4 h-12 w-12 text-zinc-600' />
              <p className='mb-2 text-sm font-medium text-white'>
                No resources added yet
              </p>
              <p className='mb-4 text-sm text-zinc-500'>
                Add resources to help participants succeed in your hackathon
              </p>
              <Button
                type='button'
                variant='outline'
                onClick={handleAdd}
                className='hover:border-primary hover:bg-primary/5 hover:text-primary border-zinc-700'
              >
                <Plus className='mr-2 h-4 w-4' />
                Add Resource
              </Button>
            </div>
          ) : (
            <>
              {fields.map((resource, index) => (
                <ResourceRow
                  key={resource.id}
                  resource={resource}
                  index={index}
                  onRemove={handleRemove}
                  canRemove={fields.length > 0}
                  control={form.control}
                />
              ))}

              {/* Add More Button */}
              <Button
                type='button'
                variant='outline'
                onClick={handleAdd}
                className='hover:border-primary hover:bg-primary/5 hover:text-primary h-11 w-full border-dashed border-zinc-700 text-zinc-400'
              >
                <Plus className='mr-2 h-4 w-4' />
                Add More Resources
              </Button>
            </>
          )}
        </div>

        {/* Validation Message */}
        {form.formState.errors.resources && (
          <div className='flex items-center gap-2 rounded-lg border border-red-900/50 bg-red-500/5 p-3 text-sm text-red-400'>
            <Trash2 className='h-4 w-4' />
            {form.formState.errors.resources.message}
          </div>
        )}

        {/* Submit */}
        <div className='flex items-center justify-between border-t border-zinc-800 pt-6'>
          <p className='text-sm text-zinc-500'>
            {fields.length === 0
              ? 'No resources added (optional)'
              : `${fields.length} resource${fields.length !== 1 ? 's' : ''} added`}
          </p>
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
