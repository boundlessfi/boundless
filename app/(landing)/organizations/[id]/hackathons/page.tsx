'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Calendar,
  Users,
  FileText,
  ExternalLink,
  Settings,
  Eye,
  Trash2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import Image from 'next/image';
import { BoundlessButton } from '@/components/buttons';
import { useHackathons } from '@/hooks/use-hackathons';
import { useDeleteHackathon } from '@/hooks/hackathon/use-delete-hackathon';
import type { Hackathon, HackathonDraft } from '@/lib/api/hackathons';
import { toast } from 'sonner';
import DeleteHackathonDialog from '@/components/organization/DeleteHackathonDialog';
import { Badge } from '@/components/ui/badge';
import { AuthGuard } from '@/components/auth';
import Loading from '@/components/Loading';

const calculateDraftCompletion = (draft: HackathonDraft): number => {
  const fields = [
    draft.data.information?.name,
    draft.data.information?.banner,
    draft.data.information?.description,
    draft.data.information?.categories,
    draft.data.timeline?.startDate,
    draft.data.timeline?.submissionDeadline,
    draft.data.timeline?.judgingDeadline,
    draft.data.timeline?.timezone,
    draft.data.participation?.participantType,
    draft.data.rewards?.prizeTiers?.length,
    draft.data.judging?.criteria?.length,
    draft.data.collaboration?.contactEmail,
  ];

  const filledFields = fields.filter(field => {
    if (typeof field === 'number') return field > 0;
    return field !== undefined && field !== null && field !== '';
  }).length;

  return Math.round((filledFields / fields.length) * 100);
};

const getTimeRemaining = (endDate: string): string => {
  const now = new Date();
  const end = new Date(endDate);
  const diff = end.getTime() - now.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days < 0) return 'Ended';
  if (days === 0) return 'Ends today';
  if (days === 1) return '1 day';
  if (days < 7) return `${days} days`;
  if (days < 30) return `${Math.floor(days / 7)}w`;
  if (days < 365) return `${Math.floor(days / 30)}mo`;
  return `${Math.floor(days / 365)}y`;
};

type HackathonStatus =
  | 'DRAFT'
  | 'UPCOMING'
  | 'ACTIVE'
  | 'JUDGING'
  | 'COMPLETED'
  | 'ARCHIVED'
  | 'CANCELLED';

const getStatusDisplay = (
  status: HackathonStatus | undefined
): { label: string; className: string } => {
  switch (status) {
    case 'UPCOMING':
      return {
        label: 'Upcoming',
        className: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      };
    case 'ACTIVE':
      return {
        label: 'Live',
        className: 'bg-green-500/10 text-green-400 border-green-500/20',
      };
    case 'JUDGING':
      return {
        label: 'Judging',
        className: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      };
    case 'COMPLETED':
      return {
        label: 'Ended',
        className: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
      };
    case 'ARCHIVED':
      return {
        label: 'Archived',
        className: 'bg-zinc-600/10 text-zinc-500 border-zinc-600/20',
      };
    case 'CANCELLED':
      return {
        label: 'Cancelled',
        className: 'bg-red-500/10 text-red-400 border-red-500/20',
      };
    case 'DRAFT':
    default:
      return {
        label: status === 'DRAFT' ? 'Draft' : (status ?? 'Draft'),
        className: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
      };
  }
};

