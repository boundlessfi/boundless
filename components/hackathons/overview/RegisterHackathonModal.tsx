'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Users, User } from 'lucide-react';
import { useRegisterHackathon } from '@/hooks/hackathon/use-register-hackathon';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const registerSchema = z
  .object({
    participationType: z.enum(['individual', 'team']),
    teamName: z.string().optional(),
    teamMembers: z.array(z.string()).optional(),
  })
  .refine(
    data => {
      if (data.participationType === 'team') {
        return data.teamName && data.teamName.trim().length > 0;
      }
      return true;
    },
    {
      message: 'Team name is required for team participation',
      path: ['teamName'],
    }
  );

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterHackathonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hackathonSlugOrId: string;
  organizationId?: string;
  onSuccess?: () => void;
}

export function RegisterHackathonModal({
  open,
  onOpenChange,
  hackathonSlugOrId,
  organizationId,
  onSuccess,
}: RegisterHackathonModalProps) {
  const [teamMemberEmail, setTeamMemberEmail] = useState('');
  const [teamMembers, setTeamMembers] = useState<string[]>([]);

  const { register: registerForHackathon, isRegistering } =
    useRegisterHackathon({
      hackathonSlugOrId,
      organizationId,
      autoCheck: false,
    });

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      participationType: 'individual',
      teamName: '',
      teamMembers: [],
    },
  });

  const participationType = form.watch('participationType');

  const handleAddTeamMember = () => {
    if (
      teamMemberEmail.trim() &&
      !teamMembers.includes(teamMemberEmail.trim())
    ) {
      setTeamMembers([...teamMembers, teamMemberEmail.trim()]);
      form.setValue('teamMembers', [...teamMembers, teamMemberEmail.trim()]);
      setTeamMemberEmail('');
    }
  };

  const handleRemoveTeamMember = (email: string) => {
    const updated = teamMembers.filter(m => m !== email);
    setTeamMembers(updated);
    form.setValue('teamMembers', updated);
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerForHackathon({
        participationType: data.participationType,
        teamName: data.participationType === 'team' ? data.teamName : undefined,
        teamMembers:
          data.participationType === 'team' ? data.teamMembers : undefined,
      });

      toast.success('Successfully registered for hackathon!');
      onOpenChange(false);
      form.reset();
      setTeamMembers([]);
      setTeamMemberEmail('');
      onSuccess?.();
    } catch {
      // Error is already handled in the hook
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
            Choose how you want to participate in this hackathon
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <FormField
              control={form.control}
              name='participationType'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className='flex flex-col space-y-3'
                    >
                      <div className='flex items-center space-x-3 rounded-lg border border-gray-700 bg-gray-800/50 p-4 transition-colors hover:bg-gray-800'>
                        <RadioGroupItem value='individual' id='individual' />
                        <Label
                          htmlFor='individual'
                          className='flex flex-1 cursor-pointer items-center gap-3'
                        >
                          <User className='h-5 w-5 text-gray-400' />
                          <div>
                            <div className='font-medium text-white'>
                              Individual
                            </div>
                            <div className='text-sm text-gray-400'>
                              Participate on your own
                            </div>
                          </div>
                        </Label>
                      </div>

                      <div className='flex items-center space-x-3 rounded-lg border border-gray-700 bg-gray-800/50 p-4 transition-colors hover:bg-gray-800'>
                        <RadioGroupItem value='team' id='team' />
                        <Label
                          htmlFor='team'
                          className='flex flex-1 cursor-pointer items-center gap-3'
                        >
                          <Users className='h-5 w-5 text-gray-400' />
                          <div>
                            <div className='font-medium text-white'>Team</div>
                            <div className='text-sm text-gray-400'>
                              Collaborate with others
                            </div>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {participationType === 'team' && (
              <div className='space-y-4'>
                <FormField
                  control={form.control}
                  name='teamName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-white'>Team Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder='Enter your team name'
                          className='border-gray-700 bg-gray-800/50 text-white placeholder:text-gray-500'
                        />
                      </FormControl>
                      <FormDescription className='text-gray-400'>
                        Choose a unique name for your team
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='space-y-2'>
                  <Label className='text-white'>Team Members</Label>
                  <FormDescription className='text-gray-400'>
                    Add team members by email (optional - you can add them
                    later)
                  </FormDescription>
                  <div className='flex gap-2'>
                    <Input
                      type='email'
                      placeholder='team.member@example.com'
                      value={teamMemberEmail}
                      onChange={e => setTeamMemberEmail(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTeamMember();
                        }
                      }}
                      className='border-gray-700 bg-gray-800/50 text-white placeholder:text-gray-500'
                    />
                    <Button
                      type='button'
                      onClick={handleAddTeamMember}
                      variant='outline'
                      className='border-gray-700 text-white hover:bg-gray-800'
                    >
                      Add
                    </Button>
                  </div>

                  {teamMembers.length > 0 && (
                    <div className='mt-2 space-y-2'>
                      {teamMembers.map(email => (
                        <div
                          key={email}
                          className='flex items-center justify-between rounded-lg border border-gray-700 bg-gray-800/50 px-3 py-2'
                        >
                          <span className='text-sm text-gray-300'>{email}</span>
                          <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            onClick={() => handleRemoveTeamMember(email)}
                            className='h-6 w-6 p-0 text-gray-400 hover:text-red-400'
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

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
                type='submit'
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
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
