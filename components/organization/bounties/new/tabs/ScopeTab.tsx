import React from 'react';
import dynamic from 'next/dynamic';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';

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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { loadCountries, type Country } from '@/lib/country-utils';
import {
  BOUNTY_CATEGORIES,
  CATEGORY_LABELS,
  scopeSchema,
  type BountyCategory,
  type ScopeFormData,
} from './schemas/scopeSchema';

// Markdown editor for the description, matching the hackathon Info step.
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

interface ScopeTabProps {
  onContinue?: () => void;
  onSave?: (data: ScopeFormData) => Promise<void>;
  initialData?: Partial<ScopeFormData>;
  isLoading?: boolean;
}

const defaultValues: Partial<ScopeFormData> = {
  title: '',
  description: '',
  country: null,
  githubIssueUrl: null,
};

/** Searchable country dropdown; stores the country name. */
/** ISO2 country code -> emoji flag (regional indicator symbols). */
function flagEmoji(iso2: string): string {
  if (!iso2 || iso2.length !== 2) return '';
  const A = 0x1f1e6;
  const code = iso2.toUpperCase();
  return String.fromCodePoint(
    A + code.charCodeAt(0) - 65,
    A + code.charCodeAt(1) - 65
  );
}

function CountryCombobox({
  value,
  onChange,
}: {
  value: string | null | undefined;
  onChange: (value: string | null) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [countries, setCountries] = React.useState<Country[]>([]);
  const selectedCountry = countries.find(c => c.name === value);

  React.useEffect(() => {
    let active = true;
    loadCountries()
      .then(list => {
        if (active) setCountries(list);
      })
      .catch(() => {
        /* non-fatal: the field just shows no options */
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type='button'
          role='combobox'
          aria-expanded={open}
          className='flex h-10 w-full items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 text-sm text-white'
        >
          <span
            className={cn('flex items-center gap-2', !value && 'text-zinc-500')}
          >
            {selectedCountry && (
              <span aria-hidden className='text-base leading-none'>
                {flagEmoji(selectedCountry.iso2)}
              </span>
            )}
            {value || 'Select country'}
          </span>
          <ChevronsUpDown className='h-4 w-4 text-zinc-500' />
        </button>
      </PopoverTrigger>
      <PopoverContent className='w-[--radix-popover-trigger-width] border-zinc-800 bg-zinc-950 p-0'>
        <Command className='bg-zinc-950'>
          <CommandInput
            placeholder='Search country...'
            className='text-white'
          />
          <CommandList>
            <CommandEmpty className='py-4 text-center text-sm text-zinc-500'>
              No country found.
            </CommandEmpty>
            <CommandGroup>
              {countries.map(country => (
                <CommandItem
                  key={country.iso2 || country.name}
                  value={country.name}
                  onSelect={() => {
                    onChange(country.name);
                    setOpen(false);
                  }}
                  className='text-white'
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === country.name ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <span aria-hidden className='mr-2 text-base leading-none'>
                    {flagEmoji(country.iso2)}
                  </span>
                  {country.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default function ScopeTab({
  onContinue,
  onSave,
  initialData,
  isLoading = false,
}: ScopeTabProps) {
  const form = useForm<ScopeFormData>({
    resolver: zodResolver(scopeSchema),
    defaultValues: { ...defaultValues, ...initialData },
  });

  React.useEffect(() => {
    if (initialData) form.reset({ ...defaultValues, ...initialData });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  const category = form.watch('category');
  const isDevelopment = category === 'DEVELOPMENT';

  const onSubmit = async (data: ScopeFormData) => {
    try {
      if (onSave) await onSave(data);
      if (onContinue) onContinue();
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string | string[] } };
        message?: string;
      };
      const message = err.response?.data?.message || err.message;
      const errorMessage = Array.isArray(message) ? message[0] : message;
      toast.error(errorMessage || 'Failed to save scope. Please try again.');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <FormField
          control={form.control}
          name='title'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-sm font-medium text-white'>
                Title<span className='text-red-500'>*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder='e.g. Build a Soroban faucet bot'
                  className='h-10 rounded-lg border-zinc-800 bg-zinc-900/50 text-white'
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage className='text-xs text-red-500' />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-sm font-medium text-white'>
                Description<span className='text-red-500'>*</span>
              </FormLabel>
              <FormControl>
                <div className='overflow-hidden rounded-xl border border-zinc-800'>
                  <MDEditor
                    value={field.value ?? ''}
                    onChange={value => field.onChange(value || '')}
                    height={300}
                    data-color-mode='dark'
                    preview='edit'
                    hideToolbar={false}
                    visibleDragbar={true}
                    textareaProps={{
                      placeholder:
                        'What needs to be built, and what does done look like?\n\nUse markdown for formatting: headings, lists, links, and more.',
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

        {/* Category */}
        <FormField
          control={form.control}
          name='category'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-sm font-medium text-white'>
                Category<span className='text-red-500'>*</span>
              </FormLabel>
              <p className='text-sm text-zinc-500'>
                What kind of work is this bounty for?
              </p>
              <div className='mt-2 flex flex-wrap gap-1.5'>
                {BOUNTY_CATEGORIES.map(c => {
                  const on = field.value === c;
                  return (
                    <button
                      key={c}
                      type='button'
                      onClick={() => field.onChange(c as BountyCategory)}
                      className={cn(
                        'flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors',
                        on
                          ? 'border-primary bg-primary/15 text-primary'
                          : 'border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
                      )}
                    >
                      {on && <Check className='h-3 w-3' strokeWidth={3} />}
                      {CATEGORY_LABELS[c]}
                    </button>
                  );
                })}
              </div>
              <FormMessage className='text-xs text-red-500' />
            </FormItem>
          )}
        />

        <div className='grid gap-6 sm:grid-cols-2'>
          {/* Country */}
          <FormField
            control={form.control}
            name='country'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-sm font-medium text-white'>
                  Country <span className='text-zinc-500'>(optional)</span>
                </FormLabel>
                <FormControl>
                  <CountryCombobox
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage className='text-xs text-red-500' />
              </FormItem>
            )}
          />

          {/* GitHub issue URL — only for development bounties, where it's required */}
          {isDevelopment && (
            <FormField
              control={form.control}
              name='githubIssueUrl'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-sm font-medium text-white'>
                    GitHub issue URL<span className='text-red-500'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='https://github.com/org/repo/issues/123'
                      className='h-10 rounded-lg border-zinc-800 bg-zinc-900/50 text-white'
                      value={field.value ?? ''}
                      onChange={e => field.onChange(e.target.value || null)}
                    />
                  </FormControl>
                  <FormMessage className='text-xs text-red-500' />
                </FormItem>
              )}
            />
          )}
        </div>

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
