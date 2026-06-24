'use client';

import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  Loader2,
  AlertCircle,
  Search,
  CheckCircle2,
  XCircle,
  Star,
  Clock,
  User,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AuthGuard } from '@/components/auth';
import Loading from '@/components/Loading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  useBountyApplications,
} from '@/hooks/use-bounty';
import {
  updateApplicationStatus,
  type BountyApplication,
  type ApplicationStatus,
} from '@/lib/api/bounties';
import { reportError } from '@/lib/error-reporting';

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; className: string }
> = {
  PENDING: { label: 'Pending', className: 'bg-zinc-700/40 text-zinc-300' },
  SHORTLISTED: { label: 'Shortlisted', className: 'bg-blue-500/20 text-blue-400' },
  SELECTED: { label: 'Selected', className: 'bg-green-500/20 text-green-400' },
  DECLINED: { label: 'Declined', className: 'bg-red-500/20 text-red-400' },
};

function ApplicationCard({
  application,
  onStatusChange,
  isUpdating,
}: {
  application: BountyApplication;
  onStatusChange: (id: string, status: ApplicationStatus) => Promise<void>;
  isUpdating: boolean;
}) {
  const cfg = STATUS_CONFIG[application.status];

  return (
    <div className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 space-y-3'>
      <div className='flex items-start justify-between gap-3'>
        <div className='flex items-center gap-3'>
          <div className='flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800'>
            <User className='h-4 w-4 text-zinc-400' />
          </div>
          <div>
            <p className='text-sm font-medium text-white'>
              {application.userName}
            </p>
            <p className='text-xs text-zinc-500'>
              {new Date(application.submittedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.className}`}>
          {cfg.label}
        </span>
      </div>

      <p className='text-sm text-zinc-400 line-clamp-3'>{application.proposal}</p>

      <div className='flex gap-2 flex-wrap'>
        {application.status !== 'SHORTLISTED' && (
          <Button
            size='sm'
            variant='outline'
            className='border-blue-500/30 text-blue-400 hover:bg-blue-500/10'
            disabled={isUpdating}
            onClick={() => onStatusChange(application.id, 'SHORTLISTED')}
          >
            <Star className='mr-1.5 h-3.5 w-3.5' />
            Shortlist
          </Button>
        )}
        {application.status !== 'SELECTED' && (
          <Button
            size='sm'
            variant='outline'
            className='border-green-500/30 text-green-400 hover:bg-green-500/10'
            disabled={isUpdating}
            onClick={() => onStatusChange(application.id, 'SELECTED')}
          >
            <CheckCircle2 className='mr-1.5 h-3.5 w-3.5' />
            Select
          </Button>
        )}
        {application.status !== 'DECLINED' && (
          <Button
            size='sm'
            variant='outline'
            className='border-red-500/30 text-red-400 hover:bg-red-500/10'
            disabled={isUpdating}
            onClick={() => onStatusChange(application.id, 'DECLINED')}
          >
            <XCircle className='mr-1.5 h-3.5 w-3.5' />
            Decline
          </Button>
        )}
      </div>
    </div>
  );
}

export default function ApplicationsPage() {
  const params = useParams();
  const organizationId = params.id as string;
  const bountyId = params.bountyId as string;

  const { applications, setApplications, loading, error, total, refetch } =
    useBountyApplications({ organizationId, bountyId });

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<ApplicationStatus | 'ALL'>('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusChange = useCallback(
    async (id: string, status: ApplicationStatus) => {
      setUpdatingId(id);
      try {
        const res = await updateApplicationStatus(
          organizationId,
          bountyId,
          id,
          status
        );
        if (res.success && res.data) {
          setApplications(prev =>
            prev.map(a => (a.id === id ? { ...a, status } : a))
          );
          toast.success(`Application ${status.toLowerCase()}`);
        } else {
          toast.error(res.message || 'Failed to update application');
        }
      } catch (err) {
        reportError(err, { context: 'applications-updateStatus', id });
        toast.error('Failed to update application status');
      } finally {
        setUpdatingId(null);
      }
    },
    [organizationId, bountyId, setApplications]
  );

  const filtered = applications.filter(a => {
    const matchesTab = activeTab === 'ALL' || a.status === activeTab;
    const matchesSearch =
      !search ||
      a.userName.toLowerCase().includes(search.toLowerCase()) ||
      a.proposal.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const counts: Record<ApplicationStatus | 'ALL', number> = {
    ALL: applications.length,
    PENDING: applications.filter(a => a.status === 'PENDING').length,
    SHORTLISTED: applications.filter(a => a.status === 'SHORTLISTED').length,
    SELECTED: applications.filter(a => a.status === 'SELECTED').length,
    DECLINED: applications.filter(a => a.status === 'DECLINED').length,
  };

  return (
    <AuthGuard redirectTo='/auth?mode=signin' fallback={<Loading />}>
      <div className='min-h-screen bg-black'>
        {/* Header */}
        <div className='border-b border-gray-900 p-4'>
          <div className='mx-auto max-w-7xl'>
            <h1 className='text-3xl font-light tracking-tight text-white sm:text-4xl'>
              Applications
            </h1>
            <p className='mt-2 text-sm text-gray-400'>
              Review, shortlist, and select applicants for this bounty
            </p>
          </div>
        </div>

        <div className='mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-12'>
          {/* Stats row */}
          <div className='mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4'>
            {(
              [
                { key: 'PENDING', label: 'Pending', icon: Clock },
                { key: 'SHORTLISTED', label: 'Shortlisted', icon: Star },
                { key: 'SELECTED', label: 'Selected', icon: CheckCircle2 },
                { key: 'DECLINED', label: 'Declined', icon: XCircle },
              ] as const
            ).map(({ key, label, icon: Icon }) => (
              <div
                key={key}
                className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-4'
              >
                <div className='flex items-center gap-2 text-xs text-zinc-500 uppercase tracking-wider mb-2'>
                  <Icon className='h-3.5 w-3.5' />
                  {label}
                </div>
                <p className='text-2xl font-light text-white'>
                  {loading ? '—' : counts[key]}
                </p>
              </div>
            ))}
          </div>

          {error && (
            <Alert variant='destructive' className='mb-6 border-red-900/20 bg-red-950/20'>
              <AlertCircle className='h-4 w-4' />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Search */}
          <div className='mb-6 relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500' />
            <Input
              placeholder='Search applications...'
              value={search}
              onChange={e => setSearch(e.target.value)}
              className='pl-9 bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-500'
            />
          </div>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={v => setActiveTab(v as ApplicationStatus | 'ALL')}
          >
            <TabsList className='mb-6 bg-zinc-900/50'>
              {(['ALL', 'PENDING', 'SHORTLISTED', 'SELECTED', 'DECLINED'] as const).map(
                tab => (
                  <TabsTrigger key={tab} value={tab} className='text-xs'>
                    {tab === 'ALL' ? 'All' : STATUS_CONFIG[tab].label}
                    <span className='ml-1.5 rounded-full bg-zinc-800 px-1.5 py-0.5 text-xs'>
                      {counts[tab]}
                    </span>
                  </TabsTrigger>
                )
              )}
            </TabsList>

            <TabsContent value={activeTab}>
              {loading ? (
                <div className='flex items-center justify-center py-20'>
                  <Loader2 className='h-6 w-6 animate-spin text-gray-400' />
                </div>
              ) : filtered.length === 0 ? (
                <div className='flex flex-col items-center justify-center py-20 text-zinc-500'>
                  <User className='h-10 w-10 mb-3 opacity-40' />
                  <p className='text-sm'>No applications found</p>
                </div>
              ) : (
                <div className='space-y-4'>
                  {filtered.map(app => (
                    <ApplicationCard
                      key={app.id}
                      application={app}
                      onStatusChange={handleStatusChange}
                      isUpdating={updatingId === app.id}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthGuard>
  );
}
