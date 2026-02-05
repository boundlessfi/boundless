'use client';

import { useState, useMemo } from 'react';
import { Search, ChevronDown, Plus, Loader2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TeamRecruitmentPostCard } from './TeamRecruitmentPostCard';
import { CreateTeamPostModal } from './CreateTeamPostModal';
import { TeamDetailsSheet } from './TeamDetailsSheet';
import { useTeamPosts } from '@/hooks/hackathon/use-team-posts';
import { useAuthStatus } from '@/hooks/use-auth';
import { useParams } from 'next/navigation';
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
import { type TeamRecruitmentPost } from '@/lib/api/hackathons';
import { MyInvitationsList } from './MyInvitationsList';

interface TeamFormationTabProps {
  hackathonSlugOrId?: string;
  organizationId?: string;
}

export function TeamFormationTab({
  hackathonSlugOrId,
  organizationId,
}: TeamFormationTabProps) {
  const params = useParams();
  const { isAuthenticated, user } = useAuthStatus();
  const hackathonId = hackathonSlugOrId || (params.slug as string) || '';

  const {
    posts,
    myTeam,
    myPosts,
    isLoading,
    isDeleting,
    error,
    fetchPosts,
    deletePost,
    trackContact,
    fetchMyTeam,
    fetchMyPosts,
  } = useTeamPosts({
    hackathonSlugOrId: hackathonId,
    organizationId,
    autoFetch: !!hackathonId,
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPost, setEditingPost] = useState<TeamRecruitmentPost | null>(
    null
  );
  const [deletingPost, setDeletingPost] = useState<TeamRecruitmentPost | null>(
    null
  );
  const [viewingPost, setViewingPost] = useState<TeamRecruitmentPost | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<
    'all' | 'open' | 'closed'
  >('all');
  // Extract all unique roles from posts
  const allRoles = useMemo(() => {
    const roles = new Set<string>();
    posts.forEach(post => {
      post.lookingFor.forEach(role => {
        roles.add(role);
      });
    });
    return Array.from(roles).sort();
  }, [posts]);

  // Filter posts
  const filteredPosts = useMemo(() => {
    let filtered = [...posts];

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        post =>
          post.teamName?.toLowerCase().includes(searchLower) ||
          post.description?.toLowerCase().includes(searchLower) ||
          post.lookingFor.some(role => role.toLowerCase().includes(searchLower))
      );
    }

    // Filter by role
    if (selectedRole !== 'all') {
      filtered = filtered.filter(post =>
        post.lookingFor.some(role => role === selectedRole)
      );
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      const isOpen = selectedStatus === 'open';
      filtered = filtered.filter(post => post.isOpen === isOpen);
    }

    return filtered;
  }, [posts, searchTerm, selectedRole, selectedStatus]);

  const handleCreateSuccess = () => {
    fetchPosts();
  };

  const handleEditClick = (post: TeamRecruitmentPost) => {
    setEditingPost(post);
    setShowCreateModal(true);
  };

  const handleDeleteClick = (post: TeamRecruitmentPost) => {
    setDeletingPost(post);
  };

  const handleConfirmDelete = async () => {
    if (deletingPost) {
      try {
        await deletePost(deletingPost.id);
        setDeletingPost(null);
      } catch {
        // Error handled in hook
      }
    }
  };

  const handleContactClick = (post: TeamRecruitmentPost) => {
    trackContact(post.id);
  };

  const handlePostClick = (post: TeamRecruitmentPost) => {
    setViewingPost(post);
  };

  const activePostsCount = posts.filter(p => p.isOpen).length;

  if (isLoading && posts.length === 0) {
    return (
      <div className='flex min-h-[400px] items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-[#a7f950]' />
        <span className='ml-3 text-gray-400'>Loading team posts...</span>
      </div>
    );
  }

  if (error && posts.length === 0) {
    return (
      <div className='flex min-h-[400px] flex-col items-center justify-center'>
        <p className='mb-4 text-red-400'>{error}</p>
        <Button
          onClick={() => fetchPosts()}
          className='bg-[#a7f950] text-black hover:bg-[#8fd93f]'
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className='w-full space-y-8'>
      {/* Team Invitations for current user */}
      {isAuthenticated && <MyInvitationsList hackathonId={hackathonId} />}

      <div className='w-full'>
        {/* Header Section */}
        <div className='mb-6 flex items-center justify-between text-left text-sm'>
          <div className='flex items-center gap-4'>
            <span className='text-gray-400'>
              <span className='font-semibold text-[#a7f950]'>
                {posts.length}
              </span>{' '}
              total posts
            </span>
            <span className='text-gray-400'>
              <span className='font-semibold text-[#a7f950]'>
                {activePostsCount}
              </span>{' '}
              active
            </span>
          </div>
          {/* {isAuthenticated && hackathonId && (
          <Button
            onClick={() => {
              setEditingPost(null);
              setShowCreateModal(true);
            }}
            className='bg-[#a7f950] text-black hover:bg-[#8fd93f]'
          >
            <Plus className='mr-2 h-4 w-4' />
            Create Post
          </Button>
        )} */}
        </div>

        {/* Filters */}
        <div className='mb-8 flex flex-col items-start gap-4 md:flex-row md:items-center'>
          <div className='flex w-full flex-wrap items-center gap-3 md:w-auto'>
            {/* Role Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='outline'
                  className='min-w-[140px] justify-between rounded-lg border-white/24 bg-transparent px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 hover:text-white'
                >
                  <div className='flex items-center gap-2'>
                    {selectedRole === 'all' ? 'All Roles' : selectedRole}
                  </div>
                  <ChevronDown className='ml-2 h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align='start'
                className='max-h-[300px] overflow-y-auto border-white/24 bg-black text-white'
              >
                <DropdownMenuItem
                  onClick={() => setSelectedRole('all')}
                  className='cursor-pointer hover:bg-gray-800'
                >
                  All Roles
                </DropdownMenuItem>
                {allRoles.map(role => (
                  <DropdownMenuItem
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className='cursor-pointer hover:bg-gray-800'
                  >
                    {role}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Status Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='outline'
                  className='min-w-[140px] justify-between rounded-lg border-white/24 bg-transparent px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 hover:text-white'
                >
                  <div className='flex items-center gap-2'>
                    {selectedStatus === 'all'
                      ? 'All Status'
                      : selectedStatus.charAt(0).toUpperCase() +
                        selectedStatus.slice(1)}
                  </div>
                  <ChevronDown className='ml-2 h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align='start'
                className='border-white/24 bg-black text-white'
              >
                <DropdownMenuItem
                  onClick={() => setSelectedStatus('all')}
                  className='cursor-pointer hover:bg-gray-800'
                >
                  All Status
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSelectedStatus('open')}
                  className='cursor-pointer hover:bg-gray-800'
                >
                  Open
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSelectedStatus('closed')}
                  className='cursor-pointer hover:bg-gray-800'
                >
                  Closed
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Search Input */}
          <div className='relative w-full md:ml-auto md:max-w-md'>
            <Search className='absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-white/40' />
            <Input
              type='text'
              placeholder='Search by project name or description...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='w-full rounded-lg border-gray-900 bg-[#030303] py-3 pr-4 pl-10 text-base text-white placeholder-gray-400 focus:border-gray-400 focus:ring-1 focus:ring-gray-400'
            />
          </div>
        </div>

        {/* Posts Grid */}
        {filteredPosts.length > 0 || (isAuthenticated && myTeam) ? (
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {/* Pinned Team Card - Only show if authenticated and exists */}
            {isAuthenticated && myTeam && (
              <TeamRecruitmentPostCard
                key={myTeam.id}
                post={myTeam}
                isMyPost={myTeam.leaderId === user?.id}
                onContactClick={handleContactClick}
                onEditClick={handleEditClick}
                onDeleteClick={handleDeleteClick}
                onClick={handlePostClick}
                onTrackContact={trackContact}
                isPinned={true}
                onLeaveSuccess={() => {
                  fetchMyTeam();
                  fetchPosts();
                  fetchMyPosts(); // Refresh my posts too
                }}
              />
            )}

            {/* Other Posts - Filter out myTeam to avoid duplication */}
            {filteredPosts
              .filter(post => !myTeam || post.id !== myTeam.id)
              .map(post => (
                <TeamRecruitmentPostCard
                  key={post.id}
                  post={post}
                  isMyPost={myPosts.some(p => p.id === post.id)}
                  onContactClick={handleContactClick}
                  onEditClick={handleEditClick}
                  onDeleteClick={handleDeleteClick}
                  onClick={handlePostClick}
                  onTrackContact={trackContact}
                  onLeaveSuccess={() => {
                    fetchMyTeam();
                    fetchPosts();
                    fetchMyPosts();
                  }}
                />
              ))}
          </div>
        ) : (
          <div className='flex min-h-[400px] items-center justify-center'>
            <div className='text-center'>
              <Users className='mx-auto mb-4 h-12 w-12 text-gray-600' />
              <p className='text-xl text-gray-400'>No team posts found</p>
              <p className='mt-2 text-sm text-gray-500'>
                {searchTerm ||
                selectedRole !== 'all' ||
                selectedStatus !== 'all'
                  ? 'Try adjusting your filters or search term'
                  : 'Be the first to create a team post!'}
              </p>
              {isAuthenticated && hackathonId && (
                <Button
                  onClick={() => {
                    setEditingPost(null);
                    setShowCreateModal(true);
                  }}
                  className='mt-4 bg-[#a7f950] text-black hover:bg-[#8fd93f]'
                >
                  <Plus className='mr-2 h-4 w-4' />
                  Create First Post
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Create/Edit Modal */}
        {hackathonId && (
          <CreateTeamPostModal
            open={showCreateModal}
            onOpenChange={open => {
              setShowCreateModal(open);
              if (!open) {
                setEditingPost(null);
              }
            }}
            hackathonSlugOrId={hackathonId}
            organizationId={organizationId}
            initialData={editingPost || undefined}
            onSuccess={handleCreateSuccess}
          />
        )}

        {/* Team Details Sheet */}
        {hackathonId && viewingPost && (
          <TeamDetailsSheet
            open={!!viewingPost}
            onOpenChange={open => !open && setViewingPost(null)}
            post={viewingPost}
            hackathonSlugOrId={hackathonId}
            organizationId={organizationId}
            onEditClick={handleEditClick}
            onContactClick={handleContactClick}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={!!deletingPost}
          onOpenChange={open => {
            if (!open) {
              setDeletingPost(null);
            }
          }}
        >
          <AlertDialogContent className='border-gray-800 bg-[#030303] text-white'>
            <AlertDialogHeader>
              <AlertDialogTitle>Close Team Post</AlertDialogTitle>
              <AlertDialogDescription className='text-gray-400'>
                Are you sure you want to close this team post? This action
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
                    Closing...
                  </>
                ) : (
                  'Close Post'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Error Display */}
        {error && posts.length > 0 && (
          <div className='mt-4 rounded-md border border-red-500/50 bg-red-500/10 p-3'>
            <p className='text-sm text-red-400'>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
