'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, FileText, Plus, Search, Target, Trash2 } from 'lucide-react';

import { BoundlessButton } from '@/components/buttons';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AuthGuard } from '@/components/auth';
import Loading from '@/components/Loading';
import DeleteBountyDraftDialog from '@/components/organization/bounties/DeleteBountyDraftDialog';
import {
  useDeleteDraft,
  useDraftList,
  useOrganizationBounties,
  type BountyDraft,
  type OrganizationBountyListItem,
} from '@/features/bounties';

const DRAFT_STATUSES = new Set(['draft', 'draft_awaiting_funding']);

const STATUS_DISPLAY: Record<string, { label: string; className: string }> = {
  open: {
    label: 'Open',
    className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  },
  in_progress: {
    label: 'In progress',
    className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  },
  submitted: {
    label: 'Submitted',
    className: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  },
  under_review: {
    label: 'Under review',
    className: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  },
  completed: {
    label: 'Completed',
    className: 'border-primary/30 bg-primary/10 text-primary',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'border-zinc-700 bg-zinc-800/60 text-zinc-300',
  },
  disputed: {
    label: 'Disputed',
    className: 'border-red-500/30 bg-red-500/10 text-red-400',
  },
};

function statusDisplay(status: string) {
  return (
    STATUS_DISPLAY[status] ?? {
      label: status,
      className: 'border-zinc-700 bg-zinc-800/60 text-zinc-300',
    }
  );
}

const draftPrizePool = (draft: BountyDraft): number =>
  (draft.data?.reward?.prizeTiers ?? []).reduce(
    (sum, tier) => sum + (Number(tier.amount) || 0),
    0
  );

