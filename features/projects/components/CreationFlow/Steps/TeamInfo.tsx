'use client';

import React, { useState } from 'react';
import { Users, X, UserPlus } from 'lucide-react';

interface TeamMemberLocal {
  id: string;
  email: string;
  role: string;
}

interface TeamInfoProps {
  formData: any;
  updateFormData: (updates: any) => void;
}

export default function TeamInfo({ formData, updateFormData }: TeamInfoProps) {
  const [emailInput, setEmailInput] = useState('');
  const [error, setError] = useState('');

  const members: TeamMemberLocal[] = formData.team || [];

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const addMember = () => {
    const trimmed = emailInput.trim();
    if (!trimmed) {
      setError('Please enter an email address.');
      return;
    }
    if (!isValidEmail(trimmed)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (members.some(m => m.email === trimmed)) {
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
        { id: Date.now().toString(), email: trimmed, role: 'MEMBER' },
      ],
    });
    setEmailInput('');
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
    <div className='flex flex-col gap-10'>
      <div className='flex flex-col gap-2'>
        <h2 className='text-4xl font-black tracking-tight text-white'>
          Who's building this?
        </h2>
        <p className='text-sm font-medium text-white/30'>
          Invite team members by email. They'll receive an invite to join the
          project.
        </p>
      </div>

      <div className='flex flex-col gap-6'>
        {/* Creator row */}
        <div className='flex items-center gap-4 rounded-2xl border border-white/5 bg-white/2 p-5'>
          <div className='bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl'>
            <Users className='text-primary h-5 w-5' />
          </div>
          <div>
            <p className='text-sm font-bold text-white'>You</p>
            <span className='text-primary text-[10px] font-black tracking-[0.2em] uppercase'>
              Owner
            </span>
          </div>
        </div>

        {/* Invite input */}
        <div className='flex flex-col gap-3'>
          <label className='text-[10px] font-bold tracking-[0.15em] text-white/40 uppercase'>
            Invite Members by Email (Optional, max 4)
          </label>

          <div
            className={`flex min-h-[56px] flex-wrap items-center gap-2 rounded-2xl border ${error ? 'border-red-500/30 bg-red-500/5' : 'border-white/5 bg-white/2'} focus-within:border-primary/30 px-4 py-3 transition-all focus-within:bg-white/4`}
          >
            {members.map(m => (
              <span
                key={m.id}
                className='bg-primary/10 flex items-center gap-1.5 rounded-xl py-1.5 pr-1.5 pl-3'
              >
                <span className='text-primary text-xs font-bold'>
                  {m.email}
                </span>
                <button
                  type='button'
                  onClick={() => removeMember(m.id)}
                  className='bg-primary/20 text-primary hover:bg-primary flex h-4 w-4 items-center justify-center rounded-full transition-colors hover:text-black'
                >
                  <X className='h-2.5 w-2.5' />
                </button>
              </span>
            ))}
            {members.length < 4 && (
              <input
                type='email'
                value={emailInput}
                onChange={e => {
                  setEmailInput(e.target.value);
                  setError('');
                }}
                onKeyDown={handleKeyDown}
                placeholder={
                  members.length === 0
                    ? 'Enter email address and press Enter'
                    : 'Add another...'
                }
                className='min-w-[220px] flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/20'
              />
            )}
          </div>

          {error && (
            <p className='text-[10px] font-medium text-red-400'>{error}</p>
          )}

          {emailInput.trim() && members.length < 4 && (
            <button
              type='button'
              onClick={addMember}
              className='border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/40 flex w-fit items-center gap-2 rounded-xl border px-4 py-2.5 text-[11px] font-black tracking-widest uppercase transition-all'
            >
              <UserPlus className='h-3.5 w-3.5' />
              Add "{emailInput}"
            </button>
          )}

          <p className='text-[10px] font-medium text-white/20'>
            {members.length}/4 team members added • Press Enter or click Add to
            confirm.
          </p>
        </div>
      </div>
    </div>
  );
}
