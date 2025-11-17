'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Upload,
  Loader2,
  Globe,
  Github,
  Link as LinkIcon,
  Camera,
  CheckCircle2,
  AlertCircle,
  User,
  Bell,
  Shield,
  Lock,
} from 'lucide-react';
import { GetMeResponse } from '@/lib/api/types';
import {
  updateUserProfile,
  updateUserSettings,
  updateUserSecurity,
  updateUserAvatar,
  UserSettings,
} from '@/lib/api/auth';

interface ProfileUpdateScreenProps {
  user: GetMeResponse;
  initialSettings?: UserSettings;
}

export default function ProfileUpdateScreen({
  user,
  initialSettings,
}: ProfileUpdateScreenProps) {
  const router = useRouter();

  // Extract social links from user data
  const socialLinks =
    (user as unknown as { socialLinks?: Record<string, string> }).socialLinks ||
    {};
  const bio = (user as unknown as { bio?: string }).bio || '';

  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: user.profile?.firstName || '',
    lastName: user.profile?.lastName || '',
    username: user.profile?.username || '',
    email: user.email || '',
    bio: bio,
    avatar: user.profile?.avatar || '/avatar.png',
    website: socialLinks.website || '',
    twitter: socialLinks.twitter || socialLinks.x || '',
    github: socialLinks.github || '',
    other: socialLinks.other || socialLinks.others || '',
  });

  // Settings form state
  const [settingsData, setSettingsData] = useState<UserSettings>({
    notifications: {
      email: initialSettings?.notifications?.email ?? true,
      push: initialSettings?.notifications?.push ?? true,
      inApp: initialSettings?.notifications?.inApp ?? true,
    },
    privacy: {
      profileVisibility:
        initialSettings?.privacy?.profileVisibility ?? 'PUBLIC',
      showWalletAddress: initialSettings?.privacy?.showWalletAddress ?? false,
      showContributions: initialSettings?.privacy?.showContributions ?? true,
    },
    preferences: {
      language: initialSettings?.preferences?.language ?? 'en',
      timezone: initialSettings?.preferences?.timezone ?? 'UTC',
      theme: initialSettings?.preferences?.theme ?? 'LIGHT',
    },
  });

  // Security form state
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
    twoFactorCode: '',
  });

  // UI state
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);
  const [hasProfileChanges, setHasProfileChanges] = useState(false);
  const [hasSettingsChanges, setHasSettingsChanges] = useState(false);
  const [hasSecurityChanges, setHasSecurityChanges] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadPreview, setUploadPreview] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Track initial form data to detect changes
  const initialProfileData = useRef(profileData);
  const initialSettingsData = useRef(settingsData);

  useEffect(() => {
    const hasProfileFormChanges =
      JSON.stringify(profileData) !==
      JSON.stringify(initialProfileData.current);
    setHasProfileChanges(hasProfileFormChanges);
  }, [profileData]);

  useEffect(() => {
    const hasSettingsFormChanges =
      JSON.stringify(settingsData) !==
      JSON.stringify(initialSettingsData.current);
    setHasSettingsChanges(hasSettingsFormChanges);
  }, [settingsData]);

  useEffect(() => {
    const hasSecurityFormChanges =
      securityData.currentPassword !== '' ||
      securityData.newPassword !== '' ||
      securityData.confirmPassword !== '' ||
      securityData.twoFactorEnabled !== false ||
      securityData.twoFactorCode !== '';
    setHasSecurityChanges(hasSecurityFormChanges);
  }, [securityData]);

  const handleProfileInputChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSettingsChange = (
    section: 'notifications' | 'privacy' | 'preferences',
    field: string,
    value: unknown
  ) => {
    setSettingsData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSecurityChange = (field: string, value: string | boolean) => {
    setSecurityData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateProfileForm = () => {
    const newErrors: Record<string, string> = {};

    if (!profileData.firstName.trim())
      newErrors.firstName = 'First name is required';
    if (!profileData.lastName.trim())
      newErrors.lastName = 'Last name is required';
    if (!profileData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (!/^[a-zA-Z0-9_-]{3,20}$/.test(profileData.username)) {
      newErrors.username =
        'Username must be 3-20 characters (letters, numbers, _, -)';
    }

    if (profileData.bio.length > 500) {
      newErrors.bio = 'Bio must be 500 characters or less';
    }

    // Validate URLs if provided
    if (profileData.website && !/^https?:\/\/.+/.test(profileData.website)) {
      newErrors.website =
        'Please enter a valid URL (starting with http:// or https://)';
    }
    if (profileData.twitter && !/^https?:\/\/.+/.test(profileData.twitter)) {
      newErrors.twitter =
        'Please enter a valid URL (starting with http:// or https://)';
    }
    if (profileData.github && !/^https?:\/\/.+/.test(profileData.github)) {
      newErrors.github =
        'Please enter a valid URL (starting with http:// or https://)';
    }
    if (profileData.other && !/^https?:\/\/.+/.test(profileData.other)) {
      newErrors.other =
        'Please enter a valid URL (starting with http:// or https://)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSecurityForm = () => {
    const newErrors: Record<string, string> = {};

    if (securityData.newPassword || securityData.currentPassword) {
      if (!securityData.currentPassword) {
        newErrors.currentPassword = 'Current password is required';
      }
      if (!securityData.newPassword) {
        newErrors.newPassword = 'New password is required';
      } else if (securityData.newPassword.length < 8) {
        newErrors.newPassword = 'Password must be at least 8 characters';
      }
      if (securityData.newPassword !== securityData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (securityData.twoFactorEnabled && !securityData.twoFactorCode) {
      newErrors.twoFactorCode = '2FA code is required when enabling 2FA';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAvatarUpload = async (file: File) => {
    if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
      setErrors(prev => ({
        ...prev,
        avatar: 'Please upload a JPEG or PNG image',
      }));
      toast.error('Please upload a JPEG or PNG image');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrors(prev => ({
        ...prev,
        avatar: 'File size must be less than 2MB',
      }));
      toast.error('File size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = e => setUploadPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    setIsUploading(true);
    try {
      const result = await updateUserAvatar(file);

      if (result.success && result.data?.profile?.avatar) {
        const newAvatar = result.data.profile.avatar;
        setProfileData(prev => ({
          ...prev,
          avatar: newAvatar || prev.avatar,
        }));
        setErrors(prev => ({ ...prev, avatar: '' }));
        setHasProfileChanges(true);
        toast.success('Avatar uploaded successfully');
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to upload avatar';
      setErrors(prev => ({ ...prev, avatar: errorMessage }));
      toast.error(`Failed to upload avatar: ${errorMessage}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) handleAvatarUpload(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    const file = event.dataTransfer.files[0];
    if (file) handleAvatarUpload(file);
  };

  const handleSaveProfile = async () => {
    if (!validateProfileForm()) {
      toast.error('Please fix the errors before saving');
      return;
    }

    setIsSavingProfile(true);
    try {
      // Build social links object (excluding website as it's sent separately)
      const socialLinks: Record<string, string> = {};
      if (profileData.twitter) socialLinks.twitter = profileData.twitter;
      if (profileData.github) socialLinks.github = profileData.github;
      if (profileData.other) socialLinks.other = profileData.other;

      const updateData = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        username: profileData.username,
        avatar: profileData.avatar,
        bio: profileData.bio,
        website: profileData.website || undefined,
        socialLinks:
          Object.keys(socialLinks).length > 0 ? socialLinks : undefined,
      };

      const result = await updateUserProfile(updateData);

      if (result.success) {
        toast.success('Profile updated successfully');
        setHasProfileChanges(false);
        initialProfileData.current = profileData;

        // Refresh the page after a short delay to show updated data
        setTimeout(() => {
          router.refresh();
        }, 500);
      } else {
        throw new Error(result.message || 'Failed to update profile');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to save profile';
      setErrors(prev => ({ ...prev, submit: errorMessage }));
      toast.error(errorMessage);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      const result = await updateUserSettings(settingsData);

      if (result.success) {
        toast.success('Settings updated successfully');
        setHasSettingsChanges(false);
        initialSettingsData.current = settingsData;
      } else {
        throw new Error(result.message || 'Failed to update settings');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to save settings';
      toast.error(errorMessage);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleSaveSecurity = async () => {
    if (!validateSecurityForm()) {
      toast.error('Please fix the errors before saving');
      return;
    }

    setIsSavingSecurity(true);
    try {
      const updateData: {
        currentPassword?: string;
        newPassword?: string;
        twoFactorEnabled?: boolean;
        twoFactorCode?: string;
      } = {};

      if (securityData.newPassword) {
        updateData.currentPassword = securityData.currentPassword;
        updateData.newPassword = securityData.newPassword;
      }

      if (securityData.twoFactorEnabled !== false) {
        updateData.twoFactorEnabled = securityData.twoFactorEnabled;
        if (securityData.twoFactorCode) {
          updateData.twoFactorCode = securityData.twoFactorCode;
        }
      }

      const result = await updateUserSecurity(updateData);

      if (result.success) {
        toast.success('Security settings updated successfully');
        setHasSecurityChanges(false);
        setSecurityData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
          twoFactorEnabled: securityData.twoFactorEnabled,
          twoFactorCode: '',
        });
      } else {
        throw new Error(result.message || 'Failed to update security settings');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to save security settings';
      toast.error(errorMessage);
    } finally {
      setIsSavingSecurity(false);
    }
  };

  const bioLength = profileData.bio.length;
  const bioRemaining = 500 - bioLength;

  return (
    <div className='min-h-screen bg-black'>
      <div className='mx-auto w-full px-4 py-8 md:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='mb-2 text-2xl font-medium text-white'>
            Profile Settings
          </h1>
          <p className='text-sm text-zinc-500'>
            Manage your personal information and public profile
          </p>
        </div>

        <Tabs defaultValue='profile' className='w-full'>
          <div className='border-b border-zinc-800'>
            <TabsList className='inline-flex h-auto gap-6 bg-transparent p-0'>
              <TabsTrigger
                value='profile'
                className='data-[state=active]:border-b-primary rounded-none border-b-2 border-transparent bg-transparent px-0 py-3 text-sm font-medium text-zinc-400 transition-all data-[state=active]:text-white data-[state=active]:shadow-none'
              >
                <User className='mr-2 h-4 w-4' />
                Profile
              </TabsTrigger>
              <TabsTrigger
                value='settings'
                className='data-[state=active]:border-b-primary rounded-none border-b-2 border-transparent bg-transparent px-0 py-3 text-sm font-medium text-zinc-400 transition-all data-[state=active]:text-white data-[state=active]:shadow-none'
              >
                <Bell className='mr-2 h-4 w-4' />
                Settings
              </TabsTrigger>
              <TabsTrigger
                value='security'
                className='data-[state=active]:border-b-primary rounded-none border-b-2 border-transparent bg-transparent px-0 py-3 text-sm font-medium text-zinc-400 transition-all data-[state=active]:text-white data-[state=active]:shadow-none'
              >
                <Shield className='mr-2 h-4 w-4' />
                Security
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Profile Tab */}
          <TabsContent value='profile' className='mt-8'>
            <div className='space-y-8 rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 md:p-8'>
              {/* Avatar Section */}
              <div className='flex flex-col items-center gap-4'>
                <div className='relative'>
                  <input
                    ref={fileInputRef}
                    type='file'
                    accept='image/jpeg,image/jpg,image/png'
                    className='hidden'
                    onChange={handleFileChange}
                  />
                  <div
                    onDrop={handleDrop}
                    onDragOver={e => {
                      e.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      'group relative h-40 w-40 cursor-pointer overflow-hidden rounded-full border-2 transition-all',
                      isDragOver
                        ? 'border-primary bg-primary/10 scale-105'
                        : 'border-zinc-800 hover:border-zinc-700',
                      isUploading && 'cursor-not-allowed opacity-50'
                    )}
                  >
                    {isUploading ? (
                      <div className='flex h-full w-full items-center justify-center bg-zinc-900'>
                        <Loader2 className='text-primary h-8 w-8 animate-spin' />
                      </div>
                    ) : (
                      <>
                        {uploadPreview ? (
                          <Image
                            src={uploadPreview}
                            alt='Avatar preview'
                            fill
                            className='object-cover'
                            unoptimized
                          />
                        ) : (
                          <Image
                            src={profileData.avatar || '/avatar.png'}
                            alt='Avatar'
                            fill
                            className='object-cover'
                          />
                        )}
                        <div className='absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100'>
                          <div className='text-center'>
                            <Camera className='mx-auto mb-2 h-8 w-8 text-white' />
                            <p className='text-xs text-white'>Change Avatar</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className='text-center'>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className='border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                  >
                    <Upload className='mr-2 h-4 w-4' />
                    Upload Photo
                  </Button>
                  <p className='mt-2 text-xs text-zinc-500'>
                    JPEG or PNG, max 2MB
                  </p>
                  {errors.avatar && (
                    <p className='mt-1 flex items-center justify-center gap-1 text-xs text-red-400'>
                      <AlertCircle className='h-3 w-3' />
                      {errors.avatar}
                    </p>
                  )}
                </div>
              </div>

              <div className='h-px bg-zinc-800' />

              {/* Basic Information */}
              <div className='space-y-4'>
                <h3 className='text-sm font-medium text-white'>
                  Basic Information
                </h3>

                <div className='grid gap-4 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label className='text-sm font-medium text-zinc-400'>
                      First Name <span className='text-red-500'>*</span>
                    </Label>
                    <Input
                      value={profileData.firstName}
                      onChange={e =>
                        handleProfileInputChange('firstName', e.target.value)
                      }
                      placeholder='Enter first name'
                      className={cn(
                        'h-11 border-zinc-800 bg-zinc-900/50 text-white placeholder:text-zinc-600',
                        errors.firstName && 'border-red-500'
                      )}
                    />
                    {errors.firstName && (
                      <p className='flex items-center gap-1 text-xs text-red-400'>
                        <AlertCircle className='h-3 w-3' />
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label className='text-sm font-medium text-zinc-400'>
                      Last Name <span className='text-red-500'>*</span>
                    </Label>
                    <Input
                      value={profileData.lastName}
                      onChange={e =>
                        handleProfileInputChange('lastName', e.target.value)
                      }
                      placeholder='Enter last name'
                      className={cn(
                        'h-11 border-zinc-800 bg-zinc-900/50 text-white placeholder:text-zinc-600',
                        errors.lastName && 'border-red-500'
                      )}
                    />
                    {errors.lastName && (
                      <p className='flex items-center gap-1 text-xs text-red-400'>
                        <AlertCircle className='h-3 w-3' />
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label className='text-sm font-medium text-zinc-400'>
                    Username <span className='text-red-500'>*</span>
                  </Label>
                  <div className='relative'>
                    <User className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-500' />
                    <Input
                      value={profileData.username}
                      onChange={e =>
                        handleProfileInputChange('username', e.target.value)
                      }
                      placeholder='Enter username'
                      className={cn(
                        'h-11 border-zinc-800 bg-zinc-900/50 pl-10 text-white placeholder:text-zinc-600',
                        errors.username && 'border-red-500'
                      )}
                    />
                  </div>
                  {errors.username && (
                    <p className='flex items-center gap-1 text-xs text-red-400'>
                      <AlertCircle className='h-3 w-3' />
                      {errors.username}
                    </p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label className='text-sm font-medium text-zinc-400'>
                    Email
                  </Label>
                  <Input
                    value={profileData.email}
                    disabled
                    className='h-11 cursor-not-allowed border-zinc-800 bg-zinc-900/50 text-zinc-500 opacity-50'
                  />
                  <p className='text-xs text-zinc-500'>
                    Email cannot be changed
                  </p>
                </div>
              </div>

              <div className='h-px bg-zinc-800' />

              {/* Bio Section */}
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <Label className='text-sm font-medium text-zinc-400'>
                    Bio
                  </Label>
                  <span
                    className={cn(
                      'text-xs',
                      bioRemaining < 50 ? 'text-amber-400' : 'text-zinc-500'
                    )}
                  >
                    {bioLength}/500
                  </span>
                </div>
                <Textarea
                  value={profileData.bio}
                  onChange={e =>
                    handleProfileInputChange('bio', e.target.value)
                  }
                  placeholder='Tell us about yourself...'
                  className={cn(
                    'min-h-24 resize-none border-zinc-800 bg-zinc-900/50 text-white placeholder:text-zinc-600',
                    errors.bio && 'border-red-500'
                  )}
                  maxLength={500}
                />
                {errors.bio && (
                  <p className='flex items-center gap-1 text-xs text-red-400'>
                    <AlertCircle className='h-3 w-3' />
                    {errors.bio}
                  </p>
                )}
              </div>

              <div className='h-px bg-zinc-800' />

              {/* Social Links */}
              <div className='space-y-4'>
                <h3 className='text-sm font-medium text-white'>Social Links</h3>

                <div className='space-y-2'>
                  <Label className='text-sm font-medium text-zinc-400'>
                    Website
                  </Label>
                  <div className='relative'>
                    <Globe className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-500' />
                    <Input
                      value={profileData.website}
                      onChange={e =>
                        handleProfileInputChange('website', e.target.value)
                      }
                      placeholder='https://yourwebsite.com'
                      className={cn(
                        'h-11 border-zinc-800 bg-zinc-900/50 pl-10 text-white placeholder:text-zinc-600',
                        errors.website && 'border-red-500'
                      )}
                    />
                  </div>
                  {errors.website && (
                    <p className='flex items-center gap-1 text-xs text-red-400'>
                      <AlertCircle className='h-3 w-3' />
                      {errors.website}
                    </p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label className='text-sm font-medium text-zinc-400'>
                    Twitter/X
                  </Label>
                  <div className='relative'>
                    <svg
                      className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-500'
                      viewBox='0 0 24 24'
                      fill='currentColor'
                    >
                      <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
                    </svg>
                    <Input
                      value={profileData.twitter}
                      onChange={e =>
                        handleProfileInputChange('twitter', e.target.value)
                      }
                      placeholder='https://x.com/username'
                      className={cn(
                        'h-11 border-zinc-800 bg-zinc-900/50 pl-10 text-white placeholder:text-zinc-600',
                        errors.twitter && 'border-red-500'
                      )}
                    />
                  </div>
                  {errors.twitter && (
                    <p className='flex items-center gap-1 text-xs text-red-400'>
                      <AlertCircle className='h-3 w-3' />
                      {errors.twitter}
                    </p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label className='text-sm font-medium text-zinc-400'>
                    GitHub
                  </Label>
                  <div className='relative'>
                    <Github className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-500' />
                    <Input
                      value={profileData.github}
                      onChange={e =>
                        handleProfileInputChange('github', e.target.value)
                      }
                      placeholder='https://github.com/username'
                      className={cn(
                        'h-11 border-zinc-800 bg-zinc-900/50 pl-10 text-white placeholder:text-zinc-600',
                        errors.github && 'border-red-500'
                      )}
                    />
                  </div>
                  {errors.github && (
                    <p className='flex items-center gap-1 text-xs text-red-400'>
                      <AlertCircle className='h-3 w-3' />
                      {errors.github}
                    </p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label className='text-sm font-medium text-zinc-400'>
                    Other Link
                  </Label>
                  <div className='relative'>
                    <LinkIcon className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-500' />
                    <Input
                      value={profileData.other}
                      onChange={e =>
                        handleProfileInputChange('other', e.target.value)
                      }
                      placeholder='https://...'
                      className={cn(
                        'h-11 border-zinc-800 bg-zinc-900/50 pl-10 text-white placeholder:text-zinc-600',
                        errors.other && 'border-red-500'
                      )}
                    />
                  </div>
                  {errors.other && (
                    <p className='flex items-center gap-1 text-xs text-red-400'>
                      <AlertCircle className='h-3 w-3' />
                      {errors.other}
                    </p>
                  )}
                </div>
              </div>

              <div className='h-px bg-zinc-800' />

              {/* Profile Action Buttons */}
              <div className='flex flex-col-reverse gap-3 sm:flex-row sm:justify-between sm:gap-4'>
                {hasProfileChanges && (
                  <div className='flex items-center gap-2 text-sm text-amber-400'>
                    <div className='h-2 w-2 rounded-full bg-amber-400' />
                    You have unsaved changes
                  </div>
                )}
                <div className='ml-auto flex gap-3'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => router.push('/me')}
                    disabled={isSavingProfile}
                    className='border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                  >
                    Cancel
                  </Button>
                  <Button
                    type='button'
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile || !hasProfileChanges}
                    className='min-w-32'
                  >
                    {isSavingProfile ? (
                      <>
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className='mr-2 h-4 w-4' />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {errors.submit && (
                <div className='rounded-lg border border-red-900/50 bg-red-500/5 p-3'>
                  <p className='flex items-center gap-2 text-sm text-red-400'>
                    <AlertCircle className='h-4 w-4' />
                    {errors.submit}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value='settings' className='mt-8'>
            <div className='space-y-8 rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 md:p-8'>
              {/* Notifications Section */}
              <div className='space-y-4'>
                <h3 className='text-sm font-medium text-white'>
                  Notifications
                </h3>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <div className='space-y-0.5'>
                      <Label className='text-sm font-medium text-zinc-300'>
                        Email Notifications
                      </Label>
                      <p className='text-xs text-zinc-500'>
                        Receive email updates about your activity
                      </p>
                    </div>
                    <Switch
                      checked={settingsData.notifications?.email ?? true}
                      onCheckedChange={checked =>
                        handleSettingsChange('notifications', 'email', checked)
                      }
                    />
                  </div>

                  <div className='flex items-center justify-between'>
                    <div className='space-y-0.5'>
                      <Label className='text-sm font-medium text-zinc-300'>
                        Push Notifications
                      </Label>
                      <p className='text-xs text-zinc-500'>
                        Receive push notifications in your browser
                      </p>
                    </div>
                    <Switch
                      checked={settingsData.notifications?.push ?? true}
                      onCheckedChange={checked =>
                        handleSettingsChange('notifications', 'push', checked)
                      }
                    />
                  </div>

                  <div className='flex items-center justify-between'>
                    <div className='space-y-0.5'>
                      <Label className='text-sm font-medium text-zinc-300'>
                        In-App Notifications
                      </Label>
                      <p className='text-xs text-zinc-500'>
                        Show notifications within the application
                      </p>
                    </div>
                    <Switch
                      checked={settingsData.notifications?.inApp ?? true}
                      onCheckedChange={checked =>
                        handleSettingsChange('notifications', 'inApp', checked)
                      }
                    />
                  </div>
                </div>
              </div>

              <div className='h-px bg-zinc-800' />

              {/* Privacy Section */}
              <div className='space-y-4'>
                <h3 className='text-sm font-medium text-white'>Privacy</h3>
                <div className='space-y-4'>
                  <div className='space-y-2'>
                    <Label className='text-sm font-medium text-zinc-300'>
                      Profile Visibility
                    </Label>
                    <Select
                      value={
                        settingsData.privacy?.profileVisibility || 'PUBLIC'
                      }
                      onValueChange={value =>
                        handleSettingsChange(
                          'privacy',
                          'profileVisibility',
                          value
                        )
                      }
                    >
                      <SelectTrigger className='h-11 w-full border-zinc-800 bg-zinc-900/50 text-white'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className='border-zinc-800 bg-zinc-900 text-white'>
                        <SelectItem value='PUBLIC'>Public</SelectItem>
                        <SelectItem value='PRIVATE'>Private</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className='text-xs text-zinc-500'>
                      Control who can view your profile
                    </p>
                  </div>

                  <div className='flex items-center justify-between'>
                    <div className='space-y-0.5'>
                      <Label className='text-sm font-medium text-zinc-300'>
                        Show Wallet Address
                      </Label>
                      <p className='text-xs text-zinc-500'>
                        Display your wallet address on your profile
                      </p>
                    </div>
                    <Switch
                      checked={settingsData.privacy?.showWalletAddress ?? false}
                      onCheckedChange={checked =>
                        handleSettingsChange(
                          'privacy',
                          'showWalletAddress',
                          checked
                        )
                      }
                    />
                  </div>

                  <div className='flex items-center justify-between'>
                    <div className='space-y-0.5'>
                      <Label className='text-sm font-medium text-zinc-300'>
                        Show Contributions
                      </Label>
                      <p className='text-xs text-zinc-500'>
                        Display your contribution history publicly
                      </p>
                    </div>
                    <Switch
                      checked={settingsData.privacy?.showContributions ?? true}
                      onCheckedChange={checked =>
                        handleSettingsChange(
                          'privacy',
                          'showContributions',
                          checked
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              <div className='h-px bg-zinc-800' />

              {/* Preferences Section */}
              <div className='space-y-4'>
                <h3 className='text-sm font-medium text-white'>Preferences</h3>
                <div className='space-y-4'>
                  <div className='space-y-2'>
                    <Label className='text-sm font-medium text-zinc-300'>
                      Language
                    </Label>
                    <Select
                      value={settingsData.preferences?.language || 'en'}
                      onValueChange={value =>
                        handleSettingsChange('preferences', 'language', value)
                      }
                    >
                      <SelectTrigger className='h-11 w-full border-zinc-800 bg-zinc-900/50 text-white'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className='border-zinc-800 bg-zinc-900 text-white'>
                        <SelectItem value='en'>English</SelectItem>
                        <SelectItem value='es'>Spanish</SelectItem>
                        <SelectItem value='fr'>French</SelectItem>
                        <SelectItem value='de'>German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='space-y-2'>
                    <Label className='text-sm font-medium text-zinc-300'>
                      Timezone
                    </Label>
                    <Select
                      value={settingsData.preferences?.timezone || 'UTC'}
                      onValueChange={value =>
                        handleSettingsChange('preferences', 'timezone', value)
                      }
                    >
                      <SelectTrigger className='h-11 w-full border-zinc-800 bg-zinc-900/50 text-white'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className='border-zinc-800 bg-zinc-900 text-white'>
                        <SelectItem value='UTC'>UTC</SelectItem>
                        <SelectItem value='America/New_York'>
                          Eastern Time
                        </SelectItem>
                        <SelectItem value='America/Chicago'>
                          Central Time
                        </SelectItem>
                        <SelectItem value='America/Denver'>
                          Mountain Time
                        </SelectItem>
                        <SelectItem value='America/Los_Angeles'>
                          Pacific Time
                        </SelectItem>
                        <SelectItem value='Europe/London'>London</SelectItem>
                        <SelectItem value='Europe/Paris'>Paris</SelectItem>
                        <SelectItem value='Asia/Tokyo'>Tokyo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='space-y-2'>
                    <Label className='text-sm font-medium text-zinc-300'>
                      Theme
                    </Label>
                    <Select
                      value={settingsData.preferences?.theme || 'LIGHT'}
                      onValueChange={value =>
                        handleSettingsChange('preferences', 'theme', value)
                      }
                    >
                      <SelectTrigger className='h-11 w-full border-zinc-800 bg-zinc-900/50 text-white'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className='border-zinc-800 bg-zinc-900 text-white'>
                        <SelectItem value='LIGHT'>Light</SelectItem>
                        <SelectItem value='DARK'>Dark</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className='h-px bg-zinc-800' />

              {/* Settings Action Buttons */}
              <div className='flex flex-col-reverse gap-3 sm:flex-row sm:justify-between sm:gap-4'>
                {hasSettingsChanges && (
                  <div className='flex items-center gap-2 text-sm text-amber-400'>
                    <div className='h-2 w-2 rounded-full bg-amber-400' />
                    You have unsaved changes
                  </div>
                )}
                <div className='ml-auto flex gap-3'>
                  <Button
                    type='button'
                    onClick={handleSaveSettings}
                    disabled={isSavingSettings || !hasSettingsChanges}
                    className='min-w-32'
                  >
                    {isSavingSettings ? (
                      <>
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className='mr-2 h-4 w-4' />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value='security' className='mt-8'>
            <div className='space-y-8 rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 md:p-8'>
              {/* Change Password Section */}
              <div className='space-y-4'>
                <h3 className='text-sm font-medium text-white'>
                  Change Password
                </h3>
                <div className='space-y-4'>
                  <div className='space-y-2'>
                    <Label className='text-sm font-medium text-zinc-300'>
                      Current Password
                    </Label>
                    <div className='relative'>
                      <Lock className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-500' />
                      <Input
                        type='password'
                        value={securityData.currentPassword}
                        onChange={e =>
                          handleSecurityChange(
                            'currentPassword',
                            e.target.value
                          )
                        }
                        placeholder='Enter current password'
                        className={cn(
                          'h-11 border-zinc-800 bg-zinc-900/50 pl-10 text-white placeholder:text-zinc-600',
                          errors.currentPassword && 'border-red-500'
                        )}
                      />
                    </div>
                    {errors.currentPassword && (
                      <p className='flex items-center gap-1 text-xs text-red-400'>
                        <AlertCircle className='h-3 w-3' />
                        {errors.currentPassword}
                      </p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label className='text-sm font-medium text-zinc-300'>
                      New Password
                    </Label>
                    <div className='relative'>
                      <Lock className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-500' />
                      <Input
                        type='password'
                        value={securityData.newPassword}
                        onChange={e =>
                          handleSecurityChange('newPassword', e.target.value)
                        }
                        placeholder='Enter new password'
                        className={cn(
                          'h-11 border-zinc-800 bg-zinc-900/50 pl-10 text-white placeholder:text-zinc-600',
                          errors.newPassword && 'border-red-500'
                        )}
                      />
                    </div>
                    {errors.newPassword && (
                      <p className='flex items-center gap-1 text-xs text-red-400'>
                        <AlertCircle className='h-3 w-3' />
                        {errors.newPassword}
                      </p>
                    )}
                    <p className='text-xs text-zinc-500'>
                      Password must be at least 8 characters
                    </p>
                  </div>

                  <div className='space-y-2'>
                    <Label className='text-sm font-medium text-zinc-300'>
                      Confirm New Password
                    </Label>
                    <div className='relative'>
                      <Lock className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-500' />
                      <Input
                        type='password'
                        value={securityData.confirmPassword}
                        onChange={e =>
                          handleSecurityChange(
                            'confirmPassword',
                            e.target.value
                          )
                        }
                        placeholder='Confirm new password'
                        className={cn(
                          'h-11 border-zinc-800 bg-zinc-900/50 pl-10 text-white placeholder:text-zinc-600',
                          errors.confirmPassword && 'border-red-500'
                        )}
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className='flex items-center gap-1 text-xs text-red-400'>
                        <AlertCircle className='h-3 w-3' />
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className='h-px bg-zinc-800' />

              {/* Two-Factor Authentication Section */}
              <div className='space-y-4'>
                <h3 className='text-sm font-medium text-white'>
                  Two-Factor Authentication
                </h3>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <div className='space-y-0.5'>
                      <Label className='text-sm font-medium text-zinc-300'>
                        Enable 2FA
                      </Label>
                      <p className='text-xs text-zinc-500'>
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Switch
                      checked={securityData.twoFactorEnabled}
                      onCheckedChange={checked =>
                        handleSecurityChange('twoFactorEnabled', checked)
                      }
                    />
                  </div>

                  {securityData.twoFactorEnabled && (
                    <div className='space-y-2'>
                      <Label className='text-sm font-medium text-zinc-300'>
                        2FA Code
                      </Label>
                      <Input
                        value={securityData.twoFactorCode}
                        onChange={e =>
                          handleSecurityChange('twoFactorCode', e.target.value)
                        }
                        placeholder='Enter 2FA code'
                        className={cn(
                          'h-11 border-zinc-800 bg-zinc-900/50 text-white placeholder:text-zinc-600',
                          errors.twoFactorCode && 'border-red-500'
                        )}
                      />
                      {errors.twoFactorCode && (
                        <p className='flex items-center gap-1 text-xs text-red-400'>
                          <AlertCircle className='h-3 w-3' />
                          {errors.twoFactorCode}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className='h-px bg-zinc-800' />

              {/* Security Action Buttons */}
              <div className='flex flex-col-reverse gap-3 sm:flex-row sm:justify-between sm:gap-4'>
                {hasSecurityChanges && (
                  <div className='flex items-center gap-2 text-sm text-amber-400'>
                    <div className='h-2 w-2 rounded-full bg-amber-400' />
                    You have unsaved changes
                  </div>
                )}
                <div className='ml-auto flex gap-3'>
                  <Button
                    type='button'
                    onClick={() => {
                      setSecurityData({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: '',
                        twoFactorEnabled: securityData.twoFactorEnabled,
                        twoFactorCode: '',
                      });
                      setErrors({});
                    }}
                    disabled={isSavingSecurity}
                    variant='outline'
                    className='border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                  >
                    Reset
                  </Button>
                  <Button
                    type='button'
                    onClick={handleSaveSecurity}
                    disabled={isSavingSecurity || !hasSecurityChanges}
                    className='min-w-32'
                  >
                    {isSavingSecurity ? (
                      <>
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className='mr-2 h-4 w-4' />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
