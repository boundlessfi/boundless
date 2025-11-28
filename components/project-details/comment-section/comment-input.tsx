'use client';
import type React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Smile } from 'lucide-react';

interface CommentInputProps {
  onSubmit: (content: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  onCancel?: () => void;
  showCancel?: boolean;
}

export function CommentInput({
  onSubmit,
  placeholder = 'Leave a comment...',
  autoFocus = false,
  onCancel,
  showCancel = false,
}: CommentInputProps) {
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      onSubmit(comment.trim());
      setComment('');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className='flex items-center gap-4 rounded-lg border border-neutral-800 bg-black px-6 py-2'
    >
      <div className='shrink-0'>
        <Smile className='size-10 text-neutral-500' />
      </div>

      <div className='flex-1 rounded-xl border border-[#919191] bg-[#101010] px-6 py-3.5'>
        <input
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className='w-full text-base text-neutral-200 placeholder:text-neutral-500 focus:outline-none'
        />
      </div>

      <Button
        type='submit'
        variant='ghost'
        size='sm'
        className='shrink-0 px-0 text-base font-normal text-neutral-400 hover:bg-transparent hover:text-white disabled:opacity-50'
        disabled={!comment.trim()}
      >
        Reply
      </Button>

      {showCancel && (
        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={onCancel}
          className='shrink-0 text-base text-neutral-400 hover:text-white'
        >
          Cancel
        </Button>
      )}
    </form>
  );
}
