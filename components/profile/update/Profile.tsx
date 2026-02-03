'use client';
import { BoundlessButton } from '@/components/buttons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { updateUserAvatar, updateUserProfile } from '@/lib/api/auth';
import { cn } from '@/lib/utils';
import {
  AlertCircle,
  Camera,
  Github,
  Globe,
  Loader2,
  Upload,
  User as UserIcon,
} from 'lucide-react';
import Image from 'next/image';
import React, { useRef, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { User } from '@/types/user';
import { authClient } from '@/lib/auth-client';
import { z } from 'zod';
import { Card } from '@/components/ui/card';
import { useDebounce } from '@/hooks/use-debounce';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

// Zod validation schemas
const basicInfoSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Username can only contain letters, numbers, and underscores'
    ),
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(50, 'Name must be less than 50 characters'),
});

const profileSchema = z.object({
  // Basic profile fields
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  location: z
    .string()
    .max(50, 'Location must be less than 50 characters')
    .optional(),
  company: z
    .string()
    .max(100, 'Company must be less than 100 characters')
    .optional(),
  skills: z
    .array(z.string().max(50, 'Each skill must be less than 50 characters'))
    .max(20, 'Maximum 20 skills allowed'),

  // Social links
  socialLinks: z.object({
    github: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
    twitter: z.string().url('Invalid Twitter URL').optional().or(z.literal('')),
    linkedin: z
      .string()
      .url('Invalid LinkedIn URL')
      .optional()
      .or(z.literal('')),
    discord: z.string().url('Invalid Discord URL').optional().or(z.literal('')),
  }),
});

type BasicInfoFormData = z.infer<typeof basicInfoSchema>;
type ProfileFormData = z.infer<typeof profileSchema>;
interface ProfileDataProps {
  user: User;
}

