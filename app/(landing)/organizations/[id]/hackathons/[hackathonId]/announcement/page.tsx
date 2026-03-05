'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Megaphone, Trash2, Edit2, Pin, Send } from 'lucide-react';
import { AnnouncementEditor } from '@/components/ui/shadcn-io/announcement-editor';
import { BoundlessButton } from '@/components/buttons';
import { toast } from 'sonner';
import { AuthGuard } from '@/components/auth';
import Loading from '@/components/Loading';
import {
  createAnnouncement,
  listAnnouncements,
  deleteAnnouncement,
  publishAnnouncement,
  updateAnnouncement,
  HackathonAnnouncement,
} from '@/lib/api/hackathons/index';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { reportError } from '@/lib/error-reporting';

export default function AnnouncementPage() {
  const params = useParams();
  const organizationId = params.id as string;
  const hackathonId = params.hackathonId as string;

  const [announcements, setAnnouncements] = useState<HackathonAnnouncement[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [isDraft, setIsDraft] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState<
    string | null
  >(null);

  useEffect(() => {
    fetchAnnouncements();
  }, [hackathonId]);

  const fetchAnnouncements = async () => {
    try {
      const data = await listAnnouncements(hackathonId);
      setAnnouncements(data);
    } catch (error) {
      reportError(error, { context: 'announcement-fetch', hackathonId });
      toast.error('Failed to load announcements');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (draft = true) => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (!content.trim()) {
      toast.error('Please enter announcement content');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateAnnouncement(organizationId, hackathonId, editingId, {
          title,
          content,
          isPinned,
          isDraft: draft,
        });
        toast.success(
          draft ? 'Announcement saved as draft' : 'Announcement updated'
        );
      } else {
        await createAnnouncement(organizationId, hackathonId, {
          title,
          content,
          isPinned,
          isDraft: draft,
        });
        toast.success(
          draft ? 'Announcement saved as draft' : 'Announcement published'
        );
      }
      resetForm();
      fetchAnnouncements();
    } catch (error) {
      reportError(error, { context: 'announcement-save', hackathonId });
      toast.error('Failed to save announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!announcementToDelete) return;

    try {
      await deleteAnnouncement(
        organizationId,
        hackathonId,
        announcementToDelete
      );
      toast.success('Announcement deleted');
      fetchAnnouncements();
    } catch (error) {
      reportError(error, { context: 'announcement-delete', hackathonId });
      toast.error('Failed to delete announcement');
    } finally {
      setIsDeleteDialogOpen(false);
      setAnnouncementToDelete(null);
    }
  };

  const handlePublishDraft = async (id: string) => {
    try {
      await publishAnnouncement(organizationId, hackathonId, id);
      toast.success('Announcement published');
      fetchAnnouncements();
    } catch (error) {
      reportError(error, { context: 'announcement-publish', hackathonId });
      toast.error('Failed to publish announcement');
    }
  };

  const handleEdit = (announcement: HackathonAnnouncement) => {
    setEditingId(announcement.id);
    setTitle(announcement.title);
    setContent(announcement.content);
    setIsPinned(announcement.isPinned);
    setIsDraft(announcement.isDraft);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setIsPinned(false);
    setIsDraft(true);
  };

  return (
    <AuthGuard redirectTo='/auth?mode=signin' fallback={<Loading />}>
      <div className='bg-background-main-bg min-h-screen p-4 text-white sm:p-6 md:p-8'>
        <div className='mx-auto max-w-5xl space-y-8'>
          {/* Header */}
          <div className='flex flex-wrap items-center justify-between gap-4'>
            <div>
              <h1 className='text-2xl font-bold text-white sm:text-3xl'>
                {editingId ? 'Edit Announcement' : 'Create Announcement'}
              </h1>
              <p className='mt-1 text-sm text-zinc-400'>
                {editingId
                  ? 'Update your announcement details.'
                  : 'Share important updates, reminders, or announcements with the community.'}
              </p>
            </div>
            {editingId && (
              <BoundlessButton variant='outline' onClick={resetForm}>
                Cancel Edit
              </BoundlessButton>
            )}
          </div>

          {/* Editor Card */}
          <div className='space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 backdrop-blur-sm'>
            <div className='space-y-4'>
              <div className='space-y-2'>
                <label className='text-sm font-medium text-zinc-300'>
                  Title
                </label>
                <Input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder='Enter announcement title'
                  className='focus:border-primary/50 border-zinc-800 bg-zinc-950/50 text-white'
                  maxLength={100}
                />
              </div>

              <div className='space-y-2'>
                <label className='text-sm font-medium text-zinc-300'>
                  Content (Markdown)
                </label>
                <AnnouncementEditor
                  content={content}
                  onChange={setContent}
                  placeholder='Write your announcement content here...'
                  className='min-h-[400px]'
                />
              </div>

              <div className='flex items-center gap-6'>
                <div className='flex items-center gap-4'>
                  <div className='flex items-center gap-2'>
                    <Switch
                      id='pin-announcement'
                      checked={isPinned}
                      onCheckedChange={setIsPinned}
                    />
                    <label
                      htmlFor='pin-announcement'
                      className='cursor-pointer text-sm text-zinc-300'
                    >
                      Pin this announcement
                    </label>
                  </div>
                  <Pin
                    className={cn(
                      'h-3.5 w-3.5 transition-colors',
                      isPinned ? 'text-primary fill-primary' : 'text-zinc-500'
                    )}
                  />
                </div>
              </div>
            </div>

            <div className='flex flex-wrap gap-3'>
              <BoundlessButton
                variant='default'
                onClick={() => handleSave(false)}
                disabled={isSubmitting}
                className='bg-primary hover:bg-primary/90'
              >
                <Send className='mr-2 h-4 w-4' />
                {editingId ? 'Update & Publish' : 'Publish Now'}
              </BoundlessButton>
              <BoundlessButton
                variant='outline'
                onClick={() => handleSave(true)}
                disabled={isSubmitting}
                className='border-zinc-800 text-zinc-300'
              >
                {editingId ? 'Save Draft' : 'Save as Draft'}
              </BoundlessButton>
            </div>
          </div>

          {/* List of Announcements */}
          <div className='space-y-6'>
            <div className='flex items-center gap-2 border-b border-zinc-800 pb-4'>
              <Megaphone className='text-primary h-5 w-5' />
              <h2 className='text-xl font-semibold'>Existing Announcements</h2>
            </div>

            {isLoading ? (
              <div className='flex h-32 items-center justify-center'>
                <Loading />
              </div>
            ) : announcements.length === 0 ? (
              <div className='rounded-xl border border-dashed border-zinc-800 py-12 text-center text-zinc-500'>
                No announcements yet.
              </div>
            ) : (
              <div className='grid gap-4'>
                {announcements.map(item => (
                  <div
                    key={item.id}
                    className='group relative flex items-start justify-between rounded-xl border border-zinc-800 bg-zinc-900/20 p-5 transition-all hover:bg-zinc-900/40'
                  >
                    <a
                      href={`/hackathons/${hackathonId}/announcements/${item.id}`}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='min-w-0 flex-1 cursor-pointer space-y-2'
                    >
                      <div className='flex items-center gap-2'>
                        {item.isPinned && (
                          <Pin className='text-primary h-3.5 w-3.5 fill-current' />
                        )}
                        <h3 className='group-hover:text-primary truncate font-semibold text-zinc-100 transition-colors'>
                          {item.title}
                        </h3>
                        {item.isDraft && (
                          <Badge
                            variant='secondary'
                            className='text-[10px] uppercase'
                          >
                            Draft
                          </Badge>
                        )}
                      </div>
                      <p className='line-clamp-2 text-sm text-zinc-400'>
                        {item.content.replace(/<[^>]*>/g, '')}
                      </p>
                      <div className='flex items-center gap-4 text-xs text-zinc-500'>
                        <span>
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                        <span>By {item.author?.name || 'Unknown'}</span>
                      </div>
                    </a>

                    <div className='ml-4 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100'>
                      {item.isDraft && (
                        <button
                          onClick={() => handlePublishDraft(item.id)}
                          className='bg-primary/10 text-primary hover:bg-primary/20 rounded-lg p-2 transition-colors'
                          title='Publish'
                        >
                          <Send className='h-4 w-4' />
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(item)}
                        className='rounded-lg bg-zinc-800 p-2 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white'
                        title='Edit'
                      >
                        <Edit2 className='h-4 w-4' />
                      </button>
                      <button
                        onClick={() => {
                          setAnnouncementToDelete(item.id);
                          setIsDeleteDialogOpen(true);
                        }}
                        className='rounded-lg bg-red-500/10 p-2 text-red-500 transition-colors hover:bg-red-500/20'
                        title='Delete'
                      >
                        <Trash2 className='h-4 w-4' />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className='border-zinc-800 bg-zinc-950 text-white'>
          <DialogHeader>
            <DialogTitle>Delete Announcement</DialogTitle>
          </DialogHeader>
          <p className='text-zinc-400'>
            Are you sure you want to delete this announcement? This action
            cannot be undone.
          </p>
          <DialogFooter className='gap-2'>
            <BoundlessButton
              variant='outline'
              onClick={() => setIsDeleteDialogOpen(false)}
              className='border-zinc-800'
            >
              Cancel
            </BoundlessButton>
            <BoundlessButton
              variant='default'
              onClick={handleDelete}
              className='bg-red-600 hover:bg-red-700'
            >
              Delete
            </BoundlessButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AuthGuard>
  );
}
