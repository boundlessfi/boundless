'use client';
import React from 'react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import Image from 'next/image';
import { Button } from '../ui/button';
import NewsletterForm from './NewsletterForm';

const Newsletter = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className='border-none bg-transparent p-0 shadow-none'
      >
        <div
          className='rounded-[12px] p-[1px]'
          style={{
            background:
              'radial-gradient(circle at center, rgba(255, 255, 255, 0.0) 34%, rgba(255, 255, 255, 0.2) 90%)',
          }}
        >
          <div className='bg-background rounded-[12px] p-10'>
            <DialogHeader>
              <DialogTitle className='flex gap-6'>
                <div className='h-[80px] w-[80px] md:h-[90px] md:w-[90px]'>
                  <Image
                    src={'/mail.png'}
                    alt='newsletter'
                    width={89}
                    unoptimized={true}
                    quality={100}
                    loading='eager'
                    height={89}
                    className='h-full w-full object-cover'
                  />
                </div>
                <div className='flex-1 text-left'>
                  <h2 className='leading-[120%] font-medium tracking-[-0.48px] text-white md:text-2xl'>
                    Join Our Newsletter
                  </h2>
                  <p className='text-sm leading-[160%] font-normal text-[#D9D9D9] md:text-base'>
                    Stay Boundless! Never miss updates on grants, hackathons,
                    and projects.
                  </p>
                </div>
              </DialogTitle>
              <div className='mt-10'>
                <NewsletterForm onSuccess={() => onOpenChange(false)} />
              </div>
              <DialogClose asChild>
                <Button variant='link' className='text-white underline'>
                  Maybe Later
                </Button>
              </DialogClose>
            </DialogHeader>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Newsletter;
