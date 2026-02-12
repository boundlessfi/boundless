'use client';
import React, { useEffect, useState } from 'react';
import {
  Package,
  Sun,
  HandHeart,
  Activity,
  Bell,
  Settings,
  Menu,
  User,
  LayoutDashboardIcon,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { fadeInUp, staggerContainer } from '@/lib/motion';
import { useAuth } from '@/hooks/use-auth';

const navigationItems = [
  {
    id: 'overview',
    label: 'Overview',
    icon: LayoutDashboardIcon,
    href: '/user',
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: Package,
    href: '/user/projects',
  },
  {
    id: 'campaigns',
    label: 'Campaigns',
    icon: Sun,
    href: '/user/campaigns',
  },
  {
    id: 'grants',
    label: 'Grants',
    icon: HandHeart,
    href: '/user/grants',
  },
  {
    id: 'activities',
    label: 'My Activities',
    icon: Activity,
    href: '/user/activities',
  },
];

const utilityItems = [
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    href: '/user/notifications',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    href: '/user/settings',
  },
];

const SidebarLayout: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Function to determine if a route is active
  const isRouteActive = (href: string) => {
    if (href === '/user') {
      return pathname === '/user';
    }
    return pathname.startsWith(href);
  };

  // Don't render anything until client-side hydration is complete
  if (!mounted) {
    return null;
  }

  return (
    <Sidebar className='bg-background' variant='floating'>
      <motion.div
        initial='hidden'
        animate='visible'
        variants={staggerContainer}
        className='bg-sidebar text-sidebar-foreground flex h-full flex-col'
      >
        <SidebarHeader className='bg-[#1C1C1C] px-3 pt-4 sm:pt-6 lg:pt-8'>
          <motion.div
            className='mb-4 flex items-center justify-between sm:mb-6'
            variants={fadeInUp}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Image
                src='/logo.svg'
                alt='logo'
                width={100}
                height={100}
                className='w-2/3 sm:w-3/4'
              />
            </motion.div>
            {/* Mobile Menu Trigger - Always visible on mobile */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <SidebarTrigger className='rounded-lg bg-[#2A2A2A] p-2 text-white transition-colors hover:text-gray-300 md:hidden'>
                <Menu className='h-5 w-5' />
              </SidebarTrigger>
            </motion.div>
          </motion.div>
          <SidebarGroup>
            <SidebarGroupContent>
              <motion.div
                className='flex items-center space-x-3'
                variants={fadeInUp}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Avatar className='h-8 w-8 sm:h-10 sm:w-10'>
                    <AvatarImage
                      src={user?.image || '/api/placeholder/40/40'}
                    />
                    <AvatarFallback className='bg-blue-500 text-white'>
                      {user?.profile?.firstName || user?.profile?.lastName ? (
                        <span className='text-xs font-semibold'>
                          {(user.profile?.firstName || user.profile?.lastName)
                            ?.charAt(0)
                            .toUpperCase()}
                        </span>
                      ) : (
                        <User className='h-3 w-3 text-white sm:h-4 sm:w-4' />
                      )}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
                <div className='min-w-0 flex-1'>
                  <p className='truncate text-xs font-semibold text-white sm:text-sm'>
                    {user?.profile?.firstName && user?.profile?.lastName
                      ? `${user.profile.firstName} ${user.profile.lastName}`
                      : user?.profile?.firstName ||
                        user?.profile?.lastName ||
                        user?.email ||
                        'User'}
                  </p>
                  {user?.email &&
                    (user?.profile?.firstName || user?.profile?.lastName) && (
                      <p className='truncate text-xs text-gray-400'>
                        {user.email}
                      </p>
                    )}
                </div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Badge
                    variant='secondary'
                    className='h-4 w-4 flex-shrink-0 rounded-full bg-[#2B2B2B] p-0 sm:h-5 sm:w-5'
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      width='10'
                      height='10'
                      viewBox='0 0 12 12'
                      fill='none'
                      className='h-2.5 w-2.5 sm:h-3 sm:w-3'
                    >
                      <path
                        d='M8.8166 2.70063C9.21811 2.32189 9.85061 2.33937 10.2297 2.74067C10.6086 3.14191 10.5904 3.77445 10.1896 4.15375L4.98945 9.06586C4.60405 9.42986 4.00082 9.42986 3.61543 9.06586L1.67207 7.22992C1.27059 6.8507 1.25282 6.21736 1.63203 5.81586C2.0113 5.41525 2.64389 5.397 3.04511 5.77582L4.30195 6.96235L8.8166 2.70063Z'
                        fill='#787878'
                      />
                    </svg>
                  </Badge>
                </motion.div>
              </motion.div>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarHeader>

        <SidebarContent className='bg-[#1C1C1C]'>
          {/* Main Navigation */}
          <SidebarGroup>
            <SidebarGroupLabel className='sr-only'>
              Navigation
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <motion.div variants={staggerContainer}>
                <SidebarMenu>
                  {navigationItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = isRouteActive(item.href);

                    return (
                      <motion.div
                        key={item.id}
                        variants={fadeInUp}
                        custom={index}
                      >
                        <SidebarMenuItem>
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <SidebarMenuButton
                              onClick={() => router.push(item.href)}
                              className={cn(
                                'relative flex w-full items-center space-x-2 overflow-hidden rounded-lg px-2 py-3 text-left transition-colors sm:space-x-3 sm:px-3 sm:py-5',
                                isActive
                                  ? 'bg-background text-white'
                                  : 'hover:bg-background/50 text-gray-400 hover:text-white'
                              )}
                            >
                              <Icon
                                className={cn(
                                  'h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5',
                                  isActive ? 'text-white' : 'text-gray-400'
                                )}
                              />
                              {isActive && (
                                <motion.span
                                  className='absolute top-1/2 left-0 h-6 w-[3px] -translate-y-1/2 rounded-r-[2px] bg-[#A7F950] sm:h-7'
                                  initial={{ scaleX: 0 }}
                                  animate={{ scaleX: 1 }}
                                  transition={{ delay: 0.1 }}
                                />
                              )}
                              <span className='truncate text-xs font-medium sm:text-sm'>
                                {item.label}
                              </span>
                            </SidebarMenuButton>
                          </motion.div>
                        </SidebarMenuItem>
                      </motion.div>
                    );
                  })}
                </SidebarMenu>
              </motion.div>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Utility Navigation */}
        <SidebarFooter className='border-t border-[#2A2A2A] bg-[#1C1C1C] pb-8 sm:pb-14'>
          <SidebarGroup>
            <SidebarGroupContent>
              <motion.div variants={staggerContainer}>
                <SidebarMenu>
                  {utilityItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = isRouteActive(item.href);

                    return (
                      <motion.div
                        key={item.id}
                        variants={fadeInUp}
                        custom={index}
                      >
                        <SidebarMenuItem>
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <SidebarMenuButton
                              onClick={() => router.push(item.href)}
                              className={cn(
                                'flex w-full items-center space-x-2 rounded-lg px-2 py-2 text-left transition-colors sm:space-x-3 sm:px-3',
                                isActive
                                  ? 'bg-[#2A2A2A]/50 text-white'
                                  : 'text-gray-400 hover:bg-[#2A2A2A]/50 hover:text-white'
                              )}
                            >
                              <Icon className='h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5' />
                              <span className='truncate text-xs font-medium sm:text-sm'>
                                {item.label}
                              </span>
                            </SidebarMenuButton>
                          </motion.div>
                        </SidebarMenuItem>
                      </motion.div>
                    );
                  })}
                </SidebarMenu>
              </motion.div>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarFooter>
      </motion.div>
    </Sidebar>
  );
};

export default SidebarLayout;
