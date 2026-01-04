'use client';
import { Progress } from '@/components/ui/progress';
import { formatNumber } from '@/lib/utils';
import { useRouter } from 'nextjs-toploader/app';
import type { Crowdfunding } from '@/types/project';

type ProjectCardProps = {
  newTab?: boolean;
  isFullWidth?: boolean;
  project?: Crowdfunding;
  // Legacy props for backward compatibility
  projectId?: string;
  creatorName?: string;
  creatorLogo?: string;
  projectImage?: string;
  projectTitle?: string;
  projectDescription?: string;
  status?: 'Validation' | 'Funding' | 'Funded' | 'Completed';
  deadlineInDays?: number;
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
  project,
  newTab = false,
  isFullWidth = false,
  projectId,
  creatorName,
  creatorLogo,
  projectImage,
  projectTitle,
  projectDescription,
  status: legacyStatus,
  deadlineInDays: legacyDeadline,
  votes,
  funding,
  milestones,
}: ProjectCardProps) {
  const router = useRouter();

  const isNewFormat =
    !!project && typeof project === 'object' && 'fundingGoal' in project;
  const currentProjectId =
    (isNewFormat && project ? project.id : projectId) || '';
  const currentCreatorName =
    (isNewFormat && project ? project.project.creator.name : creatorName) ||
    'Unknown Creator';
  const currentCreatorLogo =
    (isNewFormat && project ? project.project.creator.image : creatorLogo) ||
    '/user.png';
  const currentProjectImage =
    (isNewFormat && project ? project.project.logo : projectImage) ||
    '/landing/explore/project-placeholder-1.png';
  const currentProjectTitle =
    (isNewFormat && project ? project.project.title : projectTitle) || '';
  const currentProjectDescription =
    (isNewFormat && project
      ? project.project.description || project.project.vision
      : projectDescription) || '';

  const getProjectStatus = () => {
    if (!isNewFormat || !project) return legacyStatus || 'Funding';

    const status = project.project.status;
    if (status === 'IDEA') return 'Validation';
    if (status === 'ACTIVE') return 'Funding';
    if (status === 'COMPLETED') return 'Completed';
    return 'Funding'; // default
  };

  const getDeadlineInDays = () => {
    if (!isNewFormat || !project) return legacyDeadline || 0;

    try {
      const now = new Date();
      const end = new Date(project.fundingEndDate);
      return Math.max(
        0,
        Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      );
    } catch {
      return 0;
    }
  };

  const status = getProjectStatus();
  const deadlineInDays = getDeadlineInDays();

  const handleClick = () => {
    router.push(`/projects/${currentProjectId}`);
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
    if (status === 'Completed' && isNewFormat && project) {
      // Check if any milestones are rejected
      const rejectedMilestones = project.milestones.filter(
        m => m.status === 'rejected'
      );
      if (rejectedMilestones.length > 0) {
        return {
          text: `${rejectedMilestones.length} Milestone${rejectedMilestones.length > 1 ? 's' : ''} Rejected`,
          className: 'text-red-500',
        };
      }
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
      onClick={!newTab ? handleClick : () => {}}
      className={`font-inter hover:border-primary/45 flex w-full ${isFullWidth ? 'max-w-full' : 'max-w-[397px]'} cursor-pointer flex-col gap-4 rounded-[8px] border border-gray-900 bg-[#030303] p-4 transition-all duration-300 sm:p-5`}
    >
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <div
            style={{ backgroundImage: `url(${currentCreatorLogo})` }}
            className='size-6 rounded-full bg-white bg-cover bg-center'
          ></div>
          <h4 className='text-sm font-normal text-gray-500'>
            {currentCreatorName}
          </h4>
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
          style={{ backgroundImage: `url(${currentProjectImage})` }}
          className='h-[70px] w-[60px] flex-shrink-0 rounded-[8px] bg-white bg-cover bg-center sm:h-[90px] sm:w-[79.41px]'
        ></div>
        <div className='flex min-w-0 flex-1 flex-col gap-2'>
          <h2 className='line-clamp-2 text-left text-sm font-semibold text-white sm:text-base'>
            {currentProjectTitle}
          </h2>
          <div className='group relative'>
            <p className='line-clamp-3 cursor-pointer text-left text-xs font-normal text-white sm:text-sm'>
              {currentProjectDescription}
            </p>
          </div>
        </div>
      </div>
      <div className='flex flex-col gap-2'>
        <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2'>
            {status === 'Validation' && (
              <h3 className='text-xs font-medium text-[#f5f5f5] sm:text-sm'>
                {formatNumber(
                  isNewFormat ? project.project.votes || 0 : votes?.current || 0
                )}
                /{formatNumber(isNewFormat ? 100 : votes?.goal || 100)}{' '}
                <span className='text-gray-500'>Votes</span>
              </h3>
            )}
            {status === 'Funding' && (
              <h3 className='text-xs font-medium text-[#f5f5f5] sm:text-sm'>
                {formatNumber(
                  isNewFormat ? project.fundingRaised : funding?.current || 0
                )}
                /
                {formatNumber(
                  isNewFormat ? project.fundingGoal : funding?.goal || 0
                )}{' '}
                <span className='text-gray-500'>
                  {isNewFormat
                    ? project.fundingCurrency
                    : funding?.currency || 'USD'}{' '}
                  raised
                </span>
              </h3>
            )}
            {(status === 'Funded' || status === 'Completed') && (
              <h3 className='text-xs font-medium text-[#f5f5f5] sm:text-sm'>
                {isNewFormat
                  ? project.milestones.filter(m => m.status === 'completed')
                      .length
                  : milestones?.current || 0}
                /
                {isNewFormat
                  ? project.milestones.length
                  : milestones?.goal || 0}{' '}
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
                ? ((isNewFormat && project
                    ? project.project.votes || 0
                    : votes?.current || 0) /
                    (isNewFormat ? 100 : votes?.goal || 100)) *
                  100
                : status === 'Funding'
                  ? ((isNewFormat && project
                      ? project.fundingRaised
                      : funding?.current || 0) /
                      (isNewFormat && project
                        ? project.fundingGoal
                        : funding?.goal || 1)) *
                    100
                  : ((isNewFormat && project
                      ? project.milestones.filter(m => m.status === 'completed')
                          .length
                      : milestones?.current || 0) /
                      (isNewFormat && project
                        ? project.milestones.length
                        : milestones?.goal || 1)) *
                    100
            }
            className='h-2 w-full rounded-full'
          />
        </div>
      </div>
    </div>
  );
}

export default ProjectCard;
