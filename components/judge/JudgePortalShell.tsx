'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { Gavel } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

/**
 * Judge portal shell. Distinct from the org dashboard on purpose:
 * minimal chrome, sticky top bar, no sidebar. The work happens in the
 * main column.
 */
export function JudgePortalShell({ children }: { children: ReactNode }) {
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const pathname = usePathname();

  return (
    <div className='min-h-screen bg-[#030303] text-white'>
      <header className='sticky top-0 z-30 border-b border-white/5 bg-[#030303]/85 backdrop-blur supports-[backdrop-filter]:bg-[#030303]/70'>
        <div className='mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6'>
          <Link
            href='/judge'
            className='group flex items-center gap-2 text-sm font-semibold tracking-tight'
          >
            <span className='bg-primary/15 text-primary inline-flex h-7 w-7 items-center justify-center rounded-md'>
              <Gavel className='h-3.5 w-3.5' />
            </span>
            <span className='leading-tight'>
              Judge Portal
              <span className='ml-2 hidden text-xs font-normal text-gray-600 sm:inline'>
                Boundless
              </span>
            </span>
          </Link>

          <nav className='flex items-center gap-1 text-sm text-gray-400'>
            <ShellLink
              href='/judge'
              active={pathname === '/judge'}
              label='Assignments'
            />
            <ShellLink
              href='/judge/invitations'
              active={pathname?.startsWith('/judge/invitations') ?? false}
              label='Invitations'
            />
            <span className='mx-2 hidden h-4 w-px bg-white/10 sm:inline-block' />
            <Link
              href='/'
              className='hidden rounded-md px-2 py-1 text-xs text-gray-500 hover:text-gray-200 sm:inline-block'
            >
              Exit portal
            </Link>
            {user && (
              <Avatar className='ml-2 h-7 w-7 border border-white/10'>
                <AvatarImage src={user.image ?? undefined} alt={user.name} />
                <AvatarFallback className='bg-white/5 text-[10px]'>
                  {(user.name ?? user.email ?? '?').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
          </nav>
        </div>
      </header>

      <main className='mx-auto max-w-6xl px-4 py-8 sm:px-6'>{children}</main>
    </div>
  );
}

function ShellLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'rounded-md px-2.5 py-1 transition-colors',
        active
          ? 'bg-white/8 text-white'
          : 'text-gray-400 hover:bg-white/5 hover:text-gray-100'
      )}
    >
      {label}
    </Link>
  );
}
