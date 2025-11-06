import React from 'react';
import { ParticipantFormData } from '../../schemas/participantSchema';
import { Separator } from '@/components/ui/separator';

interface ParticipationSectionProps {
  data: ParticipantFormData;
  onEdit?: () => void;
}

const tabVisibilityLabels: Record<string, string> = {
  details_tab: 'Details Tab',
  schedule_tab: 'Schedule Tab',
  rules_tab: 'Rules Tab',
  reward_tab: 'Rewards',
  announcements_tab: 'Announcements Tab',
  partners_tab: 'Partners Tab',
  join_a_team_tab: 'Join a Team Tab',
  projects_tab: 'Projects Tab',
  participants_tab: 'Participants Tab',
};

export default function ParticipationSection({
  data,
  onEdit,
}: ParticipationSectionProps) {
  const participantTypeLabel =
    data.participantType === 'individual'
      ? 'Individual'
      : data.participantType === 'team'
        ? 'Team'
        : 'Team or Individual';

  return (
    <div className='space-y-4'>
      {/* Participation Type */}
      <div className='space-y-1'>
        <p className='text-xs font-medium text-gray-500'>Participation Type:</p>
        <p className='text-sm font-medium text-white'>{participantTypeLabel}</p>
      </div>

      {/* Team Size */}
      {(data.participantType === 'team' ||
        data.participantType === 'team_or_individual') && (
        <>
          <Separator className='bg-gray-900' />
          <div className='space-y-1'>
            <p className='mb-2 text-xs font-medium text-gray-500'>Team Size:</p>
            <div className='overflow-hidden rounded-lg border border-gray-800 bg-gray-900/50'>
              <table className='w-full'>
                <thead>
                  <tr className='border-b border-gray-800'>
                    <th className='p-3 text-left text-xs font-medium text-gray-500'>
                      Minimum
                    </th>
                    <th className='p-3 text-left text-xs font-medium text-gray-500'>
                      Maximum
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className='p-3 text-sm text-white'>
                      {data.teamMin} {data.teamMin === 1 ? 'Member' : 'Members'}
                    </td>
                    <td className='p-3 text-sm text-white'>
                      {data.teamMax} {data.teamMax === 1 ? 'Member' : 'Members'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Rules / About */}
      {data.about && (
        <>
          <Separator className='bg-gray-900' />
          <div className='space-y-1'>
            <p className='mb-2 text-xs font-medium tracking-wide text-gray-500 uppercase'>
              Rules
            </p>
            <div
              className='prose prose-invert max-w-none text-sm text-gray-300'
              dangerouslySetInnerHTML={{ __html: data.about }}
            />
          </div>
        </>
      )}

      {/* Submission Requirements */}
      <Separator className='bg-gray-900' />
      <div className='space-y-1'>
        <p className='mb-2 text-xs font-medium text-gray-500'>
          Submission Requirement:
        </p>
        <div className='flex items-center gap-6'>
          <div className='flex items-center gap-2'>
            <span className='text-sm text-white'>GitHub</span>
            <span className='text-xs text-gray-500'>
              {data.require_github ? 'Yes' : 'No'}
            </span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-sm text-white'>Demo</span>
            <span className='text-xs text-gray-500'>
              {data.require_demo_video ? 'Yes' : 'No'}
            </span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-sm text-white'>Other Links</span>
            <span className='text-xs text-gray-500'>
              {data.require_other_links ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Visibility */}
      <Separator className='bg-gray-900' />
      <div className='space-y-1'>
        <p className='mb-2 text-xs font-medium text-gray-500'>
          Tabs Visibility:
        </p>
        <div className='space-y-2'>
          {Object.entries(tabVisibilityLabels).map(([key, label]) => {
            const value = data[key as keyof ParticipantFormData];
            return (
              <div
                key={key}
                className='flex items-center justify-between text-sm'
              >
                <span className='text-white'>{label}:</span>
                <span className='text-gray-500'>{value ? 'Yes' : 'No'}</span>
              </div>
            );
          })}
        </div>
      </div>

      {onEdit && (
        <button
          onClick={onEdit}
          className='text-primary mt-2 text-sm hover:underline'
        >
          Edit Participation
        </button>
      )}
    </div>
  );
}
