'use client';

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
import { Badge } from './ui/badge';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function NavMain({
  items,
  label,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
    badge?: string;
    badgeVariant?: 'default' | 'destructive' | 'outline';
  }[];
  label?: string;
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      {label && (
        <SidebarGroupLabel className='text-sidebar-foreground/70 px-2 text-xs font-semibold tracking-wider uppercase'>
          {label}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map(item => {
            const isActive =
              pathname === item.url || pathname?.startsWith(`${item.url}/`);

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={isActive}
                  className={cn(
                    'group transition-all duration-200',
                    isActive &&
                      'bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm'
                  )}
                >
                  <Link href={item.url} className='flex items-center gap-3'>
                    {item.icon && (
                      <item.icon
                        className={cn(
                          'transition-transform duration-200',
                          isActive && 'scale-110'
                        )}
                      />
                    )}
                    <span className='flex-1'>{item.title}</span>
                    {item.badge && (
                      <Badge
                        variant={item.badgeVariant || 'default'}
                        className='ml-auto h-5 min-w-5 rounded-full px-1.5 text-xs'
                      >
                        {item.badge}
                      </Badge>
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
}
