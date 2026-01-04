'use client';

import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertTriangle,
  EyeOff,
  Trash2,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import {
  Comment,
  CommentReport,
  ReportStatus,
  CommentStatus,
  ReportReason,
} from '@/types/comment';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Mock data for demonstration - in real app this would come from API
const mockReports: CommentReport[] = [
  {
    id: '1',
    commentId: 'comment-1',
    reportedBy: 'user-1',
    reporter: {
      id: 'user-1',
      name: 'Alice Johnson',
      username: 'alice_j',
      image: '/user-avatar.png',
    },
    reason: ReportReason.SPAM,
    description: 'This comment appears to be promotional spam',
    status: ReportStatus.PENDING,
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    commentId: 'comment-2',
    reportedBy: 'user-2',
    reporter: {
      id: 'user-2',
      name: 'Bob Smith',
      username: 'bob_smith',
      image: '/user-avatar.png',
    },
    reason: ReportReason.HARASSMENT,
    description: 'Harassing language towards other users',
    status: ReportStatus.PENDING,
    createdAt: '2024-01-15T11:15:00Z',
  },
];

const mockComments: Comment[] = [
  {
    id: 'comment-1',
    content:
      'This is an amazing project! Check out my website for more details about similar work.',
    entityType: 'PROJECT' as any,
    entityId: 'project-1',
    authorId: 'user-3',
    author: {
      id: 'user-3',
      name: 'Charlie Wilson',
      username: 'charlie_w',
      image: '/user-avatar.png',
    },
    status: CommentStatus.ACTIVE,
    isEdited: false,
    reactionCount: 5,
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
    reactions: [],
    reports: [],
    _count: {
      replies: 0,
      reactions: 5,
      reports: 0,
    },
  },
  {
    id: 'comment-2',
    content:
      'I disagree with this approach completely. Your implementation is flawed.',
    entityType: 'PROJECT' as any,
    entityId: 'project-1',
    authorId: 'user-4',
    author: {
      id: 'user-4',
      name: 'Diana Prince',
      username: 'diana_p',
      image: '/user-avatar.png',
    },
    status: CommentStatus.ACTIVE,
    isEdited: false,
    reactionCount: 2,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    reactions: [],
    reports: [],
    _count: {
      replies: 0,
      reactions: 2,
      reports: 0,
    },
  },
];

interface CommentModerationDashboardProps {
  className?: string;
}

