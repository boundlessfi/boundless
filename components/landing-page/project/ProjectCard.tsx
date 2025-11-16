'use client';
import { Progress } from '@/components/ui/progress';
import { formatNumber } from '@/lib/utils';
import { useRouter } from 'nextjs-toploader/app';

type ProjectCardProps = {
  projectId?: string;
  creatorName: string;
  creatorLogo: string;
  projectImage: string;
  projectTitle: string;
  projectDescription: string;
  status: 'Validation' | 'Funding' | 'Funded' | 'Completed';
  deadlineInDays: number;
  milestoneRejected?: boolean;
  isFullWidth?: boolean;
  votes?: {
    current: number;
    goal: number;
  };
  funding?: {
    current: number;
    goal: number;
    currency: string;
  };
  milestones?: {
    current: number;
    goal: number;
  };
};
function ProjectCard({
  projectId,
  creatorName,
  creatorLogo,
  projectImage,
  projectTitle,
  projectDescription,
  status,
  deadlineInDays,
  milestoneRejected,
  isFullWidth = false,
  votes,
  funding,
  milestones,
}: ProjectCardProps) {
  const router = useRouter();
  const handleClick = () => {
    router.push(`/projects/${projectId}`);
  };
  const getStatusStyles = () => {
    switch (status) {
      case 'Funding':
        return 'bg-blue-ish border-blue-ish-darker text-blue-ish-darker';
      case 'Funded':
        return 'bg-transparent border-primary text-primary';
      case 'Completed':
        return 'bg-success-green border-success-green-darker text-success-green-darker';
      case 'Validation':
        return 'bg-warning-orange border-warning-orange-darker text-warning-orange-darker';
      default:
        return '';
    }
  };

  const getDeadlineInfo = () => {
    if (status === 'Completed' && milestoneRejected) {
      return {
        text: '1 Milestone Rejected',
        className: 'text-red-500',
      };
    }

    if (deadlineInDays <= 3) {
      return {
        text: `${deadlineInDays} days to deadline`,
        className: 'text-error-status',
      };
    }

    if (deadlineInDays <= 15) {
      return {
        text: `${deadlineInDays} days to deadline`,
        className: 'text-warning-orange-darker',
      };
    }

    return {
      text: `${deadlineInDays} days to deadline`,
      className: 'text-success-green-darker',
    };
  };

  const deadlineInfo = getDeadlineInfo();

  return (
    <div
      onClick={handleClick}
      className={`font-inter hover:border-primary/45 flex w-full ${isFullWidth ? 'max-w-full' : 'max-w-[397px]'} cursor-pointer flex-col gap-4 rounded-[8px] border border-gray-900 bg-[#030303] p-4 transition-all duration-300 sm:p-5`}
    >
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <div
            style={{ backgroundImage: `url(${creatorLogo})` }}
            className='size-6 rounded-full bg-white bg-cover bg-center'
          ></div>
          <h4 className='text-sm font-normal text-gray-500'>{creatorName}</h4>
        </div>
        <div className='flex items-center gap-3'>
          <div className='bg-office-brown border-office-brown-darker text-office-brown-darker flex w-[63px] items-center justify-center rounded-[4px] border px-1 py-0.5 text-xs font-semibold'>
            Category
          </div>
          <div
            className={`rounded-[4px] px-1 py-0.5 ${getStatusStyles()} flex items-center justify-center border text-xs font-semibold`}
          >
            {status}
          </div>
        </div>
      </div>
      <div className='flex items-start gap-3 sm:gap-5'>
        <div
          style={{ backgroundImage: `url(${projectImage})` }}
          className='h-[70px] w-[60px] flex-shrink-0 rounded-[8px] bg-white bg-cover bg-center sm:h-[90px] sm:w-[79.41px]'
        ></div>
        <div className='flex min-w-0 flex-1 flex-col gap-2'>
          <h2 className='line-clamp-2 text-left text-sm font-semibold text-white sm:text-base'>
            {projectTitle}
          </h2>
          <div className='group relative'>
            <p className='line-clamp-3 cursor-pointer text-left text-xs font-normal text-white sm:text-sm'>
              {projectDescription}
            </p>
          </div>
        </div>
      </div>
      <div className='flex flex-col gap-2'>
        <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2'>
            {status === 'Validation' && votes && (
              <h3 className='text-xs font-medium text-[#f5f5f5] sm:text-sm'>
                {formatNumber(votes.current)}/{formatNumber(votes.goal)}{' '}
                <span className='text-gray-500'>Votes</span>
              </h3>
            )}
            {status === 'Funding' && funding && (
              <h3 className='text-xs font-medium text-[#f5f5f5] sm:text-sm'>
                {formatNumber(funding.current)}/{formatNumber(funding.goal)}{' '}
                <span className='text-gray-500'>{funding.currency} raised</span>
              </h3>
            )}
            {(status === 'Funded' || status === 'Completed') && milestones && (
              <h3 className='text-xs font-medium text-[#f5f5f5] sm:text-sm'>
                {milestones.current}/{milestones.goal}{' '}
                <span className='text-gray-500'>Milestones Submitted</span>
              </h3>
            )}
          </div>

          <h3
            className={`text-xs font-medium sm:text-sm ${deadlineInfo.className}`}
          >
            {deadlineInfo.text}
          </h3>
        </div>
        <div className='w-full'>
          <Progress
            value={
              status === 'Validation'
                ? votes
                  ? (votes.current / votes.goal) * 100
                  : 0
                : status === 'Funding'
                  ? funding
                    ? (funding.current / funding.goal) * 100
                    : 0
                  : milestones
                    ? (milestones.current / milestones.goal) * 100
                    : 0
            }
            className='h-2 w-full rounded-full'
          />
        </div>
      </div>
    </div>
  );
}

export default ProjectCard;
