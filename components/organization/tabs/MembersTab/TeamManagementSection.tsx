'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import MemberCard from './MemberCard';
import { Organization } from '@/lib/api/types';

interface Member {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
  status: 'active' | 'pending' | 'suspended';
}

interface TeamManagementSectionProps {
  members: Member[];
  onRoleChange: (memberId: string, newRole: string) => void;
  onRemoveMember: (memberId: string) => void;
  activeOrg?: Organization | null;
}

export default function TeamManagementSection({
  members,
  onRoleChange,
  onRemoveMember,
  activeOrg,
}: TeamManagementSectionProps) {
  const activeMembers = members.filter(member => member.status === 'active');
  const pendingMembers = members.filter(member => member.status === 'pending');
  const orgOwner = members.find(member => member.email === activeOrg?.owner);

  return (
    <div className='space-y-6 rounded-[12px] border border-gray-900 bg-[#101010] p-4'>
      <div>
        <h3 className='mb-3 text-sm text-white'>Manage Team</h3>
        <p className='text-sm text-gray-500 italic'>
          {members.length === 0
            ? "You're the only one here for now."
            : `${members.length} team member${members.length === 1 ? '' : 's'}`}
        </p>
      </div>

      <div className='space-y-4'>
        {orgOwner && (
          <div className='flex gap-3'>
            <Avatar className='h-12 w-12'>
              <AvatarImage src={orgOwner.avatar} alt={orgOwner.name} />
              <AvatarFallback>
                {orgOwner.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className='flex flex-col gap-0'>
              <h4 className='text-white'>{orgOwner.name}</h4>
              <p className='text-sm text-gray-500'>{orgOwner.email}</p>
              <span className='text-warning-600 text-xs leading-[120%] font-semibold tracking-[1.44px] uppercase'>
                Owner
              </span>
            </div>
          </div>
        )}

        {activeMembers.filter(member => member.email !== activeOrg?.owner)
          .length > 0 && (
          <div className='space-y-3'>
            {activeMembers
              .filter(member => member.email !== activeOrg?.owner)
              .map(member => (
                <MemberCard
                  key={member.id}
                  member={member}
                  onRoleChange={onRoleChange}
                  onRemoveMember={onRemoveMember}
                />
              ))}
          </div>
        )}

        {pendingMembers.length > 0 && (
          <div className='space-y-4'>
            <h4 className='mb-3 text-sm text-white italic'>Pending Invites</h4>
            {pendingMembers.map(member => (
              <div key={member.id} className='flex gap-3'>
                <Avatar className='h-12 w-12'>
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback>
                    {member.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className='flex flex-col gap-0'>
                  <h4 className='text-white'>{member.name}</h4>
                  <p className='text-sm text-gray-500'>{member.email}</p>
                  <span className='text-xs text-gray-500 italic'>
                    Pending invitation
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
