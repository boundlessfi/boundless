'use client';
import Link from 'next/link';
import { ChevronDown, Menu, XIcon } from 'lucide-react';
import Image from 'next/image';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { BoundlessButton } from '../buttons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetTrigger, SheetContent, SheetClose } from '../ui/sheet';

gsap.registerPlugin(useGSAP, SplitText);

const menuItems = [
  { href: '/projects', label: 'Projects' },
  { href: '/hackathons', label: 'Hackathons' },
  { href: '/grants', label: 'Grants' },
];

const learnMenuItems = [
  { href: '/about', label: 'About' },
  { href: '/code-of-conduct', label: 'Code of Conduct' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms of Service' },
  { href: '/disclaimer', label: 'Disclaimer' },
];

export function Navbar() {
  const navbarRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

      tl.fromTo(
        navbarRef.current,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 }
      )
        .fromTo(
          logoRef.current,
          { scale: 0.8, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.4 },
          '-=0.3'
        )
        .fromTo(
          menuRef.current?.children || [],
          { y: -15, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, stagger: 0.1 },
          '-=0.2'
        )
        .fromTo(
          ctaRef.current,
          { y: -15, opacity: 0, scale: 0.95 },
          { y: 0, opacity: 1, scale: 1, duration: 0.4 },
          '-=0.1'
        );

      gsap.to(logoRef.current, {
        y: -2,
        duration: 2,
        ease: 'power2.inOut',
        yoyo: true,
        repeat: -1,
      });

      const logoHover = gsap.to(logoRef.current, {
        scale: 1.05,
        duration: 0.2,
        ease: 'power2.out',
        paused: true,
      });

      const logoEnterHandler = () => logoHover.play();
      const logoLeaveHandler = () => logoHover.reverse();

      logoRef.current?.addEventListener('mouseenter', logoEnterHandler);
      logoRef.current?.addEventListener('mouseleave', logoLeaveHandler);

      const menuItems = menuRef.current?.querySelectorAll('a');
      const menuItemAnimations: Array<{
        item: Element;
        hoverTl: gsap.core.Timeline;
        enterHandler: () => void;
        leaveHandler: () => void;
        split: SplitText;
      }> = [];

      menuItems?.forEach(item => {
        const split = SplitText.create(item, {
          type: 'chars',
          charsClass: 'nav-char',
        });

        const hoverTl = gsap.timeline({ paused: true });
        hoverTl.to(item, { y: -2, duration: 0.2, ease: 'power2.out' });

        hoverTl.to(
          split.chars,
          {
            y: -3,
            duration: 0.3,
            stagger: 0.02,
            ease: 'power2.out',
          },
          '-=0.1'
        );

        const enterHandler = () => hoverTl.play();
        const leaveHandler = () => hoverTl.reverse();

        item.addEventListener('mouseenter', enterHandler);
        item.addEventListener('mouseleave', leaveHandler);

        menuItemAnimations.push({
          item,
          hoverTl,
          enterHandler,
          leaveHandler,
          split,
        });
      });

      const ctaHover = gsap.to(ctaRef.current, {
        scale: 1.02,
        duration: 0.2,
        ease: 'power2.out',
        paused: true,
      });

      const ctaEnterHandler = () => ctaHover.play();
      const ctaLeaveHandler = () => ctaHover.reverse();

      ctaRef.current?.addEventListener('mouseenter', ctaEnterHandler);
      ctaRef.current?.addEventListener('mouseleave', ctaLeaveHandler);

      const scrollTl = gsap.timeline({ paused: true });
      scrollTl.to(navbarRef.current, {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
        duration: 0.3,
        ease: 'power2.out',
      });

      const handleScroll = () => {
        if (window.scrollY > 50) {
          scrollTl.play();
        } else {
          scrollTl.reverse();
        }
      };

      window.addEventListener('scroll', handleScroll);

      return () => {
        logoHover.kill();
        ctaHover.kill();
        scrollTl.kill();

        logoRef.current?.removeEventListener('mouseenter', logoEnterHandler);
        logoRef.current?.removeEventListener('mouseleave', logoLeaveHandler);

        menuItemAnimations.forEach(
          ({ item, hoverTl, enterHandler, leaveHandler, split }) => {
            hoverTl.kill();
            split.revert();
            item.removeEventListener('mouseenter', enterHandler);
            item.removeEventListener('mouseleave', leaveHandler);
          }
        );

        ctaRef.current?.removeEventListener('mouseenter', ctaEnterHandler);
        ctaRef.current?.removeEventListener('mouseleave', ctaLeaveHandler);

        window.removeEventListener('scroll', handleScroll);
      };
    },
    { scope: navbarRef }
  );

  return (
    <nav ref={navbarRef} className='sticky top-0 left-0 z-50 w-full'>
      <div className='border-[rgba(46, 237, 170,0.24)] mx-auto max-w-[92vw] rounded-[12px] border-[0.5px] p-4 md:max-w-[820px]'>
        <div className='flex items-center justify-between gap-10'>
          <div className='flex-shrink-0'>
            <Link ref={logoRef} href='/' className='flex items-center'>
              <Image src='/auth/logo.svg' alt='logo' width={116} height={22} />
            </Link>
          </div>

          <div ref={menuRef} className='hidden md:block'>
            <div className='ml-10 flex items-baseline space-x-4'>
              {menuItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className='rounded-md px-3 py-2 text-sm font-medium text-white transition-colors hover:text-white/80'
                >
                  {item.label}
                </Link>
              ))}

              <DropdownMenu>
                <DropdownMenuTrigger
                  asChild
                  className='flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-white transition-colors hover:text-white/80'
                >
                  <BoundlessButton variant='outline'>
                    Learn
                    <ChevronDown className='h-4 w-4' />
                  </BoundlessButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent className='bg-background border-primary !border-[0.1px]'>
                  {learnMenuItems.map((item, index) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link
                        href={item.href}
                        className='cursor-pointer text-white hover:bg-gray-800 hover:text-white/80'
                        style={{
                          animationDelay: `${index * 50}ms`,
                          animation:
                            'dropdownItemSlideIn 0.3s ease-out forwards',
                        }}
                      >
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div ref={ctaRef} className='hidden md:block'>
            <BoundlessButton>
              <Link href='/auth/signin'>Get Started</Link>
            </BoundlessButton>
          </div>
          <MobileMenu />
        </div>
      </div>
    </nav>
  );
}

