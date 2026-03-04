'use client';
import { ProjectLayout } from '@/components/project-details/project-layout';
import { ProjectLoading } from '@/components/project-details/project-loading';
import { getCrowdfundingProject } from '@/features/projects/api';
import type { Crowdfunding } from '@/features/projects/types';
import { use, useEffect, useState } from 'react';
import { useSearchParams, notFound } from 'next/navigation';
import {
  getSubmissionDetails,
  getHackathon,
  type ParticipantSubmission,
} from '@/lib/api/hackathons';
import type { Hackathon } from '@/lib/api/hackathons';
import type {
  Milestone,
  TeamMember,
  SocialLink,
} from '@/features/projects/types';

interface ProjectPageProps {
  params: Promise<{
    slug: string;
  }>;
}

function ProjectContent({
  id,
  isSubmission = false,
}: {
  id: string;
  isSubmission?: boolean;
}) {
  const [project, setProject] = useState<Crowdfunding | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmission = async (submissionId: string) => {
      try {
        const submissionRes = await getSubmissionDetails(submissionId);

        if (submissionRes && submissionRes.data) {
          const submission = submissionRes.data;
          const subData = submission as any;

          // Try to fetch hackathon details using getHackathon (by ID)
          let hackathon: Hackathon | null = null;
          try {
            if (subData.hackathonId) {
              const hackathonRes = await getHackathon(subData.hackathonId);
              hackathon = hackathonRes.data;
            }
          } catch (err) {
            console.error('Failed to fetch hackathon details', err);
          }

          if (hackathon) {
            const mappedProject = mapSubmissionToCrowdfunding(
              submission,
              hackathon
            );
            setProject(mappedProject);
            return;
          } else {
            // If hackathon details are missing, we might want to handle it gracefully
            // or throw. For now, let's strictly require hackathon details for the map
            throw new Error('Hackathon details not found');
          }
        }
        throw new Error('Submission not found');
      } catch (e) {
        console.error('Failed to fetch submission:', e);
        throw e;
      }
    };

    const fetchProjectData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (isSubmission) {
          await fetchSubmission(id);
          return;
        }

        try {
          const projectData = await getCrowdfundingProject(id);
          if (projectData) {
            setProject(projectData);
            return;
          }
        } catch (e) {
          await fetchSubmission(id);
        }
      } catch {
        setError('Failed to fetch project data');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [id, isSubmission]);

  if (loading) {
    return <ProjectLoading />;
  }

  if (error || !project) {
    notFound();
  }

  if (error || !project) {
    notFound();
  }

  return (
    <div className='mx-auto flex min-h-screen max-w-[1440px] flex-col space-y-[60px] px-5 py-5 md:space-y-20 md:px-[50px] lg:px-[100px]'>
      <div className='flex-1'>
        <ProjectLayout
          project={project.project}
          crowdfund={project}
          hiddenTabs={[]}
          hideProgress={isSubmission}
        />
      </div>
    </div>
  );
}

