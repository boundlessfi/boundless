'use client';

import * as React from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { getMyCrowdfundingProjects } from '@/features/projects/api';
import { CrowdfundingCampaign } from '@/lib/api/types';
import { useAuthStatus } from '@/hooks/use-auth';
import { CrowdfundingDataTable } from '@/components/crowdfunding-data-table';
import LoadingSpinner from '@/components/LoadingSpinner';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function MyCrowdfundingPage() {
  const { user } = useAuthStatus();
  const [data, setData] = React.useState<CrowdfundingCampaign[]>([]);
  const [pagination, setPagination] = React.useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = React.useState(false);

  const fetchCampaigns = React.useCallback(async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const response = await getMyCrowdfundingProjects(page, limit);
      setData(response.data.data || []);
      if (response.meta?.pagination) {
        setPagination(response.meta.pagination);
      }
    } catch {
      // Error handled by UI state
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (user) {
      fetchCampaigns();
    }
  }, [user, fetchCampaigns]);

  if (loading) {
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
              <Link href='/projects/create'>
                <Plus className='mr-2 h-4 w-4' />
                Create Campaign
              </Link>
            </Button>
          </div>
        </CardHeader>
      </div>

      <div className='mt-6 space-y-4'>
        <CrowdfundingDataTable
          data={data}
          pagination={pagination}
          onPaginationChange={fetchCampaigns}
          onDeleteSuccess={() =>
            fetchCampaigns(pagination.page, pagination.limit)
          }
          loading={loading}
        />
      </div>
    </Card>
  );
}
