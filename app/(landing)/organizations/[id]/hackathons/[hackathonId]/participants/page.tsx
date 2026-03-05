'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import MetricsCard from '@/components/organization/cards/MetricsCard';
import { useParams } from 'next/navigation';
import { useHackathons } from '@/hooks/use-hackathons';
import { getHackathonStatistics, getHackathon } from '@/lib/api/hackathons';
import { AuthGuard } from '@/components/auth';
import Loading from '@/components/Loading';
import { ParticipantsTable } from '@/components/organization/hackathons/ParticipantsTable';
import { ParticipantsGrid } from '@/components/organization/hackathons/ParticipantsGrid';
import { ParticipantToolbar } from '@/components/organization/hackathons/ParticipantToolbar';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { useReactTable, getCoreRowModel } from '@tanstack/react-table';
import TeamModal from '@/components/organization/cards/TeamModal';
import ReviewSubmissionModal from '@/components/organization/cards/ReviewSubmissionModal';
import GradeSubmissionModal from '@/components/organization/cards/GradeSubmissionModal';
import {
  useParticipantSubmission,
  transformParticipantToSubmission,
  SubmissionData,
} from '@/hooks/use-participant-submission';
import { Participant } from '@/lib/api/hackathons';
import { useDebounce } from '@/hooks/use-debounce';
import { toast } from 'sonner';
import { reportError } from '@/lib/error-reporting';

const PAGE_SIZE = 12;

type ParticipantStatus =
  | 'submitted'
  | 'not_submitted'
  | 'shortlisted'
  | 'disqualified'
  | 'all';
type ParticipationType = 'individual' | 'team' | 'all';

interface FilterState {
  search: string;
  status: ParticipantStatus;
  type: ParticipationType;
}

const mapFiltersToParams = (filters: FilterState, searchOverride?: string) => ({
  search: searchOverride !== undefined ? searchOverride : filters.search,
  status: filters.status === 'all' ? undefined : filters.status,
  type: filters.type === 'all' ? undefined : filters.type,
});

