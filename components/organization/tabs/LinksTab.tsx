'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BoundlessButton } from '@/components/buttons';
import { useOrganization } from '@/lib/providers/OrganizationProvider';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface OrganizationLinks {
  website: string;
  x: string;
  github: string;
  others: string;
}

interface LinksTabProps {
  initialLinks?: OrganizationLinks;
  onSave?: (links: OrganizationLinks) => void;
}

export default function LinksTab({
  initialLinks = { website: '', x: '', github: '', others: '' },
  onSave,
}: LinksTabProps) {
  const { activeOrgId, activeOrg, updateOrganizationLinks, isLoading } =
    useOrganization();

  const [links, setLinks] = useState<OrganizationLinks>(initialLinks);
  const [hasUserChanges, setHasUserChanges] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      if (activeOrg?.links) {
        setLinks({
          website: activeOrg.links.website || '',
          x: activeOrg.links.x || '',
          github: activeOrg.links.github || '',
          others: activeOrg.links.others || '',
        });
      } else if (initialLinks) {
        setLinks(initialLinks);
      }
      setHasUserChanges(false);
      setIsInitialized(true);
    }
  }, [activeOrg, initialLinks, isInitialized]);

  useEffect(() => {
    if (!isInitialized || hasUserChanges) return;
    if (!activeOrg?.links) return;

    const newLinks = {
      website: activeOrg.links.website || '',
      x: activeOrg.links.x || '',
      github: activeOrg.links.github || '',
      others: activeOrg.links.others || '',
    };

    const currentLinksStr = JSON.stringify(links);
    const newLinksStr = JSON.stringify(newLinks);

    if (newLinksStr !== currentLinksStr) {
      setLinks(newLinks);
      setHasUserChanges(false);
    }
  }, [activeOrg?.links, isInitialized, hasUserChanges, links]);

  const updateLink = (field: keyof OrganizationLinks, value: string) => {
    setLinks(prev => ({ ...prev, [field]: value }));
    setHasUserChanges(true);
  };

  const handleSave = async () => {
    if (!activeOrgId) {
      toast.error('No active organization selected');
      return;
    }

    setIsSaving(true);

    try {
      if (!updateOrganizationLinks) {
        throw new Error(
          'Organization functions not available. Please refresh the page.'
        );
      }

      // Convert empty strings to undefined - only validate non-empty fields
      const linksToSend = {
        website: links.website.trim() || undefined,
        x: links.x.trim() || undefined,
        github: links.github.trim() || undefined,
        others: links.others.trim() || undefined,
      };

      await updateOrganizationLinks(activeOrgId, linksToSend);

      toast.success('Organization links updated successfully');
      setHasUserChanges(false);

      if (onSave) {
        onSave(links);
      }
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message.includes('401') ||
          error.message.includes('Unauthorized')
        ) {
          toast.error('Authentication failed. Please login again.');
        } else if (
          error.message.includes('403') ||
          error.message.includes('Forbidden')
        ) {
          toast.error(
            'You do not have permission to update this organization.'
          );
        } else if (
          error.message.includes('404') ||
          error.message.includes('Not Found')
        ) {
          toast.error('Organization not found.');
        } else if (
          error.message.includes('Network') ||
          error.message.includes('timeout')
        ) {
          toast.error(
            'Network error. Please check your connection and try again.'
          );
        } else if (
          error.message.includes('Validation failed') ||
          error.message.includes('valid URL')
        ) {
          toast.error('Please enter valid URLs for all links.');
        } else {
          toast.error(`Failed to save organization links: ${error.message}`);
        }
      } else {
        toast.error('Failed to save organization links. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className='space-y-6'>
      <div className='space-y-2'>
        <Label className='text-sm font-normal text-white'>Website</Label>
        <Input
          value={links.website}
          onChange={e => updateLink('website', e.target.value)}
          placeholder='Enter link to organization website'
          className='bg-background rounded-[12px] border-gray-900 !p-4 !py-5 text-white placeholder:text-gray-700 focus-visible:ring-0'
          disabled={isSaving}
        />
      </div>

      <div className='space-y-2'>
        <Label className='text-sm font-normal text-white'>X (Twitter)</Label>
        <div className='relative'>
          <span className='absolute top-1/2 left-4 -translate-y-1/2 font-normal text-white'>
            @
          </span>
          <Input
            value={links.x}
            onChange={e => updateLink('x', e.target.value)}
            placeholder='Organization X handle'
            className='bg-background rounded-[12px] border-gray-900 !p-4 !py-5 !pl-8 text-white placeholder:text-gray-700 focus-visible:ring-0'
            disabled={isSaving}
          />
        </div>
      </div>

      <div className='space-y-2'>
        <Label className='text-sm font-normal text-white'>GitHub</Label>
        <Input
          value={links.github}
          onChange={e => updateLink('github', e.target.value)}
          placeholder='Link to GitHub repo or GitHub organization profile'
          className='bg-background rounded-[12px] border-gray-900 !p-4 !py-5 text-white placeholder:text-gray-700 focus-visible:ring-0'
          disabled={isSaving}
        />
      </div>

      <div className='space-y-2'>
        <Label className='text-sm font-normal text-white'>
          Other Link (optional)
        </Label>
        <Input
          value={links.others}
          onChange={e => updateLink('others', e.target.value)}
          placeholder='Link URL (newsletters or social account)'
          className='bg-background rounded-[12px] border-gray-900 !p-4 !py-5 text-white placeholder:text-gray-700 focus-visible:ring-0'
          disabled={isSaving}
        />
      </div>

      <div className='space-y-2'>
        {hasUserChanges && (
          <div className='flex items-center gap-2 text-sm text-amber-400'>
            <div className='h-2 w-2 rounded-full bg-amber-400' />
            You have unsaved changes
          </div>
        )}
        <BoundlessButton
          onClick={handleSave}
          className={cn(
            'w-full',
            (isSaving || isLoading) && 'cursor-not-allowed opacity-50'
          )}
          disabled={isSaving || isLoading}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </BoundlessButton>
      </div>
    </div>
  );
}
