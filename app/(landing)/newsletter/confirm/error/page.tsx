'use client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

const msgs: Record<string, string> = {
  expired: 'This confirmation link has expired.',
  invalid: 'This confirmation link is invalid or already used.',
};

function Content() {
  const p = useSearchParams();
  return (
    <main className='flex min-h-screen flex-col items-center justify-center gap-4 text-white'>
      <h1 className='text-3xl font-semibold'>Confirmation failed</h1>
      <p className='text-[#D9D9D9]'>
        {msgs[p.get('reason') ?? ''] ?? 'An unexpected error occurred.'}
      </p>
      <Link href='/' className='text-[#A7F950] underline'>
        Back to home
      </Link>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Content />
    </Suspense>
  );
}
