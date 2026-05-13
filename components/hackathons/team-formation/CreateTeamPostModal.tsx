'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import BoundlessSheet from '@/components/sheet/boundless-sheet';
import { BoundlessButton } from '@/components/buttons/BoundlessButton';
import { useTeamPosts } from '@/hooks/hackathon/use-team-posts';
import { Loader2, Plus, X, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type TeamRecruitmentPost } from '@/lib/api/hackathons/teams';

const roleSchema = z.object({
  role: z.string().min(1, 'Role name is required'),
  skills: z.array(z.string()).optional(),
});

// Fallback matches the backend's default when a hackathon hasn't pinned team size.
const DEFAULT_TEAM_MAX = 10;

interface CreateTeamPostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hackathonSlugOrId: string;
  teamMax?: number;
  organizationId?: string;
  initialData?: TeamRecruitmentPost;
  onSuccess?: () => void;
}

type Step = 'IDENTITY' | 'ROLES' | 'CONTACT';

export function CreateTeamPostModal({
  open,
  onOpenChange,
  hackathonSlugOrId,
  teamMax,
  organizationId,
  initialData,
  onSuccess,
}: CreateTeamPostModalProps) {
  const { createPost, updatePost, isCreating, isUpdating } = useTeamPosts({
    hackathonSlugOrId,
    autoFetch: false,
  });

  const effectiveTeamMax = teamMax ?? DEFAULT_TEAM_MAX;
  // Roles are opt-in recruitment slots. Team size minimums are enforced at
  // submission time once invites have filled the team.
  const maxRoles = Math.max(1, effectiveTeamMax - 1);

  const teamPostSchema = useMemo(
    () =>
      z.object({
        teamName: z
          .string()
          .min(3, 'Team name must be at least 3 characters')
          .max(100, 'Team name cannot exceed 100 characters'),
        description: z
          .string()
          .min(10, 'Description must be at least 10 characters')
          .max(500, 'Description cannot exceed 500 characters'),
        lookingFor: z
          .array(roleSchema)
          .max(
            maxRoles,
            `You can add at most ${maxRoles} open role${maxRoles === 1 ? '' : 's'} (the team is capped at ${effectiveTeamMax} member${effectiveTeamMax === 1 ? '' : 's'} including you)`
          ),
        contactMethod: z.enum([
          'email',
          'telegram',
          'discord',
          'github',
          'other',
        ]),
        contactInfo: z.string().min(1, 'Contact info is required'),
      }),
    [maxRoles, effectiveTeamMax]
  );

  type TeamPostFormData = z.infer<typeof teamPostSchema>;

  const [step, setStep] = useState<Step>('IDENTITY');
  const [skillInputs, setSkillInputs] = useState<Record<number, string>>({});

  const isEditMode = !!initialData;

  const form = useForm<TeamPostFormData>({
    resolver: zodResolver(teamPostSchema),
    defaultValues: {
      teamName: initialData?.teamName || '',
      description: initialData?.description || '',
      lookingFor:
        initialData?.lookingFor.map(roleObj => ({
          role: typeof roleObj === 'string' ? roleObj : roleObj.role,
          skills: typeof roleObj === 'string' ? [] : roleObj.skills || [],
        })) || [],
      contactMethod: initialData?.contactMethod || 'email',
      contactInfo: initialData?.contactInfo || '',
    },
  });

  const lookingFor = form.watch('lookingFor');
  const contactMethod = form.watch('contactMethod');

  useEffect(() => {
    if (open && initialData) {
      form.reset({
        teamName: initialData.teamName,
        description: initialData.description,
        lookingFor: initialData.lookingFor.map(roleObj => ({
          role: typeof roleObj === 'string' ? roleObj : roleObj.role,
          skills: typeof roleObj === 'string' ? [] : roleObj.skills || [],
        })),
        contactMethod: initialData.contactMethod || 'email',
        contactInfo: initialData.contactInfo,
      });
    } else if (!open) {
      form.reset();
      setStep('IDENTITY');
      setSkillInputs({});
    }
  }, [open, initialData, form]);

  const addRole = () => {
    const currentRoles = form.getValues('lookingFor');
    form.setValue('lookingFor', [...currentRoles, { role: '', skills: [] }]);
  };

  const removeRole = (index: number) => {
    const currentRoles = form.getValues('lookingFor');
    form.setValue(
      'lookingFor',
      currentRoles.filter((_, i) => i !== index)
    );
    const newSkillInputs = { ...skillInputs };
    delete newSkillInputs[index];
    setSkillInputs(newSkillInputs);
  };

  const addSkill = (roleIndex: number) => {
    const skillInput = skillInputs[roleIndex]?.trim();
    if (!skillInput) return;

    const currentRoles = form.getValues('lookingFor');
    const role = currentRoles[roleIndex];
    const updatedSkills = [...(role.skills || []), skillInput];

    const updatedRoles = [...currentRoles];
    updatedRoles[roleIndex] = { ...role, skills: updatedSkills };

    form.setValue('lookingFor', updatedRoles);
    setSkillInputs({ ...skillInputs, [roleIndex]: '' });
  };

  const removeSkill = (roleIndex: number, skillIndex: number) => {
    const currentRoles = form.getValues('lookingFor');
    const role = currentRoles[roleIndex];
    const updatedSkills = (role.skills || []).filter(
      (_, i) => i !== skillIndex
    );

    const updatedRoles = [...currentRoles];
    updatedRoles[roleIndex] = { ...role, skills: updatedSkills };

    form.setValue('lookingFor', updatedRoles);
  };

  const handleNext = async () => {
    let fieldsToValidate: (keyof TeamPostFormData)[] = [];
    if (step === 'IDENTITY') {
      fieldsToValidate = ['teamName', 'description'];
    } else if (step === 'ROLES') {
      fieldsToValidate = ['lookingFor'];
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      if (step === 'IDENTITY') setStep('ROLES');
      else if (step === 'ROLES') setStep('CONTACT');
    }
  };

  const handleBack = () => {
    if (step === 'ROLES') setStep('IDENTITY');
    else if (step === 'CONTACT') setStep('ROLES');
  };

  const onSubmit = async (data: TeamPostFormData) => {
    try {
      if (isEditMode && initialData) {
        await updatePost(initialData.id, {
          teamName: data.teamName,
          description: data.description,
          lookingFor: data.lookingFor,
          isOpen: data.lookingFor.length > 0,
          contactMethod: data.contactMethod,
          contactInfo: data.contactInfo,
        });
      } else {
        await createPost(data);
      }

      onOpenChange(false);
      form.reset();
      setStep('IDENTITY');
      onSuccess?.();
    } catch (err) {
      // useTeamPosts already toasts on every error path; we keep the form
      // open for retry without a duplicate toast.
      console.error('Failed to save team post:', err);
    }
  };

  const steps = [
    { id: 'IDENTITY', label: 'Team Details' },
    { id: 'ROLES', label: 'Roles' },
    { id: 'CONTACT', label: 'Contact' },
  ];

  return (
    <BoundlessSheet open={open} setOpen={onOpenChange}>
      <div className='flex h-full flex-col text-white'>
        {/* Header with Steps */}
        <div className='border-b border-white/5 p-8'>
          <div className='mb-8 flex items-center justify-between'>
            <div>
              <h2 className='text-2xl font-bold text-white'>
                {isEditMode ? 'Edit Team' : 'Create Team'}
              </h2>
              <p className='mt-1 text-sm text-gray-500'>
                {isEditMode
                  ? 'Update your team details'
                  : 'Form a team. Invite people you know, or open roles to recruit.'}
              </p>
            </div>
          </div>

          <div className='flex items-center gap-4'>
            {steps.map((s, idx) => (
              <React.Fragment key={s.id}>
                <div className='flex items-center gap-3'>
                  <div
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-all',
                      step === s.id
                        ? 'bg-primary text-black'
                        : steps.findIndex(x => x.id === step) > idx
                          ? 'bg-primary/20 text-primary'
                          : 'bg-white/5 text-gray-500'
                    )}
                  >
                    {idx + 1}
                  </div>
                  <span
                    className={cn(
                      'text-xs font-bold tracking-wider uppercase',
                      step === s.id ? 'text-white' : 'text-gray-600'
                    )}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className='h-px w-8 bg-white/5' />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className='flex-1 overflow-y-auto p-8'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
              {step === 'IDENTITY' && (
                <div className='animate-in fade-in slide-in-from-right-4 space-y-8 duration-300'>
                  <FormField
                    control={form.control}
                    name='teamName'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-xs font-bold tracking-[0.2em] text-gray-400 uppercase'>
                          Team Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='e.g., Astra Protocol'
                            className='focus:border-primary/20 h-12 border-white/5 bg-white/5 text-white placeholder:text-gray-600 focus:ring-0'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className='text-xs font-bold text-red-500/80' />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='description'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-xs font-bold tracking-[0.2em] text-gray-400 uppercase'>
                          Project Description
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder='What are you building? What is the vision?'
                            className='focus:border-primary/20 min-h-[160px] resize-none border-white/5 bg-white/5 text-white placeholder:text-gray-600 focus:ring-0'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className='text-xs font-bold text-red-500/80' />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {step === 'ROLES' && (
                <div className='animate-in fade-in slide-in-from-right-4 space-y-8 duration-300'>
                  <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <FormLabel className='text-xs font-bold tracking-[0.2em] text-gray-400 uppercase'>
                          Open Roles (Optional)
                        </FormLabel>
                        <p className='mt-1 text-xs text-gray-500'>
                          Want others to find and join you? Add up to {maxRoles}{' '}
                          open role{maxRoles === 1 ? '' : 's'} and your team
                          will be visible to potential teammates. Already have
                          your team? Skip this step. You can invite them
                          directly after creating. This hackathon caps teams at{' '}
                          {effectiveTeamMax} member
                          {effectiveTeamMax === 1 ? '' : 's'} including you.
                        </p>
                      </div>
                      <BoundlessButton
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={addRole}
                        disabled={lookingFor.length >= maxRoles}
                        className='hover:bg-primary h-8 rounded-lg border-white/5 bg-white/5 px-3 text-[10px] font-bold text-white hover:text-black disabled:cursor-not-allowed disabled:opacity-40'
                      >
                        <Plus className='h-3.1 w-3.1 mr-2' />
                        Add Role
                      </BoundlessButton>
                    </div>

                    {lookingFor.length === 0 && (
                      <div className='rounded-2xl border border-dashed border-white/10 bg-white/2 p-8 text-center text-sm text-gray-500'>
                        No open roles. Your team will be created as{' '}
                        <span className='font-bold text-white'>private</span>{' '}
                        and won't be listed for joiners. Click{' '}
                        <span className='font-bold text-white'>Add Role</span>{' '}
                        if you'd like to recruit teammates instead.
                      </div>
                    )}

                    <div className='grid gap-4'>
                      {lookingFor.map((role, roleIndex) => (
                        <div
                          key={roleIndex}
                          className='relative rounded-2xl border border-white/5 bg-white/2 p-6 transition-all hover:bg-white/4'
                        >
                          {lookingFor.length > 0 && (
                            <button
                              type='button'
                              onClick={() => removeRole(roleIndex)}
                              className='absolute top-4 right-4 text-gray-600 hover:text-red-400'
                            >
                              <Trash2 className='h-4 w-4' />
                            </button>
                          )}

                          <FormField
                            control={form.control}
                            name={`lookingFor.${roleIndex}.role`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className='text-[10px] font-black tracking-widest text-gray-500 uppercase'>
                                  Role Title
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder='e.g., Rust Developer, UI Designer'
                                    className='h-10 border-white/5 bg-transparent p-0 text-sm font-bold text-white placeholder:text-gray-700 focus:border-transparent focus:ring-0'
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className='mt-4'>
                            <div className='flex flex-wrap gap-2'>
                              {role.skills?.map((skill, skillIndex) => (
                                <Badge
                                  key={skillIndex}
                                  className='bg-primary/10 text-primary flex items-center gap-1.5 border-none px-2 py-1 text-[10px] font-bold'
                                >
                                  {skill}
                                  <button
                                    type='button'
                                    onClick={() =>
                                      removeSkill(roleIndex, skillIndex)
                                    }
                                    className='hover:text-red-400'
                                  >
                                    <X className='h-3 w-3' />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                            <div className='mt-3 flex gap-2'>
                              <Input
                                placeholder='Add required skill...'
                                value={skillInputs[roleIndex] || ''}
                                onChange={e =>
                                  setSkillInputs({
                                    ...skillInputs,
                                    [roleIndex]: e.target.value,
                                  })
                                }
                                onKeyDown={e => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addSkill(roleIndex);
                                  }
                                }}
                                className='h-9 border-white/5 bg-white/5 text-xs text-white placeholder:text-gray-600'
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 'CONTACT' && (
                <div className='animate-in fade-in slide-in-from-right-4 space-y-8 duration-300'>
                  <FormField
                    control={form.control}
                    name='contactMethod'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-xs font-bold tracking-[0.2em] text-gray-400 uppercase'>
                          Preferred Contact Method
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className='focus:border-primary/20 h-12 border-white/5 bg-white/5 text-white'>
                              <SelectValue placeholder='Select method' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className='z-70 border-white/10 bg-[#0D0E10] text-white'>
                            <SelectItem value='email'>Email</SelectItem>
                            <SelectItem value='telegram'>Telegram</SelectItem>
                            <SelectItem value='discord'>Discord</SelectItem>
                            <SelectItem value='github'>GitHub</SelectItem>
                            <SelectItem value='other'>Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='contactInfo'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-xs font-bold tracking-[0.2em] text-gray-400 uppercase'>
                          Contact Information
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={
                              contactMethod === 'email'
                                ? 'your.email@example.com'
                                : contactMethod === 'telegram'
                                  ? '@username or link'
                                  : 'Enter your contact info'
                            }
                            className='focus:border-primary/20 h-12 border-white/5 bg-white/5 text-white placeholder:text-gray-600'
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className='text-[10px] text-gray-500'>
                          This will only be shown to approved applicants.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Navigation Buttons */}
              <div className='flex items-center justify-between border-t border-white/5 pt-8'>
                {step !== 'IDENTITY' ? (
                  <BoundlessButton
                    type='button'
                    variant='outline'
                    onClick={handleBack}
                    className='h-11 rounded-xl border-white/5 bg-white/5 px-6 font-bold text-white'
                  >
                    Back
                  </BoundlessButton>
                ) : (
                  <div />
                )}

                {step !== 'CONTACT' ? (
                  <BoundlessButton
                    type='button'
                    onClick={handleNext}
                    className='hover:bg-primary h-11 rounded-xl bg-white px-8 font-bold text-black'
                  >
                    Continue
                  </BoundlessButton>
                ) : (
                  <BoundlessButton
                    type='submit'
                    disabled={isCreating || isUpdating}
                    className='bg-primary h-11 rounded-xl px-10 font-black text-black'
                  >
                    {isCreating || isUpdating ? (
                      <Loader2 className='h-4 w-4 animate-spin' />
                    ) : isEditMode ? (
                      'Update Team'
                    ) : (
                      'Create Team'
                    )}
                  </BoundlessButton>
                )}
              </div>
            </form>
          </Form>
        </div>
      </div>
    </BoundlessSheet>
  );
}
