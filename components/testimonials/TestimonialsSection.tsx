'use client';

import { Testimonial } from '@/components/testimonials/data/testimonial';
import { useRef, useEffect, useState } from 'react';
import { Linkedin } from 'lucide-react';
import { BoundlessButton } from '../buttons';
import { gsap } from 'gsap';
import TestimonialCard from './TestimonialCard';
import Image from 'next/image';
import Newsletter from '../overview/Newsletter';

type TestimonialsWallProps = {
  testimonials: Testimonial[];
};

export default function TestimonialsSection({
  testimonials,
}: TestimonialsWallProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const columnRefs = useRef<HTMLDivElement[]>([]);
  const animations = useRef<gsap.core.Tween[]>([]);
  const [numColumns, setNumColumns] = useState<number>(4);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    animations.current.forEach(anim => anim.kill());
    animations.current = [];

    columnRefs.current.forEach((column, index) => {
      if (!column) return;

      const wrapper = column;

      Array.from(wrapper.querySelectorAll<HTMLElement>('.is-clone')).forEach(
        cloneEl => cloneEl.remove()
      );

      const children = Array.from(wrapper.children).filter(
        el => !(el as HTMLElement).classList.contains('is-clone')
      ) as HTMLElement[];
      const totalHeight = children.reduce(
        (acc, child) => acc + child.offsetHeight + 32,
        0
      );

      const cloneContainer = document.createElement('div');
      cloneContainer.className = 'is-clone';
      children.forEach(child => {
        cloneContainer.appendChild(child.cloneNode(true));
      });
      wrapper.appendChild(cloneContainer);

      const isEvenColumn = index % 2 === 0;
      const initialY = isEvenColumn ? 0 : -totalHeight;
      gsap.set(wrapper, {
        y: initialY,
        force3D: true,
        willChange: 'transform',
      });

      const anim = gsap.to(wrapper, {
        y: isEvenColumn ? -totalHeight : 0,
        duration: 60,
        ease: 'none',
        repeat: -1,
        force3D: true,
        transformOrigin: 'center center',
        immediateRender: false,
        lazy: false,
        delay: index * 0.5,
      });

      animations.current.push(anim);
    });

    const container = scrollContainerRef.current;
    if (!container) return;

    // const handleMouseEnter = () =>
    //   animations.current.forEach(anim => anim.pause());
    // const handleMouseLeave = () =>
    //   animations.current.forEach(anim => anim.resume());

    // container.addEventListener('mouseenter', handleMouseEnter);
    // container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      // container.removeEventListener('mouseenter', handleMouseEnter);
      // container.removeEventListener('mouseleave', handleMouseLeave);
      animations.current.forEach(anim => anim.kill());
    };
  }, [testimonials, numColumns]);

  useEffect(() => {
    const computeColumns = () => {
      const container = scrollContainerRef.current;
      if (!container) return;
      const containerWidth = container.getBoundingClientRect().width;
      const columnWidth = 300;
      const gap = 32;
      const columns = Math.max(
        2,
        Math.ceil(containerWidth / (columnWidth + gap)) + 1
      );
      setNumColumns(columns);
    };

    computeColumns();

    let resizeTimer: number | undefined;
    const handleResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        computeColumns();
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section
      className='relative overflow-hidden bg-[#030303] py-20 text-white'
      aria-labelledby='testimonials-heading'
    >
      <div className='w-full'>
        <h2 id='testimonials-heading' className='sr-only'>
          What our users say
        </h2>

        <div className='relative max-h-[470px] overflow-hidden shadow-2xl backdrop-blur-sm md:max-h-[600px]'>
          <div className='absolute inset-0 bg-[#95FFD2] opacity-95'></div>

          <Image
            src='/fade.png'
            alt='Gradient top'
            width={1000}
            height={100}
            className='pointer-events-none absolute top-[-10px] left-0 z-20 h-[150px] w-full'
          />
          <Image
            src='/fade.png'
            alt='Gradient bottom'
            width={1000}
            height={100}
            className='pointer-events-none absolute bottom-[-10px] left-0 z-20 h-[150px] w-full rotate-180 transform'
          />
          <div
            className='pointer-events-none absolute top-[-10px] left-0 z-10 h-[150px] w-full'
            style={{
              background:
                'linear-gradient(180deg, #030303 0%, rgba(3, 3, 3, 0.00) 100%)',
            }}
          />
          <div
            className='pointer-events-none absolute bottom-0 left-0 z-10 h-[150px] w-full'
            style={{
              background:
                'linear-gradient(0deg, #030303 0%, rgba(3, 3, 3, 0.00) 100%)',
            }}
          />

          <div
            className='relative z-[10] -mx-6 overflow-x-auto'
            ref={el => {
              if (el) el.scrollLeft = 100;
            }}
          >
            <div
              ref={scrollContainerRef}
              className='flex space-x-8 px-6'
              style={{
                willChange: 'transform',
                backfaceVisibility: 'hidden',
                perspective: '1000px',
              }}
            >
              {Array.from({ length: numColumns }, (_, colIdx) => colIdx).map(
                colIdx => (
                  <div
                    key={colIdx}
                    ref={el => {
                      if (el) columnRefs.current[colIdx] = el;
                    }}
                    className='scroll-wrapper flex w-[300px] flex-shrink-0 flex-col space-y-8'
                  >
                    {testimonials
                      .filter((_, i) => i % numColumns === colIdx)
                      .map(t => (
                        <TestimonialCard
                          key={t.id}
                          avatarSrc={t.avatarUrl || '/avatar-placeholder.png'}
                          avatarFallback={t.name.charAt(0)}
                          name={t.name}
                          username={t.username || 'username'}
                          content={t.message}
                          icon={
                            <Linkedin
                              size={16}
                              className={
                                colIdx % 2 === 0
                                  ? 'text-[#95FFD2]'
                                  : 'text-primary'
                              }
                            />
                          }
                        />
                      ))}
                  </div>
                )
              )}
            </div>
          </div>

          <div className='bg-primary absolute bottom-14 left-1/2 z-40 mt-20 w-full max-w-[90vw] -translate-x-1/2 rounded-xl p-8 text-black shadow-lg md:max-h-[212px] md:p-12 lg:bottom-[60px] lg:mt-0'>
            <div className='flex flex-col items-center gap-6 md:flex-row md:justify-between'>
              <div>
                <h2 className='mb-2 text-center text-3xl leading-[100%] font-medium tracking-[-1.92px] md:text-left lg:text-5xl'>
                  Shape the Future <br /> With Us
                </h2>
              </div>
              <div className='flex flex-col gap-4'>
                <p className='max-w-md text-center text-base font-normal text-[#2B2B2B] md:text-left'>
                  We're building a future where ideas are truly boundless,
                  unlocking opportunities for innovators. Be part of it!
                </p>
                <div className='flex flex-col gap-2 md:flex-row'>
                  <BoundlessButton
                    variant='secondary'
                    className='bg-background hover:text-background'
                    size='xl'
                    fullWidth
                    aria-label='Explore projects'
                  >
                    Explore Projects
                  </BoundlessButton>
                  <BoundlessButton
                    variant='ghost'
                    size='xl'
                    fullWidth
                    className='border border-black bg-transparent'
                    aria-label='Subscribe for updates'
                    onClick={() => setOpen(true)}
                  >
                    Subscribe for Updates
                  </BoundlessButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Newsletter open={open} onOpenChange={setOpen} />
    </section>
  );
}
