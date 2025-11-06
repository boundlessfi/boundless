'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowUpRight, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { InfoFormData } from './tabs/schemas/infoSchema';
import { TimelineFormData } from './tabs/schemas/timelineSchema';
import { ParticipantFormData } from './tabs/schemas/participantSchema';
import { RewardsFormData } from './tabs/schemas/rewardsSchema';
import { JudgingFormData } from './tabs/schemas/judgingSchema';
import { CollaborationFormData } from './tabs/schemas/collaborationSchema';

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import InfoTab from './tabs/InfoTab';
import TimelineTab from './tabs/TimelineTab';
import ParticipantTab from './tabs/ParticipantTab';
import RewardsTab from './tabs/RewardsTab';
import JudgingTab from './tabs/JudgingTab';
import CollaborationTab from './tabs/CollaborationTab';
import ReviewTab from './tabs/ReviewTab';

type StepStatus = 'pending' | 'active' | 'completed';
type StepKey =
  | 'information'
  | 'timeline'
  | 'participation'
  | 'rewards'
  | 'judging'
  | 'collaboration'
  | 'review';

interface StepData {
  status: StepStatus;
  isCompleted: boolean;
  data?: Record<string, unknown>;
}
interface NewHackathonTabProps {
  organizationId?: string;
}

