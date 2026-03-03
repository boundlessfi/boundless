'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStatus } from '@/hooks/use-auth';
import BoundlessSheet from '@/components/sheet/boundless-sheet';
import EmptyState from '@/components/EmptyState';
import { useRouter } from 'next/navigation';
import { Trophy } from 'lucide-react';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow as ShadcnTableRow,
} from '@/components/ui/table';
import {
  SortField,
  SortDir,
  SubmissionRow,
  SortIcon,
  SubmissionsSheetContent,
  TableRow,
} from './submission-components';

export default function SubmissionsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStatus();

  const [sortField, setSortField] = useState<SortField>('submittedAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [selectedSubmission, setSelectedSubmission] =
    useState<SubmissionRow | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Pull submissions data from auth state — no extra API calls
  const rawSubmissions: SubmissionRow[] = useMemo(() => {
    const profile = (user as any)?.profile;
    if (!profile) return [];

    // Primary path: profile.user.hackathonSubmissionsAsParticipant
    const fromUser: any[] =
      profile?.user?.hackathonSubmissionsAsParticipant || [];
    // Secondary alias (some API shapes expose it at profile level)
    const fromProfile: any[] = profile?.hackathonSubmissionsAsParticipant || [];

    // Merge & deduplicate by id
    const merged = [...fromUser, ...fromProfile];
    const seen = new Set<string>();
    const deduped = merged.filter(s => {
      const id = s?.id || s?._id;
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });

    return deduped.map((s: any) => ({
      id: s.id || s._id || '',
      projectName: s.projectName || s.title || s.name || 'Untitled Submission',
      description: s.description,
      introduction: s.introduction,
      logo: s.logo,
      videoUrl: s.videoUrl,
      category: s.category,
      links: s.links,
      status: s.status || 'draft',
      rank: s.rank ?? null,
      submittedAt: s.submittedAt || s.submissionDate || s.createdAt || '',
      votes: s.votes,
      comments: s.comments,
      hackathon: s.hackathon,
      disqualificationReason: s.disqualificationReason,
    }));
  }, [user]);

  const sorted = useMemo(() => {
    return [...rawSubmissions].sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (sortField) {
        case 'projectName':
          aVal = (a.projectName || '').toLowerCase();
          bVal = (b.projectName || '').toLowerCase();
          break;
        case 'hackathon':
          aVal = (a.hackathon?.title || a.hackathon?.name || '').toLowerCase();
          bVal = (b.hackathon?.title || b.hackathon?.name || '').toLowerCase();
          break;
        case 'status':
          aVal = (a.status || '').toLowerCase();
          bVal = (b.status || '').toLowerCase();
          break;
        case 'submittedAt':
          aVal = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
          bVal = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
          break;
        case 'rank':
          aVal = a.rank ?? Infinity;
          bVal = b.rank ?? Infinity;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [rawSubmissions, sortField, sortDir]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const handleRowClick = (submission: SubmissionRow) => {
    setSelectedSubmission(submission);
    setSheetOpen(true);
  };

  const getAriaSort = (field: SortField) => {
    if (sortField !== field) return 'none';
    return sortDir === 'asc' ? 'ascending' : 'descending';
  };

  const thClass =
    'h-12 px-2 text-left align-middle font-medium text-zinc-400 [&:has([role=checkbox])]:pr-0';

  if (isLoading) {
    return (
      <div className='flex h-[400px] items-center justify-center'>
        <div className='border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent' />
      </div>
    );
  }

  return (
    <div className='container mx-auto max-w-7xl px-4 py-8 md:px-6 lg:py-12'>
      {/* Page header */}
      <motion.div
        className='mb-10'
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className='text-3xl font-bold tracking-tight text-white md:text-4xl'>
          My Submissions
        </h1>
        <p className='mt-2 text-zinc-400'>
          Track the full lifecycle of every hackathon submission you&apos;ve
          made.
        </p>
      </motion.div>

      {/* Summary strip */}
      {rawSubmissions.length > 0 && (
        <motion.div
          className='mb-6 flex flex-wrap gap-4'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          {(
            [
              {
                label: 'Total',
                value: rawSubmissions.length,
                color: 'text-white',
              },
              {
                label: 'Ranked',
                value: rawSubmissions.filter(s => {
                  const st = (s.status || '').toLowerCase();
                  return (
                    st === 'ranked' || st === 'shortlisted' || st === 'winner'
                  );
                }).length,
                color: 'text-primary',
              },
              {
                label: 'Under Review',
                value: rawSubmissions.filter(s => {
                  const st = (s.status || '')
                    .toLowerCase()
                    .replace(/[\s\-_]+/g, '_');
                  return st === 'under_review' || st === 'submitted';
                }).length,
                color: 'text-amber-400',
              },
              {
                label: 'Draft',
                value: rawSubmissions.filter(
                  s => (s.status || '').toLowerCase() === 'draft'
                ).length,
                color: 'text-zinc-400',
              },
            ] as const
          ).map(stat => (
            <div
              key={stat.label}
              className='flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.03] px-4 py-2 text-sm'
            >
              <span className={`text-lg font-bold ${stat.color}`}>
                {stat.value}
              </span>
              <span className='text-zinc-500'>{stat.label}</span>
            </div>
          ))}
        </motion.div>
      )}

      {/* Table */}
      <AnimatePresence mode='wait'>
        {sorted.length > 0 ? (
          <motion.div
            key='table'
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className='overflow-hidden rounded-xl border border-white/5 bg-white/[0.025]'
          >
            <div className='overflow-x-auto'>
              <Table className='min-w-[560px]'>
                <TableHeader>
                  <ShadcnTableRow className='border-white/5 hover:bg-transparent'>
                    <TableHead
                      className={`${thClass} pr-3 pl-4`}
                      aria-sort={getAriaSort('projectName')}
                    >
                      <button
                        type='button'
                        onClick={() => handleSort('projectName')}
                        className='flex w-full items-center gap-1 rounded-sm text-xs font-semibold tracking-wider uppercase hover:text-white focus-visible:ring-2 focus-visible:ring-[#a7f950] focus-visible:ring-offset-1 focus-visible:ring-offset-[#0e0c0c] focus-visible:outline-none'
                        aria-label='Sort by Project Name'
                      >
                        Project
                        <SortIcon
                          field='projectName'
                          sortField={sortField}
                          sortDir={sortDir}
                        />
                      </button>
                    </TableHead>
                    <TableHead
                      className={`${thClass} hidden px-3 sm:table-cell`}
                      aria-sort={getAriaSort('hackathon')}
                    >
                      <button
                        type='button'
                        onClick={() => handleSort('hackathon')}
                        className='flex w-full items-center gap-1 rounded-sm text-xs font-semibold tracking-wider uppercase hover:text-white focus-visible:ring-2 focus-visible:ring-[#a7f950] focus-visible:ring-offset-1 focus-visible:ring-offset-[#0e0c0c] focus-visible:outline-none'
                        aria-label='Sort by Hackathon'
                      >
                        Hackathon
                        <SortIcon
                          field='hackathon'
                          sortField={sortField}
                          sortDir={sortDir}
                        />
                      </button>
                    </TableHead>
                    <TableHead
                      className={`${thClass} px-3`}
                      aria-sort={getAriaSort('status')}
                    >
                      <button
                        type='button'
                        onClick={() => handleSort('status')}
                        className='flex w-full items-center gap-1 rounded-sm text-xs font-semibold tracking-wider uppercase hover:text-white focus-visible:ring-2 focus-visible:ring-[#a7f950] focus-visible:ring-offset-1 focus-visible:ring-offset-[#0e0c0c] focus-visible:outline-none'
                        aria-label='Sort by Status'
                      >
                        Status
                        <SortIcon
                          field='status'
                          sortField={sortField}
                          sortDir={sortDir}
                        />
                      </button>
                    </TableHead>
                    <TableHead
                      className={`${thClass} hidden px-3 lg:table-cell`}
                      aria-sort={getAriaSort('submittedAt')}
                    >
                      <button
                        type='button'
                        onClick={() => handleSort('submittedAt')}
                        className='flex w-full items-center gap-1 rounded-sm text-xs font-semibold tracking-wider uppercase hover:text-white focus-visible:ring-2 focus-visible:ring-[#a7f950] focus-visible:ring-offset-1 focus-visible:ring-offset-[#0e0c0c] focus-visible:outline-none'
                        aria-label='Sort by Submitted Date'
                      >
                        Submitted
                        <SortIcon
                          field='submittedAt'
                          sortField={sortField}
                          sortDir={sortDir}
                        />
                      </button>
                    </TableHead>
                    <TableHead
                      className={`${thClass} hidden px-3 xl:table-cell`}
                      aria-sort={getAriaSort('rank')}
                    >
                      <button
                        type='button'
                        onClick={() => handleSort('rank')}
                        className='flex w-full items-center gap-1 rounded-sm text-xs font-semibold tracking-wider uppercase hover:text-white focus-visible:ring-2 focus-visible:ring-[#a7f950] focus-visible:ring-offset-1 focus-visible:ring-offset-[#0e0c0c] focus-visible:outline-none'
                        aria-label='Sort by Rank'
                      >
                        Rank
                        <SortIcon
                          field='rank'
                          sortField={sortField}
                          sortDir={sortDir}
                        />
                      </button>
                    </TableHead>
                    <TableHead className='py-3 pr-4 pl-3' />
                  </ShadcnTableRow>
                </TableHeader>
                <TableBody>
                  {sorted.map((submission, i) => (
                    <TableRow
                      key={submission.id}
                      submission={submission}
                      index={i}
                      onClick={() => handleRowClick(submission)}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key='empty'
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <EmptyState
              title='No submissions yet'
              description="You haven't made any submission to any hackathons yet. Explore open hackathons and start building!"
              buttonText='Explore Hackathons'
              onAddClick={() => router.push('/hackathons')}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail sheet */}
      <BoundlessSheet
        open={sheetOpen}
        setOpen={setSheetOpen}
        title={selectedSubmission?.projectName}
        size='xl'
        minHeight='500px'
      >
        {selectedSubmission && (
          <SubmissionsSheetContent submission={selectedSubmission} />
        )}
      </BoundlessSheet>
    </div>
  );
}
