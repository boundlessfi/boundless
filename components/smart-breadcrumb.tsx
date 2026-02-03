'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  me: 'Profile',
  projects: 'Projects',
  hackathons: 'Hackathons',
  bounties: 'Bounties',
  organizations: 'Organizations',
  waitlist: 'Waitlist',
  auth: 'Authentication',
  profile: 'Profile',
  settings: 'Settings',
  create: 'Create',
  edit: 'Edit',
  view: 'View',
};

function generateBreadcrumbs(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);

  // Skip dynamic route segments (those with brackets or UUIDs)
  const filteredSegments = segments.filter(
    segment =>
      !segment.includes('[') &&
      !segment.includes(']') &&
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        segment
      ) &&
      !/^[0-9a-f]{24}$/i.test(segment) // MongoDB ObjectId
  );

  const breadcrumbs = filteredSegments.map((segment, index) => {
    const href = '/' + filteredSegments.slice(0, index + 1).join('/');
    const label =
      routeLabels[segment] ||
      segment.charAt(0).toUpperCase() + segment.slice(1);
    const isLast = index === filteredSegments.length - 1;

    return {
      href,
      label,
      isLast,
    };
  });

  return breadcrumbs;
}

export function SmartBreadcrumb() {
  const pathname = usePathname();

  // Don't show breadcrumbs on the home page or landing pages
  if (pathname === '/' || pathname.startsWith('/(landing)')) {
    return null;
  }

  const breadcrumbs = generateBreadcrumbs(pathname);

  // If no breadcrumbs to show, return null
  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <Breadcrumb className='text-white/80'>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href='/' className='text-white/60 hover:text-white/80'>
              Home
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {breadcrumbs.map(breadcrumb => (
          <div key={breadcrumb.href} className='flex items-center'>
            <BreadcrumbSeparator className='text-white/40' />
            <BreadcrumbItem>
              {breadcrumb.isLast ? (
                <BreadcrumbPage className='font-medium text-white'>
                  {breadcrumb.label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link
                    href={breadcrumb.href}
                    className='text-white/60 hover:text-white/80'
                  >
                    {breadcrumb.label}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
