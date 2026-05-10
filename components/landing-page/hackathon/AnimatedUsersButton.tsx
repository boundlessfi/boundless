'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { Users } from 'lucide-react';

// Register the hook to prevent React strict-mode double-firing issues
gsap.registerPlugin(useGSAP);

export default function AnimatedUsersButton() {
  const usersIconRef = useRef<SVGSVGElement>(null);

  // 1. Mount Animation: Slides the background user in when the page loads
  useGSAP(
    () => {
      if (!usersIconRef.current) return;

      // Selects elements inside this specific SVG
      const q = gsap.utils.selector(usersIconRef);

      // Target the elements making up the background person
      // (Lucide draws the foreground person first, so the last path/circle belong to the background)
      gsap.from(q('path:last-of-type, circle:last-of-type'), {
        x: 10,
        opacity: 0,
        duration: 0.6,
        ease: 'back.out(1.5)',
        delay: 0.1, // Slight delay so it feels natural after the page loads
      });
    },
    { scope: usersIconRef }
  );

  // 2. Hover Animation: Makes both users "bounce" sequentially
  const handleMouseEnter = () => {
    if (!usersIconRef.current) return;

    // Grab all the individual paths and circles inside the SVG
    const svgParts = usersIconRef.current.children;

    gsap.to(svgParts, {
      y: -3,
      duration: 0.2,
      stagger: 0.05,
      yoyo: true,
      repeat: 1,
      ease: 'power2.out',
      transformOrigin: 'bottom center',
    });
  };

  return (
    <button
      onMouseEnter={handleMouseEnter}
      className='group flex w-fit items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900 px-5 py-3 text-neutral-300 transition-colors hover:border-blue-500/50 hover:bg-neutral-800 hover:text-white'
    >
      <Users ref={usersIconRef} className='size-5 text-blue-400' />
      <span className='text-sm font-medium'>View Participants</span>
    </button>
  );
}
