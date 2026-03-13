import { LayoutGrid } from 'lucide-react';
import GroupAvatar from '@/components/avatars/GroupAvatar';
import BasicAvatar from '@/components/avatars/BasicAvatar';
import { BoundlessButton } from '@/components/buttons/BoundlessButton';
import type { ExploreSubmissionsResponse } from '@/lib/api/hackathons';

interface SubmissionCardProps {
  submission: ExploreSubmissionsResponse;
  onViewClick?: (id: string) => void;
}

const SubmissionCard = ({ submission, onViewClick }: SubmissionCardProps) => {
  const {
    id,
    projectName,
    description,
    category,
    participationType = 'INDIVIDUAL',
    teamName,
    teamMembers = [],
    participant,
    logo,
  } = submission;

  const isTeam = participationType?.toUpperCase() === 'TEAM';

  const submitterName = isTeam
    ? (teamName ?? teamMembers?.[0]?.name ?? 'Unnamed Team')
    : (participant?.name ?? 'Anonymous');

  const submitterAvatar = isTeam
    ? (teamMembers?.[0]?.avatar ?? '')
    : (participant?.image ?? '');

  return (
    <div className='group hover:border-primary/20 bg-background-card hover:bg-background-card-hover flex h-full flex-col overflow-hidden rounded-2xl border border-white/5 p-4 transition-all'>
      {/* Project Icon/Logo */}
      <div className='text-primary mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#232B20]'>
        <LayoutGrid className='h-6 w-6' />
      </div>

      {/* Project Info */}
      <div className='mb-6 flex-1 space-y-3'>
        <h3 className='group-hover:text-primary line-clamp-1 text-xl font-bold text-white transition-colors'>
          {projectName}
        </h3>
        <p className='line-clamp-2 text-sm leading-relaxed text-gray-500'>
          {description}
        </p>

        {/* Tags/Categories */}
        <div className='flex flex-wrap gap-2 pt-2'>
          <span className='text-primary rounded-md bg-[#232B20]/50 px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase'>
            {category}
          </span>
          <span className='rounded-md bg-white/5 px-2.5 py-1 text-[10px] font-bold tracking-wider text-gray-400 uppercase'>
            Infrastructure
          </span>
        </div>
      </div>

      {/* Footer: Avatars + View Button */}
      <div className='flex items-center justify-between border-t border-white/5 pt-5'>
        <div className='flex items-center gap-3'>
          {isTeam ? (
            <GroupAvatar members={teamMembers.map(m => m.avatar ?? '')} />
          ) : (
            <BasicAvatar
              image={submitterAvatar}
              name={submitterName}
              username={submitterName.toLowerCase().replace(/\s+/g, '_')}
            />
          )}
        </div>

        <BoundlessButton
          variant='outline'
          size='sm'
          className='hover:bg-primary h-9 rounded-xl border-white/5 bg-white/5 px-4 text-xs font-bold transition-all hover:text-black'
          onClick={() => onViewClick?.(id)}
        >
          View Project
        </BoundlessButton>
      </div>
    </div>
  );
};

export default SubmissionCard;
