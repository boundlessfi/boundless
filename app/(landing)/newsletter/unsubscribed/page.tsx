import Link from 'next/link';
export default function NewsletterUnsubscribedPage() {
  return (
    <main className='flex min-h-screen flex-col items-center justify-center gap-4 text-white'>
      <h1 className='text-3xl font-semibold'>You&apos;ve been unsubscribed</h1>
      <p className='text-[#D9D9D9]'>
        You won&apos;t receive any more emails from us.
      </p>
      <Link href='/' className='text-[#A7F950] underline'>
        Back to home
      </Link>
    </main>
  );
}
