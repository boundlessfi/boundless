'use client';

import React, { useState } from 'react';
import { Users, X, UserPlus } from 'lucide-react';

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

export default function TeamInfo({ formData, updateFormData }: TeamInfoProps) {
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [roleInput, setRoleInput] = useState('MEMBER');
  const [twitterInput, setTwitterInput] = useState('');
  const [linkedinInput, setLinkedinInput] = useState('');
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

    if (!nameInput.trim()) {
      setError('Please enter a name.');
      return;
    }

    updateFormData({
      team: [
        ...members,
        {
          id: Date.now().toString(),
          name: nameInput.trim(),
          email: trimmed,
          role: roleInput,
          twitter: twitterInput.trim() || undefined,
          linkedin: linkedinInput.trim() || undefined,
        },
      ],
    });
    setEmailInput('');
    setNameInput('');
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
    <div className='flex flex-col gap-10'>
      <div className='flex flex-col gap-2'>
        <h2 className='text-4xl font-black tracking-tight text-white'>
          Who's building this?
        </h2>
        <p className='text-sm font-medium text-white/30'>
          Add your team members. These details will be public on your project
          profile.
        </p>
      </div>

      <div className='flex flex-col gap-8'>
        {/* Creator row (always shown) */}
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

        {/* Member list */}
        <div className='flex flex-col gap-4'>
          {members.map(m => (
            <div
              key={m.id}
              className='group relative flex items-center gap-4 rounded-2xl border border-white/5 bg-white/2 p-4 transition-all hover:bg-white/4'
            >
              <div className='bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg'>
                <Users className='text-primary h-4 w-4' />
              </div>
              <div className='flex-1'>
                <div className='flex items-center gap-2'>
                  <p className='text-sm font-bold text-white'>{m.name}</p>
                  <span className='text-primary text-[8px] font-black tracking-widest uppercase'>
                    {m.role}
                  </span>
                </div>
                <p className='text-xs font-medium text-white/30'>{m.email}</p>
              </div>
              <button
                type='button'
                onClick={() => removeMember(m.id)}
                className='p-2 text-white/20 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-400'
              >
                <X className='h-4 w-4' />
              </button>
            </div>
          ))}
        </div>

        {/* Add Member Form */}
        {members.length < 4 && (
          <div className='flex flex-col gap-6 rounded-2xl border border-white/5 bg-white/2 p-6'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <div className='flex flex-col gap-2'>
                <label className='text-[10px] font-bold tracking-[0.15em] text-white/40 uppercase'>
                  Full Name
                </label>
                <input
                  type='text'
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  placeholder='Alex Rivier'
                  className='focus:border-primary/30 h-12 rounded-xl border border-white/5 bg-[#0a0a0a] px-4 text-sm text-white outline-none'
                />
              </div>
              <div className='flex flex-col gap-2'>
                <label className='text-[10px] font-bold tracking-[0.15em] text-white/40 uppercase'>
                  Email Address
                </label>
                <input
                  type='email'
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  placeholder='alex@example.com'
                  className='focus:border-primary/30 h-12 rounded-xl border border-white/5 bg-[#0a0a0a] px-4 text-sm text-white outline-none'
                />
              </div>
            </div>

            <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
              <div className='flex flex-col gap-2'>
                <label className='text-[10px] font-bold tracking-[0.15em] text-white/40 uppercase'>
                  Role
                </label>
                <select
                  value={roleInput}
                  onChange={e => setRoleInput(e.target.value)}
                  className='focus:border-primary/30 h-12 appearance-none rounded-xl border border-white/5 bg-[#0a0a0a] px-4 text-sm text-white outline-none'
                >
                  <option value='MEMBER'>Member</option>
                  <option value='LEAD'>Lead Developer</option>
                  <option value='DESIGNER'>Designer</option>
                  <option value='PRODUCT'>Product Manager</option>
                  <option value='OTHER'>Other</option>
                </select>
              </div>
              <div className='flex flex-col gap-2'>
                <label className='text-[10px] font-bold tracking-[0.15em] text-white/40 uppercase'>
                  Twitter (Optional)
                </label>
                <input
                  type='text'
                  value={twitterInput}
                  onChange={e => setTwitterInput(e.target.value)}
                  placeholder='@username'
                  className='focus:border-primary/30 h-12 rounded-xl border border-white/5 bg-[#0a0a0a] px-4 text-sm text-white outline-none'
                />
              </div>
              <div className='flex flex-col gap-2'>
                <label className='text-[10px] font-bold tracking-[0.15em] text-white/40 uppercase'>
                  LinkedIn (Optional)
                </label>
                <input
                  type='text'
                  value={linkedinInput}
                  onChange={e => setLinkedinInput(e.target.value)}
                  placeholder='linkedin.com/in/…'
                  className='focus:border-primary/30 h-12 rounded-xl border border-white/5 bg-[#0a0a0a] px-4 text-sm text-white outline-none'
                />
              </div>
            </div>

            {error && (
              <p className='text-xs font-medium text-red-400'>{error}</p>
            )}

            <button
              type='button'
              onClick={addMember}
              className='bg-primary/10 border-primary/20 text-primary hover:bg-primary flex h-12 w-full items-center justify-center gap-2 rounded-xl border text-[11px] font-black tracking-widest uppercase transition-all hover:text-black'
            >
              <UserPlus className='h-4 w-4' />
              Add Member
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
