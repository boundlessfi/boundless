'use client';

import { useRouter } from 'next/navigation';
import { Users, User, Calendar, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ParticipantSubmission } from '@/lib/api/hackathons';
import Image from 'next/image';

interface SubmissionsListProps {
  submissions: ParticipantSubmission[];
  viewMode: 'grid' | 'table';
  loading: boolean;
  onRefresh: () => void;
}

export function SubmissionsList({
  submissions,
  viewMode,
  loading,
}: SubmissionsListProps) {
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'SHORTLISTED':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'DISQUALIFIED':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'WITHDRAWN':
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const handleSubmissionClick = (submissionId: string) => {
    router.push(`/projects/${submissionId}?type=submission`);
  };

  if (submissions.length === 0 && !loading) {
    return (
      <div className='flex flex-col items-center justify-center rounded-xl border border-gray-800/50 bg-gray-900/20 py-20 text-center'>
        <p className='text-lg font-medium text-gray-400'>
          No submissions found
        </p>
        <p className='mt-2 text-sm text-gray-500'>
          Try adjusting your filters or check back later
        </p>
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        {submissions.map(submission => {
          const subData = submission as any;
          return (
            <Card
              key={subData.id}
              className='group hover:border-primary/50 cursor-pointer overflow-hidden border-gray-800/50 bg-gray-900/20 transition-all hover:bg-gray-900/40'
              onClick={() => handleSubmissionClick(subData.id)}
            >
              <CardContent className='p-6'>
                {/* Logo and Status */}
                <div className='mb-4 flex items-start justify-between'>
                  <div className='relative h-16 w-16 overflow-hidden rounded-lg bg-gray-800'>
                    {subData.logo ? (
                      <Image
                        src={subData.logo}
                        alt={subData.projectName}
                        fill
                        className='object-cover'
                      />
                    ) : (
                      <div className='flex h-full w-full items-center justify-center text-2xl font-bold text-gray-600'>
                        {subData.projectName?.charAt(0) || 'P'}
                      </div>
                    )}
                  </div>
                  <Badge className={`${getStatusColor(subData.status)} border`}>
                    {subData.status}
                  </Badge>
                </div>

                {/* Project Name */}
                <h3 className='group-hover:text-primary mb-2 line-clamp-2 text-lg font-semibold text-white'>
                  {subData.projectName || 'Untitled Project'}
                </h3>

                {/* Category */}
                {subData.category && (
                  <p className='mb-3 text-sm text-gray-400'>
                    {subData.category}
                  </p>
                )}

                {/* Type & Date */}
                <div className='mt-4 flex items-center justify-between border-t border-gray-800/50 pt-4 text-xs text-gray-500'>
                  <div className='flex items-center gap-1'>
                    {subData.participationType === 'TEAM' ? (
                      <>
                        <Users className='h-3 w-3' />
                        <span>Team</span>
                      </>
                    ) : (
                      <>
                        <User className='h-3 w-3' />
                        <span>Individual</span>
                      </>
                    )}
                  </div>
                  <div className='flex items-center gap-1'>
                    <Calendar className='h-3 w-3' />
                    <span>
                      {new Date(
                        subData.submittedAt || subData.createdAt
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* View Link */}
                <div className='text-primary mt-4 flex items-center gap-1 text-xs opacity-0 transition-opacity group-hover:opacity-100'>
                  <span>View Details</span>
                  <ExternalLink className='h-3 w-3' />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  // Table view
  return (
    <div className='overflow-hidden rounded-xl border border-gray-800/50 bg-gray-900/20'>
      <table className='w-full'>
        <thead className='border-b border-gray-800/50 bg-gray-900/40'>
          <tr>
            <th className='px-6 py-4 text-left text-xs font-medium tracking-wider text-gray-400 uppercase'>
              Project
            </th>
            <th className='px-6 py-4 text-left text-xs font-medium tracking-wider text-gray-400 uppercase'>
              Category
            </th>
            <th className='px-6 py-4 text-left text-xs font-medium tracking-wider text-gray-400 uppercase'>
              Type
            </th>
            <th className='px-6 py-4 text-left text-xs font-medium tracking-wider text-gray-400 uppercase'>
              Status
            </th>
            <th className='px-6 py-4 text-left text-xs font-medium tracking-wider text-gray-400 uppercase'>
              Submitted
            </th>
          </tr>
        </thead>
        <tbody className='divide-y divide-gray-800/50'>
          {submissions.map(submission => {
            const subData = submission as any;
            return (
              <tr
                key={subData.id}
                className='cursor-pointer transition-colors hover:bg-gray-900/40'
                onClick={() => handleSubmissionClick(subData.id)}
              >
                <td className='px-6 py-4'>
                  <div className='flex items-center gap-3'>
                    <div className='relative h-10 w-10 overflow-hidden rounded-lg bg-gray-800'>
                      {subData.logo ? (
                        <Image
                          src={subData.logo}
                          alt={subData.projectName}
                          fill
                          className='object-cover'
                        />
                      ) : (
                        <div className='flex h-full w-full items-center justify-center text-lg font-bold text-gray-600'>
                          {subData.projectName?.charAt(0) || 'P'}
                        </div>
                      )}
                    </div>
                    <span className='font-medium text-white'>
                      {subData.projectName || 'Untitled Project'}
                    </span>
                  </div>
                </td>
                <td className='px-6 py-4 text-gray-400'>
                  {subData.category || '-'}
                </td>
                <td className='px-6 py-4'>
                  <div className='flex items-center gap-1 text-gray-400'>
                    {subData.participationType === 'TEAM' ? (
                      <>
                        <Users className='h-4 w-4' />
                        <span>Team</span>
                      </>
                    ) : (
                      <>
                        <User className='h-4 w-4' />
                        <span>Individual</span>
                      </>
                    )}
                  </div>
                </td>
                <td className='px-6 py-4'>
                  <Badge className={`${getStatusColor(subData.status)} border`}>
                    {subData.status}
                  </Badge>
                </td>
                <td className='px-6 py-4 text-gray-400'>
                  {new Date(
                    subData.submittedAt || subData.createdAt
                  ).toLocaleDateString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
