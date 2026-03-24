'use client';

import { useState, useEffect } from 'react';
import { Briefcase, Code, Heart, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getPlatformRoles, updatePlatformRoles } from '@/lib/api/onboarding';
import { Button } from '@/components/ui/button';

const ROLES = [
  {
    id: 'organizer',
    label: 'Organizer',
    description: 'Create bounties, hackathons, and campaigns',
    icon: Briefcase,
  },
  {
    id: 'participant',
    label: 'Participant',
    description: 'Contribute skills and earn rewards',
    icon: Code,
  },
  {
    id: 'backer',
    label: 'Backer',
    description: 'Fund projects and support builders',
    icon: Heart,
  },
] as const;

export default function RolesTab() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [initial, setInitial] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getPlatformRoles()
      .then(({ roles }) => {
        const set = new Set(roles);
        setSelected(set);
        setInitial(set);
      })
      .catch(() => {
        toast.error('Failed to load roles');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const toggle = (roleId: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(roleId)) {
        // Don't allow deselecting if it's the last role
        if (next.size <= 1) return prev;
        next.delete(roleId);
      } else {
        next.add(roleId);
      }
      return next;
    });
  };

  const hasChanges =
    selected.size !== initial.size || [...selected].some(r => !initial.has(r));

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { roles } = await updatePlatformRoles(Array.from(selected));
      const set = new Set(roles);
      setSelected(set);
      setInitial(set);
      toast.success('Roles updated');
    } catch {
      toast.error('Failed to update roles');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center p-12'>
        <Loader2 className='text-primary mr-2 h-6 w-6 animate-spin' />
        <span className='text-zinc-500'>Loading roles...</span>
      </div>
    );
  }

  return (
    <div className='mt-6 space-y-6'>
      <div>
        <h3 className='text-lg font-medium text-white'>Platform Roles</h3>
        <p className='mt-1 text-sm text-zinc-500'>
          Choose how you use Boundless. You can be all three at once.
        </p>
      </div>

      <div className='flex flex-col gap-3'>
        {ROLES.map(role => {
          const isSelected = selected.has(role.id);
          const Icon = role.icon;

          return (
            <button
              key={role.id}
              type='button'
              onClick={() => toggle(role.id)}
              className={`group relative flex items-center gap-4 rounded-xl border p-5 text-left transition-all duration-200 ${
                isSelected
                  ? 'border-primary/40 bg-primary/5 shadow-[0_0_20px_rgba(46,237,170,0.06)]'
                  : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700 hover:bg-zinc-800/80'
              }`}
            >
              <div
                className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl transition-colors ${
                  isSelected ? 'bg-primary/15' : 'bg-zinc-800'
                }`}
              >
                <Icon
                  className={`h-6 w-6 transition-colors ${
                    isSelected ? 'text-primary' : 'text-zinc-400'
                  }`}
                />
              </div>

              <div className='flex-1'>
                <p
                  className={`text-sm font-medium ${
                    isSelected ? 'text-white' : 'text-zinc-300'
                  }`}
                >
                  {role.label}
                </p>
                <p className='mt-0.5 text-xs text-zinc-500'>
                  {role.description}
                </p>
              </div>

              <div
                className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border transition-all ${
                  isSelected
                    ? 'border-primary bg-primary'
                    : 'border-zinc-600 bg-transparent'
                }`}
              >
                {isSelected && (
                  <Check className='h-3.5 w-3.5 text-black' strokeWidth={3} />
                )}
              </div>
            </button>
          );
        })}
      </div>

      <p className='text-xs text-zinc-600'>
        At least one role must be selected.
      </p>

      <Button
        onClick={handleSave}
        disabled={!hasChanges || isSaving}
        className='bg-primary hover:bg-primary/90 text-black'
      >
        {isSaving && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
        Save Changes
      </Button>
    </div>
  );
}
