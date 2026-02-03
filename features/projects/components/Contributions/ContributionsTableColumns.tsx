'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Contributor } from '@/features/projects/types';
import { formatNumber } from '@/lib/utils';
import { ExternalLink } from 'lucide-react';
import { getTransactionExplorerUrl } from '@/lib/wallet-utils';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import Link from 'next/link';

export const contributionsTableColumns: ColumnDef<Contributor>[] = [
  {
    accessorKey: 'name',
    header: 'Contributor',
    cell: ({ row }) => {
      const contributor = row.original;
      const isAnonymous = !contributor.name || contributor.name === 'Anonymous';

      if (isAnonymous) {
        return (
          <div className='flex items-center gap-3'>
            <div className='flex size-8 items-center justify-center rounded-full bg-[#2B2B2B]'>
              <span className='text-xs text-gray-600'>?</span>
            </div>
            <span className='text-sm text-gray-600'>Anonymous</span>
          </div>
        );
      }

      const profileUrl = `/profile/${contributor.username}`;

      return (
        <Link
          href={profileUrl}
          className='flex items-center gap-3 transition-opacity hover:opacity-80'
        >
          {contributor.image ? (
            <div
              style={{ backgroundImage: `url(${contributor.image})` }}
              className='size-8 rounded-full bg-white bg-cover bg-center'
            />
          ) : (
            <div className='flex size-8 items-center justify-center rounded-full bg-[#2B2B2B]'>
              <span className='text-xs text-white'>
                {contributor.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className='flex flex-col'>
            <span className='text-sm font-medium text-white'>
              {contributor.name}
            </span>
            {contributor.username && (
              <span className='text-xs text-[#B5B5B5]'>
                @{contributor.username}
              </span>
            )}
          </div>
        </Link>
      );
    },
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => {
      const amount = row.getValue('amount') as number;
      return (
        <div className='font-medium text-white'>
          {formatNumber(amount)} <span className='text-[#B5B5B5]'>USD</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'message',
    header: 'Message',
    cell: ({ row }) => {
      const message = row.original.message;

      if (!message) {
        return <span className='text-sm text-gray-600 italic'>No message</span>;
      }

      return (
        <div className='max-w-[300px]'>
          <p className='line-clamp-2 text-sm text-white'>{message}</p>
        </div>
      );
    },
  },
  {
    accessorKey: 'date',
    header: 'Date',
    cell: ({ row }) => {
      const date = row.getValue('date') as string;
      try {
        return (
          <span className='text-sm text-[#B5B5B5]'>
            {format(new Date(date), 'MMM dd, yyyy')}
          </span>
        );
      } catch {
        return <span className='text-sm text-gray-600'>Invalid date</span>;
      }
    },
  },
  {
    accessorKey: 'transactionHash',
    header: 'Transaction',
    cell: ({ row }) => {
      const txHash = row.getValue('transactionHash') as string;
      const explorerUrl = getTransactionExplorerUrl(txHash);

      return (
        <Button
          variant='ghost'
          size='sm'
          asChild
          className='text-primary hover:text-primary hover:bg-primary/10'
        >
          <a
            href={explorerUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='flex items-center gap-2'
          >
            <span className='text-xs'>View</span>
            <ExternalLink className='h-3 w-3' />
          </a>
        </Button>
      );
    },
  },
];
