'use client';

import { useState, useMemo, useEffect } from 'react';
import { BoundlessButton } from '@/components/buttons';
import { useOrganization } from '@/lib/providers/OrganizationProvider';
import {
  removeBetterAuthMember,
  listBetterAuthInvitations,
  cancelBetterAuthInvitation,
} from '@/lib/api/better-auth-organization';
import EmailInviteSection from './MembersTab/EmailInviteSection';
import PermissionsTable from './MembersTab/PermissionsTable';
import TeamManagementSection from './MembersTab/TeamManagementSection';
import { toast } from 'sonner';
import { X, Mail, Clock } from 'lucide-react';

interface Member {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
  status: 'active' | 'pending' | 'suspended';
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: Date;
  createdAt?: Date;
  organizationId: string;
  inviterId: string;
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
    assignRole,
    isLoading,
    isOwner,
    refreshOrganization,
  } = useOrganization();

  const [userIsOwner, setUserIsOwner] = useState(false);
  useEffect(() => {
    const checkUserIsOwner = async () => {
      const checkIsOwner = await isOwner(activeOrgId || undefined);
      setUserIsOwner(checkIsOwner);
      console.log('userIsOwner', checkIsOwner);
    };
    checkUserIsOwner();
  }, [activeOrgId]);

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
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loadingInvitations, setLoadingInvitations] = useState(false);
  const [cancelingInvitation, setCancelingInvitation] = useState<string | null>(
    null
  );

  // Fetch invitations when component mounts or activeOrg changes
  useEffect(() => {
    const fetchInvitations = async () => {
      if (!activeOrg?.betterAuthOrgId) return;

      setLoadingInvitations(true);
      try {
        const data = await listBetterAuthInvitations(activeOrg.betterAuthOrgId);
        setInvitations(data || []);
      } catch (error) {
        console.error('Error fetching invitations:', error);
        toast.error('Failed to load invitations');
      } finally {
        setLoadingInvitations(false);
      }
    };

    fetchInvitations();
  }, [activeOrg?.betterAuthOrgId]);

  const handleInvite = async () => {
    if (inviteEmails.length > 0 && activeOrgId) {
      await inviteMember(activeOrgId, inviteEmails);
      setInviteEmails([]);
      setEmailInput('');

      // Refresh invitations list after sending new invites
      if (activeOrg?.betterAuthOrgId) {
        try {
          const data = await listBetterAuthInvitations(
            activeOrg.betterAuthOrgId
          );
          setInvitations(data || []);
        } catch (error) {
          console.error('Error refreshing invitations:', error);
        }
      }
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

  const handleRemoveMember = async (memberId: string) => {
    if (!activeOrgId) {
      toast.error('No organization selected');
      return;
    }

    // Check if user is owner
    const userIsOwner = await isOwner(activeOrgId);
    if (!userIsOwner) {
      toast.error('Only organization owners can remove members');
      return;
    }

    const member = members.find(x => x.id === memberId);
    if (!member) {
      toast.error('Member not found');
      return;
    }

    try {
      // Check if organization uses Better Auth
      if (activeOrg?.betterAuthOrgId) {
        // Use Better Auth API
        await removeBetterAuthMember(member.email, activeOrg.betterAuthOrgId);
        toast.success(`${member.email} has been removed from the organization`);
      } else {
        // Fallback to custom API for legacy organizations
        toast.error(
          'This organization does not support Better Auth member removal'
        );
        return;
      }

      // Refresh organization data to reflect changes
      await refreshOrganization();
      setHasUserChanges(true);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      toast.error(`Failed to remove member: ${msg}`);
      console.error('Error removing member:', error);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    if (!activeOrgId) {
      toast.error('No organization selected');
      return;
    }

    // Check if user is owner
    const userIsOwner = await isOwner(activeOrgId);
    if (!userIsOwner) {
      toast.error('Only organization owners can cancel invitations');
      return;
    }

    setCancelingInvitation(invitationId);
    try {
      await cancelBetterAuthInvitation(invitationId);
      toast.success('Invitation cancelled successfully');

      // Remove invitation from local state
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      toast.error(`Failed to cancel invitation: ${msg}`);
      console.error('Error canceling invitation:', error);
    } finally {
      setCancelingInvitation(null);
    }
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

      {/* Pending Invitations Section */}
      {activeOrg?.betterAuthOrgId && (
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h3 className='text-lg font-semibold text-white'>
              Pending Invitations
            </h3>
            {loadingInvitations && (
              <span className='text-sm text-zinc-400'>Loading...</span>
            )}
          </div>

          {invitations.length > 0 ? (
            <div className='space-y-2'>
              {invitations.map(invitation => (
                <div
                  key={invitation.id}
                  className='flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 p-4'
                >
                  <div className='flex items-center gap-3'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800'>
                      <Mail className='h-5 w-5 text-zinc-400' />
                    </div>
                    <div>
                      <p className='font-medium text-white'>
                        {invitation.email}
                      </p>
                      <div className='flex items-center gap-2 text-sm text-zinc-400'>
                        <span>Role: {invitation.role}</span>
                        <span>•</span>
                        <div className='flex items-center gap-1'>
                          <Clock className='h-3 w-3' />
                          <span>
                            Expires:{' '}
                            {new Date(
                              invitation.expiresAt
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {userIsOwner}
                  {userIsOwner && (
                    <button
                      onClick={() => handleCancelInvitation(invitation.id)}
                      disabled={cancelingInvitation === invitation.id}
                      className='flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50'
                      title='Cancel invitation'
                    >
                      <X className='h-4 w-4' />
                      {cancelingInvitation === invitation.id
                        ? 'Canceling...'
                        : 'Cancel'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className='rounded-lg border border-zinc-800 bg-zinc-900/50 p-8 text-center'>
              <Mail className='mx-auto mb-2 h-8 w-8 text-zinc-600' />
              <p className='text-sm text-zinc-400'>No pending invitations</p>
            </div>
          )}
        </div>
      )}

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
