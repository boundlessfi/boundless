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
import { toast } from 'sonner';
import DeleteOrganizationDialog from './DeleteOrganizationDialog';

type SortOption = 'newest' | 'oldest' | 'name-asc' | 'name-desc';

export default function OrganizationContent() {
  const router = useRouter();
  const {
    organizations,
    isLoading,
    isLoadingOrganizations,
    deleteOrganization,
    archiveOrganization,
    unarchiveOrganization,
    activeOrg,
  } = useOrganization();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orgToDelete, setOrgToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [archivingId, setArchivingId] = useState<string | null>(null);

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

  const handleDeleteClick = (orgId: string) => {
    const org = organizations.find(org => org._id === orgId);
    if (org) {
      setOrgToDelete({ id: org._id, name: org.name });
      setDeleteDialogOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!orgToDelete) return;

    setDeletingId(orgToDelete.id);
    setDeleteDialogOpen(false);

    try {
      await deleteOrganization(orgToDelete.id);
      toast.success('Organization deleted successfully', {
        description: `"${orgToDelete.name}" has been permanently deleted.`,
      });

      // If the deleted org was the active org, redirect to organizations page
      if (activeOrg?._id === orgToDelete.id) {
        router.push('/organizations');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to delete organization. Please try again.';
      toast.error('Failed to delete organization', {
        description: errorMessage,
      });
    } finally {
      setDeletingId(null);
      setOrgToDelete(null);
    }
  };

  const handleEdit = (orgId: string) => {
    router.push(`/organizations/${orgId}/edit`);
  };

  const handleArchive = async (orgId: string) => {
    const orgToArchive = organizations.find(org => org._id === orgId);
    const orgName = orgToArchive?.name || 'this organization';

    if (
      !confirm(
        `Are you sure you want to archive "${orgName}"? This will hide the organization from your active list.`
      )
    ) {
      return;
    }

    setArchivingId(orgId);

    try {
      await archiveOrganization(orgId);
      toast.success('Organization archived successfully', {
        description: `"${orgName}" has been archived.`,
      });

      // If the archived org was the active org, redirect to organizations page
      if (activeOrg?._id === orgId) {
        router.push('/organizations');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to archive organization. Please try again.';
      toast.error('Failed to archive organization', {
        description: errorMessage,
      });
    } finally {
      setArchivingId(null);
    }
  };

  const handleUnarchive = async (orgId: string) => {
    const orgToUnarchive = organizations.find(org => org._id === orgId);
    const orgName = orgToUnarchive?.name || 'this organization';

    if (
      !confirm(
        `Are you sure you want to unarchive "${orgName}"? This will restore the organization to your active list.`
      )
    ) {
      return;
    }

    setArchivingId(orgId);

    try {
      await unarchiveOrganization(orgId);
      toast.success('Organization unarchived successfully', {
        description: `"${orgName}" has been restored.`,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to unarchive organization. Please try again.';
      toast.error('Failed to unarchive organization', {
        description: errorMessage,
      });
    } finally {
      setArchivingId(null);
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
      {hasOrganizations && (
        <section className='sticky top-0 z-10 mb-8 border-b border-zinc-800 bg-black/80 px-8 backdrop-blur-xl'>
          <div className='mx-auto flex max-w-6xl items-center gap-4 py-6'>
            <div className='relative flex-1'>
              <Search className='group-focus-within:text-primary absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-zinc-400 transition-colors' />
              <Input
                type='text'
                placeholder='Search organizations, hackathons, or grants...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className='focus-visible:border-primary focus-visible:ring-primary/20 h-12 w-full rounded-xl border-zinc-800 bg-zinc-900/50 pr-4 pl-12 text-white transition-all placeholder:text-zinc-500 focus-visible:bg-zinc-900 focus-visible:ring-2'
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='outline'
                  className='h-12 gap-2 rounded-xl border-zinc-800 bg-zinc-900/50 px-6 text-zinc-300 transition-all hover:border-zinc-700 hover:bg-zinc-800 hover:text-white'
                >
                  <ArrowUpDown className='h-4 w-4' />
                  {getSortLabel()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align='end'
                className='w-48 border-zinc-800 bg-zinc-950'
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

      <section className='mx-auto max-w-6xl px-8'>
        {hasOrganizations ? (
          <>
            <div className='mb-8 flex items-center justify-between'>
              <div>
                <h2 className='text-2xl font-bold text-white'>
                  Your Organizations
                </h2>
                <p className='mt-1 text-sm text-zinc-400'>
                  {filteredAndSortedOrganizations.length ===
                  organizations.length
                    ? `Manage ${organizations.length} organization${organizations.length !== 1 ? 's' : ''}`
                    : `Showing ${filteredAndSortedOrganizations.length} of ${organizations.length} organizations`}
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
                    onUnarchive={handleUnarchive}
                    onDelete={handleDeleteClick}
                    isDeleting={deletingId === org._id}
                    isArchiving={archivingId === org._id}
                    isArchived={org.isArchived ?? false}
                  />
                ))}
              </div>
            ) : (
              <div className='flex min-h-[40vh] items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20 p-12'>
                <div className='text-center'>
                  <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800/50'>
                    <Search className='h-8 w-8 text-zinc-500' />
                  </div>
                  <h3 className='mb-2 text-lg font-semibold text-white'>
                    No organizations found
                  </h3>
                  <p className='mb-6 text-sm text-zinc-400'>
                    No organizations match "{searchQuery}"
                  </p>
                  <Button
                    variant='outline'
                    onClick={() => setSearchQuery('')}
                    className='rounded-xl border-zinc-700 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                  >
                    Clear search
                  </Button>
                </div>
              </div>
            )}
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

      {/* Delete Organization Dialog */}
      {orgToDelete && (
        <DeleteOrganizationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          organizationName={orgToDelete.name}
          onConfirm={handleDeleteConfirm}
          isDeleting={deletingId === orgToDelete.id}
        />
      )}
    </main>
  );
}