function MobileMenu() {
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);
  const mobileLogoRef = useRef<HTMLAnchorElement>(null);
  const mobileMenuItemsRef = useRef<HTMLDivElement>(null);
  const mobileCTARef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        mobileButtonRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, delay: 0.8 }
      );

      const buttonHover = gsap.to(mobileButtonRef.current, {
        scale: 1.05,
        duration: 0.2,
        ease: 'power2.out',
        paused: true,
      });

      const buttonEnterHandler = () => buttonHover.play();
      const buttonLeaveHandler = () => buttonHover.reverse();

      mobileButtonRef.current?.addEventListener(
        'mouseenter',
        buttonEnterHandler
      );
      mobileButtonRef.current?.addEventListener(
        'mouseleave',
        buttonLeaveHandler
      );

      return () => {
        buttonHover.kill();
        mobileButtonRef.current?.removeEventListener(
          'mouseenter',
          buttonEnterHandler
        );
        mobileButtonRef.current?.removeEventListener(
          'mouseleave',
          buttonLeaveHandler
        );
      };
    },
    { scope: mobileMenuRef }
  );

  const animateMobileMenuOpen = () => {
    gsap.fromTo(
      mobileLogoRef.current,
      { x: -20, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }
    );

    const menuItems = mobileMenuItemsRef.current?.querySelectorAll('a');
    if (menuItems) {
      menuItems.forEach((item, index) => {
        const split = SplitText.create(item, {
          type: 'chars, words',
          charsClass: 'char',
          wordsClass: 'word',
        });

        gsap.fromTo(
          split.words,
          {
            y: 20,
            opacity: 0,
            rotationX: -90,
            transformOrigin: '50% 50% -20px',
          },
          {
            y: 0,
            opacity: 1,
            rotationX: 0,
            duration: 0.6,
            stagger: 0.03,
            delay: 0.2 + index * 0.1,
            ease: 'back.out(1.7)',
          }
        );
      });
    }

    gsap.fromTo(
      mobileCTARef.current,
      { y: 30, opacity: 0, scale: 0.9 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.5,
        delay: 0.8,
        ease: 'back.out(1.7)',
      }
    );
  };

  const animateMobileMenuClose = () => {
    gsap.to(
      [mobileLogoRef.current, mobileMenuItemsRef.current, mobileCTARef.current],
      {
        opacity: 0,
        y: -20,
        duration: 0.3,
        ease: 'power2.in',
      }
    );
  };

  return (
    <div ref={mobileMenuRef} className='md:hidden'>
      <Sheet
        onOpenChange={open => {
          if (open) {
            setTimeout(animateMobileMenuOpen, 100);
          } else {
            animateMobileMenuClose();
          }
        }}
      >
        <SheetTrigger asChild>
          <BoundlessButton
            ref={mobileButtonRef}
            variant='outline'
            className='md:hidden'
          >
            <Menu />
          </BoundlessButton>
        </SheetTrigger>
        <SheetContent
          showCloseButton={false}
          side='top'
          className='px-9 pt-8 pb-16'
        >
          <div className='flex items-center justify-between'>
            <div className='flex-shrink-0'>
              <Link ref={mobileLogoRef} href='/' className='flex items-center'>
                <Image
                  src='/auth/logo.svg'
                  alt='logo'
                  width={116}
                  height={22}
                />
              </Link>
            </div>
            <SheetClose>
              <BoundlessButton variant='outline'>
                <XIcon className='h-5 w-5' />
              </BoundlessButton>
            </SheetClose>
          </div>
          <div ref={mobileMenuItemsRef} className='flex flex-col gap-4'>
            {menuItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className='rounded-md px-3 py-2 text-sm font-medium text-white transition-colors hover:text-white/80'
              >
                {item.label}
              </Link>
            ))}
            <Link
              key='how-it-works'
              href='/how-it-works'
              className='rounded-md px-3 py-2 text-sm font-medium text-white transition-colors hover:text-white/80'
            >
              How it works
            </Link>
            <Link
              key='about-us'
              href='/about-us'
              className='rounded-md px-3 py-2 text-sm font-medium text-white transition-colors hover:text-white/80'
            >
              About us
            </Link>
            <Link
              key='blog'
              href='/blog'
              className='rounded-md px-3 py-2 text-sm font-medium text-white transition-colors hover:text-white/80'
            >
              Blog
            </Link>
          </div>
          <div ref={mobileCTARef}>
            <BoundlessButton size='xl' className='w-full' fullWidth>
              <Link href='/auth/signin'>Get Started</Link>
            </BoundlessButton>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
