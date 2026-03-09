'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then(mod => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className='flex h-[400px] w-full items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/30'>
        <Loader2 className='h-6 w-6 animate-spin text-zinc-500' />
      </div>
    ),
  }
);

interface AnnouncementEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
}

function AnnouncementEditor({
  content = '',
  onChange,
  placeholder = 'Share important updates, reminders, or announcements with the community.',
  editable = true,
  className,
}: AnnouncementEditorProps) {
  return (
    <div
      className={cn(
        'bg-background-card overflow-hidden rounded-lg border border-gray-800',
        className
      )}
    >
      <MDEditor
        value={content}
        onChange={value => onChange?.(value ?? '')}
        height={400}
        data-color-mode='dark'
        preview='edit'
        hideToolbar={!editable}
        visibleDragbar={editable}
        textareaProps={{
          placeholder,
          readOnly: !editable,
          style: {
            fontSize: 14,
            lineHeight: 1.6,
            color: '#ffffff',
            backgroundColor: '#18181b',
            fontFamily: 'inherit',
            border: 'none',
          },
        }}
        style={{
          backgroundColor: '#18181b',
          color: '#ffffff',
          border: 'none',
        }}
      />
    </div>
  );
}

export { AnnouncementEditor, type AnnouncementEditorProps };
