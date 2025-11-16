'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { BoundlessButton } from '@/components/buttons';
import { ChevronsUpDown, X, Delete } from 'lucide-react';

interface Member {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
  status: 'active' | 'pending' | 'suspended';
}

interface MemberCardProps {
  member: Member;
  onRoleChange: (memberId: string, newRole: string) => void;
  onRemoveMember: (memberId: string) => void;
}

export default function MemberCard({
  member,
  onRoleChange,
  onRemoveMember,
}: MemberCardProps) {
  return (
    <div className='flex items-center justify-between gap-3'>
      <div className='flex gap-3'>
        <Avatar className='h-12 w-12'>
          <AvatarImage src={member.avatar} alt={member.name} />
          <AvatarFallback>{member.name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className='flex flex-col gap-0'>
          <h4 className='text-white'>{member.name}</h4>
          <p className='text-sm text-gray-500'>{member.email}</p>
        </div>
      </div>

      <div className='flex items-center gap-3'>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant='ghost'
              size='sm'
              className='data-[state=open]:text-primary text-gray-500 hover:bg-transparent hover:text-white'
            >
              {member.role === 'admin' ? 'Admin' : 'Member'}
              <ChevronsUpDown className='data-[state=open]:text-primary ml-1 size-4' />
            </Button>
          </PopoverTrigger>
          <PopoverContent className='bg-background w-48 rounded-[16px] border-white/24 p-3'>
            <div className='space-y-2'>
              <RadioGroup
                value={member.role}
                onValueChange={value => onRoleChange(member.id, value)}
                className='flex flex-col gap-2'
              >
                <div className='flex items-center justify-between gap-3 px-4 py-3'>
                  <Label
                    htmlFor={`admin-${member.id}`}
                    className='text-sm text-white'
                  >
                    Admin
                  </Label>
                  <RadioGroupItem value='admin' id={`admin-${member.id}`} />
                </div>
                <div className='flex items-center justify-between gap-3 px-4 py-3'>
                  <Label
                    htmlFor={`member-${member.id}`}
                    className='text-sm text-white'
                  >
                    Member
                  </Label>
                  <RadioGroupItem value='member' id={`member-${member.id}`} />
                </div>
              </RadioGroup>
            </div>
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <Button className='h-6 w-6 rounded-full bg-white !p-1 hover:bg-gray-200'>
              <X className='size-5 text-black' />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align='center'
            side='left'
            className='bg-background w-48 rounded-[16px] border-white/24 p-3'
          >
            <BoundlessButton
              variant='destructive'
              icon={<Delete className='size-4 text-white' />}
              fullWidth
              onClick={() => onRemoveMember(member.id)}
              className='text-white'
            >
              Remove
            </BoundlessButton>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
