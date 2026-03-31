import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { HackathonWinner } from '@/lib/api/hackathons';
import { Trophy } from 'lucide-react';
import { SubmissionCardProps } from '@/types/hackathon';
import { BoundlessButton } from '@/components/buttons/BoundlessButton';
import Image from 'next/image';

interface PodiumWinnerCardProps {
  winner: HackathonWinner;
  submission?: SubmissionCardProps;
}

export const PodiumWinnerCard = ({
  winner,
  submission,
}: PodiumWinnerCardProps) => {
  const projectUrl = `/projects/${winner.submissionId}?type=submission`;

  return (
    <div className='relative w-full overflow-hidden rounded-2xl border border-white/5 bg-[#0A0A0A] p-6 transition-all hover:border-white/10'>
      <div className='mb-4 flex items-center justify-between gap-4'>
        <div className='text-[10px] font-bold tracking-widest text-white/40 uppercase'>
          Rank #{winner.rank}
        </div>
        <div className='flex items-center gap-2'>
          <div className='flex h-6 w-6 items-center justify-center rounded-full border border-[#2775CA]/30 bg-[#2775CA]/20'>
            <Image src='/assets/usdc.svg' alt='' width={24} height={24} />
          </div>
          <span className='text-primary text-lg font-bold'>{winner.prize}</span>
        </div>
      </div>

      <h3 className='mb-2 text-xl leading-tight font-bold tracking-tight text-white'>
        {winner.projectName}
      </h3>

      <p className='mb-6 line-clamp-2 text-xs leading-relaxed text-white/50'>
        {submission?.description || 'No description provided for this project.'}
      </p>

      <div className='flex items-center justify-between gap-3'>
        <div className='flex items-center gap-3'>
          <Avatar className='h-8 w-8 border border-white/10'>
            <AvatarImage src={winner.participants[0]?.avatar} />
            <AvatarFallback className='bg-white/5 text-[10px] font-bold text-white/60'>
              {winner.participants[0]?.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className='flex flex-col'>
            <span className='text-[11px] font-medium text-white/80'>
              {winner.teamName || winner.participants[0]?.username}
            </span>
          </div>
        </div>

        <a href={projectUrl} target='_blank' rel='noopener noreferrer'>
          <BoundlessButton
            variant='outline'
            size='sm'
            className='hover:bg-primary h-8 rounded-lg border-white/5 bg-white/5 px-3 text-[10px] font-bold transition-all hover:text-black'
          >
            View Project
          </BoundlessButton>
        </a>
      </div>
    </div>
  );
};
