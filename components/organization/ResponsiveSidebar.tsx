'use client';

import { Trophy, HandCoins, Settings, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent } from '@/components/ui/sheet';

interface ResponsiveSidebarProps {
  organizationId?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function ResponsiveSidebar({
  organizationId,
  open = false,
  onOpenChange,
}: ResponsiveSidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    {
      icon: Trophy,
      label: 'Hackathons',
      href: organizationId
        ? `/organizations/${organizationId}/hackathons`
        : '#',
    },
    {
      icon: HandCoins,
      label: 'Grants',
      href: organizationId ? `/organizations/${organizationId}/grants` : '#',
    },
    {
      icon: Settings,
      label: 'Settings',
      href: organizationId
        ? `/organizations/${organizationId}/settings`
        : '/organizations/new',
    },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side='left'
        className='w-[350px] border-r border-zinc-800 bg-black p-0 [&_[data-radix-sheet-close-icon]]:text-white'
      >
        <button
          onClick={() => onOpenChange?.(false)}
          className='absolute top-4 right-4 rounded-md p-2 transition hover:bg-zinc-800'
          aria-label='Close'
        >
          <X className='cursor-pointer text-white' />
        </button>

        <nav className='flex h-full flex-col gap-1 py-4'>
          <h3 className='mb-2 px-6 text-xs font-semibold tracking-wider text-zinc-500 uppercase'>
            Menu
          </h3>
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname?.startsWith(item.href + '/');

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => onOpenChange?.(false)}
                className={cn(
                  'flex items-center gap-3 px-6 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-r-primary bg-primary/10 text-primary border-r-4'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                )}
              >
                <Icon className='h-4 w-4' />
                {item.label}
              </Link>
            );
          })}

          <div className='mt-6 space-y-3 px-4'>
            <Link
              href={`/organizations/${organizationId}/hackathons/new`}
              onClick={() => onOpenChange?.(false)}
              className='flex items-center gap-3 px-3 py-2'
            >
              <div className='bg-primary grid h-6 w-6 flex-shrink-0 place-content-center rounded-full'>
                <Plus className='h-5 w-5 text-black' />
              </div>
              <span className='text-sm font-medium text-zinc-300'>
                Host Hackathon
              </span>
            </Link>
            <Link
              href={`/organizations/${organizationId}/grants/new`}
              onClick={() => onOpenChange?.(false)}
              className='flex items-center gap-3 px-3 py-2'
            >
              <div className='bg-primary grid h-6 w-6 flex-shrink-0 place-content-center rounded-full'>
                <Plus className='h-5 w-5 text-black' />
              </div>
              <span className='text-sm font-medium text-zinc-300'>
                Create Grant
              </span>
            </Link>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
