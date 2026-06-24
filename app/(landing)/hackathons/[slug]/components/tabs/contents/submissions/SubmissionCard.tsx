'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { LayoutGrid, Loader2, Pencil, Trash2 } from 'lucide-react';
import GroupAvatar from '@/components/avatars/GroupAvatar';
import BasicAvatar from '@/components/avatars/BasicAvatar';
import { BoundlessButton } from '@/components/buttons/BoundlessButton';
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
import { useOptionalAuth } from '@/hooks/use-auth';
import { useSubmission } from '@/hooks/hackathon/use-submission';
import type { ExploreSubmissionsResponse } from '@/lib/api/hackathons';

interface SubmissionCardProps {
  submission: ExploreSubmissionsResponse;
}

const SubmissionCard = ({ submission }: SubmissionCardProps) => {
  const {
    id,
    projectName,
    description,
    category,
    participationType = 'INDIVIDUAL',
    teamName,
    teamMembers = [],
    participant,
    logo,
    banner,
  } = submission;

  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? '';
  const queryClient = useQueryClient();
  const { user } = useOptionalAuth();

  const isOwner = !!user?.id && !!participant?.id && participant.id === user.id;

  const { remove } = useSubmission({
    hackathonSlugOrId: slug,
    autoFetch: false,
  });

  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const isTeam = participationType?.toUpperCase() === 'TEAM';

  const submitterName = isTeam
    ? (teamName ?? teamMembers?.[0]?.name ?? 'Unnamed Team')
    : (participant?.name ?? 'Anonymous');

  const submitterAvatar = isTeam
    ? (teamMembers?.[0]?.avatar ?? '')
    : (participant?.image ?? '');

  const projectUrl = `/projects/${id}?type=submission`;

  const handleEdit = () => {
    router.push(`/hackathons/${slug}/submit`);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await remove(id);
      await queryClient.invalidateQueries({
        queryKey: ['hackathon', 'exploreSubmissions', submission.hackathonId],
      });
      setIsConfirmOpen(false);
    } catch {
      // useSubmission.remove already toasts the failure.
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className='group hover:border-primary/20 bg-background-card hover:bg-background-card-hover flex h-full flex-col overflow-hidden rounded-2xl border border-white/5 transition-all'>
      <div className='relative aspect-video w-full overflow-hidden bg-[#0D0E10]'>
        {banner ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={banner}
            alt={`${projectName} banner`}
            className='h-full w-full object-contain transition-transform duration-300 group-hover:scale-105'
          />
        ) : logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logo}
            alt={`${projectName} logo`}
            className='h-full w-full object-contain p-8 transition-transform duration-300 group-hover:scale-105'
          />
        ) : (
          <div className='text-primary flex h-full w-full items-center justify-center bg-[#232B20]'>
            <LayoutGrid className='h-10 w-10' />
          </div>
        )}
        {banner && logo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logo}
            alt={`${projectName} logo`}
            className='absolute bottom-3 left-3 h-12 w-12 rounded-lg border-2 border-[#0D0E10] bg-[#0D0E10] object-contain shadow-lg'
          />
        )}
      </div>

      {/* Project Info */}
      <div className='flex flex-1 flex-col p-4'>
        <div className='mb-6 flex-1 space-y-3'>
          <h3 className='group-hover:text-primary line-clamp-1 text-xl font-bold text-white transition-colors'>
            {projectName}
          </h3>
          <p className='line-clamp-2 text-sm leading-relaxed text-gray-500'>
            {description}
          </p>

          {/* Tags/Categories */}
          <div className='flex flex-wrap gap-2 pt-2'>
            {category && (
              <span className='text-primary rounded-md bg-[#232B20]/50 px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase'>
                {category}
              </span>
            )}
          </div>
        </div>

        {/* Footer: Avatars + Actions */}
        <div className='flex items-center justify-between gap-2 border-t border-white/5 pt-5'>
          <div className='flex items-center gap-3'>
            {isTeam ? (
              <GroupAvatar
                members={teamMembers.map(m => m.avatar ?? '')}
                usernames={teamMembers.map(m => m.username)}
              />
            ) : participant?.username ? (
              <Link
                href={`/profile/${participant.username}`}
                target='_blank'
                rel='noopener noreferrer'
                aria-label={`View @${participant.username} profile`}
                className='hover:opacity-90'
              >
                <BasicAvatar
                  image={submitterAvatar}
                  name={submitterName}
                  username={participant.username}
                />
              </Link>
            ) : (
              <BasicAvatar
                image={submitterAvatar}
                name={submitterName}
                username={submitterName.toLowerCase().replace(/\s+/g, '_')}
              />
            )}
          </div>

          <div className='flex items-center gap-2'>
            {isOwner && (
              <>
                <button
                  type='button'
                  onClick={handleEdit}
                  aria-label='Edit submission'
                  title='Edit submission'
                  className='hover:border-primary/30 flex h-9 w-9 items-center justify-center rounded-xl border border-white/5 bg-white/5 text-gray-400 transition-all hover:bg-white/10 hover:text-white'
                >
                  <Pencil className='h-4 w-4' />
                </button>
                <button
                  type='button'
                  onClick={() => setIsConfirmOpen(true)}
                  aria-label='Delete submission'
                  title='Delete submission'
                  className='flex h-9 w-9 items-center justify-center rounded-xl border border-white/5 bg-white/5 text-gray-400 transition-all hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400'
                >
                  <Trash2 className='h-4 w-4' />
                </button>
              </>
            )}

            <Link href={projectUrl} target='_blank' rel='noopener noreferrer'>
              <BoundlessButton
                variant='outline'
                size='sm'
                className='hover:bg-primary h-9 rounded-xl border-white/5 bg-white/5 px-4 text-xs font-bold transition-all hover:text-black'
              >
                View Project
              </BoundlessButton>
            </Link>
          </div>
        </div>
      </div>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent className='bg-background-card border-white/10 text-white'>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this submission?</AlertDialogTitle>
            <AlertDialogDescription className='text-gray-400'>
              {projectName} will be removed from the hackathon. This can&apos;t
              be undone. If the submission deadline has passed, the server will
              reject the deletion.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isDeleting}
              className='border-white/10 bg-transparent text-white hover:bg-white/5'
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={e => {
                e.preventDefault();
                void handleDeleteConfirm();
              }}
              className='bg-red-500/90 text-white hover:bg-red-500'
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

export default SubmissionCard;
