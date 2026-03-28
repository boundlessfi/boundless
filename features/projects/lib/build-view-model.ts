import type {
  ProjectDetail,
  EmbeddedCrowdfundingCampaign,
  Crowdfunding,
  SocialLink,
} from '../types';
import type {
  ProjectViewModel,
  ProjectOrigin,
  VMTeamMember,
  VMCampaign,
} from '../types/view-model';
import type { ParticipantSubmission, Hackathon } from '@/lib/api/hackathons';

// ─── From ProjectDetail (primary path) ────────────────────────────────────────

export function buildFromProjectDetail(
  detail: ProjectDetail
): ProjectViewModel {
  const hasCampaign = (detail.crowdfundingCampaigns?.length ?? 0) > 0;
  const campaign = hasCampaign
    ? detail.originReferenceId
      ? (detail.crowdfundingCampaigns.find(
          c => c.id === detail.originReferenceId
        ) ?? detail.crowdfundingCampaigns[0])
      : detail.crowdfundingCampaigns[0]
    : null;

  const origin: ProjectOrigin =
    detail.originType === 'CROWDFUNDING'
      ? 'crowdfunding'
      : detail.originType === 'HACKATHON'
        ? 'hackathon'
        : 'manual';

  const socialLinks = normalizeSocialLinks(detail.socialLinks);

  const team: VMTeamMember[] = [
    ...(campaign?.team ?? detail.teamMembers ?? []).map(m => ({
      name: m.name,
      role: m.role,
      email: m.email,
      image: 'image' in m ? (m.image as string | undefined) : undefined,
      username:
        'username' in m ? (m.username as string | undefined) : undefined,
    })),
  ];

  return {
    id: detail.id,
    slug: detail.slug,
    projectType: hasCampaign ? 'campaign' : 'generic',
    origin,

    title: detail.title,
    tagline: detail.tagline,
    description: detail.description,
    summary: detail.summary,
    vision: detail.vision,
    details: detail.details,
    category: detail.category,
    status: detail.status,
    banner: detail.banner,
    logo: detail.logo ?? '',
    tags: detail.tags,
    createdAt: detail.createdAt,
    updatedAt: detail.updatedAt,

    creator: {
      id: detail.creator.id,
      name: detail.creator.name,
      username: detail.creator.username,
      image: detail.creator.image,
    },
    creatorId: detail.creatorId,
    organizationId: detail.organizationId,
    organization: detail.organization,

    socialLinks,
    githubUrl: detail.githubUrl,
    gitlabUrl: detail.gitlabUrl,
    bitbucketUrl: detail.bitbucketUrl,
    projectWebsite: detail.projectWebsite,
    demoVideo: detail.demoVideo,
    whitepaperUrl: detail.whitepaperUrl,
    pitchVideoUrl: detail.pitchVideoUrl,
    whitepaper: detail.whitepaper,
    pitchDeck: detail.pitchDeck,

    team,

    campaign: campaign ? mapEmbeddedCampaign(campaign) : null,
    submission: null,

    voting: null,
    voteCount: detail._count?.votes ?? 0,
  };
}

function mapEmbeddedCampaign(c: EmbeddedCrowdfundingCampaign): VMCampaign {
  return {
    campaignId: c.id,
    campaignSlug: c.slug,
    fundingGoal: c.fundingGoal,
    fundingRaised: c.fundingRaised,
    fundingCurrency: c.fundingCurrency,
    fundingEndDate: c.fundingEndDate ?? '',
    voteGoal: c.voteGoal,
    escrowAddress: c.escrowAddress,
    escrowType: c.escrowType,
    trustlessWorkStatus: c.trustlessWorkStatus,
    contributors: c.contributors ?? [],
    milestones: c.milestones ?? [],
    transactionHash: c.transactionHash,
  };
}

// ─── From Crowdfunding (fallback path) ────────────────────────────────────────

