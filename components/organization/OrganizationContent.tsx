'use client';
import { Search, ArrowUpDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import OrganizationCard from './cards/OrganzationCards';
import Link from 'next/link';
import { BoundlessButton } from '../buttons';
import { useOrganization } from '@/lib/providers/OrganizationProvider';
import LoadingSpinner from '../LoadingSpinner';

export default function OrganizationContent() {
  const { organizations, isLoading, isLoadingOrganizations } =
    useOrganization();
  const loading = isLoading || isLoadingOrganizations;
  const hasOrganizations = organizations.length > 0;

  if (loading) {
    return (
      <main className='flex h-[70vh] items-center justify-center'>
        <div className='flex flex-col items-center gap-3 text-zinc-400'>
          <LoadingSpinner size='lg' color='primary' variant='spinner' />
          <p className='text-sm text-zinc-400'>Loading organizations...</p>
        </div>
      </main>
    );
  }

  return (
    <main className=''>
      {hasOrganizations && (
        <section className='mb-8 hidden border-b border-b-zinc-800 px-8 md:block'>
          <div className='mx-auto flex max-w-5xl items-center gap-4'>
            <div className='relative flex-1'>
              <Search className='absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-zinc-500' />
              <Input
                type='text'
                placeholder='Search organization, hackathon, or grants'
                className='focus-visible:border-primary focus-visible:ring-primary w-full rounded-lg border-zinc-800 bg-zinc-900 py-6 pr-4 pl-12 text-white placeholder:text-zinc-500 focus-visible:ring-[1px]'
              />
            </div>
            <Button
              variant='outline'
              className='text- hover:text-primary rounded-lg border-zinc-800 bg-black px-6 py-6 hover:bg-transparent'
            >
              <ArrowUpDown className='h-4 w-4' />
              Sort
            </Button>
            {hasOrganizations && (
              <div className='flex h-23 items-center border-l border-l-zinc-800 pl-4'>
                <Link href='/organizations/new'>
                  <BoundlessButton
                    variant='default'
                    iconPosition='right'
                    icon={<Plus className='h-4 w-4' />}
                    className='rounded-lg px-6 py-6 text-black'
                  >
                    Add Organization
                  </BoundlessButton>
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      <section className='mx-auto max-w-5xl px-8 py-8 md:px-0'>
        {hasOrganizations && (
          <div className='grid grid-cols-1 gap-6'>
            {organizations.map(org => (
              <Link href={`/organizations/${org._id}/settings`} key={org._id}>
                <OrganizationCard
                  id={org._id}
                  name={org.name}
                  logo={org.logo}
                  createdAt={org.createdAt}
                  hackathons={{ count: 0, submissions: 0 }}
                  grants={{ count: 0, applications: 0 }}
                />
              </Link>
            ))}
          </div>
        )}

        {!hasOrganizations && (
          <div className='border-active-bg2 mx-8 flex items-center justify-center rounded-lg border-1 border-dashed p-32'>
            <Link href='/organizations/new'>
              <button className='text-primary hover:text-primary flex items-center gap-2 font-medium transition-colors'>
                <span>Add Organization</span>
                <Plus className='h-5 w-5' size={100} />
              </button>
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
