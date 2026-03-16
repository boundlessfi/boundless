import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { HackathonWinner } from '@/lib/api/hackathons';
import { SubmissionCardProps } from '@/types/hackathon';

interface GeneralWinnerCardProps {
  winner: HackathonWinner;
  submission?: SubmissionCardProps;
}

export const GeneralWinnerCard = ({
  winner,
  submission,
}: GeneralWinnerCardProps) => {
  return (
    <div className='flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-[#0A0A0A] p-4 transition-all hover:border-white/10'>
      <div className='flex items-center gap-4'>
        <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-[10px] font-bold text-white/40'>
          #{winner.rank}
        </div>
        <div>
          <h4 className='text-sm font-bold tracking-tight text-white'>
            {winner.projectName}
          </h4>
          <span className='text-[10px] font-medium text-white/40'>
            {winner.teamName || winner.participants[0]?.username}
          </span>
        </div>
      </div>

      <div className='text-primary text-xs font-bold'>{winner.prize}</div>
    </div>
  );
};
