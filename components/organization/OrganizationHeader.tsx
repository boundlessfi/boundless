'use client';
import {
  ChevronDown,
  Search,
  Bell,
  Plus,
  ChevronRight,
  Zap,
  Wallet,
  Copy,
  CheckCircle,
  Building2,
  LogOut,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import OrganizationSelector from './cards/OrganizationSelector';
import { useOrganization } from '@/lib/providers/OrganizationProvider';
import { cn } from '@/lib/utils';
import { useState, useMemo } from 'react';
import { useWallet } from '@/hooks/use-wallet';
import { useWalletContext } from '@/components/providers/wallet-provider';
import { formatAddress } from '@/lib/wallet-utils';
import { toast } from 'sonner';
import { UserMenu } from '@/components/user/UserMenu';

export default function OrganizationHeader() {
  const pathname = usePathname();
  const isOnOrganizationsPage = pathname === '/organizations';
  const { organizations, activeOrg, setActiveOrg } = useOrganization();
  const { handleConnect, handleDisconnect } = useWallet();
  const { walletAddress, walletName } = useWalletContext();
  const [copied, setCopied] = useState(false);

  // Show organization selector on org pages, but NOT on /organizations/new
  const showOrgSelector =
    pathname !== '/organizations' &&
    pathname !== '/organizations/new' &&
    pathname.startsWith('/organizations') &&
    organizations.length > 0;

  // Generate breadcrumbs from pathname
  const breadcrumbs = useMemo(() => {
    if (!pathname || pathname === '/organizations') return [];

    const parts = pathname.split('/').filter(Boolean);
    const crumbs: { label: string; href: string }[] = [];

    if (parts[0] === 'organizations') {
      crumbs.push({ label: 'Organizations', href: '/organizations' });

      if (parts[1] && parts[1] !== 'new') {
        if (activeOrg) {
          crumbs.push({
            label: activeOrg.name,
            href: `/organizations/${activeOrg._id}`,
          });
        }

        if (parts[2] === 'hackathons') {
          crumbs.push({ label: 'Hackathons', href: `#` });
        } else if (parts[2] === 'grants') {
          crumbs.push({ label: 'Grants', href: `#` });
        } else if (parts[2] === 'settings') {
          crumbs.push({ label: 'Settings', href: `#` });
        }
      } else if (parts[1] === 'new') {
        crumbs.push({ label: 'New Organization', href: '#' });
      }
    }

    return crumbs;
  }, [pathname, activeOrg]);

  // Quick actions based on context
  const quickActions = useMemo(() => {
    const actions = [];

    if (showOrgSelector && activeOrg) {
      actions.push({
        label: 'Host Hackathon',
        href: `/organizations/${activeOrg._id}/hackathons/new`,
        icon: Zap,
      });
    }

    if (!isOnOrganizationsPage) {
      actions.push({
        label: 'New Organization',
        href: '/organizations/new',
        icon: Building2,
      });
    }

    return actions;
  }, [showOrgSelector, activeOrg, isOnOrganizationsPage]);

  const handleCopyAddress = async () => {
    if (!walletAddress) return;

    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      toast.success('Address copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy address');
    }
  };

  const handleDisconnectClick = async () => {
    try {
      await handleDisconnect();
      toast.success('Wallet disconnected');
    } catch {
      toast.error('Failed to disconnect wallet');
    }
  };

  return (
    <header className='sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-zinc-800/50 bg-black/80 px-4 backdrop-blur-xl md:px-6'>
      {/* Left Section: Logo & Navigation */}
      <div className='flex min-w-0 flex-1 items-center gap-3'>
        <Link href='/' className='flex-shrink-0'>
          <Image
            src='/footer/logo.svg'
            width={36}
            height={36}
            alt='Boundless'
            className='transition-opacity hover:opacity-80'
          />
        </Link>

        {/* Divider */}
        <div className='h-6 w-px bg-zinc-800' />

        {/* Breadcrumbs */}
        <div className='flex min-w-0 items-center gap-1.5 overflow-hidden text-sm'>
          <Link
            href='/organizations'
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-2 py-1 transition-colors',
              isOnOrganizationsPage
                ? 'text-primary'
                : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-white'
            )}
          >
            <Building2 className='h-3.5 w-3.5 flex-shrink-0' />
            <span className='hidden truncate sm:inline'>Organizations</span>
          </Link>

          {breadcrumbs.slice(1).map((crumb, index) => (
            <div key={index} className='flex items-center gap-1.5'>
              <ChevronRight className='h-3.5 w-3.5 flex-shrink-0 text-zinc-700' />
              {index === breadcrumbs.slice(1).length - 1 ? (
                <span className='truncate font-medium text-white'>
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className='hover:text-primary truncate text-zinc-400 transition-colors'
                >
                  {crumb.label}
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Organization Selector - Compact */}
        {showOrgSelector && (
          <>
            <div className='hidden h-6 w-px bg-zinc-800 lg:block' />
            <div className='hidden flex-shrink-0 lg:block'>
              <OrganizationSelector
                organizations={organizations}
                currentOrganization={
                  activeOrg
                    ? {
                        _id: activeOrg._id,
                        name: activeOrg.name,
                        logo: activeOrg.logo,
                        tagline: activeOrg.tagline,
                        isProfileComplete: activeOrg.isProfileComplete,
                        role: 'owner',
                        memberCount: activeOrg.members.length,
                        hackathonCount: activeOrg.hackathons.length,
                        grantCount: activeOrg.grants.length,
                        createdAt: activeOrg.createdAt,
                      }
                    : undefined
                }
                onOrganizationChange={orgId => setActiveOrg(orgId)}
              />
            </div>
          </>
        )}
      </div>

      {/* Right Section: Actions & User */}
      <div className='flex items-center gap-2'>
        {/* Search - Desktop only */}
        <button
          onClick={() => {
            // TODO: Implement search functionality
          }}
          className='hidden items-center gap-2 rounded-lg border border-zinc-800/50 bg-zinc-900/30 px-3 py-1.5 text-sm text-zinc-400 transition-all hover:border-zinc-700 hover:bg-zinc-900/50 hover:text-white lg:flex lg:w-52 xl:w-64'
        >
          <Search className='h-4 w-4 flex-shrink-0' />
          <span className='flex-1 truncate text-left text-xs'>Search...</span>
          <kbd className='hidden rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-500 xl:inline'>
            ⌘K
          </kbd>
        </button>

        {/* Search - Mobile */}
        <button
          onClick={() => {
            // TODO: Implement search functionality
          }}
          className='flex items-center justify-center rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-2 text-zinc-400 transition-all hover:border-zinc-700 hover:bg-zinc-900/50 hover:text-white lg:hidden'
        >
          <Search className='h-4 w-4' />
        </button>

        {/* Quick Actions */}
        {quickActions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className='border-primary/30 from-primary/20 to-primary/10 text-primary hover:border-primary/50 hover:shadow-primary/20 flex items-center justify-center rounded-lg border bg-gradient-to-r p-2 transition-all hover:shadow-lg'>
                <Plus className='h-4 w-4' />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className='w-56 rounded-xl border border-zinc-800/50 bg-zinc-950/95 p-2 backdrop-blur-xl'
              align='end'
            >
              <DropdownMenuLabel className='px-2 text-xs font-semibold tracking-wider text-zinc-500 uppercase'>
                Quick Actions
              </DropdownMenuLabel>
              {quickActions.map(action => {
                const Icon = action.icon;
                return (
                  <DropdownMenuItem key={action.label} asChild>
                    <Link
                      href={action.href}
                      className='flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white transition-colors hover:bg-zinc-900/50 focus:bg-zinc-900/50'
                    >
                      <div className='bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg'>
                        <Icon className='text-primary h-4 w-4' />
                      </div>
                      <span className='font-medium'>{action.label}</span>
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className='relative flex items-center justify-center rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-2 text-zinc-400 transition-all hover:border-zinc-700 hover:bg-zinc-900/50 hover:text-white'>
              <Bell className='h-4 w-4' />
              <span className='bg-primary absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-black'>
                2
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-80 rounded-xl border border-zinc-800/50 bg-zinc-950/95 p-0 backdrop-blur-xl'
            align='end'
          >
            <div className='border-b border-zinc-800/50 p-4'>
              <div className='flex items-center justify-between'>
                <h3 className='font-semibold text-white'>Notifications</h3>
                <span className='bg-primary/20 text-primary rounded-full px-2 py-0.5 text-xs font-semibold'>
                  2 new
                </span>
              </div>
            </div>
            <div className='max-h-96 overflow-y-auto p-2'>
              <div className='rounded-lg p-3 transition-colors hover:bg-zinc-900/50'>
                <p className='text-sm text-white'>New submission received</p>
                <p className='mt-1 text-xs text-zinc-500'>2 minutes ago</p>
              </div>
              <div className='rounded-lg p-3 transition-colors hover:bg-zinc-900/50'>
                <p className='text-sm text-white'>
                  Hackathon deadline approaching
                </p>
                <p className='mt-1 text-xs text-zinc-500'>1 hour ago</p>
              </div>
            </div>
            <div className='border-t border-zinc-800/50 p-2'>
              <button className='text-primary w-full rounded-lg py-2 text-center text-sm font-medium transition-colors hover:bg-zinc-900/50'>
                View all notifications
              </button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Wallet Connection */}
        {walletAddress ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className='flex items-center gap-2 rounded-lg border border-zinc-800/50 bg-zinc-900/30 px-2.5 py-1.5 text-sm text-zinc-400 transition-all hover:border-zinc-700 hover:bg-zinc-900/50 hover:text-white'>
                <Wallet className='text-primary h-3.5 w-3.5' />
                <span className='hidden font-medium text-white sm:inline'>
                  {formatAddress(walletAddress, 3)}
                </span>
                <ChevronDown className='hidden h-3 w-3 text-zinc-500 sm:block' />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className='w-64 rounded-xl border border-zinc-800/50 bg-zinc-950/95 p-0 backdrop-blur-xl'
              align='end'
            >
              <div className='border-b border-zinc-800/50 p-4'>
                <div className='flex items-center gap-3'>
                  <div className='bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg'>
                    <Wallet className='text-primary h-5 w-5' />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-sm font-semibold text-white'>
                      {walletName || 'Wallet'}
                    </p>
                    <p className='truncate text-xs text-zinc-500'>
                      {formatAddress(walletAddress, 6)}
                    </p>
                  </div>
                </div>
              </div>

              <div className='p-2'>
                <div className='mb-2 rounded-lg bg-zinc-900/50 p-3'>
                  <div className='mb-1 text-xs font-medium text-zinc-500'>
                    Address
                  </div>
                  <div className='flex items-center gap-2'>
                    <code className='flex-1 truncate font-mono text-xs text-zinc-300'>
                      {walletAddress}
                    </code>
                    <button
                      onClick={handleCopyAddress}
                      className='flex-shrink-0 rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white'
                      title={copied ? 'Copied!' : 'Copy address'}
                    >
                      {copied ? (
                        <CheckCircle className='h-3.5 w-3.5 text-green-500' />
                      ) : (
                        <Copy className='h-3.5 w-3.5' />
                      )}
                    </button>
                  </div>
                </div>

                <DropdownMenuItem
                  onClick={handleDisconnectClick}
                  className='rounded-lg px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10 focus:bg-red-500/10'
                >
                  <LogOut className='mr-3 h-4 w-4' />
                  Disconnect Wallet
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <button
            onClick={handleConnect}
            className='border-primary/30 from-primary/20 to-primary/10 text-primary hover:border-primary/50 hover:shadow-primary/20 flex items-center gap-2 rounded-lg border bg-gradient-to-r px-3 py-1.5 text-sm font-medium transition-all hover:shadow-lg'
          >
            <Wallet className='h-3.5 w-3.5' />
            <span className='hidden sm:inline'>Connect Wallet</span>
          </button>
        )}

        {/* User Menu */}
        <UserMenu hideOrganizationsItem={isOnOrganizationsPage} />
      </div>
    </header>
  );
}
