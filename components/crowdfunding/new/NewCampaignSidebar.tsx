'use client';

import { cn } from '@/lib/utils';
import { useWindowSize } from '@/hooks/use-window-size';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Plus, FileText, CheckCircle2, Circle, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { WIZARD_STEPS } from './constants';

interface NewCampaignSidebarProps {
  activeStep: number;
  completedSteps: Set<number>;
  campaignId?: string;
}

interface SidebarContentProps {
  activeStep: number;
  completedSteps: Set<number>;
}

function SidebarContent({ activeStep, completedSteps }: SidebarContentProps) {
  return (
    <nav className='flex h-full flex-col overflow-y-auto px-4 py-6'>
      <div className='mb-8'>
        <div className='mb-4 px-3'>
          <h2 className='text-lg font-semibold text-white'>New Campaign</h2>
          <p className='text-xs text-zinc-500'>
            Fill in each section to submit for review
          </p>
        </div>
      </div>

      <div className='mb-8 space-y-1'>
        <h3 className='mb-4 px-3 text-[11px] font-semibold tracking-wider text-zinc-500 uppercase'>
          Steps
        </h3>

        {WIZARD_STEPS.map((step, idx) => {
          const stepNumber = idx + 1;
          const isActive = activeStep === stepNumber;
          const isDone = completedSteps.has(stepNumber);
          const isLocked = stepNumber > activeStep && !isDone;

          return (
            <div
              key={step.key}
              className={cn(
                'group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all',
                isActive
                  ? 'from-primary/10 text-primary shadow-primary/5 bg-linear-to-r to-transparent shadow-lg'
                  : isDone
                    ? 'cursor-pointer text-zinc-300 hover:bg-zinc-900/50 hover:text-white'
                    : isLocked
                      ? 'cursor-not-allowed text-zinc-600'
                      : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-white'
              )}
            >
              {isActive && (
                <div className='bg-primary absolute top-1/2 left-0 h-8 w-1 -translate-y-1/2 rounded-r-full' />
              )}

              <div
                className={cn(
                  'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg transition-all',
                  isActive
                    ? 'bg-primary/20 shadow-primary/20 shadow-lg'
                    : isDone
                      ? 'bg-emerald-500/20'
                      : 'bg-zinc-900/50 group-hover:bg-zinc-800'
                )}
              >
                {isDone ? (
                  <CheckCircle2 className='h-4 w-4 text-emerald-400' />
                ) : isActive ? (
                  <step.icon className='text-primary h-4 w-4' />
                ) : (
                  <Circle
                    className={cn(
                      'h-4 w-4',
                      isLocked ? 'text-zinc-700' : 'text-zinc-500'
                    )}
                  />
                )}
              </div>

              <div className='flex flex-col'>
                <span className='text-sm font-medium'>{step.title}</span>
                <span
                  className={cn(
                    'text-xs transition-colors',
                    isActive
                      ? 'text-primary/60'
                      : isDone
                        ? 'text-emerald-500/60'
                        : 'text-zinc-600'
                  )}
                >
                  {isDone
                    ? 'Complete'
                    : isActive
                      ? 'In progress'
                      : step.description}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className='mt-auto space-y-3'>
        <h3 className='mb-4 px-3 text-[11px] font-semibold tracking-wider text-zinc-500 uppercase'>
          Quick Actions
        </h3>

        <Link
          href='/me/crowdfunding'
          className='group hover:border-primary/50 hover:shadow-primary/10 relative block overflow-hidden rounded-xl border border-zinc-800/50 bg-linear-to-br from-zinc-900/50 to-zinc-900/20 p-4 transition-all hover:shadow-lg'
        >
          <div className='relative flex items-center gap-3'>
            <div className='from-primary/20 to-primary/5 flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br transition-all group-hover:scale-110'>
              <FileText className='text-primary h-5 w-5' />
            </div>
            <span className='group-hover:text-primary font-medium text-white transition-colors'>
              My Campaigns
            </span>
          </div>
        </Link>
      </div>

      <div className='pointer-events-none absolute right-0 bottom-0 left-0 h-24 bg-linear-to-t from-black via-black/50 to-transparent' />
    </nav>
  );
}

export default function NewCampaignSidebar({
  activeStep,
  completedSteps,
}: NewCampaignSidebarProps) {
  const { height } = useWindowSize();
  const headerHeight = 64;
  const availableHeight = height ? height - headerHeight : 'calc(100vh - 4rem)';

  return (
    <>
      <div className='fixed top-20 left-4 z-50 md:hidden'>
        <Sheet>
          <SheetTrigger asChild>
            <button className='flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-black/60 shadow-lg backdrop-blur-xl'>
              <Menu className='h-5 w-5 text-white' />
            </button>
          </SheetTrigger>
          <SheetContent
            side='left'
            className='w-[280px] border-r border-zinc-800 bg-black p-0'
          >
            <SidebarContent
              activeStep={activeStep}
              completedSteps={completedSteps}
            />
          </SheetContent>
        </Sheet>
      </div>

      <aside
        className='fixed left-0 hidden w-[280px] border-r border-zinc-800/50 bg-black/40 backdrop-blur-xl md:block'
        style={{ height: availableHeight, top: '90px' }}
      >
        <SidebarContent
          activeStep={activeStep}
          completedSteps={completedSteps}
        />
      </aside>
    </>
  );
}
