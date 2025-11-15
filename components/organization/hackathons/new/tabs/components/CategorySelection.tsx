import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Control } from 'react-hook-form';
import { Checkbox } from '@/components/ui/checkbox';
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
            Categories <span className='text-error-400'>*</span>
          </FormLabel>
          <FormControl>
            <div className='flex flex-wrap gap-3'>
              {categories.map(category => {
                const isChecked = Array.isArray(field.value)
                  ? field.value.includes(category)
                  : false;

                return (
                  <div
                    key={category}
                    className={cn(
                      'flex w-fit items-center space-x-3 rounded-[6px] border border-[#2B2B2B] bg-[#2B2B2B3D] p-3 transition-colors',
                      isChecked && 'border-primary bg-[#A7F9501F]'
                    )}
                  >
                    <Checkbox
                      id={category}
                      checked={isChecked}
                      onCheckedChange={checked => {
                        const currentValue = Array.isArray(field.value)
                          ? field.value
                          : [];
                        if (checked) {
                          field.onChange([...currentValue, category]);
                        } else {
                          field.onChange(
                            currentValue.filter(cat => cat !== category)
                          );
                        }
                      }}
                      className={cn(
                        'border-[#B5B5B5] bg-transparent',
                        isChecked && 'border-primary'
                      )}
                    />
                    <Label
                      htmlFor={category}
                      className={cn(
                        'cursor-pointer text-sm font-normal',
                        isChecked ? 'text-primary' : 'text-[#B5B5B5]'
                      )}
                    >
                      {category}
                    </Label>
                  </div>
                );
              })}
            </div>
          </FormControl>
          <FormMessage className='text-error-400 text-xs' />
        </FormItem>
      )}
    />
  );
}
