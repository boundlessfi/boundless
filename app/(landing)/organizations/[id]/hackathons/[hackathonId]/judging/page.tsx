'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import MetricsCard from '@/components/organization/cards/MetricsCard';
import JudgingParticipant from '@/components/organization/cards/JudgingParticipant';
import EmptyState from '@/components/EmptyState';
import { useParams } from 'next/navigation';
import {
  getJudgingSubmissionsForJudge,
  getJudgingCriteria,
  addJudge,
  removeJudge,
  getHackathonJudges,
  getJudgingResults,
  getJudgingWinners,
  publishJudgingResults,
  getJudgingCompleteness,
  type JudgingCriterion,
  type JudgingSubmission,
  type JudgingResult,
  type AggregatedJudgingResults,
  type JudgingCompletenessPreview,
} from '@/lib/api/hackathons/judging';
import { getSubmissionDetails } from '@/lib/api/hackathons/participants';
import { getOrganizationMembers } from '@/lib/api/organization';
import { getCrowdfundingProject } from '@/features/projects/api';
import { authClient } from '@/lib/auth-client';
import { useOrganization } from '@/lib/providers/OrganizationProvider';
import {
  Loader2,
  Trophy,
  CheckCircle2,
  Search,
  ArrowUpRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Mail,
  Users,
  Star,
  Zap,
  LayoutGrid,
  List,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { AuthGuard } from '@/components/auth/AuthGuard';
import Loading from '@/components/Loading';
import { reportError, reportMessage } from '@/lib/error-reporting';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { JudgingCriteriaList } from '@/components/organization/hackathons/judging/JudgingCriteriaList';
import JudgingResultsTable from '@/components/organization/hackathons/judging/JudgingResultsTable';
import TrackResultsSection from '@/components/organization/hackathons/judging/TrackResultsSection';
import AllocationPreviewCard from '@/components/organization/hackathons/judging/AllocationPreviewCard';
import CoverageMatrix from '@/components/organization/hackathons/judging/CoverageMatrix';
import { OrganizerJudgesPanel } from '@/components/organization/hackathons/judging/OrganizerJudgesPanel';
import {
  useHackathon,
  useHackathonTracks,
} from '@/hooks/hackathon/use-hackathon-queries';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function JudgingPage() {
  const params = useParams();
  const organizationId = params.id as string;
  const hackathonId = params.hackathonId as string;

  const { activeOrgId, activeOrg } = useOrganization();

  // Hackathon + tracks for the per-track Results section. Both are
  // best-effort — a 404 or empty array degrades gracefully (the
  // per-track UI just won't render).
  const { data: hackathonDetail } = useHackathon(hackathonId);
  const { data: tracksData } = useHackathonTracks(hackathonId);
  const tracks = tracksData ?? [];

  // Map trackId → human prize string ("$2,000 USDC") sourced from the
  // hackathon's bound prize tiers. Used as a chip on each track section
  // header so organizers know which prize a track is paying out.
  const prizeByTrackId = useMemo<Record<string, string>>(() => {
    const tiers =
      (
        hackathonDetail as
          | { prizeTiers?: Array<Record<string, unknown>> }
          | undefined
      )?.prizeTiers ?? [];
    const out: Record<string, string> = {};
    for (const t of tiers) {
      if (t?.kind !== 'TRACK' || !t?.trackId) continue;
      const amount = String(t.prizeAmount ?? '').trim();
      const currency = String(t.currency ?? 'USDC').trim();
      if (!amount) continue;
      out[t.trackId as string] =
        currency.length === 1
          ? `${currency}${amount}`
          : `${amount} ${currency}`;
    }
    return out;
  }, [hackathonDetail]);

  const [submissions, setSubmissions] = useState<JudgingSubmission[]>([]);
  const [criteria, setCriteria] = useState<JudgingCriterion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isAddingJudge, setIsAddingJudge] = useState(false);
  const [orgMembers, setOrgMembers] = useState<any[]>([]);
  const [currentJudges, setCurrentJudges] = useState<any[]>([]);
  const [isRefreshingJudges, setIsRefreshingJudges] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<
    'owner' | 'admin' | 'member' | null
  >(null);
  const [judgingResults, setJudgingResults] = useState<JudgingResult[]>([]);
  const [judgingSummary, setJudgingSummary] =
    useState<AggregatedJudgingResults | null>(null);
  const [isFetchingResults, setIsFetchingResults] = useState(false);
  const [winners, setWinners] = useState<JudgingResult[]>([]);
  const [isFetchingWinners, setIsFetchingWinners] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isCurrentUserJudge, setIsCurrentUserJudge] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  const [submissionSearchTerm, setSubmissionSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'score' | 'rank'>(
    'date'
  );
  const [viewMode, setViewMode] = useState<'detailed' | 'compact'>('detailed');
  const [submissionsPage, setSubmissionsPage] = useState(1);
  const [submissionsTotalPages, setSubmissionsTotalPages] = useState(1);
  const [resultsPage, setResultsPage] = useState(1);
  const [resultsTotalPages, setResultsTotalPages] = useState(1);
  const [isFetchingSubmissions, setIsFetchingSubmissions] = useState(false);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setSubmissionSearchTerm(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Cache using useRef to prevent redundant fetches on tab switch without triggering re-renders
  const lastFetchedRef = useRef<{ [key: string]: number }>({});
  const CACHE_TIMEOUT = 30000; // 30 seconds

  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [completeness, setCompleteness] =
    useState<JudgingCompletenessPreview | null>(null);
  const [completenessLoading, setCompletenessLoading] = useState(false);
  const [acceptPartial, setAcceptPartial] = useState(false);
  const [judgeToRemove, setJudgeToRemove] = useState<string | null>(null);

  const canManageJudges =
    currentUserRole === 'owner' || currentUserRole === 'admin';
  const canPublishResults = canManageJudges; // Admins can always publish
  const resultsPublished = !!judgingSummary?.resultsPublished;

  const fetchJudges = useCallback(async () => {
    // Priority: activeOrgId from context, then params.id
    const targetOrgId = activeOrgId || organizationId;
    if (!targetOrgId || !hackathonId) return;

    setIsRefreshingJudges(true);
    let finalMembers: any[] = [];
    let judges: any[] = [];

    // 1. Try to fetch organization members
    try {
      // First try legacy API
      try {
        const membersRes = await getOrganizationMembers(targetOrgId);
        if (
          membersRes.success &&
          Array.isArray(membersRes.data) &&
          membersRes.data.length > 0
        ) {
          finalMembers = membersRes.data;
        }
      } catch (err) {
        reportMessage(
          'Legacy member fetch failed, trying Better Auth fallback',
          'warning',
          { error: err instanceof Error ? err.message : String(err) }
        );
      }

      // If still empty, try Better Auth directly
      if (finalMembers.length === 0) {
        const { data: baData } = await authClient.organization.listMembers({
          query: { organizationId: targetOrgId, limit: 100 },
        });

        if (baData?.members && Array.isArray(baData.members)) {
          finalMembers = baData.members.map((m: any) => ({
            id: m.userId,
            userId: m.userId,
            name: m.user.name || m.user.email,
            email: m.user.email,
            image: m.user.image,
            role: m.role,
          }));
        }
      }
    } catch (err) {
      reportError(err, {
        context: 'judging-fetchMembers',
        organizationId: targetOrgId,
      });
    }

    // 2. Fetch judges
    try {
      const judgesRes = await getHackathonJudges(targetOrgId, hackathonId);
      if (judgesRes.success) {
        judges = judgesRes.data || [];
      }
    } catch (err) {
      reportError(err, { context: 'judging-fetchJudges', hackathonId });
    }

    setOrgMembers(finalMembers);
    setCurrentJudges(judges);
    setIsRefreshingJudges(false);

    // Determine current user role and judge status
    const { data: session } = await authClient.getSession();
    const currentUserId = session?.user?.id;
    if (currentUserId && finalMembers.length > 0) {
      const me = finalMembers.find(
        (m: any) => m.userId === currentUserId || m.id === currentUserId
      );
      setCurrentUserRole(me?.role || null);

      // Check if current user is a judge
      const isJudge = judges.some(
        (j: any) => j.userId === currentUserId || j.id === currentUserId
      );
      setIsCurrentUserJudge(isJudge);
    }

    // Set current user ID for child components
    if (currentUserId) {
      setCurrentUserId(currentUserId);
    }
  }, [organizationId, hackathonId, activeOrgId]);

  const fetchResults = useCallback(
    async (force = false) => {
      if (!organizationId || !hackathonId) return;

      // Check cache
      const now = Date.now();
      if (
        !force &&
        lastFetchedRef.current['results'] &&
        now - lastFetchedRef.current['results'] < CACHE_TIMEOUT
      ) {
        return;
      }

      setIsFetchingResults(true);
      try {
        const res = await getJudgingResults(
          organizationId,
          hackathonId,
          resultsPage,
          10,
          submissionSearchTerm,
          sortBy,
          'desc'
        );

        if (res.success && res.data) {
          setJudgingResults(res.data.results || []);
          setJudgingSummary(res.data);

          if (res.data.pagination?.totalPages) {
            setResultsTotalPages(res.data.pagination.totalPages);
          }

          lastFetchedRef.current['results'] = now;
        } else {
          setJudgingResults([]);
          setJudgingSummary(null);
          if (!res.success) {
            toast.error(
              (res as any).message || 'Failed to load judging results'
            );
          }
        }
      } catch (error: any) {
        reportError(error, {
          context: 'judging-fetchResults',
          organizationId,
          hackathonId,
        });
        setJudgingResults([]);
        setJudgingSummary(null);
        toast.error(
          error.response?.data?.message ||
            error.message ||
            'Failed to load judging results'
        );
      } finally {
        setIsFetchingResults(false);
      }
    },
    [organizationId, hackathonId, resultsPage, submissionSearchTerm, sortBy]
  );

  const fetchWinners = useCallback(
    async (force = false) => {
      if (!organizationId || !hackathonId) return;

      // Check cache
      const now = Date.now();
      if (
        !force &&
        lastFetchedRef.current['winners'] &&
        now - lastFetchedRef.current['winners'] < CACHE_TIMEOUT
      ) {
        return;
      }

      setIsFetchingWinners(true);
      try {
        const res = await getJudgingWinners(
          organizationId,
          hackathonId,
          1,
          50,
          submissionSearchTerm,
          'score',
          'desc'
        );
        if (res.success && res.data) {
          setWinners(Array.isArray(res.data) ? res.data : []);
          lastFetchedRef.current['winners'] = now;
        }
      } catch (error) {
        reportError(error, {
          context: 'judging-fetchWinners',
          organizationId,
          hackathonId,
        });
      } finally {
        setIsFetchingWinners(false);
      }
    },
    [organizationId, hackathonId, submissionSearchTerm]
  );

  const fetchData = useCallback(async () => {
    if (!organizationId || !hackathonId) return;

    // Only show global loading on initial fetch
    if (submissions.length === 0) {
      setIsLoading(true);
    }
    setIsFetchingSubmissions(true);
    try {
      // Use the new optimized endpoint that returns submissions, criteria and myScore in one go
      const submissionsRes = await getJudgingSubmissionsForJudge(
        hackathonId,
        submissionsPage,
        12,
        submissionSearchTerm,
        sortBy,
        'desc'
      );

      // Trigger other data fetches in parallel
      fetchJudges();
      fetchResults();
      fetchWinners();

      if (submissionsRes.success && submissionsRes.data) {
        const {
          submissions: subData,
          criteria: critData,
          pagination,
        } = submissionsRes.data;

        setSubmissions(subData || []);
        setCriteria(critData || []);

        if (pagination?.totalPages) {
          setSubmissionsTotalPages(pagination.totalPages);
        } else if (pagination?.total) {
          setSubmissionsTotalPages(Math.ceil(pagination.total / 12));
        }
      } else {
        setSubmissions([]);
        setCriteria([]);
      }
    } catch (error) {
      reportError(error, {
        context: 'judging-fetchData',
        organizationId,
        hackathonId,
      });
      toast.error('Failed to load judging data');
    } finally {
      setIsLoading(false);
      setIsFetchingSubmissions(false);
    }
  }, [
    organizationId,
    hackathonId,
    submissionsPage,
    submissionSearchTerm,
    fetchJudges,
    fetchResults,
    fetchWinners,
    sortBy,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSuccess = () => {
    fetchData();
    fetchResults(); // Refresh results to update metrics/table
  };

  const handleAddJudge = async (userId: string, email: string) => {
    setIsAddingJudge(true);
    try {
      const res = await addJudge(organizationId, hackathonId, {
        userId,
        email,
      });
      if (res.success) {
        toast.success('Judge assigned successfully');
        fetchJudges();
      } else {
        toast.error(res.message || 'Failed to assign judge');
      }
    } catch (error: any) {
      reportError(error, {
        context: 'judging-addJudge',
        organizationId,
        hackathonId,
      });
      toast.error(
        error.response?.data?.message ||
          error.message ||
          'Failed to assign judge'
      );
    } finally {
      setIsAddingJudge(false);
    }
  };

  const handleRemoveJudge = async (userId: string) => {
    try {
      const res = await removeJudge(organizationId, hackathonId, userId);
      if (res.success) {
        toast.success('Judge removed successfully');
        fetchJudges();
      } else {
        toast.error(res.message || 'Failed to remove judge');
      }
    } catch (error: any) {
      reportError(error, {
        context: 'judging-removeJudge',
        organizationId,
        hackathonId,
        userId,
      });
      toast.error(error.message || 'Failed to remove judge');
    }
  };

  // Use submissions directly as they are now filtered/sorted by the backend
  const filteredAndSortedSubmissions = submissions;

  const handlePageChange = (newPage: number) => {
    if (activeTab === 'overview') {
      if (newPage >= 1 && newPage <= submissionsTotalPages) {
        setSubmissionsPage(newPage);
      }
    } else if (activeTab === 'results') {
      if (newPage >= 1 && newPage <= resultsTotalPages) {
        setResultsPage(newPage);
      }
    }
  };

  const handlePublishResults = async () => {
    setIsPublishing(true);
    try {
      const res = await publishJudgingResults(organizationId, hackathonId, {
        acceptPartial,
      });
      if (res.success) {
        toast.success('Results published successfully!');
        setIsPublishDialogOpen(false);
        setAcceptPartial(false);
        fetchResults(true);
        fetchWinners(true);
      } else {
        toast.error(res.message || 'Failed to publish results');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to publish results');
    } finally {
      setIsPublishing(false);
    }
  };

  // Pull the completeness snapshot every time the dialog opens so the
  // organizer sees fresh numbers (a judge may have submitted scores
  // since the page loaded).
  useEffect(() => {
    if (!isPublishDialogOpen) {
      setAcceptPartial(false);
      return;
    }
    let cancelled = false;
    setCompletenessLoading(true);
    getJudgingCompleteness(organizationId, hackathonId)
      .then(res => {
        if (cancelled) return;
        if (res.success && res.data) setCompleteness(res.data);
      })
      .catch(() => {
        // Non-fatal: the dialog still works, organizer just won't see
        // the incompleteness summary.
      })
      .finally(() => {
        if (!cancelled) setCompletenessLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isPublishDialogOpen, organizationId, hackathonId]);

  // Use pre-calculated statistics from the API if available, otherwise fallback to local calculation
  const gradedCount = judgingSummary
    ? judgingSummary.submissionsScoredCount
    : judgingResults.length;

  const totalPossibleSubmissions = judgingSummary
    ? judgingSummary.totalSubmissions
    : submissions.length;

  const averageHackathonScore = judgingSummary
    ? judgingSummary.averageScoreAcrossAll
    : judgingResults.length > 0
      ? judgingResults.reduce(
          (acc, curr) => acc + (curr.averageScore || 0),
          0
        ) / judgingResults.length
      : 0;

  const assignedJudgesCount = judgingSummary
    ? judgingSummary.judgesAssigned
    : currentJudges.length;

  return (
    <AuthGuard redirectTo='/auth?mode=signin' fallback={<Loading />}>
      <div className='bg-background min-h-screen space-y-6 p-8 text-white'>
        <div className='flex flex-col gap-6'>
          <div className='flex flex-col justify-between gap-4 border-b border-gray-900 pb-6 md:flex-row md:items-end'>
            <div>
              <h1 className='text-3xl font-bold tracking-tight'>
                Judging Dashboard
              </h1>
              <p className='text-gray-400'>
                Manage and grade shortlisted submissions
              </p>
            </div>

            <div className='flex items-center gap-3'>
              {/* Optional: Add a refresh button here for premium feel */}
              <Button
                variant='outline'
                size='sm'
                onClick={() => fetchData()}
                className='border-gray-800 bg-black text-gray-400 hover:text-white'
              >
                Refresh Data
              </Button>
            </div>
          </div>

          <div className='custom-scrollbar flex gap-4 overflow-x-auto pb-2'>
            <MetricsCard
              title='Total Submissions'
              value={totalPossibleSubmissions}
              // icon={<Zap className='h-4 w-4 text-blue-400' />}
              className='min-w-[200px] border-gray-900 bg-white/5'
            />
            <MetricsCard
              title='Graded / Shortlisted'
              value={`${gradedCount} / ${totalPossibleSubmissions}`}
              subtitle={`${totalPossibleSubmissions > 0 ? Math.round((gradedCount / totalPossibleSubmissions) * 100) : 0}% Completion`}
              // icon={<Star className='h-4 w-4 text-amber-400' />}
              className='min-w-[200px] border-gray-900 bg-white/5'
            />
            <MetricsCard
              title='Average Score'
              value={Number(averageHackathonScore).toFixed(1)}
              // icon={<Trophy className='h-4 w-4 text-yellow-500' />}
              className='min-w-[200px] border-gray-900 bg-white/5'
            />
            <MetricsCard
              title='Active Judges'
              value={assignedJudgesCount}
              // icon={<Users className='text-primary h-4 w-4' />}
              className='min-w-[200px] border-gray-900 bg-white/5'
            />
          </div>

          <Tabs
            defaultValue='overview'
            value={activeTab}
            onValueChange={value => {
              setActiveTab(value);
              if (value === 'results') {
                setSortBy('score'); // Show auto-rank by default
                fetchResults(false);
                fetchWinners(false);
              }
            }}
            className='w-full'
          >
            <div className='flex flex-col gap-6'>
              <div className='flex flex-col items-center justify-between gap-4 md:flex-row'>
                <TabsList className='bg-background/8 border-gray-900'>
                  <TabsTrigger
                    value='overview'
                    className='data-[state=active]:bg-primary data-[state=active]:text-primary-foreground'
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value='criteria'
                    className='data-[state=active]:bg-primary data-[state=active]:text-primary-foreground'
                  >
                    Criteria
                  </TabsTrigger>
                  <TabsTrigger
                    value='judges'
                    className='data-[state=active]:bg-primary data-[state=active]:text-primary-foreground'
                  >
                    Judges
                  </TabsTrigger>
                  <TabsTrigger
                    value='results'
                    className='data-[state=active]:bg-primary data-[state=active]:text-primary-foreground'
                  >
                    Results
                  </TabsTrigger>
                </TabsList>

                {/* Global Filters & Search */}
                <div className='flex w-full flex-col flex-wrap justify-end gap-4 md:w-auto md:flex-row md:items-center'>
                  <div className='relative max-w-md flex-1 md:min-w-[350px]'>
                    {isFetchingSubmissions || isFetchingResults ? (
                      <Loader2 className='text-primary absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 animate-spin' />
                    ) : (
                      <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500' />
                    )}
                    <Input
                      placeholder='Search projects, participants, or categories...'
                      className='focus:ring-primary border-gray-900 bg-black pl-10 text-sm'
                      value={searchQuery}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setSearchQuery(e.target.value);
                        if (activeTab === 'overview') setSubmissionsPage(1);
                        if (activeTab === 'results') setResultsPage(1);
                      }}
                    />
                  </div>

                  <div className='flex items-center gap-3'>
                    <div className='flex items-center gap-2'>
                      <span className='text-xs text-gray-500'>Sort:</span>
                      <Select
                        value={sortBy}
                        onValueChange={(value: any) => {
                          setSortBy(value);
                          if (activeTab === 'overview') setSubmissionsPage(1);
                          if (activeTab === 'results') setResultsPage(1);
                        }}
                      >
                        <SelectTrigger className='h-9 w-[130px] border-gray-900 bg-black text-xs'>
                          <SelectValue placeholder='Sort by' />
                        </SelectTrigger>
                        <SelectContent className='border-gray-900 bg-zinc-950 text-white'>
                          <SelectItem value='date'>Recently Added</SelectItem>
                          <SelectItem value='score'>Highest Score</SelectItem>
                          <SelectItem value='rank'>Top Ranked</SelectItem>
                          <SelectItem value='name'>Project Name</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className='mx-2 h-8 w-px bg-gray-900' />

                    <div className='flex items-center rounded-md border border-gray-900 p-1'>
                      <Button
                        variant={
                          viewMode === 'detailed' ? 'secondary' : 'ghost'
                        }
                        size='icon'
                        className='h-7 w-7 rounded-sm'
                        onClick={() => setViewMode('detailed')}
                      >
                        <LayoutGrid className='h-3.5 w-3.5' />
                      </Button>
                      <Button
                        variant={viewMode === 'compact' ? 'secondary' : 'ghost'}
                        size='icon'
                        className='h-7 w-7 rounded-sm'
                        onClick={() => setViewMode('compact')}
                      >
                        <List className='h-3.5 w-3.5' />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className='h-px w-full bg-gray-900/50' />
            </div>

            <TabsContent value='overview' className='mt-6 space-y-6'>
              {/* Coverage heatmap. Surfaces idle judges + orphan
                  submissions before they become a publish blocker. */}
              <CoverageMatrix
                organizationId={organizationId}
                hackathonId={hackathonId}
                refreshKey={submissionsPage}
              />

              {isLoading && submissions.length === 0 ? (
                <div className='flex items-center justify-center py-12'>
                  <Loader2 className='h-8 w-8 animate-spin text-gray-400' />
                </div>
              ) : filteredAndSortedSubmissions.length > 0 ? (
                <div className='space-y-4'>
                  <div
                    className={
                      viewMode === 'detailed'
                        ? 'flex flex-col gap-4'
                        : 'grid grid-cols-1 gap-2'
                    }
                  >
                    {filteredAndSortedSubmissions.map(submission => (
                      <JudgingParticipant
                        key={
                          (submission as any).id ||
                          (submission as any).participant?.id
                        }
                        submission={submission}
                        organizationId={organizationId}
                        hackathonId={hackathonId}
                        hasCriteria={criteria.length > 0}
                        criteria={criteria}
                        judges={currentJudges}
                        isJudgesLoading={isRefreshingJudges}
                        currentUserId={currentUserId || undefined}
                        canOverrideScores={canManageJudges}
                        onSuccess={handleSuccess}
                        variant={
                          viewMode === 'compact' ? 'compact' : 'detailed'
                        }
                      />
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  {submissionsTotalPages > 1 && (
                    <div className='mt-8 flex items-center justify-center gap-4'>
                      <Button
                        variant='outline'
                        size='sm'
                        disabled={submissionsPage === 1 || isLoading}
                        onClick={() => handlePageChange(submissionsPage - 1)}
                        className='border-gray-900 bg-black hover:bg-white/5'
                      >
                        <ChevronLeft className='mr-1 h-4 w-4' />
                        Previous
                      </Button>
                      <span className='text-sm text-gray-500'>
                        Page {submissionsPage} of {submissionsTotalPages}
                      </span>
                      <Button
                        variant='outline'
                        size='sm'
                        disabled={
                          submissionsPage === submissionsTotalPages || isLoading
                        }
                        onClick={() => handlePageChange(submissionsPage + 1)}
                        className='border-gray-900 bg-black hover:bg-white/5'
                      >
                        Next
                        <ChevronRight className='ml-1 h-4 w-4' />
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <EmptyState
                  title='No Submissions Found'
                  description={
                    submissionSearchTerm
                      ? `No submissions matching "${submissionSearchTerm}"`
                      : 'There are currently no submissions to judge.'
                  }
                />
              )}
            </TabsContent>

            <TabsContent value='criteria' className='mt-6'>
              <JudgingCriteriaList criteria={criteria} />
            </TabsContent>

            <TabsContent value='judges' className='mt-6'>
              <OrganizerJudgesPanel
                organizationId={organizationId}
                hackathonId={hackathonId}
                currentJudges={currentJudges}
                isRefreshingJudges={isRefreshingJudges}
                canManage={canManageJudges}
                onRemoveJudge={userId => setJudgeToRemove(userId)}
                onJudgesChanged={fetchJudges}
              />
              {/* Legacy org-members picker — superseded by email invitations.
                  Kept hidden behind a flag so we can re-surface it if a
                  power-user organizer asks for the direct-add path. */}
              {false && (
                <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
                  {/* Current Judges List */}
                  <div className='bg-background/8 h-fit rounded-lg border border-gray-900 p-6'>
                    <h3 className='mb-4 flex items-center gap-2 text-lg font-medium'>
                      Current Judges
                      {isRefreshingJudges && (
                        <Loader2 className='h-4 w-4 animate-spin text-gray-500' />
                      )}
                    </h3>
                    <div className='space-y-4'>
                      {currentJudges.length === 0 ? (
                        <EmptyState
                          title='No Judges Assigned'
                          description='No judges assigned yet.'
                          type='compact'
                          className='py-8'
                        />
                      ) : (
                        currentJudges.map((judge: any, index: number) => (
                          <div
                            key={judge.id}
                            className='flex items-center justify-between rounded-md border border-white/10 bg-white/5 p-3'
                          >
                            <div className='flex items-center gap-3'>
                              <div className='h-8 w-8 overflow-hidden rounded-full bg-gray-800'>
                                {judge.image ? (
                                  <img
                                    src={judge.image}
                                    alt=''
                                    className='h-full w-full object-cover'
                                  />
                                ) : (
                                  <div className='flex h-full w-full items-center justify-center text-xs font-bold text-gray-500'>
                                    {judge.name?.[0] || '?'}
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className='text-sm font-medium'>
                                  {judge.name}
                                </p>
                                <p className='text-xs text-gray-500'>
                                  Judge {index + 1}
                                </p>
                              </div>
                            </div>
                            {canManageJudges && (
                              <Button
                                variant='ghost'
                                size='sm'
                                className='text-red-400 hover:bg-red-400/10 hover:text-red-300'
                                onClick={() =>
                                  setJudgeToRemove(judge.userId || judge.id)
                                }
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Org Members List - Only visible to admin/owner */}
                  {canManageJudges && (
                    <div className='bg-background/8 h-fit rounded-lg border border-gray-900 p-6'>
                      <div className='flex flex-col gap-4'>
                        <h3 className='text-lg font-medium'>
                          Add from Organization Members
                        </h3>
                        <div className='relative'>
                          <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500' />
                          <Input
                            placeholder='Search members by name or email...'
                            className='focus:ring-primary border-gray-900 bg-black pl-10 text-sm'
                            value={memberSearchTerm}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ) => setMemberSearchTerm(e.target.value)}
                          />
                        </div>
                        <p className='text-xs text-gray-500'>
                          Select members from your organization to assign them
                          as judges.
                        </p>
                      </div>
                      <div className='custom-scrollbar mt-6 max-h-[400px] space-y-3 overflow-y-auto pr-2'>
                        {orgMembers
                          .filter(m => {
                            const search = memberSearchTerm.toLowerCase();
                            return (
                              m.name?.toLowerCase().includes(search) ||
                              m.email?.toLowerCase().includes(search) ||
                              m.username?.toLowerCase().includes(search)
                            );
                          })
                          .map((member: any) => {
                            const isAlreadyJudge = currentJudges.some(
                              j => j.id === member.id || j.userId === member.id
                            );
                            return (
                              <div
                                key={member.id}
                                className='flex items-center justify-between rounded-md border border-white/5 bg-white/5 p-3 transition-colors hover:bg-white/10'
                              >
                                <div className='flex items-center gap-3'>
                                  <div className='h-8 w-8 overflow-hidden rounded-full bg-gray-800'>
                                    {member.image ? (
                                      <img
                                        src={member.image}
                                        alt=''
                                        className='h-full w-full object-cover'
                                      />
                                    ) : (
                                      <div className='flex h-full w-full items-center justify-center text-xs font-bold text-gray-500'>
                                        {member.name?.[0] ||
                                          member.username?.[0] ||
                                          '?'}
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <p className='text-sm font-medium'>
                                      {member.name || member.username}
                                    </p>
                                    <p className='text-xs text-gray-500'>
                                      {member.email}
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  size='sm'
                                  variant={
                                    isAlreadyJudge ? 'outline' : 'default'
                                  }
                                  className={
                                    isAlreadyJudge
                                      ? 'cursor-not-allowed border-gray-800 opacity-50'
                                      : ''
                                  }
                                  disabled={isAddingJudge || isAlreadyJudge}
                                  onClick={() =>
                                    handleAddJudge(member.id, member.email)
                                  }
                                >
                                  {isAlreadyJudge
                                    ? 'Already Judge'
                                    : 'Add as Judge'}
                                </Button>
                              </div>
                            );
                          })}
                        {orgMembers.length === 0 && !isRefreshingJudges && (
                          <EmptyState
                            title='No Members Found'
                            description='No organization members found.'
                            type='compact'
                            className='py-8'
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value='results' className='mt-6'>
              <div className='flex flex-col gap-6'>
                {resultsPublished && (
                  <div className='flex items-center gap-4 rounded-lg border border-green-500/20 bg-green-500/10 p-4'>
                    <CheckCircle2 className='h-10 w-10 shrink-0 text-green-500' />
                    <div>
                      <h3 className='text-sm font-semibold text-green-400'>
                        Results published
                      </h3>
                      <p className='text-xs text-gray-400'>
                        Winner rankings are live. This hackathon&apos;s results
                        have been finalized.
                      </p>
                    </div>
                  </div>
                )}

                {!resultsPublished &&
                  canPublishResults &&
                  judgingResults.length > 0 && (
                    <div className='bg-primary/5 border-primary/10 flex items-center justify-between rounded-lg border p-4 shadow-sm'>
                      <div className='flex items-center gap-4'>
                        <div className='bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full'>
                          <Trophy className='text-primary h-5 w-5' />
                        </div>
                        <div>
                          <h3 className='text-primary text-sm font-semibold'>
                            Finalize Competition
                          </h3>
                          <p className='text-xs text-gray-400'>
                            Publish the current rankings to name the winners.
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => setIsPublishDialogOpen(true)}
                        disabled={isPublishing}
                        className='bg-primary text-primary-foreground hover:bg-primary/90 px-8 font-bold shadow-lg'
                      >
                        {isPublishing ? 'Publishing...' : 'Publish Results'}
                      </Button>
                    </div>
                  )}

                {!resultsPublished && (
                  <AllocationPreviewCard
                    organizationId={organizationId}
                    hackathonId={hackathonId}
                    refreshKey={resultsPage}
                  />
                )}

                {winners.length > 0 && (
                  <div className='space-y-4'>
                    <h2 className='flex items-center gap-2 text-lg font-bold text-yellow-500'>
                      <Trophy className='h-5 w-5' />
                      Final Winners
                    </h2>
                    <JudgingResultsTable
                      results={winners}
                      organizationId={organizationId}
                      hackathonId={hackathonId}
                      totalJudges={currentJudges.length}
                      criteria={criteria}
                      canManage={canManageJudges}
                      winnerOverrides={judgingSummary?.winnerOverrides}
                    />
                  </div>
                )}

                {tracks.length > 0 && judgingResults.length > 0 && (
                  <TrackResultsSection
                    tracks={tracks}
                    results={judgingResults}
                    totalJudges={currentJudges.length}
                    criteria={criteria}
                    canManage={canManageJudges}
                    winnerOverrides={judgingSummary?.winnerOverrides}
                    prizeByTrackId={prizeByTrackId}
                    organizationId={organizationId}
                    hackathonId={hackathonId}
                  />
                )}

                <div className='space-y-4'>
                  <h2 className='text-lg font-bold text-gray-200'>
                    Current Standings
                  </h2>
                  {isFetchingResults && judgingResults.length === 0 ? (
                    <div className='flex items-center justify-center py-12'>
                      <Loader2 className='h-8 w-8 animate-spin text-gray-400' />
                    </div>
                  ) : judgingResults.length > 0 ? (
                    <>
                      <JudgingResultsTable
                        results={judgingResults}
                        organizationId={organizationId}
                        hackathonId={hackathonId}
                        totalJudges={currentJudges.length}
                        criteria={criteria}
                        canManage={canManageJudges}
                        winnerOverrides={judgingSummary?.winnerOverrides}
                      />

                      {/* Pagination Controls for Results */}
                      {resultsTotalPages > 1 && (
                        <div className='mt-8 flex items-center justify-center gap-4'>
                          <Button
                            variant='outline'
                            size='sm'
                            disabled={resultsPage === 1 || isFetchingResults}
                            onClick={() => handlePageChange(resultsPage - 1)}
                            className='border-gray-900 bg-black hover:bg-white/5'
                          >
                            <ChevronLeft className='mr-1 h-4 w-4' />
                            Previous
                          </Button>
                          <span className='text-sm text-gray-500'>
                            Page {resultsPage} of {resultsTotalPages}
                          </span>
                          <Button
                            variant='outline'
                            size='sm'
                            disabled={
                              resultsPage === resultsTotalPages ||
                              isFetchingResults
                            }
                            onClick={() => handlePageChange(resultsPage + 1)}
                            className='border-gray-900 bg-black hover:bg-white/5'
                          >
                            Next
                            <ChevronRight className='ml-1 h-4 w-4' />
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <EmptyState
                      title='No Results Yet'
                      description='No judging results available yet. Results appear once judges submit scores.'
                    />
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        {/* Global Dialogs */}
        <AlertDialog
          open={isPublishDialogOpen}
          onOpenChange={setIsPublishDialogOpen}
        >
          <AlertDialogContent className='border-white/5 bg-[#101010] text-white'>
            <AlertDialogHeader>
              <AlertDialogTitle>Publish Judging Results?</AlertDialogTitle>
              <AlertDialogDescription className='text-gray-400'>
                This will finalize the rankings and announce the winners. This
                action is irreversible.
              </AlertDialogDescription>
            </AlertDialogHeader>

            {completenessLoading && (
              <p className='text-xs text-gray-500'>
                Checking judging progress…
              </p>
            )}

            {completeness && completeness.complete && (
              <p className='rounded-md border border-emerald-800/40 bg-emerald-900/20 p-3 text-xs text-emerald-200'>
                All {completeness.expectedJudgeCount} active judges have scored
                every shortlisted submission.
              </p>
            )}

            {completeness && !completeness.complete && (
              <div className='space-y-3'>
                <div className='rounded-md border border-amber-800/40 bg-amber-950/30 p-3 text-xs text-amber-200'>
                  <p className='font-medium'>Judging is incomplete.</p>
                  <p className='mt-1'>
                    {completeness.incompleteSubmissionCount} of{' '}
                    {completeness.totalShortlisted} shortlisted submissions are
                    missing scores from one or more active judges.
                  </p>
                </div>
                {completeness.incompleteJudges.length > 0 && (
                  <div className='rounded-md border border-white/10 bg-black/40 p-3 text-xs text-gray-300'>
                    <p className='mb-1.5 text-[10px] tracking-wider text-gray-500 uppercase'>
                      Judges with outstanding work
                    </p>
                    <ul className='space-y-1'>
                      {completeness.incompleteJudges.map(j => (
                        <li key={j.id} className='flex justify-between'>
                          <span>{j.name}</span>
                          <span className='text-gray-500'>
                            {j.missingCount} left
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <label className='flex cursor-pointer items-start gap-2 rounded-md border border-amber-800/40 bg-amber-950/20 p-3 text-xs text-amber-200'>
                  <input
                    type='checkbox'
                    checked={acceptPartial}
                    onChange={e => setAcceptPartial(e.target.checked)}
                    className='accent-primary mt-0.5 h-3.5 w-3.5'
                  />
                  <span>
                    I understand the results will be published with incomplete
                    judging.
                  </span>
                </label>
              </div>
            )}

            <AlertDialogFooter>
              <AlertDialogCancel className='border-white/10 bg-transparent text-gray-300 hover:bg-white/5'>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handlePublishResults}
                disabled={
                  isPublishing ||
                  completenessLoading ||
                  Boolean(
                    completeness && !completeness.complete && !acceptPartial
                  )
                }
                className='bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50'
              >
                {isPublishing
                  ? 'Publishing…'
                  : completeness && !completeness.complete && acceptPartial
                    ? 'Publish anyway'
                    : 'Publish results'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog
          open={!!judgeToRemove}
          onOpenChange={open => !open && setJudgeToRemove(null)}
        >
          <AlertDialogContent className='border-gray-900 bg-zinc-950 text-white'>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Judge?</AlertDialogTitle>
              <AlertDialogDescription className='text-gray-400'>
                Are you sure you want to remove this judge? Their existing
                scores will be preserved but they will no longer have access to
                the judging panel.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className='border-gray-800 bg-zinc-900 text-gray-300 hover:bg-zinc-800 hover:text-white'>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (judgeToRemove) handleRemoveJudge(judgeToRemove);
                  setJudgeToRemove(null);
                }}
                className='bg-red-600 text-white hover:bg-red-700'
              >
                Remove Judge
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AuthGuard>
  );
}
