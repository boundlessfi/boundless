import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { HackathonWinner } from '@/lib/api/hackathons';
import { Trophy } from 'lucide-react';
import Image from 'next/image';
import { SubmissionCardProps } from '@/types/hackathon';
import BasicAvatar from '@/components/avatars/BasicAvatar';

interface TopWinnerCardProps {
  winner: HackathonWinner;
  submission?: SubmissionCardProps;
}

export const TopWinnerCard = ({ winner, submission }: TopWinnerCardProps) => {
  const bannerUrl = submission?.logo || '/images/default-project-banner.png'; // Fallback to logo or default

  return (
    <div className='relative w-full overflow-hidden rounded-2xl border border-white/5 bg-[#0A0A0A] p-6 transition-all hover:border-white/10'>
      <div className='flex flex-col gap-8 md:flex-row'>
        {/* Project Visual */}
        <div className='relative aspect-4/3 w-full shrink-0 overflow-hidden rounded-xl bg-linear-to-br from-indigo-500/20 to-purple-500/20 md:w-[240px] lg:w-[280px]'>
          {submission?.logo ? (
            <Image
              src={submission.logo}
              alt={winner.projectName}
              fill
              className='object-cover'
            />
          ) : (
            <div className='flex h-full w-full items-center justify-center'>
              <Trophy className='h-12 w-12 text-white/10' />
            </div>
          )}
        </div>

        {/* Project Info */}
        <div className='flex flex-1 flex-col py-1'>
          <div className='mb-6 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between lg:mb-2'>
            <div className='space-y-1'>
              <div className='text-primary flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase'>
                Rank #1 - GRAND PRIZE
              </div>
              <h3 className='text-2xl leading-tight font-bold tracking-tight text-white sm:text-3xl sm:leading-none'>
                {winner.projectName}
              </h3>
            </div>

            <div className='flex shrink-0 items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-full border border-[#2775CA]/30 bg-[#2775CA]/20'>
                <Image src='/assets/usdc.svg' alt='' width={40} height={40} />
              </div>
              <div className='flex flex-col sm:items-end'>
                <span className='text-primary text-2xl leading-none font-bold sm:text-3xl'>
                  {winner.prize}
                </span>
                <span className='mt-1 text-[8px] font-bold tracking-wider text-white/40 uppercase'>
                  USDC DISTRIBUTED
                </span>
              </div>
            </div>
          </div>

          <p className='mb-6 line-clamp-2 max-w-2xl text-sm leading-relaxed text-white/60'>
            {submission?.description ||
              'No description provided for this project.'}
          </p>

          <div className='mt-auto flex items-center gap-4'>
            <div className='flex -space-x-3'>
              {winner.participants.map((participant, idx) => (
                <BasicAvatar
                  key={idx}
                  image={participant.avatar}
                  name={'Participant'}
                  username={participant.username}
                />
                // <Avatar
                //   key={idx}
                //   className='h-10 w-10 border-2 border-[#0A0A0A]'
                // >
                //   <AvatarImage src={participant.avatar} />
                //   <AvatarFallback className='bg-white/5 text-xs font-bold text-white/60'>
                //     {participant.username.slice(0, 2).toUpperCase()}
                //   </AvatarFallback>
                // </Avatar>
              ))}
            </div>
            {/* <div className='flex flex-col'>
              <span className='text-[10px] font-bold tracking-wider text-white/40 uppercase'>
                {winner.teamName ? 'Team members' : 'Participant'}
              </span>
              <span className='text-xs font-medium text-white/80'>
                {winner.teamName
                  ? winner.teamName
                  : winner.participants[0]?.username}
              </span>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};
