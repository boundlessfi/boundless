'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BoundlessButton } from '@/components/buttons';
import { useOrganization } from '@/lib/providers/OrganizationProvider';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/LoadingSpinner';

interface BetterAuthMember {
  id: string;
  organizationId: string;
  userId: string;
  role: string;
  createdAt: Date;
  user: {
    id: string;
    email: string;
    name: string;
    image?: string;
  };
}

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

interface TransferOwnershipTabProps {
  onTransfer?: (newOwnerId: string) => void;
}

export default function TransferOwnershipTab({
  onTransfer,
}: TransferOwnershipTabProps) {
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [popoverWidth, setPopoverWidth] = useState(0);
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [isCurrentUserOwner, setIsCurrentUserOwner] = useState(false);
  const [loadingOwnerCheck, setLoadingOwnerCheck] = useState(true);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { activeOrgId, transferOwnership, isOwner } = useOrganization();

  useEffect(() => {
    const checkOwner = async () => {
      if (activeOrgId) {
        setLoadingOwnerCheck(true);
        const ownerStatus = await isOwner(activeOrgId);
        setIsCurrentUserOwner(ownerStatus);
        setLoadingOwnerCheck(false);
      }
    };
    checkOwner();
  }, [activeOrgId, isOwner]);

  // Fetch members using Better Auth API (same as MembersTab)
  const fetchMembers = useCallback(async () => {
    if (!activeOrgId) return;

    setLoadingMembers(true);
    try {
      // Get current user for filtering
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

      const transformedMembers: Member[] = (data?.members || [])
        // Filter out the current user (can't transfer to yourself)
        .filter((member: BetterAuthMember) => member.userId !== currentUserId)
        .map((member: BetterAuthMember) => ({
          id: member.id,
          userId: member.userId,
          name: member.user.name || member.user.email,
          email: member.user.email,
          avatar: member.user.image,
          role: member.role as 'owner' | 'admin' | 'member',
          joinedAt: member.createdAt.toISOString(),
          status: 'active' as const,
        }));

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
  }, [activeOrgId, fetchMembers]);

  useEffect(() => {
    const updateWidth = () => {
      if (triggerRef.current) {
        setPopoverWidth(triggerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);

    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const selectedMemberData = members.find(
    member => member.id === selectedMember
  );

  const handleTransfer = async () => {
    if (!selectedMember || !activeOrgId) return;

    setIsTransferring(true);
    try {
      const selectedMemberData = members.find(m => m.id === selectedMember);
      if (!selectedMemberData) {
        toast.error('Selected member not found');
        return;
      }

      await transferOwnership(activeOrgId, selectedMemberData.id);

      toast.success('Ownership transferred successfully');

      // Refresh members after transfer
      await fetchMembers();

      onTransfer?.(selectedMember);
      setSelectedMember(''); // Reset selection
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to transfer ownership'
      );
    } finally {
      setIsTransferring(false);
    }
  };
  if (loadingOwnerCheck) {
    return (
      <div className='bg-background-card rounded-[12px] border border-gray-900 p-6'>
        <div className='flex flex-col items-center justify-center space-y-4 py-12'>
          <LoadingSpinner size='lg' />
          <p className='animate-pulse text-sm text-gray-400'>
            Determining your permission...
          </p>
        </div>
      </div>
    );
  }

  if (loadingMembers) {
    return (
      <div className='relative h-[calc(100vh-300px)] space-y-8'>
        <div className='absolute inset-0 z-10 flex items-center justify-center rounded-[12px] bg-black/50 backdrop-blur-sm'>
          <LoadingSpinner size='lg' className='z-20 text-white' />
        </div>
      </div>
    );
  }
  // Show permission denied message if not owner
  if (!loadingMembers && !loadingOwnerCheck && !isCurrentUserOwner) {
    return (
      <div className='bg-background-card rounded-[12px] border border-gray-900 p-6'>
        <div className='flex flex-col items-center justify-center space-y-4 py-8'>
          <div className='rounded-full bg-red-500/10 p-3'>
            <svg
              className='h-8 w-8 text-red-500'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
              />
            </svg>
          </div>
          <div className='text-center'>
            <h3 className='text-lg font-medium text-white'>
              Permission Denied
            </h3>
            <p className='mt-2 text-sm text-gray-400'>
              Only the organization owner can transfer ownership.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className='bg-background-card mb-6 space-y-6 rounded-[12px] border border-gray-900 p-4'>
        <div>
          <h3 className='mb-3 text-sm text-white'>
            Transfer the organization ownership
          </h3>
          <p className='text-sm text-gray-500'>
            You can only transfer the ownership to one of the members. After
            ownership being transferred,
            <span className='text-warning-300 italic'>
              {' '}
              you will be demoted to admin.
            </span>
          </p>
          {/* Debug info */}
          <div className='mt-2 text-xs text-gray-400'>
            Available members: {members.length}{' '}
            {loadingMembers && '(Loading...)'}
          </div>
        </div>

        <div className='space-y-4'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                ref={triggerRef}
                variant='outline'
                className='bg-background h-12 w-full justify-between border-gray-900 px-4 text-white hover:bg-gray-800'
              >
                <div className='flex items-center gap-3'>
                  {selectedMemberData ? (
                    <>
                      <Avatar className='h-6 w-6'>
                        <AvatarImage
                          src={selectedMemberData.avatar}
                          alt={selectedMemberData.name}
                        />
                        <AvatarFallback className='text-xs'>
                          {selectedMemberData.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className='text-white'>
                        {selectedMemberData.name}
                      </span>
                    </>
                  ) : (
                    <span className='text-gray-500'>Select new owner</span>
                  )}
                </div>
                <ChevronDown className='h-4 w-4 text-gray-500' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className='bg-background w-full border-gray-900'
              style={{ width: popoverWidth > 0 ? `${popoverWidth}px` : '100%' }}
            >
              {members.length > 0 ? (
                members.map(member => (
                  <DropdownMenuItem
                    key={member.id}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 px-4 py-3 focus:bg-gray-800',
                      selectedMember === member.id && 'bg-primary/10'
                    )}
                    onClick={() => setSelectedMember(member.id)}
                  >
                    <Avatar className='h-6 w-6'>
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback className='text-xs'>
                        {member.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className='flex-1'>
                      <div className='text-sm text-white'>{member.name}</div>
                      <div className='text-xs text-gray-500'>
                        {member.email}
                      </div>
                    </div>
                    {selectedMember === member.id && (
                      <Check className='text-primary h-4 w-4' />
                    )}
                  </DropdownMenuItem>
                ))
              ) : (
                <div className='px-4 py-3 text-sm text-gray-500'>
                  No members found (only owner in organization)
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <BoundlessButton
        onClick={handleTransfer}
        disabled={!selectedMember || isTransferring || members.length === 0}
        className={cn(
          (!selectedMember || members.length === 0) &&
            'cursor-not-allowed opacity-50'
        )}
        size='xl'
      >
        {isTransferring ? 'Transferring...' : 'Transfer Ownership'}
      </BoundlessButton>
    </>
  );
}
