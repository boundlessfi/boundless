'use client';

import React from 'react';
import { Plus, FileText, Rocket, Menu, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ProjectDraft } from '@/features/projects/hooks/use-project-creation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import Image from 'next/image';

interface CreationSidebarProps {
  recentDrafts: Partial<ProjectDraft>[];
  onDraftSelect?: (draft: Partial<ProjectDraft>) => void;
  onDeleteDraft?: (draftId: string) => void;
}

const SidebarContent = ({
  recentDrafts,
  onDeleteDraft,
}: {
  recentDrafts: Partial<ProjectDraft>[];
  onDeleteDraft?: (draftId: string) => void;
}) => (
  <nav className='flex h-full flex-col overflow-y-auto border-r border-white/5 bg-[#050505] px-4 py-8'>
    <Link
      href='/'
      className='group mb-10 block px-3 transition-all hover:translate-x-1'
    >
      <Image
        src='/logo.png'
        alt='Boundless'
        width={100}
        height={100}
        className='h-auto w-auto'
      />
    </Link>

    <div className='mb-8 space-y-1'>
      <h3 className='mb-6 px-3 text-[10px] font-black tracking-[0.2em] text-white/20 uppercase'>
        Continue Editing
      </h3>

      {recentDrafts.length === 0 ? (
        <div className='rounded-2xl border border-dashed border-white/5 bg-white/1 px-3 py-6'>
          <p className='text-center text-[10px] font-bold tracking-wider text-white/20 uppercase'>
            No recent drafts
          </p>
        </div>
      ) : (
        <div className='flex flex-col gap-2'>
          {recentDrafts.map((draft, idx) => (
            <div
              key={draft.id || idx}
              className='group relative flex items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all hover:bg-white/3'
            >
              <Link
                href={`/projects/create?id=${draft.id}`}
                className='flex flex-1 items-center gap-3 overflow-hidden outline-none'
              >
                <div className='group-hover:border-primary/20 group-hover:bg-primary/5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/5 bg-white/3 transition-all'>
                  <FileText className='group-hover:text-primary h-4 w-4 text-white/20 transition-colors' />
                </div>
                <div className='flex min-w-0 flex-1 flex-col'>
                  <span className='truncate text-sm font-bold text-white/60 transition-colors group-hover:text-white'>
                    {draft.title || 'Untitled Project'}
                  </span>
                  <span className='text-[10px] font-black tracking-wider text-white/20 uppercase'>
                    {draft.isCampaign ? 'Crowdfunding' : 'Standard'}
                  </span>
                </div>
              </Link>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className='z-10 rounded-lg p-2 text-white/20 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-500'>
                    <Trash2 className='h-3.5 w-3.5' />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent className='border-white/10 bg-[#0d0d0d]'>
                  <AlertDialogHeader>
                    <AlertDialogTitle className='text-white'>
                      Delete Draft?
                    </AlertDialogTitle>
                    <AlertDialogDescription className='text-white/40'>
                      This action cannot be undone. This will permanently delete
                      your{' '}
                      <strong className='text-white'>
                        {draft.title || 'Untitled Project'}
                      </strong>{' '}
                      draft.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className='border-white/10 bg-white/5 text-white hover:bg-white/10'>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className='bg-red-500 text-white hover:bg-red-600'
                      onClick={() => draft.id && onDeleteDraft?.(draft.id)}
                    >
                      Delete permanently
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <div className='absolute inset-0 rounded-2xl border border-transparent transition-all group-hover:border-white/5'></div>
            </div>
          ))}
        </div>
      )}
    </div>

    <div className='mt-auto mb-4 space-y-3 px-2'>
      <h3 className='mb-2 px-1 text-[10px] font-black tracking-[0.2em] text-white/20 uppercase'>
        Quick Actions
      </h3>

      <Link
        href='/projects/create'
        className='group hover:border-primary/30 relative block overflow-hidden rounded-2xl border border-white/5 bg-white/2 p-5 transition-all hover:bg-white/4'
      >
        <div className='relative flex items-center gap-4'>
          <div className='bg-primary/10 flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110'>
            <Plus className='text-primary h-5 w-5' />
          </div>
          <div className='flex flex-col'>
            <span className='text-sm font-bold text-white transition-colors'>
              New Project
            </span>
            <span className='mt-1 text-[10px] leading-none font-black tracking-widest text-white/20 uppercase'>
              Standard Flow
            </span>
          </div>
        </div>
      </Link>

      <Link
        href='/projects/create?mode=campaign'
        className='group hover:border-primary/30 relative block overflow-hidden rounded-2xl border border-white/5 bg-white/2 p-5 transition-all hover:bg-white/4'
      >
        <div className='relative flex items-center gap-4'>
          <div className='bg-primary/20 flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110'>
            <Rocket className='text-primary h-5 w-5' />
          </div>
          <div className='flex flex-col'>
            <span className='text-sm font-bold text-white transition-colors'>
              Start Campaign
            </span>
            <span className='mt-1 text-[10px] leading-none font-black tracking-widest text-white/20 uppercase'>
              Crowdfunding
            </span>
          </div>
        </div>
      </Link>
    </div>
  </nav>
);

export default function CreationSidebar({
  recentDrafts,
  onDeleteDraft,
}: CreationSidebarProps) {
  return (
    <>
      {/* Mobile Trigger */}
      <div className='fixed top-6 left-6 z-50 md:hidden'>
        <Sheet>
          <SheetTrigger asChild>
            <button className='flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl transition-all active:scale-95'>
              <Menu className='h-5 w-5 text-white' />
            </button>
          </SheetTrigger>
          <SheetContent
            side='left'
            className='w-[300px] border-r border-white/10 bg-black p-0'
          >
            <SidebarContent
              recentDrafts={recentDrafts}
              onDeleteDraft={onDeleteDraft}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className='sticky top-0 hidden h-screen w-80 shrink-0 border-r border-white/5 bg-[#050505] md:block'>
        <SidebarContent
          recentDrafts={recentDrafts}
          onDeleteDraft={onDeleteDraft}
        />
      </aside>
    </>
  );
}
