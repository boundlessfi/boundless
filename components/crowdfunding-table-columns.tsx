'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowUpDown, MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ColumnDef } from '@tanstack/react-table';
import { DeleteCampaignAlert } from '@/components/delete-campaign-alert';
import { CrowdfundingCampaign } from '@/lib/api/types';
import { campaignStatus, TONE_PILL } from '@/lib/crowdfunding/status';

export const getCrowdfundingTableColumns = (
  onDeleteSuccess?: () => void
): ColumnDef<CrowdfundingCampaign>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={value => row.toggleSelected(!!value)}
        aria-label='Select row'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'project.title',
    accessorKey: 'project.title',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='text-foreground hover:bg-muted/50 h-auto p-0 font-medium'
        >
          Title
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      );
    },
    cell: ({ row }) => {
      const project = row.original.project;
      return (
        <div className='flex items-center space-x-3'>
          {project.logo && (
            <img
              src={project.logo}
              alt={project.title}
              className='h-8 w-8 rounded-lg object-cover'
            />
          )}
          <div>
            <div className='text-foreground font-medium'>{project.title}</div>
          </div>
        </div>
      );
    },
  },
  {
    id: 'project.category',
    accessorKey: 'project.category',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='text-foreground hover:bg-muted/50 h-auto p-0 font-medium'
        >
          Category
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      );
    },
    cell: ({ row }) => {
      const category = row.original.project.category;
      return (
        <Badge variant='secondary' className='bg-muted text-muted-foreground'>
          {category}
        </Badge>
      );
    },
  },
  {
    id: 'v2Status',
    accessorKey: 'v2Status',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='text-foreground hover:bg-muted/50 h-auto p-0 font-medium'
        >
          Status
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      );
    },
    cell: ({ row }) => {
      // Show the campaign lifecycle status (v2Status), not the underlying
      // project status (which is IDEA for fresh drafts). Plain labels come
      // from the shared status helper so every surface stays consistent.
      const meta = campaignStatus(
        (row.original as { v2Status?: string }).v2Status
      );
      return (
        <Badge variant='outline' className={TONE_PILL[meta.tone]}>
          {meta.label}
        </Badge>
      );
    },
  },
  {
    id: 'fundingRaised',
    accessorKey: 'fundingRaised',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='text-foreground hover:bg-muted/50 h-auto p-0 font-medium'
        >
          Funding Progress
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      );
    },
    cell: ({ row }) => {
      const fundingRaised = row.original.fundingRaised;
      const fundingGoal = row.original.fundingGoal;
      const currency = row.original.fundingCurrency;
      const progress =
        fundingGoal > 0 ? (fundingRaised / fundingGoal) * 100 : 0;

      return (
        <div className='space-y-2'>
          <div className='text-foreground text-sm font-medium'>
            {fundingRaised.toLocaleString()} / {fundingGoal.toLocaleString()}{' '}
            {currency}
          </div>
          <Progress value={progress} className='bg-muted h-2' />
          <div className='text-muted-foreground text-xs'>
            {progress.toFixed(1)}% funded
          </div>
        </div>
      );
    },
  },
  {
    id: 'fundingEndDate',
    accessorKey: 'fundingEndDate',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='text-foreground hover:bg-muted/50 h-auto p-0 font-medium'
        >
          Deadline
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      );
    },
    cell: ({ row }) => {
      // The funding deadline is only set once a campaign goes live (after the
      // community vote). Drafts and pre-funding campaigns have no deadline.
      const raw = row.original.fundingEndDate;
      const endDate = raw ? new Date(raw) : null;
      if (!endDate || isNaN(endDate.getTime())) {
        return <span className='text-muted-foreground text-sm'>Not set</span>;
      }
      const now = new Date();
      const daysLeft = Math.ceil(
        (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      return (
        <div className='text-sm'>
          <div className='text-foreground'>
            {format(endDate, 'MMM dd, yyyy')}
          </div>
          <div
            className={`text-xs ${daysLeft < 0 ? 'text-error-400' : daysLeft < 7 ? 'text-warning-400' : 'text-muted-foreground'}`}
          >
            {daysLeft < 0
              ? `${Math.abs(daysLeft)} days ago`
              : `${daysLeft} days left`}
          </div>
        </div>
      );
    },
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='text-foreground hover:bg-muted/50 h-auto p-0 font-medium'
        >
          Created
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className='text-foreground text-sm'>
          {format(new Date(row.original.createdAt), 'MMM dd, yyyy')}
        </div>
      );
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const campaign = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='hover:bg-muted/50 h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align='end'
            className='bg-background border-border'
          >
            <DropdownMenuLabel className='text-foreground'>
              Actions
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(campaign.id)}
              className='text-foreground hover:bg-muted/50'
            >
              Copy campaign ID
            </DropdownMenuItem>
            <DropdownMenuSeparator className='bg-border' />
            <DropdownMenuItem
              asChild
              className='text-foreground hover:bg-muted/50'
            >
              <Link href={`/me/crowdfunding/${campaign.slug}`}>
                <Eye className='mr-2 h-4 w-4' />
                View Campaign
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              asChild
              className='text-foreground hover:bg-muted/50'
            >
              <Link href={`/crowdfunding/new?campaignId=${campaign.id}`}>
                <Edit className='mr-2 h-4 w-4' />
                Edit Campaign
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              // asChild
              className='text-error-400 hover:bg-error-400/10'
            >
              <DeleteCampaignAlert
                campaignId={campaign.id}
                campaignTitle={campaign.project.title}
                onSuccess={onDeleteSuccess}
              >
                <div className='text-reds-500 tsext-sm psx-2 flex cursor-pointer items-center'>
                  <Trash2 className='text-red-4s00 mr-2 h-4 w-4' />
                  Delete Campaign
                </div>
              </DeleteCampaignAlert>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
