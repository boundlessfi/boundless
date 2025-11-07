'use client';

import { useState, useRef, useEffect } from 'react';
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
import { toast } from 'sonner';

interface Member {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'member';
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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { activeOrg, activeOrgId, transferOwnership } = useOrganization();

  // Create members list using the SAME logic as MembersTab
  const members: Member[] =
    activeOrg?.members
      ?.filter(email => email !== activeOrg?.owner) // Exclude owner
      ?.map((email, idx) => ({
        id: `${idx}-${email}`,
        name: email.split('@')[0] || email,
        email,
        role: 'member' as const,
        joinedAt: new Date().toISOString(),
        status: 'active' as const,
      })) || [];

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

      await transferOwnership(activeOrgId, selectedMemberData.email);

      toast.success('Ownership transferred successfully');

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

  // Debug: Log the members to see what's happening
  console.log('TransferOwnershipTab - activeOrg:', activeOrg);
  console.log('TransferOwnershipTab - members:', members);

  return (
    <>
      <div className='mb-6 space-y-6 rounded-[12px] border border-gray-900 bg-[#101010] p-4'>
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
            Available members: {members.length}
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
