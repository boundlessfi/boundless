'use client';

import { useParams, useRouter } from 'next/navigation';
import {
  Search,
  ArrowUpDown,
  ChevronDown,
  Archive,
  PencilLine,
  Dot,
  ArrowUpRight,
  Plus,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import { BoundlessButton } from '@/components/buttons';
import { Badge } from '@/components/ui/badge';

export default function HackathonsPage() {
  const params = useParams();
  const organizationId = params.id as string;
  const router = useRouter();
  return (
    <div className='flex min-h-screen flex-col bg-black text-white'>
      <div className='flex-1'>
        <main className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
          {/* Header Section */}
          <div className='mb-8'>
            <h1
              className='mb-6 text-left text-2xl font-normal text-white'
              style={{ fontFamily: 'sans-serif' }}
            >
              Manage Hackathons
            </h1>

            <div className='flex items-center gap-3'>
              <div className='relative flex-1'>
                <Search className='absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400' />
                <Input
                  type='search'
                  placeholder='Search'
                  className='border-gray-700 bg-transparent pl-10 text-white placeholder:text-gray-400'
                />
              </div>

              <Select>
                <SelectTrigger className='w-[120px] border-gray-700 bg-transparent text-white'>
                  <ArrowUpDown className='mr-2 size-4' />
                  <SelectValue placeholder='Sort' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='newest'>Newest</SelectItem>
                  <SelectItem value='oldest'>Oldest</SelectItem>
                </SelectContent>
              </Select>

              <Select>
                <SelectTrigger className='w-[120px] border-gray-700 bg-transparent text-white'>
                  <SelectValue placeholder='Status' />
                  <ChevronDown className='ml-2 size-4' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All</SelectItem>
                  <SelectItem value='open'>Open</SelectItem>
                  <SelectItem value='draft'>Draft</SelectItem>
                </SelectContent>
              </Select>

              <Select>
                <SelectTrigger className='w-[120px] border-gray-700 bg-transparent text-white'>
                  <SelectValue placeholder='Category' />
                  <ChevronDown className='ml-2 size-4' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All</SelectItem>
                  <SelectItem value='web3'>Web3</SelectItem>
                  <SelectItem value='defi'>DeFi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Hackathon Cards */}
          <div className='space-y-4'>
            {/* Display when empty */}
            <div className='border-active-bg2 hidden rounded-lg border-2 border-dashed p-4 py-20'>
              <Link
                href={`/organizations/${organizationId}/hackathons/new`}
                className='text-primary flex h-full items-center justify-center text-xs font-medium'
              >
                <span>Host Hackathon</span>
                <Plus className='size-5' />
              </Link>
            </div>
            <Card
              className='bg-background hover:border-primary/40 cursor-pointer !rounded-none !rounded-t-[6px] !rounded-b-[20px] border-gray-900 p-0 transition-all duration-300'
              onClick={() =>
                router.push(`/organizations/${organizationId}/hackathons/1`)
              }
            >
              <CardContent className='flex flex-col p-0'>
                <div className='bg-background-card flex items-start justify-between rounded-t-[6px] rounded-b-[20px] p-5'>
                  <div className='flex-1'>
                    <div className='mb-4 flex items-center gap-3'>
                      <div className='text-primary flex items-center gap-2 px-2 py-1 text-xs'>
                        <Archive className='size-3' />
                        <span>Saved as draft</span>
                      </div>
                    </div>

                    <h2 className='mb-4 text-xl font-medium text-white'>
                      Hackathon Title
                    </h2>

                    <div className='flex items-center gap-4'>
                      <div className='bg-active-bg h-2 flex-1 overflow-hidden rounded-full'>
                        <div
                          className='h-full rounded-full bg-[#a7f950]'
                          style={{ width: '43%' }}
                        />
                      </div>
                      <span className='text-sm text-gray-300'>
                        43% complete
                      </span>
                    </div>
                  </div>
                </div>
                <div className='flex justify-end p-5'>
                  <BoundlessButton
                    variant='default'
                    size='lg'
                    className='ml-4 gap-2'
                  >
                    Continue Editing
                    <PencilLine className='size-4' />
                  </BoundlessButton>
                </div>
              </CardContent>
            </Card>
            <Card
              className='bg-background hover:border-primary/40 cursor-pointer !rounded-none !rounded-t-[6px] !rounded-b-[20px] border-gray-900 p-0 transition-all duration-300'
              onClick={() =>
                router.push(`/organizations/${organizationId}/hackathons/2`)
              }
            >
              <CardContent className='flex flex-col p-0'>
                <div className='bg-background-card flex items-start justify-between rounded-t-[6px] rounded-b-[20px] p-5'>
                  <div className='flex-1'>
                    <div className='mb-4 flex items-center gap-3'>
                      <Badge
                        className='bg-success-75 border-success-600 text-success-600 rounded-[4px] text-xs'
                        variant='outline'
                      >
                        <Dot className='' strokeWidth={6} />
                        OPEN
                      </Badge>
                      <span className='text-success-75 text-sm'>
                        About a month left
                      </span>
                    </div>

                    <h2 className='mb-4 text-xl font-medium text-white'>
                      Hackathon Title
                    </h2>

                    <div className='flex items-center gap-4 uppercase'>
                      <div>
                        <span className='font-medium text-white'>321</span>{' '}
                        <span className='text-sm text-gray-500'>
                          participants
                        </span>
                      </div>
                      <div>
                        <span className='font-medium text-white'>29</span>{' '}
                        <span className='text-sm text-gray-500'>
                          submissions
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='flex items-center justify-between p-5'>
                  <div className='flex items-center gap-2'>
                    <Image
                      src='/trophy.svg'
                      alt='Hackathon 1'
                      width={18}
                      height={18}
                    />
                    <span className='text-primary font-medium'>$3,000,000</span>
                    <span className='text-sm text-gray-300'>USDC</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <BoundlessButton
                      variant='outline'
                      size='lg'
                      className='ml-4 gap-2'
                    >
                      Preview
                      <ArrowUpRight className='size-4' />
                    </BoundlessButton>
                    <BoundlessButton
                      variant='default'
                      size='lg'
                      className='ml-4 gap-2'
                    >
                      Manage
                    </BoundlessButton>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
