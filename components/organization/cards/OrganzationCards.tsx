'use client';

import { ArrowRight, HandCoins, Trophy } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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
}

export default function OrganizationCard({
  id,
  name,
  logo,
  createdAt,
  hackathons,
  grants,
}: OrganizationCardProps) {
  const router = useRouter();
  return (
    <TooltipProvider>
      <section
        onClick={() => router.push(`/organizations/${id}/settings`)}
        className='hover:shadow-primary/10 cursor-pointer rounded-lg border border-zinc-800 bg-black transition-shadow duration-300 hover:shadow-lg'
      >
        <div className='flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 md:px-5 md:py-4'>
          <div className='flex min-w-0 flex-1 items-center gap-3'>
            <Image
              src={logo || '/placeholder.svg'}
              alt={`${name} Logo`}
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

            <ArrowRight className='text-primary ml-2 h-4 w-4 flex-shrink-0' />
          </div>
        </div>
      </section>
    </TooltipProvider>
  );
}
