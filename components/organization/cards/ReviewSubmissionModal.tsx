'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import SubmissionActionButtons from './SubmissionActionButtons';
import RejectSubmissionModal from './RejectSubmissionModal';
import { SubmissionModalHeader } from './ReviewSubmissionModal/SubmissionModalHeader';
import { SubmissionInfo } from './ReviewSubmissionModal/SubmissionInfo';
import { SubmissionDetailsTab } from './ReviewSubmissionModal/SubmissionDetailsTab';
import { SubmissionLinksTab } from './ReviewSubmissionModal/SubmissionLinksTab';
import { SubmissionVotesTab } from './ReviewSubmissionModal/SubmissionVotesTab';
import { TeamSection } from './ReviewSubmissionModal/TeamSection';
import { useSubmissionActions } from '@/hooks/use-submission-actions';
import type { ReviewSubmissionModalProps } from './ReviewSubmissionModal/types';

const ReviewSubmissionModal: React.FC<ReviewSubmissionModalProps> = ({
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
}) => {
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

  // Sync internal index with prop when modal opens or currentIndex changes
  useEffect(() => {
    if (open) {
      setCurrentSubmissionIndex(currentIndex);
    }
  }, [open, currentIndex]);

  // Reset to details tab when submission changes or modal opens
  useEffect(() => {
    setActiveTab('details');
  }, [currentSubmissionIndex, open]);

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
        className='bg-background-card flex h-fit max-h-[95vh] min-h-[85vh] w-full max-w-[1400px]! gap-0! overflow-hidden border-gray-900/60 p-0 shadow-2xl'
        showCloseButton={false}
      >
        <div className='flex w-full flex-col'>
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

            <div className='bg-background/40 relative flex flex-1 flex-col p-0'>
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className='relative flex h-full w-full flex-col'
              >
                <div className='shrink-0 border-b border-gray-900/60 px-6'>
                  <TabsList className='flex h-14 w-full gap-8 rounded-none bg-transparent p-0'>
                    {['Details', 'Team', 'Links', 'Voters'].map(tab => (
                      <TabsTrigger
                        key={tab}
                        value={tab.toLowerCase()}
                        className={cn(
                          'data-[state=active]:border-primary relative h-full rounded-none border-0 border-b-2 border-transparent px-2 text-xs font-bold tracking-widest text-gray-500 uppercase transition-all hover:text-gray-300 data-[state=active]:bg-transparent data-[state=active]:text-white'
                        )}
                      >
                        {tab}
                        {tab === 'Voters' && (
                          <span className='ml-2 inline-flex h-5 items-center justify-center rounded-full bg-gray-900 px-1.5 text-[10px] font-bold text-gray-500'>
                            {currentSubmission.votes}
                          </span>
                        )}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                <div className='flex-1 overflow-y-auto px-8 py-6 pb-24'>
                  <AnimatePresence mode='wait'>
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className='h-full'
                    >
                      {activeTab === 'details' && (
                        <SubmissionDetailsTab
                          projectName={currentSubmission.projectName}
                          videoUrl={currentSubmission.videoUrl}
                          introduction={currentSubmission.introduction}
                          description={currentSubmission.description}
                        />
                      )}

                      {activeTab === 'team' && (
                        <TeamSection
                          teamMembers={currentSubmission.teamMembers || []}
                        />
                      )}

                      {activeTab === 'links' && (
                        <SubmissionLinksTab
                          links={currentSubmission.links || []}
                        />
                      )}

                      {activeTab === 'voters' && (
                        <SubmissionVotesTab
                          voters={currentSubmission.voters || []}
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Footer / Action Bar */}
                <div className='bg-background/80 absolute right-0 bottom-0 left-0 z-50 border-t border-gray-900/60 p-6 backdrop-blur-md'>
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
};

export default ReviewSubmissionModal;
