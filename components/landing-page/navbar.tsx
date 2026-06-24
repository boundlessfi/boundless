'use client';
import Link from 'next/link';
import React from 'react';
import {
  Menu,
  Plus,
  Building2,
  ArrowUpRight,
  User as UserIcon,
  LogOut,
  Settings,
  Wand2,
} from 'lucide-react';
import Image from 'next/image';
import { useState, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { Sheet, SheetTrigger, SheetContent } from '../ui/sheet';
import { useAuthStatus, useAuthActions } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { UserMenu } from '../user/UserMenu';
import { cn } from '@/lib/utils';
import { getKycImageAndAlt } from '@/lib/kyc-status';
import type { GetMeResponse } from '@/lib/api/types';
import { BoundlessButton } from '../buttons';
import { useProtectedAction } from '@/hooks/use-protected-action';
import WalletRequiredModal from '@/components/wallet/WalletRequiredModal';
import { WalletTrigger } from '../wallet/WalletTrigger';
import { NotificationBell } from '../notifications/NotificationBell';
import { MessagesTrigger } from '@/components/messages/MessagesTrigger';
import CreateProjectModal from '@/features/projects/components/CreateProjectModal';
import WalletNotReadyModal from '@/components/wallet/WalletNotReadyModal';
import { useWalletContext } from '../providers/wallet-provider';

const BRAND_COLOR = '#2eedaa';
const ACTIONS = {
  CREATE_PROJECT: 'create project',
} as const;

const MENU_ITEMS = [
  { href: '/about', label: 'About' },
  { href: '/crowdfunding', label: 'Crowdfunding' },
  { href: '/hackathons', label: 'Hackathons' },
  { href: '/grants', label: 'Grants' },
  { href: '/bounties', label: 'Bounties' },
  { href: '/blog', label: 'Blog' },
] as const;

interface UserProfile {
  firstName?: string | null;
  image?: string | null;
}

interface User {
  id?: string;
  username?: string | null;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
  profile?: UserProfile | import('@/lib/api/types').GetMeResponse | null;
}

export function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, isLoading, user } = useAuthStatus();

  // Don't show navbar on organization pages
  if (pathname.startsWith('/organizations')) {
    return null;
  }

  return (
    <nav className='bg-background-main-bg/95 sticky top-0 z-50 border-b border-white/10 shadow-lg shadow-black/20 backdrop-blur-xl'>
      <div className='mx-auto px-5 md:px-[50px]'>
        <div className='flex h-16 items-center justify-between gap-4'>
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <DesktopMenu items={MENU_ITEMS} currentPath={pathname} />

          {/* Desktop Actions: single flex group for correct layout */}
          <div className='hidden shrink-0 items-center gap-2 lg:flex lg:gap-3'>
            {isLoading ? (
              <LoadingSkeleton />
            ) : isAuthenticated ? (
              <AuthenticatedActions />
            ) : (
              <UnauthenticatedActions />
            )}
          </div>

          {/* Mobile: right-aligned group — notification, wallet (if auth), hamburger; placeholders when loading to avoid layout jump */}
          <div className='flex shrink-0 items-center justify-end gap-2 lg:hidden'>
            {isAuthenticated && isLoading && (
              <div className='flex items-center gap-2' aria-hidden>
                <span className='h-11 w-11 shrink-0 animate-pulse rounded-lg border border-white/10 bg-white/5' />
                <span className='h-11 w-11 shrink-0 animate-pulse rounded-lg border border-white/10 bg-white/5' />
                <span className='h-11 w-11 shrink-0 animate-pulse rounded-lg border border-white/10 bg-white/5' />
              </div>
            )}
            {isAuthenticated && !isLoading && (
              <>
                <MessagesTrigger className='flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-white/20 p-2.5 text-white/70 transition-colors hover:border-white/30 hover:bg-white/5 hover:text-white' />
                <NotificationBell
                  className='flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-white/20 p-2.5 text-white/70 transition-colors hover:border-white/30 hover:bg-white/5 hover:text-white'
                  limit={10}
                />
                <WalletTrigger variant='icon' drawerType='family' />
              </>
            )}
            <MobileMenu
              isAuthenticated={isAuthenticated}
              isLoading={isLoading}
              user={user}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}

