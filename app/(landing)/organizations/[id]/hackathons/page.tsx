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
    draft.data.timeline?.judgingStart || draft.data.timeline?.judgingDate,
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

export default function HackathonsPage() {
  const params = useParams();
  const organizationId = params.id as string;
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'draft'>(
    'all'
  );
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [hackathonToDelete, setHackathonToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const { hackathons, hackathonsLoading, drafts, draftsLoading, refetchAll } =
    useHackathons({
      organizationId,
      autoFetch: true,
    });

  // Use the separate delete hook
  const { isDeleting, deleteHackathon } = useDeleteHackathon({
    organizationId,
    hackathonId: hackathonToDelete?.id || '', // This will be set when we have a hackathon to delete
    onSuccess: () => {
      // Refresh the hackathons list after successful deletion
      refetchAll();
      toast.success('Hackathon deleted successfully', {
        description: `"${hackathonToDelete?.title}" has been permanently deleted.`,
      });
    },
    onError: error => {
      toast.error('Failed to delete hackathon', {
        description: error,
      });
    },
  });

  const allHackathons = useMemo(() => {
    const items: Array<{
      type: 'draft' | 'hackathon';
      data: HackathonDraft | Hackathon;
    }> = [];

    drafts.forEach(draft => {
      if (statusFilter === 'all' || statusFilter === 'draft') {
        items.push({ type: 'draft', data: draft });
      }
    });

    hackathons.forEach(hackathon => {
      if (hackathon.status === 'DRAFT') return;
      if (
        statusFilter === 'all' ||
        (statusFilter === 'open' && hackathon.status === 'PUBLISHED')
      ) {
        items.push({ type: 'hackathon', data: hackathon });
      }
    });

    let filtered = items;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = items.filter(item => {
        const title =
          item.type === 'draft'
            ? (
                item.data as HackathonDraft
              ).data.information?.name?.toLowerCase() || ''
            : (item.data as Hackathon).name?.toLowerCase() || '';
        return title.includes(query);
      });
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => {
        const category =
          item.type === 'draft'
            ? (item.data as HackathonDraft).data.information?.categories
                ?.join(',')
                ?.toLowerCase() || ''
            : '';
        return category.includes(categoryFilter.toLowerCase());
      });
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.data.createdAt || 0).getTime();
      const dateB = new Date(b.data.createdAt || 0).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [drafts, hackathons, searchQuery, statusFilter, categoryFilter, sortBy]);

  const isLoading = hackathonsLoading || draftsLoading;

  const stats = useMemo(() => {
    const published = hackathons.filter(h => h.status === 'PUBLISHED').length;
    const total = hackathons.length + drafts.length;
    return { published, drafts: drafts.length, total };
  }, [hackathons, drafts]);

  const handleDeleteClick = (hackathonId: string) => {
    const hackathon = allHackathons.find(item => item.data.id === hackathonId);
    if (hackathon) {
      const title =
        hackathon.type === 'draft'
          ? (hackathon.data as HackathonDraft).data.information?.name ||
            'Untitled Hackathon'
          : (hackathon.data as Hackathon).name || 'Untitled Hackathon';
      setHackathonToDelete({ id: hackathonId, title });
      setDeleteDialogOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!hackathonToDelete) return;

    setDeleteDialogOpen(false);

    try {
      await deleteHackathon();
    } catch {
      // Error handled by toast in deleteHackathon hook
    } finally {
      setHackathonToDelete(null);
    }
  };

  return (
    <AuthGuard redirectTo='/auth?mode=signin' fallback={<Loading />}>
      <div className='min-h-screen bg-black'>
        {/* Header */}
        <div className='border-b border-zinc-900'>
          <div className='mx-auto max-w-6xl px-6 py-8'>
            <div className='mb-8 flex items-center justify-between'>
              <div>
                <h1 className='mb-2 text-2xl font-medium text-white'>
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
                <BoundlessButton className='gap-2'>
                  <Plus className='h-4 w-4' />
                  Host Hackathon
                </BoundlessButton>
              </Link>
            </div>

            {/* Filters */}
            <div className='flex items-center gap-3'>
              <div className='relative flex-1'>
                <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-500' />
                <Input
                  type='search'
                  placeholder='Search hackathons...'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className='focus:border-primary focus:ring-primary/20 h-10 border-zinc-800/50 bg-zinc-900/30 pl-10 text-sm text-white transition-all placeholder:text-zinc-500 hover:border-zinc-700 hover:bg-zinc-900/50'
                />
              </div>

              <Select
                value={sortBy}
                onValueChange={value => setSortBy(value as 'newest' | 'oldest')}
              >
                <SelectTrigger className='focus:border-primary focus:ring-primary/20 h-10 w-32 border-zinc-800/50 bg-zinc-900/30 text-sm text-white transition-all hover:border-zinc-700 hover:bg-zinc-900/50'>
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

              <Select
                value={statusFilter}
                onValueChange={value =>
                  setStatusFilter(value as 'all' | 'open' | 'draft')
                }
              >
                <SelectTrigger className='focus:border-primary focus:ring-primary/20 h-10 w-32 border-zinc-800/50 bg-zinc-900/30 text-sm text-white transition-all hover:border-zinc-700 hover:bg-zinc-900/50'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className='border-zinc-800/50 bg-zinc-950 backdrop-blur-xl'>
                  <SelectItem
                    value='all'
                    className='text-white focus:bg-zinc-900/50 focus:text-white'
                  >
                    All Status
                  </SelectItem>
                  <SelectItem
                    value='open'
                    className='text-white focus:bg-zinc-900/50 focus:text-white'
                  >
                    Published
                  </SelectItem>
                  <SelectItem
                    value='draft'
                    className='text-white focus:bg-zinc-900/50 focus:text-white'
                  >
                    Draft
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className='focus:border-primary focus:ring-primary/20 h-10 w-36 border-zinc-800/50 bg-zinc-900/30 text-sm text-white transition-all hover:border-zinc-700 hover:bg-zinc-900/50'>
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
          ) : allHackathons.length === 0 ? (
            <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 py-24'>
              <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900'>
                <FileText className='h-8 w-8 text-zinc-600' />
              </div>
              <h3 className='mb-2 text-lg font-medium text-white'>
                No hackathons yet
              </h3>
              <p className='mb-6 text-sm text-zinc-500'>
                Get started by hosting your first hackathon
              </p>
              <Link href={`/organizations/${organizationId}/hackathons/new`}>
                <BoundlessButton className='gap-2'>
                  <Plus className='h-4 w-4' />
                  Host Hackathon
                </BoundlessButton>
              </Link>
            </div>
          ) : (
            <div className='space-y-3'>
              {allHackathons.map(item => {
                const isDraft = item.type === 'draft';
                const hackathon = item.data;
                const title = isDraft
                  ? (hackathon as HackathonDraft).data.information?.name ||
                    'Untitled Hackathon'
                  : (hackathon as Hackathon).name || 'Untitled Hackathon';
                const completion = isDraft
                  ? calculateDraftCompletion(hackathon as HackathonDraft)
                  : 0;
                const endDate = isDraft
                  ? (hackathon as HackathonDraft).data.timeline
                      ?.submissionDeadline ||
                    (hackathon as HackathonDraft).data.timeline
                      ?.winnersAnnouncedAt ||
                    (hackathon as HackathonDraft).data.timeline
                      ?.winnerAnnouncementDate ||
                    (hackathon as HackathonDraft).data.timeline?.judgingEnd ||
                    (hackathon as HackathonDraft).data.timeline?.judgingDate ||
                    (hackathon as HackathonDraft).data.timeline?.judgingStart
                  : (hackathon as Hackathon).submissionDeadline ||
                    (hackathon as Hackathon).endDate;
                const totalPrize = isDraft
                  ? (
                      hackathon as HackathonDraft
                    ).data.rewards?.prizeTiers?.reduce(
                      (sum: number, tier: any) => sum + (tier.amount || 0),
                      0
                    ) || 0
                  : (hackathon as Hackathon).prizeTiers?.reduce(
                      (sum: number, tier: any) => sum + (tier.amount || 0),
                      0
                    ) || 0;

                if (isDraft) {
                  return (
                    <div
                      key={`draft-${hackathon.id}`}
                      onClick={() =>
                        router.push(
                          `/organizations/${organizationId}/hackathons/drafts/${hackathon.id}`
                        )
                      }
                      className='group cursor-pointer rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 transition-all hover:border-zinc-700 hover:bg-zinc-900/50'
                    >
                      <div className='mb-4 flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                          <Badge
                            variant='outline'
                            className='rounded-full bg-zinc-500 px-3 py-1 text-xs font-medium text-zinc-100'
                          >
                            Draft
                          </Badge>
                          <span className='text-sm text-white'>
                            {completion}% complete
                          </span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              router.push(
                                `/hackathons/preview/${organizationId}/${hackathon.id}`
                              );
                            }}
                            className='flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/50 text-zinc-400 opacity-0 transition-all group-hover:opacity-100 hover:border-zinc-700 hover:text-white'
                            title='Preview'
                          >
                            <Eye className='h-4 w-4' />
                          </button>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleDeleteClick(hackathon.id);
                            }}
                            className='flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/50 text-zinc-400 opacity-0 transition-all group-hover:opacity-100 hover:border-red-600 hover:text-red-500'
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
                                `/organizations/${organizationId}/hackathons/drafts/${hackathon.id}`
                              );
                            }}
                          >
                            Continue
                          </BoundlessButton>
                        </div>
                      </div>

                      <h3 className='mb-3 text-lg font-medium text-white'>
                        {title}
                      </h3>

                      <div className='h-1.5 overflow-hidden rounded-full bg-zinc-800'>
                        <div
                          className='bg-primary h-full rounded-full transition-all'
                          style={{ width: `${completion}%` }}
                        />
                      </div>
                    </div>
                  );
                }

                const publishedHackathon = hackathon as Hackathon;

                return (
                  <div
                    key={`hackathon-${publishedHackathon.id}`}
                    className='group rounded-xl border border-zinc-800 bg-zinc-900/30 transition-all hover:border-zinc-700 hover:bg-zinc-900/50'
                  >
                    <div className='p-6'>
                      <div className='mb-4 flex items-start justify-between'>
                        <div className='flex-1'>
                          <div className='mb-3 flex items-center gap-3'>
                            <Badge
                              variant='outline'
                              className={`rounded-full border-none px-3 py-1 text-xs font-medium ${
                                publishedHackathon.status === 'PUBLISHED' ||
                                publishedHackathon.status === 'ONGOING'
                                  ? 'bg-green-500/10 text-green-500'
                                  : 'bg-secondary-500/10 text-secondary-500'
                              }`}
                            >
                              {publishedHackathon.status === 'PUBLISHED'
                                ? 'Live'
                                : publishedHackathon.status}
                            </Badge>
                            {endDate && (
                              <div className='flex items-center gap-1.5 text-sm text-zinc-500'>
                                <Calendar className='h-3.5 w-3.5' />
                                {getTimeRemaining(endDate)}
                              </div>
                            )}
                          </div>

                          <h3 className='mb-4 text-lg font-medium text-white'>
                            {title}
                          </h3>

                          <div className='flex items-center gap-6 text-sm text-zinc-500'>
                            <div className='flex items-center gap-2'>
                              <Users className='h-4 w-4' />
                              <span>
                                {publishedHackathon.participants?.length ||
                                  publishedHackathon._count?.participants ||
                                  0}{' '}
                                participants
                              </span>
                            </div>
                            <div className='flex items-center gap-2'>
                              <FileText className='h-4 w-4' />
                              <span>
                                {publishedHackathon._count?.submissions || 0}{' '}
                                submissions
                              </span>
                            </div>
                            {totalPrize > 0 && (
                              <>
                                <div className='h-4 w-px bg-zinc-800' />
                                <div className='flex items-center gap-2'>
                                  <Image
                                    src='/trophy.svg'
                                    alt='Prize'
                                    width={16}
                                    height={16}
                                  />
                                  <span className='text-primary font-medium'>
                                    ${totalPrize.toLocaleString()} USDC
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        <div className='flex items-center gap-2'>
                          <button
                            onClick={() =>
                              router.push(
                                `/organizations/${organizationId}/hackathons/${publishedHackathon.id}`
                              )
                            }
                            className='flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/50 text-zinc-400 transition-all hover:border-zinc-700 hover:text-white'
                            title='Preview'
                          >
                            <ExternalLink className='h-4 w-4' />
                          </button>
                          <button
                            onClick={() =>
                              router.push(
                                `/organizations/${organizationId}/hackathons/${publishedHackathon.id}/settings`
                              )
                            }
                            className='flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/50 text-zinc-400 transition-all hover:border-zinc-700 hover:text-white'
                            title='Settings'
                          >
                            <Settings className='h-4 w-4' />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteClick(publishedHackathon.id)
                            }
                            className='flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/50 text-zinc-400 transition-all hover:border-red-600 hover:text-red-500'
                            title='Delete Hackathon'
                            disabled={isDeleting}
                          >
                            <Trash2 className='h-4 w-4' />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
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
