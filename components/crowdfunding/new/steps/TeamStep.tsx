'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, UserPlus, Send } from 'lucide-react';
import type {
  CampaignWizardData,
  WizardTeamMember,
} from '../NewCampaignWizard';

interface Props {
  data: CampaignWizardData;
  onChange: (patch: Partial<CampaignWizardData>) => void;
}

const EMPTY_MEMBER: WizardTeamMember = { name: '', role: '', email: '' };

export default function TeamStep({ data, onChange }: Props) {
  const members = data.teamMembers;

  const update = (idx: number, patch: Partial<WizardTeamMember>) => {
    onChange({
      teamMembers: members.map((m, i) => (i === idx ? { ...m, ...patch } : m)),
    });
  };

  const add = () =>
    onChange({ teamMembers: [...members, { ...EMPTY_MEMBER }] });

  const remove = (idx: number) =>
    onChange({ teamMembers: members.filter((_, i) => i !== idx) });

  return (
    <div className='space-y-8'>
      {/* Team (optional) */}
      <div className='space-y-4'>
        <div className='flex items-start justify-between gap-4'>
          <div>
            <p className='text-sm font-medium text-zinc-300'>
              Team <span className='font-normal text-zinc-600'>(optional)</span>
            </p>
            <p className='text-xs text-zinc-500'>
              Building solo? Skip this. If others are working with you, list
              them and they will show on your campaign page.
            </p>
          </div>
        </div>

        {members.length === 0 ? (
          <button
            type='button'
            onClick={add}
            className='group hover:border-primary/50 flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 py-8 text-center transition hover:bg-zinc-900/40'
          >
            <div className='group-hover:bg-primary/15 group-hover:text-primary flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-zinc-500 transition'>
              <UserPlus className='h-5 w-5' />
            </div>
            <span className='text-sm font-medium text-zinc-300'>
              Add a team member
            </span>
            <span className='text-xs text-zinc-600'>
              Or continue solo, you can add people later
            </span>
          </button>
        ) : (
          <>
            <div className='space-y-3'>
              {members.map((m, idx) => (
                <div
                  key={idx}
                  className='rounded-xl border border-zinc-800/60 bg-zinc-950/40 p-4'
                >
                  <div className='mb-3 flex items-center justify-between'>
                    <span className='text-xs font-semibold tracking-wider text-zinc-500 uppercase'>
                      Member {idx + 1}
                    </span>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      onClick={() => remove(idx)}
                      className='h-7 w-7 text-zinc-600 hover:text-red-400'
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                  <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                    <div className='space-y-1.5'>
                      <Label className='text-xs font-medium text-zinc-400'>
                        Name <span className='text-red-400'>*</span>
                      </Label>
                      <Input
                        placeholder='Full name'
                        value={m.name}
                        onChange={e => update(idx, { name: e.target.value })}
                        className='border-zinc-800 bg-zinc-900 text-white placeholder:text-zinc-600'
                      />
                    </div>
                    <div className='space-y-1.5'>
                      <Label className='text-xs font-medium text-zinc-400'>
                        Role
                      </Label>
                      <Input
                        placeholder='e.g. Lead Developer'
                        value={m.role}
                        onChange={e => update(idx, { role: e.target.value })}
                        className='border-zinc-800 bg-zinc-900 text-white placeholder:text-zinc-600'
                      />
                    </div>
                    <div className='space-y-1.5 sm:col-span-2'>
                      <Label className='text-xs font-medium text-zinc-400'>
                        Email{' '}
                        <span className='font-normal text-zinc-600'>
                          (optional)
                        </span>
                      </Label>
                      <Input
                        type='email'
                        placeholder='name@example.com'
                        value={m.email || ''}
                        onChange={e => update(idx, { email: e.target.value })}
                        className='border-zinc-800 bg-zinc-900 text-white placeholder:text-zinc-600'
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button
              type='button'
              variant='outline'
              onClick={add}
              className='gap-2 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white'
            >
              <Plus className='h-4 w-4' />
              Add team member
            </Button>
          </>
        )}
      </div>

      {/* Contact (required) */}
      <div className='space-y-4 border-t border-zinc-800/50 pt-6'>
        <div>
          <p className='text-sm font-medium text-zinc-300'>Contact</p>
          <p className='text-xs text-zinc-500'>
            How the Boundless team reaches you about your campaign.
          </p>
        </div>

        <div className='space-y-1.5'>
          <Label
            htmlFor='contactPrimary'
            className='flex items-center gap-1.5 text-xs font-medium text-zinc-400'
          >
            <Send className='h-3 w-3 text-zinc-500' />
            Telegram handle <span className='text-red-400'>*</span>
          </Label>
          <Input
            id='contactPrimary'
            placeholder='@yourhandle'
            value={data.contactPrimary}
            onChange={e => onChange({ contactPrimary: e.target.value })}
            className='border-zinc-800 bg-zinc-950 text-white placeholder:text-zinc-600'
          />
        </div>

        <div className='space-y-1.5'>
          <Label
            htmlFor='contactBackup'
            className='text-xs font-medium text-zinc-400'
          >
            Backup contact{' '}
            <span className='font-normal text-zinc-600'>
              (Discord or WhatsApp, optional)
            </span>
          </Label>
          <Input
            id='contactBackup'
            placeholder='Discord tag or phone number'
            value={data.contactBackup}
            onChange={e => onChange({ contactBackup: e.target.value })}
            className='border-zinc-800 bg-zinc-950 text-white placeholder:text-zinc-600'
          />
        </div>
      </div>
    </div>
  );
}
