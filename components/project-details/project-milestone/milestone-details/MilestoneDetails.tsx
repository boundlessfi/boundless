'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useMarkdown } from '@/hooks/use-markdown';
import { CrowdfundingProject } from '@/types/project';

interface MilestoneDetailsProps {
  milestoneId: string;
  project?: CrowdfundingProject | null;
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

  // Get project links from project data
  const projectLinks = project?.socialLinks || [];
  const projectWebsite = project?.projectWebsite;
  const githubUrl = project?.githubUrl;

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
      {project?.demoVideo && (
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
                      <source src={project.demoVideo} type='video/mp4' />
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
      {project?.documents && (
        <section>
          <h2 className='mb-6 text-2xl font-bold text-white'>
            Project Documents
          </h2>
          <div className='space-y-4'>
            {project.documents.whitepaper && (
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
                      href={project.documents.whitepaper}
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
            {project.documents.pitchDeck && (
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
                      href={project.documents.pitchDeck}
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

      {/* Project Links Section */}
      {((project?.socialLinks && project?.socialLinks.length > 0) ||
        project?.projectWebsite ||
        project?.githubUrl) && (
        <section>
          <h2 className='mb-6 text-2xl font-bold text-white'>Project Links</h2>
          <div className='space-y-3'>
            {githubUrl && (
              <a
                href={githubUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center space-x-3 rounded-lg border border-gray-800 bg-[#2B2B2B] p-4 text-white transition-colors hover:bg-gray-700'
              >
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-gray-700'>
                  <span className='text-sm font-medium'>GH</span>
                </div>
                <div className='flex-1'>
                  <h4 className='font-medium'>GitHub Repository</h4>
                  <p className='text-sm text-gray-400'>{githubUrl}</p>
                </div>
                <svg
                  className='h-5 w-5 text-gray-400'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14'
                  />
                </svg>
              </a>
            )}
            {projectWebsite && (
              <a
                href={projectWebsite}
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center space-x-3 rounded-lg border border-gray-800 bg-[#2B2B2B] p-4 text-white transition-colors hover:bg-gray-700'
              >
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-gray-700'>
                  <span className='text-sm font-medium'>WWW</span>
                </div>
                <div className='flex-1'>
                  <h4 className='font-medium'>Project Website</h4>
                  <p className='text-sm text-gray-400'>{projectWebsite}</p>
                </div>
                <svg
                  className='h-5 w-5 text-gray-400'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14'
                  />
                </svg>
              </a>
            )}
            {projectLinks.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center space-x-3 rounded-lg border border-gray-800 bg-[#2B2B2B] p-4 text-white transition-colors hover:bg-gray-700'
              >
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-gray-700'>
                  <span className='text-sm font-medium'>
                    {link.platform.toUpperCase()}
                  </span>
                </div>
                <div className='flex-1'>
                  <h4 className='font-medium'>{link.platform}</h4>
                  <p className='text-sm text-gray-400'>{link.url}</p>
                </div>
                <svg
                  className='h-5 w-5 text-gray-400'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14'
                  />
                </svg>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Support Message Section */}
      <section>
        <h2 className='mb-4 text-2xl font-bold text-white'>
          Support This Milestone
        </h2>
        <p className='leading-relaxed text-white'>
          By supporting this milestone, you're contributing to the development
          of {milestoneData.title} and helping bring this important work to
          completion. Your support helps ensure timely delivery and quality
          execution.
        </p>
      </section>
    </div>
  );
};

export default MilestoneDetails;
