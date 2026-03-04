'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BoundlessButton } from '@/components/buttons';
import { useOrganization } from '@/lib/providers/OrganizationProvider';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useLinkValidation } from '@/hooks/use-link-validation';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

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

  const { validateWebsite, validateXHandle, validateGithubHandle } =
    useLinkValidation();
  const [validationStates, setValidationStates] = useState<{
    website: {
      isValid: boolean | null;
      isValidating: boolean;
      error: string | null;
    };
    x: { isValid: boolean | null; isValidating: boolean; error: string | null };
    github: {
      isValid: boolean | null;
      isValidating: boolean;
      error: string | null;
    };
  }>({
    website: { isValid: null, isValidating: false, error: null },
    x: { isValid: null, isValidating: false, error: null },
    github: { isValid: null, isValidating: false, error: null },
  });

  const debouncedWebsite = useDebounce(links.website, 800);
  const debouncedX = useDebounce(links.x, 800);
  const debouncedGithub = useDebounce(links.github, 800);

  const activeLinks =
    activeOrg?.metadata?.links ||
    (activeOrg as { links?: OrganizationLinks })?.links;

  useEffect(() => {
    if (!isInitialized) {
      if (activeLinks) {
        setLinks({
          website: activeLinks.website || '',
          x: activeLinks.x || '',
          github: activeLinks.github || '',
          others: activeLinks.others || '',
        });
      } else if (initialLinks) {
        setLinks(initialLinks);
      }
      setHasUserChanges(false);
      setIsInitialized(true);
    }
  }, [activeOrg, initialLinks, isInitialized, activeLinks]);

  useEffect(() => {
    if (!isInitialized || hasUserChanges) return;
    if (!activeLinks) return;

    const newLinks = {
      website: activeLinks.website || '',
      x: activeLinks.x || '',
      github: activeLinks.github || '',
      others: activeLinks.others || '',
    };

    const currentLinksStr = JSON.stringify(links);
    const newLinksStr = JSON.stringify(newLinks);

    if (newLinksStr !== currentLinksStr) {
      setLinks(newLinks);
      setHasUserChanges(false);
    }
  }, [activeLinks, isInitialized, hasUserChanges, links]);

  // Validate website URL
  useEffect(() => {
    if (!debouncedWebsite) {
      setValidationStates(prev => ({
        ...prev,
        website: { isValid: null, isValidating: false, error: null },
      }));
      return;
    }

    const validate = async () => {
      setValidationStates(prev => ({
        ...prev,
        website: { ...prev.website, isValidating: true },
      }));
      const result = await validateWebsite(debouncedWebsite);
      setValidationStates(prev => ({ ...prev, website: result }));
    };

    validate();
  }, [debouncedWebsite, validateWebsite]);

  // Validate X handle
  useEffect(() => {
    if (!debouncedX) {
      setValidationStates(prev => ({
        ...prev,
        x: { isValid: null, isValidating: false, error: null },
      }));
      return;
    }

    const validate = async () => {
      setValidationStates(prev => ({
        ...prev,
        x: { ...prev.x, isValidating: true },
      }));
      const result = await validateXHandle(debouncedX);
      setValidationStates(prev => ({ ...prev, x: result }));
    };

    validate();
  }, [debouncedX, validateXHandle]);

  // Validate GitHub handle
  useEffect(() => {
    if (!debouncedGithub) {
      setValidationStates(prev => ({
        ...prev,
        github: { isValid: null, isValidating: false, error: null },
      }));
      return;
    }

    const validate = async () => {
      setValidationStates(prev => ({
        ...prev,
        github: { ...prev.github, isValidating: true },
      }));
      const result = await validateGithubHandle(debouncedGithub);
      setValidationStates(prev => ({ ...prev, github: result }));
    };

    validate();
  }, [debouncedGithub, validateGithubHandle]);

  const updateLink = (field: keyof OrganizationLinks, value: string) => {
    setLinks(prev => ({ ...prev, [field]: value }));
    setHasUserChanges(true);
  };

  const handleSave = async () => {
    if (!activeOrgId) {
      toast.error('No active organization selected');
      return;
    }

    // Block save while any field is still validating
    const isAnyValidating =
      validationStates.website.isValidating ||
      validationStates.x.isValidating ||
      validationStates.github.isValidating;
    if (isAnyValidating) {
      toast.error('Please wait for link validation to complete.');
      return;
    }

    // Check for validation errors
    if (links.website && validationStates.website.isValid === false) {
      toast.error(validationStates.website.error || 'Invalid website URL');
      return;
    }
    if (links.x && validationStates.x.isValid === false) {
      toast.error(validationStates.x.error || 'Invalid X handle');
      return;
    }
    if (links.github && validationStates.github.isValid === false) {
      toast.error(validationStates.github.error || 'Invalid GitHub handle');
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

      const updatedOrg = await updateOrganizationLinks(
        activeOrgId,
        linksToSend
      );

      let nextLinks = links;
      if (updatedOrg) {
        const fromMetadata = (
          updatedOrg as { metadata?: { links?: OrganizationLinks } }
        ).metadata?.links;
        const fromTopLevel = (updatedOrg as { links?: OrganizationLinks })
          .links;
        const resolved = fromMetadata || fromTopLevel;
        if (resolved) {
          nextLinks = {
            website: resolved.website ?? '',
            x: resolved.x ?? '',
            github: resolved.github ?? '',
            others: resolved.others ?? '',
          };
          setLinks(nextLinks);
        }
      }

      toast.success('Organization links updated successfully');
      setHasUserChanges(false);

      if (onSave) {
        onSave(nextLinks);
      }
    } catch (error) {
      // Try to extract the actual backend error message
      let errorMessage = 'Failed to save organization links. Please try again.';

      if (error instanceof Error) {
        const errorObj = error as any;

        // Check for Better Auth error structure
        if (errorObj.context?.body?.message) {
          errorMessage = errorObj.context.body.message;
        } else if (errorObj.response?.data?.message) {
          errorMessage = errorObj.response.data.message;
        } else if (errorObj.message) {
          if (
            errorObj.message.includes('401') ||
            errorObj.message.includes('Unauthorized')
          ) {
            errorMessage = 'Authentication failed. Please login again.';
          } else if (
            errorObj.message.includes('403') ||
            errorObj.message.includes('Forbidden') ||
            errorObj.message.includes('not allowed')
          ) {
            errorMessage =
              'You do not have permission to update this organization.';
          } else if (
            errorObj.message.includes('404') ||
            errorObj.message.includes('Not Found')
          ) {
            errorMessage = 'Organization not found.';
          } else if (
            errorObj.message.includes('Network') ||
            errorObj.message.includes('timeout')
          ) {
            errorMessage =
              'Network error. Please check your connection and try again.';
          } else if (
            errorObj.message.includes('Validation failed') ||
            errorObj.message.includes('valid URL')
          ) {
            errorMessage = 'Please enter valid URLs for all links.';
          } else {
            errorMessage = errorObj.message;
          }
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className='space-y-6'>
      <div className='space-y-2'>
        <Label className='text-sm font-normal text-white'>Website</Label>
        <div className='relative'>
          <Input
            value={links.website}
            onChange={e => updateLink('website', e.target.value)}
            placeholder='Enter link to organization website'
            className={cn(
              'bg-background rounded-[12px] border-gray-900 p-4! py-5! pr-10 text-white placeholder:text-gray-700 focus-visible:ring-0',
              validationStates.website.isValid === false && 'border-red-500',
              validationStates.website.isValid === true && 'border-green-500'
            )}
            disabled={isSaving}
          />
          {validationStates.website.isValidating && (
            <Loader2 className='absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 animate-spin text-gray-400' />
          )}
          {!validationStates.website.isValidating &&
            validationStates.website.isValid === true && (
              <CheckCircle2 className='absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 text-green-500' />
            )}
          {!validationStates.website.isValidating &&
            validationStates.website.isValid === false && (
              <XCircle className='absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 text-red-500' />
            )}
        </div>
        {validationStates.website.error && (
          <p className='text-xs text-red-500'>
            {validationStates.website.error}
          </p>
        )}
      </div>

      <div className='space-y-2'>
        <Label className='text-sm font-normal text-white'>X (Twitter)</Label>
        <div className='relative'>
          <span className='absolute top-1/2 left-4 z-10 -translate-y-1/2 font-normal text-white'>
            @
          </span>
          <Input
            value={links.x}
            onChange={e => updateLink('x', e.target.value)}
            placeholder='Organization X handle'
            className={cn(
              'bg-background rounded-[12px] border-gray-900 p-4! py-5! pr-10! pl-8! text-white placeholder:text-gray-700 focus-visible:ring-0',
              validationStates.x.isValid === false && 'border-red-500',
              validationStates.x.isValid === true && 'border-green-500'
            )}
            disabled={isSaving}
          />
          {validationStates.x.isValidating && (
            <Loader2 className='absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 animate-spin text-gray-400' />
          )}
          {!validationStates.x.isValidating &&
            validationStates.x.isValid === true && (
              <CheckCircle2 className='absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 text-green-500' />
            )}
          {!validationStates.x.isValidating &&
            validationStates.x.isValid === false && (
              <XCircle className='absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 text-red-500' />
            )}
        </div>
        {validationStates.x.error && (
          <p className='text-xs text-red-500'>{validationStates.x.error}</p>
        )}
      </div>

      <div className='space-y-2'>
        <Label className='text-sm font-normal text-white'>GitHub</Label>
        <div className='relative'>
          <Input
            value={links.github}
            onChange={e => updateLink('github', e.target.value)}
            placeholder='GitHub username or organization'
            className={cn(
              'bg-background rounded-[12px] border-gray-900 p-4! py-5! pr-10 text-white placeholder:text-gray-700 focus-visible:ring-0',
              validationStates.github.isValid === false && 'border-red-500',
              validationStates.github.isValid === true && 'border-green-500'
            )}
            disabled={isSaving}
          />
          {validationStates.github.isValidating && (
            <Loader2 className='absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 animate-spin text-gray-400' />
          )}
          {!validationStates.github.isValidating &&
            validationStates.github.isValid === true && (
              <CheckCircle2 className='absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 text-green-500' />
            )}
          {!validationStates.github.isValidating &&
            validationStates.github.isValid === false && (
              <XCircle className='absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 text-red-500' />
            )}
        </div>
        {validationStates.github.error && (
          <p className='text-xs text-red-500'>
            {validationStates.github.error}
          </p>
        )}
      </div>

      <div className='space-y-2'>
        <Label className='text-sm font-normal text-white'>
          Other Link (optional)
        </Label>
        <Input
          value={links.others}
          onChange={e => updateLink('others', e.target.value)}
          placeholder='Link URL (newsletters or social account)'
          className='bg-background rounded-[12px] border-gray-900 p-4! py-5! text-white placeholder:text-gray-700 focus-visible:ring-0'
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
