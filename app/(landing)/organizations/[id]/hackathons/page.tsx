'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import {
  Search,
  ArrowUpDown,
  Archive,
  PencilLine,
  Dot,
  ArrowUpRight,
  Plus,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import { BoundlessButton } from '@/components/buttons';
import { Badge } from '@/components/ui/badge';
import { useHackathons } from '@/hooks/use-hackathons';
import type { Hackathon, HackathonDraft } from '@/lib/api/hackathons';

const calculateDraftCompletion = (draft: HackathonDraft): number => {
  const fields = [
    draft.information?.title,
    draft.information?.banner,
    draft.information?.description,
    draft.information?.category,
    draft.timeline?.startDate,
    draft.timeline?.submissionDeadline,
    draft.timeline?.judgingDate,
    draft.timeline?.winnerAnnouncementDate,
    draft.timeline?.timezone,
    draft.participation?.participantType,
    draft.rewards?.prizeTiers?.length,
    draft.judging?.criteria?.length,
    draft.collaboration?.contactEmail,
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
  if (days === 1) return '1 day left';
  if (days < 7) return `${days} days left`;
  if (days < 30)
    return `About ${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} left`;
  if (days < 365)
    return `About ${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''} left`;
  return `About ${Math.floor(days / 365)} year${Math.floor(days / 365) > 1 ? 's' : ''} left`;
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

  const { hackathons, hackathonsLoading, drafts, draftsLoading } =
    useHackathons({
      organizationId,
      autoFetch: true,
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
      if (hackathon.status === 'draft') {
        return;
      }

      if (
        statusFilter === 'all' ||
        (statusFilter === 'open' && hackathon.status === 'published')
      ) {
        items.push({ type: 'hackathon', data: hackathon });
      }
    });

    let filtered = items;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = items.filter(item => {
        const title = item.data.information?.title?.toLowerCase() || '';
        return title.includes(query);
      });
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => {
        const category = item.data.information?.category?.toLowerCase() || '';
        return category === categoryFilter.toLowerCase();
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
  return (
    <div className='flex min-h-screen flex-col bg-black text-white'>
      <div className='flex-1'>
        <main className=''>
          <div className='mx-auto mb-8 max-w-7xl border-b border-gray-900 px-4 py-8 sm:px-6 lg:px-8'>
            <h1
              className='mb-6 text-left text-2xl font-normal text-white'
              style={{ fontFamily: 'sans-serif' }}
            >
              Manage Hackathons
            </h1>

            <div className='flex items-center gap-3'>
              <div className='relative flex-1'>
                <Search className='absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-700' />
                <Input
                  type='search'
                  placeholder='Search'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className='h-11 border-gray-700 bg-transparent pl-10 text-white placeholder:text-gray-700 focus-visible:ring-0 focus-visible:ring-offset-0'
                />
              </div>

              <Select
                value={sortBy}
                onValueChange={value => setSortBy(value as 'newest' | 'oldest')}
              >
                <SelectTrigger
                  size='sm'
                  className='!h-11 w-[120px] border-gray-700 bg-transparent text-white focus-visible:ring-0 focus-visible:ring-offset-0'
                >
                  <ArrowUpDown className='mr-2 size-4' />
                  <SelectValue placeholder='Sort' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='newest'>Newest</SelectItem>
                  <SelectItem value='oldest'>Oldest</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={statusFilter}
                onValueChange={value =>
                  setStatusFilter(value as 'all' | 'open' | 'draft')
                }
              >
                <SelectTrigger className='!h-11 w-[120px] border-gray-700 bg-transparent text-white focus-visible:ring-0 focus-visible:ring-offset-0'>
                  <SelectValue placeholder='Status' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All</SelectItem>
                  <SelectItem value='open'>Open</SelectItem>
                  <SelectItem value='draft'>Draft</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className='!h-11 w-[120px] border-gray-700 bg-transparent text-white focus-visible:ring-0 focus-visible:ring-offset-0'>
                  <SelectValue placeholder='Category' className='text-sm' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All</SelectItem>
                  <SelectItem value='defi'>DeFi</SelectItem>
                  <SelectItem value='nfts'>NFTs</SelectItem>
                  <SelectItem value='daos'>DAOs</SelectItem>
                  <SelectItem value='layer 2'>Layer 2</SelectItem>
                  <SelectItem value='cross-chain'>Cross-chain</SelectItem>
                  <SelectItem value='web3 gaming'>Web3 Gaming</SelectItem>
                  <SelectItem value='infrastructure'>Infrastructure</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='mx-auto max-w-7xl space-y-4 px-4 py-8 sm:px-6 lg:px-8'>
            {isLoading ? (
              <div className='flex items-center justify-center py-20'>
                <div className='flex flex-col items-center gap-4'>
                  <div className='border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent' />
                  <span className='text-sm text-gray-400'>
                    Loading hackathons...
                  </span>
                </div>
              </div>
            ) : allHackathons.length === 0 ? (
              <div className='border-active-bg2 rounded-lg border-2 border-dashed p-4 py-20'>
                <Link
                  href={`/organizations/${organizationId}/hackathons/new`}
                  className='text-primary flex h-full items-center justify-center gap-2 text-xs font-medium'
                >
                  <span>Host Hackathon</span>
                  <Plus className='size-5' />
                </Link>
              </div>
            ) : (
              allHackathons.map(item => {
                const isDraft =
                  item.type === 'draft' ||
                  (item.data as Hackathon | HackathonDraft).status === 'draft';
                const hackathon = item.data;
                const title =
                  hackathon.information?.title ||
                  hackathon.title ||
                  'Untitled Hackathon';
                const completion = isDraft
                  ? calculateDraftCompletion(hackathon as HackathonDraft)
                  : 0;
                const endDate =
                  hackathon.timeline?.submissionDeadline ||
                  hackathon.timeline?.winnerAnnouncementDate;
                const totalPrize =
                  hackathon.rewards?.prizeTiers?.reduce(
                    (sum, tier) => sum + (tier.amount || 0),
                    0
                  ) || 0;

                if (isDraft) {
                  return (
                    <Card
                      key={`draft-${hackathon._id}`}
                      className='bg-background hover:border-primary/40 cursor-pointer !rounded-none !rounded-t-[6px] !rounded-b-[20px] border-gray-900 p-0 transition-all duration-300'
                      onClick={() =>
                        router.push(
                          `/organizations/${organizationId}/hackathons/drafts/${hackathon._id}`
                        )
                      }
                    >
                      <CardContent className='flex flex-col p-0'>
                        <div className='bg-background-card flex items-start justify-between rounded-t-[6px] rounded-b-[20px] p-5'>
                          <div className='flex-1'>
                            <div className='mb-4 flex items-center gap-3'>
                              <div className='text-primary flex items-center gap-2 px-2 py-1 text-xs'>
                                <Archive className='size-3' />
                                <span>Saved as draft</span>
                              </div>
                            </div>

                            <h2 className='mb-4 text-xl font-medium text-white'>
                              {title}
                            </h2>

                            <div className='flex items-center gap-4'>
                              <div className='bg-active-bg h-2 flex-1 overflow-hidden rounded-full'>
                                <div
                                  className='h-full rounded-full bg-[#a7f950]'
                                  style={{ width: `${completion}%` }}
                                />
                              </div>
                              <span className='text-sm text-gray-300'>
                                {completion}% complete
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className='flex justify-end p-5'>
                          <BoundlessButton
                            variant='default'
                            size='lg'
                            className='gap-2'
                            onClick={e => {
                              e.stopPropagation();
                              router.push(
                                `/organizations/${organizationId}/hackathons/drafts/${hackathon._id}`
                              );
                            }}
                          >
                            Continue Editing
                            <PencilLine className='size-4' />
                          </BoundlessButton>
                        </div>
                      </CardContent>
                    </Card>
                  );
                }

                return (
                  <Card
                    key={`hackathon-${hackathon._id}`}
                    className='bg-background hover:border-primary/40 !rounded-none !rounded-t-[6px] !rounded-b-[20px] border-gray-900 p-0 transition-all duration-300'
                  >
                    <CardContent className='flex flex-col p-0'>
                      <div className='bg-background-card flex items-start justify-between rounded-t-[6px] rounded-b-[20px] p-5'>
                        <div className='flex-1'>
                          <div className='mb-4 flex items-center gap-3'>
                            {hackathon.status === 'published' ||
                            hackathon.status === 'ongoing' ? (
                              <>
                                <Badge
                                  className='bg-success-75 border-success-600 text-success-600 rounded-[4px] text-xs'
                                  variant='outline'
                                >
                                  <Dot className='' strokeWidth={6} />
                                  {hackathon.status.toUpperCase()}
                                </Badge>
                                {endDate && (
                                  <span className='text-success-75 text-sm'>
                                    {getTimeRemaining(endDate)}
                                  </span>
                                )}
                              </>
                            ) : (
                              <Badge
                                className='bg-gray-75 rounded-[4px] border-gray-600 text-xs text-gray-600'
                                variant='outline'
                              >
                                <Dot className='' strokeWidth={6} />
                                {hackathon.status.toUpperCase()}
                              </Badge>
                            )}
                          </div>

                          <h2 className='mb-4 text-xl font-medium text-white'>
                            {title}
                          </h2>

                          <div className='flex items-center gap-4 uppercase'>
                            <div>
                              <span className='font-medium text-white'>0</span>{' '}
                              <span className='text-sm text-gray-500'>
                                participants
                              </span>
                            </div>
                            <div>
                              <span className='font-medium text-white'>0</span>{' '}
                              <span className='text-sm text-gray-500'>
                                submissions
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className='flex items-center justify-between p-5'>
                        {totalPrize > 0 && (
                          <div className='flex items-center gap-2'>
                            <Image
                              src='/trophy.svg'
                              alt='Prize'
                              width={18}
                              height={18}
                            />
                            <span className='text-primary font-medium'>
                              ${totalPrize.toLocaleString()}
                            </span>
                            <span className='text-sm text-gray-300'>USDC</span>
                          </div>
                        )}
                        <div className='ml-auto flex items-center gap-2'>
                          <BoundlessButton
                            variant='outline'
                            size='lg'
                            className='gap-2'
                            onClick={e => {
                              e.stopPropagation();
                              router.push(
                                `/organizations/${organizationId}/hackathons/${hackathon._id}`
                              );
                            }}
                          >
                            Preview
                            <ArrowUpRight className='size-4' />
                          </BoundlessButton>
                          <BoundlessButton
                            variant='default'
                            size='lg'
                            className='gap-2'
                            onClick={e => {
                              e.stopPropagation();
                              router.push(
                                `/organizations/${organizationId}/hackathons/${hackathon._id}/settings`
                              );
                            }}
                          >
                            Manage
                          </BoundlessButton>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
