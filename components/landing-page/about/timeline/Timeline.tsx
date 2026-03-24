'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import TimelineLayout from './TimelineLayout';
import TimelineCard from './TimelineCard';
import ImageSlider from './ImageSlider';
import { aboutTimelineData } from '@/constants';
import TopRightSvg from './backgroundSvgs/TopRightSvg';
import MiddleLeftSvg from './backgroundSvgs/MiddleLeftSvg';
import MiddleRightSvg from './backgroundSvgs/MiddleRightSvg';
import BottomLeftSvg from './backgroundSvgs/BottomLeftSvg';

gsap.registerPlugin(ScrollTrigger);

interface TimelineProps {
  className?: string;
}

export default function Timeline({ className = '' }: TimelineProps) {
  const svgRefs = useRef<(SVGPathElement | null)[]>([]);
  const timelineRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [activeCard, setActiveCard] = useState(0);

  const animationConfig = useMemo(
    () => ({
      title: {
        from: { opacity: 0, y: 30 },
        to: { opacity: 1, y: 0, duration: 1, ease: 'power2.out' },
        scrollTrigger: {
          start: 'top 90%',
          toggleActions: 'play none none reverse',
        },
      },
      svg: {
        duration: 2,
        ease: 'power2.inOut',
        stagger: 0.3,
        repeat: -1,
        yoyo: true,
      },
      card: {
        duration: 0.8,
        ease: 'power2.out',
      },
    }),
    []
  );

  const setupTitleAnimation = useCallback(() => {
    if (!titleRef.current) return;

    gsap.set(titleRef.current, animationConfig.title.from);

    return gsap.to(titleRef.current, {
      ...animationConfig.title.to,
      scrollTrigger: {
        trigger: titleRef.current,
        ...animationConfig.title.scrollTrigger,
      },
    });
  }, [animationConfig]);

  const setupSvgAnimations = useCallback(() => {
    const animations: gsap.core.Tween[] = [];

    svgRefs.current.forEach((path, i) => {
      if (path) {
        const length = path.getTotalLength();

        gsap.set(path, {
          strokeDasharray: length,
          strokeDashoffset: length,
          opacity: 0,
        });

        const animation = gsap.to(path, {
          strokeDashoffset: 0,
          opacity: 1,
          duration: animationConfig.svg.duration,
          ease: animationConfig.svg.ease,
          delay: animationConfig.svg.stagger * i,
          repeat: animationConfig.svg.repeat,
          yoyo: animationConfig.svg.yoyo,
          willChange: 'stroke-dashoffset, opacity',
          force3D: true,
        });

        animations.push(animation);
      }
    });

    return animations;
  }, [animationConfig]);

  // Optimized card animation setup
  const setupCardAnimations = useCallback(() => {
    const triggers: ScrollTrigger[] = [];

    // Set initial state
    cardRefs.current.forEach((card, index) => {
      if (card) {
        gsap.set(card, {
          scale: index === 0 ? 1 : 0.9,
          opacity: index === 0 ? 1 : 0.6,
          y: index === 0 ? 0 : index > 0 ? 20 : -20,
          height: index === 0 ? 'auto' : '80px',
        });
      }
    });

    // Create scroll triggers for each card
    cardRefs.current.forEach((card, index) => {
      if (card) {
        const trigger = ScrollTrigger.create({
          trigger: card,
          start: 'top 60%',
          end: 'bottom 40%',
          onEnter: () => setActiveCard(index),
          onEnterBack: () => setActiveCard(index),
        });
        triggers.push(trigger);
      }
    });

    return triggers;
  }, []);

  useEffect(() => {
    const titleAnimation = setupTitleAnimation();
    const svgAnimations = setupSvgAnimations();
    const cardTriggers = setupCardAnimations();

    return () => {
      titleAnimation?.kill();
      svgAnimations.forEach(animation => animation.kill());
      cardTriggers.forEach(trigger => trigger.kill());
    };
  }, [setupTitleAnimation, setupSvgAnimations, setupCardAnimations]);

  // Optimized card state update function
  const updateCardStates = useCallback(
    (activeIndex: number) => {
      cardRefs.current.forEach((card, index) => {
        if (card) {
          const isActive = index === activeIndex;
          const isAbove = index < activeIndex;

          const animationProps = {
            duration: animationConfig.card.duration,
            ease: animationConfig.card.ease,
            willChange: 'transform, opacity, height',
            force3D: true,
          };

          if (isActive) {
            // Active card - fully expanded
            gsap.to(card, {
              scale: 1,
              opacity: 1,
              y: 0,
              height: 'auto',
              ...animationProps,
            });
          } else if (isAbove) {
            // Cards above active - collapsed at top
            gsap.to(card, {
              scale: 0.9,
              opacity: 0.6,
              y: -20,
              height: '80px',
              ...animationProps,
            });
          } else {
            // Cards below active - collapsed at bottom
            gsap.to(card, {
              scale: 0.9,
              opacity: 0.6,
              y: 20,
              height: '80px',
              ...animationProps,
            });
          }
        }
      });
    },
    [animationConfig]
  );

  useEffect(() => {
    updateCardStates(activeCard);
  }, [activeCard, updateCardStates]);

  return (
    <TimelineLayout className={className}>
      <section
        id='timeline'
        role='region'
        aria-labelledby='timeline-heading'
        className='w-full'
      >
        {/* Heading with Top Right SVG */}
        <header className='relative w-full'>
          <div className='relative z-10 flex flex-col gap-1 text-center'>
            <p
              className='bg-clip-text text-sm leading-[140%] font-medium tracking-[-0.64px] text-transparent'
              style={{
                backgroundImage:
                  'linear-gradient(273deg, rgba(46, 237, 170, 0.50) 13.84%, #2EEDAA 73.28%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Timeline
            </p>
            <h2
              ref={titleRef}
              id='timeline-heading'
              className='text-[48px] leading-[120%] font-normal tracking-[-2%] text-white'
            >
              Our Journey
            </h2>
          </div>

          {/* Top Right SVG */}
          <TopRightSvg svgRefs={svgRefs} />
        </header>

        {/* Mobile Timeline Cards */}
        <div
          ref={timelineRef}
          className='flex flex-col gap-8 px-4 md:hidden'
          role='list'
          aria-label='Timeline of our journey'
        >
          {aboutTimelineData.map((item, index) => {
            const { img, year, title, subTitle, backgroundImage } = item;
            return (
              <div
                key={`${year}-${index}`}
                ref={el => {
                  cardRefs.current[index] = el;
                }}
                className='w-full'
                role='listitem'
              >
                <TimelineCard
                  img={img}
                  year={year}
                  title={title}
                  subTitle={subTitle}
                  backgroundImage={backgroundImage}
                  isActive={index === activeCard}
                />
              </div>
            );
          })}
        </div>

        {/* Desktop Carousel with Middle SVGs */}
        <div className='relative w-full'>
          <div className='relative z-20 hidden md:block'>
            <ImageSlider />
          </div>

          {/* Left Middle SVG */}
          <MiddleLeftSvg svgRefs={svgRefs} />

          {/* Right Middle SVG */}
          <MiddleRightSvg svgRefs={svgRefs} />
        </div>

        {/* Bottom SVG */}
        <div className='relative flex w-full justify-center'>
          <BottomLeftSvg svgRefs={svgRefs} />
        </div>
      </section>
    </TimelineLayout>
  );
}
