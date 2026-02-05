import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  User,
  Calendar,
  ExternalLink,
  CheckCircle,
  RotateCcw,
  Ban,
  Trophy,
  MoreHorizontal,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DisqualifyDialog } from './DisqualifyDialog';
import type { ParticipantSubmission } from '@/lib/api/hackathons';
import Image from 'next/image';

interface SubmissionsListProps {
  submissions: ParticipantSubmission[];
  viewMode: 'grid' | 'table';
  loading: boolean;
  onRefresh: () => void;
  onReview?: (
    submissionId: string,
    status: 'SHORTLISTED' | 'SUBMITTED'
  ) => Promise<void>;
  onDisqualify?: (submissionId: string, reason: string) => Promise<void>;
  onUpdateRank?: (submissionId: string, rank: number) => Promise<void>;
  selectedIds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
}

export function SubmissionsList({
  submissions,
  viewMode,
  loading,
  onReview,
  onDisqualify,
  onUpdateRank,
  selectedIds = [],
  onSelectionChange,
}: SubmissionsListProps) {
  const router = useRouter();
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [disqualifyingId, setDisqualifyingId] = useState<string | null>(null);
  const [isDisqualifying, setIsDisqualifying] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'SHORTLISTED':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'DISQUALIFIED':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'WITHDRAWN':
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const handleReview = async (
    e: React.MouseEvent,
    submissionId: string,
    newStatus: 'SHORTLISTED' | 'SUBMITTED'
  ) => {
    e.stopPropagation();
    if (!onReview || reviewingId) return;

    setReviewingId(submissionId);
    try {
      await onReview(submissionId, newStatus);
    } finally {
      setReviewingId(null);
    }
  };

  const handleDisqualifyClick = (e: React.MouseEvent, submissionId: string) => {
    e.stopPropagation();
    setDisqualifyingId(submissionId);
  };

  const handleDisqualifySubmit = async (reason: string) => {
    if (!onDisqualify || !disqualifyingId) return;

    setIsDisqualifying(true);
    try {
      await onDisqualify(disqualifyingId, reason);
    } finally {
      setIsDisqualifying(false);
      setDisqualifyingId(null);
    }
  };

  const handleRankUpdate = async (
    e:
      | React.KeyboardEvent<HTMLInputElement>
      | React.FocusEvent<HTMLInputElement>,
    submissionId: string
  ) => {
    if (!onUpdateRank) return;

    // If it's a keyboard event, only proceed on Enter
    if ('key' in e && (e as React.KeyboardEvent).key !== 'Enter') {
      return;
    }

    const value = (e.target as HTMLInputElement).value;
    const rank = parseInt(value);

    // If empty or invalid, ignore
    if (!value || isNaN(rank) || rank < 1) return;

    try {
      await onUpdateRank(submissionId, rank);
      // Optional: show success feedback locally or rely on parent refresh
      (e.target as HTMLInputElement).blur();
    } catch (error) {
      console.error('Failed to update rank', error);
    }
  };

  const toggleSelection = (submissionId: string) => {
    if (!onSelectionChange || !selectedIds) return;
    const newSelection = selectedIds.includes(submissionId)
      ? selectedIds.filter(id => id !== submissionId)
      : [...selectedIds, submissionId];
    onSelectionChange(newSelection);
  };

  const toggleSelectAll = () => {
    if (!onSelectionChange || !selectedIds) return;
    if (selectedIds.length === submissions.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(submissions.map((s: any) => s.id));
    }
  };

  const handleSubmissionClick = (submissionId: string) => {
    router.push(`/projects/${submissionId}?type=submission`);
  };

  if (submissions.length === 0 && !loading) {
    return (
      <div className='flex flex-col items-center justify-center rounded-xl border border-gray-800/50 bg-gray-900/20 py-20 text-center'>
        <p className='text-lg font-medium text-gray-400'>
          No submissions found
        </p>
        <p className='mt-2 text-sm text-gray-500'>
          Try adjusting your filters or check back later
        </p>
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        {submissions.map(submission => {
          const subData = submission as any;
          return (
            <Card
              key={subData.id}
              className={`group hover:border-primary/50 relative cursor-pointer overflow-hidden border-gray-800/50 bg-gray-900/20 transition-all hover:bg-gray-900/40 ${selectedIds?.includes(subData.id) ? 'border-primary/50 bg-primary/5' : ''}`}
              onClick={() => handleSubmissionClick(subData.id)}
            >
              <CardContent className='p-6'>
                {/* Selection Checkbox (Absolute positioning) */}
                {onSelectionChange && (
                  <div
                    className='absolute top-4 right-4 z-10'
                    onClick={e => e.stopPropagation()}
                  >
                    <Checkbox
                      checked={selectedIds?.includes(subData.id)}
                      onCheckedChange={() => toggleSelection(subData.id)}
                      className='data-[state=checked]:bg-primary data-[state=checked]:border-primary border-gray-500'
                    />
                  </div>
                )}

                {/* Logo, Status and Rank */}
                <div className='mb-4 flex items-start justify-between pr-8'>
                  <div className='relative h-16 w-16 overflow-hidden rounded-lg bg-gray-800'>
                    {subData.logo ? (
                      <Image
                        src={subData.logo}
                        alt={subData.projectName}
                        fill
                        className='object-cover'
                      />
                    ) : (
                      <div className='flex h-full w-full items-center justify-center text-2xl font-bold text-gray-600'>
                        {subData.projectName?.charAt(0) || 'P'}
                      </div>
                    )}
                  </div>
                  <Badge className={`${getStatusColor(subData.status)} border`}>
                    {subData.status}
                  </Badge>
                </div>

                {/* Project Name */}
                <h3 className='group-hover:text-primary mb-2 line-clamp-2 text-lg font-semibold text-white'>
                  {subData.projectName || 'Untitled Project'}
                </h3>

                {/* Category */}
                {subData.category && (
                  <p className='mb-3 text-sm text-gray-400'>
                    {subData.category}
                  </p>
                )}

                {/* Type & Date */}
                <div className='mt-4 flex items-center justify-between border-t border-gray-800/50 pt-4 text-xs text-gray-500'>
                  <div className='flex items-center gap-1'>
                    {subData.participationType === 'TEAM' ? (
                      <>
                        <Users className='h-3 w-3' />
                        <span>Team</span>
                      </>
                    ) : (
                      <>
                        <User className='h-3 w-3' />
                        <span>Individual</span>
                      </>
                    )}
                  </div>
                  <div className='flex items-center gap-1'>
                    <Calendar className='h-3 w-3' />
                    <span>
                      {new Date(
                        subData.submittedAt || subData.createdAt
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Review Actions */}
                {onReview &&
                  (subData.status === 'SUBMITTED' ||
                    subData.status === 'SHORTLISTED') && (
                    <div
                      className='mt-4 flex gap-2'
                      onClick={e => e.stopPropagation()}
                    >
                      {subData.status === 'SUBMITTED' ? (
                        <Button
                          size='sm'
                          onClick={e =>
                            handleReview(e, subData.id, 'SHORTLISTED')
                          }
                          disabled={reviewingId === subData.id}
                          className='flex-1 bg-green-600 text-white hover:bg-green-700'
                        >
                          <CheckCircle className='mr-1.5 h-3.5 w-3.5' />
                          {reviewingId === subData.id
                            ? 'Approving...'
                            : 'Approve'}
                        </Button>
                      ) : (
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={e =>
                            handleReview(e, subData.id, 'SUBMITTED')
                          }
                          disabled={reviewingId === subData.id}
                          className='flex-1 border-yellow-600/50 text-yellow-500 hover:bg-yellow-600/10'
                        >
                          <RotateCcw className='mr-1.5 h-3.5 w-3.5' />
                          {reviewingId === subData.id
                            ? 'Moving...'
                            : 'Move to Submitted'}
                        </Button>
                      )}
                      {onDisqualify && (
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={e => handleDisqualifyClick(e, subData.id)}
                          className='border-red-600/50 text-red-500 hover:bg-red-600/10'
                        >
                          <Ban className='mr-1.5 h-3.5 w-3.5' />
                          Disqualify
                        </Button>
                      )}
                    </div>
                  )}

                {/* View Link */}
                <div className='text-primary mt-4 flex items-center gap-1 text-xs opacity-0 transition-opacity group-hover:opacity-100'>
                  <span>View Details</span>
                  <ExternalLink className='h-3 w-3' />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  // Table view
  return (
    <div className='overflow-hidden rounded-xl border border-gray-800/50 bg-gray-900/20'>
      <table className='w-full'>
        <thead className='border-b border-gray-800/50 bg-gray-900/40'>
          <tr>
            {onSelectionChange && (
              <th className='w-12 px-6 py-4'>
                <Checkbox
                  checked={
                    selectedIds?.length === submissions.length &&
                    submissions.length > 0
                  }
                  onCheckedChange={toggleSelectAll}
                  className='data-[state=checked]:bg-primary data-[state=checked]:border-primary border-gray-500'
                />
              </th>
            )}
            <th className='px-6 py-4 text-left text-xs font-medium tracking-wider text-gray-400 uppercase'>
              Rank
            </th>
            <th className='px-6 py-4 text-left text-xs font-medium tracking-wider text-gray-400 uppercase'>
              Project
            </th>
            <th className='px-6 py-4 text-left text-xs font-medium tracking-wider text-gray-400 uppercase'>
              Category
            </th>
            <th className='px-6 py-4 text-left text-xs font-medium tracking-wider text-gray-400 uppercase'>
              Type
            </th>
            <th className='px-6 py-4 text-left text-xs font-medium tracking-wider text-gray-400 uppercase'>
              Status
            </th>
            <th className='px-6 py-4 text-left text-xs font-medium tracking-wider text-gray-400 uppercase'>
              Submitted
            </th>
            {onReview && (
              <th className='px-6 py-4 text-left text-xs font-medium tracking-wider text-gray-400 uppercase'>
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className='divide-y divide-gray-800/50'>
          {submissions.map(submission => {
            const subData = submission as any;
            return (
              <tr
                key={subData.id}
                className='cursor-pointer transition-colors hover:bg-gray-900/40'
                onClick={() => handleSubmissionClick(subData.id)}
              >
                {onSelectionChange && (
                  <td
                    className='w-12 px-6 py-4'
                    onClick={e => e.stopPropagation()}
                  >
                    <Checkbox
                      checked={selectedIds?.includes(subData.id)}
                      onCheckedChange={() => toggleSelection(subData.id)}
                      className='data-[state=checked]:bg-primary data-[state=checked]:border-primary border-gray-500'
                    />
                  </td>
                )}
                <td className='px-6 py-4' onClick={e => e.stopPropagation()}>
                  {onUpdateRank ? (
                    <Input
                      defaultValue={subData.rank || ''}
                      placeholder='-'
                      className='h-8 w-16 border-gray-700 bg-gray-900 text-center text-sm'
                      onKeyDown={e => handleRankUpdate(e, subData.id)}
                      onBlur={e => handleRankUpdate(e, subData.id)}
                    />
                  ) : (
                    <div className='flex items-center justify-center'>
                      {subData.rank ? (
                        <div className='flex items-center gap-1 text-yellow-500'>
                          <Trophy className='h-3 w-3' />
                          <span className='font-mono font-bold'>
                            {subData.rank}
                          </span>
                        </div>
                      ) : (
                        <span className='text-gray-600'>-</span>
                      )}
                    </div>
                  )}
                </td>
                <td className='px-6 py-4'>
                  <div className='flex items-center gap-3'>
                    <div className='relative h-10 w-10 overflow-hidden rounded-lg bg-gray-800'>
                      {subData.logo ? (
                        <Image
                          src={subData.logo}
                          alt={subData.projectName}
                          fill
                          className='object-cover'
                        />
                      ) : (
                        <div className='flex h-full w-full items-center justify-center text-lg font-bold text-gray-600'>
                          {subData.projectName?.charAt(0) || 'P'}
                        </div>
                      )}
                    </div>
                    <span className='font-medium text-white'>
                      {subData.projectName || 'Untitled Project'}
                    </span>
                  </div>
                </td>
                <td className='px-6 py-4 text-gray-400'>
                  {subData.category || '-'}
                </td>
                <td className='px-6 py-4'>
                  <div className='flex items-center gap-1 text-gray-400'>
                    {subData.participationType === 'TEAM' ? (
                      <>
                        <Users className='h-4 w-4' />
                        <span>Team</span>
                      </>
                    ) : (
                      <>
                        <User className='h-4 w-4' />
                        <span>Individual</span>
                      </>
                    )}
                  </div>
                </td>
                <td className='px-6 py-4'>
                  <Badge className={`${getStatusColor(subData.status)} border`}>
                    {subData.status}
                  </Badge>
                </td>
                <td className='px-6 py-4 text-gray-400'>
                  {new Date(
                    subData.submittedAt || subData.createdAt
                  ).toLocaleDateString()}
                </td>
                {onReview && (
                  <td className='px-6 py-4' onClick={e => e.stopPropagation()}>
                    {(subData.status === 'SUBMITTED' ||
                      subData.status === 'SHORTLISTED') && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-8 w-8 p-0'
                          >
                            <MoreHorizontal className='h-4 w-4 text-gray-400' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align='end'
                          className='border-gray-800 bg-black text-white'
                        >
                          {subData.status === 'SUBMITTED' ? (
                            <DropdownMenuItem
                              onClick={e =>
                                handleReview(e, subData.id, 'SHORTLISTED')
                              }
                              disabled={reviewingId === subData.id}
                              className='cursor-pointer text-green-500 focus:bg-green-900/20 focus:text-green-400'
                            >
                              <CheckCircle className='mr-2 h-4 w-4' />
                              {reviewingId === subData.id
                                ? 'Approving...'
                                : 'Approve'}
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={e =>
                                handleReview(e, subData.id, 'SUBMITTED')
                              }
                              disabled={reviewingId === subData.id}
                              className='cursor-pointer text-yellow-500 focus:bg-yellow-900/20 focus:text-yellow-400'
                            >
                              <RotateCcw className='mr-2 h-4 w-4' />
                              {reviewingId === subData.id
                                ? 'Moving...'
                                : 'Move to Submitted'}
                            </DropdownMenuItem>
                          )}
                          {onDisqualify && (
                            <DropdownMenuItem
                              onClick={e =>
                                handleDisqualifyClick(e, subData.id)
                              }
                              className='cursor-pointer text-red-500 focus:bg-red-900/20 focus:text-red-400'
                            >
                              <Ban className='mr-2 h-4 w-4' />
                              Disqualify
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>

      {onDisqualify && (
        <DisqualifyDialog
          open={!!disqualifyingId}
          onOpenChange={open => !open && setDisqualifyingId(null)}
          onSubmit={handleDisqualifySubmit}
          isSubmitting={isDisqualifying}
        />
      )}
    </div>
  );
}
