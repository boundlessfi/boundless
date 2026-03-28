'use client';

import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { SplitText } from 'gsap/SplitText';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { BoundlessButton } from '@/components/buttons/BoundlessButton';
import { ArrowRight, Mail, User } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { addToWaitlist } from '@/lib/api/waitlist';

const formSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export default function WaitlistForm() {
  gsap.registerPlugin(useGSAP, SplitText);
  const container = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const [titleAnimation, setTitleAnimation] =
    useState<gsap.core.Timeline | null>(null);
  const [titleSplit, setTitleSplit] = useState<SplitText | null>(null);
  const [subtitleAnimation, setSubtitleAnimation] =
    useState<gsap.core.Timeline | null>(null);
  const [subtitleSplit, setSubtitleSplit] = useState<SplitText | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tl = gsap.timeline();

  const formRef = useRef<HTMLDivElement>(null);
  const nameFieldRef = useRef<HTMLDivElement>(null);
  const emailFieldRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (titleRef.current) {
        const split = SplitText.create(titleRef.current, {
          type: 'chars,words,lines',
          charsClass: 'title-char',
          wordsClass: 'title-word',
          linesClass: 'title-line',
        });

        split.chars.forEach((char: Element) => {
          (char as HTMLElement).style.background =
            'linear-gradient(180deg, #69726D 0%, #FFF 100%)';
          (char as HTMLElement).style.webkitBackgroundClip = 'text';
          (char as HTMLElement).style.backgroundClip = 'text';
          (char as HTMLElement).style.webkitTextFillColor = 'transparent';
          (char as HTMLElement).style.color = 'transparent';
        });

        setTitleSplit(split);

        const animation = tl
          .set(split.chars, {
            opacity: 0,
            y: 'random(-100, 100)',
            x: 'random(-200, 200)',
            rotation: 'random(-180, 180)',
            scale: 0,
            transformOrigin: '50% 50%',
          })
          .to(split.chars, {
            opacity: 1,
            y: 0,
            x: 0,
            rotation: 0,
            scale: 1,
            duration: 1.2,
            ease: 'back.out(1.7)',
            stagger: {
              amount: 0.8,
              from: 'random',
            },
          })
          .to(
            split.words,
            {
              scale: 1.1,
              duration: 0.4,
              ease: 'power2.out',
              stagger: 0.1,
            },
            '-=0.3'
          )
          .to(
            split.words,
            {
              scale: 1,
              duration: 0.3,
              ease: 'bounce.out',
            },
            '-=0.2'
          )
          .to(
            split.lines,
            {
              rotationX: 15,
              rotationY: 5,
              duration: 0.6,
              ease: 'power2.out',
              stagger: 0.2,
            },
            '-=0.1'
          )
          .to(
            split.lines,
            {
              rotationX: 0,
              rotationY: 0,
              duration: 0.4,
              ease: 'power2.out',
            },
            '-=0.2'
          )
          .to(
            split.words,
            {
              scale: 1.02,
              duration: 3,
              ease: 'power2.inOut',
              yoyo: true,
              repeat: -1,
              stagger: 0.2,
            },
            '-=0.1'
          );

        setTitleAnimation(animation);

        const titleElement = titleRef.current;
        if (titleElement) {
          titleElement.addEventListener('mousemove', e => {
            const rect = titleElement.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            gsap.to(titleElement, {
              x: x * 0.1,
              y: y * 0.1,
              duration: 0.3,
              ease: 'power2.out',
            });
          });

          titleElement.addEventListener('mouseleave', () => {
            gsap.to(titleElement, {
              x: 0,
              y: 0,
              duration: 0.5,
              ease: 'elastic.out(1, 0.5)',
            });
          });
        }
      }

      if (subtitleRef.current) {
        const split = SplitText.create(subtitleRef.current, {
          type: 'words',
          charsClass: 'subtitle-char',
          wordsClass: 'subtitle-word',
        });

        setSubtitleSplit(split);

        split.words.forEach((word: Element) => {
          (word as HTMLElement).style.background =
            'linear-gradient(273deg, rgba(46, 237, 170, 0.50) 13.84%, #3AE6B2 73.28%)';
          (word as HTMLElement).style.webkitBackgroundClip = 'text';
          (word as HTMLElement).style.backgroundClip = 'text';
          (word as HTMLElement).style.webkitTextFillColor = 'transparent';
          (word as HTMLElement).style.color = 'transparent';
        });

        const animation = gsap
          .timeline()
          .from(split.words, {
            opacity: 0,
            y: 100,
            rotationX: -90,
            transformOrigin: '50% 50% -50px',
            scale: 0.5,
          })
          .to(split.words, {
            opacity: 1,
            y: 0,
            rotationX: 0,
            scale: 1,
            duration: 0.8,
            ease: 'back.out(1.7)',
            stagger: 0.15,
            delay: 1.2,
          })
          .to(
            split.words,
            {
              y: -5,
              duration: 2,
              ease: 'power2.inOut',
              stagger: 0.1,
              yoyo: true,
              repeat: -1,
            },
            '-=0.5'
          )
          .to(
            split.chars,
            {
              filter:
                'brightness(1.1) drop-shadow(0 0 10px rgba(46, 237, 170, 0.3))',
              duration: 1,
              ease: 'power2.inOut',
              stagger: 0.02,
            },
            '-=1.5'
          );

        setSubtitleAnimation(animation);

        const subtitleElement = subtitleRef.current;
        if (subtitleElement) {
          subtitleElement.addEventListener('mousemove', e => {
            const rect = subtitleElement.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            gsap.to(subtitleElement, {
              x: x * 0.15,
              y: y * 0.15,
              duration: 0.3,
              ease: 'power2.out',
            });
          });

          subtitleElement.addEventListener('mouseleave', () => {
            gsap.to(subtitleElement, {
              x: 0,
              y: 0,
              duration: 0.5,
              ease: 'elastic.out(1, 0.5)',
            });
          });
        }
      }

      if (formRef.current) {
        gsap.fromTo(
          formRef.current,
          { opacity: 0, y: 50, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            delay: 2.5,
            ease: 'back.out(1.7)',
          }
        );
      }
    },
    { scope: container }
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      name: '',
    },
  });

  const animateFieldFocus = (
    fieldRef: React.RefObject<HTMLDivElement | null>
  ) => {
    if (fieldRef.current) {
      gsap.to(fieldRef.current, {
        duration: 0.3,
        scale: 1.02,
        boxShadow: '0 0 0 1px rgb(46,237,170)',
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

  const animateFormSubmission = () => {
    setIsSubmitting(true);

    const tl = gsap.timeline();

    if (buttonRef.current) {
      tl.to(buttonRef.current, {
        duration: 0.3,
        scale: 0.95,
        ease: 'power2.in',
      });
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);

      if (formRef.current && successRef.current) {
        const tl = gsap.timeline();
        tl.to(formRef.current, {
          duration: 0.5,
          opacity: 0,
          y: -30,
          scale: 0.95,
          ease: 'power2.in',
        }).to(
          successRef.current,
          {
            duration: 0.6,
            opacity: 1,
            y: 0,
            scale: 1,
            ease: 'back.out(1.7)',
          },
          '-=0.3'
        );
      }
    }, 2000);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setError(null);
    setIsSubmitting(true);

    try {
      const nameParts = values.name
        .trim()
        .split(' ')
        .filter(part => part.length > 0);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      await addToWaitlist({
        email: values.email,
        firstName,
        lastName,
      });

      animateFormSubmission();
    } catch {
      setError('Failed to submit form. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleTitleClick = () => {
    if (titleAnimation && titleSplit) {
      titleAnimation.revert();

      const newAnimation = gsap
        .timeline()
        .to(titleSplit.chars, {
          x: 'random(-300, 300)',
          y: 'random(-200, 200)',
          rotation: 'random(-360, 360)',
          scale: 0,
          opacity: 0,
          duration: 0.5,
          ease: 'power2.in',
        })
        .to(titleSplit.chars, {
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          opacity: 1,
          duration: 1,
          ease: 'elastic.out(1, 0.5)',
          stagger: {
            amount: 0.8,
            from: 'random',
          },
        })
        .to(
          titleSplit.words,
          {
            y: -10,
            duration: 0.3,
            ease: 'power2.out',
            stagger: 0.1,
            yoyo: true,
            repeat: 1,
          },
          '-=0.5'
        );

      setTitleAnimation(newAnimation);
    }
  };

  const handleSubtitleClick = () => {
    if (subtitleAnimation && subtitleSplit) {
      subtitleAnimation.revert();

      const newAnimation = gsap
        .timeline()
        .to(subtitleSplit.words, {
          scale: 0,
          rotationY: 180,
          opacity: 0,
          duration: 0.4,
          ease: 'power2.in',
          stagger: 0.05,
        })
        .to(subtitleSplit.words, {
          scale: 1,
          rotationY: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'back.out(1.7)',
          stagger: 0.1,
        })
        .to(
          subtitleSplit.chars,
          {
            y: -15,
            duration: 0.2,
            ease: 'power2.out',
            stagger: 0.02,
            yoyo: true,
            repeat: 1,
          },
          '-=0.3'
        );

      setSubtitleAnimation(newAnimation);
    }
  };

  return (
    <div
      ref={container}
      className='mx-auto mt-[65px] flex max-w-[446px] flex-col items-center justify-start gap-16 bg-center px-4'
    >
      <div className={cn('w-full text-center', isSubmitted && 'hidden')}>
        <h1
          ref={titleRef}
          onClick={handleTitleClick}
          className='cursor-pointer text-[40px] leading-[140%] transition-opacity hover:opacity-80 md:text-[48px]'
          style={{
            background: 'linear-gradient(180deg, #69726D 0%, #FFF 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: 'transparent',
          }}
        >
          Get Early Access to
        </h1>

        <p
          ref={subtitleRef}
          onClick={handleSubtitleClick}
          className='cursor-pointer text-[40px] leading-[140%] transition-opacity hover:opacity-80 md:text-[48px]'
          style={{
            background:
              'linear-gradient(273deg, rgba(46, 237, 170, 0.50) 13.84%, #3AE6B2 73.28%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: 'transparent',
          }}
        >
          Boundless
        </p>
      </div>
      {!isSubmitted ? (
        <div className='w-full' ref={formRef}>
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
                        className='bg-background relative flex h-12 items-center rounded-lg border border-[#2B2B2B] p-4 backdrop-blur-sm transition-all duration-300'
                        onFocus={() => animateFieldFocus(nameFieldRef)}
                        onBlur={() => animateFieldBlur(nameFieldRef)}
                      >
                        <User className='h-5 w-5 text-[#B5B5B5]' />
                        <Input
                          {...field}
                          placeholder='Enter your name'
                          className='focus-visible:ring-none absolute top-0 left-0 h-full border-none bg-transparent pl-10 text-white caret-[rgb(46,237,170)] placeholder:text-[#B5B5B5] focus-visible:ring-[0px]'
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
                        className='bg-background relative flex h-12 items-center rounded-lg border border-[#2B2B2B] p-4 backdrop-blur-sm transition-all duration-300'
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
              <BoundlessButton
                ref={buttonRef}
                variant={form.formState.isValid ? 'default' : 'outline'}
                disabled={isSubmitting || !form.formState.isValid}
                type='submit'
                fullWidth
                className='mt-8 w-full'
              >
                {isSubmitting ? 'Submitting...' : 'Join the waitlist'}{' '}
                <ArrowRight />
              </BoundlessButton>

              {error && (
                <p className='mt-2 text-center text-sm text-red-500'>{error}</p>
              )}
            </form>
          </Form>
        </div>
      ) : (
        <div ref={successRef} className='w-full text-center opacity-0'>
          <div className='flex flex-col items-center justify-center p-8'>
            <svg
              width='100'
              height='100'
              viewBox='0 0 100 100'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <rect width='100' height='100' rx='50' fill='#04802E' />
              <path
                d='M31.25 50L43.75 62.5L68.75 37.5'
                stroke='#E7F6EC'
                strokeWidth='7.5'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>

            <h3 className='mt-[33px] mb-3 text-[35px] leading-[120%] font-medium tracking-[-0.64px] text-white'>
              You have been added to the waitlist
            </h3>
            <p className='text-[#B5B5B5]'>
              We&apos;ll let you know when Boundless is ready
            </p>
          </div>
        </div>
      )}
      <div className='w-full text-center'>
        <p className='text-[#D9D9D9]'>
          By joining, you agree to receive updates from Boundless. Learn more in
          our{' '}
          <Link className='text-primary' href='/privacy'>
            Privacy policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
