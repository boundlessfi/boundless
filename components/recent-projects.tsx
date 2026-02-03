'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Package } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import * as React from 'react';

import Image from 'next/image';

interface Project {
  id: string;
  title: string;
  vision: string;
  category: string;
  status: string;
  banner?: string | null;
  logo?: string | null;
  createdAt: string;
}

interface RecentProjectsProps {
  projects: Project[];
  maxDisplay?: number;
}

export function RecentProjects({
  projects,
  maxDisplay = 5,
}: RecentProjectsProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const { displayProjects, hasMoreProjects } = React.useMemo(() => {
    const sorted = [...projects].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return {
      displayProjects: sorted.slice(0, maxDisplay),
      hasMoreProjects: sorted.length > maxDisplay,
    };
  }, [projects, maxDisplay]);

  // Map project status to display status
  const mapProjectStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case 'campaigning':
        return 'Funding';
      case 'idea':
        return 'Validation';
      case 'completed':
        return 'Completed';
      case 'live':
        return 'Funded';
      case 'reviewing':
        return 'Reviewing';
      default:
        return 'Not sure';
    }
  };

  // Get status badge specific classes
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'campaigning':
        return 'bg-blue-500/15 text-blue-500 hover:bg-blue-500/25 border-blue-500/20';
      case 'idea':
        return 'bg-yellow-500/15 text-yellow-500 hover:bg-yellow-500/25 border-yellow-500/20';
      case 'completed':
        return 'bg-green-500/15 text-green-500 hover:bg-green-500/25 border-green-500/20';
      case 'live':
        return 'bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 border-emerald-500/20';
      case 'reviewing':
        return 'bg-purple-500/15 text-purple-500 hover:bg-purple-500/25 border-purple-500/20';
      default:
        return 'bg-gray-500/15 text-gray-500 hover:bg-gray-500/25 border-gray-500/20';
    }
  };

  const columns = React.useMemo<ColumnDef<Project>[]>(
    () => [
      {
        accessorKey: 'title',
        header: ({ column }) => {
          return (
            <Button
              variant='ghost'
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
              className='text-foreground hover:bg-muted/50 h-auto p-0 font-medium'
            >
              Project
              <ArrowUpDown className='ml-2 h-4 w-4' />
            </Button>
          );
        },
        cell: ({ row }) => {
          const project = row.original;
          const imageUrl = project.logo || project.banner;
          return (
            <div className='flex items-center space-x-3'>
              {imageUrl &&
                imageUrl !== '' &&
                !imageUrl.includes('example.com') && (
                  <Image
                    width={32}
                    height={32}
                    src={imageUrl}
                    alt={project.title}
                    className='h-8 w-8 rounded-lg object-cover'
                    onError={e => {
                      // Hide the image if it fails to load
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
              <div>
                <div className='text-foreground font-medium'>
                  {project.title}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'category',
        header: ({ column }) => {
          return (
            <Button
              variant='ghost'
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
              className='text-foreground hover:bg-muted/50 h-auto p-0 font-medium'
            >
              Category
              <ArrowUpDown className='ml-2 h-4 w-4' />
            </Button>
          );
        },
        cell: ({ row }) => {
          return (
            <div className='text-foreground text-sm'>
              {row.original.category}
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: ({ column }) => {
          return (
            <Button
              variant='ghost'
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
              className='text-foreground hover:bg-muted/50 h-auto p-0 font-medium'
            >
              Status
              <ArrowUpDown className='ml-2 h-4 w-4' />
            </Button>
          );
        },
        cell: ({ row }) => {
          const status = mapProjectStatus(row.original.status);
          return (
            <Badge
              variant='outline'
              className={`border text-xs ${getStatusColor(row.original.status)}`}
            >
              {status}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: ({ column }) => {
          return (
            <Button
              variant='ghost'
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
              className='text-foreground hover:bg-muted/50 h-auto p-0 font-medium'
            >
              Created
              <ArrowUpDown className='ml-2 h-4 w-4' />
            </Button>
          );
        },
        cell: ({ row }) => {
          return (
            <div className='text-muted-foreground text-sm'>
              {format(new Date(row.original.createdAt), 'MMM dd, yyyy')}
            </div>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: displayProjects,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  if (displayProjects.length === 0) {
    return (
      <Card className='bg-background border-border/10'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-white'>
            <Package className='h-5 w-5' />
            Recent Projects
          </CardTitle>
          <CardDescription className='text-white/70'>
            Your latest project creations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='py-8 text-center text-white/60'>
            <Package className='mx-auto mb-4 h-12 w-12 opacity-50' />
            <p>No projects yet</p>
            <p className='text-sm'>Create your first project to get started!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='bg-background border-border/10'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-white'>
          <Package className='h-5 w-5' />
          Recent Projects
        </CardTitle>
        <CardDescription className='text-white/70'>
          Your latest project creations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='border-border bg-background rounded-md border'>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow
                  key={headerGroup.id}
                  className='border-border hover:bg-muted/50'
                >
                  {headerGroup.headers.map(header => {
                    return (
                      <TableHead key={header.id} className='text-foreground'>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map(row => (
                  <TableRow
                    key={row.id}
                    className='border-border hover:bg-muted/50'
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id} className='text-foreground'>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className='text-muted-foreground h-24 text-center'
                  >
                    No projects found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {hasMoreProjects && (
          <div className='pt-4'>
            <Button asChild variant='outline' className='w-full'>
              <Link
                href='/me/projects'
                className='flex items-center justify-center gap-2 text-white'
              >
                View All Projects
                <ArrowRight className='h-4 w-4' />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
