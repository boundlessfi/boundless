'use client';

import React, { useRef, useState } from 'react';
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

const formSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.email(),
});

interface NewsletterFormProps {
  onSuccess?: () => void;
  source?: string;
}

const NewsletterForm = ({
  onSuccess,
  source = 'website',
}: NewsletterFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<NewsletterTag[]>([]);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', email: '' },
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
        source,
        tags: selectedTags,
      });
      onSuccess?.();
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
    <>
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
              ['bounties', 'hackathons', 'grants', 'updates'] as NewsletterTag[]
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
                      p.includes(tag) ? p.filter(t => t !== tag) : [...p, tag]
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
      {error && (
        <p className='mt-2 text-center text-sm text-red-500'>{error}</p>
      )}
    </>
  );
};

export default NewsletterForm;
