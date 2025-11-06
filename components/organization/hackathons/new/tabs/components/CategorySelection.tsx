import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Control } from 'react-hook-form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

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
        <FormItem className='gap-3'>
          <FormLabel className='text-sm'>
            Category <span className='text-error-400'>*</span>
          </FormLabel>
          <FormControl>
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              className='flex flex-wrap gap-3'
            >
              {categories.map(category => (
                <div
                  key={category}
                  className={cn(
                    'flex w-fit items-center space-x-3 rounded-[6px] border border-[#2B2B2B] bg-[#2B2B2B3D] p-3',
                    field.value === category && 'bg-[#A7F9501F]'
                  )}
                >
                  <RadioGroupItem
                    value={category}
                    id={category}
                    className={cn(
                      'text-primary border-[#B5B5B5] bg-transparent',
                      field.value === category && 'border-primary'
                    )}
                  />
                  <Label
                    htmlFor={category}
                    className={cn(
                      'cursor-pointer text-sm font-normal',
                      field.value === category
                        ? 'text-primary'
                        : 'text-[#B5B5B5]'
                    )}
                  >
                    {category}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </FormControl>
          <FormMessage className='text-error-400 text-xs' />
        </FormItem>
      )}
    />
  );
}
