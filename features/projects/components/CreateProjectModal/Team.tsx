'use client';

import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface TeamProps {
  onDataChange?: (data: TeamFormData) => void;
  initialData?: Partial<TeamFormData>;
}

export interface TeamMember {
  id: string;
  email: string;
  role?: string;
}

export interface TeamFormData {
  members: TeamMember[];
}

const Team = React.forwardRef<{ validate: () => boolean }, TeamProps>(
  ({ onDataChange, initialData }, ref) => {
    const [formData, setFormData] = useState<TeamFormData>({
      members: initialData?.members || [],
    });

    React.useEffect(() => {
      if (initialData) {
        setFormData({
          members: initialData.members || [],
        });
      }
    }, [initialData]);

    const [searchQuery, setSearchQuery] = useState('');
    const [errors, setErrors] = useState<{ members?: string; email?: string }>(
      {}
    );

    const handleFormDataChange = (
      field: keyof TeamFormData,
      value: TeamMember[]
    ) => {
      const newData = { ...formData, [field]: value };
      setFormData(newData);

      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: undefined }));
      }

      onDataChange?.(newData);
    };

    const isValidEmail = (email: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    const addMember = (email: string) => {
      if (formData.members.length >= 4) {
        setErrors(prev => ({
          ...prev,
          members: 'You can add up to 4 members max.',
        }));
        return;
      }

      const trimmed = email.trim();

      if (!trimmed) {
        setErrors(prev => ({
          ...prev,
          email: 'Please enter an email address.',
        }));
        return;
      }

      if (!isValidEmail(trimmed)) {
        setErrors(prev => ({
          ...prev,
          email: 'Please enter a valid email address.',
        }));
        return;
      }

      if (formData.members.some(member => member.email === trimmed)) {
        setErrors(prev => ({
          ...prev,
          email: 'This email is already added to the team.',
        }));
        return;
      }

      const newMember: TeamMember = {
        id: Date.now().toString(),
        email: trimmed,
        role: 'MEMBER',
      };
      handleFormDataChange('members', [...formData.members, newMember]);
      setSearchQuery('');
      setErrors(prev => ({ ...prev, email: undefined }));
    };

    const removeMember = (id: string) => {
      const updatedMembers = formData.members.filter(
        member => member.id !== id
      );
      handleFormDataChange('members', updatedMembers);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addMember(searchQuery);
      }
    };

    const handleEmailInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);

      // Clear email error when user starts typing
      if (errors.email) {
        setErrors(prev => ({ ...prev, email: undefined }));
      }
    };

    const validateForm = (): boolean => {
      const newErrors: { members?: string; email?: string } = {};

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    React.useImperativeHandle(ref, () => ({
      validate: validateForm,
    }));

    return (
      <div className='min-h-full space-y-8 text-white'>
        <div className='space-y-4'>
          <div className='flex items-center space-x-4'>
            <div className='flex h-12 w-12 items-center justify-center rounded-full border-none p-0'>
              <Image
                src='/avatar.png'
                className='h-full w-full object-cover'
                alt='User'
                width={43}
                height={43}
              />
            </div>
            <div>
              <h3 className='text-lg font-medium text-white'>Creator Name</h3>
              <span className='text-sm font-medium text-[#FFA500]'>OWNER</span>
            </div>
          </div>
        </div>

        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label className='text-white'>
              Invite members to your team by email (optional)
            </Label>
            <p className='text-sm text-[#B5B5B5]'>
              Team members will receive invite links via email to join your
              project.
            </p>
          </div>

          <div className='space-y-4'>
            <div className='relative'>
              <div className='focus-within:border-primary flex h-[48px] max-w-full items-center gap-2 overflow-x-hidden rounded-[12px] border border-[#2B2B2B] bg-[#101010] px-4 focus-within:ring-0'>
                {formData.members.map(member => (
                  <div
                    key={member.id}
                    className='flex items-center space-x-1 rounded-full bg-[#A7F95014] py-1.5 pr-1.5 pl-2'
                  >
                    <span className='text-primary text-sm'>{member.email}</span>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      onClick={() => removeMember(member.id)}
                      className='ml-1 h-[14px] w-[14px]'
                    >
                      <svg
                        width='14'
                        height='14'
                        viewBox='0 0 14 14'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                      >
                        <rect width='14' height='14' rx='7' fill='#99FF2D' />
                        <path
                          d='M10 4L4 10M4 4L10 10'
                          stroke='#030303'
                          stroke-width='1.4'
                          stroke-linecap='round'
                          stroke-linejoin='round'
                        />
                      </svg>
                    </Button>
                  </div>
                ))}

                <input
                  type='email'
                  placeholder={'Enter email address'}
                  value={searchQuery}
                  onChange={handleEmailInputChange}
                  onKeyPress={handleKeyPress}
                  className='min-w-[200px] flex-1 bg-transparent text-sm text-white placeholder:text-[#919191] focus:outline-none'
                />
              </div>
            </div>

            {searchQuery.trim() && formData.members.length < 4 && (
              <Button
                type='button'
                variant='outline'
                onClick={() => addMember(searchQuery)}
                className='hover:border-primary border-primary/10 text-primary hover:text-primary hover:bg-primary/10 bg-transparent text-sm'
              >
                Add "{searchQuery}"
              </Button>
            )}
          </div>

          {errors.members && (
            <p className='text-sm text-red-500'>{errors.members}</p>
          )}
          {errors.email && (
            <p className='text-sm text-red-500'>{errors.email}</p>
          )}
        </div>
      </div>
    );
  }
);

Team.displayName = 'Team';

export default Team;
