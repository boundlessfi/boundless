import React from 'react';
import Link from 'next/link';
import { Github } from 'lucide-react';
import Image from 'next/image';
import { Crowdfunding } from '@/features/projects/types';

interface MilestoneLinksProps {
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

const MilestoneLinks = ({ project }: MilestoneLinksProps) => {
  return (
    <div className='!w-full space-y-5'>
      <div className='flex flex-col gap-3'>
        {project?.project.githubUrl && (
          <Link
            className='hover:text-primary flex items-center gap-2 text-sm text-white'
            href={project.project.githubUrl}
            target='_blank'
            rel='noopener noreferrer'
          >
            <Github size={16} /> {project.project.githubUrl}
          </Link>
        )}
        {project?.project.projectWebsite && (
          <Link
            className='hover:text-primary flex items-center gap-2 text-sm text-white'
            href={project.project.projectWebsite}
            target='_blank'
            rel='noopener noreferrer'
          >
            <span className='text-sm'>🌐</span> {project.project.projectWebsite}
          </Link>
        )}
        {project?.socialLinks?.map((link, index) => (
          <Link
            key={index}
            className='hover:text-primary flex items-center gap-2 text-sm text-white'
            href={link.url}
            target='_blank'
            rel='noopener noreferrer'
          >
            <span className='text-sm'>🔗</span> {link.platform}: {link.url}
          </Link>
        ))}
        {!project?.project.githubUrl &&
          !project?.project.projectWebsite &&
          (!project?.socialLinks || project.socialLinks.length === 0) && (
            <div className='py-8 text-center'>
              <p className='text-gray-400'>
                No links available for this project.
              </p>
            </div>
          )}
      </div>
      {/* Project Team Section */}
      {project?.project.teamMembers &&
        project.project.teamMembers.length > 0 && (
          <div className='flex flex-col gap-0'>
            <h4 className='mb-3 text-sm font-medium text-gray-500'>
              Project Team
            </h4>
            {project.project.teamMembers.slice(0, 3).map((member, index) => (
              <div
                key={member._id || index}
                className='flex cursor-pointer items-center justify-between rounded py-2 transition-colors hover:bg-gray-900/30'
              >
                <div className='flex items-center space-x-4'>
                  <div className='relative'>
                    <div className='h-12 w-12 overflow-hidden rounded-full border-[0.5px] border-[#2B2B2B]'>
                      <Image
                        width={48}
                        height={48}
                        src='/avatar.png'
                        alt='Team member'
                        className='h-full w-full object-cover'
                      />
                    </div>
                  </div>

                  <div className='flex flex-col space-y-0.5'>
                    <span className='text-base font-normal text-white'>
                      {member.profile?.firstName} {member.profile?.lastName}
                    </span>
                    <span
                      className={`text-sm ${member.role === 'OWNER' ? 'text-[#DBF936]' : 'text-gray-500'}`}
                    >
                      {member.role}
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
            ))}
          </div>
        )}
    </div>
  );
};

export default MilestoneLinks;
