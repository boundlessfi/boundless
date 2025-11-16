'use client';

import React, { useState } from 'react';
import { Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMarkdown } from '@/hooks/use-markdown';

interface AnnouncementSectionProps {
  announcement: string;
  onEdit: () => void;
}

export default function AnnouncementSection({
  announcement,
  onEdit,
}: AnnouncementSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const announcementContent = useMarkdown(announcement || '', {
    breaks: true,
    gfm: true,
  });

  return (
    <div className='bg-background-card rounded-lg border border-gray-900 p-6'>
      <div className='mb-4 flex items-center justify-between'>
        <h3 className='text-lg font-medium text-white'>Announcement</h3>
        <Button
          variant='ghost'
          size='sm'
          onClick={onEdit}
          className='text-primary hover:bg-primary/10'
        >
          <Edit2 className='mr-2 h-4 w-4' />
          Edit
        </Button>
      </div>
      <div className='prose prose-invert max-w-none'>
        {announcement ? (
          <>
            <div
              className='markdown-content text-gray-300'
              dangerouslySetInnerHTML={{
                __html: isExpanded
                  ? announcementContent.content
                  : announcementContent.content.length > 500
                    ? announcementContent.content.substring(0, 500) + '...'
                    : announcementContent.content,
              }}
            />
            {announcementContent.content.length > 500 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className='text-primary mt-2 hover:underline'
              >
                {isExpanded ? 'View Less' : 'View More'}
              </button>
            )}
          </>
        ) : (
          <p className='text-gray-400'>No announcement added yet.</p>
        )}
      </div>
    </div>
  );
}
