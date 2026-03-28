import React from 'react';
import MilstoneOverview from '@/components/project-details/project-milestone/milestone-details/MilstoneOverview';
import MilestoneDetails from '@/components/project-details/project-milestone/milestone-details/MilestoneDetails';
import MilestoneLinks from '@/components/project-details/project-milestone/milestone-details/MilestoneLinks';
import { MilestoneStatusCard } from '@/features/projects/components/Milestone/MilestoneStatusCard';
import { MilestoneEvidence } from '@/features/projects/components/Milestone/MilestoneEvidence';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  getCrowdfundingProject,
  getCrowdfundingMilestone,
} from '@/features/projects/api';
import { Crowdfunding } from '@/features/projects/types';

interface MilestonePageProps {
  params: Promise<{
    slug: string; // Project slug
    milestoneId: string; // Milestone index
  }>;
}

const MilestonePage = async ({ params }: MilestonePageProps) => {
  const { slug, milestoneId } = await params;

  // Fetch project data and specific milestone
  let project: Crowdfunding | null = null;
  let milestone = null;

  try {
    // Fetch both project and milestone data
    const [crowdfundingProject, milestoneData] = await Promise.all([
      getCrowdfundingProject(slug),
      getCrowdfundingMilestone(slug, milestoneId),
    ]);

    project = crowdfundingProject;

    // Transform milestone to match component expectations
    milestone = milestoneData
      ? {
          _id: milestoneData.id || milestoneData.name,
          title: milestoneData.name,
          description: milestoneData.description,
          status: milestoneData.status,
          dueDate: milestoneData.endDate,
          amount: milestoneData.amount,
          // Proof and submission data (optional)
          ...(milestoneData.submittedAt && {
            submittedAt: milestoneData.submittedAt,
          }),
          ...(milestoneData.approvedAt && {
            approvedAt: milestoneData.approvedAt,
          }),
          ...(milestoneData.rejectedAt && {
            rejectedAt: milestoneData.rejectedAt,
          }),
          ...(milestoneData.evidence && { evidence: milestoneData.evidence }),
          // Voting data (optional)
          ...(milestoneData.votes && { votes: milestoneData.votes }),
          ...(milestoneData.userHasVoted !== undefined && {
            userHasVoted: milestoneData.userHasVoted,
          }),
          ...(milestoneData.userVote && { userVote: milestoneData.userVote }),
        }
      : null;
  } catch {
    // Handle error silently - milestone will be null
  }

  // If milestone not found, show error state
  if (!milestone) {
    return (
      <section className='mx-auto mt-5 flex max-w-[1440px] flex-col justify-center gap-5 px-5 py-5 md:flex-row md:justify-between md:gap-18 md:px-[50px] lg:px-[100px]'>
        <div className='w-full py-12 text-center'>
          <h1 className='mb-4 text-2xl font-bold text-white'>
            Milestone Not Found
          </h1>
          <p className='text-gray-400'>
            The requested milestone could not be found.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className='mx-auto mt-5 flex max-w-[1440px] flex-col justify-center gap-5 px-5 py-5 md:flex-row md:justify-between md:gap-18 md:px-[50px] lg:px-[100px]'>
      <div className='w-full md:max-w-[500px]'>
        <MilstoneOverview project={project?.project} milestone={milestone} />
      </div>
      <Tabs defaultValue='details' className='w-full'>
        <div className='border-b border-gray-800 py-0'>
          <TabsList className='mb-0 h-auto w-fit justify-start gap-6 rounded-none bg-transparent p-0'>
            <TabsTrigger
              value='details'
              className='data-[state=active]:border-primary rounded-none border-x-0 border-t-0 bg-transparent px-0 py-2 text-sm font-medium text-gray-400 transition-colors hover:text-gray-300 focus-visible:border-0 focus-visible:ring-0 focus-visible:outline-none data-[state=active]:border-x-0 data-[state=active]:border-t-0 data-[state=active]:border-b-2 data-[state=active]:text-white'
            >
              Details
            </TabsTrigger>
            <TabsTrigger
              value='proof'
              className='data-[state=active]:border-primary rounded-none border-x-0 border-t-0 bg-transparent px-0 py-2 text-sm font-medium text-gray-400 transition-colors hover:text-gray-300 focus-visible:border-0 focus-visible:ring-0 focus-visible:outline-none data-[state=active]:border-x-0 data-[state=active]:border-t-0 data-[state=active]:border-b-2 data-[state=active]:text-white'
            >
              Proof & Status
            </TabsTrigger>
            <TabsTrigger
              value='links'
              className='data-[state=active]:border-primary rounded-none border-x-0 border-t-0 bg-transparent px-0 py-2 text-sm font-medium text-gray-400 transition-colors hover:text-gray-300 focus-visible:border-0 focus-visible:ring-0 focus-visible:outline-none data-[state=active]:border-x-0 data-[state=active]:border-t-0 data-[state=active]:border-b-2 data-[state=active]:text-white'
            >
              Links
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value='details'>
          <MilestoneDetails
            milestoneId={milestoneId}
            project={project}
            milestone={milestone}
          />
        </TabsContent>
        <TabsContent value='proof' className='space-y-6 pt-6'>
          <MilestoneStatusCard
            status={milestone.status}
            submittedAt={milestone.submittedAt}
            approvedAt={milestone.approvedAt}
            rejectedAt={milestone.rejectedAt}
            evidence={milestone.evidence?.text}
          />
          {milestone.evidence && (
            <MilestoneEvidence evidence={milestone.evidence} />
          )}
        </TabsContent>
        <TabsContent value='links'>
          <MilestoneLinks project={project} milestone={milestone} />
        </TabsContent>
      </Tabs>
    </section>
  );
};

export default MilestonePage;
