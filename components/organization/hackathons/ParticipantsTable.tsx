'use client';

import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Participant } from '@/lib/api/hackathons';
import { cn } from '@/lib/utils';
import { MoreHorizontal, Eye, Star, Award } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ParticipantsTableProps {
  data: Participant[];
  onReview?: (participant: Participant) => void;
  onViewTeam?: (participant: Participant) => void;
  onGrade?: (participant: Participant) => void;
  loading?: boolean;
}

export function ParticipantsTable({
  data,
  onReview,
  onViewTeam,
  onGrade,
  loading,
}: ParticipantsTableProps) {
  const columns = React.useMemo<ColumnDef<Participant>[]>(
    () => [
      {
        accessorKey: 'user',
        header: 'Participant',
        cell: ({ row }) => {
          const participant = row.original;
          const user = participant.user;
          return (
            <div className='flex items-center gap-3'>
              <Avatar className='h-9 w-9 border border-gray-800'>
                <AvatarImage src={user.profile.image} alt={user.profile.name} />
                <AvatarFallback className='bg-background-card text-xs'>
                  {user.profile.name?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className='flex flex-col'>
                <span className='font-medium text-white'>
                  {user.profile.name}
                </span>
                <span className='text-xs text-gray-400'>
                  @{user.profile.username}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'participationType',
        header: 'Type',
        cell: ({ row }) => {
          const type = row.getValue('participationType') as string;
          return (
            <Badge
              variant='outline'
              className={cn(
                'capitalize',
                type === 'team'
                  ? 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                  : 'border-purple-500/30 bg-purple-500/10 text-purple-400'
              )}
            >
              {type}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'submission',
        header: 'Status',
        cell: ({ row }) => {
          const submission = row.original.submission;
          if (!submission) {
            return (
              <Badge
                variant='outline'
                className='border-gray-800 text-gray-400'
              >
                Registered
              </Badge>
            );
          }

          const status = submission.status;
          return (
            <Badge
              variant='outline'
              className={cn(
                'capitalize',
                status === 'shortlisted'
                  ? 'border-green-500/30 bg-green-500/10 text-green-400'
                  : status === 'disqualified'
                    ? 'border-red-500/30 bg-red-500/10 text-red-400'
                    : 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400'
              )}
            >
              {status === 'shortlisted'
                ? 'Shortlisted'
                : status === 'disqualified'
                  ? 'Disqualified'
                  : 'Submitted'}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'registeredAt',
        header: 'Joined',
        cell: ({ row }) => {
          const date = row.getValue('registeredAt') as string;
          return (
            <span className='text-sm text-gray-400'>
              {format(new Date(date), 'MMM d, yyyy')}
            </span>
          );
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const participant = row.original;
          const hasSubmission = !!participant.submission;
          const isShortlisted =
            participant.submission?.status === 'shortlisted';

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  className='h-8 w-8 p-0 text-gray-400 hover:text-white'
                >
                  <span className='sr-only'>Open menu</span>
                  <MoreHorizontal className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align='end'
                className='bg-background-card w-[160px] border-gray-800 text-white'
              >
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator className='bg-gray-800' />
                {participant.participationType === 'team' && (
                  <DropdownMenuItem
                    className='hover:bg-background-card/50 cursor-pointer'
                    onClick={() => onViewTeam?.(participant)}
                  >
                    <Eye className='mr-2 h-4 w-4' />
                    <span>View Team</span>
                  </DropdownMenuItem>
                )}
                {hasSubmission && (
                  <DropdownMenuItem
                    className='hover:bg-background-card/50 cursor-pointer'
                    onClick={() => onReview?.(participant)}
                  >
                    <Star className='mr-2 h-4 w-4' />
                    <span>Review</span>
                  </DropdownMenuItem>
                )}
                {isShortlisted && (
                  <DropdownMenuItem
                    className='hover:bg-background-card/50 cursor-pointer'
                    onClick={() => onGrade?.(participant)}
                  >
                    <Award className='mr-2 h-4 w-4' />
                    <span>Grade</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [onReview, onViewTeam, onGrade]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className='bg-background/50 overflow-hidden rounded-lg border'>
      <Table>
        <TableHeader className='bg-background-card'>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow
              key={headerGroup.id}
              className='border-gray-900 hover:bg-transparent'
            >
              {headerGroup.headers.map(header => (
                <TableHead
                  key={header.id}
                  className='font-medium text-gray-400'
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className='h-24 text-center text-gray-500'
              >
                Loading participants...
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map(row => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                className='border-gray-900 hover:bg-gray-900/50'
              >
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className='h-24 text-center font-medium text-gray-500'
              >
                No participants found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