export default function OrganizationBountiesPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const organizationId = params?.id ?? '';

  const [tab, setTab] = useState<'published' | 'drafts'>('published');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  const draftsQuery = useDraftList(organizationId);
  const publishedQuery = useOrganizationBounties(organizationId);
  const deleteDraft = useDeleteDraft(organizationId);
  const [draftToDelete, setDraftToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const allDrafts: BountyDraft[] = draftsQuery.data ?? [];

  const published: OrganizationBountyListItem[] = useMemo(() => {
    let items = (publishedQuery.data ?? []).filter(
      b => !DRAFT_STATUSES.has(b.status)
    );
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(b => b.title?.toLowerCase().includes(q));
    }
    return [...items].sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return sortBy === 'newest' ? tb - ta : ta - tb;
    });
  }, [publishedQuery.data, searchQuery, sortBy]);

  const drafts: BountyDraft[] = useMemo(() => {
    let items = allDrafts;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(d =>
        (d.data?.scope?.title ?? '').toLowerCase().includes(q)
      );
    }
    return [...items].sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return sortBy === 'newest' ? tb - ta : ta - tb;
    });
  }, [allDrafts, searchQuery, sortBy]);

  const isLoading = draftsQuery.isLoading || publishedQuery.isLoading;
  const publishedCount = (publishedQuery.data ?? []).filter(
    b => !DRAFT_STATUSES.has(b.status)
  ).length;
  const stats = {
    total: publishedCount + allDrafts.length,
    published: publishedCount,
    drafts: allDrafts.length,
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
                  Bounties
                </h1>
                <div className='flex items-center gap-6 text-sm text-zinc-500'>
                  <span>{stats.total} total</span>
                  <span>•</span>
                  <span>{stats.published} published</span>
                  <span>•</span>
                  <span>{stats.drafts} drafts</span>
                </div>
              </div>
              <Link href={`/organizations/${organizationId}/bounties/new`}>
                <BoundlessButton className='shadow-primary/20 gap-2 shadow-lg'>
                  <Plus className='h-4 w-4' />
                  Host a bounty
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
            <div className='flex flex-wrap items-center gap-3'>
              <div className='relative min-w-50 flex-1'>
                <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-500' />
                <Input
                  type='search'
                  placeholder='Search bounties...'
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
            </div>
          </div>
        </div>

        {/* Content */}
        <div className='mx-auto max-w-6xl px-6 py-8'>
          {isLoading ? (
            <div className='flex flex-col items-center justify-center py-24'>
              <div className='border-primary mb-4 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent' />
              <span className='text-sm text-zinc-400'>Loading bounties…</span>
            </div>
          ) : tab === 'published' ? (
            published.length === 0 ? (
              <EmptyState
                title='No published bounties yet'
                organizationId={organizationId}
              />
            ) : (
              <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                {published.map(bounty => {
                  const { label, className } = statusDisplay(bounty.status);
                  return (
                    <div
                      key={bounty.id}
                      className='group hover:border-primary/60 hover:shadow-primary/10 relative flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5 shadow-lg transition-all'
                    >
                      <div className='mb-3 flex items-center justify-between'>
                        <Badge
                          variant='outline'
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${className}`}
                        >
                          {label}
                        </Badge>
                        {bounty.createdAt && (
                          <span className='flex items-center gap-1.5 text-xs text-zinc-500'>
                            <Calendar className='h-3 w-3' />
                            {new Date(bounty.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <h3 className='line-clamp-2 min-h-14 text-lg font-bold text-white'>
                        {bounty.title || 'Untitled bounty'}
                      </h3>
                      <div className='mt-4 flex items-end justify-between border-t border-zinc-800 pt-4'>
                        <div className='flex items-center gap-2'>
                          <div className='bg-primary/10 flex h-9 w-9 items-center justify-center rounded-lg'>
                            <Target className='text-primary h-4 w-4' />
                          </div>
                          <div>
                            <p className='text-primary text-base leading-tight font-bold'>
                              {(bounty.rewardAmount ?? 0).toLocaleString()}{' '}
                              {bounty.rewardCurrency ?? 'USDC'}
                            </p>
                            <p className='text-[11px] text-zinc-500'>reward</p>
                          </div>
                        </div>
                        <span className='flex items-center gap-1 text-xs text-zinc-400'>
                          <FileText className='h-4 w-4' />
                          {bounty._count?.submissions ?? 0}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : drafts.length === 0 ? (
            <EmptyState title='No drafts yet' organizationId={organizationId} />
          ) : (
            <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
              {drafts.map(draft => {
                const title = draft.data?.scope?.title || 'Untitled bounty';
                const completion = Math.round(
                  ((draft.completedSteps?.length ?? 0) / 4) * 100
                );
                const isPublishing = draft.status === 'draft_awaiting_funding';
                const prizePool = draftPrizePool(draft);
                return (
                  <div
                    key={draft.id}
                    className='group hover:border-primary/60 hover:shadow-primary/10 relative flex cursor-pointer flex-col rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5 shadow-lg transition-all'
                    onClick={() =>
                      router.push(
                        `/organizations/${organizationId}/bounties/drafts/${draft.id}`
                      )
                    }
                    tabIndex={0}
                    role='button'
                    aria-label={`Edit draft ${title}`}
                  >
                    <div className='mb-3 flex items-center justify-between'>
                      <Badge
                        variant='outline'
                        className={
                          isPublishing
                            ? 'rounded-full bg-amber-600/80 px-3 py-1 text-xs font-medium text-amber-50'
                            : 'rounded-full bg-zinc-500 px-3 py-1 text-xs font-medium text-zinc-100'
                        }
                      >
                        {isPublishing ? 'Publishing' : 'Draft'}
                      </Badge>
                      <span className='text-xs text-zinc-400'>
                        {isPublishing ? 'Finalizing…' : `${completion}%`}
                      </span>
                    </div>
                    <h3 className='line-clamp-2 min-h-14 text-lg font-bold text-white'>
                      {title}
                    </h3>
                    <p className='mt-1 truncate text-xs text-zinc-500'>
                      {draft.modeLabel ?? 'Mode not set'}
                    </p>
                    <div className='mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-800'>
                      <div
                        className='bg-primary h-full rounded-full transition-all'
                        style={{ width: `${completion}%` }}
                      />
                    </div>
                    <div className='mt-4 flex items-center gap-2 border-t border-zinc-800 pt-4'>
                      <div className='bg-primary/10 flex h-9 w-9 items-center justify-center rounded-lg'>
                        <Target className='text-primary h-4 w-4' />
                      </div>
                      <div>
                        <p className='text-primary text-base leading-tight font-bold'>
                          {prizePool > 0
                            ? `${prizePool.toLocaleString()} ${draft.data?.reward?.rewardCurrency ?? 'USDC'}`
                            : 'No reward set'}
                        </p>
                        <p className='text-[11px] text-zinc-500'>reward</p>
                      </div>
                    </div>
                    {!isPublishing && (
                      <div className='absolute top-3 right-3 z-10 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100'>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setDraftToDelete({ id: draft.id, title });
                          }}
                          className='flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/70 text-zinc-400 hover:border-red-600 hover:text-red-500'
                          title='Delete draft'
                          disabled={deleteDraft.isPending}
                        >
                          <Trash2 className='h-4 w-4' />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <DeleteBountyDraftDialog
        open={!!draftToDelete}
        onOpenChange={open => {
          if (!open) setDraftToDelete(null);
        }}
        draftTitle={draftToDelete?.title ?? ''}
        isDeleting={deleteDraft.isPending}
        onConfirm={() => {
          if (draftToDelete) deleteDraft.mutate(draftToDelete.id);
        }}
      />
    </AuthGuard>
  );
}

function EmptyState({
  title,
  organizationId,
}: {
  title: string;
  organizationId: string;
}) {
  return (
    <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 py-24'>
      <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900'>
        <Target className='h-8 w-8 text-zinc-600' />
      </div>
      <h3 className='mb-2 text-lg font-medium text-white'>{title}</h3>
      <p className='mb-6 text-sm text-zinc-500'>
        Host a bounty to get contributors building.
      </p>
      <Link href={`/organizations/${organizationId}/bounties/new`}>
        <BoundlessButton className='gap-2'>
          <Plus className='h-4 w-4' />
          Host a bounty
        </BoundlessButton>
      </Link>
    </div>
  );
}