export function buildFromCrowdfunding(
  crowdfund: Crowdfunding
): ProjectViewModel {
  const p = crowdfund.project;

  return {
    id: p.id,
    slug: crowdfund.slug,
    projectType: 'campaign',
    origin: 'crowdfunding',

    title: p.title,
    tagline: p.tagline,
    description: p.description,
    summary: p.summary,
    vision: p.vision,
    details: p.details,
    category: p.category,
    status: p.status,
    banner: p.banner,
    logo: p.logo ?? '',
    tags: p.tags,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,

    creator: {
      id: p.creator.id,
      name: p.creator.name,
      username: p.creator.username ?? p.creator.displayUsername,
      image: p.creator.image,
    },
    creatorId: p.creatorId,
    organizationId: p.organizationId,
    organization: p.organization,

    socialLinks: Array.isArray(p.socialLinks)
      ? p.socialLinks
      : normalizeSocialLinks(p.socialLinks),
    githubUrl: p.githubUrl,
    gitlabUrl: p.gitlabUrl,
    bitbucketUrl: p.bitbucketUrl,
    projectWebsite: p.projectWebsite,
    demoVideo: p.demoVideo,
    whitepaperUrl: p.whitepaperUrl,
    pitchVideoUrl: p.pitchVideoUrl,
    whitepaper: p.whitepaper,
    pitchDeck: p.pitchDeck,

    team: (crowdfund.team ?? []).map(m => ({
      name: m.name,
      role: m.role,
      email: m.email,
      image: m.image,
      username: m.username,
    })),

    campaign: {
      campaignId: crowdfund.id,
      campaignSlug: crowdfund.slug,
      fundingGoal: crowdfund.fundingGoal,
      fundingRaised: crowdfund.fundingRaised,
      fundingCurrency: crowdfund.fundingCurrency,
      fundingEndDate: crowdfund.fundingEndDate,
      voteGoal: crowdfund.voteGoal,
      escrowAddress: crowdfund.escrowAddress,
      escrowType: crowdfund.escrowType,
      trustlessWorkStatus: crowdfund.trustlessWorkStatus,
      contributors: crowdfund.contributors ?? [],
      milestones: crowdfund.milestones ?? [],
      transactionHash: crowdfund.transactionHash,
    },
    submission: null,

    voting: p.voting,
    voteCount: p._count?.votes ?? p.votes ?? 0,
  };
}

// ─── From Hackathon Submission ────────────────────────────────────────────────

