'use client';

import { useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { X as XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BoundlessButton } from '@/components/buttons';

interface EmailInviteSectionProps {
  inviteEmails: string[];
  setInviteEmails: (emails: string[]) => void;
  emailInput: string;
  setEmailInput: (input: string) => void;
  onInvite: () => void;
}

export default function EmailInviteSection({
  inviteEmails,
  setInviteEmails,
  emailInput,
  setEmailInput,
  onInvite,
}: EmailInviteSectionProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailInput = (value: string) => {
    setEmailInput(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === ',' || e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();

      const currentValue = emailInput.trim();
      if (
        currentValue &&
        isValidEmail(currentValue) &&
        !inviteEmails.includes(currentValue)
      ) {
        setInviteEmails([...inviteEmails, currentValue]);
        setEmailInput('');
      }
    }
  };

  const removeEmail = (emailToRemove: string) => {
    setInviteEmails(inviteEmails.filter(email => email !== emailToRemove));
  };

  return (
    <div className='space-y-5 rounded-[12px] border border-gray-900 bg-[#101010] p-4'>
      <div>
        <h3 className='text-sm text-white'>Invite Team Members</h3>
      </div>

      <div className='flex gap-4'>
        <div className='relative flex-1'>
          <div className='focus-within:ring-primary/20 min-h-[100px] rounded-[12px] border border-gray-900 bg-[#101010] p-3 focus-within:ring-2'>
            {inviteEmails.length > 0 && (
              <div className='mb-2 flex flex-wrap gap-2'>
                {inviteEmails.map((email, index) => (
                  <div
                    key={index}
                    className='bg-active-bg text-primary inline-flex items-center gap-1 rounded-full px-1.5 py-1.5 text-xs'
                  >
                    <span>{email}</span>
                    <button
                      onClick={() => removeEmail(email)}
                      className='bg-primary hover:bg-primary/80 rounded-full p-0.5'
                    >
                      <XIcon className='text-background h-3 w-3' />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <Textarea
              ref={textareaRef}
              value={emailInput}
              onChange={e => handleEmailInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='Enter email addresses (press comma, space, or enter to add)...'
              className='min-h-[60px] resize-none border-0 bg-transparent p-0 text-white placeholder:text-gray-700 focus-visible:ring-0'
              rows={3}
            />
          </div>
        </div>

        <BoundlessButton
          onClick={onInvite}
          disabled={inviteEmails.length === 0}
          className={cn(
            inviteEmails.length === 0 && 'cursor-not-allowed opacity-50'
          )}
          size='xl'
        >
          Invite {inviteEmails.length > 0 && `(${inviteEmails.length})`}
        </BoundlessButton>
      </div>
    </div>
  );
}
