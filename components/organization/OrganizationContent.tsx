'use client';
import { Search, ArrowUpDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import OrganizationCard from './cards/OrganzationCards';
import Link from 'next/link';
import { BoundlessButton } from '../buttons';
import { useOrganization } from '@/lib/providers/OrganizationProvider';
import LoadingSpinner from '../LoadingSpinner';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

type SortOption = 'newest' | 'oldest' | 'name-asc' | 'name-desc';

export default function OrganizationContent() {
  const router = useRouter();
  const {
    organizations,
    isLoading,
    isLoadingOrganizations,
    deleteOrganization,
  } = useOrganization();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loading = isLoading || isLoadingOrganizations;

  // Filter and sort organizations
  const filteredAndSortedOrganizations = useMemo(() => {
    let filtered = organizations;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = organizations.filter(org =>
        org.name.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case 'oldest':
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

    return sorted;
  }, [organizations, searchQuery, sortBy]);

  const hasOrganizations = organizations.length > 0;

  const handleDelete = async (orgId: string) => {
    if (!confirm('Are you sure you want to delete this organization?')) {
      return;
    }

    try {
      setDeletingId(orgId);
      await deleteOrganization(orgId);
    } catch (error) {
      console.error('Failed to delete organization:', error);
      alert('Failed to delete organization. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (orgId: string) => {
    router.push(`/organizations/${orgId}/settings`);
  };

  const handleArchive = async (orgId: string) => {
    if (!confirm('Are you sure you want to archive this organization?')) {
      return;
    }

    try {
      setDeletingId(orgId);
      console.log('Archive organization:', orgId, deletingId);
      alert('Archive functionality will be implemented soon.');
    } catch (error) {
      console.error('Failed to archive organization:', error);
      alert('Failed to archive organization. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const getSortLabel = () => {
    switch (sortBy) {
      case 'newest':
        return 'Newest First';
      case 'oldest':
        return 'Oldest First';
      case 'name-asc':
        return 'Name (A-Z)';
      case 'name-desc':
        return 'Name (Z-A)';
      default:
        return 'Sort';
    }
  };

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
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className='focus-visible:border-primary focus-visible:ring-primary w-full rounded-lg border-zinc-800 bg-zinc-900 py-6 pr-4 pl-12 text-white placeholder:text-zinc-500 focus-visible:ring-[1px]'
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='outline'
                  className='hover:text-primary rounded-lg border-zinc-800 bg-black px-6 py-6 hover:bg-transparent'
                >
                  <ArrowUpDown className='mr-2 h-4 w-4' />
                  {getSortLabel()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align='end'
                className='w-48 border-zinc-800 bg-black'
              >
                <DropdownMenuItem
                  onClick={() => setSortBy('newest')}
                  className={`cursor-pointer ${sortBy === 'newest' ? 'text-primary bg-zinc-800' : 'text-zinc-300'}`}
                >
                  Newest First
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSortBy('oldest')}
                  className={`cursor-pointer ${sortBy === 'oldest' ? 'text-primary bg-zinc-800' : 'text-zinc-300'}`}
                >
                  Oldest First
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSortBy('name-asc')}
                  className={`cursor-pointer ${sortBy === 'name-asc' ? 'text-primary bg-zinc-800' : 'text-zinc-300'}`}
                >
                  Name (A-Z)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSortBy('name-desc')}
                  className={`cursor-pointer ${sortBy === 'name-desc' ? 'text-primary bg-zinc-800' : 'text-zinc-300'}`}
                >
                  Name (Z-A)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

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
          <>
            {filteredAndSortedOrganizations.length > 0 ? (
              <div className='grid grid-cols-1 gap-6'>
                {filteredAndSortedOrganizations.map(org => (
                  <OrganizationCard
                    key={org._id}
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
                    onEdit={handleEdit}
                    onArchive={handleArchive}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            ) : (
              <div className='border-active-bg2 mx-8 flex items-center justify-center rounded-lg border-1 border-dashed p-32'>
                <div className='text-center text-zinc-400'>
                  <p className='mb-4'>
                    No organizations found matching "{searchQuery}"
                  </p>
                  <Button
                    variant='ghost'
                    onClick={() => setSearchQuery('')}
                    className='text-primary hover:text-primary'
                  >
                    Clear search
                  </Button>
                </div>
              </div>
            )}
          </>
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
