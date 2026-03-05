'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { useOrganizerSubmissions } from '@/hooks/hackathon/use-organizer-submissions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AuthGuard } from '@/components/auth';
import Loading from '@/components/Loading';
import { SubmissionsManagement } from '@/components/organization/hackathons/submissions/SubmissionsManagement';
import { authClient } from '@/lib/auth-client';
import { getHackathon, type Hackathon } from '@/lib/api/hackathons';
import { reportError } from '@/lib/error-reporting';

export default function SubmissionsPage() {
  const params = useParams();
  const hackathonId = params.hackathonId as string;
  const organizationId = params.id as string;

  const {
    submissions,
    pagination,
    filters,
    loading,
    error,
    fetchSubmissions,
    updateFilters,
    goToPage,
    refresh,
  } = useOrganizerSubmissions(hackathonId);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);

  useEffect(() => {
    if (hackathonId) {
      fetchSubmissions();
      const fetchHackathonDetails = async () => {
        try {
          const res = await getHackathon(hackathonId);
          if (res.success && res.data) {
            setHackathon(res.data);
          }
        } catch (err) {
          reportError(err, {
            context: 'org-submissions-fetchHackathon',
            hackathonId,
          });
        }
      };
      fetchHackathonDetails();
    }
  }, [hackathonId, fetchSubmissions]);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: session } = await authClient.getSession();
        if (session?.user?.id) {
          setCurrentUserId(session.user.id);
        }
      } catch (err) {
        reportError(err, { context: 'org-submissions-fetchSession' });
      }
    };
    fetchSession();
  }, []);

  if (error) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-black p-6'>
        <Alert
          variant='destructive'
          className='max-w-md border-red-900/20 bg-red-950/20'
        >
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Unable to load submissions</AlertTitle>
          <AlertDescription className='text-sm text-gray-400'>
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

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
              View and manage all hackathon submissions
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className='mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-12'>
          {loading && submissions.length === 0 ? (
            <div className='flex items-center justify-center py-20'>
              <div className='flex flex-col items-center gap-3'>
                <Loader2 className='h-6 w-6 animate-spin text-gray-400' />
                <p className='text-sm text-gray-500'>Loading submissions...</p>
              </div>
            </div>
          ) : (
            <SubmissionsManagement
              submissions={submissions}
              pagination={pagination}
              filters={filters}
              loading={loading}
              onFilterChange={updateFilters}
              onPageChange={goToPage}
              onRefresh={refresh}
              organizationId={organizationId}
              hackathonId={hackathonId}
              currentUserId={currentUserId || undefined}
              hackathon={hackathon || undefined}
            />
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
