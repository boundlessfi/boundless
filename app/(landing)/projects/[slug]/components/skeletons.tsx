'use client';

import { Skeleton } from '@/components/ui/skeleton';

/* ─────────────────────────── Hero ─────────────────────────── */

export function HeroSectionSkeleton() {
  return (
    <section className='grid grid-cols-1 gap-6 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_440px] xl:gap-8'>
      {/* Banner */}
      <div className='border-stepper-border bg-background-card aspect-16/10 w-full overflow-hidden rounded-2xl border lg:aspect-auto lg:h-full'>
        <Skeleton className='bg-inactive/60 h-full w-full rounded-none' />
      </div>

      {/* Details card */}
      <div className='border-stepper-border bg-background-card flex h-full w-full flex-col gap-4 rounded-2xl border p-4 sm:p-5'>
        {/* Logo + title + status */}
        <div className='flex items-start gap-4'>
          <Skeleton className='bg-inactive/60 h-16 w-16 rounded-2xl sm:h-20 sm:w-20' />
          <div className='flex flex-1 flex-col gap-2 pt-1'>
            <Skeleton className='bg-inactive/60 h-5 w-2/3' />
            <Skeleton className='bg-inactive/60 h-5 w-20 rounded-full' />
          </div>
        </div>

        {/* Tagline box */}
        <div className='border-stepper-border bg-inactive/40 space-y-2 rounded-xl border p-4'>
          <Skeleton className='bg-inactive h-3 w-full' />
          <Skeleton className='bg-inactive h-3 w-4/5' />
        </div>

        {/* Funding box */}
        <div className='border-stepper-border bg-inactive/40 space-y-3 rounded-xl border p-4'>
          <div className='flex items-center justify-between'>
            <Skeleton className='bg-inactive h-4 w-28' />
            <Skeleton className='bg-inactive h-3 w-10' />
          </div>
          <Skeleton className='bg-inactive h-2 w-full rounded-full' />
          <Skeleton className='bg-inactive h-3 w-24' />
        </div>

        {/* Primary button */}
        <Skeleton className='bg-inactive/60 h-11 w-full rounded-md' />

        {/* Secondary buttons */}
        <div className='grid grid-cols-2 gap-3'>
          <Skeleton className='bg-inactive/60 h-10 rounded-md' />
          <Skeleton className='bg-inactive/60 h-10 rounded-md' />
        </div>

        <div className='border-stepper-border border-t' />

        {/* Owner row */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <Skeleton className='bg-inactive/60 h-10 w-10 rounded-full' />
            <div className='space-y-1.5'>
              <Skeleton className='bg-inactive h-3 w-24' />
              <Skeleton className='bg-inactive h-2.5 w-16' />
            </div>
          </div>
          <div className='flex gap-2'>
            <Skeleton className='bg-inactive/60 h-9 w-9 rounded-full' />
            <Skeleton className='bg-inactive/60 h-9 w-9 rounded-full' />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── Project tabs ─────────────────────── */

export function ProjectTabsSkeleton() {
  return (
    <div className='border-stepper-border w-full border-b'>
      <div className='flex items-center gap-8 sm:gap-10'>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton
            key={i}
            className='bg-inactive/60 mb-3 h-4 w-16 rounded-md'
          />
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────── Team tab ───────────────────────── */

export function TeamTabSkeleton() {
  return (
    <section className='space-y-8'>
      {/* Header */}
      <header className='space-y-2'>
        <Skeleton className='bg-inactive/60 h-7 w-40' />
        <Skeleton className='bg-inactive/60 h-3 w-2/3 max-w-xl' />
        <Skeleton className='bg-inactive/60 h-3 w-1/2 max-w-md' />
      </header>

      {/* Cards grid */}
      <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className='border-stepper-border bg-background-card flex flex-col items-center gap-4 rounded-2xl border p-6 text-center'
          >
            <Skeleton className='bg-inactive/60 h-24 w-24 rounded-full' />
            <div className='w-full space-y-2'>
              <Skeleton className='bg-inactive mx-auto h-4 w-2/3' />
              <Skeleton className='bg-inactive mx-auto h-3 w-1/2' />
            </div>
            <div className='flex gap-2 pt-1'>
              <Skeleton className='bg-inactive/60 h-9 w-9 rounded-lg' />
              <Skeleton className='bg-inactive/60 h-9 w-9 rounded-lg' />
            </div>
          </div>
        ))}
      </div>

      {/* Open positions banner */}
      <div className='border-stepper-border bg-background-card flex items-center justify-between gap-4 rounded-2xl border p-6'>
        <div className='flex flex-1 items-start gap-4'>
          <Skeleton className='bg-inactive/60 h-11 w-11 rounded-xl' />
          <div className='flex-1 space-y-2'>
            <Skeleton className='bg-inactive h-4 w-32' />
            <Skeleton className='bg-inactive h-3 w-full max-w-2xl' />
          </div>
        </div>
        <Skeleton className='bg-inactive/60 h-4 w-32' />
      </div>
    </section>
  );
}

/* ────────────────────── Milestones tab ────────────────────── */

export function MilestonesTabSkeleton() {
  return (
    <section className='space-y-8'>
      <header className='flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
        <Skeleton className='bg-inactive/60 h-7 w-48' />
        <Skeleton className='bg-inactive/60 h-9 w-36 rounded-md' />
      </header>

      <ol className='relative space-y-10 pl-12 sm:pl-14'>
        <span
          aria-hidden
          className='bg-stepper-border absolute top-3 bottom-3 left-[15px] w-px sm:left-[19px]'
        />
        {Array.from({ length: 4 }).map((_, i) => (
          <li key={i} className='relative space-y-2'>
            <Skeleton className='border-stepper-border bg-inactive/60 absolute top-1 -left-12 h-8 w-8 rounded-full border-2 sm:-left-14 sm:h-10 sm:w-10' />
            <div className='flex items-center gap-3'>
              <Skeleton className='bg-inactive/60 h-5 w-48' />
              <Skeleton className='bg-inactive h-4 w-20 rounded-md' />
            </div>
            <Skeleton className='bg-inactive h-3 w-full max-w-2xl' />
            <Skeleton className='bg-inactive h-3 w-2/3 max-w-lg' />
            <Skeleton className='bg-inactive mt-2 h-2.5 w-24' />
          </li>
        ))}
      </ol>

      {/* Follow progress */}
      <div className='border-stepper-border bg-background-card flex items-center justify-between gap-5 rounded-2xl border p-6'>
        <div className='flex flex-1 items-center gap-4'>
          <Skeleton className='bg-inactive/60 h-12 w-12 rounded-full' />
          <div className='flex-1 space-y-2'>
            <Skeleton className='bg-inactive h-4 w-32' />
            <Skeleton className='bg-inactive h-3 w-2/3' />
          </div>
        </div>
        <div className='flex gap-3'>
          <Skeleton className='bg-inactive/60 h-10 w-28 rounded-md' />
          <Skeleton className='bg-inactive/60 h-10 w-32 rounded-md' />
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────── Voters tab ──────────────────────── */

export function VotersTabSkeleton() {
  return (
    <section className='space-y-6'>
      <header className='flex items-center justify-between gap-4'>
        <Skeleton className='bg-inactive/60 h-7 w-24' />
        <Skeleton className='bg-inactive/60 h-9 w-32 rounded-md' />
      </header>

      <ul className='flex flex-col'>
        {Array.from({ length: 5 }).map((_, i) => (
          <li
            key={i}
            className='border-stepper-border/60 grid grid-cols-[auto_1fr_auto_auto] items-center gap-x-6 border-b py-5 last:border-b-0'
          >
            <Skeleton className='bg-inactive/60 h-11 w-11 rounded-full' />
            <div className='space-y-2'>
              <Skeleton className='bg-inactive h-4 w-32' />
              <Skeleton className='bg-inactive h-3 w-24' />
            </div>
            <div className='flex flex-col items-end gap-1.5'>
              <Skeleton className='bg-inactive h-2.5 w-20' />
              <Skeleton className='bg-inactive h-3 w-16' />
            </div>
            <div className='flex flex-col items-end gap-1.5'>
              <Skeleton className='bg-inactive/60 h-6 w-20 rounded-full' />
              <Skeleton className='bg-inactive h-2.5 w-16' />
            </div>
          </li>
        ))}
      </ul>

      <div className='flex justify-center pt-2'>
        <Skeleton className='bg-inactive/60 h-11 w-44 rounded-md' />
      </div>
    </section>
  );
}

/* ─────────────────────── Backers tab ──────────────────────── */

export function BackersTabSkeleton() {
  return (
    <section className='space-y-8'>
      <header className='flex items-start justify-between gap-4'>
        <div className='space-y-2'>
          <Skeleton className='bg-inactive/60 h-7 w-40' />
          <Skeleton className='bg-inactive/60 h-3 w-48' />
        </div>
        <div className='flex gap-2'>
          <Skeleton className='bg-inactive/60 h-9 w-20 rounded-md' />
          <Skeleton className='bg-inactive/60 hidden h-9 w-20 rounded-md sm:block' />
        </div>
      </header>

      {/* Cards grid */}
      <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className='border-stepper-border bg-background-card space-y-4 rounded-2xl border p-5'
          >
            <div className='flex items-center gap-3'>
              <Skeleton className='bg-inactive/60 h-12 w-12 rounded-full' />
              <div className='flex-1 space-y-2'>
                <Skeleton className='bg-inactive h-4 w-2/3' />
                <Skeleton className='bg-inactive h-2.5 w-1/2' />
              </div>
            </div>
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <Skeleton className='bg-inactive h-3 w-20' />
                <Skeleton className='bg-inactive h-3 w-16' />
              </div>
              <div className='flex items-center justify-between'>
                <Skeleton className='bg-inactive h-3 w-12' />
                <Skeleton className='bg-inactive h-3 w-16' />
              </div>
            </div>
            <div className='border-stepper-border/60 space-y-2 border-t pt-3'>
              <Skeleton className='bg-inactive h-2.5 w-full' />
              <Skeleton className='bg-inactive h-2.5 w-2/3' />
            </div>
          </div>
        ))}
      </div>

      {/* Recent contributions */}
      <section className='space-y-3'>
        <Skeleton className='bg-inactive/60 h-3 w-40' />
        <div className='border-stepper-border bg-background-card divide-stepper-border/60 divide-y rounded-2xl border'>
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className='flex items-center justify-between gap-4 px-5 py-4'
            >
              <div className='flex flex-1 items-center gap-3'>
                <Skeleton className='bg-inactive/60 h-9 w-9 rounded-full' />
                <div className='space-y-1.5'>
                  <Skeleton className='bg-inactive h-3 w-28' />
                  <Skeleton className='bg-inactive h-2.5 w-16' />
                </div>
              </div>
              <div className='space-y-1.5 text-right'>
                <Skeleton className='bg-inactive h-3 w-20' />
                <Skeleton className='bg-inactive h-2.5 w-14' />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Join CTA */}
      <div className='border-stepper-border bg-background-card space-y-4 rounded-2xl border p-8 text-center'>
        <div className='flex justify-center'>
          <Skeleton className='bg-inactive/60 h-10 w-32 rounded-full' />
        </div>
        <Skeleton className='bg-inactive/60 mx-auto h-5 w-2/3 max-w-md' />
        <Skeleton className='bg-inactive mx-auto h-3 w-1/2 max-w-sm' />
        <div className='flex justify-center gap-3 pt-2'>
          <Skeleton className='bg-inactive/60 h-11 w-36 rounded-md' />
          <Skeleton className='bg-inactive/60 h-11 w-36 rounded-md' />
        </div>
      </div>
    </section>
  );
}

