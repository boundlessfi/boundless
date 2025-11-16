'use client';

import { useState } from 'react';
import { CommentsSortDropdown } from '@/components/project-details/comment-section/comments-sort-dropdown';
import { CommentItem } from '@/components/project-details/comment-section/comment-item';
import { CommentInput } from '@/components/project-details/comment-section/comment-input';
import { CommentsEmptyState } from '@/components/project-details/comment-section/comments-empty-state';

interface CommentUser {
  _id: string;
  profile: {
    firstName: string;
    lastName: string;
    username: string;
    avatar?: string;
  };
}

interface CommentReactionCounts {
  LIKE: number;
  DISLIKE: number;
  HELPFUL: number;
}

interface CommentEditHistory {
  content: string;
  editedAt: string;
}

interface CommentReport {
  userId: string;
  reason: 'spam' | 'inappropriate' | 'harassment' | 'misinformation' | 'other';
  description?: string;
  createdAt: string;
}

interface Discussion {
  _id: string;
  userId: CommentUser;
  projectId: string;
  content: string;
  parentCommentId?: string;
  status: 'active' | 'deleted' | 'flagged' | 'hidden';
  editHistory: CommentEditHistory[];
  reactionCounts: CommentReactionCounts;
  totalReactions: number;
  replyCount: number;
  replies: Discussion[];
  createdAt: string;
  updatedAt: string;
  isSpam: boolean;
  reports: CommentReport[];
}

interface HackathonDiscussionsProps {
  hackathonId: string;
}

// Mock data
const mockDiscussions: Discussion[] = [
  {
    _id: '1',
    userId: {
      _id: 'user1',
      profile: {
        firstName: 'Sarah',
        lastName: 'Chen',
        username: 'sarahc',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      },
    },
    projectId: '',
    content:
      'Excited to participate in this hackathon! Are there any team formation channels?',
    status: 'active',
    createdAt: '2025-01-10T10:30:00Z',
    updatedAt: '2025-01-10T10:30:00Z',
    totalReactions: 12,
    reactionCounts: { LIKE: 12, DISLIKE: 0, HELPFUL: 0 },
    editHistory: [],
    replyCount: 1,
    isSpam: false,
    reports: [],
    replies: [
      {
        _id: '1-1',
        userId: {
          _id: 'user2',
          profile: {
            firstName: 'Alex',
            lastName: 'Rodriguez',
            username: 'alexr',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
          },
        },
        projectId: '',
        content:
          "Yes! Check out the Discord server, there's a #team-formation channel.",
        status: 'active',
        createdAt: '2025-01-10T11:00:00Z',
        updatedAt: '2025-01-10T11:00:00Z',
        totalReactions: 5,
        reactionCounts: { LIKE: 5, DISLIKE: 0, HELPFUL: 0 },
        editHistory: [],
        replyCount: 0,
        isSpam: false,
        reports: [],
        replies: [],
        parentCommentId: '1',
      },
    ],
  },
  {
    _id: '2',
    userId: {
      _id: 'user3',
      profile: {
        firstName: 'Michael',
        lastName: 'Chen',
        username: 'michaelc',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
      },
    },
    projectId: '',
    content:
      'What technologies are allowed for this hackathon? Can we use any framework?',
    status: 'active',
    createdAt: '2025-01-11T14:20:00Z',
    updatedAt: '2025-01-11T14:20:00Z',
    totalReactions: 8,
    reactionCounts: { LIKE: 8, DISLIKE: 0, HELPFUL: 0 },
    editHistory: [],
    replyCount: 0,
    isSpam: false,
    reports: [],
    replies: [],
  },
  {
    _id: '3',
    userId: {
      _id: 'user4',
      profile: {
        firstName: 'Emily',
        lastName: 'Zhang',
        username: 'emilyz',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
      },
    },
    projectId: '',
    content:
      "Looking forward to the workshops! Will they be recorded for those who can't attend live?",
    status: 'active',
    createdAt: '2025-01-12T09:15:00Z',
    updatedAt: '2025-01-12T09:15:00Z',
    totalReactions: 15,
    reactionCounts: { LIKE: 15, DISLIKE: 0, HELPFUL: 0 },
    editHistory: [],
    replyCount: 0,
    isSpam: false,
    reports: [],
    replies: [],
  },
];

