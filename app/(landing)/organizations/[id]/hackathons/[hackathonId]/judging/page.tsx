'use client';

import { useEffect, useState, useCallback } from 'react';
import MetricsCard from '@/components/organization/cards/MetricsCard';
import JudgingParticipant from '@/components/organization/cards/JudgingParticipant';
import EmptyState from '@/components/EmptyState';
import { useParams } from 'next/navigation';
import {
  getJudgingSubmissions,
  getJudgingCriteria,
  addJudge,
  removeJudge,
  getHackathonJudges,
  getJudgingResults,
  getJudgingWinners,
  publishJudgingResults,
  type JudgingCriterion,
  type JudgingSubmission,
  type JudgingResult,
  type AggregatedJudgingResults,
} from '@/lib/api/hackathons/judging';
import { getSubmissionDetails } from '@/lib/api/hackathons/participants';
import { getOrganizationMembers } from '@/lib/api/organization';
import { getCrowdfundingProject } from '@/features/projects/api';
import { authClient } from '@/lib/auth-client';
import { useOrganization } from '@/lib/providers/OrganizationProvider';
import { Loader2, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { AuthGuard } from '@/components/auth/AuthGuard';
import Loading from '@/components/Loading';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { JudgingCriteriaList } from '@/components/organization/hackathons/judging/JudgingCriteriaList';
import JudgingResultsTable from '@/components/organization/hackathons/judging/JudgingResultsTable';

export default function JudgingPage() {
  const params = useParams();
  const organizationId = params.id as string;
  const hackathonId = params.hackathonId as string;

  const { activeOrgId, activeOrg } = useOrganization();
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

  const canManageJudges =
    currentUserRole === 'owner' || currentUserRole === 'admin';
  const canPublishResults = canManageJudges && isCurrentUserJudge;

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
        console.warn(
          'Legacy member fetch failed, trying Better Auth fallback:',
          err
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
      console.error('All member fetching attempts failed:', err);
    }

    // 2. Fetch judges
    try {
      const judgesRes = await getHackathonJudges(targetOrgId, hackathonId);
      if (judgesRes.success) {
        judges = judgesRes.data || [];
      }
    } catch (err) {
      console.error('Failed to fetch judges:', err);
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

  const fetchResults = useCallback(async () => {
    if (!organizationId || !hackathonId) return;

    setIsFetchingResults(true);
    try {
      const res = await getJudgingResults(organizationId, hackathonId);

      if (res.success && res.data) {
        setJudgingResults(res.data.results || []);
        setJudgingSummary(res.data);
      } else {
        setJudgingResults([]);
        setJudgingSummary(null);
        if (!res.success) {
          toast.error((res as any).message || 'Failed to load judging results');
        }
      }
    } catch (error: any) {
      console.error('Error fetching results:', error);
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
  }, [organizationId, hackathonId]);

  const fetchData = useCallback(async () => {
    if (!organizationId || !hackathonId) return;

    setIsLoading(true);
    try {
      // Fetch submissions, criteria, and judges/members
      const [submissionsRes, criteriaRes] = await Promise.all([
        getJudgingSubmissions(organizationId, hackathonId, 1, 50),
        getJudgingCriteria(hackathonId),
      ]);

      // Trigger judges and results fetch in parallel but handle separately
      fetchJudges();
      fetchResults();

      let enrichedSubmissions: JudgingSubmission[] = [];

      if (submissionsRes.success) {
        // Standard submissions endpoint returns { data: { submissions: [], pagination: {} } }
        const submissionData =
          (submissionsRes.data as any)?.submissions ||
          submissionsRes.data ||
          [];
        const basicSubmissions = Array.isArray(submissionData)
          ? submissionData
          : [];

        // 2. Fetch full details for each submission to get user info
        // We do this by fetching the project details, as submission endpoints lack user data
        const detailsPromises = basicSubmissions.map(async (sub: any) => {
          try {
            // Check if we already have sufficient user data
            if (
              sub.participant?.user?.profile?.firstName ||
              sub.participant?.name
            )
              return sub;

            // Try fetch project details if we have projectId
            if (sub.projectId) {
              const project = await getCrowdfundingProject(sub.projectId);
              if (project && project.project && project.project.creator) {
                const creator = project.project.creator;
                return {
                  ...sub,
                  participant: {
                    ...sub.participant,
                    // Use creator info for participant
                    name: creator.name,
                    username: creator.username,
                    image: creator.image,
                    email: creator.email,
                    user: {
                      ...sub.participant?.user,
                      name: creator.name,
                      username: creator.username,
                      image: creator.image,
                      email: creator.email,
                      profile: {
                        ...sub.participant?.user?.profile,
                        firstName: creator.name?.split(' ')[0] || '',
                        lastName:
                          creator.name?.split(' ').slice(1).join(' ') || '',
                        username: creator.username,
                        avatar: creator.image,
                      },
                    },
                  },
                };
              }
            }

            // Fallback to submission details check if project fail or no projectId
            const detailsRes = await getSubmissionDetails(sub.id);
            if (detailsRes.success && detailsRes.data) {
              const details = detailsRes.data as any;
              return {
                ...sub,
                participant: {
                  ...sub.participant,
                  ...details.participant,
                  user: details.participant?.user || sub.participant?.user,
                },
              };
            }
            return sub;
          } catch (err) {
            console.error(
              `Failed to fetch details for submission ${sub.id}`,
              err
            );
            return sub;
          }
        });

        enrichedSubmissions = await Promise.all(detailsPromises);
        setSubmissions(enrichedSubmissions);
      } else {
        setSubmissions([]);
      }

      // Handle criteria response safely
      setCriteria(Array.isArray(criteriaRes) ? criteriaRes : []);
    } catch (error) {
      console.error('Judging data fetch error:', error);
      toast.error('Failed to load judging data');
    } finally {
      setIsLoading(false);
    }
  }, [organizationId, hackathonId, fetchJudges, fetchResults]);

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
      console.error('Error adding judge:', error);
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
      console.error('Error removing judge:', error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          'Failed to remove judge'
      );
    }
  };

  const fetchWinners = useCallback(async () => {
    if (!organizationId || !hackathonId) return;
    setIsFetchingWinners(true);
    try {
      const res = await getJudgingWinners(organizationId, hackathonId);
      if (res.success && res.data) {
        setWinners(Array.isArray(res.data) ? res.data : []);
      }
    } catch (error) {
      console.error('Error fetching winners:', error);
    } finally {
      setIsFetchingWinners(false);
    }
  }, [organizationId, hackathonId]);

  const handlePublishResults = async () => {
    setIsPublishing(true);
    try {
      const res = await publishJudgingResults(organizationId, hackathonId);
      if (res.success) {
        toast.success('Results published successfully!');
        fetchResults();
        fetchWinners();
      } else {
        toast.error(res.message || 'Failed to publish results');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to publish results');
    } finally {
      setIsPublishing(false);
    }
  };

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
          <div>
            <h1 className='text-2xl font-bold'>Judging Dashboard</h1>
            <p className='text-gray-400'>
              Manage and grade shortlisted submissions
            </p>
          </div>

          <div className='flex gap-4'>
            <MetricsCard
              title='Graded Projects'
              value={`${gradedCount} / ${totalPossibleSubmissions}`}
              subtitle={`${totalPossibleSubmissions > 0 ? Math.round((gradedCount / totalPossibleSubmissions) * 100) : 0}% Completion`}
            />
            <MetricsCard
              title='Avg. Hackathon Score'
              value={averageHackathonScore.toFixed(2)}
              subtitle='Out of 10.00'
            />
            <MetricsCard
              title='Assigned Judges'
              value={assignedJudgesCount}
              subtitle='on this hackathon'
            />
          </div>

          <Tabs
            defaultValue='overview'
            value={activeTab}
            onValueChange={value => {
              setActiveTab(value);
              if (value === 'results') {
                fetchResults();
                fetchWinners();
              }
            }}
            className='w-full'
          >
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

            <TabsContent value='overview' className='mt-6'>
              {isLoading ? (
                <div className='flex items-center justify-center py-12'>
                  <Loader2 className='h-8 w-8 animate-spin text-gray-400' />
                </div>
              ) : submissions.length > 0 ? (
                <div className='flex flex-col gap-4'>
                  {submissions.map(submission => (
                    <JudgingParticipant
                      key={
                        (submission as any).id ||
                        (submission as any).participant?.id
                      }
                      submission={submission}
                      organizationId={organizationId}
                      hackathonId={hackathonId}
                      hasCriteria={criteria.length > 0}
                      judges={currentJudges}
                      isJudgesLoading={isRefreshingJudges}
                      currentUserId={currentUserId || undefined}
                      canOverrideScores={canManageJudges}
                      onSuccess={handleSuccess}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title='No Submissions Yet'
                  description='There are currently no submissions to judge.'
                />
              )}
            </TabsContent>

            <TabsContent value='criteria' className='mt-6'>
              <JudgingCriteriaList criteria={criteria} />
            </TabsContent>

            <TabsContent value='judges' className='mt-6'>
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
                                handleRemoveJudge(judge.userId || judge.id)
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
                    <h3 className='mb-4 text-lg font-medium'>
                      Add from Organization Members
                    </h3>
                    <p className='mb-6 text-sm text-gray-400'>
                      Select members from your organization to assign them as
                      judges.
                    </p>
                    <div className='custom-scrollbar max-h-[500px] space-y-3 overflow-y-auto pr-2'>
                      {orgMembers.map((member: any) => {
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
                              variant={isAlreadyJudge ? 'outline' : 'default'}
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
            </TabsContent>

            <TabsContent value='results' className='mt-6'>
              <div className='flex flex-col gap-6'>
                {canPublishResults && judgingResults.length > 0 && (
                  <div className='bg-primary/5 border-primary/10 flex items-center justify-between rounded-lg border p-4'>
                    <div>
                      <h3 className='text-primary text-sm font-semibold'>
                        Finalize Competition
                      </h3>
                      <p className='text-xs text-gray-400'>
                        Publish the current rankings to name the winners.
                      </p>
                    </div>
                    <Button
                      onClick={handlePublishResults}
                      disabled={isPublishing}
                      className='bg-primary text-primary-foreground hover:bg-primary/90 px-8 font-bold'
                    >
                      {isPublishing ? 'Publishing...' : 'Publish Results'}
                    </Button>
                  </div>
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
                    />
                  </div>
                )}

                <div className='space-y-4'>
                  <h2 className='text-lg font-bold text-gray-200'>
                    Current Standings
                  </h2>
                  {isFetchingResults ? (
                    <div className='flex items-center justify-center py-12'>
                      <Loader2 className='h-8 w-8 animate-spin text-gray-400' />
                    </div>
                  ) : judgingResults.length > 0 ? (
                    <JudgingResultsTable
                      results={judgingResults}
                      organizationId={organizationId}
                      hackathonId={hackathonId}
                      totalJudges={currentJudges.length}
                      criteria={criteria}
                    />
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
      </div>
    </AuthGuard>
  );
}
