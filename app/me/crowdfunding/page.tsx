'use client';

import * as React from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useMyCampaigns } from '@/features/crowdfunding';
import { CrowdfundingDataTable } from '@/components/crowdfunding-data-table';
import LoadingSpinner from '@/components/LoadingSpinner';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function MyCrowdfundingPage() {
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);

  const { data, isLoading, refetch } = useMyCampaigns(page, limit);

  const campaigns = data?.data ?? [];
  const pagination = data?.pagination ?? {
    page,
    limit,
    total: 0,
    totalPages: 0,
  };

  if (isLoading) {
    return (
      <div className='mx-auto flex h-screen items-center justify-center py-10'>
        <LoadingSpinner size='xl' />
      </div>
    );
  }

  return (
    <Card className='bg-background border-border/10 container mx-auto py-10'>
      <div className='flex items-center justify-between space-y-2'>
        <CardHeader className='flex w-full items-center justify-between'>
          <div>
            <CardTitle className='text-foreground'>
              Campaigns Overview
            </CardTitle>
            <CardDescription className='text-muted-foreground'>
              A list of all your crowdfunding campaigns including their current
              status and funding progress.
            </CardDescription>
          </div>
          <div className='flex items-center space-x-2'>
            <Button asChild className='bg-primary hover:bg-primary/90'>
              <Link href='/crowdfunding/new'>
                <Plus className='mr-2 h-4 w-4' />
                Create Campaign
              </Link>
            </Button>
          </div>
        </CardHeader>
      </div>

      <div className='mt-6 space-y-4'>
        <CrowdfundingDataTable
          data={campaigns}
          pagination={pagination}
          onPaginationChange={(p, l) => {
            setPage(p);
            setLimit(l ?? limit);
          }}
          onDeleteSuccess={() => refetch()}
          loading={isLoading}
        />
      </div>
    </Card>
  );
}
