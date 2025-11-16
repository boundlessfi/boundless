'use client';
import {
  Search,
  ArrowUpDown,
  Plus,
  Building2,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
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
        <div className='flex flex-col items-center gap-4'>
          <div className='relative'>
            <LoadingSpinner size='lg' color='primary' variant='spinner' />
            <div className='absolute inset-0 animate-ping opacity-20'>
              <LoadingSpinner size='lg' color='primary' variant='spinner' />
            </div>
          </div>
          <div className='text-center'>
            <p className='text-sm font-medium text-zinc-300'>
              Loading organizations
            </p>
            <p className='text-xs text-zinc-500'>Please wait a moment...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className='min-h-screen'>
      {!hasOrganizations && (
        <section className='sticky top-0 z-10 mb-8 border-b border-zinc-800 bg-black/80 px-8 backdrop-blur-xl'>
          <div className='mx-auto flex max-w-6xl items-center gap-4 py-6'>
            <div className='relative flex-1'>
              <Search className='group-focus-within:text-primary absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-zinc-400 transition-colors' />
              <Input
                type='text'
                placeholder='Search organizations, hackathons, or grants...'
                className='focus-visible:border-primary focus-visible:ring-primary/20 h-12 w-full rounded-xl border-zinc-800 bg-zinc-900/50 pr-4 pl-12 text-white transition-all placeholder:text-zinc-500 focus-visible:bg-zinc-900 focus-visible:ring-2'
              />
            </div>
            <Button
              variant='outline'
              className='h-12 gap-2 rounded-xl border-zinc-800 bg-zinc-900/50 px-6 text-zinc-300 transition-all hover:border-zinc-700 hover:bg-zinc-800 hover:text-white'
            >
              <ArrowUpDown className='h-4 w-4' />
              Sort
            </Button>
            <div className='hidden md:block'>
              <Link href='/organizations/new'>
                <BoundlessButton
                  variant='default'
                  iconPosition='right'
                  icon={<Plus className='h-4 w-4' />}
                  className='shadow-primary/20 hover:shadow-primary/30 h-12 gap-2 rounded-xl px-6 shadow-lg transition-all hover:shadow-xl'
                >
                  Add Organization
                </BoundlessButton>
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className='mx-auto max-w-6xl px-8 py-12'>
        {!hasOrganizations ? (
          <>
            <div className='mb-8 flex items-center justify-between'>
              <div>
                <h2 className='text-2xl font-bold text-white'>
                  Your Organizations
                </h2>
                <p className='mt-1 text-sm text-zinc-400'>
                  Manage {organizations.length} organization
                  {organizations.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className='md:hidden'>
                <Link href='/organizations/new'>
                  <Button className='bg-primary hover:bg-primary/90 gap-2 rounded-xl text-black'>
                    <Plus className='h-4 w-4' />
                    Add
                  </Button>
                </Link>
              </div>
            </div>

            <div className='grid grid-cols-1 gap-6'>
              {organizations.map(org => (
                <Link
                  href={`/organizations/${org._id}`}
                  key={org._id}
                  className='group transition-transform hover:scale-[1.01]'
                >
                  <OrganizationCard
                    id={org._id}
                    name={org.name}
                    logo={org.logo}
                    createdAt={org.createdAt}
                    hackathons={{
                      count: org.hackathonCount ?? 0,
                      submissions: 0,
                    }}
                    grants={{
                      count: org.grantCount ?? 0,
                      applications: 0,
                    }}
                  />
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className='flex min-h-[60vh] items-center justify-center'>
            <div className='w-full max-w-2xl text-center'>
              {/* Decorative background */}
              <div className='relative mx-auto mb-8 h-48 w-48'>
                <div className='from-primary/20 absolute inset-0 animate-pulse rounded-full bg-gradient-to-br to-purple-500/20 blur-3xl'></div>
                <div className='relative flex h-full w-full items-center justify-center rounded-full border-2 border-dashed border-zinc-800 bg-zinc-900/50'>
                  <Building2
                    className='h-20 w-20 text-zinc-700'
                    strokeWidth={1.5}
                  />
                </div>
              </div>

              {/* Content */}
              <div className='mb-8'>
                <h2 className='mb-3 text-3xl font-bold text-white'>
                  Create Your First Organization
                </h2>
                <p className='mx-auto max-w-md text-lg text-zinc-400'>
                  Start building your community by creating an organization to
                  manage hackathons, grants, and more.
                </p>
              </div>

              {/* Features */}
              <div className='mb-10 grid grid-cols-1 gap-4 md:grid-cols-3'>
                <div className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 transition-all hover:border-zinc-700 hover:bg-zinc-900/50'>
                  <Sparkles className='text-primary mx-auto mb-3 h-8 w-8' />
                  <h3 className='mb-2 font-semibold text-white'>
                    Host Hackathons
                  </h3>
                  <p className='text-sm text-zinc-500'>
                    Organize and manage exciting hackathon events
                  </p>
                </div>
                <div className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 transition-all hover:border-zinc-700 hover:bg-zinc-900/50'>
                  <TrendingUp className='text-primary mx-auto mb-3 h-8 w-8' />
                  <h3 className='mb-2 font-semibold text-white'>
                    Manage Grants
                  </h3>
                  <p className='text-sm text-zinc-500'>
                    Create and distribute grant programs
                  </p>
                </div>
                <div className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 transition-all hover:border-zinc-700 hover:bg-zinc-900/50'>
                  <Building2 className='text-primary mx-auto mb-3 h-8 w-8' />
                  <h3 className='mb-2 font-semibold text-white'>
                    Build Community
                  </h3>
                  <p className='text-sm text-zinc-500'>
                    Connect with developers worldwide
                  </p>
                </div>
              </div>

              {/* CTA Button */}
              <Link href='/organizations/new'>
                <BoundlessButton
                  variant='default'
                  iconPosition='right'
                  icon={<Plus className='h-5 w-5' />}
                  className='group shadow-primary/30 hover:shadow-primary/40 h-14 gap-3 rounded-xl px-8 text-lg shadow-2xl transition-all hover:scale-105'
                >
                  <span>Create Organization</span>
                </BoundlessButton>
              </Link>

              <p className='mt-6 text-sm text-zinc-500'>
                It only takes a minute to get started
              </p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