export function buildFromSubmission(
  submission: ParticipantSubmission & { members?: unknown[] },
  hackathon: Hackathon
): ProjectViewModel {
  const sub = submission as unknown as Record<string, unknown>;
  const hackData = hackathon as Record<string, unknown>;
  const timeline = hackData.timeline as Record<string, string> | undefined;
  const now = new Date();

  const getStatus = (
    start?: string,
    end?: string
  ): 'completed' | 'pending' | 'active' => {
    if (!start || !end) return 'pending';
    const s = new Date(start);
    const e = new Date(end);
    if (now > e) return 'completed';
    if (now >= s && now <= e) return 'active';
    return 'pending';
  };

  const milestones = [
    {
      id: 'registration',
      name: 'Registration',
      title: 'Registration',
      description: 'Registration period for the hackathon',
      amount: 0,
      fundingPercentage: 0,
      reviewStatus: getStatus(
        timeline?.registrationStart,
        timeline?.registrationEnd
      ),
      startDate: timeline?.registrationStart ?? new Date().toISOString(),
      endDate: timeline?.registrationEnd ?? new Date().toISOString(),
    },
    {
      id: 'submission',
      name: 'Submission',
      title: 'Submission',
      description: 'Project submission period',
      amount: 0,
      fundingPercentage: 0,
      reviewStatus: getStatus(
        timeline?.submissionStart,
        timeline?.submissionEnd
      ),
      startDate: timeline?.submissionStart ?? new Date().toISOString(),
      endDate: timeline?.submissionEnd ?? new Date().toISOString(),
    },
    {
      id: 'judging',
      name: 'Judging',
      title: 'Judging',
      description: 'Judging period',
      amount: 0,
      fundingPercentage: 0,
      reviewStatus: getStatus(timeline?.judgingStart, timeline?.judgingEnd),
      startDate: timeline?.judgingStart ?? new Date().toISOString(),
      endDate: timeline?.judgingEnd ?? new Date().toISOString(),
    },
    {
      id: 'winners',
      name: 'Winners Announced',
      title: 'Winners Announced',
      description: 'Announcement of hackathon winners',
      amount: 0,
      fundingPercentage: 0,
      reviewStatus: getStatus(
        timeline?.winnersAnnounced,
        timeline?.winnersAnnounced
      ),
      startDate: timeline?.winnersAnnounced ?? new Date().toISOString(),
      endDate: timeline?.winnersAnnounced ?? new Date().toISOString(),
    },
  ];

  const links = (sub.links ?? []) as Array<{ type?: string; url: string }>;
  const socialLinks: SocialLink[] = links.map(link => ({
    platform: link.type || 'website',
    url: link.url,
  }));

  const rawMembers = (sub.teamMembers ?? sub.members ?? []) as Array<
    Record<string, unknown>
  >;
  const team: VMTeamMember[] = rawMembers.map(m => {
    const user = m.user as Record<string, unknown> | undefined;
    return {
      name: (user?.name as string) || (m.name as string) || 'Team Member',
      role: (m.role as string) || 'Member',
      email: '',
      image: (user?.image as string) || (m.image as string),
      username: (user?.username as string) || (m.username as string),
    };
  });

  if (team.length === 0 && (sub.participantId || sub.userId)) {
    const participant = sub.participant as Record<string, unknown> | undefined;
    const user = sub.user as Record<string, unknown> | undefined;
    team.push({
      name:
        (participant?.name as string) || (user?.name as string) || 'Submitter',
      role: 'Leader',
      email: (participant?.email as string) || (user?.email as string) || '',
      image:
        (participant?.image as string) ||
        (user?.image as string) ||
        (sub.logo as string) ||
        undefined,
      username:
        (participant?.username as string) ||
        (user?.username as string) ||
        'submitter',
    });
  }

  let demoVideoUrl = (sub.videoUrl as string) || '';
  if (!demoVideoUrl && socialLinks.length > 0) {
    const vidLink = socialLinks.find(
      l =>
        l.url.includes('youtube.com') ||
        l.url.includes('youtu.be') ||
        l.url.includes('vimeo')
    );
    if (vidLink) demoVideoUrl = vidLink.url;
  }

  const creatorParticipant = sub.participant as
    | Record<string, unknown>
    | undefined;
  const creatorUser = sub.user as Record<string, unknown> | undefined;

  return {
    id: (sub.id as string) || '',
    slug: (sub.slug as string) || (sub.id as string) || '',
    projectType: 'submission',
    origin: 'hackathon',

    title: (sub.projectName as string) || 'Untitled Project',
    tagline: (sub.category as string) || 'Hackathon Project',
    description: (sub.description as string) || '',
    summary: (sub.introduction as string) || (sub.description as string) || '',
    vision: null,
    details: null,
    category: (sub.category as string) || 'General',
    status: (sub.status as string) || 'pending',
    banner: null,
    logo: (sub.logo as string) || '',
    tags: [],
    createdAt: (sub.createdAt as string) || new Date().toISOString(),
    updatedAt: (sub.updatedAt as string) || new Date().toISOString(),

    creator: {
      id: (sub.userId as string) || '',
      name:
        (creatorParticipant?.name as string) ||
        (creatorUser?.name as string) ||
        'Creator',
      username:
        (creatorParticipant?.username as string) ||
        (creatorUser?.username as string) ||
        'creator',
      image:
        (creatorParticipant?.image as string) ||
        (creatorUser?.image as string) ||
        '',
    },
    creatorId: (sub.participantId as string) || (sub.userId as string) || '',
    organizationId: (sub.organizationId as string) || null,
    organization: null,

    socialLinks,
    githubUrl:
      socialLinks.find(l => l.platform.toLowerCase().includes('github'))?.url ||
      null,
    gitlabUrl: null,
    bitbucketUrl: null,
    projectWebsite:
      socialLinks.find(l => l.platform === 'website' || l.platform === 'demo')
        ?.url || null,
    demoVideo: demoVideoUrl || null,
    whitepaperUrl: null,
    pitchVideoUrl: null,
    whitepaper: null,
    pitchDeck: null,

    team,

    campaign: null,
    submission: {
      hackathonId: sub.hackathonId as string | undefined,
      hackathonName: hackathon.name,
      milestones,
    },

    voting: null,
    voteCount: typeof sub.votes === 'number' ? sub.votes : 0,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeSocialLinks(
  links: Record<string, string> | SocialLink[] | null | undefined
): SocialLink[] {
  if (!links) return [];
  if (Array.isArray(links)) return links;
  return Object.entries(links).map(([platform, url]) => ({ platform, url }));
}
