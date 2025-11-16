'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Megaphone } from 'lucide-react';
import { AnnouncementEditor } from '@/components/ui/shadcn-io/announcement-editor';
import { BoundlessButton } from '@/components/buttons';
import { toast } from 'sonner';
import { api } from '@/lib/api/api';

export default function AnnouncementPage() {
  const params = useParams();
  const organizationId = params.id as string;
  const hackathonId = params.hackathonId as string;

  const [content, setContent] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    if (!content.trim()) {
      toast.error('Please enter announcement content');
      return;
    }

    setIsPublishing(true);
    try {
      await api.post(
        `/organizations/${organizationId}/hackathons/${hackathonId}/announcements`,
        {
          content,
        }
      );

      toast.success('Announcement published successfully!');
      setContent('');
    } catch {
      toast.error('Failed to publish announcement');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className='bg-background min-h-screen p-4 text-white sm:p-6 md:p-8'>
      <div className='mx-auto max-w-4xl'>
        <div className='mb-6'>
          <h1 className='mb-2 text-2xl font-bold text-white sm:text-3xl'>
            Create Announcement
          </h1>
          <p className='text-sm text-gray-400 sm:text-base'>
            Share important updates, reminders, or announcements with the
            community.
          </p>
        </div>

        <div className='mb-6'>
          <AnnouncementEditor
            content={content}
            onChange={setContent}
            placeholder='Share important updates, reminders, or announcements with the community.'
            className='min-h-[500px]'
          />
        </div>

        <div className='flex justify-start'>
          <BoundlessButton
            variant='default'
            size='lg'
            onClick={handlePublish}
            disabled={isPublishing || !content.trim()}
            className='bg-primary hover:bg-primary/90 gap-2'
          >
            <Megaphone className='h-4 w-4' />
            {isPublishing ? 'Publishing...' : 'Publish Announcement'}
          </BoundlessButton>
        </div>
      </div>
    </div>
  );
}