export default function NewHackathonTab({
  organizationId,
}: NewHackathonTabProps) {
  const [activeTab, setActiveTab] = useState<StepKey>('information');

  const [stepData, setStepData] = useState<{
    information?: InfoFormData;
    timeline?: TimelineFormData;
    participation?: ParticipantFormData;
    rewards?: RewardsFormData;
    judging?: JudgingFormData;
    collaboration?: CollaborationFormData;
  }>({});

  const [loadingStates, setLoadingStates] = useState<Record<StepKey, boolean>>({
    information: false,
    timeline: false,
    participation: false,
    rewards: false,
    judging: false,
    collaboration: false,
    review: false,
  });

  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const [steps, setSteps] = useState<Record<StepKey, StepData>>({
    information: { status: 'active', isCompleted: false },
    timeline: { status: 'pending', isCompleted: false },
    participation: { status: 'pending', isCompleted: false },
    rewards: { status: 'pending', isCompleted: false },
    judging: { status: 'pending', isCompleted: false },
    collaboration: { status: 'pending', isCompleted: false },
    review: { status: 'pending', isCompleted: false },
  });

  const stepOrder: StepKey[] = [
    'information',
    'timeline',
    'participation',
    'rewards',
    'judging',
    'collaboration',
    'review',
  ];

  const getCurrentStepIndex = () => stepOrder.indexOf(activeTab);

  const canAccessStep = (stepKey: StepKey) => {
    // Review tab is accessible only after collaboration is completed
    if (stepKey === 'review') {
      return steps.collaboration?.isCompleted === true;
    }

    const stepIndex = stepOrder.indexOf(stepKey);
    const currentIndex = getCurrentStepIndex();

    if (stepIndex <= currentIndex) return true;

    if (stepIndex === currentIndex + 1 && steps[activeTab].isCompleted)
      return true;

    return false;
  };

  const navigateToStep = (stepKey: StepKey) => {
    if (canAccessStep(stepKey)) {
      const stepIndex = stepOrder.indexOf(stepKey);
      const currentIndex = getCurrentStepIndex();

      if (stepIndex > currentIndex) {
        setSteps(prev => {
          const newSteps = { ...prev };

          stepOrder.forEach((step, index) => {
            if (index > stepIndex) {
              newSteps[step] = { status: 'pending', isCompleted: false };
            }
          });

          newSteps[stepKey] = { ...newSteps[stepKey], status: 'active' };

          return newSteps;
        });
      } else {
        setSteps(prev => ({
          ...prev,
          [stepKey]: { ...prev[stepKey], status: 'active' },
        }));
      }

      setActiveTab(stepKey);
    }
  };

  const saveInformationStep = async (data: InfoFormData) => {
    setLoadingStates(prev => ({ ...prev, information: true }));
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      setStepData(prev => ({ ...prev, information: data }));

      setSteps(prev => ({
        ...prev,
        information: {
          ...prev.information,
          status: 'completed',
          isCompleted: true,
        },
      }));
    } catch (error) {
      throw error;
    } finally {
      setLoadingStates(prev => ({ ...prev, information: false }));
    }
  };

  const saveTimelineStep = async (data: TimelineFormData) => {
    setLoadingStates(prev => ({ ...prev, timeline: true }));
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStepData(prev => ({ ...prev, timeline: data }));

      setSteps(prev => ({
        ...prev,
        timeline: { ...prev.timeline, status: 'completed', isCompleted: true },
      }));
    } catch (error) {
      throw error;
    } finally {
      setLoadingStates(prev => ({ ...prev, timeline: false }));
    }
  };

  const saveParticipationStep = async (data: ParticipantFormData) => {
    setLoadingStates(prev => ({ ...prev, participation: true }));
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStepData(prev => ({ ...prev, participation: data }));

      setSteps(prev => ({
        ...prev,
        participation: {
          ...prev.participation,
          status: 'completed',
          isCompleted: true,
        },
      }));
    } catch (error) {
      throw error;
    } finally {
      setLoadingStates(prev => ({ ...prev, participation: false }));
    }
  };

  const saveRewardsStep = async (data: RewardsFormData) => {
    setLoadingStates(prev => ({ ...prev, rewards: true }));
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStepData(prev => ({ ...prev, rewards: data }));

      setSteps(prev => ({
        ...prev,
        rewards: {
          ...prev.rewards,
          status: 'completed',
          isCompleted: true,
        },
      }));
    } catch (error) {
      throw error;
    } finally {
      setLoadingStates(prev => ({ ...prev, rewards: false }));
    }
  };

  const saveJudgingStep = async (data: JudgingFormData) => {
    setLoadingStates(prev => ({ ...prev, judging: true }));
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStepData(prev => ({ ...prev, judging: data }));

      setSteps(prev => ({
        ...prev,
        judging: {
          ...prev.judging,
          status: 'completed',
          isCompleted: true,
        },
      }));
    } catch (error) {
      throw error;
    } finally {
      setLoadingStates(prev => ({ ...prev, judging: false }));
    }
  };

  const saveCollaborationStep = async (data: CollaborationFormData) => {
    setLoadingStates(prev => ({ ...prev, collaboration: true }));
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStepData(prev => ({ ...prev, collaboration: data }));

      setSteps(prev => ({
        ...prev,
        collaboration: {
          ...prev.collaboration,
          status: 'completed',
          isCompleted: true,
        },
      }));
    } catch (error) {
      throw error;
    } finally {
      setLoadingStates(prev => ({ ...prev, collaboration: false }));
    }
  };

  const handlePublish = async () => {
    setLoadingStates(prev => ({ ...prev, review: true }));
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      // TODO: Implement actual publish logic
      setSteps(prev => ({
        ...prev,
        review: {
          ...prev.review,
          status: 'completed',
          isCompleted: true,
        },
      }));
    } catch (error) {
      throw error;
    } finally {
      setLoadingStates(prev => ({ ...prev, review: false }));
    }
  };

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      // TODO: Implement actual draft save logic
      // Draft is saved but hackathon is not published
    } catch (error) {
      throw error;
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleEditTab = (tabKey: string) => {
    const tabMap: Record<string, StepKey> = {
      information: 'information',
      timeline: 'timeline',
      participation: 'participation',
      rewards: 'rewards',
      judging: 'judging',
      collaboration: 'collaboration',
    };
    const stepKey = tabMap[tabKey];
    if (stepKey) {
      navigateToStep(stepKey);
    }
  };

  const handlePreview = () => {};

  return (
    <div
      className='bg-background-main-bg flex-1 overflow-hidden text-white'
      id={organizationId}
    >
      <Tabs
        value={activeTab}
        onValueChange={value => navigateToStep(value as StepKey)}
        className='w-full'
      >
        <div className='border-b border-zinc-800 pl-6 md:pl-8'>
          <div className='flex items-center gap-4'>
            <button
              className='rounded-lg p-2 transition-colors hover:bg-zinc-800 md:hidden'
              aria-label='Open menu'
            >
              <Menu className='h-5 w-5' />
            </button>
            <div className='h-[50px] w-[0.5px] bg-gray-900 md:hidden' />

            <ScrollArea className='w-full'>
              <div className='flex w-max min-w-full items-center justify-between'>
                <TabsList className='inline-flex h-auto bg-transparent p-0'>
                  {stepOrder
                    .filter(stepKey => stepKey !== 'review') // Hide review from tabs, show it separately
                    .map(stepKey => {
                      const step = steps[stepKey];
                      const isActive = stepKey === activeTab;
                      const isCompleted = step.isCompleted;
                      const canAccess = canAccessStep(stepKey);

                      return (
                        <TabsTrigger
                          key={stepKey}
                          value={stepKey}
                          onClick={() => navigateToStep(stepKey)}
                          disabled={!canAccess}
                          className={cn(
                            'data-[state=active]:border-b-primary rounded-none border-b-2 border-transparent bg-transparent px-5 pt-4 pb-3 text-sm font-medium transition-all data-[state=active]:text-white data-[state=active]:shadow-none',
                            !canAccess && 'cursor-not-allowed opacity-50',
                            isActive && 'border-b-primary text-white',
                            isCompleted && 'border-b-primary text-white',
                            !isActive && !isCompleted && 'text-zinc-400'
                          )}
                        >
                          <div className='flex items-center space-x-2'>
                            <span>
                              {stepKey.charAt(0).toUpperCase() +
                                stepKey.slice(1)}
                            </span>
                            <div>
                              {isActive && !isCompleted && (
                                <svg
                                  width='16'
                                  height='17'
                                  viewBox='0 0 16 17'
                                  fill='none'
                                  xmlns='http://www.w3.org/2000/svg'
                                >
                                  <path
                                    d='M15.3337 8.50002C15.3337 12.5501 12.0504 15.8334 8.00033 15.8334C3.95024 15.8334 0.666992 12.5501 0.666992 8.50002C0.666992 4.44993 3.95024 1.16669 8.00033 1.16669C12.0504 1.16669 15.3337 4.44993 15.3337 8.50002Z'
                                    fill='white'
                                  />
                                  <path
                                    d='M13.1064 12.7855C12.3645 13.6696 11.4058 14.3459 10.3241 14.7483C9.24248 15.1507 8.07488 15.2654 6.93559 15.0812C5.7963 14.897 4.72434 14.4202 3.82459 13.6974C2.92485 12.9746 2.22815 12.0307 1.80265 10.9579C1.37716 9.88511 1.23744 8.72024 1.39718 7.57726C1.55691 6.43428 2.01063 5.35234 2.71393 4.43731C3.41723 3.52227 4.34603 2.80549 5.40945 2.35709C6.47287 1.90868 7.63447 1.74402 8.78062 1.87921L7.99968 8.49998L13.1064 12.7855Z'
                                    fill='#030303'
                                  />
                                </svg>
                              )}
                              {isCompleted && (
                                <svg
                                  width='16'
                                  height='17'
                                  viewBox='0 0 16 17'
                                  fill='none'
                                  xmlns='http://www.w3.org/2000/svg'
                                >
                                  <path
                                    d='M0.666992 8.50002C0.666992 4.44993 3.95024 1.16669 8.00033 1.16669C12.0504 1.16669 15.3337 4.44993 15.3337 8.50002C15.3337 12.5501 12.0504 15.8334 8.00033 15.8334C3.95024 15.8334 0.666992 12.5501 0.666992 8.50002Z'
                                    fill='white'
                                  />
                                  <path
                                    fillRule='evenodd'
                                    clipRule='evenodd'
                                    d='M11.5448 5.76964C11.672 5.88626 11.6806 6.08394 11.564 6.21117L6.98069 11.2112C6.92309 11.274 6.84233 11.3106 6.75711 11.3124C6.6719 11.3143 6.58962 11.2812 6.52935 11.221L4.44602 9.13764C4.32398 9.0156 4.32398 8.81774 4.44602 8.6957C4.56806 8.57366 4.76592 8.57366 4.88796 8.6957L6.74051 10.5482L11.1033 5.78884C11.2199 5.66161 11.4176 5.65302 11.5448 5.76964Z'
                                    fill='#030303'
                                    stroke='#030303'
                                    strokeWidth='0.833333'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                  />
                                </svg>
                              )}
                              {!isActive && !isCompleted && (
                                <div className='h-4 w-4 rounded-full border-2 border-zinc-400' />
                              )}
                            </div>
                          </div>
                        </TabsTrigger>
                      );
                    })}
                </TabsList>
                {steps.collaboration?.isCompleted && (
                  <Button
                    onClick={() => navigateToStep('review')}
                    className='bg-primary/10 text-primary hover:bg-primary/20 flex h-[50px] items-center gap-2 rounded-none border-l border-gray-900'
                  >
                    Review
                    <ArrowUpRight className='h-5 w-5' />
                  </Button>
                )}
                <Button
                  onClick={handlePreview}
                  className='bg-active-bg text-primary flex h-[50px] items-center gap-2 rounded-none border-l border-gray-900'
                >
                  Preview Hackathon
                  <ArrowUpRight className='h-5 w-5' />
                </Button>
              </div>
              <ScrollBar orientation='horizontal' className='h-px' />
            </ScrollArea>
          </div>
        </div>

        <div className='px-6 py-6 md:px-20'>
          <TabsContent value='information' className='mt-0'>
            <InfoTab
              onContinue={() => navigateToStep('timeline')}
              onSave={saveInformationStep}
              initialData={stepData.information}
              isLoading={loadingStates.information}
            />
          </TabsContent>

          <TabsContent value='timeline' className='mt-0'>
            <TimelineTab
              onContinue={() => navigateToStep('participation')}
              onSave={saveTimelineStep}
              initialData={stepData.timeline}
              isLoading={loadingStates.timeline}
            />
          </TabsContent>

          <TabsContent value='participation' className='mt-0'>
            <ParticipantTab
              onContinue={() => navigateToStep('rewards')}
              onSave={saveParticipationStep}
              initialData={stepData.participation}
              isLoading={loadingStates.participation}
            />
          </TabsContent>

          <TabsContent value='rewards' className='mt-0'>
            <RewardsTab
              onContinue={() => navigateToStep('judging')}
              onSave={saveRewardsStep}
              initialData={stepData.rewards}
              isLoading={loadingStates.rewards}
            />
          </TabsContent>

          <TabsContent value='judging' className='mt-0'>
            <JudgingTab
              onContinue={() => navigateToStep('collaboration')}
              onSave={saveJudgingStep}
              initialData={stepData.judging}
              isLoading={loadingStates.judging}
            />
          </TabsContent>

          <TabsContent value='collaboration' className='mt-0'>
            <CollaborationTab
              onContinue={() => navigateToStep('review')}
              onSave={saveCollaborationStep}
              initialData={stepData.collaboration}
              isLoading={loadingStates.collaboration}
            />
          </TabsContent>

          <TabsContent value='review' className='mt-0'>
            <ReviewTab
              allData={stepData}
              onEdit={handleEditTab}
              onPublish={handlePublish}
              onSaveDraft={handleSaveDraft}
              isLoading={loadingStates.review}
              isSavingDraft={isSavingDraft}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
