'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { ChartAreaInteractive } from '@/components/chart-area-interactive';
import { DataTable } from '@/components/data-table';
import { SectionCards } from '@/components/section-cards';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useAuthStatus } from '@/hooks/use-auth';
import data from '../app/dashboard/data.json';
import React, { useState } from 'react';
import { FamilyWalletButton } from '@/components/wallet/FamilyWalletButton';
import {
  FamilyWalletDrawer,
  DrawerView,
} from '@/components/wallet/FamilyWalletDrawer';

export function DashboardContent() {
  const { user, isLoading } = useAuthStatus();
  const [familyDrawerOpen, setFamilyDrawerOpen] = useState(false);
  const [drawerView, setDrawerView] = useState<DrawerView>('main');

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const { name = '', email = '', profile, image: userImage = '' } = user || {};
  const userData = {
    name: name || '',
    email,
    image: profile?.image || userImage,
  };

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar user={userData} variant='inset' />
      <SidebarInset className='bg-white'>
        <SiteHeader />
        <div className='flex flex-1 flex-col'>
          <div className='@container/main flex flex-1 flex-col gap-2'>
            <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
              <SectionCards />
              <div className='px-4 lg:px-6'>
                <ChartAreaInteractive />
              </div>
              <DataTable data={data} />
            </div>
          </div>
        </div>

        {/* Family Wallet Components */}
        <FamilyWalletButton
          onOpenDrawer={view => {
            if (view) setDrawerView(view);
            setFamilyDrawerOpen(true);
          }}
        />
        <FamilyWalletDrawer
          open={familyDrawerOpen}
          initialView={drawerView}
          onOpenChange={setFamilyDrawerOpen}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
