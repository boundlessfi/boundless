'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useRegisterHackathon } from '@/hooks/hackathon/use-register-hackathon';
import { toast } from 'sonner';
import type { Hackathon } from '@/lib/api/hackathons';

interface RegisterHackathonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hackathon: Hackathon | null;
  organizationId?: string;
  onSuccess?: (participantData?: any) => void;
}

export function RegisterHackathonModal({
  open,
  onOpenChange,
  hackathon,
  organizationId,
  onSuccess,
}: RegisterHackathonModalProps) {
  const { register: registerForHackathon, isRegistering } =
    useRegisterHackathon({
      hackathon,
      organizationId,
      autoCheck: false,
    });

  const handleRegister = async () => {
    try {
      const participantData = await registerForHackathon();

      toast.success('Successfully registered for hackathon!');
      onOpenChange(false);

      // Pass the participant data to onSuccess
      onSuccess?.(participantData);
    } catch {
      // Error handled in hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='bg-background-card border-gray-800 sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-white'>
            Register for Hackathon
          </DialogTitle>
          <DialogDescription className='text-gray-400'>
            Register to participate in this hackathon
          </DialogDescription>
        </DialogHeader>

        <div className='flex justify-end gap-3 pt-4'>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isRegistering}
            className='border-gray-700 text-white hover:bg-gray-800'
          >
            Cancel
          </Button>
          <Button
            onClick={handleRegister}
            disabled={isRegistering}
            className='bg-[#a7f950] text-black hover:bg-[#8fd93f] disabled:opacity-50'
          >
            {isRegistering ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Registering...
              </>
            ) : (
              'Register'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
