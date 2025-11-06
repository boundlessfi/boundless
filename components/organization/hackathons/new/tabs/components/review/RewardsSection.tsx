import React from 'react';
import { RewardsFormData } from '../../schemas/rewardsSchema';
import { Separator } from '@/components/ui/separator';

interface RewardsSectionProps {
  data: RewardsFormData;
  onEdit?: () => void;
}

const formatAmount = (
  amount: string | number,
  currency: string = 'USDC'
): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
  return `$ ${formatted} ${currency}`;
};

export default function RewardsSection({ data, onEdit }: RewardsSectionProps) {
  if (!data.prizeTiers || data.prizeTiers.length === 0) return null;

  const totalPool = data.prizeTiers.reduce<number>(
    (sum, tier) => sum + parseFloat(String(tier.prizeAmount || 0)),
    0
  );

  return (
    <div className='space-y-4'>
      {/* Prize Pool */}
      <div className='flex items-center justify-between'>
        <p className='text-sm font-medium text-white'>Prize Pool:</p>
        <p className='text-sm font-medium text-white'>
          {formatAmount(totalPool, 'USDC')}
        </p>
      </div>

      {/* Prize Tiers */}
      {data.prizeTiers.map((tier, idx: number) => (
        <React.Fragment key={tier.id || idx}>
          <Separator className='bg-gray-900' />
          <div className='space-y-2'>
            <p className='text-sm font-medium text-white'>{tier.place}:</p>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-1'>
                <p className='text-xs font-medium text-white'>Reward</p>
                <p className='text-sm text-white'>
                  {formatAmount(tier.prizeAmount, tier.currency || 'USDC')}
                </p>
              </div>
              <div className='space-y-1'>
                <p className='text-xs font-medium text-white'>Pass mark</p>
                <p className='text-sm text-white'>{tier.passMark}%</p>
              </div>
            </div>
          </div>
        </React.Fragment>
      ))}

      {onEdit && (
        <button
          onClick={onEdit}
          className='text-primary mt-2 text-sm hover:underline'
        >
          Edit Rewards
        </button>
      )}
    </div>
  );
}
