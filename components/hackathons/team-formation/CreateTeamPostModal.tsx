'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
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
import { useTeamPosts } from '@/hooks/hackathon/use-team-posts';
import { toast } from 'sonner';
import { Loader2, Plus, X, Trash2 } from 'lucide-react';
import { type TeamRecruitmentPost } from '@/lib/api/hackathons';

const roleSchema = z.object({
  role: z.string().min(1, 'Role name is required'),
  skills: z.array(z.string()).optional(),
});

const teamPostSchema = z
  .object({
    projectName: z
      .string()
      .min(3, 'Project name must be at least 3 characters'),
    projectDescription: z
      .string()
      .min(50, 'Description must be at least 50 characters'),
    lookingFor: z
      .array(roleSchema)
      .min(1, 'At least one role is required')
      .max(10, 'Maximum 10 roles allowed'),
    currentTeamSize: z
      .number()
      .min(1, 'Current team size must be at least 1')
      .max(50, 'Current team size cannot exceed 50'),
    maxTeamSize: z
      .number()
      .min(2, 'Max team size must be at least 2')
      .max(50, 'Max team size cannot exceed 50'),
    contactMethod: z.enum(['email', 'telegram', 'discord', 'github', 'other']),
    contactInfo: z.string().min(1, 'Contact info is required'),
  })
  .refine(data => data.maxTeamSize > data.currentTeamSize, {
    message: 'Max team size must be greater than current team size',
    path: ['maxTeamSize'],
  });

type TeamPostFormData = z.infer<typeof teamPostSchema>;

interface CreateTeamPostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hackathonSlugOrId: string;
  organizationId?: string;
  initialData?: TeamRecruitmentPost;
  onSuccess?: () => void;
}