/* ────────────────────── Comments tab ──────────────────────── */

export function CommentsTabSkeleton() {
  return (
    <section className='space-y-8'>
      <header className='flex items-center justify-between gap-4'>
        <Skeleton className='bg-inactive/60 h-7 w-56' />
        <Skeleton className='bg-inactive/60 h-9 w-36 rounded-md' />
      </header>

      {/* Composer */}
      <div className='border-stepper-border bg-background-card overflow-hidden rounded-2xl border'>
        <div className='flex items-start gap-3 p-5'>
          <Skeleton className='bg-inactive/60 h-10 w-10 rounded-full' />
          <div className='flex-1 space-y-2 pt-1'>
            <Skeleton className='bg-inactive h-3 w-1/3' />
          </div>
        </div>
        <div className='border-stepper-border/60 flex items-center justify-between border-t px-4 py-3'>
          <div className='flex gap-1'>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className='bg-inactive/60 h-8 w-8 rounded-md' />
            ))}
          </div>
          <Skeleton className='bg-inactive/60 h-9 w-32 rounded-md' />
        </div>
      </div>

      {/* Comments */}
      <ul className='space-y-8'>
        {Array.from({ length: 3 }).map((_, i) => (
          <li key={i} className='flex gap-4'>
            <Skeleton className='bg-inactive/60 h-11 w-11 shrink-0 rounded-full' />
            <div className='flex-1 space-y-2'>
              <div className='flex items-center gap-2'>
                <Skeleton className='bg-inactive h-4 w-28' />
                <Skeleton className='bg-inactive h-3 w-16' />
                <Skeleton className='bg-inactive/60 h-4 w-14 rounded-md' />
              </div>
              <Skeleton className='bg-inactive h-3 w-full' />
              <Skeleton className='bg-inactive h-3 w-5/6' />
              <div className='flex gap-5 pt-1'>
                <Skeleton className='bg-inactive h-3 w-14' />
                <Skeleton className='bg-inactive h-3 w-12' />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ──────────────────────── Details tab ─────────────────────── */

export function DetailsTabSkeleton() {
  return (
    <div className='grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr] lg:gap-10 xl:grid-cols-[240px_1fr]'>
      {/* Outline */}
      <aside className='lg:sticky lg:top-24 lg:h-fit'>
        <div className='border-stepper-border bg-background-card space-y-3 rounded-2xl border p-5'>
          <Skeleton className='bg-inactive h-3 w-16' />
          <div className='space-y-3 pt-1'>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className='flex items-center gap-2'>
                <Skeleton className='bg-inactive h-1.5 w-1.5 rounded-full' />
                <Skeleton className='bg-inactive h-3 w-28' />
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Right column */}
      <div className='min-w-0 space-y-8'>
        {/* Section 1 — heading + paragraph */}
        <section className='space-y-3'>
          <Skeleton className='bg-inactive/60 h-6 w-48' />
          <div className='space-y-2'>
            <Skeleton className='bg-inactive/60 h-3 w-full' />
            <Skeleton className='bg-inactive/60 h-3 w-full' />
            <Skeleton className='bg-inactive/60 h-3 w-3/4' />
          </div>
        </section>

        {/* Section 2 — heading + paragraph */}
        <section className='space-y-3'>
          <Skeleton className='bg-inactive/60 h-6 w-32' />
          <div className='space-y-2'>
            <Skeleton className='bg-inactive/60 h-3 w-full' />
            <Skeleton className='bg-inactive/60 h-3 w-full' />
            <Skeleton className='bg-inactive/60 h-3 w-5/6' />
            <Skeleton className='bg-inactive/60 h-3 w-2/3' />
          </div>
        </section>

        {/* Section 3 — feature cards grid */}
        <section className='space-y-4'>
          <Skeleton className='bg-inactive/60 h-6 w-40' />
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className='border-stepper-border bg-background-card space-y-3 rounded-2xl border p-5'
              >
                <Skeleton className='bg-inactive h-7 w-7 rounded-md' />
                <Skeleton className='bg-inactive h-4 w-3/4' />
                <div className='space-y-1.5 pt-1'>
                  <Skeleton className='bg-inactive h-2.5 w-full' />
                  <Skeleton className='bg-inactive h-2.5 w-full' />
                  <Skeleton className='bg-inactive h-2.5 w-2/3' />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4 — timeline */}
        <section className='space-y-4'>
          <Skeleton className='bg-inactive/60 h-6 w-28' />
          <ol className='relative space-y-6 pl-12'>
            <span
              aria-hidden
              className='bg-stepper-border absolute top-3 bottom-3 left-[15px] w-px'
            />
            {Array.from({ length: 3 }).map((_, i) => (
              <li key={i} className='relative'>
                <Skeleton className='border-stepper-border absolute top-1 -left-12 h-8 w-8 rounded-full border-2' />
                <div className='border-stepper-border bg-background-card space-y-2 rounded-2xl border p-4'>
                  <Skeleton className='bg-inactive h-3 w-1/3' />
                  <Skeleton className='bg-inactive h-2.5 w-full' />
                  <Skeleton className='bg-inactive h-2.5 w-2/3' />
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Support CTA */}
        <div className='border-stepper-border bg-background-card flex items-center justify-between gap-5 rounded-2xl border p-6'>
          <div className='flex-1 space-y-2'>
            <Skeleton className='bg-inactive h-4 w-1/3' />
            <Skeleton className='bg-inactive h-3 w-2/3' />
          </div>
          <Skeleton className='bg-inactive/60 h-10 w-32 rounded-md' />
        </div>
      </div>
    </div>
  );
}
