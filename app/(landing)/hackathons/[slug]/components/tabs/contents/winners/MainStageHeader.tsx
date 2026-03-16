import { AwardIcon, Star } from 'lucide-react';

export const MainStageHeader = () => {
  return (
    <div className='mb-8 flex items-center gap-3'>
      <div className='flex h-8 w-8 items-center justify-center'>
        <AwardIcon className='text-primary h-8 w-8' />
      </div>
      <h2 className='flex items-center gap-2 text-2xl font-bold tracking-tight text-white/90'>
        Main Stage Winners
      </h2>
    </div>
  );
};
