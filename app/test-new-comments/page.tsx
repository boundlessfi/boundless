'use client';

import { useState } from 'react';
import { GenericCommentThread } from '@/components/comments/GenericCommentThread';
import { CommentModerationDashboard } from '@/components/comments/CommentModerationDashboard';
import { useCommentSystem } from '@/hooks/use-comment-system';
import { CommentEntityType } from '@/types/comment';
// import { useAuth } from '@/hooks/use-auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { authClient } from '@/lib/auth-client';

export default function TestNewCommentsPage() {
  // const { user } = useAuth();
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const [entityType, setEntityType] = useState<CommentEntityType>(
    CommentEntityType.CROWDFUNDING_CAMPAIGN
  );
  const [entityId, setEntityId] = useState('cmix8iec400012bpa7xq3a1df');

  // Current user info
  const currentUser = user
    ? {
        id: user.id,
        name: user.name || user.email || 'Anonymous',
        username: (user.profile as any)?.username,
        image: user.image || undefined,
        isModerator:
          (user.roles as any)?.moderator === true ||
          (user.roles as any)?.admin === true,
      }
    : {
        id: 'anonymous',
        name: 'Anonymous',
        username: undefined,
        image: undefined,
        isModerator: false,
      };

  // Initialize the comment system
  const commentSystem = useCommentSystem({
    entityType,
    entityId,
    page: 1,
    limit: 20,
    enabled: true,
  });

  // Real-time connection status is handled by the hooks

  const entityOptions = [
    { value: CommentEntityType.PROJECT, label: 'Project' },
    { value: CommentEntityType.BOUNTY, label: 'Bounty' },
    {
      value: CommentEntityType.CROWDFUNDING_CAMPAIGN,
      label: 'Crowdfunding Campaign',
    },
    { value: CommentEntityType.GRANT, label: 'Grant' },
    { value: CommentEntityType.HACKATHON, label: 'Hackathon' },
    {
      value: CommentEntityType.HACKATHON_SUBMISSION,
      label: 'Hackathon Submission',
    },
  ];

  return (
    <div className='min-h-screen bg-[#0A0A0A] py-8'>
      <div className='mx-auto max-w-6xl px-4'>
        <div className='mb-8'>
          <h1 className='mb-2 text-3xl font-bold text-white'>
            Comment System Test
          </h1>
          <p className='text-gray-400'>
            Test the new comprehensive comment system with real-time updates,
            reactions, and moderation
          </p>
          <div className='mt-4 flex items-center gap-4'>
            <Badge variant='secondary' className='bg-green-100 text-green-800'>
              ✅ Real-time WebSocket
            </Badge>
            <Badge variant='secondary' className='bg-blue-100 text-blue-800'>
              ✅ 8 Reaction Types
            </Badge>
            <Badge
              variant='secondary'
              className='bg-purple-100 text-purple-800'
            >
              ✅ Content Validation
            </Badge>
            <Badge
              variant='secondary'
              className='bg-orange-100 text-orange-800'
            >
              ✅ Moderation Tools
            </Badge>
            <Badge variant='secondary' className='bg-red-100 text-red-800'>
              ✅ Multi-Entity Support
            </Badge>
          </div>
        </div>

        <Tabs defaultValue='comments' className='w-full'>
          <TabsList className='grid w-full grid-cols-2 border-[#2B2B2B] bg-[#212121]'>
            <TabsTrigger
              value='comments'
              className='data-[state=active]:bg-[#04326B]'
            >
              Comment Thread
            </TabsTrigger>
            <TabsTrigger
              value='moderation'
              className='data-[state=active]:bg-[#04326B]'
            >
              Moderation Dashboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value='comments' className='space-y-6'>
            {/* Entity Selection */}
            <Card className='border-[#2B2B2B] bg-[#212121]'>
              <CardHeader>
                <CardTitle className='text-white'>Test Configuration</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='mb-2 block text-sm font-medium text-white'>
                      Entity Type
                    </label>
                    <select
                      value={entityType}
                      onChange={e =>
                        setEntityType(e.target.value as CommentEntityType)
                      }
                      className='w-full rounded-md border border-[#2B2B2B] bg-[#1A1A1A] px-3 py-2 text-white focus:border-[#04326B] focus:outline-none'
                    >
                      {entityOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className='mb-2 block text-sm font-medium text-white'>
                      Entity ID
                    </label>
                    <input
                      type='text'
                      value={entityId}
                      onChange={e => setEntityId(e.target.value)}
                      className='w-full rounded-md border border-[#2B2B2B] bg-[#1A1A1A] px-3 py-2 text-white focus:border-[#04326B] focus:outline-none'
                      placeholder='Enter entity ID'
                    />
                  </div>
                </div>

                <div className='mt-4 rounded-md border border-[#2B2B2B] bg-[#1A1A1A] p-4'>
                  <h4 className='mb-2 text-sm font-medium text-white'>
                    API Response Preview
                  </h4>
                  <p className='mb-2 text-xs text-gray-400'>
                    Based on your backend response, the system expects this
                    structure:
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Comment Thread */}
            <Card className='border-[#2B2B2B] bg-[#212121]'>
              <CardHeader>
                <CardTitle className='text-white'>
                  Comments for{' '}
                  {entityOptions.find(o => o.value === entityType)?.label}:{' '}
                  {entityId}
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {/* System Stats */}
                <div className='flex flex-wrap items-center gap-4 text-sm'>
                  <div className='flex items-center gap-2'>
                    <div className='h-2 w-2 rounded-full bg-green-500'></div>
                    <span className='text-gray-400'>
                      Comments: {commentSystem.comments.pagination.totalItems}
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div
                      className={`h-2 w-2 rounded-full ${commentSystem.comments.loading ? 'bg-yellow-500' : 'bg-green-500'}`}
                    ></div>
                    <span className='text-gray-400'>
                      Loading: {commentSystem.comments.loading ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div
                      className={`h-2 w-2 rounded-full ${commentSystem.comments.error ? 'bg-red-500' : 'bg-green-500'}`}
                    ></div>
                    <span className='text-gray-400'>
                      Error: {commentSystem.comments.error || 'None'}
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className='h-2 w-2 animate-pulse rounded-full bg-blue-500'></div>
                    <span className='text-gray-400'>Real-time: Connected</span>
                  </div>
                </div>

                {/* WebSocket Info */}
                <div className='mt-4 rounded-md border border-[#2B2B2B] bg-[#1A1A1A] p-3'>
                  <h4 className='mb-2 text-sm font-medium text-white'>
                    Real-time WebSocket Configuration
                  </h4>
                  <div className='space-y-1 text-xs text-gray-300'>
                    <div>
                      <strong>Namespace:</strong>{' '}
                      <code className='rounded bg-black px-1'>/realtime</code>
                    </div>
                    <div>
                      <strong>Room:</strong>{' '}
                      <code className='rounded bg-black px-1'>
                        {entityType}:{entityId}
                      </code>
                    </div>
                    <div>
                      <strong>Events:</strong>{' '}
                      <code className='rounded bg-black px-1'>
                        entity-update
                      </code>
                    </div>
                    <div>
                      <strong>Supported Operations:</strong>
                    </div>
                    <ul className='mt-1 ml-4 space-y-1'>
                      <li>
                        • <code>comment-added</code> - New comments appear
                        instantly
                      </li>
                      <li>
                        • <code>comment-updated</code> - Edits sync immediately
                      </li>
                      <li>
                        • <code>comment-deleted</code> - Deletions happen live
                      </li>
                      <li>
                        • <code>reaction-added/removed</code> - Reaction counts
                        update real-time
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Real-time Events Monitor */}
                <div className='mt-4 rounded-md border border-[#2B2B2B] bg-[#1A1A1A] p-3'>
                  <h4 className='mb-2 text-sm font-medium text-white'>
                    Real-time Events Monitor
                  </h4>
                  <div className='text-xs text-gray-300'>
                    <p>
                      Open this page in multiple tabs to test real-time updates!
                    </p>
                    <p>
                      When you add/edit/delete comments in one tab, they will
                      appear instantly in others.
                    </p>
                    <div className='mt-2 rounded bg-black p-2 font-mono text-green-400'>
                      Listening for: entity-update ({entityType}:{entityId})
                    </div>
                  </div>
                </div>

                {/* Raw Data Preview */}
                {commentSystem.comments.comments.length > 0 && (
                  <div className='mb-4 rounded-md border border-[#2B2B2B] bg-[#1A1A1A] p-3'>
                    <h4 className='mb-2 text-sm font-medium text-white'>
                      Raw Comment Data
                    </h4>
                  </div>
                )}

                <GenericCommentThread
                  entityType={entityType}
                  entityId={entityId}
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
                  showModeration={true}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='moderation'>
            <CommentModerationDashboard />
          </TabsContent>
        </Tabs>

        {/* Features Overview */}
        <Card className='mt-8 border-[#2B2B2B] bg-[#212121]'>
          <CardHeader>
            <CardTitle className='text-white'>System Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
              <div className='space-y-2'>
                <h4 className='font-semibold text-white'>Comment Management</h4>
                <ul className='space-y-1 text-sm text-gray-400'>
                  <li>• Create, edit, delete comments</li>
                  <li>• Threaded/nested replies</li>
                  <li>• Content validation</li>
                  <li>• Rate limiting protection</li>
                </ul>
              </div>

              <div className='space-y-2'>
                <h4 className='font-semibold text-white'>Reactions System</h4>
                <ul className='space-y-1 text-sm text-gray-400'>
                  <li>• 8 reaction types</li>
                  <li>• 👍 👎 ❤️ 😂 👍 👎 🔥 🚀</li>
                  <li>• Real-time reaction counts</li>
                  <li>• User reaction tracking</li>
                </ul>
              </div>

              <div className='space-y-2'>
                <h4 className='font-semibold text-white'>Real-time Updates</h4>
                <ul className='space-y-1 text-sm text-gray-400'>
                  <li>• WebSocket /realtime namespace</li>
                  <li>• Room-based subscriptions</li>
                  <li>• Live comment CRUD operations</li>
                  <li>• Real-time reaction updates</li>
                  <li>• Instant moderation changes</li>
                </ul>
              </div>

              <div className='space-y-2'>
                <h4 className='font-semibold text-white'>Moderation</h4>
                <ul className='space-y-1 text-sm text-gray-400'>
                  <li>• Comment reporting</li>
                  <li>• Status management</li>
                  <li>• Content filtering</li>
                  <li>• Moderation dashboard</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
