import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SubmissionActionButtonsProps {
  onDisqualify: () => void;
  onShortlist: () => void;
}

export default function SubmissionActionButtons({
  onDisqualify,
  onShortlist,
}: SubmissionActionButtonsProps) {
  return (
    <div className='flex w-full items-center justify-between gap-4'>
      <Button
        variant='destructive'
        size='lg'
        onClick={onDisqualify}
        className='flex-1 gap-2 bg-red-500/10 text-red-500 hover:bg-red-500/20'
      >
        <Trash2 className='h-4 w-4' />
        Disqualify
      </Button>
      <Button
        variant='default'
        size='lg'
        onClick={onShortlist}
        className='flex-1 gap-2'
      >
        <Plus className='h-4 w-4' />
        Shortlist
      </Button>
    </div>
  );
}