const ParticipantsPage: React.FC = () => {
  const params = useParams();
  const organizationId = params.id as string;
  const hackathonId = params.hackathonId as string;

  const [view, setView] = useState<'table' | 'grid'>('table');
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'all',
    type: 'all',
  });

  const hookOptions = useMemo(
    () => ({
      organizationId,
      autoFetch: false,
      pageSize: PAGE_SIZE, // Grid looks better with multiples of 3/4
    }),
    [organizationId]
  );

  const {
    participants,
    participantsLoading,
    participantsError,
    fetchParticipants,
    participantsPagination,
    currentHackathon,
    fetchHackathon,
  } = useHackathons(hookOptions);

  const actualHackathonId = currentHackathon?.id;

  // Modals state
  const [selectedParticipant, setSelectedParticipant] =
    useState<Participant | null>(null);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isJudgeModalOpen, setIsJudgeModalOpen] = useState(false);
  const [criteria, setCriteria] = useState<
    Array<{ title: string; weight: number; description?: string }>
  >([]);
  const [isLoadingCriteria, setIsLoadingCriteria] = useState(false);

  const debouncedSearch = useDebounce(filters.search, 300);

  // Submission data for the selected participant
  const submissionData = useParticipantSubmission(
    selectedParticipant || undefined
  );

  // Fetch hackathon and participants
  useEffect(() => {
    if (organizationId && hackathonId && !currentHackathon) {
      void fetchHackathon(hackathonId);
    }
  }, [organizationId, hackathonId, currentHackathon, fetchHackathon]);

  useEffect(() => {
    if (actualHackathonId) {
      fetchParticipants(
        actualHackathonId,
        1,
        PAGE_SIZE,
        mapFiltersToParams(filters, debouncedSearch)
      );
    }
  }, [
    actualHackathonId,
    fetchParticipants,
    debouncedSearch,
    filters.status,
    filters.type,
  ]);

  // Statistics
  const [statistics, setStatistics] = useState<{
    participantsCount: number;
    submissionsCount: number;
  } | null>(null);
  const [statisticsLoading, setStatisticsLoading] = useState(false);

  useEffect(() => {
    if (organizationId && actualHackathonId) {
      const loadStatistics = async () => {
        setStatisticsLoading(true);
        try {
          const response = await getHackathonStatistics(
            organizationId,
            actualHackathonId
          );
          const stats = response.data as {
            totalSubmissions?: number;
            activeParticipants?: number;
          };
          setStatistics({
            participantsCount: stats.activeParticipants ?? 0,
            submissionsCount: stats.totalSubmissions ?? 0,
          });
        } catch (err) {
          reportError(err, {
            context: 'participants-statistics',
            organizationId,
            hackathonId: actualHackathonId,
          });
        } finally {
          setStatisticsLoading(false);
        }
      };
      loadStatistics();
    }
  }, [organizationId, actualHackathonId]);

  // Handlers
  const handlePageChange = (page: number) => {
    if (actualHackathonId) {
      fetchParticipants(
        actualHackathonId,
        page,
        PAGE_SIZE,
        mapFiltersToParams(filters, debouncedSearch)
      );
    }
  };

  const handleReview = (participant: Participant) => {
    setSelectedParticipant(participant);
    setIsReviewModalOpen(true);
  };

  const handleViewTeam = (participant: Participant) => {
    setSelectedParticipant(participant);
    setIsTeamModalOpen(true);
  };

  const handleGrade = async (participant: Participant) => {
    if (!organizationId || !hackathonId) return;
    setSelectedParticipant(participant);

    setIsLoadingCriteria(true);
    try {
      const response = await getHackathon(hackathonId);
      if (response.success) {
        setCriteria(
          response.data?.judgingCriteria?.map(criterion => ({
            title: criterion.name || '',
            weight: criterion.weight || 0,
            description: criterion.description || '',
          })) || []
        );
        setIsJudgeModalOpen(true);
      } else {
        setCriteria([]);
        toast.error('Failed to load judging criteria');
      }
    } catch (err) {
      reportError(err, {
        context: 'participants-loadCriteria',
        organizationId,
        hackathonId,
      });
      setCriteria([]);
      toast.error('An error occurred while loading judging criteria');
    } finally {
      setIsLoadingCriteria(false);
    }
  };

  const handleReviewSuccess = () => {
    if (actualHackathonId) {
      fetchParticipants(
        actualHackathonId,
        participantsPagination.currentPage,
        PAGE_SIZE,
        mapFiltersToParams(filters, debouncedSearch)
      );
    }
  };

  // Mock table instance for DataTablePagination
  const table = useReactTable({
    data: participants,
    columns: [], // Not used for rendering here
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: participantsPagination.totalPages,
    state: {
      pagination: {
        pageIndex: participantsPagination.currentPage - 1,
        pageSize: participantsPagination.itemsPerPage,
      },
    },
    onPaginationChange: updater => {
      if (typeof updater === 'function') {
        const newState = (
          updater as (old: { pageIndex: number; pageSize: number }) => {
            pageIndex: number;
            pageSize: number;
          }
        )({
          pageIndex: participantsPagination.currentPage - 1,
          pageSize: participantsPagination.itemsPerPage,
        });
        handlePageChange(newState.pageIndex + 1);
      }
    },
  });

  // Memoized filter handlers to prevent infinite re-renders in ParticipantToolbar
  const handleSearchChange = useCallback((search: string) => {
    setFilters(f => ({ ...f, search }));
  }, []);

  const handleStatusFilterChange = useCallback((status: string) => {
    setFilters(f => ({ ...f, status: status as ParticipantStatus }));
  }, []);

  const handleTypeFilterChange = useCallback((type: string) => {
    setFilters(f => ({ ...f, type: type as ParticipationType }));
  }, []);

  return (
    <AuthGuard redirectTo='/auth?mode=signin' fallback={<Loading />}>
      <div className='bg-background min-h-screen space-y-6 p-8 text-white'>
        <div className='flex flex-col gap-6'>
          <div className='flex gap-4'>
            <MetricsCard
              title='Total Participants'
              value={statistics?.participantsCount ?? 0}
              subtitle={
                statisticsLoading
                  ? 'Loading...'
                  : `${statistics?.participantsCount ?? 0} registered`
              }
              showTrend={true}
            />
            <MetricsCard
              title='Total Submissions'
              value={statistics?.submissionsCount ?? 0}
              subtitle={
                statisticsLoading
                  ? 'Loading...'
                  : statistics?.participantsCount
                    ? `${((statistics.submissionsCount / statistics.participantsCount) * 100).toFixed(1)}% submission rate`
                    : '0% submission rate'
              }
            />
          </div>

          <ParticipantToolbar
            currentView={view}
            onViewChange={setView}
            onSearchChange={handleSearchChange}
            onStatusFilterChange={handleStatusFilterChange}
            onTypeFilterChange={handleTypeFilterChange}
          />

          {participantsError ? (
            <div className='rounded-lg border border-red-900 bg-red-950/20 p-8 text-center text-red-400'>
              <p className='font-medium'>Error loading participants</p>
              <p className='text-sm opacity-80'>{participantsError}</p>
            </div>
          ) : (
            <div className='space-y-6'>
              {view === 'table' ? (
                <ParticipantsTable
                  data={participants}
                  loading={participantsLoading}
                  onReview={handleReview}
                  onViewTeam={handleViewTeam}
                  onGrade={handleGrade}
                />
              ) : (
                <ParticipantsGrid
                  data={participants}
                  loading={participantsLoading}
                  onReview={handleReview}
                  onViewTeam={handleViewTeam}
                  onGrade={handleGrade}
                />
              )}

              <div className='flex justify-end'>
                <DataTablePagination
                  table={table}
                  loading={participantsLoading}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Centralized Modals */}
      {selectedParticipant && (
        <>
          <TeamModal
            open={isTeamModalOpen}
            onOpenChange={setIsTeamModalOpen}
            participationType={
              selectedParticipant.participationType === 'team'
                ? 'team'
                : 'individual'
            }
            teamName={selectedParticipant.teamName}
            submissionDate={
              selectedParticipant.submission?.submissionDate
                ? new Date(
                    selectedParticipant.submission.submissionDate
                  ).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : undefined
            }
            members={selectedParticipant.teamMembers?.map(member => ({
              id: member.userId,
              name: member.name,
              role: member.role,
              avatar: member.avatar,
            }))}
            teamId={selectedParticipant.teamId}
            organizationId={organizationId}
            hackathonId={hackathonId}
          />

          {submissionData && (
            <ReviewSubmissionModal
              open={isReviewModalOpen}
              onOpenChange={setIsReviewModalOpen}
              submissions={
                participants
                  .filter(p => !!p.submission)
                  .map(transformParticipantToSubmission)
                  .filter((s): s is SubmissionData => s !== undefined) || []
              }
              currentIndex={Math.max(
                0,
                participants
                  .filter(p => !!p.submission)
                  .findIndex(p => p.id === selectedParticipant.id)
              )}
              organizationId={organizationId}
              hackathonId={hackathonId}
              participantId={selectedParticipant.id}
              onSuccess={handleReviewSuccess}
            />
          )}

          {selectedParticipant.submission && (
            <GradeSubmissionModal
              open={isJudgeModalOpen}
              onOpenChange={setIsJudgeModalOpen}
              organizationId={organizationId}
              hackathonId={hackathonId}
              participantId={selectedParticipant.id}
              judgingCriteria={criteria}
              submission={{
                id: selectedParticipant.submission.id,
                projectName: selectedParticipant.submission.projectName,
                category: selectedParticipant.submission.category,
                description: selectedParticipant.submission.description,
                votes: Array.isArray(selectedParticipant.submission.votes)
                  ? selectedParticipant.submission.votes.length
                  : selectedParticipant.submission.votes || 0,
                comments: Array.isArray(selectedParticipant.submission.comments)
                  ? selectedParticipant.submission.comments.length
                  : selectedParticipant.submission.comments || 0,
                logo: selectedParticipant.submission.logo,
              }}
              onSuccess={handleReviewSuccess}
            />
          )}
        </>
      )}
    </AuthGuard>
  );
};

export default ParticipantsPage;
