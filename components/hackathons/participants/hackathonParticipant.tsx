'use client';

import { useParticipants } from '@/hooks/hackathon/use-participants';
import ParticipantsFilter from './participantFilter';
import { ParticipantAvatar } from './participantAvatar';

export const HackathonParticipants = () => {
  const {
    participants,
    totalParticipants,
    submittedCount,
    setSearchTerm,
    setSortBy,
    setSubmissionFilter,
    setSkillFilter,
  } = useParticipants();

  return (
    <div className='text-left'>
      {/* Explanation Section */}
      <div className='mb-8 rounded-lg border border-gray-700 bg-gray-800/50 p-6'>
        <h3 className='mb-3 text-xl font-semibold text-white'>
          Understanding Participant Status
        </h3>
        <div className='flex items-start gap-3 text-sm text-gray-300'>
          <div className='flex flex-shrink-0 items-center gap-2'>
            <div className='relative'>
              <div className='h-8 w-8 rounded-full bg-gray-700' />
              <div className='absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-gray-900 bg-[#a7f950]' />
            </div>
          </div>
          <div>
            <p className='leading-relaxed'>
              Participants with a{' '}
              <span className='font-semibold text-[#a7f950]'>
                green indicator dot
              </span>{' '}
              on their avatar have successfully submitted their hackathon
              project. This visual badge helps you quickly identify active
              contributors who have completed their submissions. Participants
              without the green dot are still working on their projects or
              haven't submitted yet.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <ParticipantsFilter
        onSearch={setSearchTerm}
        onSortChange={setSortBy}
        onSubmissionStatusChange={setSubmissionFilter}
        onSkillChange={setSkillFilter}
        totalParticipants={totalParticipants}
        submittedCount={submittedCount}
      />

      {/* Participants Grid */}
      <div className='flex flex-wrap gap-x-6 gap-y-4'>
        {participants.map(participant => (
          <ParticipantAvatar key={participant.id} participant={participant} />
        ))}
      </div>

      {/* Empty State */}
      {participants.length === 0 && (
        <div className='py-12 text-center'>
          <p className='text-lg text-gray-400'>
            No participants found matching your filters.
          </p>
          <p className='mt-2 text-sm text-gray-500'>
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}
    </div>
  );
};
