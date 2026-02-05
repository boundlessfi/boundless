'use client';

import React, { useState } from 'react';
import { Search, ChevronDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import SubmissionCard from './submissionCard';
import { CreateSubmissionModal } from './CreateSubmissionModal';
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

interface SubmissionTabProps {
  // hackathonSlugOrId?: string;
  organizationId?: string;
  isRegistered: boolean;
}

const SubmissionTab: React.FC<SubmissionTabProps> = ({
  // hackathonSlugOrId,
  organizationId,
  isRegistered,
}) => {
  // const params = useParams();
  const { isAuthenticated } = useAuthStatus();
  const { currentHackathon } = useHackathonData();
  const hackathonId = currentHackathon?.id || '';
  const orgId = organizationId || undefined;
  const router = useRouter();

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

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<
    string | null
  >(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [submissionToDelete, setSubmissionToDelete] = useState<string | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const {
    submission: mySubmission,
    isFetching: isLoadingMySubmission,
    fetchMySubmission,
    remove: removeSubmission,
  } = useSubmission({
    hackathonSlugOrId: hackathonId,
    organizationId: orgId,
    autoFetch: isAuthenticated && !!hackathonId,
  });

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
      } catch (error) {
        console.error('Failed to delete submission:', error);
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
        {/* {isAuthenticated && hackathonId && (
          <Button
            onClick={() => setShowCreateModal(true)}
            className='bg-[#a7f950] text-black hover:bg-[#8fd93f]'
          >
            {mySubmission ? (
              <>
                <Edit className='mr-2 h-4 w-4' />
                Edit Submission
              </>
            ) : (
              <>
                <Plus className='mr-2 h-4 w-4' />
                Create Submission
              </>
            )}
          </Button>
        )} */}
      </div>

      {/* My Submission Section Removed - Integrated into Grid */}

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

        {/* Search Input */}
        <div className='relative w-full md:ml-auto md:max-w-md'>
          <Search className='absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-white/40' />
          <Input
            type='text'
            placeholder='Search by project name or participant...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='bg-backgound-main-bg w-full rounded-lg border-gray-900 py-3 pr-4 pl-10 text-base text-white placeholder-gray-400 focus:border-gray-400 focus:ring-1 focus:ring-gray-400'
          />
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
              onClick={() => setShowCreateModal(true)}
              className='bg-[#a7f950] text-black hover:bg-[#8fd93f]'
            >
              <Plus className='mr-2 h-4 w-4' />
              Create Your Submission
            </Button>
          </div>
        )}

      {/* Submissions Grid */}
      {submissions.length > 0 || mySubmission ? (
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {/* Pinned User Submission */}
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
                typeof mySubmission.votes === 'number' ? mySubmission.votes : 0
              }
              comments={
                typeof mySubmission.comments === 'number'
                  ? mySubmission.comments
                  : 0
              }
              submittedDate={mySubmission.submissionDate}
              image={mySubmission.logo || '/placeholder.svg'}
              isPinned={true}
              isMySubmission={true}
              onViewClick={() => handleViewSubmission(mySubmission.id)}
              onEditClick={() => setShowCreateModal(true)}
              onDeleteClick={() => handleDeleteClick(mySubmission.id)}
              onUpvoteClick={() => {}}
              onCommentClick={() => {}}
            />
          )}

          {submissions
            .filter(submission =>
              // Filter out my own submission if it's already shown as pinned
              mySubmission ? submission._id !== mySubmission.id : true
            )
            .map((submission, index) => {
              const status =
                submission.status?.toLowerCase() === 'shortlisted'
                  ? 'Approved'
                  : submission.status?.toLowerCase() === 'disqualified'
                    ? 'Rejected'
                    : 'Pending';

              return (
                <SubmissionCard
                  key={submission._id || index}
                  {...submission}
                  status={status}
                  submissionId={(submission as { _id?: string })?._id}
                  onViewClick={() =>
                    handleViewSubmission((submission as { _id?: string })?._id)
                  }
                  onUpvoteClick={() => {
                    if (!isAuthenticated) {
                      return;
                    }
                    handleUpvoteSubmission(
                      (submission as { _id?: string })?._id
                    );
                  }}
                  onCommentClick={() => {
                    if (!isAuthenticated) {
                      return;
                    }
                    handleCommentSubmission(
                      (submission as { _id?: string })?._id
                    );
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

      {hackathonId && (
        <>
          <CreateSubmissionModal
            open={showCreateModal}
            onOpenChange={setShowCreateModal}
            hackathonSlugOrId={hackathonId}
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
                  }
                : undefined
            }
            submissionId={mySubmission?.id}
            onSuccess={() => {
              fetchMySubmission();
            }}
          />
          {selectedSubmissionId && (
            <SubmissionDetailModal
              open={showDetailModal}
              onOpenChange={setShowDetailModal}
              hackathonSlugOrId={hackathonId}
              submissionId={selectedSubmissionId}
              organizationId={orgId}
              onVoteChange={() => {
                // Refresh submissions list if needed
              }}
            />
          )}
        </>
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

export default SubmissionTab;
