import React from 'react';
import BasicAvatar from '@/components/avatars/BasicAvatar';
import { Badge } from '@/components/ui/badge';
import { BoundlessButton } from '@/components/buttons';
import { IconMessage } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

interface ParticipantCardProps {
  name: string;
  username: string;
  image?: string;
  submitted?: boolean;
  skills?: string[];
  onViewProfile?: () => void;
  onMessage?: () => void;
}

const ParticipantCard = ({
  name,
  username,
  image,
  submitted,
  skills = [],
  onViewProfile,
  onMessage,
}: ParticipantCardProps) => {
  const visibleSkills = skills.slice(0, 3);
  const hiddenSkillsCount = skills.length - visibleSkills.length;

  return (
    <div className='border-primary/5 group hover:border-primary/20 flex flex-col justify-between space-y-4 rounded-xl border bg-[#18181B99] p-5 transition-all hover:bg-[#18181B]'>
      <div className='flex items-start justify-between'>
        <BasicAvatar name={name} username={username} image={image} />
        <Badge
          variant='outline'
          className={cn(
            'rounded px-2 py-0.5 text-[10px] font-bold tracking-tight uppercase',
            submitted
              ? 'border-primary/20 bg-primary/10 text-primary'
              : 'border-white/10 bg-white/5 text-gray-500'
          )}
        >
          {submitted ? 'Submitted' : 'In Progress'}
        </Badge>
      </div>

      <div className='flex flex-wrap gap-1.5'>
        {visibleSkills.map(skill => (
          <Badge
            key={skill}
            variant='secondary'
            className='border-white/5 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-gray-400 group-hover:text-gray-300'
          >
            {skill}
          </Badge>
        ))}
        {hiddenSkillsCount > 0 && (
          <Badge
            variant='secondary'
            className='border-white/5 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-gray-500'
          >
            +{hiddenSkillsCount}
          </Badge>
        )}
      </div>

      <div className='flex items-center gap-2 pt-2'>
        <BoundlessButton fullWidth size='sm' onClick={onViewProfile}>
          View Profile
        </BoundlessButton>
        <BoundlessButton
          variant='outline'
          size='icon'
          className='hover:border-primary/30 h-9 w-9 border-white/10'
          onClick={onMessage}
          aria-label='Message participant'
        >
          <IconMessage size={18} />
        </BoundlessButton>
      </div>
    </div>
  );
};

export default ParticipantCard;
