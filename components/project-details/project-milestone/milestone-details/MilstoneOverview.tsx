import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { Github } from 'lucide-react';
import Image from 'next/image';
import { CrowdfundingProject } from '@/features/projects/types';

interface MilstoneOverviewProps {
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

const MilstoneOverview = ({ project, milestone }: MilstoneOverviewProps) => {
  return (
    <div className='w-full rounded-[12px] border border-gray-900 bg-[#101010] py-5 md:max-w-[500px] md:py-8'>
      <div className='px-5'>
        <div className='space-y-3'>
          <h3 className='text-xl font-medium text-white md:text-2xl'>
            {milestone?.title || 'Milestone Details'}
          </h3>
          <Badge
            variant='outline'
            className='bg-background border border-gray-900 text-white'
          >
            {milestone?.status || 'Pending'}
          </Badge>
          <p className='leading-[140%] text-white md:leading-[160%]'>
            {milestone?.description ||
              project?.description ||
              'No description available.'}
          </p>
          <div className='flex items-center justify-start gap-2 text-xs md:text-sm'>
            <span>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='16'
                height='16'
                viewBox='0 0 16 16'
                fill='none'
              >
                <path
                  d='M14 6.66732H2M10.6667 1.33398V4.00065M5.33333 1.33398V4.00065M7 9.33399L8 8.66732V12.0007M7.16667 12.0007H8.83333M5.2 14.6673H10.8C11.9201 14.6673 12.4802 14.6673 12.908 14.4493C13.2843 14.2576 13.5903 13.9516 13.782 13.5753C14 13.1475 14 12.5874 14 11.4673V5.86732C14 4.74721 14 4.18716 13.782 3.75934C13.5903 3.38301 13.2843 3.07705 12.908 2.8853C12.4802 2.66732 11.9201 2.66732 10.8 2.66732H5.2C4.0799 2.66732 3.51984 2.66732 3.09202 2.8853C2.71569 3.07705 2.40973 3.38301 2.21799 3.75934C2 4.18716 2 4.74721 2 5.86732V11.4673C2 12.5874 2 13.1475 2.21799 13.5753C2.40973 13.9516 2.71569 14.2576 3.09202 14.4493C3.51984 14.6673 4.0799 14.6673 5.2 14.6673Z'
                  stroke='#B5B5B5'
                  strokeWidth='1.12'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </span>
            <span className='text-gray-500'>
              {milestone?.dueDate
                ? new Date(milestone.dueDate).toLocaleDateString('en-US', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'TBD'}
            </span>
            <span className='text-[#E26E6A]'>
              {milestone?.status === 'completed' ? 'Completed' : 'Active'}
            </span>
          </div>
          <div className='flex items-center justify-start gap-2 text-xs md:text-sm'>
            <span>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='20'
                height='18'
                viewBox='0 0 20 18'
                fill='none'
              >
                <path
                  d='M10.8337 3.16667C10.8337 4.08714 8.78163 4.83333 6.25033 4.83333C3.71902 4.83333 1.66699 4.08714 1.66699 3.16667M10.8337 3.16667C10.8337 2.24619 8.78163 1.5 6.25033 1.5C3.71902 1.5 1.66699 2.24619 1.66699 3.16667M10.8337 3.16667V4.41667M1.66699 3.16667V13.1667C1.66699 14.0871 3.71902 14.8333 6.25033 14.8333M6.25033 8.16667C6.10987 8.16667 5.97089 8.16437 5.83366 8.15987C3.49762 8.08332 1.66699 7.3694 1.66699 6.5M6.25033 11.5C3.71902 11.5 1.66699 10.7538 1.66699 9.83333M18.3337 8.58333C18.3337 9.50381 16.2816 10.25 13.7503 10.25C11.219 10.25 9.16699 9.50381 9.16699 8.58333M18.3337 8.58333C18.3337 7.66286 16.2816 6.91667 13.7503 6.91667C11.219 6.91667 9.16699 7.66286 9.16699 8.58333M18.3337 8.58333V14.8333C18.3337 15.7538 16.2816 16.5 13.7503 16.5C11.219 16.5 9.16699 15.7538 9.16699 14.8333V8.58333M18.3337 11.7083C18.3337 12.6288 16.2816 13.375 13.7503 13.375C11.219 13.375 9.16699 12.6288 9.16699 11.7083'
                  stroke='#B5B5B5'
                  strokeWidth='1.4'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </span>
            <span className='font-semibold text-white'>
              ${milestone?.amount?.toLocaleString() || '0'}
            </span>
            <span className='text-[#fff]'>
              - (
              {project?.milestones
                ? Math.round(
                    ((milestone?.amount || 0) /
                      project.milestones.reduce(
                        (sum, m) => sum + m.amount,
                        0
                      )) *
                      100
                  )
                : 0}
              % of total project fund)
            </span>
          </div>
        </div>
      </div>
      <div className='hidden md:block'>
        <Separator className='my-6 bg-[#2B2B2B]' />
        <div className='space-y-3 px-8'>
          <h4 className='text-sm font-medium text-gray-500'>Links</h4>
          <div className='flex flex-col gap-2'>
            {project?.githubUrl && (
              <Link
                className='hover:text-primary flex items-center gap-2 text-sm text-white'
                href={project.githubUrl}
                target='_blank'
                rel='noopener noreferrer'
              >
                <Github size={16} /> {project.githubUrl}
              </Link>
            )}
            {project?.projectWebsite && (
              <Link
                className='hover:text-primary flex items-center gap-2 text-sm text-white'
                href={project.projectWebsite}
                target='_blank'
                rel='noopener noreferrer'
              >
                <span className='text-sm'>🌐</span> {project.projectWebsite}
              </Link>
            )}
            {/* {project?.socialLinks?.map((link, index) => (
              <Link
                key={index}
                className='hover:text-primary flex items-center gap-2 text-sm text-white'
                href={link.url}
                target='_blank'
                rel='noopener noreferrer'
              >
                <span className='text-sm'>🔗</span> {link.platform}: {link.url}
              </Link>
            ))} */}
          </div>
        </div>
        <Separator className='my-6 bg-[#2B2B2B]' />
        <div className='flex flex-col gap-3 px-8'>
          {/* Project Info */}
          <div className='flex cursor-pointer items-center justify-between rounded px-3 py-2 transition-colors hover:bg-gray-900/30'>
            <div className='flex items-center space-x-4'>
              <div className='relative'>
                <div className='h-12 w-12 overflow-hidden rounded-full border-[0.5px] border-[#2B2B2B]'>
                  {project?.logo ? (
                    <Image
                      width={48}
                      height={48}
                      src={project.logo}
                      alt={project.title}
                      className='h-full w-full object-cover'
                    />
                  ) : (
                    <Image
                      width={48}
                      height={48}
                      src='/avatar.png'
                      alt='Default project logo'
                      className='h-full w-full object-cover'
                    />
                  )}
                </div>
              </div>

              <div className='flex flex-col space-y-0.5'>
                <span className='text-sm font-normal text-gray-500'>
                  Project
                </span>
                <span className='text-[#fff]'>
                  {project?.title || 'Unknown Project'}
                </span>
              </div>
            </div>

            <svg
              width='20'
              height='20'
              viewBox='0 0 20 20'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M7.5 15L12.5 10L7.5 5'
                stroke='white'
                strokeWidth='1.4'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </div>

          {/* Project Creator */}
          {project?.creator && (
            <div className='flex cursor-pointer items-center justify-between rounded px-3 py-2 transition-colors hover:bg-gray-900/30'>
              <div className='flex items-center space-x-4'>
                <div className='relative'>
                  <div className='h-12 w-12 overflow-hidden rounded-full border-[0.5px] border-[#2B2B2B]'>
                    <Image
                      width={48}
                      height={48}
                      src='/avatar.png'
                      alt='Project creator'
                      className='h-full w-full object-cover'
                    />
                  </div>
                </div>

                <div className='flex flex-col space-y-0.5'>
                  <span className='text-base font-normal text-white'>
                    {project.creator.name}{' '}
                  </span>
                  <span className='text-sm text-[#DBF936]'>OWNER</span>
                </div>
              </div>

              <svg
                width='20'
                height='20'
                viewBox='0 0 20 20'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M7.5 15L12.5 10L7.5 5'
                  stroke='white'
                  strokeWidth='1.4'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MilstoneOverview;
