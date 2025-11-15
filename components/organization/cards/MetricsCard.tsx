import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Triangle } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

interface MetricsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  showTrend?: boolean;
}

const MetricsCard = ({
  title,
  value,
  subtitle,
  icon = '/user-border.svg',
  showTrend = false,
}: MetricsCardProps) => {
  const formattedValue =
    typeof value === 'number' ? value.toLocaleString() : value;

  return (
    <Card
      className='bg-background/8 flex w-full flex-row items-center rounded-[8px] border border-gray-900 bg-bottom-right bg-no-repeat p-5 text-white'
      style={{ backgroundImage: 'url("/metric-image.svg")' }}
    >
      <CardHeader className='h-10 w-10 p-0'>
        <Image
          src={icon}
          alt='Metrics'
          width={40}
          height={40}
          className='h-10 w-10'
        />
      </CardHeader>
      <CardContent className='p-0'>
        <h5 className='text-xs text-gray-400'>{title}</h5>
        <span className='flex items-center gap-2 text-sm'>
          {showTrend && (
            <Triangle className='fill-error-400 text-error-400 h-4 w-4 rotate-180' />
          )}{' '}
          {formattedValue}
        </span>
        {subtitle && <span className='text-xs text-gray-400'>{subtitle}</span>}
      </CardContent>
    </Card>
  );
};

export default MetricsCard;
