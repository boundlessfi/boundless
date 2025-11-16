'use client';

import { useState, useMemo } from 'react';
import { BoundlessButton } from '@/components/buttons';
import { useOrganization } from '@/lib/providers/OrganizationProvider';
import EmailInviteSection from './MembersTab/EmailInviteSection';
import PermissionsTable from './MembersTab/PermissionsTable';
import TeamManagementSection from './MembersTab/TeamManagementSection';
import { toast } from 'sonner';

interface Member {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
  status: 'active' | 'pending' | 'suspended';
}

interface MembersTabProps {
  onSave?: (members: Member[]) => void;
}

export default function MembersTab({ onSave }: MembersTabProps) {
  const {
    activeOrg,
    activeOrgId,
    updateOrganizationMembers,
    inviteMember,
    removeMember,
    assignRole,
    isLoading,
  } = useOrganization();

  const members: Member[] = useMemo(() => {
    const emails = activeOrg?.members ?? [];
    return emails.map((email, idx) => ({
      id: `${idx}-${email}`,
      name: email.split('@')[0] || email,
      email,
      role: 'member',
      joinedAt: new Date().toISOString(),
      status: 'active',
    }));
  }, [activeOrg?.members]);
  const [inviteEmails, setInviteEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState('');
  const [hasUserChanges, setHasUserChanges] = useState(false);

  const handleInvite = () => {
    if (inviteEmails.length > 0 && activeOrgId) {
      inviteMember(activeOrgId, inviteEmails);
      setInviteEmails([]);
      setEmailInput('');
    }
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    if (!activeOrgId) return;
    const member = members.find(m => m.id === memberId);
    if (!member) return;

    try {
      const action = newRole === 'admin' ? 'promote' : 'demote';
      await assignRole(activeOrgId, member.email, action);
      setHasUserChanges(true);
      toast.success(`Member role updated to ${newRole}`);
    } catch (error) {
      // Handle error (show toast, etc.)
      const msg = error instanceof Error ? error.message : String(error);
      toast.error(`Failed to update member role: ${msg}`);
    }
  };

  const handleRemoveMember = (memberId: string) => {
    if (!activeOrgId) return;
    const m = members.find(x => x.id === memberId);
    if (!m) return;
    removeMember(activeOrgId, m.email);
  };

  const handleSave = async () => {
    if (!activeOrgId) return;
    const emails = members.map(m => m.email);
    try {
      await updateOrganizationMembers(activeOrgId, emails);
      onSave?.(members);
      setHasUserChanges(false);
    } catch {}
  };

  return (
    <div className='space-y-8'>
      <EmailInviteSection
        inviteEmails={inviteEmails}
        setInviteEmails={setInviteEmails}
        emailInput={emailInput}
        setEmailInput={setEmailInput}
        onInvite={handleInvite}
      />

      <PermissionsTable />

      <TeamManagementSection
        members={members}
        onRoleChange={handleRoleChange}
        onRemoveMember={handleRemoveMember}
        activeOrg={activeOrg}
      />

      <div className='space-y-2'>
        {hasUserChanges && (
          <div className='flex items-center gap-2 text-sm text-amber-400'>
            <div className='h-2 w-2 rounded-full bg-amber-400' />
            You have unsaved changes
          </div>
        )}
        <BoundlessButton
          onClick={handleSave}
          className='w-full'
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </BoundlessButton>
      </div>
    </div>
  );
}
