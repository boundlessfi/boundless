import React, { useState } from 'react';
import {
  Search,
  ChevronDown,
  Plus,
  LayoutGrid,
  LayoutList,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import SubmissionCard from './submissionCard';
import SubmissionCard2 from './submissionCard2';
import { SubmissionScreenWrapper } from './SubmissionForm';
import { SubmissionDetailModal } from './SubmissionDetailModal';
import { useSubmissions } from '@/hooks/hackathon/use-submissions';
import { useSubmission } from '@/hooks/hackathon/use-submission';
import { useHackathonData } from '@/lib/providers/hackathonProvider';
import { useAuthStatus } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';
import { useExpandableScreen } from '@/components/ui/expandable-screen';
import { toast } from 'sonner';
import { useHackathonStatus } from '@/hooks/hackathon/use-hackathon-status';
import { reportError } from '@/lib/error-reporting';
import { cn } from '@/lib/utils';

type ViewMode = 'grid' | 'list';

interface SubmissionTabProps {
  // hackathonSlugOrId?: string;
  organizationId?: string;
  isRegistered: boolean;
}

interface SubmissionTabContentProps extends SubmissionTabProps {
  mySubmission: any; // Type properly if possible
  isLoadingMySubmission: boolean;
  fetchMySubmission: () => Promise<any>;
  removeSubmission: (id: string) => Promise<void>;
  hackathonId: string;
}

const SubmissionTabContent: React.FC<SubmissionTabContentProps> = ({
  organizationId,
  isRegistered,
  mySubmission,
  isLoadingMySubmission,
  fetchMySubmission,
  removeSubmission,
  hackathonId,
}) => {
  const { isAuthenticated } = useAuthStatus();
  const router = useRouter();
  const { expand } = useExpandableScreen();

  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const {
    submissions,
    searchTerm,
    selectedSort,
    selectedCategory,
    sortOptions,
    categoryOptions,
    setSearchTerm,
    setSelectedSort,
    setSelectedCategory,
  } = useSubmissions();
  const { currentHackathon } = useHackathonData();
  const { status } = useHackathonStatus(
    currentHackathon?.startDate,
    currentHackathon?.submissionDeadline
  );
  const isDeadlinePassed = status === 'ended';

  const [selectedSubmissionId, setSelectedSubmissionId] = useState<
    string | null
  >(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [submissionToDelete, setSubmissionToDelete] = useState<string | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const handleViewSubmission = (submissionId?: string) => {
    if (submissionId) {
      router.push(`/projects/${submissionId}?type=submission`);
    }
  };

  const handleUpvoteSubmission = (submissionId?: string) => {
    if (submissionId) {
      setSelectedSubmissionId(submissionId);
      setShowDetailModal(true);
    }
  };

  const handleCommentSubmission = (submissionId?: string) => {
    if (submissionId) {
      setSelectedSubmissionId(submissionId);
      setShowDetailModal(true);
    }
  };

  const handleDeleteClick = (submissionId: string) => {
    setSubmissionToDelete(submissionId);
  };

  const handleConfirmDelete = async () => {
    if (submissionToDelete) {
      setIsDeleting(true);
      try {
        await removeSubmission(submissionToDelete);
        setSubmissionToDelete(null);
        toast.success('Submission deleted successfully');
      } catch (error) {
        reportError(error, {
          context: 'submission-delete',
          submissionToDelete,
        });
        toast.error('Failed to delete submission');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className='w-full'>
      {/* Stats Section */}
      <div className='mb-6 flex items-center justify-between text-left text-sm'>
        <span className='text-gray-400'>
          <span className='font-semibold text-[#a7f950]'>
            {
              submissions.filter(
                p =>
                  p.status?.toLowerCase() === 'shortlisted' ||
                  p.status === 'Approved'
              ).length
            }
          </span>{' '}
          total approved submissions
        </span>
        {/* Helper button removed, triggers handled via Empty state or My Submission card */}
      </div>

      {/* Filters */}
      <div className='mb-8 flex flex-col items-start gap-4 md:flex-row md:items-center'>
        <div className='flex w-full flex-wrap items-center gap-3 md:w-auto'>
          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='outline'
                className='min-w-[140px] justify-between rounded-lg border-white/24 bg-transparent px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 hover:text-white'
              >
                <div className='flex items-center gap-2'>{selectedSort}</div>
                <ChevronDown className='ml-2 h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align='start'
              className='border-white/24 bg-black text-sm text-white'
            >
              {sortOptions.map(option => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setSelectedSort(option.label)}
                  className='cursor-pointer text-sm hover:bg-gray-800'
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Category Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='outline'
                className='min-w-[140px] justify-between rounded-lg border-white/24 bg-transparent px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 hover:text-white'
              >
                {selectedCategory}
                <ChevronDown className='ml-2 h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align='start'
              className='max-h-[300px] overflow-y-auto border-white/24 bg-black text-white'
            >
              {categoryOptions.map(option => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setSelectedCategory(option.label)}
                  className='cursor-pointer hover:bg-gray-800'
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Search Input + View Toggle */}
        <div className='flex w-full items-center gap-2 md:ml-auto md:max-w-xl'>
          <div className='relative flex-1'>
            <Search className='absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-white/40' />
            <Input
              type='text'
              placeholder='Search by project name or participant...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='bg-backgound-main-bg w-full rounded-lg border-gray-900 py-3 pr-4 pl-10 text-base text-white placeholder-gray-400 focus:border-gray-400 focus:ring-1 focus:ring-gray-400'
            />
          </div>

          {/* View mode toggle */}
          <div className='flex shrink-0 overflow-hidden rounded-lg border border-zinc-800'>
            <button
              type='button'
              onClick={() => setViewMode('grid')}
              className={cn(
                'flex h-10 w-10 items-center justify-center transition-colors',
                viewMode === 'grid'
                  ? 'bg-zinc-700 text-white'
                  : 'bg-transparent text-zinc-500 hover:text-zinc-300'
              )}
              title='Grid view'
            >
              <LayoutGrid className='h-4 w-4' />
            </button>
            <button
              type='button'
              onClick={() => setViewMode('list')}
              className={cn(
                'flex h-10 w-10 items-center justify-center border-l border-zinc-800 transition-colors',
                viewMode === 'list'
                  ? 'bg-zinc-700 text-white'
                  : 'bg-transparent text-zinc-500 hover:text-zinc-300'
              )}
              title='List view'
            >
              <LayoutList className='h-4 w-4' />
            </button>
          </div>
        </div>
      </div>

      {/* Submissions Grid with Create Button if no submission */}
      {!isLoadingMySubmission &&
        !mySubmission &&
        isAuthenticated &&
        isRegistered && (
          <div className='mb-8 rounded-lg border border-dashed border-gray-700 bg-gray-800/20 p-8 text-center'>
            <p className='mb-4 text-gray-400'>
              You haven't submitted a project yet.
            </p>
            <Button
              onClick={expand}
              disabled={isDeadlinePassed}
              className='bg-[#a7f950] text-black hover:bg-[#8fd93f] disabled:cursor-not-allowed disabled:opacity-50'
            >
              <Plus className='mr-2 h-4 w-4' />
              {isDeadlinePassed
                ? 'Submission Deadline Passed'
                : 'Create Your Submission'}
            </Button>
          </div>
        )}

      {/* Submissions Grid / List */}
      {submissions.length > 0 || mySubmission ? (
        <div
          className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'
              : 'flex flex-col gap-2'
          )}
        >
          {/* Pinned User Submission — always SubmissionCard (has edit/delete) */}
          {mySubmission && (
            <SubmissionCard
              key='my-submission'
              title={mySubmission.projectName}
              description={mySubmission.description}
              submitterName='You'
              category={mySubmission.category}
              status={
                mySubmission.status?.toLowerCase() === 'shortlisted'
                  ? 'Approved'
                  : mySubmission.status?.toLowerCase() === 'disqualified'
                    ? 'Rejected'
                    : 'Pending'
              }
              upvotes={
                typeof mySubmission.votes === 'number'
                  ? mySubmission.votes
                  : Array.isArray(mySubmission.votes)
                    ? mySubmission.votes.length
                    : 0
              }
              comments={
                typeof mySubmission.comments === 'number'
                  ? mySubmission.comments
                  : Array.isArray(mySubmission.comments)
                    ? mySubmission.comments.length
                    : 0
              }
              submittedDate={mySubmission.submissionDate}
              image={mySubmission.logo || '/placeholder.svg'}
              submissionId={mySubmission.id}
              isPinned={true}
              isMySubmission={true}
              isDeadlinePassed={isDeadlinePassed}
              onViewClick={() => handleViewSubmission(mySubmission.id)}
              onEditClick={expand}
              onDeleteClick={() => handleDeleteClick(mySubmission.id)}
              onUpvoteClick={() => {}}
              onCommentClick={() => {}}
            />
          )}

          {submissions
            .filter(submission =>
              mySubmission ? submission._id !== mySubmission.id : true
            )
            .map((submission, index) => {
              const submissionId =
                (submission as { _id?: string; id?: string })?._id ||
                (submission as { id?: string })?.id;

              const status =
                submission.status?.toLowerCase() === 'shortlisted'
                  ? 'Approved'
                  : submission.status?.toLowerCase() === 'disqualified'
                    ? 'Rejected'
                    : 'Pending';

              const voteCount =
                submission.votes?.current ?? submission.upvotes ?? 0;
              const commentCount = submission.comments ?? 0;

              if (viewMode === 'list') {
                return (
                  <SubmissionCard2
                    key={submissionId || index}
                    title={submission.projectName}
                    submitterName={submission.submitterName}
                    submitterAvatar={submission.submitterAvatar}
                    image={submission.logo ?? '/placeholder.svg'}
                    upvotes={voteCount}
                    comments={commentCount}
                    submittedDate={submission.submittedDate}
                    submissionId={submissionId}
                    onViewClick={() => handleViewSubmission(submissionId)}
                    onUpvoteClick={() => {
                      if (!isAuthenticated) return;
                      handleUpvoteSubmission(submissionId);
                    }}
                    onCommentClick={() => {
                      if (!isAuthenticated) return;
                      handleCommentSubmission(submissionId);
                    }}
                  />
                );
              }

              return (
                <SubmissionCard
                  key={submissionId || index}
                  title={submission.projectName}
                  description={submission.description}
                  submitterName={submission.submitterName}
                  submitterAvatar={submission.submitterAvatar}
                  category={submission.category}
                  categories={submission.categories}
                  status={status}
                  upvotes={voteCount}
                  comments={commentCount}
                  submittedDate={submission.submittedDate}
                  image={submission.logo ?? '/placeholder.svg'}
                  submissionId={submissionId}
                  onViewClick={() => handleViewSubmission(submissionId)}
                  onUpvoteClick={() => {
                    if (!isAuthenticated) return;
                    handleUpvoteSubmission(submissionId);
                  }}
                  onCommentClick={() => {
                    if (!isAuthenticated) return;
                    handleCommentSubmission(submissionId);
                  }}
                />
              );
            })}
        </div>
      ) : (
        <div className='flex min-h-[400px] items-center justify-center'>
          <div className='text-center'>
            <p className='text-xl text-gray-400'>No submissions found</p>
            <p className='mt-2 text-sm text-gray-500'>
              {searchTerm || selectedCategory !== 'All Categories'
                ? 'Try adjusting your filters or search term'
                : 'Be the first to submit a project!'}
            </p>
          </div>
        </div>
      )}

      {selectedSubmissionId && (
        <SubmissionDetailModal
          open={showDetailModal}
          onOpenChange={setShowDetailModal}
          hackathonSlugOrId={hackathonId}
          submissionId={selectedSubmissionId}
          organizationId={organizationId}
          onVoteChange={() => {
            // Refresh submissions list if needed
          }}
        />
      )}

      <AlertDialog
        open={!!submissionToDelete}
        onOpenChange={open => {
          if (!open) {
            setSubmissionToDelete(null);
          }
        }}
      >
        <AlertDialogContent className='bg-background-main-bg border-gray-800 text-white'>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Submission</AlertDialogTitle>
            <AlertDialogDescription className='text-gray-400'>
              Are you sure you want to delete this submission? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className='border-gray-700 text-white hover:bg-gray-800'>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className='bg-red-600 text-white hover:bg-red-700 disabled:opacity-50'
            >
              {isDeleting ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const SubmissionTab: React.FC<SubmissionTabProps> = ({
  organizationId,
  isRegistered,
}) => {
  const { currentHackathon } = useHackathonData();
  const hackathonId = currentHackathon?.id || '';
  const hackathonSlug = currentHackathon?.slug || '';
  const orgId = organizationId || undefined;
  const { isAuthenticated } = useAuthStatus();

  const {
    submission: mySubmission,
    isFetching: isLoadingMySubmission,
    fetchMySubmission,
    remove: removeSubmission,
  } = useSubmission({
    hackathonSlugOrId: hackathonSlug || '',
    autoFetch: isAuthenticated && !!hackathonId,
  });

  return (
    <SubmissionScreenWrapper
      hackathonSlugOrId={hackathonSlug}
      organizationId={orgId}
      initialData={
        mySubmission
          ? {
              projectName: mySubmission.projectName,
              category: mySubmission.category,
              description: mySubmission.description,
              logo: mySubmission.logo,
              videoUrl: mySubmission.videoUrl,
              introduction: mySubmission.introduction,
              links: mySubmission.links,
              participationType: (mySubmission as any).participationType, // added support in wrapper/modal
            }
          : undefined
      }
      submissionId={mySubmission?.id}
      onSuccess={() => {
        fetchMySubmission();
      }}
    >
      <SubmissionTabContent
        organizationId={orgId}
        isRegistered={isRegistered}
        mySubmission={mySubmission}
        isLoadingMySubmission={isLoadingMySubmission}
        fetchMySubmission={fetchMySubmission}
        removeSubmission={async (id: string) => {
          await removeSubmission(id);
        }}
        hackathonId={hackathonId}
      />
    </SubmissionScreenWrapper>
  );
};

export default SubmissionTab;
