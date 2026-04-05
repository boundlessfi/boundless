'use client';

import * as React from 'react';
import Link from 'next/link';
import { AlertCircle, Plus, RefreshCw, Rocket } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { getMyCrowdfundingProjects } from '@/features/projects/api';
import { CrowdfundingCampaign } from '@/lib/api/types';
import { useAuthStatus } from '@/hooks/use-auth';
import { CrowdfundingDataTable } from '@/components/crowdfunding-data-table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
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
  const [initialLoading, setInitialLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchCampaigns = React.useCallback(async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMyCrowdfundingProjects(page, limit);
      setData(response.data.data || []);
      if (response.meta?.pagination) {
        setPagination(response.meta.pagination);
      }
    } catch (err) {
      console.error('[MyCrowdfundingPage] Failed to fetch campaigns:', err);
      setError('Failed to load your campaigns. Please try again.');
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (user) {
      fetchCampaigns();
    }
  }, [user, fetchCampaigns]);

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
        {initialLoading ? (
          <CardContent className='space-y-4'>
            <div className='flex items-center gap-2'>
              <Skeleton className='h-9 w-48' />
              <Skeleton className='ml-auto h-9 w-24' />
            </div>
            <div className='border-border rounded-md border'>
              <div className='space-y-0'>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className='border-border flex gap-4 border-b px-4 py-3 last:border-0'
                  >
                    <Skeleton className='h-4 w-4' />
                    <Skeleton className='h-4 flex-1' />
                    <Skeleton className='h-4 w-20' />
                    <Skeleton className='h-4 w-24' />
                    <Skeleton className='h-4 w-16' />
                    <Skeleton className='h-4 w-8' />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        ) : error ? (
          <CardContent>
            <div className='flex flex-col items-center justify-center gap-4 py-16 text-center'>
              <AlertCircle className='text-destructive h-12 w-12' />
              <div>
                <p className='text-foreground font-medium'>{error}</p>
                <p className='text-muted-foreground mt-1 text-sm'>
                  Check your connection and try again.
                </p>
              </div>
              <Button
                variant='outline'
                onClick={() =>
                  fetchCampaigns(pagination.page, pagination.limit)
                }
              >
                <RefreshCw className='mr-2 h-4 w-4' />
                Retry
              </Button>
            </div>
          </CardContent>
        ) : data.length === 0 && !loading ? (
          <CardContent>
            <div className='flex flex-col items-center justify-center gap-4 py-16 text-center'>
              <div className='bg-primary/10 rounded-full p-4'>
                <Rocket className='text-primary h-10 w-10' />
              </div>
              <div>
                <p className='text-foreground text-lg font-semibold'>
                  No campaigns yet
                </p>
                <p className='text-muted-foreground mt-1 max-w-sm text-sm'>
                  Crowdfunding campaigns let you raise funds from backers to
                  bring your project to life. Create your first one to get
                  started.
                </p>
              </div>
              <Button asChild className='bg-primary hover:bg-primary/90'>
                <Link href='/projects/create'>
                  <Plus className='mr-2 h-4 w-4' />
                  Create your first campaign
                </Link>
              </Button>
            </div>
          </CardContent>
        ) : (
          <CrowdfundingDataTable
            data={data}
            pagination={pagination}
            onPaginationChange={fetchCampaigns}
            onDeleteSuccess={() =>
              fetchCampaigns(pagination.page, pagination.limit)
            }
            loading={loading}
          />
        )}
      </div>
    </Card>
  );
}
