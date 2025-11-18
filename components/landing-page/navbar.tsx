'use client';
import Link from 'next/link';
import {
  Menu,
  Plus,
  Building2,
  ArrowUpRight,
  User,
  LogOut,
  Settings,
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
import { BoundlessButton } from '../buttons';
import CreateProjectModal from './project/CreateProjectModal';
import { useProtectedAction } from '@/hooks/use-protected-action';
import WalletRequiredModal from '@/components/wallet/WalletRequiredModal';
import { WalletButton } from '../wallet/WalletButton';

// Constants
const BRAND_COLOR = '#a7f950';
const ACTIONS = {
  CREATE_PROJECT: 'create project',
} as const;

const MENU_ITEMS = [
  { href: '/about', label: 'About' },
  { href: '/projects', label: 'Projects' },
  { href: '/hackathons', label: 'Hackathons' },
  { href: '/grants', label: 'Grants' },
  { href: '/bounties', label: 'Bounties' },
  { href: '/blog', label: 'Blog' },
] as const;

// Types
interface UserProfile {
  firstName?: string | null;
  avatar?: string | null;
}

interface User {
  username?: string | null;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  profile?: UserProfile;
}

export function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, isLoading, user } = useAuthStatus();

  // Don't show navbar on organization pages
  if (pathname.startsWith('/organizations')) {
    return null;
  }

  return (
    <nav className='sticky top-0 z-50 border-b border-white/10 bg-[#030303]/95 shadow-lg shadow-black/20 backdrop-blur-xl'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='flex h-16 items-center justify-between gap-4'>
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <DesktopMenu items={MENU_ITEMS} currentPath={pathname} />

          {/* Desktop Actions - Updated with better alignment */}
          <div className='hidden flex-shrink-0 md:flex md:items-center md:gap-3'>
            {isLoading ? (
              <LoadingSkeleton />
            ) : isAuthenticated ? (
              <AuthenticatedActions />
            ) : (
              <UnauthenticatedActions />
            )}
          </div>

          {/* Mobile Menu */}
          <MobileMenu
            isAuthenticated={isAuthenticated}
            isLoading={isLoading}
            user={user}
          />
        </div>
      </div>
    </nav>
  );
}

function Logo() {
  return (
    <Link
      href='/'
      className='flex-shrink-0 transition-opacity hover:opacity-80'
      aria-label='Go to homepage'
    >
      <Image
        src='/logo-icon.png'
        alt='Logo'
        width={32}
        height={32}
        className='md:hidden'
      />
      <Image
        src='/logo.png'
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
      className='hidden flex-1 md:flex md:items-center md:justify-center'
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
                  ? `bg-[${BRAND_COLOR}]/10 text-[${BRAND_COLOR}] border border-[${BRAND_COLOR}]/20 shadow-sm shadow-[${BRAND_COLOR}]/5`
                  : 'text-white/60 hover:bg-white/5 hover:text-white/90'
              )}
              style={
                isActive
                  ? {
                      backgroundColor: `${BRAND_COLOR}1A`,
                      color: BRAND_COLOR,
                      borderColor: `${BRAND_COLOR}33`,
                      boxShadow: `0 1px 2px ${BRAND_COLOR}0D`,
                    }
                  : undefined
              }
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
  const {
    executeProtectedAction,
    showWalletModal,
    closeWalletModal,
    handleWalletConnected,
  } = useProtectedAction({
    actionName: ACTIONS.CREATE_PROJECT,
    onSuccess: () => setCreateProjectModalOpen(true),
  });

  return (
    <>
      <div className='flex items-center gap-2'>
        <WalletButton />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <BoundlessButton
              variant='outline'
              size='sm'
              aria-label='Create new content'
              className='border-white/20 transition-all duration-200'
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
              <Plus className='h-4 w-4' />
            </BoundlessButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align='end'
            className='w-56 border-white/10 bg-[#030303]/98 shadow-xl shadow-black/40 backdrop-blur-xl'
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
                href='/organizations/new'
                target='_blank'
                className='text-white/80 hover:bg-white/5 hover:text-white focus:bg-white/5 focus:text-white'
              >
                <Building2 className='mr-2 h-4 w-4' />
                Create Grant
                <ArrowUpRight className='ml-auto h-4 w-4' />
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <UserMenu />
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
    </>
  );
}

