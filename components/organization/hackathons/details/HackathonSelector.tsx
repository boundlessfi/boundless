'use client';

import React, { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface Hackathon {
  id: string;
  title: string;
  status: 'draft' | 'ongoing' | 'completed';
  href: string;
}

interface HackathonSelectorProps {
  hackathons?: Hackathon[];
  currentHackathon?: Hackathon;
  onHackathonChange?: (hackathonId: string) => void;
  onToggle?: (isOpen: boolean) => void;
}

export default function HackathonSelector({
  hackathons = [],
  currentHackathon,
  onHackathonChange,
  onToggle,
}: HackathonSelectorProps) {
  const router = useRouter();
  const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | null>(
    currentHackathon || hackathons[0] || null
  );
  const [isOpen, setIsOpen] = useState(false);

  React.useEffect(() => {
    if (currentHackathon) {
      if (!selectedHackathon || selectedHackathon.id !== currentHackathon.id) {
        setSelectedHackathon(currentHackathon);
      }
    } else if (hackathons.length > 0 && !selectedHackathon) {
      setSelectedHackathon(hackathons[0]);
    }
  }, [currentHackathon, hackathons, selectedHackathon]);

  React.useEffect(() => {
    if (currentHackathon && hackathons.length > 0) {
      const foundHackathon = hackathons.find(
        hackathon => hackathon.id === currentHackathon.id
      );
      if (!foundHackathon) {
        setSelectedHackathon(hackathons[0]);
        onHackathonChange?.(hackathons[0].id);
      }
    }
  }, [currentHackathon, hackathons, onHackathonChange]);

  const handleHackathonSelect = (hackathon: Hackathon) => {
    setSelectedHackathon(hackathon);
    onHackathonChange?.(hackathon.id);
    setIsOpen(false);
    onToggle?.(false);

    if (hackathon.href && hackathon.href !== '#') {
      router.push(hackathon.href);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    onToggle?.(open);
  };

  if (hackathons.length === 0) {
    return null;
  }

  if (!selectedHackathon) {
    return (
      <div className='flex items-center gap-3 bg-transparent px-3 py-2'>
        <div className='h-10 w-10 animate-pulse rounded bg-gray-300' />
        <span className='text-sm font-medium text-gray-400'>Loading...</span>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing':
        return 'bg-green-500';
      case 'completed':
        return 'bg-gray-500';
      case 'draft':
      default:
        return 'bg-yellow-500';
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger
        asChild
        className='focus:ring-0 focus-visible:ring-0'
      >
        <Button className='flex w-full items-center gap-3 bg-transparent px-3 py-2 transition-colors hover:bg-transparent focus:ring-0 focus-visible:ring-0'>
          <div
            className={`h-2 w-2 rounded-full ${getStatusColor(selectedHackathon.status)}`}
          />

          <span className='max-w-[200px] truncate text-sm font-medium text-white'>
            {selectedHackathon.title || 'Select Hackathon'}
          </span>

          <div className='ml-auto flex flex-col gap-0'>
            <ChevronsUpDown className='m-0 h-4 w-4 p-0 text-white' />
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className='w-[280px] rounded-lg border border-[#2B2B2B] bg-[#1A1A1A] p-2 shadow-lg'
        align='start'
      >
        {hackathons.map(hackathon => (
          <DropdownMenuItem
            key={hackathon.id}
            onClick={() => handleHackathonSelect(hackathon)}
            className='flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 hover:bg-[#252525] focus:bg-[#252525]'
          >
            <div
              className={`h-2 w-2 flex-shrink-0 rounded-full ${getStatusColor(hackathon.status)}`}
            />

            <div className='flex flex-1 flex-col gap-0.5'>
              <span className='text-sm font-medium text-white'>
                {hackathon.title}
              </span>
              <span className='text-xs text-gray-400 capitalize'>
                {hackathon.status}
              </span>
            </div>

            {selectedHackathon && selectedHackathon.id === hackathon.id && (
              <Check className='text-primary h-4 w-4' />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
