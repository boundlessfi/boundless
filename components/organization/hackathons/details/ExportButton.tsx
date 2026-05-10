'use client';

import React, { useState } from 'react';
import {
  Download,
  FileText,
  Table,
  Loader2,
  ChevronRight,
  FileJson,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { exportHackathon } from '@/lib/api/hackathons/rewards';
import { toast } from 'sonner';

interface ExportButtonProps {
  organizationId: string;
  hackathonId: string;
  hackathonName?: string;
}

const DATASETS = [
  { id: 'full', label: 'Full Report', description: 'All sections included' },
  { id: 'overview', label: 'Overview', description: 'Metrics & status' },
  {
    id: 'participants',
    label: 'Participants',
    description: 'User list & contact',
  },
  {
    id: 'submissions',
    label: 'Submissions',
    description: 'Project links & scores',
  },
  { id: 'prize_tiers', label: 'Prize Tiers', description: 'Rewards & logic' },
  {
    id: 'winners',
    label: 'Winners',
    description: 'Wallet address, activation & USDC trustline',
  },
] as const;

export function ExportButton({
  organizationId,
  hackathonId,
  hackathonName = 'hackathon',
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (
    format: 'csv' | 'pdf',
    dataset: (typeof DATASETS)[number]['id']
  ) => {
    if (isExporting) return;

    setIsExporting(true);
    const toastId = toast.loading(
      `Preparing ${format.toUpperCase()} export...`
    );

    try {
      const blob = await exportHackathon(
        organizationId,
        hackathonId,
        format,
        dataset
      );

      // Create a link and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${hackathonName.toLowerCase().replace(/\s+/g, '-')}-${dataset}-${timestamp}.${format}`;

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Export downloaded successfully', { id: toastId });
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export data. Please try again.', { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className='h-9 gap-2 border-zinc-800 bg-zinc-950 px-4 text-zinc-400 hover:bg-zinc-900 hover:text-white'
          disabled={isExporting}
        >
          {isExporting ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <Download className='h-4 w-4' />
          )}
          <span>Export Data</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        className='w-56 border-zinc-800 bg-zinc-950 text-zinc-300'
      >
        <DropdownMenuLabel className='text-xs font-semibold tracking-wider text-zinc-500 uppercase'>
          Choose Format
        </DropdownMenuLabel>
        <DropdownMenuSeparator className='bg-zinc-800' />

        {/* CSV Export */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className='gap-2 focus:bg-zinc-900 focus:text-white'>
            <Table className='h-4 w-4 text-emerald-500' />
            <span>CSV Spreadsheet</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className='w-64 border-zinc-800 bg-zinc-950 text-zinc-300'>
              <DropdownMenuLabel className='text-xs text-zinc-500'>
                Include Dataset
              </DropdownMenuLabel>
              <DropdownMenuSeparator className='bg-zinc-800' />
              {DATASETS.map(ds => (
                <DropdownMenuItem
                  key={ds.id}
                  className='flex flex-col items-start gap-1 py-2 focus:bg-zinc-900 focus:text-white'
                  onClick={() => handleExport('csv', ds.id)}
                >
                  <span className='font-medium'>{ds.label}</span>
                  <span className='text-[10px] text-zinc-500'>
                    {ds.description}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        {/* PDF Export */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className='gap-2 focus:bg-zinc-900 focus:text-white'>
            <FileText className='h-4 w-4 text-rose-500' />
            <span>Branded PDF</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className='w-64 border-zinc-800 bg-zinc-950 text-zinc-300'>
              <DropdownMenuLabel className='text-xs text-zinc-500'>
                Include Dataset
              </DropdownMenuLabel>
              <DropdownMenuSeparator className='bg-zinc-800' />
              {DATASETS.map(ds => (
                <DropdownMenuItem
                  key={ds.id}
                  className='flex flex-col items-start gap-1 py-2 focus:bg-zinc-900 focus:text-white'
                  onClick={() => handleExport('pdf', ds.id)}
                >
                  <span className='font-medium'>{ds.label}</span>
                  <span className='text-[10px] text-zinc-500'>
                    {ds.description}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
