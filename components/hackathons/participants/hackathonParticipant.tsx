'use client';

import { useMemo, useState } from 'react';
import { ParticipantAvatar } from './participantAvatar';
import ParticipantsFilter from './participantFilter';
import type { Participant } from '@/app/(landing)/hackathons/page';

interface HackathonParticipantsProps {
  participants: Participant[];
}

export const HackathonParticipants = ({
  participants,
}: HackathonParticipantsProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [submissionFilter, setSubmissionFilter] = useState('all');
  const [skillFilter, setSkillFilter] = useState('all');

  const additionalUsernames = [
    'GauravKarakoti',
    'kannan16a2',
    'koisose',
    'Screpuh',
    'ayushi0x',
    'adetayo4422',
    'Ogtech',
    'Sunus200p',
    'carlos_israelj',
    'cryptopower',
    'mdlog123',
    'Oneyejack247',
    'vedantp03',
    'eastmaels',
    'pnkjbee',
    'Grant_F',
    'sideshift_george',
    'wonkassoy',
    'eye',
    'Kairos',
  ];

  const allParticipants: Participant[] = [...participants];

  for (let i = 0; i < 50; i++) {
    const base = participants[i % participants.length];
    allParticipants.push({
      ...base,
      id: participants.length + i + 1,
      username:
        additionalUsernames[i % additionalUsernames.length] || `user${i}`,
      hasSubmitted: Math.random() > 0.5,
    });
  }

  const filteredAndSortedParticipants = useMemo(() => {
    let filtered = [...allParticipants];

    // Search
    if (searchTerm) {
      filtered = filtered.filter(
        p =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.categories?.some(cat =>
            cat.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Submission filter
    if (submissionFilter === 'submitted')
      filtered = filtered.filter(p => p.hasSubmitted);
    if (submissionFilter === 'not_submitted')
      filtered = filtered.filter(p => !p.hasSubmitted);

    // Skill filter
    if (skillFilter !== 'all') {
      filtered = filtered.filter(
        p =>
          p.role?.toLowerCase().includes(skillFilter) ||
          p.categories?.some(cat => cat.toLowerCase().includes(skillFilter))
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return (
            new Date(b.joinedDate || '').getTime() -
            new Date(a.joinedDate || '').getTime()
          );
        case 'oldest':
          return (
            new Date(a.joinedDate || '').getTime() -
            new Date(b.joinedDate || '').getTime()
          );
        case 'followers_high':
          return (b.followers || 0) - (a.followers || 0);
        case 'followers_low':
          return (a.followers || 0) - (b.followers || 0);
        case 'projects_high':
          return (b.projects || 0) - (a.projects || 0);
        case 'projects_low':
          return (a.projects || 0) - (b.projects || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [allParticipants, searchTerm, sortBy, submissionFilter, skillFilter]);

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
        totalParticipants={allParticipants.length}
        submittedCount={allParticipants.filter(p => p.hasSubmitted).length}
      />

      {/* Grid */}
      <div className='flex flex-wrap gap-x-6 gap-y-4'>
        {filteredAndSortedParticipants.map(participant => (
          <ParticipantAvatar key={participant.id} participant={participant} />
        ))}
      </div>

      {/* Empty State */}
      {filteredAndSortedParticipants.length === 0 && (
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
