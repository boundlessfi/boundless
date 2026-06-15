'use client';

import * as React from 'react';
import Link from 'next/link';
import { Plus, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { getMyCrowdfundingProjects } from '@/features/projects/api';
import { CrowdfundingCampaign } from '@/lib/api/types';
import { useAuthStatus } from '@/hooks/use-auth';
import { CrowdfundingDataTable } from '@/components/crowdfunding-data-table';
import EmptyState from '@/components/EmptyState';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function MyCrowdfundingPage() {
  const { user, isLoading: authLoading } = useAuthStatus();
  const [data, setData] = React.useState<CrowdfundingCampaign[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [hasFetched, setHasFetched] = React.useState(false);
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
      setError(null);
      const response = await getMyCrowdfundingProjects(page, limit);
      setData(response.data.data || []);
      if (response.meta?.pagination) {
        setPagination(response.meta.pagination);
      }
    } catch (err: any) {
      console.error('Failed to fetch crowdfunding campaigns:', err);
      setError(err.message || 'Failed to load campaigns. Please try again.');
    } finally {
      setLoading(false);
      setHasFetched(true);
    }
  }, []);

  React.useEffect(() => {
    if (user) {
      fetchCampaigns();
    } else if (!authLoading && !user) {
      setHasFetched(true);
      setError('Please log in to view your campaigns.');
    }
  }, [user, authLoading, fetchCampaigns]);

  const isTableLoading = loading || authLoading || (!hasFetched && !error);
  const hasEmptyState =
    hasFetched && !isTableLoading && !error && data.length === 0;

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
        {error && data.length > 0 && (
          <div className='bg-destructive/15 text-destructive flex items-center space-x-2 rounded-md p-3 text-sm'>
            <AlertCircle className='h-4 w-4' />
            <span>{error}</span>
          </div>
        )}

        {error && data.length === 0 ? (
          <div className='flex flex-col items-center justify-center space-y-4 py-16 text-center'>
            <AlertCircle className='text-destructive h-12 w-12' />
            <div className='space-y-2'>
              <h3 className='text-lg font-semibold'>
                Failed to load campaigns
              </h3>
              <p className='text-muted-foreground text-sm'>{error}</p>
            </div>
            <Button
              onClick={() => fetchCampaigns(pagination.page, pagination.limit)}
              variant='outline'
            >
              Try Again
            </Button>
          </div>
        ) : hasEmptyState ? (
          <EmptyState
            title="You haven't created any campaigns yet"
            description='Crowdfunding campaigns allow you to raise funds for your projects from the community. Start your first campaign today to bring your ideas to life.'
            action={
              <Button
                asChild
                className='bg-primary text-primary-foreground hover:bg-primary/90'
              >
                <Link href='/projects/create'>
                  <Plus className='mr-2 h-4 w-4' />
                  Create your first campaign
                </Link>
              </Button>
            }
          />
        ) : (
          <CrowdfundingDataTable
            data={data}
            pagination={pagination}
            onPaginationChange={fetchCampaigns}
            onDeleteSuccess={() =>
              fetchCampaigns(pagination.page, pagination.limit)
            }
            loading={isTableLoading}
          />
        )}
      </div>
    </Card>
  );
}
