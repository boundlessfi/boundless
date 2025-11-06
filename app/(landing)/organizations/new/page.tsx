'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import OrganizationSettings from '@/components/organization/OrganizationSettings';
import { useOrganization } from '@/lib/providers/OrganizationProvider';

export default function NewOrganizationPage() {
  const router = useRouter();
  const { createOrganization, activeOrgId } = useOrganization();
  const [isCreating, setIsCreating] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeOrg = async () => {
      try {
        // Backend will generate unique dummy name
        await createOrganization({
          name: '', // Backend will handle dummy name
          logo: '',
          tagline: '',
          about: '',
        });
        setIsCreating(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to create organization'
        );
        setIsCreating(false);
      }
    };

    initializeOrg();
  }, [createOrganization]);

  if (isCreating) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <div className='mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-white'></div>
          <p className='text-white'>Creating organization...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <p className='mb-4 text-red-500'>{error}</p>
          <button
            onClick={() => router.back()}
            className='text-white hover:text-gray-300'
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <OrganizationSettings organizationId={activeOrgId as string} />;
}
