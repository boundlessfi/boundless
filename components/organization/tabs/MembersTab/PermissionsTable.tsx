'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Check, X, Users2, Edit3, RotateCcw, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOrganization } from '@/lib/providers/OrganizationProvider';
import { toast } from 'sonner';
import { OrganizationPermissions } from '@/types/organization-permission';

interface PermissionConfig {
  key: keyof OrganizationPermissions;
  label: string;
  owner: boolean;
  admin: boolean | { value: boolean; note: string };
  member: boolean | { value: boolean; note: string };
  description?: string;
}

const defaultPermissionConfigs: PermissionConfig[] = [
  {
    key: 'canEditProfile',
    label: 'Create / edit organization profile',
    owner: true,
    admin: { value: true, note: 'edit only' },
    member: false,
    description: 'Modify organization name, logo, tagline, and about section',
  },
  {
    key: 'canManageHackathons',
    label: 'Create and manage hackathons and grants',
    owner: true,
    admin: true,
    member: false,
    description: 'Create new hackathons/grants and manage existing ones',
  },
  {
    key: 'canPublishHackathons',
    label: 'Publish hackathons / grants',
    owner: true,
    admin: false,
    member: false,
    description: 'Make hackathons and grants publicly visible',
  },
  {
    key: 'canViewAnalytics',
    label: 'View hackathons & analytics',
    owner: true,
    admin: true,
    member: true,
    description: 'Access analytics and view hackathon/grants data',
  },
  {
    key: 'canInviteMembers',
    label: 'Invite & remove members',
    owner: true,
    admin: true,
    member: false,
    description: 'Invite new members and remove existing members',
  },
  {
    key: 'canAssignRoles',
    label: 'Assign roles',
    owner: true,
    admin: false,
    member: false,
    description: 'Promote/demote members between admin and member roles',
  },
  {
    key: 'canPostAnnouncements',
    label: 'Post announcements & messages',
    owner: true,
    admin: false,
    member: false,
    description: 'Create organization-wide announcements',
  },
  {
    key: 'canComment',
    label: 'Comment / participate in discussions',
    owner: true,
    admin: true,
    member: true,
    description: 'Participate in organization discussions and comments',
  },
  {
    key: 'canAccessSubmissions',
    label: 'Access submissions (view/judge if assigned)',
    owner: true,
    admin: true,
    member: { value: true, note: 'view only, unless assigned as judge' },
    description: 'View hackathon submissions and judge if assigned',
  },
  {
    key: 'canDeleteOrganization',
    label: 'Delete organization',
    owner: true,
    admin: false,
    member: false,
    description: 'Permanently delete the organization',
  },
];

interface EditablePermissions {
  admin: Partial<OrganizationPermissions>;
  member: Partial<OrganizationPermissions>;
}