// Helper function to map Submission to Crowdfunding type
function mapSubmissionToCrowdfunding(
  submission: ParticipantSubmission & { members?: any[] },
  hackathon: Hackathon
): Crowdfunding {
  const subData = submission as any;
  const hackData = hackathon as any;

  const now = new Date();

  // Helper to determine status
  const getStatus = (
    start?: string,
    end?: string
  ): 'completed' | 'pending' | 'active' => {
    if (!start || !end) return 'pending';
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (now > endDate) return 'completed';
    if (now >= startDate && now <= endDate) return 'active';
    return 'pending';
  };

  // Map Hackathon Timeline to Milestones
  const milestones: any[] = [
    {
      id: 'registration',
      name: 'Registration',
      title: 'Registration',
      description: 'Registration period for the hackathon',
      amount: 0,
      fundingPercentage: 0,
      status: getStatus(
        hackData.timeline?.registrationStart,
        hackData.timeline?.registrationEnd
      ),
      reviewStatus: getStatus(
        hackData.timeline?.registrationStart,
        hackData.timeline?.registrationEnd
      ),
      startDate:
        hackData.timeline?.registrationStart || new Date().toISOString(),
      endDate: hackData.timeline?.registrationEnd || new Date().toISOString(),
    },
    {
      id: 'submission',
      name: 'Submission',
      title: 'Submission',
      description: 'Project submission period',
      amount: 0,
      fundingPercentage: 0,
      status: getStatus(
        hackData.timeline?.submissionStart,
        hackData.timeline?.submissionEnd
      ),
      reviewStatus: getStatus(
        hackData.timeline?.submissionStart,
        hackData.timeline?.submissionEnd
      ),
      startDate: hackData.timeline?.submissionStart || new Date().toISOString(),
      endDate: hackData.timeline?.submissionEnd || new Date().toISOString(),
    },
    {
      id: 'judging',
      name: 'Judging',
      title: 'Judging',
      description: 'Judging period',
      amount: 0,
      fundingPercentage: 0,
      status: getStatus(
        hackData.timeline?.judgingStart,
        hackData.timeline?.judgingEnd
      ),
      reviewStatus: getStatus(
        hackData.timeline?.judgingStart,
        hackData.timeline?.judgingEnd
      ),
      startDate: hackData.timeline?.judgingStart || new Date().toISOString(),
      endDate: hackData.timeline?.judgingEnd || new Date().toISOString(),
    },
    {
      id: 'winners',
      name: 'Winners Announced',
      title: 'Winners Announced',
      description: 'Announcement of hackathon winners',
      amount: 0,
      fundingPercentage: 0,
      status: getStatus(
        hackData.timeline?.winnersAnnounced,
        hackData.timeline?.winnersAnnounced
      ),
      reviewStatus: getStatus(
        hackData.timeline?.winnersAnnounced,
        hackData.timeline?.winnersAnnounced
      ),
      startDate:
        hackData.timeline?.winnersAnnounced || new Date().toISOString(),
      endDate: hackData.timeline?.winnersAnnounced || new Date().toISOString(),
    },
  ];

  // Map Social Links
  const socialLinks: SocialLink[] = (subData.links || []).map((link: any) => ({
    platform: link.type || 'website',
    url: link.url,
  }));

  // Map Team Members
  const teamMembers: TeamMember[] = (
    subData.teamMembers ||
    subData.members ||
    []
  ).map((m: any) => ({
    name: m.user?.name || m.name || 'Team Member',
    role: m.role || 'Member',
    email: '',
    image: m.user?.image || m.image,
    username: m.user?.username || m.username,
  }));

  // Also add the submitter if not in team
  if (teamMembers.length === 0 && (subData.participantId || subData.userId)) {
    // We might lack detailed user info here, so we use placeholders or available data
    teamMembers.push({
      name: subData.participant?.name || subData.user?.name || 'Submitter',
      role: 'Leader',
      email: subData.participant?.email || subData.user?.email || '',
      image:
        subData.participant?.image ||
        subData.user?.image ||
        subData.logo ||
        undefined,
      username:
        subData.participant?.username || subData.user?.username || 'submitter',
    });
  }

  const projectId = subData.id || subData._id || '';

  // Find demo video in links if not provided directly
  let demoVideoUrl = subData.videoUrl || '';
  if (!demoVideoUrl && socialLinks.length > 0) {
    const vidLink = socialLinks.find(
      l =>
        l.url.includes('youtube.com') ||
        l.url.includes('youtu.be') ||
        l.url.includes('vimeo')
    );
    if (vidLink) {
      demoVideoUrl = vidLink.url;
    }
  }

  return {
    id: projectId,
    projectId: projectId,
    slug: subData.slug || projectId,
    voteGoal: 0,
    fundingGoal: 0,
    fundingRaised: 0,
    fundingCurrency: 'USD',
    fundingEndDate:
      hackData.timeline?.submissionEnd || new Date().toISOString(),
    contributors: [],
    team: teamMembers,
    contact: { primary: '', backup: '' },
    socialLinks: socialLinks,
    milestones: milestones,
    stakeholders: null,
    trustlessWorkStatus: 'active',
    escrowAddress: '',
    escrowType: 'none',
    escrowDetails: null,
    creationTxHash: null,
    transactionHash: '',
    createdAt: subData.createdAt || new Date().toISOString(),
    updatedAt: subData.updatedAt || new Date().toISOString(),
    project: {
      id: projectId,
      title: subData.projectName || 'Untitled Project',
      tagline: subData.category || 'Hackathon Project',
      description: subData.description || '',
      summary: subData.introduction || subData.description || '',
      vision: null,
      details: null,
      category: subData.category || 'General',
      status: subData.status || 'pending',
      creatorId: subData.participantId || subData.userId || '',
      organizationId: subData.organizationId || null,
      teamMembers: teamMembers,
      banner: null,
      logo: subData.logo || '',
      thumbnail: null,
      githubUrl:
        socialLinks.find((l: SocialLink) =>
          l.platform.toLowerCase().includes('github')
        )?.url || '',
      gitlabUrl: null,
      bitbucketUrl: null,
      projectWebsite:
        socialLinks.find(
          (l: SocialLink) => l.platform === 'website' || l.platform === 'demo'
        )?.url || '',
      demoVideo: demoVideoUrl,
      whitepaperUrl: null,
      pitchVideoUrl: null,
      socialLinks: socialLinks,
      contact: { primary: '', backup: '' },
      whitepaper: null,
      pitchDeck: null,
      votes: typeof subData.votes === 'number' ? subData.votes : 0,
      voting: null,
      tags: [],
      approvedById: null,
      approvedAt: null,
      createdAt: subData.createdAt || new Date().toISOString(),
      updatedAt: subData.updatedAt || new Date().toISOString(),
      creator: {
        id: subData.userId || '',
        name: subData.participant?.name || subData.user?.name || 'Creator',
        email: subData.participant?.email || subData.user?.email || '',
        emailVerified: false,
        image: subData.participant?.image || subData.user?.image || '',
        createdAt: '',
        updatedAt: '',
        lastLoginMethod: '',
        role: '',
        banned: false,
        banReason: null,
        banExpires: null,
        username:
          subData.participant?.username || subData.user?.username || 'creator',
        displayUsername:
          subData.participant?.username || subData.user?.username || 'creator',
        metadata: null,
        twoFactorEnabled: false,
      },
      organization: null,
      milestones: milestones,
    },
  };
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const [id, setId] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const isSubmission = searchParams.get('type') === 'submission';

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setId(resolvedParams.slug);
    };
    getParams();
  }, [params]);

  if (!id) {
    return <ProjectLoading />;
  }

  return <ProjectContent id={id} isSubmission={isSubmission} />;
}
