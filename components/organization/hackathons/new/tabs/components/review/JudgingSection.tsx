import React from 'react';
import { JudgingFormData, Criterion } from '../../schemas/judgingSchema';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';

interface Administrator {
  id: string;
  name: string;
  email?: string;
  handle?: string;
  role: 'OWNER' | 'ADMIN';
  avatar?: string;
}

interface JudgingSectionProps {
  data: JudgingFormData;
  administrators?: Administrator[];
  onEdit?: () => void;
}

// Mock administrators - in production, this would come from props or API
const defaultAdministrators: Administrator[] = [
  {
    id: '1',
    name: 'Brooklyn Simmons',
    email: 'debbie.baker@example.com',
    role: 'OWNER',
  },
  {
    id: '2',
    name: 'Annette Black',
    handle: '@verydarkman',
    role: 'ADMIN',
  },
  {
    id: '3',
    name: 'Cody Fisher',
    handle: '@verydarkman',
    role: 'ADMIN',
  },
  {
    id: '4',
    name: 'Ronald Richards',
    handle: '@verydarkman',
    role: 'ADMIN',
  },
];

export default function JudgingSection({
  data,
  administrators = defaultAdministrators,
  onEdit,
}: JudgingSectionProps) {
  if (!data.criteria || data.criteria.length === 0) return null;

  return (
    <div className='space-y-6'>
      {/* Criteria Section */}
      <div className='space-y-1'>
        <p className='mb-2 text-xs font-medium text-gray-500'>Criteria</p>
        <div className='overflow-hidden rounded-lg border border-gray-800 bg-gray-900/50'>
          <table className='w-full'>
            <thead>
              <tr className='border-b border-gray-800'>
                <th className='p-3 text-left text-xs font-medium text-gray-500'>
                  Weight
                </th>
                <th className='p-3 text-left text-xs font-medium text-gray-500'>
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {data.criteria.map((criterion: Criterion, idx: number) => (
                <React.Fragment key={criterion.id || idx}>
                  {idx > 0 && (
                    <tr>
                      <td colSpan={2} className='p-0'>
                        <Separator className='bg-gray-800' />
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td className='p-3'>
                      <div className='space-y-1'>
                        <p className='text-sm font-medium text-white'>
                          {criterion.name}
                        </p>
                        <p className='text-xs text-gray-500'>
                          {criterion.weight}%
                        </p>
                      </div>
                    </td>
                    <td className='p-3'>
                      <p className='text-sm text-white'>
                        {criterion.description || 'Empty'}
                      </p>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Administrators Section */}
      <div className='space-y-1'>
        <p className='mb-2 text-xs font-medium text-gray-500'>Administrators</p>
        <div className='space-y-0'>
          {administrators.map((admin, idx) => (
            <React.Fragment key={admin.id}>
              {idx > 0 && <Separator className='bg-gray-900' />}
              <div className='flex items-center justify-between py-3'>
                <div className='flex items-center gap-3'>
                  {admin.avatar ? (
                    <div className='relative h-10 w-10 overflow-hidden rounded-full'>
                      <Image
                        src={admin.avatar}
                        alt={admin.name}
                        fill
                        className='object-cover'
                      />
                    </div>
                  ) : (
                    <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 font-medium text-white'>
                      {admin.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className='text-sm font-medium text-white'>
                      {admin.name}
                    </p>
                    {admin.email && (
                      <p className='text-xs text-gray-500'>{admin.email}</p>
                    )}
                    {admin.handle && (
                      <p className='text-xs text-gray-500'>{admin.handle}</p>
                    )}
                  </div>
                </div>
                <span
                  className={`text-xs font-medium ${
                    admin.role === 'OWNER' ? 'text-orange-500' : 'text-gray-400'
                  }`}
                >
                  {admin.role}
                </span>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {onEdit && (
        <button
          onClick={onEdit}
          className='text-primary mt-2 text-sm hover:underline'
        >
          Edit Judging Criteria
        </button>
      )}
    </div>
  );
}
