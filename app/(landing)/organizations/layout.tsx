'use client';

import type React from 'react';

import OrganizationHeader from '@/components/organization/OrganizationHeader';
import OrganizationSidebar from '@/components/organization/OrganizationSidebar';
import { usePathname } from 'next/navigation';
import { OrganizationProvider } from '@/lib/providers';
import NewHackathonSidebar from '@/components/organization/hackathons/new/NewHackathonSidebar';
import HackathonSidebar from '@/components/organization/hackathons/details/HackathonSidebar';
export default function OrganizationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const showOrganizationSidebar =
    pathname !== '/organizations' && pathname.startsWith('/organizations');
  const showNewHackathonSidebar = pathname.includes('/hackathons/new');
  const showNewGrantSidebar = pathname.includes('/grants/new');
  // Show hackathon sidebar only on hackathon detail pages (not on list or new pages)
  const showHackathonSidebar =
    pathname.includes('/hackathons/') &&
    !pathname.endsWith('/hackathons') &&
    !pathname.includes('/hackathons/new');
  const getOrgIdFromPath = () => {
    if (pathname.startsWith('/organizations/')) {
      const pathParts = pathname.split('/');
      const orgId = pathParts[2];
      if (orgId && /^[a-f0-9]{24}$/.test(orgId)) {
        return orgId;
      }
    }
    return null;
  };

  const initialOrgId = getOrgIdFromPath();

  return (
    <OrganizationProvider initialOrgId={initialOrgId || undefined}>
      <div className='bg-background-main-bg relative min-h-screen text-white'>
        <OrganizationHeader />
        {showOrganizationSidebar ? (
          <div className='relative border-t border-t-zinc-800'>
            {showOrganizationSidebar &&
              !showNewHackathonSidebar &&
              !showNewGrantSidebar &&
              !showHackathonSidebar && <OrganizationSidebar />}
            {showNewHackathonSidebar && <NewHackathonSidebar />}
            {showHackathonSidebar && (
              <HackathonSidebar organizationId={initialOrgId || undefined} />
            )}
            {/* {showNewGrantSidebar && <NewGrantSidebar />} */}

            <main className='md:ml-[350px]'>{children}</main>
          </div>
        ) : (
          <main>{children}</main>
        )}
      </div>
    </OrganizationProvider>
  );
}
