'use client';

import {
  MoreVertical,
  HandCoins,
  Trophy,
  Calendar,
  Edit,
  Archive,
  Trash2,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface OrganizationCardProps {
  id: string;
  name: string;
  logo: string;
  createdAt: string;
  hackathons: {
    count: number;
    submissions: number;
  };
  grants: {
    count: number;
    applications: number;
  };
  onEdit?: (id: string) => void;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function OrganizationCard({
  id,
  name,
  logo,
  createdAt,
  hackathons,
  grants,
  onEdit,
  onArchive,
  onDelete,
}: OrganizationCardProps) {
  const router = useRouter();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(id);
    } else {
      router.push(`/organizations/${id}/edit`);
    }
  };

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onArchive) {
      onArchive(id);
    } else {
      if (confirm('Are you sure you want to archive this organization?')) {
        // TODO: Implement archive functionality
      }
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(id);
    } else {
      if (confirm('Are you sure you want to delete this organization?')) {
        // TODO: Implement delete functionality
      }
    }
  };

  return (
    <TooltipProvider>
      <div
        onClick={() => router.push(`/organizations/${id}`)}
        className='group hover:shadow-primary/10 relative cursor-pointer overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-black transition-all duration-300 hover:border-zinc-700 hover:shadow-2xl'
      >
        {/* Animated gradient overlay on hover */}
        <div className='pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100'>
          <div className='from-primary/5 absolute inset-0 bg-gradient-to-r via-transparent to-purple-500/5'></div>
        </div>

        <div className='relative p-6'>
          {/* Header Section */}
          <div className='mb-6 flex items-start justify-between'>
            <div className='flex items-center gap-4'>
              {/* Logo with glow effect */}
              <div className='relative'>
                <div className='bg-primary/20 absolute inset-0 rounded-xl opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100'></div>
                <div className='relative h-16 w-16 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 transition-all duration-300 group-hover:scale-105 group-hover:border-zinc-700'>
                  <Image
                    src={logo || '/placeholder.svg'}
                    alt={`${name} logo`}
                    width={48}
                    height={48}
                    className='h-full w-full object-contain'
                  />
                </div>
              </div>

              {/* Organization Info */}
              <div className='flex flex-col gap-1'>
                <h3 className='group-hover:text-primary text-xl font-bold text-white transition-colors'>
                  {name}
                </h3>
                <div className='flex items-center gap-2 text-sm text-zinc-500'>
                  <Calendar className='h-3.5 w-3.5' />
                  <span>Created {formatDate(createdAt)}</span>
                </div>
              </div>
            </div>

            {/* More options dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  onClick={e => e.stopPropagation()}
                  className='focus:ring-primary/50 flex h-10 w-10 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-zinc-400 transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white focus:ring-2 focus:outline-none'
                  title='More options'
                >
                  <MoreVertical className='h-5 w-5' />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align='end'
                className='w-48 border-zinc-800 bg-zinc-950'
                onClick={e => e.stopPropagation()}
              >
                <DropdownMenuItem
                  onClick={handleEdit}
                  className='focus:bg-primary cursor-pointer text-zinc-300 focus:text-black'
                >
                  <Edit className='mr-2 h-4 w-4' />
                  Edit Organization
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleArchive}
                  className='cursor-pointer text-zinc-300 focus:bg-zinc-800 focus:text-white'
                >
                  <Archive className='mr-2 h-4 w-4' />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDelete}
                  className='cursor-pointer text-red-400 focus:bg-red-500/10 focus:text-red-300'
                >
                  <Trash2 className='mr-2 h-4 w-4' />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Stats Section */}
          <div className='grid grid-cols-2 gap-4'>
            {/* Hackathons Stat */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className='group/stat hover:border-primary/50 cursor-help rounded-xl border border-zinc-800 bg-black/50 p-4 backdrop-blur-sm transition-all duration-300 hover:bg-zinc-900/50'>
                  <div className='mb-3 flex items-center gap-2'>
                    <div className='from-primary/20 to-primary/5 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br transition-transform duration-300 group-hover/stat:scale-110'>
                      <Trophy className='text-primary h-4 w-4' />
                    </div>
                    <span className='text-xs font-medium tracking-wider text-zinc-500 uppercase'>
                      Hackathons
                    </span>
                  </div>
                  <div className='flex items-baseline gap-2'>
                    <span className='text-3xl font-bold text-white'>
                      {hackathons.count}
                    </span>
                    <span className='text-sm text-zinc-500'>total</span>
                  </div>
                  {hackathons.submissions > 0 && (
                    <div className='mt-2 text-xs text-zinc-600'>
                      {hackathons.submissions} submissions
                    </div>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent
                side='bottom'
                className='border-zinc-800 bg-zinc-900'
              >
                <p className='text-sm font-medium text-white'>
                  {hackathons.count}{' '}
                  {hackathons.count === 1 ? 'Hackathon' : 'Hackathons'}
                </p>
                <p className='text-xs text-zinc-400'>
                  {hackathons.submissions} total submissions
                </p>
              </TooltipContent>
            </Tooltip>

            {/* Grants Stat */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className='group/stat hover:border-primary/50 cursor-help rounded-xl border border-zinc-800 bg-black/50 p-4 backdrop-blur-sm transition-all duration-300 hover:bg-zinc-900/50'>
                  <div className='mb-3 flex items-center gap-2'>
                    <div className='from-primary/20 to-primary/5 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br transition-transform duration-300 group-hover/stat:scale-110'>
                      <HandCoins className='text-primary h-4 w-4' />
                    </div>
                    <span className='text-xs font-medium tracking-wider text-zinc-500 uppercase'>
                      Grants
                    </span>
                  </div>
                  <div className='flex items-baseline gap-2'>
                    <span className='text-3xl font-bold text-white'>
                      {grants.count}
                    </span>
                    <span className='text-sm text-zinc-500'>total</span>
                  </div>
                  {grants.applications > 0 && (
                    <div className='mt-2 text-xs text-zinc-600'>
                      {grants.applications} applications
                    </div>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent
                side='bottom'
                className='border-zinc-800 bg-zinc-900'
              >
                <p className='text-sm font-medium text-white'>
                  {grants.count} {grants.count === 1 ? 'Grant' : 'Grants'}
                </p>
                <p className='text-xs text-zinc-400'>
                  {grants.applications} total applications
                </p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Bottom accent line */}
          <div className='via-primary absolute right-0 bottom-0 left-0 h-0.5 bg-gradient-to-r from-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100'></div>
        </div>
      </div>
    </TooltipProvider>
  );
}
