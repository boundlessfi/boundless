'use client';

import React, { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { OrganizationSummary } from '@/lib/providers/organization-types';

interface OrganizationSelectorProps {
  organizations?: OrganizationSummary[];
  currentOrganization?: OrganizationSummary;
  onOrganizationChange?: (orgId: string) => void;
  onToggle?: (isOpen: boolean) => void;
}

export default function OrganizationSelector({
  organizations = [],
  currentOrganization,
  onOrganizationChange,
  onToggle,
}: OrganizationSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [selectedOrg, setSelectedOrg] = useState<OrganizationSummary | null>(
    currentOrganization || organizations[0] || null
  );
  const [isOpen, setIsOpen] = useState(false);

  React.useEffect(() => {
    if (currentOrganization) {
      if (!selectedOrg || selectedOrg._id !== currentOrganization._id) {
        setSelectedOrg(currentOrganization);
      }
    } else if (organizations.length > 0 && !selectedOrg) {
      setSelectedOrg(organizations[0]);
    }
  }, [currentOrganization, organizations, selectedOrg]);

  React.useEffect(() => {
    if (currentOrganization && organizations.length > 0) {
      const foundOrg = organizations.find(
        org => org._id === currentOrganization._id
      );
      if (!foundOrg) {
        setSelectedOrg(organizations[0]);
        onOrganizationChange?.(organizations[0]._id);
      }
    }
  }, [currentOrganization, organizations, onOrganizationChange]);

  const handleOrganizationSelect = (org: OrganizationSummary) => {
    setSelectedOrg(org);
    onOrganizationChange?.(org._id);
    setIsOpen(false);
    onToggle?.(false);

    const currentPath = pathname;
    const orgId = org._id;

    if (currentPath.startsWith('/organizations/')) {
      const pathAfterOrgs = currentPath.replace('/organizations/', '');

      if (pathAfterOrgs.match(/^[a-f0-9]{24}/)) {
        const newPath = currentPath.replace(
          /^\/organizations\/[a-f0-9]{24}/,
          `/organizations/${orgId}`
        );
        router.push(newPath);
      } else {
        router.push(`/organizations/${orgId}`);
      }
    } else if (currentPath === '/organizations') {
      router.push(`/organizations/${orgId}`);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    onToggle?.(open);
  };

  if (organizations.length === 0) {
    return null;
  }

  if (!selectedOrg) {
    return (
      <div className='flex items-center gap-3 bg-transparent px-3 py-2'>
        <div className='relative h-10 w-10 animate-pulse overflow-hidden rounded-full bg-gray-300' />
        <span className='text-sm font-medium text-gray-400'>Loading...</span>
      </div>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger
        asChild
        className='focus:ring-0 focus-visible:ring-0'
      >
        <Button className='flex items-center gap-3 bg-transparent px-3 py-2 transition-colors hover:bg-transparent focus:ring-0 focus-visible:ring-0'>
          <div className='relative h-10 w-10 overflow-hidden rounded-full bg-white'>
            <Image
              src={selectedOrg.logo || ''}
              alt={selectedOrg.name || 'Organization'}
              fill
              className='object-cover'
            />
          </div>

          <span className='max-w-[100px] truncate text-sm font-medium text-white'>
            {selectedOrg.name || 'Select Organization'}
          </span>

          <div className='flex flex-col gap-0'>
            <ChevronsUpDown className='m-0 h-4 w-4 p-0 text-white' />
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className='w-[280px] rounded-lg border border-[#2B2B2B] bg-[#1A1A1A] p-2 shadow-lg'
        align='start'
      >
        {organizations.map(org => (
          <DropdownMenuItem
            key={org._id}
            onClick={() => handleOrganizationSelect(org)}
            className='flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 hover:bg-[#252525] focus:bg-[#252525]'
          >
            <div className='relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-full bg-white'>
              <Image
                src={org.logo || ''}
                alt={org.name}
                fill
                className='object-cover'
              />
            </div>

            <span className='flex-1 text-sm font-medium text-white'>
              {org.name}
            </span>

            {selectedOrg && selectedOrg._id === org._id && (
              <Check className='text-primary h-4 w-4' />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
