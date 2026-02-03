'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, X, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TeamMember } from '@/features/projects/types';

interface TeamSectionProps {
  team: TeamMember[];
  onChange: (team: TeamMember[]) => void;
}

const roles = [
  { value: 'FOUNDER', label: 'Founder' },
  { value: 'CO_FOUNDER', label: 'Co-Founder' },
  { value: 'DEVELOPER', label: 'Developer' },
  { value: 'DESIGNER', label: 'Designer' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'COMMUNITY', label: 'Community Manager' },
  { value: 'ADVISOR', label: 'Advisor' },
  { value: 'OTHER', label: 'Other' },
];

// Collapsible Team Member Item
const CollapsibleTeamMember = ({
  member,
  index,
  onUpdate,
  onRemove,
}: {
  member: TeamMember;
  index: number;
  onUpdate: (index: number, field: keyof TeamMember, value: any) => void;
  onRemove: (index: number) => void;
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div className='overflow-hidden rounded-lg border border-[#2B2B2B] bg-[#101010]'>
      {/* Header */}
      <div className='flex items-center justify-between p-4'>
        <button
          type='button'
          onClick={() => setIsCollapsed(!isCollapsed)}
          className='flex flex-1 items-center gap-3 text-left'
        >
          <User className='h-5 w-5 text-[#99FF2D]' />
          <div className='flex-1'>
            <p className='font-medium text-white'>{member.name}</p>
            <p className='text-xs text-[#B5B5B5]'>{member.email}</p>
          </div>
          <svg
            width='16'
            height='16'
            viewBox='0 0 16 16'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
            className={cn(
              'text-[#B5B5B5] transition-transform duration-200',
              isCollapsed ? '-rotate-90' : 'rotate-0'
            )}
          >
            <path
              d='M4 6L8 10L12 6'
              stroke='currentColor'
              strokeWidth='1.5'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        </button>
        <Button
          type='button'
          onClick={() => onRemove(index)}
          variant='ghost'
          size='sm'
          className='text-primary/32 bg-primary/8 hover:bg-primary/8 hover:text-primary ml-2 h-6 w-6 rounded-full p-0'
        >
          <X className='h-4 w-4' />
        </Button>
      </div>

      {/* Collapsible Content */}
      {!isCollapsed && (
        <div className='space-y-4 border-t border-[#2B2B2B] px-4 pb-4'>
          <div className='grid grid-cols-1 gap-4 pt-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label className='text-sm text-[#B5B5B5]'>Name</Label>
              <Input
                value={member.name}
                onChange={e => onUpdate(index, 'name', e.target.value)}
                placeholder='John Doe'
                className='focus-visible:border-primary border-[#2B2B2B] bg-[#0A0A0A] text-white placeholder:text-[#919191]'
              />
            </div>

            <div className='space-y-2'>
              <Label className='text-sm text-[#B5B5B5]'>Email</Label>
              <Input
                type='email'
                value={member.email}
                onChange={e => onUpdate(index, 'email', e.target.value)}
                placeholder='john@example.com'
                className='focus-visible:border-primary border-[#2B2B2B] bg-[#0A0A0A] text-white placeholder:text-[#919191]'
              />
            </div>
          </div>

          <div className='space-y-2'>
            <Label className='text-sm text-[#B5B5B5]'>Role</Label>
            <div className='grid grid-cols-2 gap-2 md:grid-cols-4'>
              {roles.map(role => (
                <button
                  key={role.value}
                  type='button'
                  onClick={() => onUpdate(index, 'role', role.value)}
                  className={cn(
                    'rounded-lg border px-3 py-2 text-sm transition-all',
                    member.role === role.value
                      ? 'border-[#A7F950] bg-[#A7F95014] text-[#A7F950]'
                      : 'border-[#2B2B2B] bg-[#0A0A0A] text-white hover:border-[#A7F950]/50'
                  )}
                >
                  {role.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export function TeamSection({ team, onChange }: TeamSectionProps) {
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: 'DEVELOPER' as const,
  });

  const addMember = () => {
    if (!newMember.name.trim() || !newMember.email.trim()) return;

    const member: TeamMember = {
      name: newMember.name.trim(),
      role: newMember.role,
      email: newMember.email.trim(),
      image: undefined,
      username: undefined,
    };

    onChange([...team, member]);
    setNewMember({ name: '', email: '', role: 'DEVELOPER' });
  };

  const updateMember = (index: number, field: keyof TeamMember, value: any) => {
    const updated = [...team];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeMember = (index: number) => {
    const updated = team.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className='space-y-6'>
      {/* Info */}
      <div className='space-y-2'>
        <p className='text-sm text-[#B5B5B5]'>
          Invite members to your team by email (optional)
        </p>
      </div>

      {/* Add New Member Form */}
      <div className='space-y-4 rounded-lg border border-[#2B2B2B] bg-[#101010] p-4'>
        <h4 className='font-medium text-white'>Add Team Member</h4>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div className='space-y-2'>
            <Label className='text-sm text-[#B5B5B5]'>Name</Label>
            <Input
              value={newMember.name}
              onChange={e =>
                setNewMember(prev => ({ ...prev, name: e.target.value }))
              }
              placeholder='John Doe'
              className='focus-visible:border-primary border-[#2B2B2B] bg-[#0A0A0A] text-white placeholder:text-[#919191]'
            />
          </div>

          <div className='space-y-2'>
            <Label className='text-sm text-[#B5B5B5]'>Email</Label>
            <Input
              type='email'
              value={newMember.email}
              onChange={e =>
                setNewMember(prev => ({ ...prev, email: e.target.value }))
              }
              placeholder='john@example.com'
              className='focus-visible:border-primary border-[#2B2B2B] bg-[#0A0A0A] text-white placeholder:text-[#919191]'
            />
          </div>
        </div>

        <Button
          type='button'
          onClick={addMember}
          disabled={!newMember.name.trim() || !newMember.email.trim()}
          className='border-primary hover:text-primary hover:bg-primary/5 border bg-transparent font-normal text-[#99FF2D]'
        >
          <Plus className='mr-2 h-4 w-4' />
          Add Member
        </Button>
      </div>

      {/* Team Members List */}
      {team.length > 0 && (
        <div className='space-y-3'>
          <h4 className='font-medium text-white'>
            Current Team ({team.length})
          </h4>
          <div className='space-y-2'>
            {team.map((member, index) => (
              <CollapsibleTeamMember
                key={index}
                member={member}
                index={index}
                onUpdate={updateMember}
                onRemove={removeMember}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
