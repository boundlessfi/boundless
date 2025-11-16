'use client';

import {
  MoreVertical,
  HandCoins,
  Trophy,
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
import Link from 'next/link';

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
        console.log('Archive organization:', id);
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
        console.log('Delete organization:', id);
        // TODO: Implement delete functionality
      }
    }
  };

  return (
    <TooltipProvider>
      <Link href={`/organizations/${id}/settings`}>
        <section className='hover:shadow-primary/10 cursor-pointer rounded-lg border border-zinc-800 bg-black transition-shadow duration-300 hover:shadow-lg'>
          <div className='flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 md:px-5 md:py-4'>
            <div className='flex min-w-0 flex-1 items-center gap-3'>
              <Image
                src={logo || '/placeholder.svg'}
                alt={`Org Logo`}
                width={40}
                height={40}
                className='flex-shrink-0 rounded-lg object-contain'
              />
              <div className='min-w-0'>
                <h3 className='truncate text-sm font-semibold text-white'>
                  {name}
                </h3>
                <p className='text-xs text-zinc-500'>
                  {new Date(createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className='ml-4 flex items-center gap-2'>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className='flex cursor-help items-center gap-1.5 rounded-lg border border-zinc-800 bg-black px-2.5 py-1.5 transition-colors hover:border-lime-500/50'>
                    <div className='bg-active-bg grid h-5 w-5 place-content-center rounded border-[0.5px] border-[rgba(167,249,80,0.24)]'>
                      <Trophy className='text-primary h-2.5 w-2.5' />
                    </div>
                    <span className='text-xs font-medium text-white'>
                      {hackathons.count}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className='text-xs'>
                    {hackathons.count} hackathons ({hackathons.submissions}{' '}
                    submissions)
                  </p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className='flex cursor-help items-center gap-1.5 rounded-lg border border-zinc-800 bg-black px-2.5 py-1.5 transition-colors hover:border-lime-500/50'>
                    <div className='bg-active-bg grid h-5 w-5 place-content-center rounded border-[0.5px] border-[rgba(167,249,80,0.24)]'>
                      <HandCoins className='text-primary h-2.5 w-2.5' />
                    </div>
                    <span className='text-xs font-medium text-white'>
                      {grants.count}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className='text-xs'>
                    {grants.count} grants ({grants.applications} applications)
                  </p>
                </TooltipContent>
              </Tooltip>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    onClick={e => e.stopPropagation()}
                    className='ml-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-800/50 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white'
                    title='More options'
                  >
                    <MoreVertical className='h-4 w-4' />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align='end'
                  className='w-40 border-zinc-800 bg-black'
                >
                  <DropdownMenuItem
                    onClick={handleEdit}
                    className='hover:bg-primary cursor-pointer text-zinc-300 hover:text-black focus:text-black'
                  >
                    <Edit className='mr-2 h-4 w-4' />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleArchive}
                    className='cursor-pointer text-zinc-300 hover:text-black focus:text-black'
                  >
                    <Archive className='mr-2 h-4 w-4' />
                    Archive
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className='cursor-pointer text-red-400 hover:text-red-300 focus:text-red-300'
                  >
                    <Trash2 className='mr-2 h-4 w-4' />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </section>
      </Link>
    </TooltipProvider>
  );
}
