'use client';
import Link from 'next/link';
import {
  Menu,
  XIcon,
  Plus,
  ChevronDown,
  Building2,
  ArrowUpRight,
} from 'lucide-react';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { BoundlessButton } from '../buttons';
import { usePathname, useRouter } from 'next/navigation';
import { Sheet, SheetTrigger, SheetContent, SheetClose } from '../ui/sheet';
import { useAuthStatus, useAuthActions } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { User, LogOut, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import WalletConnectButton from '../wallet/WalletConnectButton';
import CreateProjectModal from './project/CreateProjectModal';
import { useProtectedAction } from '@/hooks/use-protected-action';
import { useAuthStore } from '@/lib/stores/auth-store';
import WalletRequiredModal from '@/components/wallet/WalletRequiredModal';
import { useWindowSize } from '@/hooks/use-window-size';

gsap.registerPlugin(useGSAP);

const menuItems = [
  { href: '/about', label: 'About' },
  { href: '/projects', label: 'Projects' },
  { href: '/hackathons', label: 'Hackathons' },
  { href: '/grants', label: 'Grants' },
  { href: '/bounties', label: 'Bounties' },

  { href: '/blog', label: 'Blog' },
];

export function Navbar() {
  const navbarRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuthStatus();
  const pathname = usePathname();
  const { width } = useWindowSize();

  useGSAP(
    () => {
      gsap.fromTo(
        navbarRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: 'power2.out' }
      );

      const logoHover = gsap.to(logoRef.current, {
        scale: 1,
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
      }> = [];

      menuItems?.forEach(item => {
        const hoverTl = gsap.timeline({ paused: true });
        hoverTl.to(item, {
          duration: 0.2,
          ease: 'power2.out',
        });

        const enterHandler = () => hoverTl.play();
        const leaveHandler = () => hoverTl.reverse();

        item.addEventListener('mouseenter', enterHandler);
        item.addEventListener('mouseleave', leaveHandler);

        menuItemAnimations.push({
          item,
          hoverTl,
          enterHandler,
          leaveHandler,
        });
      });

      const ctaHover = gsap.to(ctaRef.current, {
        scale: 1,
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
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        backdropFilter: 'blur(8px)',
        duration: 0.2,
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
          ({ item, hoverTl, enterHandler, leaveHandler }) => {
            hoverTl.kill();
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

  if (pathname.startsWith('/organizations')) {
    return null;
  }
  return (
    <nav
      ref={navbarRef}
      className='sticky top-0 z-50 max-h-[88px] bg-[#030303A3] backdrop-blur-[12px]'
    >
      <div className='mx-auto max-w-[1440px] px-3 py-3 sm:px-6 sm:py-5 md:px-8 lg:px-12 xl:px-16 2xl:px-20'>
        <div className='flex items-center justify-between gap-3 sm:gap-6'>
          <div className='flex-shrink-0'>
            <Link
              ref={logoRef}
              href='/'
              onClick={() => router.push('/')}
              className='flex items-center'
            >
              <Image
                src='/logo-icon.png'
                alt='logo'
                width={32}
                height={32}
                className='transition-all duration-200 lg:hidden'
              />
              <Image
                src='/logo.png'
                alt='logo'
                width={140}
                height={28}
                className='hidden transition-all duration-200 lg:block'
              />
            </Link>
          </div>

          <div
            ref={menuRef}
            className='hidden md:flex md:flex-1 md:justify-center'
          >
            <div className='flex items-baseline space-x-2 lg:space-x-4'>
              {menuItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'rounded-md px-2 py-2 font-medium text-white transition-all duration-200 hover:bg-white/5 hover:text-white/80',
                    'md:text-xs lg:text-sm',
                    width && width < 1024 ? 'px-2' : 'px-3'
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div ref={ctaRef} className='hidden md:block'>
            {isLoading ? (
              <div className='flex items-center space-x-2'>
                <div className='h-8 w-8 animate-pulse rounded-full bg-gray-200' />
                <div className='h-4 w-20 animate-pulse rounded bg-gray-200' />
              </div>
            ) : isAuthenticated ? (
              <AuthenticatedNav user={user} />
            ) : (
              <UnauthenticatedNav />
            )}
          </div>
          <MobileMenu isAuthenticated={isAuthenticated} user={user} />
        </div>
      </div>
    </nav>
  );
}

function AuthenticatedNav({
  user,
}: {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    profile?: { firstName?: string | null; avatar?: string | null };
    username?: string | null;
  } | null;
}) {
  const { logout } = useAuthActions();
  const { isLoading } = useAuthStore();
  const [createProjectModalOpen, setCreateProjectModalOpen] = useState(false);

  const {
    executeProtectedAction,
    showWalletModal,
    closeWalletModal,
    handleWalletConnected,
  } = useProtectedAction({
    actionName: 'create project',
    onSuccess: () => setCreateProjectModalOpen(true),
  });
  return (
    <div className='flex items-center space-x-2 lg:space-x-3'>
      <WalletConnectButton />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <BoundlessButton className='hover:!text-primary tr bg-transparent text-white hover:bg-transparent'>
            <Plus className='h-4 w-4' />
          </BoundlessButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align='end'
          className='bg-background w-[280px] rounded-[8px] border border-[#2B2B2B] pt-3 pb-6 text-white shadow-[0_4px_4px_0_rgba(26,26,26,0.25)] sm:w-[300px]'
        >
          <DropdownMenuItem
            onClick={async () => {
              await executeProtectedAction(() =>
                setCreateProjectModalOpen(true)
              );
            }}
            className='group hover:text-primary px-6 py-3.5 text-white hover:!bg-transparent'
          >
            <span className='group-hover:text-primary flex w-full items-center justify-between'>
              Add Project
              <Plus className='group-hover:text-primary h-4 w-4' />
            </span>
          </DropdownMenuItem>
          <Link href='/organizations/new' target='_blank' rel='noreferrer'>
            <DropdownMenuItem className='group hover:text-primary px-6 py-3.5 text-white hover:!bg-transparent'>
              <span className='group-hover:text-primary flex w-full items-center justify-between'>
                Host Hackathon
                <ArrowUpRight className='group-hover:text-primary h-4 w-4' />
              </span>
            </DropdownMenuItem>
          </Link>
          <Link href='/organizations/new' target='_blank' rel='noreferrer'>
            <DropdownMenuItem className='group hover:text-primary px-6 py-3.5 text-white hover:!bg-transparent'>
              <span className='group-hover:text-primary flex w-full items-center justify-between'>
                Create Grant
                <ArrowUpRight className='group-hover:text-primary h-4 w-4' />
              </span>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className='flex items-center space-x-2 rounded-full p-1 transition-colors hover:bg-white/10'>
            <Avatar className='h-12 w-12'>
              <AvatarImage
                src={user?.image || user?.profile?.avatar || ''}
                alt={user?.name || user?.profile?.firstName || ''}
              />
              <AvatarFallback>
                {/* {user?.name?.charAt(0) ||
                  user?.profile?.firstName?.charAt(0) ||
                  user?.email?.charAt(0) ||
                  'U'} */}
                <Image
                  src={
                    user?.image ||
                    user?.profile?.avatar ||
                    'https://i.pravatar.cc/150?img=10'
                  }
                  alt='logo'
                  width={116}
                  height={22}
                  className='h-full w-full object-cover'
                />
              </AvatarFallback>
            </Avatar>
            <ChevronDown className='h-5 w-5 text-white' />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className='bg-background w-[320px] rounded-[8px] border border-[#2B2B2B] p-0 !text-white shadow-[0_4px_4px_0_rgba(26,26,26,0.25)] sm:w-[350px]'
          align='end'
          forceMount
        >
          <DropdownMenuLabel className='p-6 !pb-3 font-normal'>
            <div className='flex flex-col space-y-1'>
              <p className='text-sm leading-[160%]'>
                Signed in as{' '}
                <span className='leading-[145%] font-semibold'>
                  {user?.name || user?.profile?.firstName || 'User'}
                </span>
              </p>
              <p className='text-sm leading-[145%] text-[#B5B5B5]'>
                {user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className='h-[0.5px] bg-[#2B2B2B]' />
          <DropdownMenuItem
            className='group hover:!text-primary cursor-pointer px-6 py-3.5 pt-3 hover:!bg-transparent'
            asChild
          >
            <Link
              href='/me'
              className='group-hover:!text-primary flex items-center'
            >
              <User className='teext-white group-hover:!text-primary mr-2 h-4 w-4 text-white' />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            className='group hover:!text-primary cursor-pointer px-6 py-3.5 hover:!bg-transparent'
            asChild
          >
            <Link
              href='/organizations'
              className='group-hover:text-primary flex items-center'
            >
              <Building2 className='group-hover:!text-primary mr-2 h-4 w-4 text-white' />
              Organizations
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            className='group hover:!text-primary cursor-pointer px-6 py-3.5 pb-6 hover:!bg-transparent'
            asChild
          >
            <Link href='/settings' className='flex items-center'>
              <Settings className='group-hover:!text-primary mr-2 h-4 w-4 text-white' />
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator className='h-[0.5px] bg-[#2B2B2B]' />
          <DropdownMenuItem
            onClick={() => !isLoading && logout()}
            disabled={isLoading}
            className='group flex cursor-pointer items-center px-6 pt-3 pb-6 text-red-600 hover:!bg-transparent hover:!text-red-700 disabled:cursor-not-allowed disabled:opacity-50'
          >
            <LogOut className='mr-2 h-4 w-4 text-red-600 group-hover:!text-red-700' />
            {isLoading ? 'Signing Out...' : 'Sign Out'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <CreateProjectModal
        open={createProjectModalOpen}
        setOpen={setCreateProjectModalOpen}
      />

      {/* Wallet Required Modal */}
      <WalletRequiredModal
        open={showWalletModal}
        onOpenChange={closeWalletModal}
        actionName='create project'
        onWalletConnected={handleWalletConnected}
      />
    </div>
  );
}

// In development, show a lightweight CTA that opens CreateProjectModal
// even for unauthenticated users, so designers/QA can test the flow.
function UnauthenticatedNav() {
  const [createProjectModalOpen, setCreateProjectModalOpen] = useState(false);
  const { width } = useWindowSize();

  const {
    executeProtectedAction,
    showWalletModal,
    closeWalletModal,
    handleWalletConnected,
  } = useProtectedAction({
    actionName: 'create project',
    onSuccess: () => setCreateProjectModalOpen(true),
  });

  const showDevAddProject =
    process.env.NODE_ENV !== 'production' &&
    (process.env.NEXT_PUBLIC_SHOW_ADD_PROJECT_FOR_GUESTS === 'true' || true);

  if (!showDevAddProject) {
    return (
      <BoundlessButton>
        <Link href='/auth'>Get Started</Link>
      </BoundlessButton>
    );
  }

  return (
    <div className='flex items-center space-x-2 lg:space-x-3'>
      <BoundlessButton
        variant='outline'
        onClick={async () => {
          await executeProtectedAction(() => setCreateProjectModalOpen(true));
        }}
        className='border-white/20 text-white hover:bg-white/10'
        size={width && width < 1024 ? 'sm' : 'default'}
      >
        <Plus className='mr-1 h-3 w-3 lg:mr-2 lg:h-4 lg:w-4' />
        <span className='hidden sm:inline'>Add Project</span>
        <span className='sm:hidden'>Add</span>
      </BoundlessButton>
      <BoundlessButton size={width && width < 1024 ? 'sm' : 'default'}>
        <Link href='/auth'>Sign in</Link>
      </BoundlessButton>
      <CreateProjectModal
        open={createProjectModalOpen}
        setOpen={setCreateProjectModalOpen}
      />

      {/* Wallet Required Modal */}
      <WalletRequiredModal
        open={showWalletModal}
        onOpenChange={closeWalletModal}
        actionName='create project'
        onWalletConnected={handleWalletConnected}
      />
    </div>
  );
}

function MobileMenu({
  isAuthenticated,
  user,
}: {
  isAuthenticated: boolean;
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    profile?: { firstName?: string | null; avatar?: string | null };
    username?: string | null;
  } | null;
}) {
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);
  const mobileLogoRef = useRef<HTMLAnchorElement>(null);
  const mobileMenuItemsRef = useRef<HTMLDivElement>(null);
  const mobileCTARef = useRef<HTMLDivElement>(null);
  const { logout } = useAuthActions();
  const { isLoading } = useAuthStore();
  const [createProjectModalOpen, setCreateProjectModalOpen] = useState(false);
  const { width } = useWindowSize();
  useGSAP(
    () => {
      gsap.fromTo(
        mobileButtonRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3 }
      );

      const buttonHover = gsap.to(mobileButtonRef.current, {
        scale: 1,
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
      { opacity: 0 },
      { opacity: 1, duration: 0.3, ease: 'power2.out' }
    );

    const menuItems = mobileMenuItemsRef.current?.querySelectorAll('a');
    if (menuItems) {
      gsap.fromTo(
        menuItems,
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.3,
          stagger: 0.1,
          ease: 'power2.out',
        }
      );
    }

    gsap.fromTo(
      mobileCTARef.current,
      { opacity: 0, y: 10 },
      {
        opacity: 1,
        y: 0,
        duration: 0.3,
        delay: 0.2,
        ease: 'power2.out',
      }
    );
  };

  const animateMobileMenuClose = () => {
    gsap.to(
      [mobileLogoRef.current, mobileMenuItemsRef.current, mobileCTARef.current],
      {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
      }
    );
  };

  return (
    <div ref={mobileMenuRef} className='justify-self-end md:hidden'>
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
            size={width && width < 480 ? 'sm' : 'default'}
            className='border-white/20 transition-all duration-200 hover:border-white/30 hover:bg-white/10 md:hidden'
          >
            <Menu className={width && width < 480 ? 'h-4 w-4' : 'h-5 w-5'} />
          </BoundlessButton>
        </SheetTrigger>
        <SheetContent
          showCloseButton={false}
          side='top'
          className='px-4 pt-4 pb-8 sm:px-6 sm:pt-6 sm:pb-12'
        >
          {/* Header with logo and close button */}
          <div className='mb-6 flex items-center justify-between sm:mb-8'>
            <div className='flex-shrink-0'>
              <Link ref={mobileLogoRef} href='/' className='flex items-center'>
                <Image
                  src='/logo.png'
                  alt='logo'
                  width={116}
                  height={22}
                  className='transition-all duration-200 lg:hidden'
                />
                <Image
                  src='/logo.png'
                  alt='logo'
                  width={140}
                  height={28}
                  className='hidden transition-all duration-200 lg:block'
                />
              </Link>
            </div>
            <SheetClose>
              <BoundlessButton
                variant='outline'
                size='sm'
                className='border-white/20 hover:bg-white/10'
              >
                <XIcon className='h-4 w-4' />
              </BoundlessButton>
            </SheetClose>
          </div>
          {/* Navigation Menu */}
          <div ref={mobileMenuItemsRef} className='mb-6 sm:mb-8'>
            <h3 className='mb-4 text-xs font-semibold tracking-wider text-white/60 uppercase'>
              Navigation
            </h3>
            <div className='flex flex-col gap-1'>
              {menuItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className='flex items-center rounded-lg px-4 py-3 text-base font-medium text-white transition-all duration-200 hover:bg-white/10 hover:text-white active:bg-white/15'
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div ref={mobileCTARef}>
            {isLoading ? (
              <div className='flex items-center justify-center space-x-2 py-4'>
                <div className='h-8 w-8 animate-pulse rounded-full bg-gray-200' />
                <div className='h-4 w-20 animate-pulse rounded bg-gray-200' />
              </div>
            ) : isAuthenticated ? (
              <div className='space-y-6'>
                {/* User Profile Section */}
                <div className='rounded-xl border border-white/10 bg-gradient-to-r from-white/5 to-white/10 p-4'>
                  <div className='flex items-center space-x-3'>
                    <Avatar className='h-12 w-12 ring-2 ring-white/20'>
                      <AvatarImage
                        src={user?.image || user?.profile?.avatar || ''}
                        alt={user?.name || user?.profile?.firstName || ''}
                      />
                      <AvatarFallback className='bg-white/10 font-semibold text-white'>
                        {user?.name?.charAt(0) ||
                          user?.profile?.firstName?.charAt(0) ||
                          user?.email?.charAt(0) ||
                          'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className='min-w-0 flex-1'>
                      <p className='truncate text-base font-semibold text-white'>
                        {user?.name || user?.profile?.firstName || 'User'}
                      </p>
                      <p className='truncate text-sm text-white/70'>
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Wallet Connection */}
                <div className='space-y-3'>
                  <h3 className='text-xs font-semibold tracking-wider text-white/60 uppercase'>
                    Wallet
                  </h3>
                  <WalletConnectButton
                    variant='outline'
                    size='sm'
                    className='w-full border-white/20 bg-white/5 text-white hover:border-white/30 hover:bg-white/10'
                  />
                </div>

                {/* Quick Actions */}
                <div className='space-y-3'>
                  <h3 className='text-xs font-semibold tracking-wider text-white/60 uppercase'>
                    Quick Actions
                  </h3>
                  <div className='grid grid-cols-1 gap-2'>
                    <Link
                      href={`/profile/${user?.username}`}
                      className='flex items-center rounded-lg px-4 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-white/10 active:bg-white/15'
                    >
                      <User className='mr-3 h-4 w-4' />
                      Profile
                    </Link>
                    <Link
                      href='/organizations'
                      className='flex items-center rounded-lg px-4 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-white/10 active:bg-white/15'
                    >
                      <Building2 className='mr-3 h-4 w-4' />
                      Organizations
                    </Link>
                    <Link
                      href='/settings'
                      className='flex items-center rounded-lg px-4 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-white/10 active:bg-white/15'
                    >
                      <Settings className='mr-3 h-4 w-4' />
                      Settings
                    </Link>
                  </div>
                </div>
                {/* Sign Out Button */}
                <div className='border-t border-white/10 pt-2'>
                  <BoundlessButton
                    size='lg'
                    fullWidth
                    variant='outline'
                    onClick={() => !isLoading && logout()}
                    disabled={isLoading}
                    className='w-full border-red-500/50 text-red-400 hover:border-red-500 hover:bg-red-500/10 hover:text-red-300'
                  >
                    <LogOut className='mr-2 h-4 w-4' />
                    {isLoading ? 'Signing Out...' : 'Sign Out'}
                  </BoundlessButton>
                </div>
              </div>
            ) : (
              <div className='space-y-6'>
                {/* Wallet Connection */}
                <div className='space-y-3'>
                  <h3 className='text-xs font-semibold tracking-wider text-white/60 uppercase'>
                    Connect Wallet
                  </h3>
                  <WalletConnectButton
                    variant='outline'
                    size='sm'
                    className='w-full border-white/20 bg-white/5 text-white hover:border-white/30 hover:bg-white/10'
                  />
                </div>

                {/* Get Started Section */}
                <div className='space-y-3'>
                  <h3 className='text-xs font-semibold tracking-wider text-white/60 uppercase'>
                    Get Started
                  </h3>
                  <BoundlessButton
                    size='lg'
                    fullWidth
                    className='w-full bg-gradient-to-r from-blue-600 to-purple-600 font-semibold text-white hover:from-blue-700 hover:to-purple-700'
                  >
                    <Link
                      href='/auth'
                      className='flex items-center justify-center'
                    >
                      <Plus className='mr-2 h-4 w-4' />
                      Get Started
                    </Link>
                  </BoundlessButton>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
      <CreateProjectModal
        open={createProjectModalOpen}
        setOpen={setCreateProjectModalOpen}
      />
    </div>
  );
}
