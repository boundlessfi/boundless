'use client';

import OrganizationSettings from '@/components/organization/OrganizationSettings';

export default function NewOrganizationPage() {
  return (
    <div className='min-h-screen bg-black'>
      <OrganizationSettings isCreating={true} />
    </div>
  );
}
