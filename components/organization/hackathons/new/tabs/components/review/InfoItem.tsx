import { cn } from '@/lib/utils';

interface InfoItemProps {
  label: string;
  value: string | number | boolean | undefined | null;
  className?: string;
}

export default function InfoItem({ label, value, className }: InfoItemProps) {
  if (value === undefined || value === null || value === '') return null;

  const displayValue =
    typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value);

  return (
    <div className={cn('space-y-1', className)}>
      <p className='text-xs font-medium tracking-wide text-gray-500 uppercase'>
        {label}
      </p>
      <p className='text-sm text-white'>{displayValue}</p>
    </div>
  );
}