function Profile({ user }: ProfileDataProps) {
  const avatarRef = useRef<HTMLInputElement>(null);
  const [uploadPreview, setUploadPreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<
    boolean | null
  >(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSavingBasic, setIsSavingBasic] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Basic Info Form
  const basicInfoForm = useForm<BasicInfoFormData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      username: user.username,
      name: user.name,
    },
  });

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      bio: user.profile?.bio || '',
      website: user.profile?.website || '',
      location: user.profile?.location || '',
      company: user.profile?.company || '',
      skills: user.profile?.skills || [],
      socialLinks: {
        github: user.profile?.socialLinks?.github || '',
        twitter: user.profile?.socialLinks?.twitter || '',
        linkedin: user.profile?.socialLinks?.linkedin || '',
        discord: user.profile?.socialLinks?.discord || '',
      },
    },
  });

  const debouncedUsername = useDebounce(basicInfoForm.watch('username'), 500);
  useEffect(() => {
    const checkUsername = async () => {
      if (
        !debouncedUsername ||
        debouncedUsername.length < 3 ||
        debouncedUsername === user.username
      ) {
        setIsUsernameAvailable(null);
        return;
      }

      const usernameValidation =
        basicInfoSchema.shape.username.safeParse(debouncedUsername);
      if (!usernameValidation.success) {
        basicInfoForm.setError('username', {
          message: usernameValidation.error.message,
        });
        setIsUsernameAvailable(null);
        return;
      }

      // Clear any existing username errors
      basicInfoForm.clearErrors('username');

      setIsCheckingUsername(true);
      try {
        const { data: response } = await authClient.isUsernameAvailable({
          username: debouncedUsername,
        });
        setIsUsernameAvailable(response?.available ?? false);
      } catch {
        basicInfoForm.setError('username', {
          message: 'Failed to check username availability',
        });
        setIsUsernameAvailable(null);
      } finally {
        setIsCheckingUsername(false);
      }
    };
    checkUsername();
  }, [debouncedUsername, user.username, basicInfoForm]);

  // Submit handlers
  const onBasicInfoSubmit = async (data: BasicInfoFormData) => {
    if (data.username !== user.username && !isUsernameAvailable) {
      basicInfoForm.setError('username', {
        message: 'Please choose an available username',
      });
      return;
    }

    setIsSavingBasic(true);
    try {
      if (data.username !== user.username) {
        await authClient.updateUser({
          username: data.username,
          name: data.name,
        });
      } else if (data.name !== user.name) {
        await authClient.updateUser({ name: data.name });
      }
      toast.success('Basic information updated successfully');
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to update basic information';
      toast.error(errorMessage);
    } finally {
      setIsSavingBasic(false);
    }
  };

  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsSavingProfile(true);
    try {
      // Filter out empty social links
      const socialLinks: Record<string, string> = {};
      Object.entries(data.socialLinks || {}).forEach(([platform, url]) => {
        if (url && url.trim()) {
          socialLinks[platform] = url.trim();
        }
      });

      const updateData = {
        bio: data.bio || undefined,
        website: data.website || undefined,
        location: data.location || undefined,
        company: data.company || undefined,
        skills: data.skills.length > 0 ? data.skills : undefined,
        socialLinks:
          Object.keys(socialLinks).length > 0 ? socialLinks : undefined,
      };

      await updateUserProfile(updateData);
      toast.success('Profile updated successfully');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update profile';
      toast.error(errorMessage);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleAvatarUpload(file);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
      toast.error('Please upload a JPEG or PNG image');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = e => setUploadPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    setIsUploading(true);

    try {
      const result = await updateUserAvatar(file);
      if (result.success) {
        setUploadPreview(result.avatarUrl);
        toast.success('Avatar uploaded successfully');
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to upload avatar';
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const addSkill = (skill: string) => {
    const currentSkills = profileForm.getValues('skills') || [];
    if (
      skill.trim() &&
      !currentSkills.includes(skill.trim()) &&
      currentSkills.length < 20
    ) {
      profileForm.setValue('skills', [...currentSkills, skill.trim()]);
    }
  };

  const removeSkill = (indexToRemove: number) => {
    const currentSkills = profileForm.getValues('skills') || [];
    const newSkills = currentSkills.filter(
      (_, index) => index !== indexToRemove
    );
    profileForm.setValue('skills', newSkills);
  };

  return (
    <div className='flex flex-col gap-4'>
      {/* Avatar Upload */}
      <Card className='space-y-8 rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 md:p-8'>
        <div className='flex items-center gap-4'>
          <div className='relative'>
            <input
              ref={avatarRef}
              type='file'
              accept='image/jpeg,image/jpg,image/png'
              className='hidden'
              onChange={handleAvatarChange}
            />
            <div
              className={cn(
                'group relative h-25 max-h-25 w-25 max-w-25 cursor-pointer overflow-hidden rounded-full border-2 border-zinc-800 transition-all hover:border-zinc-700'
              )}
            >
              {isUploading ? (
                <Skeleton className='h-25 w-25 rounded-full' />
              ) : uploadPreview ? (
                <Image
                  src={uploadPreview}
                  alt='Avatar'
                  fill
                  className='object-cover'
                />
              ) : (
                <Image
                  src={user.image || '/avatar.png'}
                  alt='Avatar'
                  fill
                  className='object-cover'
                />
              )}
              <div
                onClick={() => avatarRef.current?.click()}
                className='absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100'
              >
                <div className='flex flex-col items-center gap-2'>
                  <Camera className='h-6 w-6 text-white' />
                  <span className='text-xs text-white'>Change Avatar</span>
                </div>
              </div>
            </div>
          </div>
          <div className='text-center'>
            <BoundlessButton
              icon={<Upload className='h-4 w-4' />}
              variant='outline'
              size='sm'
              onClick={() => avatarRef.current?.click()}
            >
              Upload Photo
            </BoundlessButton>
            <p className='mt-2 text-xs text-zinc-500'>JPEG or PNG, max 2MB</p>
          </div>
        </div>

        {/* Basic Information Form */}
        <Form {...basicInfoForm}>
          <form
            onSubmit={basicInfoForm.handleSubmit(onBasicInfoSubmit)}
            className='space-y-6'
          >
            <div>
              <h3 className='mb-4 text-sm font-medium text-white'>
                Basic Information
              </h3>

              <div className='grid gap-4 md:grid-cols-2'>
                <FormField
                  control={basicInfoForm.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-zinc-400'>Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter your full name'
                          className='h-11 border-zinc-800 bg-zinc-900/50 text-white placeholder:text-zinc-600'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={basicInfoForm.control}
                  name='username'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-zinc-400'>Username</FormLabel>
                      <FormControl>
                        <div className='relative'>
                          <UserIcon className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-500' />
                          <Input
                            placeholder='Enter username'
                            className={cn(
                              'h-11 border-zinc-800 bg-zinc-900/50 pl-10 text-white placeholder:text-zinc-600',
                              isUsernameAvailable === false && 'border-red-500',
                              isUsernameAvailable === true && 'border-green-500'
                            )}
                            {...field}
                          />
                          {isCheckingUsername && (
                            <Loader2 className='absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin text-zinc-500' />
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                      {!basicInfoForm.formState.errors.username &&
                        field.value !== user.username &&
                        isUsernameAvailable === true && (
                          <p className='flex items-center gap-1 text-xs text-green-500'>
                            ✓ Username is available
                          </p>
                        )}
                      {!basicInfoForm.formState.errors.username &&
                        field.value !== user.username &&
                        isUsernameAvailable === false && (
                          <p className='flex items-center gap-1 text-xs text-red-500'>
                            <AlertCircle className='h-3 w-3' />
                            Username is not available
                          </p>
                        )}
                    </FormItem>
                  )}
                />
              </div>

              {/* Email (read-only) */}
              <div className='mt-4 space-y-2'>
                <Label className='text-sm font-medium text-zinc-400'>
                  Email
                </Label>
                <Input
                  disabled
                  value={user.email}
                  className='h-11 cursor-not-allowed border-zinc-800 bg-zinc-900/50 text-zinc-500 opacity-70'
                />
                <p className='text-xs text-zinc-500'>Email cannot be changed</p>
              </div>
            </div>

            <div className='flex justify-end gap-3'>
              <Button
                type='submit'
                disabled={isSavingBasic || isCheckingUsername}
                className='min-w-32'
              >
                {isSavingBasic ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </Card>
      {/* Profile Information Form */}
      <Card className='space-y-8 rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 md:p-8'>
        <Form {...profileForm}>
          <form
            onSubmit={profileForm.handleSubmit(onProfileSubmit)}
            className='space-y-6'
          >
            <div className='grid gap-4 md:grid-cols-2'>
              <FormField
                control={profileForm.control}
                name='location'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-zinc-400'>Location</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='City, State, Country'
                        maxLength={50}
                        className='h-11 border-zinc-800 bg-zinc-900/50 text-white placeholder:text-zinc-600'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={profileForm.control}
                name='company'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-zinc-400'>Company</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Company or organization'
                        maxLength={100}
                        className='h-11 border-zinc-800 bg-zinc-900/50 text-white placeholder:text-zinc-600'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/* Bio Section */}
            <FormField
              control={profileForm.control}
              name='bio'
              render={({ field }) => (
                <FormItem>
                  <div className='flex items-center justify-between'>
                    <FormLabel className='text-zinc-400'>Bio</FormLabel>
                    <span className='text-xs text-zinc-500'>
                      {field.value?.length || 0}/500
                    </span>
                  </div>
                  <FormControl>
                    <Textarea
                      placeholder='Tell us about yourself...'
                      className='min-h-24 resize-none border-zinc-800 bg-zinc-900/50 text-white placeholder:text-zinc-600'
                      maxLength={500}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='h-px bg-zinc-800' />

            {/* Skills Section */}
            <FormField
              control={profileForm.control}
              name='skills'
              render={({ field }) => (
                <FormItem>
                  <div className='flex items-center justify-between'>
                    <FormLabel className='text-zinc-400'>Skills</FormLabel>
                    <span className='text-xs text-zinc-500'>
                      {field.value?.length || 0}/20
                    </span>
                  </div>
                  <div className='flex flex-wrap gap-2'>
                    {field.value?.map((skill: string, index: number) => (
                      <div
                        key={index}
                        className='flex items-center gap-1 rounded-md bg-zinc-800 px-2 py-1 text-xs text-white'
                      >
                        {skill}
                        <button
                          type='button'
                          onClick={() => removeSkill(index)}
                          className='ml-1 text-zinc-400 hover:text-red-400'
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {(field.value?.length || 0) < 20 && (
                      <Input
                        placeholder='Add a skill...'
                        className='h-8 w-32 border-zinc-800 bg-zinc-900/50 text-white placeholder:text-zinc-600'
                        onKeyDown={e => {
                          if (
                            e.key === 'Enter' &&
                            e.currentTarget.value.trim()
                          ) {
                            e.preventDefault();
                            addSkill(e.currentTarget.value.trim());
                            e.currentTarget.value = '';
                          }
                        }}
                        maxLength={50}
                      />
                    )}
                  </div>
                  <FormMessage />
                  <p className='text-xs text-zinc-500'>
                    Add up to 20 skills (press Enter to add)
                  </p>
                </FormItem>
              )}
            />

            <div className='h-px bg-zinc-800' />

            {/* Website */}
            <FormField
              control={profileForm.control}
              name='website'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-zinc-400'>Website</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <Globe className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-500' />
                      <Input
                        placeholder='https://yourwebsite.com'
                        className='h-11 border-zinc-800 bg-zinc-900/50 pl-10 text-white placeholder:text-zinc-600'
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='h-px bg-zinc-800' />

            {/* Social Links */}
            <div className='space-y-4'>
              <h3 className='text-sm font-medium text-white'>Social Links</h3>

              <FormField
                control={profileForm.control}
                name='socialLinks.github'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-zinc-400'>GitHub</FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <Github className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-500' />
                        <Input
                          placeholder='https://github.com/username'
                          className='h-11 border-zinc-800 bg-zinc-900/50 pl-10 text-white placeholder:text-zinc-600'
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={profileForm.control}
                name='socialLinks.twitter'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-zinc-400'>Twitter/X</FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <svg
                          className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-500'
                          viewBox='0 0 24 24'
                          fill='currentColor'
                        >
                          <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
                        </svg>
                        <Input
                          placeholder='https://x.com/username'
                          className='h-11 border-zinc-800 bg-zinc-900/50 pl-10 text-white placeholder:text-zinc-600'
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={profileForm.control}
                name='socialLinks.linkedin'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-zinc-400'>LinkedIn</FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <svg
                          className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-500'
                          viewBox='0 0 24 24'
                          fill='currentColor'
                        >
                          <path d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' />
                        </svg>
                        <Input
                          placeholder='https://linkedin.com/in/username'
                          className='h-11 border-zinc-800 bg-zinc-900/50 pl-10 text-white placeholder:text-zinc-600'
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={profileForm.control}
                name='socialLinks.discord'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-zinc-400'>Discord</FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <svg
                          className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-500'
                          viewBox='0 0 24 24'
                          fill='currentColor'
                        >
                          <path d='M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.120.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 1-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.210 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.210 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z' />
                        </svg>
                        <Input
                          placeholder='https://discord.gg/invite'
                          className='h-11 border-zinc-800 bg-zinc-900/50 pl-10 text-white placeholder:text-zinc-600'
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='h-px bg-zinc-800' />

            <div className='flex justify-end gap-3'>
              <Button
                type='submit'
                disabled={isSavingProfile}
                className='min-w-32'
              >
                {isSavingProfile ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
}

export default Profile;