function UnauthenticatedActions() {
  const [createProjectModalOpen, setCreateProjectModalOpen] = useState(false);
  const {
    executeProtectedAction,
    showWalletModal,
    closeWalletModal,
    handleWalletConnected,
  } = useProtectedAction({
    actionName: ACTIONS.CREATE_PROJECT,
    onSuccess: () => setCreateProjectModalOpen(true),
  });

  const isDev = process.env.NODE_ENV !== 'production';

  return (
    <>
      {isDev && (
        <BoundlessButton
          variant='outline'
          size='sm'
          onClick={() =>
            executeProtectedAction(() => setCreateProjectModalOpen(true))
          }
          className='border-white/20 transition-all duration-200'
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
          <Plus className='mr-2 h-4 w-4' />
          Add Project
        </BoundlessButton>
      )}

      <Link
        href='/auth?mode=signin'
        className='inline-flex h-8 items-center justify-center gap-2 rounded-[10px] bg-[#a7f950] px-3 text-sm font-medium whitespace-nowrap text-black shadow-sm shadow-[#a7f950]/20 transition-all hover:bg-[#a7f950]/90'
      >
        Sign In
      </Link>

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

  return (
    <div className='md:hidden'>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <BoundlessButton
            variant='outline'
            size='sm'
            aria-label='Open navigation menu'
            className='border-white/20 transition-all duration-200'
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
          className='flex w-full flex-col border-l border-white/10 bg-[#030303] sm:max-w-md'
          showCloseButton={true}
        >
          <div className='flex flex-1 flex-col gap-6 overflow-y-auto pb-6'>
            {/* User Info (if authenticated) */}
            {isAuthenticated && user && (
              <div className='flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/8'>
                <Avatar className='h-10 w-10 border border-white/10'>
                  <AvatarImage
                    src={user?.image || user?.profile?.avatar || ''}
                    alt={displayName}
                  />
                  <AvatarFallback className='bg-white/10 text-white/80'>
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
                <div className='min-w-0 flex-1'>
                  <p className='truncate text-sm font-medium text-white'>
                    {displayName}
                  </p>
                  <p className='truncate text-xs text-white/60'>
                    {user?.email}
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Links */}
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
                      'rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'border'
                        : 'text-white/70 hover:border hover:border-white/10 hover:bg-white/5 hover:text-white/90'
                    )}
                    style={
                      isActive
                        ? {
                            backgroundColor: `${BRAND_COLOR}1A`,
                            color: BRAND_COLOR,
                            borderColor: `${BRAND_COLOR}33`,
                          }
                        : undefined
                    }
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Actions - Only for authenticated users */}
            {isAuthenticated && (
              <div className='flex flex-col gap-3 border-t border-white/10 pt-6'>
                {isLoading ? (
                  <LoadingSkeleton />
                ) : (
                  <>
                    <WalletButton />
                    {user?.username && (
                      <Link
                        href={`/profile/${user.username}`}
                        onClick={() => setIsOpen(false)}
                      >
                        <BoundlessButton variant='outline' className='w-full'>
                          <User className='mr-2 h-4 w-4' />
                          Profile
                        </BoundlessButton>
                      </Link>
                    )}
                    <Link href='/me/settings' onClick={() => setIsOpen(false)}>
                      <BoundlessButton variant='outline' className='w-full'>
                        <Settings className='mr-2 h-4 w-4' />
                        Settings
                      </BoundlessButton>
                    </Link>
                    <BoundlessButton
                      variant='outline'
                      className='w-full border-red-500/50 text-red-400 hover:bg-red-500/10'
                      onClick={() => {
                        logout();
                        setIsOpen(false);
                      }}
                    >
                      <LogOut className='mr-2 h-4 w-4' />
                      Sign Out
                    </BoundlessButton>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Sign Up / Sign In Buttons - Fixed at bottom for unauthenticated users */}
          {!isAuthenticated && (
            <div className='mt-auto flex flex-col gap-3 border-t border-white/10 pt-6 pb-6'>
              <Link
                href='/auth?mode=signup'
                onClick={() => setIsOpen(false)}
                className='inline-flex h-9 w-full items-center justify-center gap-2 rounded-[10px] bg-[#a7f950] px-4 py-2 text-sm font-medium whitespace-nowrap text-black shadow-sm shadow-[#a7f950]/20 transition-all hover:bg-[#a7f950]/90'
              >
                Get Started
              </Link>
              <Link
                href='/auth?mode=signin'
                onClick={() => setIsOpen(false)}
                className='inline-flex h-9 w-full items-center justify-center gap-2 rounded-[10px] border border-white/30 px-4 py-2 text-sm font-medium whitespace-nowrap text-white transition-all hover:border-white/40 hover:bg-white/10'
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
