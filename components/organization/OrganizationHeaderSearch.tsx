'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { searchOrganizations } from '@/lib/api/organization';
import type { Organization } from '@/lib/api/organization';
import { Building2, Plus, Loader2 } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

interface OrganizationHeaderSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrganizationHeaderSearch({
  open,
  onOpenChange,
}: OrganizationHeaderSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Organization[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedQuery = useDebounce(query.trim(), 300);

  const runSearch = useCallback(async (term: string) => {
    if (!term) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = (await searchOrganizations(term, {
        isProfileComplete: true,
      })) as { data?: Organization[] | { data?: Organization[] } };
      const inner = res?.data;
      const rawList = Array.isArray(inner)
        ? inner
        : inner && typeof inner === 'object' && Array.isArray(inner.data)
          ? inner.data
          : [];
      const list = rawList.map(
        (o: Organization & { logoUrl?: string; description?: string }) => ({
          ...o,
          logo: o.logo ?? o.logoUrl ?? '',
          tagline: o.tagline ?? o.description ?? '',
        })
      );
      setResults(list);
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    if (debouncedQuery) {
      runSearch(debouncedQuery);
    } else {
      setResults([]);
    }
  }, [open, debouncedQuery, runSearch]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenChange]);

  const handleSelect = useCallback(
    (id: string) => {
      onOpenChange(false);
      setQuery('');
      setResults([]);
      router.push(`/organizations/${id}`);
    },
    [onOpenChange, router]
  );

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title='Search'
      description='Search organizations by name. Press ⌘K to open.'
      className='max-w-xl border-zinc-800 bg-zinc-950'
    >
      <CommandInput
        placeholder='Search organizations...'
        value={query}
        onValueChange={setQuery}
        className='border-zinc-800 text-white'
      />
      <CommandList className='max-h-[min(70vh,400px)]'>
        <CommandEmpty>
          {isSearching ? (
            <div className='flex items-center justify-center gap-2 py-6 text-sm text-zinc-500'>
              <Loader2 className='h-4 w-4 animate-spin' />
              Searching...
            </div>
          ) : query.trim() ? (
            <p className='py-6 text-center text-sm text-zinc-500'>
              No organizations found for &quot;{query.trim()}&quot;
            </p>
          ) : (
            <p className='py-6 text-center text-sm text-zinc-500'>
              Type to search organizations
            </p>
          )}
        </CommandEmpty>

        {!query.trim() && (
          <CommandGroup heading='Quick actions'>
            <CommandItem
              onSelect={() => {
                onOpenChange(false);
                router.push('/organizations');
              }}
              className='flex items-center gap-3 rounded-lg'
            >
              <Building2 className='h-4 w-4 text-zinc-500' />
              <span>Go to Organizations</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                onOpenChange(false);
                router.push('/organizations/new');
              }}
              className='flex items-center gap-3 rounded-lg'
            >
              <Plus className='h-4 w-4 text-zinc-500' />
              <span>New Organization</span>
            </CommandItem>
          </CommandGroup>
        )}

        {results.length > 0 && (
          <CommandGroup heading='Organizations'>
            {results.slice(0, 8).map(org => (
              <CommandItem
                key={org.id}
                value={`${org.name} ${org.id}`}
                onSelect={() => handleSelect(org.id)}
                className='flex cursor-pointer items-center gap-3 rounded-lg'
              >
                {org.logo ? (
                  <img
                    src={org.logo}
                    alt=''
                    className='h-8 w-8 shrink-0 rounded-lg object-cover'
                  />
                ) : (
                  <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800'>
                    <Building2 className='h-4 w-4 text-zinc-500' />
                  </div>
                )}
                <div className='min-w-0 flex-1'>
                  <p className='truncate font-medium text-white'>{org.name}</p>
                  {org.tagline && (
                    <p className='truncate text-xs text-zinc-500'>
                      {org.tagline}
                    </p>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
