'use client';

import React, { useState } from 'react';
import { Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMarkdown } from '@/hooks/use-markdown';
import { sanitizeHtml } from '@/lib/utils/renderHtml';

interface AnnouncementSectionProps {
  announcement: string;
  onEdit: () => void;
}

export default function AnnouncementSection({
  announcement,
  onEdit,
}: AnnouncementSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const announcementRaw = announcement || '';
  const isLongAnnouncement = announcementRaw.length > 300;

  const markdownToParse =
    !isExpanded && isLongAnnouncement
      ? announcementRaw.substring(0, 300) + '...'
      : announcementRaw;

  const announcementContent = useMarkdown(markdownToParse, {
    breaks: true,
    gfm: true,
  });

  const handleToggleExpand = () => setIsExpanded(!isExpanded);

  const sanitizedContent = sanitizeHtml(announcementContent.content);

  return (
    <div className='bg-background-card rounded-lg border border-gray-900 p-3'>
      <div className='mb-2 flex items-center justify-between'>
        <h3 className='text-xs font-medium text-gray-300'>Announcement</h3>
        <Button
          variant='ghost'
          size='sm'
          onClick={onEdit}
          className='text-primary hover:bg-primary/10 h-6 px-2 py-0 text-xs'
        >
          <Edit2 className='mr-1 h-3 w-3' />
          Edit
        </Button>
      </div>
      <div className='prose prose-invert max-w-none text-xs'>
        {announcement ? (
          <>
            <div
              className='markdown-content text-gray-400'
              dangerouslySetInnerHTML={sanitizedContent}
            />
            {isLongAnnouncement && (
              <button
                onClick={handleToggleExpand}
                className='text-primary mt-1 text-xs hover:underline'
              >
                {isExpanded ? 'View Less' : 'View More'}
              </button>
            )}
          </>
        ) : (
          <p className='text-gray-500 italic'>No announcement added yet.</p>
        )}
      </div>
    </div>
  );
}
