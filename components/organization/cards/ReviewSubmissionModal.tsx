'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import SubmissionActionButtons from './SubmissionActionButtons';
import RejectSubmissionModal from './RejectSubmissionModal';
import { SubmissionModalHeader } from './ReviewSubmissionModal/SubmissionModalHeader';
import { SubmissionInfo } from './ReviewSubmissionModal/SubmissionInfo';
import { SubmissionDetailsTab } from './ReviewSubmissionModal/SubmissionDetailsTab';
import { SubmissionLinksTab } from './ReviewSubmissionModal/SubmissionLinksTab';
import { SubmissionVotesTab } from './ReviewSubmissionModal/SubmissionVotesTab';
import { SubmissionCommentsTab } from './ReviewSubmissionModal/SubmissionCommentsTab';
import { useSubmissionActions } from '@/hooks/use-submission-actions';
import type { ReviewSubmissionModalProps } from './ReviewSubmissionModal/types';

export default function ReviewSubmissionModal({
  open,
  onOpenChange,
  submissions = [],
  currentIndex = 0,
  organizationId,
  hackathonId,
  participantId,
  onSuccess,
  onShortlist,
  onDisqualify,
}: ReviewSubmissionModalProps) {
  const [activeTab, setActiveTab] = useState('details');
  const [currentSubmissionIndex, setCurrentSubmissionIndex] =
    useState(currentIndex);

  const {
    isDisqualifyModalOpen,
    setIsDisqualifyModalOpen,
    handleShortlist,
    handleDisqualifyClick,
    handleDisqualifyConfirm,
  } = useSubmissionActions({
    organizationId,
    hackathonId,
    participantId,
    onSuccess,
    onShortlist,
    onDisqualify,
  });

  // Update index when submissions array changes (e.g., after shortlisting/rejecting)
  useEffect(() => {
    // If current index is out of bounds, adjust it
    if (
      currentSubmissionIndex >= submissions.length &&
      submissions.length > 0
    ) {
      setCurrentSubmissionIndex(submissions.length - 1);
    } else if (submissions.length === 0) {
      onOpenChange(false);
    }
  }, [submissions.length, currentSubmissionIndex, onOpenChange]);

  // Reset to details tab when submission changes
  useEffect(() => {
    setActiveTab('details');
  }, [currentSubmissionIndex]);

  const currentSubmission = submissions[currentSubmissionIndex];
  const canGoPrev = currentSubmissionIndex > 0;
  const canGoNext = currentSubmissionIndex < submissions.length - 1;

  const handlePrev = () => {
    if (canGoPrev) {
      setCurrentSubmissionIndex(currentSubmissionIndex - 1);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      setCurrentSubmissionIndex(currentSubmissionIndex + 1);
    }
  };

  const handleShortlistClick = () => {
    if (!currentSubmission) return;
    handleShortlist(currentSubmission.id);
  };

  const handleDisqualifyConfirmWrapper = (comment?: string) => {
    if (!currentSubmission) return;
    handleDisqualifyConfirm(currentSubmission.id, comment);
  };

  if (!currentSubmission) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className='bg-background-card max-h-[90vh] min-h-[90vh] w-full !max-w-7xl !gap-0 overflow-hidden border-gray-900 p-0'
        showCloseButton={false}
      >
        <div className='flex h-full flex-col'>
          <SubmissionModalHeader
            currentIndex={currentSubmissionIndex}
            totalSubmissions={submissions.length}
            canGoPrev={canGoPrev}
            canGoNext={canGoNext}
            onPrev={handlePrev}
            onNext={handleNext}
            onClose={() => onOpenChange(false)}
          />
          <div className='flex flex-1 overflow-hidden'>
            <SubmissionInfo submission={currentSubmission} />

            {/* Right Column - Project Content */}
            <div className='relative flex w-1/2 flex-col px-4'>
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className='flex min-h-0 w-full flex-1 flex-col'
              >
                <TabsList className='mb-6 h-auto w-full flex-shrink-0 rounded-none border-b border-gray-900 bg-transparent p-0'>
                  <TabsTrigger
                    value='details'
                    className={cn(
                      'data-[state=active]:border-primary rounded-none border-0 border-b-2 border-transparent text-gray-400 data-[state=active]:bg-transparent data-[state=active]:text-white',
                      'px-0 py-2'
                    )}
                  >
                    Details
                  </TabsTrigger>
                  <TabsTrigger
                    value='links'
                    className={cn(
                      'data-[state=active]:border-primary rounded-none border-0 border-b-2 border-transparent text-gray-400 data-[state=active]:bg-transparent data-[state=active]:text-white',
                      'px-4 py-2'
                    )}
                  >
                    Links
                  </TabsTrigger>
                  <TabsTrigger
                    value='votes'
                    className={cn(
                      'data-[state=active]:border-primary rounded-none border-0 border-b-2 border-transparent text-gray-400 data-[state=active]:bg-transparent data-[state=active]:text-white',
                      'px-4 py-2'
                    )}
                  >
                    Votes ({currentSubmission.votes})
                  </TabsTrigger>
                  <TabsTrigger
                    value='comments'
                    className={cn(
                      'data-[state=active]:border-primary rounded-none border-0 border-b-2 border-transparent text-gray-400 data-[state=active]:bg-transparent data-[state=active]:text-white',
                      'px-4 py-2'
                    )}
                  >
                    Comments ({currentSubmission.comments.toLocaleString()}+)
                  </TabsTrigger>
                </TabsList>

                <div className='min-h-0 flex-1 pb-24'>
                  <TabsContent value='details' className='mt-0 h-full'>
                    <SubmissionDetailsTab
                      projectName={currentSubmission.projectName}
                      videoUrl={currentSubmission.videoUrl}
                      introduction={currentSubmission.introduction}
                      description={currentSubmission.description}
                    />
                  </TabsContent>

                  <TabsContent value='links' className='mt-0 h-full'>
                    <SubmissionLinksTab links={currentSubmission.links} />
                  </TabsContent>

                  <TabsContent value='votes' className='mt-0 h-full'>
                    <SubmissionVotesTab voters={currentSubmission.voters} />
                  </TabsContent>

                  <TabsContent value='comments' className='mt-0 h-full'>
                    <SubmissionCommentsTab
                      commentsList={currentSubmission.commentsList}
                    />
                  </TabsContent>
                </div>

                <div className='bg-background-card fixed right-0 bottom-0 left-1/2 p-6'>
                  <SubmissionActionButtons
                    onDisqualify={handleDisqualifyClick}
                    onShortlist={handleShortlistClick}
                  />
                </div>
              </Tabs>
            </div>
          </div>
        </div>
      </DialogContent>

      <RejectSubmissionModal
        open={isDisqualifyModalOpen}
        onOpenChange={setIsDisqualifyModalOpen}
        submissionName={currentSubmission?.projectName}
        onConfirm={handleDisqualifyConfirmWrapper}
      />
    </Dialog>
  );
}