export default function PermissionsTable() {
  const [isEditing, setIsEditing] = useState(false);
  const [permissions, setPermissions] =
    useState<OrganizationPermissions | null>(null);
  const [editablePermissions, setEditablePermissions] =
    useState<EditablePermissions>({ admin: {}, member: {} });
  const [isCustom, setIsCustom] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const {
    activeOrgId,
    getOrganizationPermissions,
    updateOrganizationPermissions,
    resetOrganizationPermissions,
    isOwner,
  } = useOrganization();

  const loadPermissions = useCallback(async () => {
    if (!activeOrgId) return;

    try {
      setIsLoading(true);
      const response = await getOrganizationPermissions(activeOrgId);
      setPermissions(response.permissions);
      setIsCustom(response.isCustom);
      setCanEdit(response.canEdit);

      // Initialize editable permissions
      const adminPerms: Partial<OrganizationPermissions> = {};
      const memberPerms: Partial<OrganizationPermissions> = {};

      defaultPermissionConfigs.forEach(config => {
        const currentValue =
          response.permissions[config.key] ??
          (typeof config.admin === 'object'
            ? config.admin.value
            : config.admin);

        adminPerms[config.key] = currentValue;
        memberPerms[config.key] =
          response.permissions[config.key] ??
          (typeof config.member === 'object'
            ? config.member.value
            : config.member);
      });

      setEditablePermissions({ admin: adminPerms, member: memberPerms });
    } catch {
      toast.error('Failed to load permissions');
    } finally {
      setIsLoading(false);
    }
  }, [activeOrgId, getOrganizationPermissions]);

  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  const handleAdminPermissionChange = (
    permissionKey: keyof OrganizationPermissions,
    value: boolean
  ) => {
    if (!canEdit || !isEditing) return;

    setEditablePermissions(prev => ({
      ...prev,
      admin: {
        ...prev.admin,
        [permissionKey]: value,
      },
    }));
  };

  const handleMemberPermissionChange = (
    permissionKey: keyof OrganizationPermissions,
    value: boolean
  ) => {
    if (!canEdit || !isEditing) return;

    setEditablePermissions(prev => ({
      ...prev,
      member: {
        ...prev.member,
        [permissionKey]: value,
      },
    }));
  };

  const handleSave = async () => {
    if (!activeOrgId || !canEdit) return;

    setIsLoading(true);
    try {
      // Merge admin and member permissions
      const mergedPermissions: OrganizationPermissions = { ...permissions! };

      defaultPermissionConfigs.forEach(config => {
        const adminValue = editablePermissions.admin[config.key];
        const memberValue = editablePermissions.member[config.key];

        if (adminValue !== undefined) {
          mergedPermissions[config.key] = adminValue;
        }
        if (memberValue !== undefined && config.key in mergedPermissions) {
          mergedPermissions[config.key] = memberValue;
        }
      });

      await updateOrganizationPermissions(activeOrgId, mergedPermissions);
      setIsEditing(false);
      setIsCustom(true);
      setPermissions(mergedPermissions);
      toast.success('Permissions updated successfully');
    } catch {
      toast.error('Failed to update permissions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    if (!activeOrgId || !canEdit) return;

    setIsLoading(true);
    try {
      await resetOrganizationPermissions(activeOrgId);
      await loadPermissions(); // Reload to get default permissions
      setIsEditing(false);
      setIsCustom(false);
      toast.success('Permissions reset to defaults');
    } catch {
      toast.error('Failed to reset permissions');
    } finally {
      setIsLoading(false);
    }
  };

  const getBooleanValue = (
    config: PermissionConfig,
    role: 'admin' | 'member'
  ): boolean => {
    if (isEditing) {
      const editableValue = editablePermissions[role][config.key];
      if (editableValue !== undefined) return editableValue;
    }

    if (permissions && permissions[config.key] !== undefined) {
      return permissions[config.key];
    }

    return typeof config[role] === 'object' ? config[role].value : config[role];
  };

  const getNote = (
    config: PermissionConfig,
    role: 'admin' | 'member'
  ): string | null => {
    const value = config[role];
    return typeof value === 'object' ? value.note : null;
  };

  if (isLoading && !permissions) {
    return (
      <div className='space-y-4 rounded-[4px] bg-[rgba(219,249,54,0.08)] p-4'>
        <div className='flex items-center justify-between'>
          <h4 className='text-sm text-white'>
            <Users2 className='inline-block h-4.5 w-4.5 text-gray-500' />{' '}
            Organization Roles
          </h4>
        </div>
        <div className='py-8 text-center text-gray-400'>
          Loading permissions...
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4 rounded-[4px] bg-[rgba(219,249,54,0.08)] p-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h4 className='text-sm text-white'>
            <Users2 className='inline-block h-4.5 w-4.5 text-gray-500' />{' '}
            Organization Roles
            {isCustom && (
              <span className='ml-2 rounded bg-amber-400/10 px-2 py-1 text-xs text-amber-400'>
                Custom
              </span>
            )}
          </h4>
          {canEdit && (
            <p className='mt-1 text-xs text-gray-400'>
              {isEditing
                ? 'Editing permissions - changes will be saved when you click Save'
                : 'You can customize permissions for your organization'}
            </p>
          )}
        </div>

        {canEdit && (
          <div className='flex gap-2'>
            {!isEditing ? (
              <Button
                variant='outline'
                size='sm'
                onClick={() => setIsEditing(true)}
                className='border-gray-600 text-white hover:bg-gray-800'
              >
                <Edit3 className='mr-2 h-4 w-4' />
                Customize
              </Button>
            ) : (
              <>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleReset}
                  disabled={isLoading}
                  className='border-gray-600 text-white hover:bg-gray-800'
                >
                  <RotateCcw className='mr-2 h-4 w-4' />
                  Reset to Defaults
                </Button>
                <Button
                  size='sm'
                  onClick={handleSave}
                  disabled={isLoading}
                  className='bg-primary text-black'
                >
                  <Save className='mr-2 h-4 w-4' />
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    setIsEditing(false);
                    loadPermissions(); // Reload to discard changes
                  }}
                  disabled={isLoading}
                  className='border-gray-600 text-white hover:bg-gray-800'
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow className='border-gray-800 hover:bg-transparent'>
            <TableHead className='px-0 font-medium text-white'>
              Permissions
            </TableHead>
            <TableHead className='px-0 text-center font-medium text-white'>
              Owner
            </TableHead>
            <TableHead className='px-0 text-center font-medium text-white'>
              Admin
            </TableHead>
            <TableHead className='px-0 text-center font-medium text-white'>
              Member
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {defaultPermissionConfigs.map((config, index) => (
            <TableRow
              key={index}
              className='group border-gray-800/50 hover:bg-gray-800/10'
            >
              <TableCell className='px-0'>
                <div className='!text-sm text-white'>{config.label}</div>
                {config.description && (
                  <div className='mt-1 text-xs text-gray-400'>
                    {config.description}
                  </div>
                )}
              </TableCell>

              {/* Owner - Always true and not editable */}
              <TableCell className='px-0 text-center'>
                <Check className='text-success-500 mx-auto h-4 w-4' />
              </TableCell>

              {/* Admin - Separate control */}
              <TableCell className='px-0 text-center'>
                {isEditing && canEdit ? (
                  <input
                    type='checkbox'
                    checked={getBooleanValue(config, 'admin')}
                    onChange={e =>
                      handleAdminPermissionChange(config.key, e.target.checked)
                    }
                    className='h-4 w-4 rounded border-gray-600 bg-gray-800 text-green-500 focus:ring-green-500 focus:ring-offset-gray-900'
                  />
                ) : (
                  <div className='flex items-center justify-center'>
                    {getBooleanValue(config, 'admin') ? (
                      <>
                        <Check className='text-success-500 h-4 w-4' />
                        {getNote(config, 'admin') && (
                          <span className='ml-1 text-xs text-gray-500'>
                            {getNote(config, 'admin')}
                          </span>
                        )}
                      </>
                    ) : (
                      <X className='h-4 w-4 text-red-500' />
                    )}
                  </div>
                )}
              </TableCell>

              {/* Member - Separate control */}
              <TableCell className='px-0 text-center'>
                {isEditing && canEdit ? (
                  <input
                    type='checkbox'
                    checked={getBooleanValue(config, 'member')}
                    onChange={e =>
                      handleMemberPermissionChange(config.key, e.target.checked)
                    }
                    className='h-4 w-4 rounded border-gray-600 bg-gray-800 text-green-500 focus:ring-green-500 focus:ring-offset-gray-900'
                  />
                ) : (
                  <div className='flex items-center justify-center'>
                    {getBooleanValue(config, 'member') ? (
                      <>
                        <Check className='text-success-500 h-4 w-4' />
                        {getNote(config, 'member') && (
                          <span className='ml-1 max-w-[120px] text-xs whitespace-pre-wrap text-zinc-400'>
                            {getNote(config, 'member')}
                          </span>
                        )}
                      </>
                    ) : (
                      <X className='h-4 w-4 text-red-500' />
                    )}
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {!canEdit && isOwner() && (
        <div className='rounded border border-amber-400/20 bg-amber-400/10 p-3 text-xs text-amber-400'>
          <strong>Note:</strong> Only organization owners can modify
          permissions. You are viewing the permissions but cannot make changes.
        </div>
      )}
    </div>
  );
}