export default function HackathonsPage() {
  const params = useParams();
  const organizationId = params.id as string;
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [tab, setTab] = useState<'published' | 'drafts'>('published');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [hackathonToDelete, setHackathonToDelete] = useState<{
    id: string;
    title: string;
    type: 'draft' | 'hackathon';
  } | null>(null);

  const { hackathons, hackathonsLoading, drafts, draftsLoading, refetchAll } =
    useHackathons({
      organizationId,
      autoFetch: true,
    });

  // Use the separate delete hook
  const { isDeleting, deleteHackathon } = useDeleteHackathon({
    organizationId,
    hackathonId: hackathonToDelete?.id || '',
    type: hackathonToDelete?.type ?? 'hackathon',
    suppressToast: true,
    onSuccess: () => {
      // Refresh the hackathons list after successful deletion
      refetchAll();
    },
    onError: error => {
      toast.error('Failed to delete hackathon', {
        description: error,
      });
    },
  });

  const publishedHackathons = useMemo(() => {
    let items = hackathons.filter(h => h.status !== 'DRAFT');
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(h => h.name?.toLowerCase().includes(query));
    }
    if (categoryFilter !== 'all') {
      items = items.filter(h =>
        h.categories
          ?.map(c => c.toLowerCase())
          .includes(categoryFilter.toLowerCase())
      );
    }
    items = items.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });
    return items;
  }, [hackathons, searchQuery, categoryFilter, sortBy]);

  const draftHackathons = useMemo(() => {
    let items = drafts;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(d =>
        d.data.information?.name?.toLowerCase().includes(query)
      );
    }
    if (categoryFilter !== 'all') {
      items = items.filter(d =>
        d.data.information?.categories
          ?.map(c => c.toLowerCase())
          .includes(categoryFilter.toLowerCase())
      );
    }
    items = items.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });
    return items;
  }, [drafts, searchQuery, categoryFilter, sortBy]);

  const isLoading = hackathonsLoading || draftsLoading;

  const stats = useMemo(() => {
    const published = hackathons.filter(h =>
      ['UPCOMING', 'ACTIVE', 'JUDGING', 'COMPLETED'].includes(h.status)
    ).length;
    const total = hackathons.length + drafts.length;
    return { published, drafts: drafts.length, total };
  }, [hackathons, drafts]);

  const handleDeleteClick = (
    hackathonId: string,
    type: 'draft' | 'hackathon'
  ) => {
    if (type === 'hackathon') {
      const published = publishedHackathons.find(h => h.id === hackathonId);
      if (published) {
        setHackathonToDelete({
          id: hackathonId,
          title: published.name || 'Untitled Hackathon',
          type: 'hackathon',
        });
        setDeleteDialogOpen(true);
      }
    } else {
      const draft = draftHackathons.find(d => d.id === hackathonId);
      if (draft) {
        setHackathonToDelete({
          id: hackathonId,
          title: draft.data.information?.name || 'Untitled Hackathon',
          type: 'draft',
        });
        setDeleteDialogOpen(true);
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (!hackathonToDelete) return;

    const { title } = hackathonToDelete; // ✅ snapshot before state clears

    setDeleteDialogOpen(false);

    try {
      await deleteHackathon();
      toast.success('Hackathon deleted successfully', {
        description: `"${title}" has been permanently deleted.`,
      });
    } catch {
      // error toast handled by onError in hook
    } finally {
      setHackathonToDelete(null);
    }
  };

  return (
    <AuthGuard redirectTo='/auth?mode=signin' fallback={<Loading />}>
      <div className='min-h-screen bg-black'>
        {/* Header */}
        <div className='sticky top-0 z-20 border-b border-zinc-900 bg-black/80 backdrop-blur-xl'>
          <div className='mx-auto max-w-6xl px-6 py-8'>
            <div className='mb-8 flex items-center justify-between'>
              <div>
                <h1 className='mb-2 text-3xl font-bold tracking-tight text-white'>
                  Hackathons
                </h1>
                <div className='flex items-center gap-6 text-sm text-zinc-500'>
                  <span>{stats.total} total</span>
                  <span>•</span>
                  <span>{stats.published} published</span>
                  <span>•</span>
                  <span>{stats.drafts} drafts</span>
                </div>
              </div>
              <Link href={`/organizations/${organizationId}/hackathons/new`}>
                <BoundlessButton className='shadow-primary/20 gap-2 shadow-lg'>
                  <Plus className='h-4 w-4' />
                  Host Hackathon
                </BoundlessButton>
              </Link>
            </div>

            {/* Tabs */}
            <div className='mb-6 flex gap-2'>
              <button
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${tab === 'published' ? 'bg-primary text-black shadow' : 'bg-zinc-900 text-white hover:bg-zinc-800'}`}
                onClick={() => setTab('published')}
              >
                Published
              </button>
              <button
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${tab === 'drafts' ? 'bg-primary text-black shadow' : 'bg-zinc-900 text-white hover:bg-zinc-800'}`}
                onClick={() => setTab('drafts')}
              >
                Drafts
              </button>
            </div>

            {/* Filters */}
            <div className='sticky top-20 z-10 flex flex-wrap items-center gap-3 bg-black/80 py-2'>
              <div className='relative min-w-50 flex-1'>
                <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-500' />
                <Input
                  type='search'
                  placeholder='Search hackathons...'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className='focus:border-primary focus:ring-primary/20 h-10 rounded-xl border-zinc-800/50 bg-zinc-900/30 pl-10 text-sm text-white transition-all placeholder:text-zinc-500 hover:border-zinc-700 hover:bg-zinc-900/50'
                />
              </div>

              <Select
                value={sortBy}
                onValueChange={value => setSortBy(value as 'newest' | 'oldest')}
              >
                <SelectTrigger className='focus:border-primary focus:ring-primary/20 h-10 w-32 rounded-xl border-zinc-800/50 bg-zinc-900/30 text-sm text-white transition-all hover:border-zinc-700 hover:bg-zinc-900/50'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className='border-zinc-800/50 bg-zinc-950 backdrop-blur-xl'>
                  <SelectItem
                    value='newest'
                    className='text-white focus:bg-zinc-900/50 focus:text-white'
                  >
                    Newest
                  </SelectItem>
                  <SelectItem
                    value='oldest'
                    className='text-white focus:bg-zinc-900/50 focus:text-white'
                  >
                    Oldest
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className='focus:border-primary focus:ring-primary/20 h-10 w-36 rounded-xl border-zinc-800/50 bg-zinc-900/30 text-sm text-white transition-all hover:border-zinc-700 hover:bg-zinc-900/50'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className='border-zinc-800/50 bg-zinc-950 backdrop-blur-xl'>
                  <SelectItem
                    value='all'
                    className='text-white focus:bg-zinc-900/50 focus:text-white'
                  >
                    All Categories
                  </SelectItem>
                  <SelectItem
                    value='defi'
                    className='text-white focus:bg-zinc-900/50 focus:text-white'
                  >
                    DeFi
                  </SelectItem>
                  <SelectItem
                    value='nfts'
                    className='text-white focus:bg-zinc-900/50 focus:text-white'
                  >
                    NFTs
                  </SelectItem>
                  <SelectItem
                    value='daos'
                    className='text-white focus:bg-zinc-900/50 focus:text-white'
                  >
                    DAOs
                  </SelectItem>
                  <SelectItem
                    value='layer 2'
                    className='text-white focus:bg-zinc-900/50 focus:text-white'
                  >
                    Layer 2
                  </SelectItem>
                  <SelectItem
                    value='cross-chain'
                    className='text-white focus:bg-zinc-900/50 focus:text-white'
                  >
                    Cross-chain
                  </SelectItem>
                  <SelectItem
                    value='web3 gaming'
                    className='text-white focus:bg-zinc-900/50 focus:text-white'
                  >
                    Web3 Gaming
                  </SelectItem>
                  <SelectItem
                    value='infrastructure'
                    className='text-white focus:bg-zinc-900/50 focus:text-white'
                  >
                    Infrastructure
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className='mx-auto max-w-6xl px-6 py-8'>
          {isLoading ? (
            <div className='flex flex-col items-center justify-center py-24'>
              <div className='border-primary mb-4 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent' />
              <span className='text-sm text-zinc-500'>
                Loading hackathons...
              </span>
            </div>
          ) : (
            <>
              {tab === 'published' ? (
                publishedHackathons.length === 0 ? (
                  <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 py-24'>
                    <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900'>
                      <FileText className='h-8 w-8 text-zinc-600' />
                    </div>
                    <h3 className='mb-2 text-lg font-medium text-white'>
                      No published hackathons yet
                    </h3>
                    <p className='mb-6 text-sm text-zinc-500'>
                      Get started by hosting your first hackathon
                    </p>
                    <Link
                      href={`/organizations/${organizationId}/hackathons/new`}
                    >
                      <BoundlessButton className='gap-2'>
                        <Plus className='h-4 w-4' />
                        Host Hackathon
                      </BoundlessButton>
                    </Link>
                  </div>
                ) : (
                  <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                    {publishedHackathons.map(hackathon => {
                      const endDate = hackathon.submissionDeadline;
                      const totalPrize =
                        hackathon.prizeTiers?.reduce(
                          (sum: number, tier: any) => sum + (tier.amount || 0),
                          0
                        ) || 0;
                      return (
                        <div
                          key={hackathon.id}
                          className='group hover:border-primary/60 hover:shadow-primary/10 relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/30 shadow-lg transition-all'
                          onClick={() =>
                            router.push(
                              `/organizations/${organizationId}/hackathons/${hackathon.id}`
                            )
                          }
                          tabIndex={0}
                          role='button'
                          aria-label={`View hackathon ${hackathon.name}`}
                        >
                          {hackathon.banner && (
                            <div className='relative h-32 w-full overflow-hidden rounded-t-2xl'>
                              <Image
                                src={hackathon.banner}
                                alt={hackathon.name}
                                fill
                                className='object-cover'
                              />
                              <div className='absolute inset-0 bg-linear-to-t from-black/60 to-transparent' />
                            </div>
                          )}
                          <div className='flex flex-1 flex-col gap-2 p-5'>
                            <div className='mb-1 flex items-center gap-2'>
                              {(() => {
                                const { label, className } = getStatusDisplay(
                                  hackathon.status as HackathonStatus
                                );
                                return (
                                  <Badge
                                    variant='outline'
                                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${className}`}
                                  >
                                    {label}
                                  </Badge>
                                );
                              })()}
                              {endDate && (
                                <span className='flex items-center gap-1.5 text-xs text-zinc-500'>
                                  <Calendar className='h-3 w-3' />
                                  {getTimeRemaining(endDate)}
                                </span>
                              )}
                            </div>
                            <h3 className='truncate text-lg font-bold text-white'>
                              {hackathon.name}
                            </h3>
                            <div className='mt-1 flex items-center gap-4 text-xs text-zinc-400'>
                              <span className='flex items-center gap-1'>
                                <Users className='h-4 w-4' />
                                {hackathon._count?.participants || 0}{' '}
                                participants
                              </span>
                              <span className='flex items-center gap-1'>
                                <FileText className='h-4 w-4' />
                                {hackathon._count?.submissions || 0} submissions
                              </span>
                              {totalPrize > 0 && (
                                <span className='text-primary flex items-center gap-1 font-semibold'>
                                  <Image
                                    src='/trophy.svg'
                                    alt='Prize'
                                    width={16}
                                    height={16}
                                  />
                                  ${totalPrize.toLocaleString()} USDC
                                </span>
                              )}
                            </div>
                          </div>
                          <div className='absolute top-3 right-3 z-10 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100'>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                router.push(
                                  `/organizations/${organizationId}/hackathons/${hackathon.id}/settings`
                                );
                              }}
                              className='flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/70 text-zinc-400 hover:border-zinc-700 hover:text-white'
                              title='Settings'
                            >
                              <Settings className='h-4 w-4' />
                            </button>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                handleDeleteClick(hackathon.id, 'hackathon');
                              }}
                              className='flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/70 text-zinc-400 hover:border-red-600 hover:text-red-500'
                              title='Delete Hackathon'
                              disabled={isDeleting}
                            >
                              <Trash2 className='h-4 w-4' />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : draftHackathons.length === 0 ? (
                <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 py-24'>
                  <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900'>
                    <FileText className='h-8 w-8 text-zinc-600' />
                  </div>
                  <h3 className='mb-2 text-lg font-medium text-white'>
                    No drafts yet
                  </h3>
                  <p className='mb-6 text-sm text-zinc-500'>
                    Start a new draft to host your first hackathon
                  </p>
                  <Link
                    href={`/organizations/${organizationId}/hackathons/new`}
                  >
                    <BoundlessButton className='gap-2'>
                      <Plus className='h-4 w-4' />
                      Host Hackathon
                    </BoundlessButton>
                  </Link>
                </div>
              ) : (
                <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                  {draftHackathons.map(draft => {
                    const title =
                      draft.data.information?.name || 'Untitled Hackathon';
                    const completion = calculateDraftCompletion(draft);
                    const endDate = draft.data.timeline?.submissionDeadline;
                    const totalPrize =
                      draft.data.rewards?.prizeTiers?.reduce(
                        (sum: number, tier: any) => sum + (tier.amount || 0),
                        0
                      ) || 0;
                    return (
                      <div
                        key={draft.id}
                        className='group hover:border-primary/60 hover:shadow-primary/10 relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/30 shadow-lg transition-all'
                        onClick={() =>
                          router.push(
                            `/organizations/${organizationId}/hackathons/drafts/${draft.id}`
                          )
                        }
                        tabIndex={0}
                        role='button'
                        aria-label={`Edit draft ${title}`}
                      >
                        <div className='flex flex-1 flex-col gap-2 p-5'>
                          <div className='mb-1 flex items-center gap-2'>
                            <Badge
                              variant='outline'
                              className='rounded-full bg-zinc-500 px-3 py-1 text-xs font-medium text-zinc-100'
                            >
                              Draft
                            </Badge>
                            <span className='text-sm text-white'>
                              {completion}% complete
                            </span>
                            {endDate && (
                              <span className='flex items-center gap-1.5 text-xs text-zinc-500'>
                                <Calendar className='h-3 w-3' />
                                {getTimeRemaining(endDate)}
                              </span>
                            )}
                          </div>
                          <h3 className='truncate text-lg font-bold text-white'>
                            {title}
                          </h3>
                          <div className='mt-1 flex items-center gap-4 text-xs text-zinc-400'>
                            {totalPrize > 0 && (
                              <span className='text-primary flex items-center gap-1 font-semibold'>
                                <Image
                                  src='/trophy.svg'
                                  alt='Prize'
                                  width={16}
                                  height={16}
                                />
                                ${totalPrize.toLocaleString()} USDC
                              </span>
                            )}
                          </div>
                          <div className='mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-800'>
                            <div
                              className='bg-primary h-full rounded-full transition-all'
                              style={{ width: `${completion}%` }}
                            />
                          </div>
                        </div>
                        <div className='absolute top-3 right-3 z-10 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100'>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              router.push(
                                `/hackathons/preview/${organizationId}/${draft.id}`
                              );
                            }}
                            className='flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/70 text-zinc-400 hover:border-zinc-700 hover:text-white'
                            title='Preview'
                          >
                            <Eye className='h-4 w-4' />
                          </button>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleDeleteClick(draft.id, 'draft');
                            }}
                            className='flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/70 text-zinc-400 hover:border-red-600 hover:text-red-500'
                            title='Delete Draft'
                            disabled={isDeleting}
                          >
                            <Trash2 className='h-4 w-4' />
                          </button>
                          <BoundlessButton
                            size='sm'
                            variant='outline'
                            className='opacity-0 transition-opacity group-hover:opacity-100'
                            onClick={e => {
                              e.stopPropagation();
                              router.push(
                                `/organizations/${organizationId}/hackathons/drafts/${draft.id}`
                              );
                            }}
                          >
                            Continue
                          </BoundlessButton>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Delete Hackathon Dialog */}
        {hackathonToDelete && (
          <DeleteHackathonDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            hackathonTitle={hackathonToDelete.title}
            onConfirm={handleDeleteConfirm}
            isDeleting={isDeleting}
          />
        )}
      </div>
    </AuthGuard>
  );
}
