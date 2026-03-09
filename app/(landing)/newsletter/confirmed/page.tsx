import Link from 'next/link';
export default function NewsletterConfirmedPage() {
  return (
    <main className='flex min-h-screen flex-col items-center justify-center gap-4 text-white'>
      <h1 className='text-3xl font-semibold'>You&apos;re subscribed! 🎉</h1>
      <p className='text-[#D9D9D9]'>
        Your subscription has been confirmed. Welcome aboard!
      </p>
      <Link href='/' className='text-[#A7F950] underline'>
        Back to home
      </Link>
    </main>
  );
}
