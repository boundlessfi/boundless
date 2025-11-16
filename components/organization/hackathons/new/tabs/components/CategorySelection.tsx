import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Control } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

const categories = [
  'DeFi',
  'NFTs',
  'DAOs',
  'Layer 2',
  'Cross-chain',
  'Web3 Gaming',
  'Social Tokens',
  'Infrastructure',
  'Privacy',
  'Sustainability',
  'Real World Assets',
  'Other',
];

interface CategorySelectionProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  name: string;
}

export default function CategorySelection({
  control,
  name,
}: CategorySelectionProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className='text-sm font-medium text-white'>
            Categories <span className='text-red-500'>*</span>
          </FormLabel>
          <p className='mb-3 text-sm text-zinc-500'>
            Select all categories that apply to your hackathon
          </p>

          <FormControl>
            <div className='flex flex-wrap gap-2'>
              {categories.map(category => {
                const isChecked = Array.isArray(field.value)
                  ? field.value.includes(category)
                  : false;

                return (
                  <button
                    key={category}
                    type='button'
                    onClick={() => {
                      const currentValue = Array.isArray(field.value)
                        ? field.value
                        : [];
                      if (isChecked) {
                        field.onChange(
                          currentValue.filter(cat => cat !== category)
                        );
                      } else {
                        field.onChange([...currentValue, category]);
                      }
                    }}
                    className={cn(
                      'group flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all',
                      isChecked
                        ? 'border-primary/50 bg-primary/10 text-primary shadow-primary/10 shadow-sm'
                        : 'border-zinc-800 bg-zinc-900/30 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900/50 hover:text-zinc-300'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-4 w-4 items-center justify-center rounded border transition-all',
                        isChecked
                          ? 'border-primary bg-primary'
                          : 'border-zinc-700 bg-transparent group-hover:border-zinc-600'
                      )}
                    >
                      {isChecked && (
                        <Check className='h-3 w-3 text-black' strokeWidth={3} />
                      )}
                    </div>
                    <span>{category}</span>
                  </button>
                );
              })}
            </div>
          </FormControl>

          <FormMessage className='text-xs text-red-500' />
        </FormItem>
      )}
    />
  );
}