export function HackathonDiscussions({
  hackathonId,
}: HackathonDiscussionsProps) {
  const [sortBy, setSortBy] = useState<
    'createdAt' | 'updatedAt' | 'totalReactions'
  >('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [discussions, setDiscussions] = useState<Discussion[]>(mockDiscussions);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sort discussions
  const sortedDiscussions = [...discussions].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'createdAt')
      comparison =
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    else if (sortBy === 'updatedAt')
      comparison =
        new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
    else comparison = a.totalReactions - b.totalReactions;
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  const handleAddDiscussion = async (content: string) => {
    try {
      setLoading(true);
      const newDiscussion: Discussion = {
        _id: Date.now().toString(),
        userId: {
          _id: 'current-user',
          profile: {
            firstName: 'Current',
            lastName: 'User',
            username: 'currentuser',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Current',
          },
        },
        projectId: hackathonId,
        content,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        totalReactions: 0,
        reactionCounts: { LIKE: 0, DISLIKE: 0, HELPFUL: 0 },
        editHistory: [],
        replyCount: 0,
        isSpam: false,
        reports: [],
        replies: [],
      };
      setDiscussions([newDiscussion, ...discussions]);
    } catch {
      setError('Failed to post discussion');
    } finally {
      setLoading(false);
    }
  };

  const handleAddReply = async (parentCommentId: string, content: string) => {
    try {
      setLoading(true);
      const newReply: Discussion = {
        _id: `${Date.now()}`,
        userId: {
          _id: 'current-user',
          profile: {
            firstName: 'Current',
            lastName: 'User',
            username: 'currentuser',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Current',
          },
        },
        projectId: hackathonId,
        content,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        totalReactions: 0,
        reactionCounts: { LIKE: 0, DISLIKE: 0, HELPFUL: 0 },
        editHistory: [],
        replyCount: 0,
        isSpam: false,
        reports: [],
        replies: [],
        parentCommentId,
      };

      const updateReplies = (items: Discussion[]): Discussion[] =>
        items.map(item =>
          item._id === parentCommentId
            ? {
                ...item,
                replies: [...item.replies, newReply],
                replyCount: item.replyCount + 1,
              }
            : { ...item, replies: updateReplies(item.replies) }
        );

      setDiscussions(updateReplies(discussions));
    } catch {
      setError('Failed to post reply');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDiscussion = async (commentId: string, content: string) => {
    try {
      setLoading(true);
      const updateContent = (items: Discussion[]): Discussion[] =>
        items.map(item =>
          item._id === commentId
            ? {
                ...item,
                content,
                updatedAt: new Date().toISOString(),
                editHistory: [
                  ...item.editHistory,
                  { content: item.content, editedAt: new Date().toISOString() },
                ],
              }
            : { ...item, replies: updateContent(item.replies) }
        );

      setDiscussions(updateContent(discussions));
    } catch {
      setError('Failed to update discussion');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDiscussion = async (commentId: string) => {
    try {
      setLoading(true);
      const deleteItem = (items: Discussion[]): Discussion[] =>
        items
          .filter(item => item._id !== commentId)
          .map(item => ({ ...item, replies: deleteItem(item.replies) }));

      setDiscussions(deleteItem(discussions));
    } catch {
      setError('Failed to delete discussion');
    } finally {
      setLoading(false);
    }
  };

  const handleReportDiscussion = async (
    commentId: string,
    reason: string,
    description?: string
  ) => {
    try {
      setLoading(true);
      // Example: replace this console.log with actual API call
      void { commentId, reason, description }; // ✅ avoids eslint 'no-unused-vars'
    } catch {
      setError('Failed to report discussion');
    } finally {
      setLoading(false);
    }
  };

  if (loading && discussions.length === 0)
    return (
      <div className='flex w-full items-center justify-center py-8 text-gray-500'>
        Loading discussions...
      </div>
    );

  if (error && discussions.length === 0)
    return (
      <div className='w-full py-4 text-center text-red-600'>
        Error loading discussions: {error}
        <button
          onClick={() => setError(null)}
          className='mx-auto mt-2 block rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700'
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

      {error && (
        <div className='mx-4 mt-4 rounded-md border border-red-200 bg-red-50 p-3 md:mx-0'>
          <p className='text-sm text-red-600'>{error}</p>
        </div>
      )}
    </div>
  );
}
