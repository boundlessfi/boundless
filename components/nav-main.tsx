'use client';

import React from 'react';
import { type Icon } from '@tabler/icons-react';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const EXACT_MATCH_ROUTE = '/me';

export interface NavMainItem {
  title: string;
  url: string;
  icon?: Icon;
  badge?: string;
  badgeVariant?: 'default' | 'destructive' | 'outline';
}

export interface NavMainProps {
  items: NavMainItem[];
  label?: string;
}

export const NavMain = ({ items, label }: NavMainProps): React.ReactElement => {
  const pathname = usePathname();

  return (
    <SidebarGroup className='py-1'>
      {label && (
        <SidebarGroupLabel className='mb-0.5 px-3 text-[11px] font-medium tracking-wider text-white/25 uppercase'>
          {label}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu className='gap-0.5'>
          {items.map(item => {
            const normalizedUrl =
              item.url !== '/' && item.url.endsWith('/')
                ? item.url.slice(0, -1)
                : item.url;
            const isActive =
              pathname === normalizedUrl ||
              (normalizedUrl !== EXACT_MATCH_ROUTE &&
                pathname?.startsWith(`${normalizedUrl}/`));

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={isActive}
                  className={cn(
                    'h-8 transition-colors duration-150',
                    isActive
                      ? 'bg-white/8 font-medium text-white'
                      : 'text-white/45 hover:bg-white/4 hover:text-white/70'
                  )}
                >
                  <Link href={item.url} className='flex items-center gap-2.5'>
                    {item.icon && (
                      <item.icon className='shrink-0' size={18} stroke={1.5} />
                    )}
                    <span className='flex-1 text-sm'>{item.title}</span>
                    {item.badge && (
                      <span
                        className={cn(
                          'ml-auto flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1.5 text-[10px] leading-none font-semibold',
                          item.badgeVariant === 'destructive'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-primary/15 text-primary'
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
