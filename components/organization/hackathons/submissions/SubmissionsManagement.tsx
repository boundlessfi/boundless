import { useState } from 'react';
import type { FormEvent } from 'react';
import {
  Search,
  Grid3x3,
  List,
  RefreshCw,
  CheckSquare,
  CheckCircle,
  RotateCcw,
  Ban,
} from 'lucide-react';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { SubmissionsList } from './SubmissionsList';
import { DisqualifyDialog } from './DisqualifyDialog';
import type { ParticipantSubmission } from '@/lib/api/hackathons';
import { useReviewSubmission } from '@/hooks/hackathon/use-review-submission';
import { useDisqualifySubmission } from '@/hooks/hackathon/use-disqualify-submission';
import { useBulkAction } from '@/hooks/hackathon/use-bulk-action';
import { useUpdateRank } from '@/hooks/hackathon/use-update-rank';

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

type SubmissionStatus =
  | 'SUBMITTED'
  | 'SHORTLISTED'
  | 'DISQUALIFIED'
  | 'WITHDRAWN';

type SubmissionType = 'INDIVIDUAL' | 'TEAM';

interface SubmissionFilters {
  status?: SubmissionStatus;
  type?: SubmissionType;
  search?: string;
}

interface SubmissionsManagementProps {
  submissions: ParticipantSubmission[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: SubmissionFilters;
  loading: boolean;
  onFilterChange: (filters: SubmissionFilters) => void;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
  organizationId?: string;
  hackathonId?: string;
}

/* -------------------------------------------------------------------------- */
/*                              Main Component                                */
/* -------------------------------------------------------------------------- */

export function SubmissionsManagement({
  submissions,
  pagination,
  filters,
  loading,
  onFilterChange,
  onPageChange,
  onRefresh,
  organizationId,
  hackathonId,
}: SubmissionsManagementProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchTerm, setSearchTerm] = useState(filters.search ?? '');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkDisqualifyDialog, setShowBulkDisqualifyDialog] =
    useState(false);

  // Hooks
  const { review } = useReviewSubmission();
  const { disqualify } = useDisqualifySubmission();
  const { performBulkAction, isLoading: isBulkLoading } = useBulkAction();
  const { updateRank } = useUpdateRank();

  const handleReview = async (
    submissionId: string,
    status: 'SHORTLISTED' | 'SUBMITTED'
  ) => {
    if (!organizationId || !hackathonId) return;
    await review(organizationId, hackathonId, submissionId, { status });
    onRefresh();
  };

  const handleDisqualify = async (submissionId: string, reason: string) => {
    if (!organizationId || !hackathonId) return;
    await disqualify(organizationId, hackathonId, submissionId, {
      disqualificationReason: reason,
    });
    onRefresh();
  };

  const handleRankUpdate = async (submissionId: string, rank: number) => {
    if (!organizationId || !hackathonId) return;
    await updateRank(organizationId, hackathonId, submissionId, rank);
    onRefresh();
  };

  const handleBulkAction = async (
    action: 'SHORTLISTED' | 'SUBMITTED' | 'DISQUALIFIED',
    reason?: string
  ) => {
    if (!organizationId || !hackathonId || selectedIds.length === 0) return;

    if (action === 'DISQUALIFIED' && !reason) {
      setShowBulkDisqualifyDialog(true);
      return;
    }

    await performBulkAction(organizationId, hackathonId, {
      submissionIds: selectedIds,
      action,
      reason,
    });

    setSelectedIds([]);
    onRefresh();
  };

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    onFilterChange({ ...filters, search: searchTerm });
  };

  const handleStatusChange = (value: string) => {
    onFilterChange({
      ...filters,
      status: value === 'all' ? undefined : (value as SubmissionStatus),
    });
  };

  const handleTypeChange = (value: string) => {
    onFilterChange({
      ...filters,
      type: value === 'all' ? undefined : (value as SubmissionType),
    });
  };

  return (
    <div className='space-y-6'>
      {/* Filters and Controls */}
      <div className='flex flex-col gap-4 rounded-xl border border-gray-800/50 bg-gray-900/20 p-4 backdrop-blur-sm md:flex-row md:items-center md:justify-between'>
        {/* Bulk Actions / Search */}
        <div className='flex-1 md:max-w-md'>
          {selectedIds.length > 0 ? (
            <div className='border-primary/20 bg-primary/10 flex items-center gap-2 rounded-lg border p-2'>
              <div className='text-primary flex items-center gap-2 pl-2 text-sm font-medium whitespace-nowrap'>
                <CheckSquare className='h-4 w-4' />
                <span>{selectedIds.length} selected</span>
              </div>
              <div className='bg-primary/20 mx-2 h-4 w-px' />
              <div className='flex gap-2 overflow-x-auto pb-1 md:pb-0'>
                <Button
                  size='sm'
                  onClick={() => handleBulkAction('SHORTLISTED')}
                  disabled={isBulkLoading}
                  className='bg-green-600 whitespace-nowrap text-white hover:bg-green-700'
                >
                  <CheckCircle className='mr-1.5 h-3.5 w-3.5' />
                  Approve
                </Button>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => handleBulkAction('SUBMITTED')}
                  disabled={isBulkLoading}
                  className='border-yellow-600/50 whitespace-nowrap text-yellow-500 hover:bg-yellow-600/10'
                >
                  <RotateCcw className='mr-1.5 h-3.5 w-3.5' />
                  Reset
                </Button>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => setShowBulkDisqualifyDialog(true)}
                  disabled={isBulkLoading}
                  className='border-red-600/50 whitespace-nowrap text-red-500 hover:bg-red-600/10'
                >
                  <Ban className='mr-1.5 h-3.5 w-3.5' />
                  Disqualify
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSearchSubmit}>
              <div className='relative'>
                <Search className='pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400' />
                <Input
                  type='text'
                  placeholder='Search submissions...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='focus:border-primary focus:ring-primary border-gray-700/50 bg-gray-900/50 pl-10 text-white placeholder:text-gray-500'
                />
              </div>
            </form>
          )}
        </div>

        {/* Filters */}
        <div className='flex flex-wrap items-center gap-2'>
          {/* Status Filter */}
          <Select
            value={filters.status ?? 'all'}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className='w-[160px] border-gray-700/50 bg-gray-900/50 text-white'>
              <SelectValue placeholder='Status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Status</SelectItem>
              <SelectItem value='SUBMITTED'>Submitted</SelectItem>
              <SelectItem value='SHORTLISTED'>Shortlisted</SelectItem>
              <SelectItem value='DISQUALIFIED'>Disqualified</SelectItem>
              <SelectItem value='WITHDRAWN'>Withdrawn</SelectItem>
            </SelectContent>
          </Select>

          {/* Type Filter */}
          <Select
            value={filters.type ?? 'all'}
            onValueChange={handleTypeChange}
          >
            <SelectTrigger className='w-[160px] border-gray-700/50 bg-gray-900/50 text-white'>
              <SelectValue placeholder='Type' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Types</SelectItem>
              <SelectItem value='INDIVIDUAL'>Individual</SelectItem>
              <SelectItem value='TEAM'>Team</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode Toggle */}
          <div className='flex rounded-lg border border-gray-700/50 bg-gray-900/50 p-1'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setViewMode('grid')}
              className={
                viewMode === 'grid'
                  ? 'bg-primary/20 text-primary'
                  : 'text-gray-400 hover:text-white'
              }
            >
              <Grid3x3 className='h-4 w-4' />
            </Button>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setViewMode('table')}
              className={
                viewMode === 'table'
                  ? 'bg-primary/20 text-primary'
                  : 'text-gray-400 hover:text-white'
              }
            >
              <List className='h-4 w-4' />
            </Button>
          </div>

          {/* Refresh */}
          <Button
            variant='ghost'
            size='sm'
            onClick={onRefresh}
            disabled={loading}
            className='border border-gray-700/50 bg-gray-900/50 text-gray-300 hover:bg-gray-800 hover:text-white'
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Results Count */}
      <div className='text-sm text-gray-400'>
        Showing{' '}
        <span className='font-medium text-white'>{submissions.length}</span> of{' '}
        <span className='font-medium text-white'>{pagination.total}</span>{' '}
        submissions
      </div>

      {/* Submissions List */}
      <SubmissionsList
        submissions={submissions}
        viewMode={viewMode}
        loading={loading}
        onRefresh={onRefresh}
        onReview={organizationId && hackathonId ? handleReview : undefined}
        onDisqualify={
          organizationId && hackathonId ? handleDisqualify : undefined
        }
        onUpdateRank={
          organizationId && hackathonId ? handleRankUpdate : undefined
        }
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />

      {/* Bulk Disqualify Dialog */}
      <DisqualifyDialog
        open={showBulkDisqualifyDialog}
        onOpenChange={setShowBulkDisqualifyDialog}
        onSubmit={reason => handleBulkAction('DISQUALIFIED', reason)}
        isSubmitting={isBulkLoading}
      />

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className='flex items-center justify-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1 || loading}
            className='border-gray-700/50 bg-gray-900/50 text-white hover:bg-gray-800'
          >
            Previous
          </Button>
          <span className='text-sm text-gray-400'>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant='outline'
            size='sm'
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages || loading}
            className='border-gray-700/50 bg-gray-900/50 text-white hover:bg-gray-800'
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
