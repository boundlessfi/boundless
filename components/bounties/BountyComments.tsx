'use client';

import { useAuth } from '@/hooks/use-auth';
import { GenericCommentThread } from '@/components/comments/GenericCommentThread';
import { useCommentSystem } from '@/hooks/use-comment-system';
import { CommentEntityType } from '@/types/comment';

interface BountyCommentsProps {
  bountyId: string;
}

export function BountyComments({ bountyId }: BountyCommentsProps) {
  const { user } = useAuth();

  // Initialize the comment system for this bounty
  const commentSystem = useCommentSystem({
    entityType: CommentEntityType.BOUNTY,
    entityId: bountyId,
    page: 1,
    limit: 20,
    enabled: true,
  });

  // Current user info for the comment system
  const currentUser = user
    ? {
        id: user.id,
        name: user.name || user.email || 'Anonymous',
        username: user.profile?.username || undefined,
        image: user.image || undefined,
        isModerator: user.role === 'ADMIN',
      }
    : {
        id: 'anonymous',
        name: 'Anonymous',
        username: undefined,
        image: undefined,
        isModerator: false,
      };

  return (
    <div className='space-y-4'>
      <div className='border-b border-[#2B2B2B] pb-4'>
        <h3 className='text-lg font-semibold text-white'>Bounty Discussion</h3>
        <p className='text-sm text-gray-400'>
          Discuss requirements, ask questions, and collaborate on this bounty
        </p>
      </div>

      <GenericCommentThread
        entityType={CommentEntityType.BOUNTY}
        entityId={bountyId}
        currentUser={currentUser}
        commentsHook={commentSystem.comments}
        createCommentHook={commentSystem.createComment}
        updateCommentHook={commentSystem.updateComment}
        deleteCommentHook={commentSystem.deleteComment}
        reportCommentHook={commentSystem.reportComment}
        reactionsHook={commentSystem.reactions}
        maxDepth={3}
        showReactions={true}
        showReporting={true}
        showModeration={currentUser.isModerator}
      />
    </div>
  );
}
