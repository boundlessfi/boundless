'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';
import type { FilterOption } from './filter-options';

interface FilterDropdownProps {
  options: FilterOption[];
  selectedLabel: string;
  onSelect: (value: string) => void;
  showIcon?: boolean;
  size?: 'default' | 'sm';
  className?: string;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  options,
  selectedLabel,
  onSelect,
  showIcon = false,
  size = 'default',
  className,
}) => {
  const buttonSize = size === 'sm' ? 'sm' : undefined;
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          size={buttonSize}
          className={`justify-between rounded-lg border-white/24 bg-transparent px-4 py-2 ${textSize} font-medium text-white hover:bg-gray-800 hover:text-white ${className || ''}`}
        >
          {showIcon ? (
            <div className='flex items-center gap-2'>
              <Image
                src='/sort.svg'
                alt='Sort'
                width={16}
                height={16}
                className='h-4 w-4'
              />
              {selectedLabel}
            </div>
          ) : (
            selectedLabel
          )}
          <ChevronDown className={`ml-2 ${iconSize}`} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='start'
        className='border-white/24 bg-black text-white'
      >
        {options.map(option => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onSelect(option.value)}
            className='cursor-pointer hover:bg-gray-800'
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