export function Logo() {
  return (
    <Link
      href='/'
      className='shrink-0 transition-opacity hover:opacity-80'
      aria-label='Go to homepage'
    >
      <Image
        src='/logos/SVG_Coloured/BNDLSS__Colored_icon.svg'
        alt='Logo'
        width={32}
        height={32}
        className='md:hidden'
      />
      <Image
        src='/logos/SVG_Inverse/logo.svg'
        alt='Logo'
        width={140}
        height={28}
        className='hidden md:block'
      />
    </Link>
  );
}

function DesktopMenu({
  items,
  currentPath,
}: {
  items: typeof MENU_ITEMS;
  currentPath: string;
}) {
  return (
    <nav
      className='hidden flex-1 items-center justify-center lg:flex'
      aria-label='Main navigation'
    >
      <div className='flex items-center gap-1'>
        {items.map(item => {
          const isActive = currentPath === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'rounded-lg px-3 py-2 text-sm font-medium transition-all duration-100',
                isActive
                  ? 'navbar-link-active'
                  : 'text-white/60 hover:bg-white/5 hover:text-white/90'
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function LoadingSkeleton() {
  return (
    <div className='flex items-center gap-3' role='status' aria-label='Loading'>
      <div className='h-10 w-24 animate-pulse rounded-lg border border-white/10 bg-white/5' />
      <div className='h-10 w-10 animate-pulse rounded-full border border-white/10 bg-white/5' />
      <span className='sr-only'>Loading...</span>
    </div>
  );
}

function AuthenticatedActions() {
  const [createProjectModalOpen, setCreateProjectModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const {
    executeProtectedAction,
    showWalletModal,
    showNotReadyModal,
    notReadyReasons,
    closeWalletModal,
    closeNotReadyModal,
    handleWalletConnected,
  } = useProtectedAction({
    actionName: ACTIONS.CREATE_PROJECT,
    onSuccess: () => setCreateProjectModalOpen(true),
  });
  const { onOpenWallet } = useWalletContext();

  return (
    <>
      <div className='flex items-center gap-2'>
        <MessagesTrigger className='rounded-lg border border-white/20 p-2 text-white/70 transition-colors hover:border-white/30 hover:bg-white/5 hover:text-white' />
        <WalletTrigger variant='icon' drawerType='sheet' />
        <NotificationBell
          className='rounded-lg border border-white/20 p-2 text-white/70 transition-colors hover:border-white/30 hover:bg-white/5 hover:text-white'
          limit={10}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <BoundlessButton
              variant='outline'
              size='sm'
              aria-label='Create new content'
              className='group relative flex items-center gap-2 overflow-hidden rounded-lg border-white/20 bg-transparent px-3 py-2 text-sm font-medium text-white/90 transition-all duration-200 hover:bg-white/5'
              onMouseEnter={e => {
                setIsHovered(true);
                e.currentTarget.style.backgroundColor = `${BRAND_COLOR}1A`;
                e.currentTarget.style.borderColor = `${BRAND_COLOR}66`;
                e.currentTarget.style.color = BRAND_COLOR;
              }}
              onMouseLeave={e => {
                setIsHovered(false);
                e.currentTarget.style.backgroundColor = '';
                e.currentTarget.style.borderColor = '';
                e.currentTarget.style.color = '';
              }}
            >
              <Wand2
                className={`h-4 w-4 transition-transform duration-200 ${isHovered ? 'rotate-12' : ''}`}
              />
              <span>Create</span>
            </BoundlessButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align='end'
            className='bg-background-main-bg/98 w-56 border-white/10 shadow-xl shadow-black/40 backdrop-blur-xl'
          >
            <DropdownMenuItem
              onClick={() =>
                executeProtectedAction(() => setCreateProjectModalOpen(true))
              }
              className='cursor-pointer text-white/80 hover:bg-white/5 hover:text-white focus:bg-white/5 focus:text-white'
            >
              <Plus className='mr-2 h-4 w-4' />
              Add Project
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href='/organizations/new'
                target='_blank'
                className='text-white/80 hover:bg-white/5 hover:text-white focus:bg-white/5 focus:text-white'
              >
                <Building2 className='mr-2 h-4 w-4' />
                Host Hackathon
                <ArrowUpRight className='ml-auto h-4 w-4' />
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href='/grants'
                className='text-white/80 hover:bg-white/5 hover:text-white focus:bg-white/5 focus:text-white'
              >
                <Building2 className='mr-2 h-4 w-4' />
                Create Grant
                <ArrowUpRight className='ml-auto h-4 w-4' />
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <UserMenu
          triggerClassName='flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 p-1 transition-colors hover:border-white/30 hover:bg-white/10'
          contentClassName='w-64 rounded-xl border border-white/10 bg-background-main-bg/98 p-0 shadow-xl shadow-black/40 backdrop-blur-xl'
        />
      </div>

      <CreateProjectModal
        open={createProjectModalOpen}
        setOpen={setCreateProjectModalOpen}
      />
      <WalletRequiredModal
        open={showWalletModal}
        onOpenChange={closeWalletModal}
        actionName={ACTIONS.CREATE_PROJECT}
        onWalletConnected={handleWalletConnected}
      />
      <WalletNotReadyModal
        open={showNotReadyModal}
        onOpenChange={closeNotReadyModal}
        reasons={notReadyReasons}
        actionName={ACTIONS.CREATE_PROJECT}
        onOpenWallet={onOpenWallet}
      />
    </>
  );
}

function UnauthenticatedActions() {
  const [createProjectModalOpen, setCreateProjectModalOpen] = useState(false);
  const {
    showWalletModal,
    showNotReadyModal,
    notReadyReasons,
    closeWalletModal,
    closeNotReadyModal,
    handleWalletConnected,
  } = useProtectedAction({
    actionName: ACTIONS.CREATE_PROJECT,
    onSuccess: () => setCreateProjectModalOpen(true),
  });
  const { onOpenWallet } = useWalletContext();

  return (
    <>
      <div className='flex items-center gap-2'>
        <Link
          href='/auth?mode=signin'
          className='inline-flex h-9 min-h-[44px] items-center justify-center rounded-[10px] border border-white/30 px-4 text-sm font-medium text-white transition-colors hover:border-white/40 hover:bg-white/10'
        >
          Sign In
        </Link>
        <Link
          href='/auth?mode=signup'
          className='bg-primary shadow-primary/20 hover:bg-primary/90 inline-flex h-9 min-h-[44px] items-center justify-center rounded-[10px] px-4 text-sm font-medium text-black shadow-sm transition-colors'
        >
          Get Started
        </Link>
      </div>

      <CreateProjectModal
        open={createProjectModalOpen}
        setOpen={setCreateProjectModalOpen}
      />

      <WalletRequiredModal
        open={showWalletModal}
        onOpenChange={closeWalletModal}
        actionName={ACTIONS.CREATE_PROJECT}
        onWalletConnected={handleWalletConnected}
      />
      <WalletNotReadyModal
        open={showNotReadyModal}
        onOpenChange={closeNotReadyModal}
        reasons={notReadyReasons}
        actionName={ACTIONS.CREATE_PROJECT}
        onOpenWallet={onOpenWallet}
      />
    </>
  );
}

const MobileMenu = ({
  isAuthenticated,
  isLoading,
  user,
}: {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuthActions();
  const pathname = usePathname();

  const userInitial = useMemo(() => {
    return user?.name?.charAt(0) || user?.email?.charAt(0) || 'U';
  }, [user]);

  const displayName = useMemo(() => {
    return user?.name || user?.profile?.firstName || 'User';
  }, [user]);

  const kycStatus = (user?.profile as GetMeResponse | undefined)?.user
    ?.identityVerificationStatus;
  const kycBadge = getKycImageAndAlt(kycStatus);

  return (
    <div className='lg:hidden'>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <BoundlessButton
            variant='outline'
            size='sm'
            aria-label='Open navigation menu'
            className='min-h-[44px] min-w-[44px] border-white/20 transition-all duration-200'
            style={
              {
                '--hover-bg': `${BRAND_COLOR}1A`,
                '--hover-border': `${BRAND_COLOR}66`,
                '--hover-color': BRAND_COLOR,
              } as React.CSSProperties
            }
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = `${BRAND_COLOR}1A`;
              e.currentTarget.style.borderColor = `${BRAND_COLOR}66`;
              e.currentTarget.style.color = BRAND_COLOR;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = '';
              e.currentTarget.style.borderColor = '';
              e.currentTarget.style.color = '';
            }}
          >
            <Menu className='h-5 w-5' />
          </BoundlessButton>
        </SheetTrigger>

        <SheetContent
          side='right'
          className='bg-background-main-bg flex w-full max-w-[100vw] flex-col border-l border-white/10 px-5 pt-10 sm:max-w-md'
          showCloseButton={true}
        >
          <div className='flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto pb-4'>
            {isAuthenticated && user && (
              <div className='flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/8'>
                <span className='relative shrink-0'>
                  <Avatar className='h-10 w-10 border border-white/10'>
                    <AvatarImage
                      src={
                        (user.profile as GetMeResponse)?.user?.image ||
                        user.profile?.image ||
                        ''
                      }
                      alt={displayName}
                    />
                    <AvatarFallback className='bg-white/10 text-white/80'>
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>
                  {kycBadge && (
                    <span className='absolute -right-0.5 -bottom-0.5 flex rounded-full bg-black'>
                      <Image
                        src={kycBadge.src}
                        alt={kycBadge.alt}
                        width={14}
                        height={14}
                        className='h-3.5 w-3.5'
                      />
                    </span>
                  )}
                </span>
                <div className='min-w-0 flex-1'>
                  <p className='flex items-center gap-1.5 truncate text-sm font-medium text-white'>
                    <span className='truncate'>{displayName}</span>
                    {kycBadge && (
                      <Image
                        src={kycBadge.src}
                        alt={kycBadge.alt}
                        width={14}
                        height={14}
                        className='h-3.5 w-3.5 shrink-0'
                      />
                    )}
                  </p>
                  <p className='truncate text-xs text-white/60'>
                    {user?.email}
                  </p>
                </div>
              </div>
            )}

            <nav className='flex flex-col gap-1' aria-label='Mobile navigation'>
              {MENU_ITEMS.map(item => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'flex min-h-[44px] items-center rounded-lg border px-3 py-3 text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'navbar-link-active'
                        : 'text-white/70 hover:border-white/10 hover:bg-white/5 hover:text-white/90'
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {isAuthenticated && isLoading && <LoadingSkeleton />}
          </div>

          {/* Bottom: account actions – Profile, Settings, Sign Out (authenticated) or Get Started + Sign In (unauthenticated) */}
          {isAuthenticated && !isLoading && (
            <div className='shrink-0 border-t border-white/10 pt-4 pb-6'>
              {user?.username && (
                <Link
                  href={`/profile/${user.username}`}
                  onClick={() => setIsOpen(false)}
                  className='mb-3 flex min-h-[44px] w-full items-center justify-center rounded-[10px] border border-white/30 px-4 py-3 text-sm font-medium text-white transition-colors hover:border-white/40 hover:bg-white/10'
                >
                  Profile
                </Link>
              )}
              <Link
                href='/me/settings'
                onClick={() => setIsOpen(false)}
                className='mb-3 flex min-h-[44px] w-full items-center justify-center rounded-[10px] border border-white/30 px-4 py-3 text-sm font-medium text-white transition-colors hover:border-white/40 hover:bg-white/10'
              >
                Settings
              </Link>
              <button
                type='button'
                className='flex min-h-[44px] w-full items-center justify-center rounded-[10px] border border-red-500/50 bg-transparent px-4 py-3 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10'
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
              >
                Sign Out
              </button>
            </div>
          )}

          {!isAuthenticated && (
            <div className='mt-auto flex shrink-0 flex-col gap-3 border-t border-white/10 pt-6 pb-6'>
              <Link
                href='/auth?mode=signup'
                onClick={() => setIsOpen(false)}
                className='bg-primary shadow-primary/20 hover:bg-primary/90 inline-flex min-h-[44px] w-full items-center justify-center rounded-[10px] px-4 py-3 text-sm font-medium text-black shadow-sm transition-colors'
              >
                Get Started
              </Link>
              <Link
                href='/auth?mode=signin'
                onClick={() => setIsOpen(false)}
                className='inline-flex min-h-[44px] w-full items-center justify-center rounded-[10px] border border-white/30 px-4 py-3 text-sm font-medium text-white transition-colors hover:border-white/40 hover:bg-white/10'
              >
                Sign In
              </Link>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};
