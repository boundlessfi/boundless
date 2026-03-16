'use client';
import React, { useRef, useState } from 'react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import Image from 'next/image';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Mail } from 'lucide-react';
import { BoundlessButton } from '../buttons';
import { Input } from '../ui/input';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  newsletterSubscribe,
  type NewsletterApiError,
  type NewsletterTag,
} from '@/lib/api/waitlist';
import { Button } from '../ui/button';

const formSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.email(),
});

const Newsletter = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<NewsletterTag[]>([]);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  });
  gsap.registerPlugin(useGSAP);
  const nameFieldRef = useRef<HTMLDivElement>(null);
  const emailFieldRef = useRef<HTMLDivElement>(null);

  const animateFieldFocus = (
    fieldRef: React.RefObject<HTMLDivElement | null>
  ) => {
    if (fieldRef.current) {
      gsap.to(fieldRef.current, {
        duration: 0.3,
        scale: 1.02,
        boxShadow: '0 0 0 1px rgb(167,249,80)',
        ease: 'power2.out',
      });
    }
  };

  const animateFieldBlur = (
    fieldRef: React.RefObject<HTMLDivElement | null>
  ) => {
    if (fieldRef.current) {
      gsap.to(fieldRef.current, {
        duration: 0.3,
        scale: 1,
        boxShadow: 'none',
        ease: 'power2.out',
      });
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await newsletterSubscribe({
        email: values.email,
        name: values.name,
        source: 'website',
        tags: selectedTags,
      });
      onOpenChange(false);
      window.location.href = '/newsletter/confirmed';
    } catch (err) {
      const e = err as NewsletterApiError;
      if (e.code === 'ALREADY_SUBSCRIBED')
        setError('This email is already subscribed.');
      else if (e.code === 'RATE_LIMITED')
        setError('Too many attempts. Please try again in a minute.');
      else if (e.code === 'INVALID_TAGS') setError('Invalid topic selection.');
      else setError('Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
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
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FormField
                      control={form.control}
                      name='name'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='sr-only'>Name</FormLabel>
                          <FormControl>
                            <div
                              ref={nameFieldRef}
                              className='relative flex h-12 items-center rounded-lg border border-[#2B2B2B] bg-[#101010] p-4 backdrop-blur-sm transition-all duration-300'
                              onFocus={() => animateFieldFocus(nameFieldRef)}
                              onBlur={() => animateFieldBlur(nameFieldRef)}
                            >
                              <User className='h-5 w-5 text-[#B5B5B5]' />
                              <Input
                                {...field}
                                placeholder='Enter your name'
                                className='focus-visible:ring-none absolute top-0 left-0 h-full border-none bg-transparent pl-10 text-white caret-[rgb(167,249,80)] placeholder:text-[#B5B5B5] focus-visible:ring-[0px]'
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='email'
                      render={({ field }) => (
                        <FormItem className='mt-3'>
                          <FormLabel className='sr-only'>Email</FormLabel>
                          <FormControl>
                            <div
                              ref={emailFieldRef}
                              className='relative flex h-12 items-center rounded-lg border border-[#2B2B2B] bg-[#101010] p-4 backdrop-blur-sm transition-all duration-300'
                              onFocus={() => animateFieldFocus(emailFieldRef)}
                              onBlur={() => animateFieldBlur(emailFieldRef)}
                            >
                              <Mail className='h-5 w-5 text-[#B5B5B5]' />
                              <Input
                                {...field}
                                placeholder='Enter your email'
                                className='focus-visible:ring-none caret-primary absolute top-0 left-0 h-full border-none bg-transparent pl-10 text-white placeholder:text-[#B5B5B5] focus-visible:ring-[0px]'
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className='mt-4 flex flex-wrap gap-3'>
                      {(
                        [
                          'bounties',
                          'hackathons',
                          'grants',
                          'updates',
                        ] as NewsletterTag[]
                      ).map(tag => (
                        <label
                          key={tag}
                          className='flex cursor-pointer items-center gap-1.5 text-sm text-[#D9D9D9]'
                        >
                          <input
                            type='checkbox'
                            className='accent-primary'
                            checked={selectedTags.includes(tag)}
                            onChange={() =>
                              setSelectedTags(p =>
                                p.includes(tag)
                                  ? p.filter(t => t !== tag)
                                  : [...p, tag]
                              )
                            }
                          />
                          {tag.charAt(0).toUpperCase() + tag.slice(1)}
                        </label>
                      ))}
                    </div>

                    <BoundlessButton
                      variant={form.formState.isValid ? 'default' : 'outline'}
                      type='submit'
                      fullWidth
                      size='xl'
                      disabled={!form.formState.isValid}
                      loading={isSubmitting}
                      className='mt-11 w-full disabled:border-[#2B2B2B] disabled:bg-[#212121] disabled:text-[#787878]'
                    >
                      Subscribe
                    </BoundlessButton>
                  </form>
                </Form>
              </div>
              {error && (
                <p className='mt-2 text-center text-sm text-red-500'>{error}</p>
              )}
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
