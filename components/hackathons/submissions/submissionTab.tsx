'use client';

import { useState } from 'react';
import { Search, ChevronDown, Plus, Edit } from 'lucide-react';
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
import { useParams } from 'next/navigation';

interface SubmissionTabProps {
  hackathonSlugOrId?: string;
  organizationId?: string;
}

const SubmissionTab: React.FC<SubmissionTabProps> = ({
  hackathonSlugOrId,
  organizationId,
}) => {
  const params = useParams();
  const { isAuthenticated } = useAuthStatus();
  const { currentHackathon } = useHackathonData();
  const hackathonId =
    hackathonSlugOrId ||
    (params.slug as string) ||
    currentHackathon?.slug ||
    '';
  const orgId = organizationId || undefined;

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
  const {
    submission: mySubmission,
    isFetching: isLoadingMySubmission,
    fetchMySubmission,
  } = useSubmission({
    hackathonSlugOrId: hackathonId,
    organizationId: orgId,
    autoFetch: isAuthenticated && !!hackathonId,
  });

  const handleViewSubmission = (submissionId?: string) => {
    if (submissionId) {
      setSelectedSubmissionId(submissionId);
      setShowDetailModal(true);
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

  return (
    <div className='w-full'>
      {/* Stats Section */}
      <div className='mb-6 flex items-center justify-between text-left text-sm'>
        <span className='text-gray-400'>
          <span className='font-semibold text-[#a7f950]'>
            {submissions.filter(p => p.status === 'Approved').length}
          </span>{' '}
          total approved submissions
        </span>
        {isAuthenticated && hackathonId && (
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
        )}
      </div>

      {/* My Submission Section */}
      {isAuthenticated && hackathonId && (
        <div className='mb-6'>
          {isLoadingMySubmission ? (
            <div className='rounded-lg border border-gray-700 bg-gray-800/50 p-6 text-center'>
              <p className='text-gray-400'>Loading your submission...</p>
            </div>
          ) : mySubmission ? (
            <div className='mb-6 rounded-lg border border-[#a7f950]/30 bg-gray-800/50 p-4'>
              <div className='mb-2 flex items-center justify-between'>
                <h3 className='text-lg font-semibold text-white'>
                  Your Submission
                </h3>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setShowCreateModal(true)}
                  className='border-gray-700 text-white hover:bg-gray-800'
                >
                  <Edit className='mr-2 h-4 w-4' />
                  Edit
                </Button>
              </div>
              <SubmissionCard
                title={mySubmission.projectName}
                description={mySubmission.description}
                submitterName='You'
                category={mySubmission.category}
                status={
                  mySubmission.status === 'submitted' ? 'Pending' : 'Approved'
                }
                upvotes={
                  typeof mySubmission.votes === 'number'
                    ? mySubmission.votes
                    : 0
                }
                comments={
                  typeof mySubmission.comments === 'number'
                    ? mySubmission.comments
                    : 0
                }
                submittedDate={mySubmission.submissionDate}
                image={mySubmission.logo || '/placeholder.svg'}
                onViewClick={() => setShowCreateModal(true)}
                onUpvoteClick={() => {}}
                onCommentClick={() => {}}
              />
            </div>
          ) : (
            <div className='mb-6 rounded-lg border border-gray-700 bg-gray-800/50 p-6 text-center'>
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
        </div>
      )}

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
            className='w-full rounded-lg border-gray-900 bg-[#030303] py-3 pr-4 pl-10 text-base text-white placeholder-gray-400 focus:border-gray-400 focus:ring-1 focus:ring-gray-400'
          />
        </div>
      </div>

      {/* Submissions Grid */}
      {submissions.length > 0 ? (
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {submissions
            .filter(submission => submission.status === 'Approved')
            .map((submission, index) => (
              <SubmissionCard
                key={submission._id || index}
                {...submission}
                submissionId={(submission as { _id?: string })?._id}
                onViewClick={() =>
                  handleViewSubmission((submission as { _id?: string })?._id)
                }
                onUpvoteClick={() => {
                  if (!isAuthenticated) {
                    // Authentication check is handled in the hook, but we can show a message
                    return;
                  }
                  handleUpvoteSubmission((submission as { _id?: string })?._id);
                }}
                onCommentClick={() => {
                  if (!isAuthenticated) {
                    // Authentication check is handled in the hook, but we can show a message
                    return;
                  }
                  handleCommentSubmission(
                    (submission as { _id?: string })?._id
                  );
                }}
              />
            ))}
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
            submissionId={mySubmission?._id}
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
    </div>
  );
};

export default SubmissionTab;
