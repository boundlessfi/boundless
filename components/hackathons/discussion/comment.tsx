'use client';

import { useState, useMemo } from 'react';
import { CommentsSortDropdown } from '@/components/project-details/comment-section/comments-sort-dropdown';
import { CommentItem } from '@/components/project-details/comment-section/comment-item';
import { CommentInput } from '@/components/project-details/comment-section/comment-input';
import { CommentsEmptyState } from '@/components/project-details/comment-section/comments-empty-state';
import { useDiscussions } from '@/hooks/hackathon/use-discussions-api';
import { Loader2 } from 'lucide-react';

interface HackathonDiscussionsProps {
  hackathonId: string;
  organizationId?: string;
}
export function HackathonDiscussions({
  hackathonId,
  organizationId,
}: HackathonDiscussionsProps) {
  const [sortBy, setSortBy] = useState<
    'createdAt' | 'updatedAt' | 'totalReactions'
  >('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const {
    discussions,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    addDiscussion,
    addReply,
    updateDiscussion,
    deleteDiscussion,
    reportDiscussion,
    fetchDiscussions,
  } = useDiscussions({
    hackathonSlugOrId: hackathonId,
    organizationId,
    autoFetch: true,
    sortBy,
    sortOrder,
  });

  // Sort discussions client-side (API may also sort, but we do it here for consistency)
  const sortedDiscussions = useMemo(() => {
    return [...discussions].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'createdAt') {
        comparison =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === 'updatedAt') {
        comparison =
          new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      } else {
        comparison = a.totalReactions - b.totalReactions;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [discussions, sortBy, sortOrder]);

  const handleAddDiscussion = async (content: string) => {
    try {
      await addDiscussion(content);
      // Discussions will be automatically updated by the hook
    } catch {
      // Error is already handled in the hook
    }
  };

  const handleAddReply = async (parentCommentId: string, content: string) => {
    try {
      await addReply(parentCommentId, content);
      // Discussions will be automatically updated by the hook
    } catch {
      // Error is already handled in the hook
    }
  };

  const handleUpdateDiscussion = async (commentId: string, content: string) => {
    try {
      await updateDiscussion(commentId, content);
      // Discussions will be automatically updated by the hook
    } catch {
      // Error is already handled in the hook
    }
  };

  const handleDeleteDiscussion = async (commentId: string) => {
    try {
      await deleteDiscussion(commentId);
      // Discussions will be automatically updated by the hook
    } catch {
      // Error is already handled in the hook
    }
  };

  const handleReportDiscussion = async (
    commentId: string,
    reason: string,
    description?: string
  ) => {
    try {
      await reportDiscussion(commentId, reason, description);
      // Report is handled, no need to update discussions
    } catch {
      // Error is already handled in the hook
    }
  };

  const loading = isLoading && discussions.length === 0;

  if (loading)
    return (
      <div className='flex w-full items-center justify-center py-8'>
        <Loader2 className='h-8 w-8 animate-spin text-[#a7f950]' />
        <span className='ml-3 text-gray-400'>Loading discussions...</span>
      </div>
    );

  if (error && discussions.length === 0)
    return (
      <div className='w-full py-4 text-center'>
        <p className='mb-4 text-red-400'>Error loading discussions: {error}</p>
        <button
          onClick={() => fetchDiscussions()}
          className='rounded-md bg-[#a7f950] px-4 py-2 text-black hover:bg-[#8fd93f]'
        >
          Retry
        </button>
      </div>
    );

  if (discussions.length === 0)
    return <CommentsEmptyState onAddComment={handleAddDiscussion} />;

  return (
    <div className='w-full'>
      <div className='justify-left mb-4 flex'>
        <CommentsSortDropdown
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={(newSortBy, newSortOrder) => {
            setSortBy(newSortBy);
            setSortOrder(newSortOrder);
          }}
        />
      </div>

      <div className='space-y-6 text-left font-normal'>
        {sortedDiscussions.map(discussion => (
          <CommentItem
            key={discussion._id}
            comment={discussion}
            onAddReply={handleAddReply}
            onUpdate={handleUpdateDiscussion}
            onDelete={handleDeleteDiscussion}
            onReport={handleReportDiscussion}
          />
        ))}
      </div>

      <div className='mt-10 px-4 md:px-0'>
        <CommentInput onSubmit={handleAddDiscussion} />
      </div>

      {error && discussions.length > 0 && (
        <div className='mx-4 mt-4 rounded-md border border-red-500/50 bg-red-500/10 p-3 md:mx-0'>
          <p className='text-sm text-red-400'>{error}</p>
        </div>
      )}

      {(isCreating || isUpdating || isDeleting) && (
        <div className='mx-4 mt-4 flex items-center gap-2 text-sm text-gray-400 md:mx-0'>
          <Loader2 className='h-4 w-4 animate-spin' />
          <span>
            {isCreating && 'Posting...'}
            {isUpdating && 'Updating...'}
            {isDeleting && 'Deleting...'}
          </span>
        </div>
      )}
    </div>
  );
}
