import { Progress } from '@/components/ui/progress';
import { formatNumber, cn } from '@/lib/utils';
import { useRouter } from 'nextjs-toploader/app';
import Image from 'next/image';
import { CountdownTimer } from '@/components/ui/timer';

export type ProjectCardData = {
  id: string;
  slug: string;
  project: {
    id?: string;
    title: string;
    vision?: string | null;
    banner?: string | null;
    logo?: string | null;
    creator?: { name: string; image?: string | null };
    category?: string | null;
    status: string;
    _count?: { votes?: number };
    [key: string]: any;
  };
  fundingGoal?: number;
  fundingRaised?: number;
  fundingCurrency?: string;
  fundingEndDate?: string | null;
  milestones?: any[];
  voteGoal?: number;
  voteProgress?: number;
  isSubmission?: boolean;
  submissionStatus?: string | null;
  [key: string]: any;
};

type ProjectCardProps = {
  data: ProjectCardData;
  newTab?: boolean;
  isFullWidth?: boolean;
  className?: string;
};

function ProjectCard({
  data,
  newTab = false,
  isFullWidth = false,
  className = '',
}: ProjectCardProps) {
  const router = useRouter();

  const {
    slug,
    project,
    fundingGoal = 0,
    fundingRaised = 0,
    fundingCurrency = 'USDC',
    fundingEndDate = null,
    milestones = [],
    voteGoal = 0,
    isSubmission,
    submissionStatus,
  } = data;

  const {
    title,
    vision,
    banner,
    logo,
    creator,
    category,
    status: projectStatus,
    _count,
  } = project;

  const currentBanner =
    banner || '/images/placeholders/project-banner-placeholder.png';

  const handleClick = () => {
    if (projectStatus === 'IDEA') {
      router.push(`/projects/${project.id || slug}/edit`);
      return;
    }
    const url = isSubmission
      ? `/projects/${slug}?type=submission`
      : `/projects/${slug}`;
    router.push(url);
  };

  // Status logic
  const getDisplayStatus = () => {
    if (isSubmission) {
      if (submissionStatus === 'SHORTLISTED' || submissionStatus === 'ACCEPTED')
        return 'Shortlisted';
      if (submissionStatus === 'SUBMITTED') return 'Submitted';
      if (submissionStatus === 'DISQUALIFIED') return 'Disqualified';
      return 'Submission';
    }
    if (projectStatus === 'IDEA') return 'Draft';
    if (projectStatus === 'VOTING') return 'Voting';
    if (projectStatus === 'REVIEWING') return 'In Review';
    if (projectStatus === 'ACTIVE') return 'Funding';
    if (projectStatus === 'LIVE') return 'Funded';
    if (projectStatus === 'COMPLETED') return 'Completed';
    return projectStatus;
  };

  const status = getDisplayStatus();

  const getStatusStyles = () => {
    switch (status) {
      case 'Draft':
        return 'text-amber-400 bg-amber-400/10';
      case 'Voting':
        return 'text-purple-400 bg-purple-400/10';
      case 'In Review':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'Funding':
        return 'text-blue-400 bg-blue-400/10';
      case 'Funded':
      case 'Completed':
        return 'text-green-400 bg-green-400/10';
      case 'Shortlisted':
        return 'text-primary bg-primary/10';
      case 'Disqualified':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-gray-400 bg-gray-800/20';
    }
  };

  // Calculations
  const totalVotes = _count?.votes || 0;
  const currentVoteGoal = voteGoal || 1;
  const fundingProgress = Math.min(
    (fundingRaised / (fundingGoal || 1)) * 100,
    100
  );
  const completedMilestones =
    milestones?.filter(m => m.reviewStatus === 'completed')?.length || 0;
  const totalMilestonesCount = milestones?.length || 0;
  const milestonesProgress =
    (completedMilestones / (totalMilestonesCount || 1)) * 100;

  const statusColor = getStatusStyles();

  return (
    <div
      onClick={!newTab ? handleClick : undefined}
      className={cn(
        'group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-neutral-800 bg-[#0c0c0c] transition-all duration-300 hover:border-neutral-700 hover:shadow-lg hover:shadow-black/40',
        isFullWidth ? 'w-full' : 'max-w-[400px]',
        className
      )}
    >
      {/* Banner */}
      <div className='relative h-40 overflow-hidden sm:h-44'>
        <Image
          src={currentBanner}
          alt={title}
          fill
          className='object-cover transition-transform duration-300 group-hover:scale-105'
          unoptimized
          onError={e => {
            e.currentTarget.src = logo || '';
            e.currentTarget.classList.add(
              'object-contain',
              'p-4',
              'bg-[#1a1a1a]'
            );
            e.currentTarget.classList.remove('object-cover');
          }}
        />
        <div className='absolute inset-0 bg-linear-to-t from-[#0c0c0c] via-black/40 to-transparent' />

        {/* Top: Category + Status */}
        <div className='absolute top-3 right-3 left-3 flex items-center justify-between'>
          {category && (
            <span className='rounded-md bg-black/60 px-2 py-0.5 text-[11px] font-medium text-gray-300 backdrop-blur-md'>
              {category}
            </span>
          )}
          <span
            className={cn(
              'ml-auto rounded-md px-2 py-0.5 text-[11px] font-semibold backdrop-blur-sm',
              statusColor
            )}
          >
            {status}
          </span>
        </div>

        {/* Bottom: Creator + Logo */}
        <div className='absolute right-3 bottom-3 left-3 flex items-end justify-between'>
          <div className='flex items-center gap-2'>
            {logo && (
              <div className='size-8 overflow-hidden rounded-lg border border-neutral-700 bg-[#1a1a1a]'>
                <Image
                  src={logo}
                  alt={title}
                  width={32}
                  height={32}
                  className='h-full w-full object-cover'
                  unoptimized
                />
              </div>
            )}
            <div className='flex items-center gap-1.5'>
              {creator?.image && (
                <div
                  className='size-5 rounded-full border border-white/20 bg-cover bg-center'
                  style={{ backgroundImage: `url(${creator.image})` }}
                />
              )}
              <span className='text-xs font-medium text-white/80 drop-shadow-md'>
                {creator?.name || 'Unknown'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='flex flex-1 flex-col px-4 pt-3 sm:px-5'>
        <h2 className='line-clamp-2 text-base leading-tight font-semibold text-white'>
          {title}
        </h2>
        {vision && (
          <p className='mt-1.5 line-clamp-2 text-xs leading-relaxed text-gray-500'>
            {vision}
          </p>
        )}
      </div>

      {/* Progress — contextual per status */}
      <div className='mt-auto px-4 pt-3 sm:px-5'>
        {(status === 'Draft' ||
          status === 'Voting' ||
          status === 'In Review') && (
          <div>
            <div className='flex items-baseline justify-between'>
              <span className='text-xs text-gray-500'>Votes</span>
              <span className='text-sm font-medium text-white'>
                {formatNumber(totalVotes)}
                <span className='text-xs text-gray-600'>
                  {' '}
                  / {formatNumber(currentVoteGoal)}
                </span>
              </span>
            </div>
            <Progress
              value={(totalVotes / currentVoteGoal) * 100}
              className='mt-1.5 h-1.5 w-full rounded-full bg-neutral-800'
              indicatorClassName='bg-white'
            />
          </div>
        )}

        {status === 'Funding' && (
          <div>
            <div className='flex items-baseline justify-between'>
              <span className='text-xs text-gray-500'>Raised</span>
              <div className='flex items-baseline gap-1'>
                <span className='text-primary text-lg font-bold tabular-nums'>
                  {formatNumber(fundingRaised)}
                </span>
                <span className='text-xs text-gray-600'>
                  / {formatNumber(fundingGoal)} {fundingCurrency}
                </span>
              </div>
            </div>
            <div className='mt-1.5 flex items-center gap-2'>
              <Progress
                value={fundingProgress}
                className='h-1.5 flex-1 rounded-full bg-neutral-800'
              />
              <span className='text-[11px] text-gray-500 tabular-nums'>
                {Math.round(fundingProgress)}%
              </span>
            </div>
          </div>
        )}

        {(status === 'Funded' || status === 'Completed') &&
          totalMilestonesCount > 0 && (
            <div>
              <div className='flex items-baseline justify-between'>
                <span className='text-xs text-gray-500'>Milestones</span>
                <span className='text-sm font-medium text-white'>
                  {completedMilestones}
                  <span className='text-xs text-gray-600'>
                    {' '}
                    / {totalMilestonesCount}
                  </span>
                </span>
              </div>
              <Progress
                value={milestonesProgress}
                className='mt-1.5 h-1.5 w-full rounded-full bg-neutral-800'
                indicatorClassName='bg-green-500'
              />
            </div>
          )}
      </div>

      {/* Footer */}
      <div className='mt-3 flex items-center justify-between border-t border-neutral-800 px-4 py-3 sm:px-5'>
        {(status === 'Funding' ||
          status === 'Draft' ||
          status === 'Voting' ||
          status === 'In Review') &&
        fundingEndDate ? (
          <div className='flex items-center gap-2'>
            <span className='text-[10px] text-gray-500 uppercase'>Ends in</span>
            <CountdownTimer
              targetDate={fundingEndDate}
              size='sm'
              className='border-neutral-700 bg-neutral-900/50 text-gray-300'
            />
          </div>
        ) : status === 'Completed' ? (
          <span className='text-xs font-medium text-green-400'>Completed</span>
        ) : status === 'Funded' ? (
          <span className='text-xs font-medium text-green-400'>
            Fully Funded
          </span>
        ) : (
          <span className='text-xs text-gray-600'>
            {fundingEndDate ? 'No deadline' : ''}
          </span>
        )}

        {status === 'Funding' && fundingRaised > 0 && (
          <span className='text-[11px] text-gray-500'>
            {Math.max(
              0,
              Math.ceil(
                (new Date(fundingEndDate || '').getTime() - Date.now()) /
                  (1000 * 60 * 60 * 24)
              )
            )}{' '}
            days left
          </span>
        )}
      </div>
    </div>
  );
}

export default ProjectCard;
