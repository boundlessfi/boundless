'use client';

import { useState, useEffect, useCallback } from 'react';
import { BoundlessButton } from '@/components/buttons';
import { useOrganization } from '@/lib/providers/OrganizationProvider';
import { BetterAuthMember } from '@/lib/providers/organization-types';
import { removeBetterAuthMember } from '@/lib/api/better-auth-organization';
import { authClient } from '@/lib/auth-client';
import EmailInviteSection from './MembersTab/EmailInviteSection';
import TeamManagementSection from './MembersTab/TeamManagementSection';
import { toast } from 'sonner';
import { X, Mail, Clock, Loader2 } from 'lucide-react';
import { Role } from '@/lib/api/organization';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Member {
  id: string;
  userId: string;
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
    assignRole,
    isLoading,
    isOwner,
    refreshOrganization,
    lastUpdated,
  } = useOrganization();

  const [userIsOwner, setUserIsOwner] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  useEffect(() => {
    const checkUserIsOwner = async () => {
      const checkIsOwner = await isOwner(activeOrgId || undefined);
      setUserIsOwner(checkIsOwner);
    };
    checkUserIsOwner();
  }, [activeOrgId, isOwner, lastUpdated]);

  const [currentUserRole, setCurrentUserRole] = useState<
    'owner' | 'admin' | 'member' | null
  >(null);

  // Fetch members using the new Better Auth API
  const fetchMembers = useCallback(async () => {
    if (!activeOrgId) return;

    setLoadingMembers(true);
    try {
      // Get current user to determine permissions
      const { data: sessionData } = await authClient.getSession();
      const currentUserId = sessionData?.user?.id;

      const { data, error } = await authClient.organization.listMembers({
        query: {
          organizationId: activeOrgId,
          limit: 100,
          offset: 0,
          sortBy: 'createdAt',
          sortDirection: 'desc',
        },
      });

      if (error) {
        toast.error('Failed to load members');
        return;
      }

      // Transform API response to Member interface
      const transformedMembers: Member[] = (data?.members || []).map(
        (member: BetterAuthMember) => ({
          id: member.id,
          userId: member.userId,
          name: member.user.name || member.user.email,
          email: member.user.email,
          avatar: member.user.image,
          role: member.role as 'owner' | 'admin' | 'member',
          joinedAt: member.createdAt.toISOString(),
          status: 'active' as const,
        })
      );

      if (currentUserId) {
        const currentUserMember = transformedMembers.find(
          m => m.userId === currentUserId
        );
        setCurrentUserRole(currentUserMember?.role || null);
      }

      setMembers(transformedMembers);
    } catch {
      toast.error('Failed to load members');
    } finally {
      setLoadingMembers(false);
    }
  }, [activeOrgId]);

  useEffect(() => {
    if (activeOrgId) {
      fetchMembers();
    }
  }, [activeOrgId, fetchMembers, lastUpdated]);

  const [inviteEmails, setInviteEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState('');
  const [hasUserChanges, setHasUserChanges] = useState(false);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loadingInvitations, setLoadingInvitations] = useState(false);
  const [cancelingInvitation, setCancelingInvitation] = useState<string | null>(
    null
  );

  const fetchInvitations = useCallback(async () => {
    if (!activeOrgId) return;
    const { data, error } = await authClient.organization.listInvitations({
      query: {
        organizationId: activeOrgId || '',
      },
    });
    if (error) {
      toast.error(error.message);
    }
    setInvitations(data || []);
  }, [activeOrgId]);

  // Fetch invitations when component mounts or activeOrg changes
  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  const handleInvite = async () => {
    setLoadingInvitations(true);
    if (inviteEmails.length > 0 && activeOrgId) {
      // await inviteMember(activeOrgId, inviteEmails);
      // setInviteEmails([]);
      // setEmailInput('');
      for (const email of inviteEmails) {
        const { error } = await authClient.organization.inviteMember({
          email,
          role: 'member',
          organizationId: activeOrgId,
          resend: true,
        });
        if (error) {
          toast.error(error.message);
        }
        setInviteEmails([]);
        setEmailInput('');
      }
      await fetchInvitations();

      // Refresh members list in case any invites were auto-accepted
      await fetchMembers();
    }
    setLoadingInvitations(false);
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    if (!activeOrgId) return;
    const member = members.find(m => m.id === memberId);
    if (!member) return;

    try {
      await assignRole(activeOrgId, member.id, [newRole as Role]);
      await fetchMembers();
      toast.success(`Member role updated to ${newRole}`);
    } catch (error) {
      toast.error(
        `Failed to update member role: ${error instanceof Error ? error.message : String(error)}`
      );
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

        // Update local state immediately for better UX
        setMembers(prev => prev.filter(m => m.id !== memberId));

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
    } catch {
      const msg = 'Failed to remove member';
      toast.error(msg);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    setCancelingInvitation(invitationId);
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

    try {
      const { error } = await authClient.organization.cancelInvitation({
        invitationId,
      });
      if (error) {
        toast.error(error.message);
      }
      await fetchInvitations();
      toast.success('Invitation cancelled successfully');
    } catch {
      toast.error('Failed to cancel invitation');
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
      toast.success('Member changes saved successfully');
    } catch {
      toast.error('Failed to save member changes');
    }
  };
  const loadingui = loadingMembers || loadingInvitations;
  if (loadingui) {
    return (
      <div className='relative h-[calc(100vh-300px)] space-y-8'>
        {loadingui && (
          <div className='absolute top-0 right-0 bottom-0 left-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-sm'>
            <LoadingSpinner size='lg' className='z-20 text-white' />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className='relative space-y-8'>
      <EmailInviteSection
        inviteEmails={inviteEmails}
        setInviteEmails={setInviteEmails}
        emailInput={emailInput}
        setEmailInput={setEmailInput}
        onInvite={handleInvite}
        loading={loadingInvitations}
      />

      {/* Pending Invitations Section */}
      {activeOrgId && (
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h3 className='text-lg font-semibold text-white'>
              Pending Invitations
            </h3>
            {loadingInvitations && (
              <span className='text-sm text-zinc-400'>Loading...</span>
            )}
          </div>
          {invitations?.filter(inv => inv.status === 'pending').length > 0 ? (
            <div className='space-y-2'>
              {invitations
                .filter(inv => inv.status === 'pending')
                .map(invitation => (
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
                        disabled={
                          cancelingInvitation === invitation.id ||
                          invitation.status === 'canceled'
                        }
                        className='flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50'
                        title='Cancel invitation'
                      >
                        {cancelingInvitation === invitation.id ? (
                          <>
                            <Loader2 className='h-4 w-4 animate-spin' />
                            Canceling...
                          </>
                        ) : (
                          <>
                            <X className='h-4 w-4' />
                            Cancel
                          </>
                        )}
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

      {/* <PermissionsTable /> */}

      {loadingMembers ? (
        <div className='rounded-lg border border-zinc-800 bg-zinc-900/50 p-8 text-center'>
          <div className='text-sm text-zinc-400'>Loading members...</div>
        </div>
      ) : (
        <TeamManagementSection
          members={members}
          onRoleChange={handleRoleChange}
          onRemoveMember={handleRemoveMember}
          activeOrg={activeOrg}
          canManageTeam={
            currentUserRole === 'owner' || currentUserRole === 'admin'
          }
        />
      )}

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
