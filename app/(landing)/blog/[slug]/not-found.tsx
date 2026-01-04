import Link from 'next/link';
import { ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BlogNotFound() {
  return (
    <div className='bg-background-main-bg flex min-h-[80vh] items-center justify-center'>
      <div className='mx-auto max-w-md px-6 text-center'>
        <div className='mb-8'>
          <h1 className='mb-4 text-6xl font-bold text-white'>404</h1>
          <h2 className='mb-4 text-2xl font-semibold text-white'>
            Blog Post Not Found
          </h2>
          <p className='mb-8 text-[#B5B5B5]'>
            The blog post you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className='flex flex-col gap-4 sm:flex-row sm:justify-center'>
          <Button
            asChild
            variant='outline'
            className='border-[#2B2B2B] text-white hover:bg-[#2B2B2B]'
          >
            <Link href='/blog'>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Blog
            </Link>
          </Button>

          <Button
            asChild
            className='bg-[#A7F950] text-black hover:bg-[#A7F950]/90'
          >
            <Link href='/'>
              <Home className='mr-2 h-4 w-4' />
              Go Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
