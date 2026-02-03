'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useMarkdown } from '@/hooks/use-markdown';
import { Crowdfunding } from '@/features/projects/types';

interface MilestoneDetailsProps {
  milestoneId: string;
  project?: Crowdfunding | null;
  milestone?: {
    _id: string;
    title: string;
    description: string;
    status: string;
    dueDate: string;
    amount: number;
  };
}

const MilestoneDetails = ({
  milestoneId,
  project,
  milestone,
}: MilestoneDetailsProps) => {
  // Use real milestone data or fallback to basic structure
  const milestoneData = milestone || {
    _id: milestoneId,
    title: 'Milestone Details',
    description: 'No description available for this milestone.',
    status: 'pending',
    dueDate: new Date().toISOString(),
    amount: 0,
  };

  const { loading, error, styledContent } = useMarkdown(
    milestoneData.description || 'No description available.',
    {
      breaks: true,
      gfm: true,
      pedantic: true,
      loadingDelay: 100,
    }
  );

  return (
    <div className='space-y-8 text-white'>
      {/* Markdown Content */}
      <div className='prose prose-invert max-w-none'>
        {loading ? (
          <div className='flex items-center justify-center py-12'>
            <div className='text-[#B5B5B5]'>Loading content...</div>
          </div>
        ) : error ? (
          <div className='mb-6 rounded-lg border border-red-500/30 bg-red-900/20 p-4 text-red-400'>
            <p className='font-medium'>Error loading content:</p>
            <p className='mt-1 text-sm'>{error}</p>
          </div>
        ) : (
          styledContent
        )}
      </div>

      {/* Video Media Showcase */}
      {project?.project.demoVideo && (
        <section>
          <h2 className='mb-6 text-2xl font-bold text-white'>Media Showcase</h2>
          <div className='space-y-6'>
            <div>
              <h3 className='mb-3 text-lg font-semibold text-white'>
                Project Demo
              </h3>
              <Card className='border-gray-800 bg-[#2B2B2B] text-white'>
                <CardContent className='p-6'>
                  <div className='relative flex aspect-video items-center justify-center rounded-lg bg-black'>
                    <video
                      className='h-full w-full rounded-lg object-cover'
                      controls
                    >
                      <source
                        src={project.project.demoVideo}
                        type='video/mp4'
                      />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  <p className='mt-4 text-center text-gray-400'>
                    Project demonstration video
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Project Documents Section */}
      {project?.project.documents && (
        <section>
          <h2 className='mb-6 text-2xl font-bold text-white'>
            Project Documents
          </h2>
          <div className='space-y-4'>
            {project.project.documents.whitepaper && (
              <Card className='border-gray-800 bg-[#2B2B2B] text-white'>
                <CardContent className='p-4'>
                  <div className='flex items-center space-x-3'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-gray-700'>
                      <span className='text-sm font-medium'>PDF</span>
                    </div>
                    <div className='flex-1'>
                      <h4 className='font-medium text-white'>Whitepaper</h4>
                      <p className='text-sm text-gray-400'>
                        Project technical documentation
                      </p>
                    </div>
                    <a
                      href={project.project.documents.whitepaper}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700'
                    >
                      View
                    </a>
                  </div>
                </CardContent>
              </Card>
            )}
            {project.project.documents.pitchDeck && (
              <Card className='border-gray-800 bg-[#2B2B2B] text-white'>
                <CardContent className='p-4'>
                  <div className='flex items-center space-x-3'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-gray-700'>
                      <span className='text-sm font-medium'>PDF</span>
                    </div>
                    <div className='flex-1'>
                      <h4 className='font-medium text-white'>Pitch Deck</h4>
                      <p className='text-sm text-gray-400'>
                        Project presentation
                      </p>
                    </div>
                    <a
                      href={project.project.documents.pitchDeck}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700'
                    >
                      View
                    </a>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default MilestoneDetails;
