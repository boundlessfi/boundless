'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { MessageCircle, Hash, Phone } from 'lucide-react';
import { SocialLink } from '@/features/projects/types';

interface ContactSocialSectionProps {
  data: {
    contact: {
      primary: string;
      backup: string;
    };
    socialLinks: SocialLink[];
  };
  onChange: (field: string, value: any) => void;
}

const socialPlatforms = [
  { value: 'twitter', label: 'Twitter', icon: Hash },
  { value: 'discord', label: 'Discord', icon: Hash },
  { value: 'telegram', label: 'Telegram', icon: MessageCircle },
  { value: 'linkedin', label: 'LinkedIn', icon: Hash },
  { value: 'medium', label: 'Medium', icon: Hash },
  { value: 'youtube', label: 'YouTube', icon: Hash },
];

export function ContactSocialSection({
  data,
  onChange,
}: ContactSocialSectionProps) {
  const updateContact = (field: 'primary' | 'backup', value: string) => {
    onChange('contact', {
      ...data.contact,
      [field]: value,
    });
  };

  const updateSocialLink = (platform: string, url: string) => {
    const socialLinks = Array.isArray(data.socialLinks) ? data.socialLinks : [];
    const existingIndex = socialLinks.findIndex(
      link => link.platform === platform
    );
    const updatedLinks = [...socialLinks];

    if (url.trim()) {
      if (existingIndex >= 0) {
        updatedLinks[existingIndex] = {
          ...updatedLinks[existingIndex],
          url: url.trim(),
        };
      } else {
        updatedLinks.push({ platform, url: url.trim() });
      }
    } else if (existingIndex >= 0) {
      updatedLinks.splice(existingIndex, 1);
    }

    onChange('socialLinks', updatedLinks);
  };

  const getSocialLink = (platform: string) => {
    const socialLinks = Array.isArray(data.socialLinks) ? data.socialLinks : [];
    return socialLinks.find(link => link.platform === platform)?.url || '';
  };

  return (
    <Card className='bg-background border-border/10'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-white'>
          <div className='h-2 w-2 rounded-full bg-cyan-500'></div>
          Contact & Social Links
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Contact Information */}
        <div className='space-y-4'>
          <h4 className='font-medium text-white'>Contact Information</h4>

          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label className='flex items-center gap-2 text-white'>
                <MessageCircle className='h-4 w-4' />
                Primary Contact (Telegram)
              </Label>
              <Input
                value={data.contact.primary}
                onChange={e => updateContact('primary', e.target.value)}
                placeholder='@username or https://t.me/username'
                className='bg-background border-border/20 text-white'
              />
            </div>

            <div className='space-y-2'>
              <Label className='flex items-center gap-2 text-white'>
                <Phone className='h-4 w-4' />
                Backup Contact
              </Label>
              <RadioGroup
                value={data.contact.backup ? 'custom' : 'telegram'}
                onValueChange={value => {
                  if (value === 'telegram') {
                    updateContact('backup', '');
                  }
                }}
                className='flex flex-col space-y-2'
              >
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='telegram' id='telegram' />
                  <Label htmlFor='telegram' className='text-white'>
                    Use Telegram as backup
                  </Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='custom' id='custom' />
                  <Label htmlFor='custom' className='text-white'>
                    Custom backup contact
                  </Label>
                </div>
              </RadioGroup>
              {data.contact.backup && (
                <Input
                  value={data.contact.backup}
                  onChange={e => updateContact('backup', e.target.value)}
                  placeholder='Phone, Discord, or other contact method'
                  className='bg-background border-border/20 mt-2 text-white'
                />
              )}
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className='space-y-4'>
          <h4 className='font-medium text-white'>Social Media Links</h4>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            {socialPlatforms.map(platform => {
              const Icon = platform.icon;
              return (
                <div key={platform.value} className='space-y-2'>
                  <Label className='flex items-center gap-2 text-white'>
                    <Icon className='h-4 w-4' />
                    {platform.label}
                  </Label>
                  <Input
                    value={getSocialLink(platform.value)}
                    onChange={e =>
                      updateSocialLink(platform.value, e.target.value)
                    }
                    placeholder={`https://${platform.value}.com/...`}
                    className='bg-background border-border/20 text-white'
                  />
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
