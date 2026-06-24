'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Loader2,
  AlertCircle,
  Search,
  FileText,
  ExternalLink,
  Github,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AuthGuard } from '@/components/auth';
import Loading from '@/components/Loading';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useBountySubmissions } from '@/hooks/use-bounty';
import type { BountySubmission } from '@/lib/api/bounties';

function SubmissionCard({ submission }: { submission: BountySubmission }) {
  return (
    <div className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 space-y-3'>
      <div className='flex items-start justify-between gap-3'>
        <div>
          <p className='text-sm font-medium text-white'>{submission.title}</p>
          <p className='text-xs text-zinc-500 mt-0.5'>
            by {submission.userName} ·{' '}
            {new Date(submission.submittedAt).toLocaleDateString()}
          </p>
        </div>
        {submission.rank != null && (
          <span className='rounded-full bg-yellow-500/20 px-2.5 py-0.5 text-xs font-medium text-yellow-400'>
            #{submission.rank}
          </span>
        )}
      </div>

      <p className='text-sm text-zinc-400 line-clamp-3'>
        {submission.description}
      </p>

      <div className='flex gap-2'>
        {submission.repoUrl && (
          <Button
            size='sm'
            variant='outline'
            className='border-zinc-700 text-zinc-300 hover:bg-zinc-800'
            asChild
          >
            <a href={submission.repoUrl} target='_blank' rel='noopener noreferrer'>
              <Github className='mr-1.5 h-3.5 w-3.5' />
              Repo
            </a>
          </Button>
        )}
        {submission.demoUrl && (
          <Button
            size='sm'
            variant='outline'
            className='border-zinc-700 text-zinc-300 hover:bg-zinc-800'
            asChild
          >
            <a href={submission.demoUrl} target='_blank' rel='noopener noreferrer'>
              <ExternalLink className='mr-1.5 h-3.5 w-3.5' />
              Demo
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}

export default function SubmissionsPage() {
  const params = useParams();
  const organizationId = params.id as string;
  const bountyId = params.bountyId as string;

  const { submissions, loading, error, total } = useBountySubmissions({
    organizationId,
    bountyId,
  });

  const [search, setSearch] = useState('');

  const filtered = submissions.filter(
    s =>
      !search ||
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.userName.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AuthGuard redirectTo='/auth?mode=signin' fallback={<Loading />}>
      <div className='min-h-screen bg-black'>
        {/* Header */}
        <div className='border-b border-gray-900 p-4'>
          <div className='mx-auto max-w-7xl'>
            <h1 className='text-3xl font-light tracking-tight text-white sm:text-4xl'>
              Submissions
            </h1>
            <p className='mt-2 text-sm text-gray-400'>
              Review submitted work before selecting winners
            </p>
          </div>
        </div>

        <div className='mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-12'>
          {/* Stats */}
          <div className='mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-5'>
              <div className='flex items-center gap-2 text-xs text-zinc-500 uppercase tracking-wider mb-2'>
                <FileText className='h-3.5 w-3.5' />
                Total Submissions
              </div>
              <p className='text-2xl font-light text-white'>
                {loading ? '—' : total}
              </p>
            </div>
            <div className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-5'>
              <div className='flex items-center gap-2 text-xs text-zinc-500 uppercase tracking-wider mb-2'>
                <FileText className='h-3.5 w-3.5' />
                With Rank Assigned
              </div>
              <p className='text-2xl font-light text-white'>
                {loading ? '—' : submissions.filter(s => s.rank != null).length}
              </p>
            </div>
          </div>

          {error && (
            <Alert variant='destructive' className='mb-6 border-red-900/20 bg-red-950/20'>
              <AlertCircle className='h-4 w-4' />
              <AlertTitle>Error loading submissions</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Search */}
          <div className='mb-6 relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500' />
            <Input
              placeholder='Search submissions...'
              value={search}
              onChange={e => setSearch(e.target.value)}
              className='pl-9 bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-500'
            />
          </div>

          {loading ? (
            <div className='flex items-center justify-center py-20'>
              <Loader2 className='h-6 w-6 animate-spin text-gray-400' />
            </div>
          ) : filtered.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-20 text-zinc-500'>
              <FileText className='h-10 w-10 mb-3 opacity-40' />
              <p className='text-sm'>
                {search ? 'No submissions match your search' : 'No submissions yet'}
              </p>
            </div>
          ) : (
            <div className='space-y-4'>
              {filtered.map(sub => (
                <SubmissionCard key={sub.id} submission={sub} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
