'use client';

import React, { useState, useEffect, useRef } from 'react';
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
import { Skeleton } from '@/components/ui/skeleton';
import { OrganizationSummary } from '@/lib/providers/organization-types';
import { useNavigationLoading } from '@/lib/providers';
import { normalizeCloudinaryImageUrl } from '@/lib/utils/cloudinary-url';

interface OrganizationSelectorProps {
  organizations?: OrganizationSummary[];
  currentOrganization?: OrganizationSummary;
  isLoading?: boolean;
  onOrganizationChange?: (orgId: string) => void;
  onToggle?: (isOpen: boolean) => void;
}

export default function OrganizationSelector({
  organizations = [],
  currentOrganization,
  isLoading = false,
  onOrganizationChange,
  onToggle,
}: OrganizationSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { setIsNavigating } = useNavigationLoading();
  const [selectedOrg, setSelectedOrg] = useState<OrganizationSummary | null>(
    currentOrganization || null
  );
  const [isOpen, setIsOpen] = useState(false);
  const pendingOrgIdRef = useRef<string | null>(null);
  const isUserSelectionRef = useRef(false);

  // Sync selectedOrg with currentOrganization prop
  // This ensures the UI stays in sync with the provider state
  useEffect(() => {
    // If user just made a selection, wait for it to complete
    if (isUserSelectionRef.current) {
      // If loading finished and we have the new currentOrganization, verify it matches
      if (!isLoading && currentOrganization) {
        const currentOrgId = currentOrganization._id;
        if (currentOrgId === pendingOrgIdRef.current) {
          // Selection completed successfully, sync with provider
          setSelectedOrg(currentOrganization);
          isUserSelectionRef.current = false;
          pendingOrgIdRef.current = null;
        } else if (pendingOrgIdRef.current) {
          // The selected org doesn't match what we expected - might be a race condition
          // Clear the flag and let normal sync handle it
          isUserSelectionRef.current = false;
          pendingOrgIdRef.current = null;
        }
      }
      // Don't update from prop while user selection is pending (unless loading finished)
      return;
    }

    if (!currentOrganization) {
      // If no currentOrganization but we have organizations, use first one as fallback
      // Only do this if we haven't selected anything yet
      if (organizations.length > 0 && !selectedOrg) {
        setSelectedOrg(organizations[0]);
      }
      return;
    }

    const currentOrgId = currentOrganization._id;

    // Update if the currentOrganization ID changed or if we don't have a selectedOrg
    if (!selectedOrg || selectedOrg._id !== currentOrgId) {
      setSelectedOrg(currentOrganization);
    }
  }, [currentOrganization, organizations, isLoading, selectedOrg]);

  const handleOrganizationSelect = (org: OrganizationSummary) => {
    // Mark that this is a user selection
    isUserSelectionRef.current = true;
    pendingOrgIdRef.current = org._id;

    // Update local state immediately for instant UI feedback
    setSelectedOrg(org);
    setIsOpen(false);
    onToggle?.(false);

    // Call the change handler to update the provider
    // This will trigger a fetch and update currentOrganization prop
    onOrganizationChange?.(org._id);

    // Don't navigate if we're on the /organizations/new page
    if (pathname === '/organizations/new') {
      return;
    }

    // Always navigate to the root organization page
    setIsNavigating(true);
    router.push(`/organizations/${org._id}`);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    onToggle?.(open);
  };

  if (organizations.length === 0) {
    return null;
  }

  // Show skeleton only when we don't have a selected org (initial load)
  // Don't show skeleton during loading if we already have a selected org (optimistic update)
  if (!selectedOrg) {
    return (
      <div className='flex items-center gap-3 bg-transparent px-3 py-2'>
        <Skeleton className='h-10 w-10 rounded-full' />
        <Skeleton className='h-4 w-24' />
        <Skeleton className='h-4 w-4' />
      </div>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger
        asChild
        className='focus:ring-0 focus-visible:ring-0'
      >
        <Button
          className='flex items-center gap-3 bg-transparent px-3 py-2 transition-colors hover:bg-transparent focus:ring-0 focus-visible:ring-0 disabled:opacity-50'
          disabled={isLoading}
        >
          <div className='relative h-10 w-10 overflow-hidden rounded-full bg-white'>
            {isLoading ? (
              <Skeleton className='h-full w-full rounded-full' />
            ) : (
              <Image
                src={selectedOrg.logo || '/placeholder-org.png'}
                alt={selectedOrg.name || 'Organization'}
                fill
                className='object-cover'
              />
            )}
          </div>

          <span className='max-w-[100px] truncate text-sm font-medium text-white'>
            {selectedOrg.name || 'Select Organization'}
          </span>

          <div className='flex flex-col gap-0'>
            {isLoading ? (
              <Skeleton className='h-4 w-4' />
            ) : (
              <ChevronsUpDown className='m-0 h-4 w-4 p-0 text-white' />
            )}
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
                src={
                  normalizeCloudinaryImageUrl(org.logo) ||
                  '/placeholder-org.png'
                }
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