export function CreateTeamPostModal({
  open,
  onOpenChange,
  hackathonSlugOrId,
  organizationId,
  initialData,
  onSuccess,
}: CreateTeamPostModalProps) {
  const { createPost, updatePost, isCreating, isUpdating } = useTeamPosts({
    hackathonSlugOrId,
    organizationId,
    autoFetch: false,
  });

  const [skillInputs, setSkillInputs] = useState<Record<number, string>>({});

  const isEditMode = !!initialData;

  const form = useForm<TeamPostFormData>({
    resolver: zodResolver(teamPostSchema),
    defaultValues: {
      projectName: initialData?.projectName || '',
      projectDescription: initialData?.projectDescription || '',
      lookingFor: initialData?.lookingFor || [{ role: '', skills: [] }],
      currentTeamSize: initialData?.currentTeamSize || 1,
      maxTeamSize: initialData?.maxTeamSize || 2,
      contactMethod: initialData?.contactMethod || 'email',
      contactInfo: initialData?.contactInfo || '',
    },
  });

  const lookingFor = form.watch('lookingFor');
  const contactMethod = form.watch('contactMethod');

  useEffect(() => {
    if (open && initialData) {
      form.reset({
        projectName: initialData.projectName,
        projectDescription: initialData.projectDescription,
        lookingFor: initialData.lookingFor,
        currentTeamSize: initialData.currentTeamSize,
        maxTeamSize: initialData.maxTeamSize,
        contactMethod: initialData.contactMethod,
        contactInfo: initialData.contactInfo,
      });
    } else if (!open) {
      form.reset();
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
    // Clean up skill input for removed role
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

  const validateContactInfo = (method: string, info: string): boolean => {
    if (!info.trim()) return false;

    switch (method) {
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info);
      case 'telegram':
        // Accept @username or full URL
        return /^@?[a-zA-Z0-9_]+$/.test(info) || info.startsWith('http');
      case 'discord':
        // Accept username or invite link
        return info.length > 0;
      case 'github':
        // Accept username or full URL
        return (
          /^[a-zA-Z0-9]([a-zA-Z0-9]|-(?![.-])){0,38}$/.test(info) ||
          info.startsWith('http')
        );
      default:
        return info.length > 0;
    }
  };

  const onSubmit = async (data: TeamPostFormData) => {
    try {
      if (!validateContactInfo(data.contactMethod, data.contactInfo)) {
        toast.error('Invalid contact information for selected method');
        form.setError('contactInfo', {
          type: 'manual',
          message: 'Invalid contact information',
        });
        return;
      }

      if (isEditMode && initialData) {
        await updatePost(initialData._id, data);
        toast.success('Team post updated successfully');
      } else {
        await createPost(data);
        toast.success('Team post created successfully');
      }

      onOpenChange(false);
      form.reset();
      setSkillInputs({});
      onSuccess?.();
    } catch {
      // Error is already handled in the hook
    }
  };

  return (
    <BoundlessSheet open={open} setOpen={onOpenChange}>
      <div className='flex h-full flex-col bg-[#030303] text-white'>
        <div className='border-b border-gray-800 p-6'>
          <h2 className='text-2xl font-bold'>
            {isEditMode ? 'Edit Team Post' : 'Create Team Post'}
          </h2>
          <p className='mt-1 text-sm text-gray-400'>
            {isEditMode
              ? 'Update your team recruitment post'
              : 'Advertise your project and find team members'}
          </p>
        </div>

        <div className='flex-1 overflow-y-auto p-6'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              {/* Project Name */}
              <FormField
                control={form.control}
                name='projectName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='My Awesome Project'
                        className='border-gray-700 bg-gray-800/50 text-white placeholder:text-gray-500'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Project Description */}
              <FormField
                control={form.control}
                name='projectDescription'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your project and what you're building..."
                        className='resize-y border-gray-700 bg-gray-800/50 text-white placeholder:text-gray-500'
                        rows={5}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className='text-gray-400'>
                      Minimum 50 characters. Describe your project idea and
                      goals.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Roles Needed */}
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <FormLabel>Roles Needed</FormLabel>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={addRole}
                    className='border-gray-700 text-white hover:bg-gray-800'
                  >
                    <Plus className='mr-2 h-4 w-4' />
                    Add Role
                  </Button>
                </div>

                {lookingFor.map((role, roleIndex) => (
                  <div
                    key={roleIndex}
                    className='rounded-lg border border-gray-700 bg-gray-800/50 p-4'
                  >
                    <div className='mb-3 flex items-center justify-between'>
                      <span className='text-sm font-medium text-gray-300'>
                        Role {roleIndex + 1}
                      </span>
                      {lookingFor.length > 1 && (
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          onClick={() => removeRole(roleIndex)}
                          className='text-red-400 hover:bg-red-500/20'
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      )}
                    </div>

                    <FormField
                      control={form.control}
                      name={`lookingFor.${roleIndex}.role`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='text-white'>
                            Role Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder='e.g., Frontend Developer, Designer, Backend Engineer'
                              className='border-gray-700 bg-gray-900/50 text-white placeholder:text-gray-500'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Skills for this role */}
                    <div className='mt-3'>
                      <FormLabel className='text-sm text-gray-300'>
                        Skills (Optional)
                      </FormLabel>
                      <div className='mt-2 flex flex-wrap gap-2'>
                        {role.skills?.map((skill, skillIndex) => (
                          <Badge
                            key={skillIndex}
                            className='flex items-center gap-1 bg-gray-700 text-white'
                          >
                            {skill}
                            <button
                              type='button'
                              onClick={() => removeSkill(roleIndex, skillIndex)}
                              className='ml-1 hover:text-red-400'
                            >
                              <X className='h-3 w-3' />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className='mt-2 flex gap-2'>
                        <Input
                          placeholder='Add a skill (e.g., React, Python)'
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
                          className='border-gray-700 bg-gray-900/50 text-white placeholder:text-gray-500'
                        />
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          onClick={() => addSkill(roleIndex)}
                          className='border-gray-700 text-white hover:bg-gray-800'
                        >
                          <Plus className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Team Size */}
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='currentTeamSize'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Team Size</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          min={1}
                          max={50}
                          className='border-gray-700 bg-gray-800/50 text-white'
                          {...field}
                          onChange={e =>
                            field.onChange(parseInt(e.target.value) || 1)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='maxTeamSize'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Team Size</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          min={2}
                          max={50}
                          className='border-gray-700 bg-gray-800/50 text-white'
                          {...field}
                          onChange={e =>
                            field.onChange(parseInt(e.target.value) || 2)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Contact Method */}
              <FormField
                control={form.control}
                name='contactMethod'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Method</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className='border-gray-700 bg-gray-800/50 text-white'>
                          <SelectValue placeholder='Select contact method' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className='border-gray-700 bg-gray-900 text-white'>
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

              {/* Contact Info */}
              <FormField
                control={form.control}
                name='contactInfo'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Contact Info{' '}
                      {contactMethod === 'email' && '(email address)'}
                      {contactMethod === 'telegram' && '(@username or link)'}
                      {contactMethod === 'discord' &&
                        '(username or invite link)'}
                      {contactMethod === 'github' &&
                        '(@username or profile URL)'}
                      {contactMethod === 'other' && '(contact information)'}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={
                          contactMethod === 'email'
                            ? 'your.email@example.com'
                            : contactMethod === 'telegram'
                              ? '@username or https://t.me/username'
                              : contactMethod === 'discord'
                                ? 'username#1234 or invite link'
                                : contactMethod === 'github'
                                  ? '@username or https://github.com/username'
                                  : 'Your contact information'
                        }
                        className='border-gray-700 bg-gray-800/50 text-white placeholder:text-gray-500'
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className='text-gray-400'>
                      {contactMethod === 'email' && 'Enter your email address'}
                      {contactMethod === 'telegram' &&
                        'Enter your Telegram username (with or without @) or full link'}
                      {contactMethod === 'discord' &&
                        'Enter your Discord username or server invite link'}
                      {contactMethod === 'github' &&
                        'Enter your GitHub username (with or without @) or profile URL'}
                      {contactMethod === 'other' &&
                        'Enter your preferred contact information'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Buttons */}
              <div className='flex justify-end gap-3 pt-4'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => onOpenChange(false)}
                  className='border-gray-700 text-white hover:bg-gray-800'
                >
                  Cancel
                </Button>
                <Button
                  type='submit'
                  disabled={isCreating || isUpdating}
                  className='bg-[#a7f950] text-black hover:bg-[#8fd93f]'
                >
                  {isCreating || isUpdating ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      {isEditMode ? 'Updating...' : 'Creating...'}
                    </>
                  ) : isEditMode ? (
                    'Update Post'
                  ) : (
                    'Create Post'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </BoundlessSheet>
  );
}