export function CommentModerationDashboard({
  className,
}: CommentModerationDashboardProps) {
  const [reports, setReports] = useState<CommentReport[]>(mockReports);
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [selectedReport, setSelectedReport] = useState<CommentReport | null>(
    null
  );
  const [resolution, setResolution] = useState('');
  const [action, setAction] = useState<'approve' | 'hide' | 'delete' | ''>('');

  // Get comment by ID
  const getCommentById = (commentId: string) => {
    return comments.find(c => c.id === commentId);
  };

  // Handle report resolution
  const handleResolveReport = async (reportId: string) => {
    if (!action || !resolution.trim()) {
      toast.error('Please select an action and provide a resolution');
      return;
    }

    try {
      // In real app, call API to resolve report
      setReports(prev =>
        prev.map(report =>
          report.id === reportId
            ? { ...report, status: ReportStatus.RESOLVED }
            : report
        )
      );

      // Update comment status if needed
      if (selectedReport) {
        const newStatus =
          action === 'hide'
            ? CommentStatus.HIDDEN
            : action === 'delete'
              ? CommentStatus.DELETED
              : CommentStatus.ACTIVE;

        setComments(prev =>
          prev.map(comment =>
            comment.id === selectedReport.commentId
              ? { ...comment, status: newStatus }
              : comment
          )
        );
      }

      toast.success('Report resolved successfully');
      setSelectedReport(null);
      setResolution('');
      setAction('');
    } catch {
      toast.error('Failed to resolve report');
    }
  };

  // Handle dismiss report
  const handleDismissReport = async (reportId: string) => {
    try {
      setReports(prev =>
        prev.map(report =>
          report.id === reportId
            ? { ...report, status: ReportStatus.DISMISSED }
            : report
        )
      );
      toast.success('Report dismissed');
    } catch {
      toast.error('Failed to dismiss report');
    }
  };

  // Filter reports by status
  const pendingReports = reports.filter(r => r.status === ReportStatus.PENDING);
  const resolvedReports = reports.filter(
    r => r.status === ReportStatus.RESOLVED
  );
  const dismissedReports = reports.filter(
    r => r.status === ReportStatus.DISMISSED
  );

  // Get reason badge color
  const getReasonBadgeColor = (reason: ReportReason) => {
    switch (reason) {
      case ReportReason.SPAM:
        return 'bg-yellow-100 text-yellow-800';
      case ReportReason.HARASSMENT:
        return 'bg-red-100 text-red-800';
      case ReportReason.HATE_SPEECH:
        return 'bg-red-100 text-red-800';
      case ReportReason.INAPPROPRIATE_CONTENT:
        return 'bg-orange-100 text-orange-800';
      case ReportReason.COPYRIGHT_VIOLATION:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-white'>Comment Moderation</h1>
          <p className='text-gray-400'>
            Manage reported comments and moderate content
          </p>
        </div>
        <div className='flex items-center gap-4'>
          <Badge variant='secondary' className='bg-yellow-100 text-yellow-800'>
            {pendingReports.length} Pending
          </Badge>
          <Badge variant='secondary' className='bg-green-100 text-green-800'>
            {resolvedReports.length} Resolved
          </Badge>
        </div>
      </div>

      <Tabs defaultValue='pending' className='w-full'>
        <TabsList className='grid w-full grid-cols-3 border-[#2B2B2B] bg-[#212121]'>
          <TabsTrigger
            value='pending'
            className='data-[state=active]:bg-[#04326B]'
          >
            Pending Reports ({pendingReports.length})
          </TabsTrigger>
          <TabsTrigger
            value='resolved'
            className='data-[state=active]:bg-[#04326B]'
          >
            Resolved ({resolvedReports.length})
          </TabsTrigger>
          <TabsTrigger
            value='dismissed'
            className='data-[state=active]:bg-[#04326B]'
          >
            Dismissed ({dismissedReports.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value='pending' className='space-y-4'>
          {pendingReports.length === 0 ? (
            <Card className='border-[#2B2B2B] bg-[#212121]'>
              <CardContent className='flex items-center justify-center py-12'>
                <div className='text-center'>
                  <CheckCircle className='mx-auto mb-4 h-12 w-12 text-green-500' />
                  <h3 className='mb-2 text-lg font-medium text-white'>
                    All caught up!
                  </h3>
                  <p className='text-gray-400'>No pending reports to review</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className='grid gap-4'>
              {pendingReports.map(report => {
                const comment = getCommentById(report.commentId);
                return (
                  <Card
                    key={report.id}
                    className='border-[#2B2B2B] bg-[#212121]'
                  >
                    <CardHeader>
                      <div className='flex items-start justify-between'>
                        <div className='flex items-start gap-3'>
                          <Avatar className='h-10 w-10'>
                            <AvatarImage src={report.reporter.image} />
                            <AvatarFallback>
                              {report.reporter.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className='mb-1 flex items-center gap-2'>
                              <span className='font-medium text-white'>
                                {report.reporter.name}
                              </span>
                              <Badge
                                className={getReasonBadgeColor(report.reason)}
                              >
                                {report.reason.replace('_', ' ')}
                              </Badge>
                            </div>
                            <p className='text-sm text-gray-400'>
                              Reported{' '}
                              {new Date(report.createdAt).toLocaleDateString()}
                            </p>
                            {report.description && (
                              <p className='mt-1 text-sm text-gray-300'>
                                "{report.description}"
                              </p>
                            )}
                          </div>
                        </div>
                        <div className='flex gap-2'>
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={() => handleDismissReport(report.id)}
                            className='border-[#2B2B2B] text-gray-300 hover:bg-[#2B2B2B]'
                          >
                            <XCircle className='mr-1 h-4 w-4' />
                            Dismiss
                          </Button>
                          <Button
                            size='sm'
                            onClick={() => setSelectedReport(report)}
                            className='bg-[#04326B] hover:bg-[#034592]'
                          >
                            <AlertTriangle className='mr-1 h-4 w-4' />
                            Review
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    {comment && (
                      <CardContent>
                        <div className='rounded-lg border border-[#2B2B2B] bg-[#1A1A1A] p-4'>
                          <div className='mb-3 flex items-start gap-3'>
                            <Avatar className='h-8 w-8'>
                              <AvatarImage src={comment.author.image} />
                              <AvatarFallback>
                                {comment.author.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className='flex-1'>
                              <div className='mb-1 flex items-center gap-2'>
                                <span className='font-medium text-white'>
                                  {comment.author.name}
                                </span>
                                <span className='text-xs text-gray-400'>
                                  {new Date(
                                    comment.createdAt
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                              <p className='text-sm text-gray-300'>
                                {comment.content}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value='resolved' className='space-y-4'>
          {resolvedReports.map(report => (
            <Card key={report.id} className='border-[#2B2B2B] bg-[#212121]'>
              <CardContent className='p-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <CheckCircle className='h-5 w-5 text-green-500' />
                    <span className='text-white'>
                      Report #{report.id} - Resolved
                    </span>
                  </div>
                  <Badge className='bg-green-100 text-green-800'>
                    Resolved
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value='dismissed' className='space-y-4'>
          {dismissedReports.map(report => (
            <Card key={report.id} className='border-[#2B2B2B] bg-[#212121]'>
              <CardContent className='p-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <XCircle className='h-5 w-5 text-gray-500' />
                    <span className='text-white'>
                      Report #{report.id} - Dismissed
                    </span>
                  </div>
                  <Badge className='bg-gray-100 text-gray-800'>Dismissed</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Resolution Modal/Dialog */}
      {selectedReport && (
        <Card className='border-[#2B2B2B] bg-[#212121]'>
          <CardHeader>
            <CardTitle className='text-white'>Resolve Report</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <label className='mb-2 block text-sm font-medium text-white'>
                Action
              </label>
              <div className='grid grid-cols-3 gap-2'>
                <Button
                  type='button'
                  variant={action === 'approve' ? 'default' : 'outline'}
                  onClick={() => setAction('approve')}
                  className={cn(
                    'border-[#2B2B2B]',
                    action === 'approve'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'text-gray-300 hover:bg-[#2B2B2B]'
                  )}
                >
                  <CheckCircle className='mr-1 h-4 w-4' />
                  Approve
                </Button>
                <Button
                  type='button'
                  variant={action === 'hide' ? 'default' : 'outline'}
                  onClick={() => setAction('hide')}
                  className={cn(
                    'border-[#2B2B2B]',
                    action === 'hide'
                      ? 'bg-yellow-600 hover:bg-yellow-700'
                      : 'text-gray-300 hover:bg-[#2B2B2B]'
                  )}
                >
                  <EyeOff className='mr-1 h-4 w-4' />
                  Hide
                </Button>
                <Button
                  type='button'
                  variant={action === 'delete' ? 'default' : 'outline'}
                  onClick={() => setAction('delete')}
                  className={cn(
                    'border-[#2B2B2B]',
                    action === 'delete'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'text-gray-300 hover:bg-[#2B2B2B]'
                  )}
                >
                  <Trash2 className='mr-1 h-4 w-4' />
                  Delete
                </Button>
              </div>
            </div>

            <div>
              <label className='mb-2 block text-sm font-medium text-white'>
                Resolution Notes
              </label>
              <textarea
                value={resolution}
                onChange={e => setResolution(e.target.value)}
                placeholder='Explain your decision...'
                className='h-24 w-full rounded-md border border-[#2B2B2B] bg-[#1A1A1A] px-3 py-2 text-white placeholder-gray-400 focus:border-[#04326B] focus:outline-none'
              />
            </div>

            <div className='flex justify-end gap-2'>
              <Button
                variant='outline'
                onClick={() => {
                  setSelectedReport(null);
                  setResolution('');
                  setAction('');
                }}
                className='border-[#2B2B2B] text-gray-300 hover:bg-[#2B2B2B]'
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleResolveReport(selectedReport.id)}
                disabled={!action || !resolution.trim()}
                className='bg-[#04326B] hover:bg-[#034592] disabled:opacity-50'
              >
                Resolve Report
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
