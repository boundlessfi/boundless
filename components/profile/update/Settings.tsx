'use client';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  getUserSettings,
  updateAppearanceSettings,
  updateNotificationsSettings,
  updatePrivacySettings,
  updateUserSettings,
  UserAppearance,
  UserNotifications,
  UserPrivacy,
  UserSettings,
} from '@/lib/api/auth';
import { toast } from 'sonner';
import { Loader2, Monitor, Bell, Shield, User, Sun, Moon } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

// Validation schema
const settingsSchema = z.object({
  notifications: z.object({
    emailNotifications: z.boolean(),
    pushNotifications: z.boolean(),
  }),
  privacy: z.object({
    publicProfile: z.boolean(),
    emailVisibility: z.boolean(),
    locationVisibility: z.boolean(),
    companyVisibility: z.boolean(),
    websiteVisibility: z.boolean(),
    socialLinksVisibility: z.boolean(),
  }),
  appearance: z.object({
    theme: z.enum(['light', 'dark', 'auto']),
  }),
  preferences: z.object({
    language: z.string().nullable(),
    timezone: z.string(),
    categories: z.array(z.string()),
    skills: z.array(z.string()),
  }),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

interface SettingsProps {
  visibleSections?: (
    | 'notifications'
    | 'privacy'
    | 'appearance'
    | 'preferences'
  )[];
}

const Settings = ({ visibleSections }: SettingsProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<UserSettings>({
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
    },
    privacy: {
      publicProfile: true,
    },
    appearance: {
      theme: 'light',
    },
    preferences: {
      language: null,
      timezone: 'UTC',
      categories: [],
      skills: [],
    },
  });
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settingsData = await getUserSettings();
      setSettings(settingsData);
    } catch {
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      notifications: {
        emailNotifications: settings.notifications?.emailNotifications ?? true,
        pushNotifications: settings.notifications?.pushNotifications ?? true,
      },
      privacy: {
        publicProfile: settings.privacy?.publicProfile ?? true,
        emailVisibility: settings.privacy?.emailVisibility ?? false,
        locationVisibility: settings.privacy?.locationVisibility ?? false,
        companyVisibility: settings.privacy?.companyVisibility ?? false,
        websiteVisibility: settings.privacy?.websiteVisibility ?? false,
        socialLinksVisibility: settings.privacy?.socialLinksVisibility ?? false,
      },
      appearance: {
        theme:
          (settings.appearance?.theme as 'light' | 'dark' | 'auto') ?? 'light',
      },
      preferences: {
        language: settings.preferences?.language ?? null,
        timezone: settings.preferences?.timezone ?? 'UTC',
        categories: settings.preferences?.categories ?? [],
        skills: settings.preferences?.skills ?? [],
      },
    },
  });

  // Sync form with backend data once loaded (so we show API values, not only defaults)
  useEffect(() => {
    if (isLoading) return;
    form.reset({
      notifications: {
        emailNotifications: settings.notifications?.emailNotifications ?? true,
        pushNotifications: settings.notifications?.pushNotifications ?? true,
      },
      privacy: {
        publicProfile: settings.privacy?.publicProfile ?? true,
        emailVisibility: settings.privacy?.emailVisibility ?? false,
        locationVisibility: settings.privacy?.locationVisibility ?? false,
        companyVisibility: settings.privacy?.companyVisibility ?? false,
        websiteVisibility: settings.privacy?.websiteVisibility ?? false,
        socialLinksVisibility: settings.privacy?.socialLinksVisibility ?? false,
      },
      appearance: {
        theme:
          (settings.appearance?.theme as 'light' | 'dark' | 'auto') ?? 'light',
      },
      preferences: {
        language: settings.preferences?.language ?? null,
        timezone: settings.preferences?.timezone ?? 'UTC',
        categories: settings.preferences?.categories ?? [],
        skills: settings.preferences?.skills ?? [],
      },
    });
  }, [isLoading, settings, form]);

  const onSubmit = async (data: SettingsFormData) => {
    setIsSaving(true);
    try {
      await updateUserSettings({
        notifications: data.notifications,
        privacy: data.privacy,
        appearance: data.appearance,
        preferences: data.preferences,
      });
      toast.success('Settings updated successfully');
    } catch {
      toast.error('Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  const onSubmitNotifications = async (data: UserNotifications) => {
    setIsSaving(true);
    try {
      await updateNotificationsSettings(data);
      toast.success('Notifications updated successfully');
    } catch {
      toast.error('Failed to update notifications');
    } finally {
      loadSettings();
      setIsSaving(false);
    }
  };

  const onSubmitPrivacy = async (data: UserPrivacy) => {
    setIsSaving(true);
    try {
      await updatePrivacySettings(data);
      toast.success('Privacy updated successfully');
    } catch {
      toast.error('Failed to update privacy');
    } finally {
      loadSettings();
      setIsSaving(false);
    }
  };

  const onSubmitAppearance = async (data: UserAppearance) => {
    setIsSaving(true);
    try {
      await updateAppearanceSettings(data);
      toast.success('Appearance updated successfully');
    } catch {
      toast.error('Failed to update appearance');
    } finally {
      loadSettings();
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className='flex min-h-96 items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-6'>
      {showAllSections && (
        <div>
          <h1 className='text-2xl font-bold text-white'>Settings</h1>
          <p className='mt-1 text-zinc-400'>
            Manage your account preferences and privacy settings
          </p>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          {/* Notifications */}
          {(!visibleSections || visibleSections.includes('notifications')) && (
            <Card className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-4'>
              <div className='mb-4 flex items-center gap-3'>
                <Bell className='h-5 w-5 text-zinc-400' />
                <h2 className='text-lg font-semibold text-white'>
                  Notifications
                </h2>
              </div>

              <div className='space-y-4'>
                <FormField
                  control={form.control}
                  name='notifications.emailNotifications'
                  render={({ field }) => (
                    <FormItem className='flex items-center justify-between'>
                      <div className='space-y-0.5'>
                        <FormLabel className='text-zinc-300'>
                          Email Notifications
                        </FormLabel>
                        <FormDescription className='text-zinc-500'>
                          Receive email notifications about account activity
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={async (checked: boolean) => {
                            field.onChange(checked);
                            await onSubmitNotifications({
                              emailNotifications: checked,
                              pushNotifications: form.getValues(
                                'notifications.pushNotifications'
                              ),
                            });
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='notifications.pushNotifications'
                  render={({ field }) => (
                    <FormItem className='flex items-center justify-between'>
                      <div className='space-y-0.5'>
                        <FormLabel className='text-zinc-300'>
                          Push Notifications
                        </FormLabel>
                        <FormDescription className='text-zinc-500'>
                          Receive push notifications in your browser
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={async (checked: boolean) => {
                            field.onChange(checked);
                            await onSubmitNotifications({
                              pushNotifications: checked,
                              emailNotifications: form.getValues(
                                'notifications.emailNotifications'
                              ),
                            });
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </Card>
          )}

          {/* Privacy */}
          {(!visibleSections || visibleSections.includes('privacy')) && (
            <Card className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-4'>
              <div className='mb-4 flex items-center gap-3'>
                <Shield className='h-5 w-5 text-zinc-400' />
                <h2 className='text-lg font-semibold text-white'>Privacy</h2>
              </div>

              <div className='space-y-4'>
                <FormField
                  control={form.control}
                  name='privacy.publicProfile'
                  render={({ field }) => (
                    <FormItem className='flex items-center justify-between'>
                      <div className='space-y-0.5'>
                        <FormLabel className='text-zinc-300'>
                          Public Profile
                        </FormLabel>
                        <FormDescription className='text-zinc-500'>
                          Make your profile visible to other users
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={async (checked: boolean) => {
                            field.onChange(checked);
                            await onSubmitPrivacy({
                              publicProfile: checked,
                              emailVisibility: form.getValues(
                                'privacy.emailVisibility'
                              ),
                              locationVisibility: form.getValues(
                                'privacy.locationVisibility'
                              ),
                              companyVisibility: form.getValues(
                                'privacy.companyVisibility'
                              ),
                              websiteVisibility: form.getValues(
                                'privacy.websiteVisibility'
                              ),
                              socialLinksVisibility: form.getValues(
                                'privacy.socialLinksVisibility'
                              ),
                            });
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='privacy.emailVisibility'
                  render={({ field }) => (
                    <FormItem className='flex items-center justify-between'>
                      <div className='space-y-0.5'>
                        <FormLabel className='text-zinc-300'>
                          Email Visibility
                        </FormLabel>
                        <FormDescription className='text-zinc-500'>
                          Show your email address on your profile
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={async (checked: boolean) => {
                            field.onChange(checked);
                            await onSubmitPrivacy({
                              publicProfile: form.getValues(
                                'privacy.publicProfile'
                              ),
                              emailVisibility: checked,
                              locationVisibility: form.getValues(
                                'privacy.locationVisibility'
                              ),
                              companyVisibility: form.getValues(
                                'privacy.companyVisibility'
                              ),
                              websiteVisibility: form.getValues(
                                'privacy.websiteVisibility'
                              ),
                              socialLinksVisibility: form.getValues(
                                'privacy.socialLinksVisibility'
                              ),
                            });
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='privacy.locationVisibility'
                  render={({ field }) => (
                    <FormItem className='flex items-center justify-between'>
                      <div className='space-y-0.5'>
                        <FormLabel className='text-zinc-300'>
                          Location Visibility
                        </FormLabel>
                        <FormDescription className='text-zinc-500'>
                          Show your location on your profile
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={async (checked: boolean) => {
                            field.onChange(checked);
                            await onSubmitPrivacy({
                              publicProfile: form.getValues(
                                'privacy.publicProfile'
                              ),
                              emailVisibility: form.getValues(
                                'privacy.emailVisibility'
                              ),
                              locationVisibility: checked,
                              companyVisibility: form.getValues(
                                'privacy.companyVisibility'
                              ),
                              websiteVisibility: form.getValues(
                                'privacy.websiteVisibility'
                              ),
                              socialLinksVisibility: form.getValues(
                                'privacy.socialLinksVisibility'
                              ),
                            });
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='privacy.companyVisibility'
                  render={({ field }) => (
                    <FormItem className='flex items-center justify-between'>
                      <div className='space-y-0.5'>
                        <FormLabel className='text-zinc-300'>
                          Company Visibility
                        </FormLabel>
                        <FormDescription className='text-zinc-500'>
                          Show your company on your profile
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={async (checked: boolean) => {
                            field.onChange(checked);
                            await onSubmitPrivacy({
                              publicProfile: form.getValues(
                                'privacy.publicProfile'
                              ),
                              emailVisibility: form.getValues(
                                'privacy.emailVisibility'
                              ),
                              locationVisibility: form.getValues(
                                'privacy.locationVisibility'
                              ),
                              companyVisibility: checked,
                              websiteVisibility: form.getValues(
                                'privacy.websiteVisibility'
                              ),
                              socialLinksVisibility: form.getValues(
                                'privacy.socialLinksVisibility'
                              ),
                            });
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='privacy.websiteVisibility'
                  render={({ field }) => (
                    <FormItem className='flex items-center justify-between'>
                      <div className='space-y-0.5'>
                        <FormLabel className='text-zinc-300'>
                          Website Visibility
                        </FormLabel>
                        <FormDescription className='text-zinc-500'>
                          Show your website on your profile
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={async (checked: boolean) => {
                            field.onChange(checked);
                            await onSubmitPrivacy({
                              publicProfile: form.getValues(
                                'privacy.publicProfile'
                              ),
                              emailVisibility: form.getValues(
                                'privacy.emailVisibility'
                              ),
                              locationVisibility: form.getValues(
                                'privacy.locationVisibility'
                              ),
                              companyVisibility: form.getValues(
                                'privacy.companyVisibility'
                              ),
                              websiteVisibility: checked,
                              socialLinksVisibility: form.getValues(
                                'privacy.socialLinksVisibility'
                              ),
                            });
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='privacy.socialLinksVisibility'
                  render={({ field }) => (
                    <FormItem className='flex items-center justify-between'>
                      <div className='space-y-0.5'>
                        <FormLabel className='text-zinc-300'>
                          Social Links Visibility
                        </FormLabel>
                        <FormDescription className='text-zinc-500'>
                          Show your social links on your profile
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={async (checked: boolean) => {
                            field.onChange(checked);
                            await onSubmitPrivacy({
                              publicProfile: form.getValues(
                                'privacy.publicProfile'
                              ),
                              emailVisibility: form.getValues(
                                'privacy.emailVisibility'
                              ),
                              locationVisibility: form.getValues(
                                'privacy.locationVisibility'
                              ),
                              companyVisibility: form.getValues(
                                'privacy.companyVisibility'
                              ),
                              websiteVisibility: form.getValues(
                                'privacy.websiteVisibility'
                              ),
                              socialLinksVisibility: checked,
                            });
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </Card>
          )}

          {sections.includes('appearance') && (
            <Card className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-4'>
              <div className='mb-4 flex items-center gap-3'>
                <Monitor className='h-5 w-5 text-zinc-400' />
                <h2 className='text-lg font-semibold text-white'>Appearance</h2>
              </div>

              <FormField
                control={form.control}
                name='appearance.theme'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-zinc-300'>Theme</FormLabel>
                    <Select
                      onValueChange={async (value: string) => {
                        field.onChange(value);
                        await onSubmitAppearance({
                          theme: value as 'light' | 'dark' | 'auto',
                        });
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className='w-full border-zinc-800 bg-zinc-900/50 text-white'>
                          <SelectValue placeholder='Select theme' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className='border-zinc-800 bg-zinc-900'>
                        <SelectItem
                          value='light'
                          className='text-white hover:bg-zinc-800'
                        >
                          <div className='flex items-center gap-2'>
                            <Sun className='h-4 w-4' />
                            Light
                          </div>
                        </SelectItem>
                        <SelectItem
                          value='dark'
                          className='text-white hover:bg-zinc-800'
                        >
                          <div className='flex items-center gap-2'>
                            <Moon className='h-4 w-4' />
                            Dark
                          </div>
                        </SelectItem>
                        <SelectItem
                          value='auto'
                          className='text-white hover:bg-zinc-800'
                        >
                          <div className='flex items-center gap-2'>
                            <Monitor className='h-4 w-4' />
                            Auto
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>
          )}

          {sections.includes('preferences') && (
            <Card className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-4'>
              <div className='mb-4 flex items-center gap-3'>
                <User className='h-5 w-5 text-zinc-400' />
                <h2 className='text-lg font-semibold text-white'>
                  Preferences
                </h2>
              </div>

              <div className='space-y-6'>
                {/* Language */}
                <FormField
                  control={form.control}
                  name='preferences.language'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-zinc-300'>Language</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger className='w-full border-zinc-800 bg-zinc-900/50 text-white'>
                            <SelectValue placeholder='Select language' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className='border-zinc-800 bg-zinc-900'>
                          <SelectItem
                            value='en'
                            className='text-white hover:bg-zinc-800'
                          >
                            English
                          </SelectItem>
                          <SelectItem
                            value='es'
                            className='text-white hover:bg-zinc-800'
                          >
                            Spanish
                          </SelectItem>
                          <SelectItem
                            value='fr'
                            className='text-white hover:bg-zinc-800'
                          >
                            French
                          </SelectItem>
                          <SelectItem
                            value='de'
                            className='text-white hover:bg-zinc-800'
                          >
                            German
                          </SelectItem>
                          <SelectItem
                            value='zh'
                            className='text-white hover:bg-zinc-800'
                          >
                            Chinese
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Timezone */}
                <FormField
                  control={form.control}
                  name='preferences.timezone'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-zinc-300'>Timezone</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className='w-full border-zinc-800 bg-zinc-900/50 text-white'>
                            <SelectValue placeholder='Select timezone' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className='border-zinc-800 bg-zinc-900'>
                          <SelectItem
                            value='UTC'
                            className='text-white hover:bg-zinc-800'
                          >
                            UTC
                          </SelectItem>
                          <SelectItem
                            value='America/New_York'
                            className='text-white hover:bg-zinc-800'
                          >
                            Eastern Time
                          </SelectItem>
                          <SelectItem
                            value='America/Chicago'
                            className='text-white hover:bg-zinc-800'
                          >
                            Central Time
                          </SelectItem>
                          <SelectItem
                            value='America/Denver'
                            className='text-white hover:bg-zinc-800'
                          >
                            Mountain Time
                          </SelectItem>
                          <SelectItem
                            value='America/Los_Angeles'
                            className='text-white hover:bg-zinc-800'
                          >
                            Pacific Time
                          </SelectItem>
                          <SelectItem
                            value='Europe/London'
                            className='text-white hover:bg-zinc-800'
                          >
                            London
                          </SelectItem>
                          <SelectItem
                            value='Europe/Paris'
                            className='text-white hover:bg-zinc-800'
                          >
                            Paris
                          </SelectItem>
                          <SelectItem
                            value='Asia/Tokyo'
                            className='text-white hover:bg-zinc-800'
                          >
                            Tokyo
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Categories and Skills would be implemented here if needed */}
                {/* They are arrays in the API but for now we'll keep them as empty arrays */}
              </div>
            </Card>
          )}

          {showAllSections && (
            <div className='flex justify-end'>
              <Button type='submit' disabled={isSaving} className='min-w-32'>
                {isSaving ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Saving...
                  </>
                ) : (
                  'Save Settings'
                )}
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
};

export default Settings;
