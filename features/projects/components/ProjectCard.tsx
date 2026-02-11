import { Progress } from '@/components/ui/progress';
import { formatNumber, cn } from '@/lib/utils';
import { useRouter } from 'nextjs-toploader/app';
import Image from 'next/image';
import { CountdownTimer } from '@/components/ui/timer';
import { Crowdfunding } from '@/features/projects/types';

type ProjectCardProps = {
  data: Crowdfunding;
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
    fundingGoal,
    fundingRaised,
    fundingCurrency,
    fundingEndDate,
    milestones,
    voteGoal,
    voteProgress,
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
    router.push(`/projects/${slug}`);
  };

  // Determine display status
  const getDisplayStatus = () => {
    if (projectStatus === 'IDEA') return 'Validation';
    if (projectStatus === 'ACTIVE') return 'Funding';
    if (projectStatus === 'LIVE') return 'Funded';
    if (projectStatus === 'COMPLETED') return 'Completed';
    return projectStatus;
  };

  const status = getDisplayStatus();

  const getStatusStyles = () => {
    switch (status) {
      case 'Funding':
        return 'text-blue-400 bg-blue-400/10';
      case 'Funded':
        return 'text-green-400 bg-green-400/10';
      case 'Completed':
        return 'text-green-400 bg-green-400/10';
      case 'Validation':
        return 'text-yellow-400 bg-yellow-400/10';
      default:
        return 'text-gray-400 bg-gray-800/20';
    }
  };

  // Stats calculations
  const totalVotes = _count?.votes || 0;
  const currentVoteGoal = voteGoal || 1;
  const fundingProgress = (fundingRaised / (fundingGoal || 1)) * 100;

  const completedMilestones =
    milestones?.filter(m => m.reviewStatus === 'completed')?.length || 0;
  const totalMilestonesCount = milestones?.length || 0;
  const milestonesProgress =
    (completedMilestones / (totalMilestonesCount || 1)) * 100;

  const getDeadlineInfo = () => {
    if (status === 'Completed') {
      return { text: 'Completed', className: 'text-green-400' };
    }

    if (!fundingEndDate) {
      return { text: 'No deadline', className: 'text-gray-400' };
    }

    const now = new Date();
    const end = new Date(fundingEndDate);
    const diffTime = end.getTime() - now.getTime();
    const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    if (daysLeft <= 3) {
      return {
        text: `${daysLeft} days left`,
        className: 'text-red-400',
      };
    }

    if (daysLeft <= 15) {
      return {
        text: `${daysLeft} days left`,
        className: 'text-yellow-400',
      };
    }

    return {
      text: `${daysLeft} days left`,
      className: 'text-green-400',
    };
  };

  const deadlineInfo = getDeadlineInfo();
  const statusColor = getStatusStyles();

  return (
    <div
      onClick={!newTab ? handleClick : () => {}}
      className={cn(
        'group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-neutral-800 bg-[#0c0c0c] transition-all duration-300 hover:border-neutral-700 hover:shadow-lg hover:shadow-black/40',
        isFullWidth ? 'w-full' : 'max-w-[400px]',
        className
      )}
    >
      {/* Banner / Image Section */}
      <div className='relative h-44 overflow-hidden sm:h-52'>
        <Image
          src={currentBanner}
          alt={title}
          fill
          className='object-cover transition-transform duration-300 group-hover:scale-105'
          unoptimized
          onError={e => {
            // Fallback to project logo if banner fails
            e.currentTarget.src = logo || '';
            e.currentTarget.classList.add(
              'object-contain',
              'p-4',
              'bg-[#1a1a1a]'
            );
            e.currentTarget.classList.remove('object-cover');
          }}
        />
        <div className='absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent' />

        {/* Top Overlay: Categories & Status Badge */}
        <div className='absolute top-3 right-3 left-3 flex items-center justify-between'>
          {/* Categories */}
          <div className='flex gap-1.5'>
            <span className='rounded-md bg-neutral-800/70 px-2 py-0.5 text-[11px] font-medium whitespace-nowrap text-gray-300'>
              {category}
            </span>
          </div>

          <span
            className={`rounded-md px-2 py-0.5 text-xs font-semibold backdrop-blur-sm ${statusColor}`}
          >
            {status}
          </span>
        </div>

        {/* Bottom Overlay: Creator Info */}
        <div className='absolute bottom-3 left-3 flex items-center gap-2'>
          <div
            className='size-7 rounded-full border border-white/20 bg-white bg-cover bg-center'
            style={{
              backgroundImage: creator?.image
                ? `url(${creator.image})`
                : undefined,
            }}
          />
          <span className='text-xs font-medium text-white/90 drop-shadow-md'>
            {creator?.name || 'Unknown Creator'}
          </span>
        </div>
      </div>

      {/* Body Section */}
      <div className='flex flex-col gap-3 pt-3'>
        <div className='px-4 sm:px-5'>
          <div className='flex items-start gap-3'>
            <h2 className='line-clamp-2 text-base leading-tight font-semibold text-white sm:text-lg'>
              {title}
            </h2>
          </div>

          <p className='mt-1 line-clamp-2 text-xs text-gray-400 sm:text-sm'>
            {vision}
          </p>
        </div>

        {/* Stats / Progress Section */}
        <div className='flex flex-col gap-2 border-t border-neutral-800 px-4 pt-3 pb-1 sm:px-5'>
          {status === 'Validation' && (
            <div className='flex flex-col gap-1'>
              <div className='flex items-baseline justify-between'>
                <span className='text-sm text-gray-400'>Votes</span>
                <span className='font-medium text-white'>
                  {formatNumber(totalVotes)}
                  <span className='text-xs text-gray-500'>
                    {' '}
                    / {formatNumber(currentVoteGoal)}
                  </span>
                </span>
              </div>
              <Progress
                value={(totalVotes / currentVoteGoal) * 100}
                className='h-1.5 w-full rounded-full bg-neutral-800'
                indicatorClassName='bg-white'
              />
            </div>
          )}

          {status === 'Funding' && (
            <div className='flex flex-col gap-1'>
              <div className='flex items-baseline justify-between'>
                <span className='text-sm text-gray-400'>Raised</span>
                <div className='flex items-baseline gap-1'>
                  <span className='text-primary text-base font-semibold'>
                    {formatNumber(fundingRaised)}
                  </span>
                  <span className='text-xs text-gray-500'>
                    / {formatNumber(fundingGoal)} {fundingCurrency}
                  </span>
                </div>
              </div>
              <Progress
                value={fundingProgress}
                className='h-1.5 w-full rounded-full bg-neutral-800'
              />
            </div>
          )}

          {(status === 'Funded' || status === 'Completed') && (
            <div className='flex flex-col gap-1'>
              <div className='flex items-baseline justify-between'>
                <span className='text-sm text-gray-400'>Milestones</span>
                <span className='font-medium text-white'>
                  {completedMilestones}
                  <span className='text-xs text-gray-500'>
                    {' '}
                    / {totalMilestonesCount}
                  </span>
                </span>
              </div>
              <Progress
                value={milestonesProgress}
                className='h-1.5 w-full rounded-full bg-neutral-800'
                indicatorClassName='bg-green-500'
              />
            </div>
          )}
        </div>

        {/* Footer info: Deadline/Status Text */}
        <div className='flex items-center justify-between border-t border-neutral-800 px-4 py-3 sm:px-5'>
          {(status === 'Funding' || status === 'Validation') &&
          fundingEndDate ? (
            <div className='flex items-center gap-2'>
              <span className='text-[10px] whitespace-nowrap text-gray-400 uppercase'>
                Deadline in:
              </span>
              <CountdownTimer
                targetDate={fundingEndDate}
                size='sm'
                className='border-neutral-700 bg-neutral-900/50 text-gray-300'
              />
            </div>
          ) : (
            <span
              className={cn(
                'text-xs font-medium capitalize',
                deadlineInfo.className
              )}
            >
              {deadlineInfo.text}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProjectCard;
