'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { z } from 'zod';

interface ContactProps {
  onDataChange?: (data: ContactFormData) => void;
  initialData?: Partial<ContactFormData>;
}

export interface ContactFormData {
  telegram: string;
  backupType: 'discord' | 'whatsapp';
  backupContact: string;
  agreeToTerms: boolean;
  agreeToPrivacy: boolean;
}

const contactSchema = z
  .object({
    telegram: z
      .string()
      .trim()
      .min(1, 'Telegram username is required')
      .regex(/^@?[a-zA-Z0-9_]+$/, 'Please enter a valid Telegram username'),
    backupType: z.union([z.literal('discord'), z.literal('whatsapp')]),
    backupContact: z.string().trim().min(1, 'Backup contact is required'),
    // Terms/Privacy are validated at final submission in the parent schema
    agreeToTerms: z.boolean().optional(),
    agreeToPrivacy: z.boolean().optional(),
  })
  .refine(
    data => {
      // Ensure backup type is selected and backup contact is provided
      return data.backupType && data.backupContact.trim().length > 0;
    },
    {
      message:
        'Please select a backup contact method and provide contact information',
      path: ['backupType'],
    }
  );

const Contact = React.forwardRef<{ validate: () => boolean }, ContactProps>(
  ({ onDataChange, initialData }, ref) => {
    const [formData, setFormData] = useState<ContactFormData>({
      telegram: initialData?.telegram || '',
      backupType: initialData?.backupType || 'whatsapp',
      backupContact: initialData?.backupContact || '',
      agreeToTerms: initialData?.agreeToTerms || false,
      agreeToPrivacy: initialData?.agreeToPrivacy || false,
    });

    // Update form data when initialData changes
    React.useEffect(() => {
      if (initialData) {
        setFormData({
          telegram: initialData.telegram || '',
          backupType: initialData.backupType || 'whatsapp',
          backupContact: initialData.backupContact || '',
          agreeToTerms: initialData.agreeToTerms || false,
          agreeToPrivacy: initialData.agreeToPrivacy || false,
        });
      }
    }, [initialData]);

    const [errors, setErrors] = useState<
      Partial<Record<keyof ContactFormData, string>>
    >({});

    const handleInputChange = (
      field: keyof ContactFormData,
      value: string | boolean
    ) => {
      const newData = { ...formData, [field]: value };
      setFormData(newData);

      // Clear error when user starts typing
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: undefined }));
      }

      onDataChange?.(newData);
    };

    const validateForm = (): boolean => {
      const parsed = contactSchema.safeParse(formData);
      if (parsed.success) {
        setErrors({});
        return true;
      }
      const fieldErrors: Partial<Record<keyof ContactFormData, string>> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof ContactFormData | undefined;
        if (field) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return false;
    };

    // Expose validation function to parent
    React.useImperativeHandle(ref, () => ({
      validate: validateForm,
    }));

    return (
      <div className='min-h-full space-y-8 text-white'>
        {/* Information Box */}
        <div className='rounded-lg bg-[#DBF936]/12 p-4'>
          <div className='flex items-start space-x-4'>
            <svg
              width='36'
              height='36'
              className='min-h-10 min-w-10'
              viewBox='0 0 36 36'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M17.9987 24.6668V18.0002M17.9987 11.3335H18.0154M34.6654 18.0002C34.6654 27.2049 27.2034 34.6668 17.9987 34.6668C8.79395 34.6668 1.33203 27.2049 1.33203 18.0002C1.33203 8.79542 8.79395 1.3335 17.9987 1.3335C27.2034 1.3335 34.6654 8.79542 34.6654 18.0002Z'
                stroke='#DBF936'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>

            <div className='space-y-2'>
              <p className='text-base text-white'>
                Your Project contact information will be used for Project
                verification and for Boundless staff to contact you. The contact
                information can only be accessed by Boundless staff.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className='space-y-6'>
          {/* Telegram */}
          <div className='space-y-2'>
            <Label className='text-white'>
              Telegram (primary contact) <span className='text-red-500'>*</span>
            </Label>
            <div className='relative h-fit'>
              <span className='absolute top-[5px] left-4 text-white'>@</span>
              <Input
                placeholder='Telegram username'
                value={formData.telegram}
                onChange={e => handleInputChange('telegram', e.target.value)}
                className={cn(
                  'focus:border-primary border-[#484848] bg-[#1A1A1A] pl-8 text-white placeholder:text-[#919191]',
                  errors.telegram && 'border-red-500'
                )}
              />
            </div>
            {errors.telegram && (
              <p className='text-sm text-red-500'>{errors.telegram}</p>
            )}
          </div>

          {/* Backup Contact */}
          <div className='space-y-4'>
            <Label className='text-white'>
              Backup <span className='text-red-500'>*</span>
            </Label>

            <RadioGroup
              value={formData.backupType}
              onValueChange={value =>
                handleInputChange('backupType', value as 'discord' | 'whatsapp')
              }
              className='space-y-1'
            >
              {/* Discord Option */}
              <div
                className={cn(
                  'relative flex items-center overflow-hidden rounded-[12px] border bg-[#101010] transition-all duration-200',
                  formData.backupType === 'discord'
                    ? 'border-[#A7F950]'
                    : 'border-[#2B2B2B]'
                )}
              >
                <div
                  className={cn(
                    'flex items-center space-x-2 border-r border-[#2B2B2B] bg-[#2B2B2B] px-4 py-3',
                    formData.backupType === 'discord' && 'bg-[#A7F95014]'
                  )}
                >
                  <RadioGroupItem
                    value='discord'
                    id='discord'
                    className={cn(
                      'border-2',
                      formData.backupType === 'discord'
                        ? 'border-[#A7F950]'
                        : 'border-[#484848]'
                    )}
                  />
                  <Label
                    htmlFor='discord'
                    className={cn(
                      'cursor-pointer text-sm',
                      formData.backupType === 'discord'
                        ? 'text-[#A7F950]'
                        : 'text-[#B5B5B5]'
                    )}
                  >
                    Discord
                  </Label>
                </div>
                <Input
                  placeholder='Discord username'
                  value={
                    formData.backupType === 'discord'
                      ? formData.backupContact
                      : ''
                  }
                  onChange={e =>
                    handleInputChange('backupContact', e.target.value)
                  }
                  className={cn(
                    'rounded-none border-0 bg-transparent py-0 pr-4 pl-4 text-white placeholder:text-[#919191] focus-visible:border-0 focus-visible:ring-0 focus-visible:ring-offset-0',
                    errors.backupContact && 'text-red-500'
                  )}
                />
              </div>

              {/* WhatsApp Option */}
              <div
                className={cn(
                  'relative flex items-center overflow-hidden rounded-[12px] border bg-[#101010] transition-all duration-200',
                  formData.backupType === 'whatsapp'
                    ? 'border-[#A7F950]'
                    : 'border-[#2B2B2B]'
                )}
              >
                <div
                  className={cn(
                    'flex items-center space-x-2 border-r border-[#2B2B2B] bg-[#2B2B2B] px-4 py-3',
                    formData.backupType === 'whatsapp' && 'bg-[#A7F95014]'
                  )}
                >
                  <RadioGroupItem
                    value='whatsapp'
                    id='whatsapp'
                    className={cn(
                      'border',
                      formData.backupType === 'whatsapp'
                        ? 'border-[#A7F950]'
                        : 'border-[#484848]'
                    )}
                  />
                  <Label
                    htmlFor='whatsapp'
                    className={cn(
                      'cursor-pointer text-sm',
                      formData.backupType === 'whatsapp'
                        ? 'text-[#A7F950]'
                        : 'text-[#B5B5B5]'
                    )}
                  >
                    WhatsApp
                  </Label>
                </div>
                <Input
                  placeholder='WhatsApp phone number (e.g., +123456789)'
                  value={
                    formData.backupType === 'whatsapp'
                      ? formData.backupContact
                      : ''
                  }
                  onChange={e =>
                    handleInputChange('backupContact', e.target.value)
                  }
                  className={cn(
                    'rounded-none border-0 bg-transparent py-0 pr-4 pl-4 text-white placeholder:text-[#919191] focus-visible:border-0 focus-visible:ring-0 focus-visible:ring-offset-0',
                    errors.backupContact && 'text-red-500'
                  )}
                />
              </div>
            </RadioGroup>

            {(errors.backupContact || errors.backupType) && (
              <p className='text-sm text-red-500'>
                {errors.backupContact || errors.backupType}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }
);

Contact.displayName = 'Contact';

export default Contact;
