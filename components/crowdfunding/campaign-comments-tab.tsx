'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CommentsSortDropdown } from '@/components/project-details/comment-section/comments-sort-dropdown';
import { CommentItem } from '@/components/project-details/comment-section/comment-item';
import { CommentInput } from '@/components/project-details/comment-section/comment-input';
import { CommentsEmptyState } from '@/components/project-details/comment-section/comments-empty-state';
import { useCommentSystem } from '@/hooks/use-comment-system';
import {
  CommentEntityType,
  Comment as CommentType,
  ReportReason,
} from '@/types/comment';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, MessageCircle } from 'lucide-react';

interface CampaignCommentsTabProps {
  campaignId: string;
}

export function CampaignCommentsTab({ campaignId }: CampaignCommentsTabProps) {
  const [sortBy, setSortBy] = useState<
    'createdAt' | 'updatedAt' | 'totalReactions'
  >('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { user } = useAuth(false);

  // Use the generic comment system
  const {
    comments: commentsHook,
    createComment: createCommentHook,
    updateComment: updateCommentHook,
    deleteComment: deleteCommentHook,
    reportComment: reportCommentHook,
  } = useCommentSystem({
    entityType: CommentEntityType.CROWDFUNDING_CAMPAIGN,
    entityId: campaignId,
    page: 1,
    limit: 100,
    enabled: true,
  });

  // Build nested comment structure and sort
  const sortedComments = useMemo(() => {
    // Separate top-level comments and replies
    const topLevelComments = commentsHook.comments.filter(
      comment => !comment.parentId
    );
    const repliesMap = new Map<string, CommentType[]>();

    // Group replies by parent ID
    commentsHook.comments.forEach(comment => {
      if (comment.parentId) {
        const replies = repliesMap.get(comment.parentId) || [];
        replies.push(comment);
        repliesMap.set(comment.parentId, replies);
      }
    });

    // Attach replies to parent comments
    const commentsWithReplies = topLevelComments.map(comment => ({
      ...comment,
      replies: repliesMap.get(comment.id) || [],
    }));

    // Sort top-level comments
    return commentsWithReplies.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'createdAt') {
        comparison =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === 'updatedAt') {
        comparison =
          new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      } else {
        comparison = (a.reactionCount || 0) - (b.reactionCount || 0);
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [commentsHook.comments, sortBy, sortOrder]);

  const handleAddComment = async (content: string) => {
    try {
      await createCommentHook.createComment({
        content,
        entityType: CommentEntityType.CROWDFUNDING_CAMPAIGN,
        entityId: campaignId,
      });
      commentsHook.refetch();
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleAddReply = async (commentId: string, content: string) => {
    try {
      await createCommentHook.createComment({
        content,
        entityType: CommentEntityType.CROWDFUNDING_CAMPAIGN,
        entityId: campaignId,
        parentId: commentId,
      });
      commentsHook.refetch();
    } catch (error) {
      console.error('Failed to add reply:', error);
    }
  };

  const handleReportComment = async (
    commentId: string,
    reason: string,
    description?: string
  ) => {
    try {
      // Convert string reason to ReportReason enum
      const reportReason = reason.toUpperCase() as keyof typeof ReportReason;
      await reportCommentHook.reportComment(commentId, {
        reason: ReportReason[reportReason] || ReportReason.OTHER,
        description,
      });
    } catch (error) {
      console.error('Failed to report comment:', error);
    }
  };

  if (commentsHook.loading) {
    return (
      <Card className='bg-background border-border/10'>
        <CardContent className='flex items-center justify-center py-12'>
          <Loader2 className='text-muted-foreground h-6 w-6 animate-spin' />
          <span className='text-muted-foreground ml-2'>
            Loading comments...
          </span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='bg-background border-border/10'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-white'>
          <MessageCircle className='h-5 w-5' />
          Comments & Discussion ({commentsHook.comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Comment Input */}
        {user && (
          <CommentInput
            onSubmit={handleAddComment}
            placeholder='Share your thoughts about this campaign...'
          />
        )}

        {/* Comments Sort */}
        {commentsHook.comments.length > 0 && (
          <div className='flex justify-end'>
            <CommentsSortDropdown
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={(newSortBy, newSortOrder) => {
                setSortBy(newSortBy);
                setSortOrder(newSortOrder);
              }}
            />
          </div>
        )}

        {/* Comments List */}
        {sortedComments.length === 0 ? (
          <CommentsEmptyState onAddComment={handleAddComment} />
        ) : (
          <div className='space-y-4'>
            {sortedComments.map(commentItem => (
              <CommentItem
                key={commentItem.id}
                comment={commentItem}
                onAddReply={handleAddReply}
                onUpdate={async (commentId, content) => {
                  try {
                    await updateCommentHook.updateComment(commentId, {
                      content,
                    });
                    commentsHook.refetch();
                  } catch (error) {
                    console.error('Failed to update comment:', error);
                  }
                }}
                onDelete={async commentId => {
                  try {
                    await deleteCommentHook.deleteComment(commentId);
                    commentsHook.refetch();
                  } catch (error) {
                    console.error('Failed to delete comment:', error);
                  }
                }}
                onReport={handleReportComment}
                currentUserId={user?.id}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
