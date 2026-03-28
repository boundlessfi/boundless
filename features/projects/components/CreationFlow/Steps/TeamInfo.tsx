'use client';

import React, { useState } from 'react';
import { Users, X, UserPlus, AlertCircle } from 'lucide-react';
import { CreationInput } from '../CreationUI';
import { cn } from '@/lib/utils';

interface TeamMemberLocal {
  id: string;
  name: string;
  email: string;
  role: string;
  twitter?: string;
  linkedin?: string;
}

interface TeamInfoProps {
  formData: any;
  updateFormData: (updates: any) => void;
}

const ROLES = [
  { value: 'MEMBER', label: 'Member' },
  { value: 'LEAD', label: 'Lead Developer' },
  { value: 'DESIGNER', label: 'Designer' },
  { value: 'PRODUCT', label: 'Product Manager' },
  { value: 'OTHER', label: 'Other' },
];

export default function TeamInfo({ formData, updateFormData }: TeamInfoProps) {
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [roleInput, setRoleInput] = useState('MEMBER');
  const [twitterInput, setTwitterInput] = useState('');
  const [linkedinInput, setLinkedinInput] = useState('');
  const [error, setError] = useState('');

  const members: TeamMemberLocal[] = formData.team || [];

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const addMember = () => {
    const trimmedEmail = emailInput.trim();
    const trimmedName = nameInput.trim();

    if (!trimmedName) {
      setError('Please enter a name.');
      return;
    }
    if (!trimmedEmail) {
      setError('Please enter an email address.');
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (members.some(m => m.email === trimmedEmail)) {
      setError('This email is already added.');
      return;
    }
    if (members.length >= 4) {
      setError('You can add up to 4 members.');
      return;
    }

    updateFormData({
      team: [
        ...members,
        {
          id: Date.now().toString(),
          name: trimmedName,
          email: trimmedEmail,
          role: roleInput,
          twitter: twitterInput.trim() || undefined,
          linkedin: linkedinInput.trim() || undefined,
        },
      ],
    });
    setNameInput('');
    setEmailInput('');
    setRoleInput('MEMBER');
    setTwitterInput('');
    setLinkedinInput('');
    setError('');
  };

  const removeMember = (id: string) => {
    updateFormData({ team: members.filter(m => m.id !== id) });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addMember();
    }
  };

  return (
    <div className='flex flex-col gap-8 sm:gap-10'>
      <div className='flex flex-col gap-1'>
        <h2 className='text-xl font-semibold text-white sm:text-2xl'>
          Who&apos;s building this?
        </h2>
        <p className='text-xs text-white/40 sm:text-sm'>
          Add your team members. These details will be public on your project
          profile.
        </p>
      </div>

      <div className='flex flex-col gap-5'>
        {/* Creator row (always shown) */}
        <div className='flex items-center gap-3 rounded-xl border border-white/10 bg-white/3 p-3 sm:p-4'>
          <div className='bg-primary/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10'>
            <Users className='text-primary h-3.5 w-3.5 sm:h-4 sm:w-4' />
          </div>
          <div>
            <p className='text-sm font-medium text-white'>You</p>
            <span className='text-primary text-xs font-medium'>Owner</span>
          </div>
        </div>

        {/* Member list */}
        {members.map(m => (
          <div
            key={m.id}
            className='group flex items-center gap-3 rounded-xl border border-white/10 bg-white/3 p-3 transition-colors hover:border-white/15 sm:p-4'
          >
            <div className='bg-primary/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10'>
              <Users className='text-primary h-3.5 w-3.5 sm:h-4 sm:w-4' />
            </div>
            <div className='min-w-0 flex-1'>
              <div className='flex items-center gap-2'>
                <p className='truncate text-sm font-medium text-white'>
                  {m.name}
                </p>
                <span className='text-primary bg-primary/10 rounded px-1.5 py-0.5 text-[10px] font-medium'>
                  {ROLES.find(r => r.value === m.role)?.label ?? m.role}
                </span>
              </div>
              <p className='text-xs text-white/40'>{m.email}</p>
            </div>
            <button
              type='button'
              onClick={() => removeMember(m.id)}
              className='rounded-md p-1.5 text-white/30 transition-all hover:bg-red-500/10 hover:text-red-400 sm:text-white/20 sm:opacity-0 sm:group-hover:opacity-100'
            >
              <X className='h-3.5 w-3.5' />
            </button>
          </div>
        ))}

        {/* Add member form */}
        {members.length < 4 && (
          <div
            className='flex flex-col gap-4 rounded-xl border border-dashed border-white/10 p-3 sm:p-5'
            onKeyDown={handleKeyDown}
          >
            <p className='text-sm font-medium text-white/50'>
              Add a team member
            </p>

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <CreationInput
                label='Full Name'
                placeholder='Alex Rivier'
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
              />
              <CreationInput
                label='Email Address'
                placeholder='alex@example.com'
                type='email'
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
              />
            </div>

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              <div className='flex flex-col gap-1.5'>
                <label className='text-[13px] font-medium text-white/50'>
                  Role
                </label>
                <select
                  value={roleInput}
                  onChange={e => setRoleInput(e.target.value)}
                  className='focus:border-primary/40 h-10 rounded-lg border border-white/10 bg-white/4 px-3.5 text-sm text-white transition-colors outline-none hover:border-white/20'
                >
                  {ROLES.map(r => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
              <CreationInput
                label='Twitter'
                placeholder='@username'
                value={twitterInput}
                onChange={e => setTwitterInput(e.target.value)}
              />
              <CreationInput
                label='LinkedIn'
                placeholder='linkedin.com/in/...'
                value={linkedinInput}
                onChange={e => setLinkedinInput(e.target.value)}
              />
            </div>

            {error && (
              <p className='flex items-center gap-1 text-xs text-red-400'>
                <AlertCircle className='h-3 w-3 shrink-0' />
                {error}
              </p>
            )}

            <button
              type='button'
              onClick={addMember}
              className='border-primary/20 bg-primary/6 text-primary hover:bg-primary/15 flex h-9 w-full items-center justify-center gap-2 rounded-lg border text-sm font-medium transition-colors'
            >
              <UserPlus className='h-3.5 w-3.5' />
              Add Member
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
