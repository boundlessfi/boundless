'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { Contributor } from '@/features/projects/types';
import { contributionsTableColumns } from './ContributionsTableColumns';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface ContributionsDataTableProps {
  data: Contributor[];
  loading?: boolean;
}

export function ContributionsDataTable({
  data,
  loading = false,
}: ContributionsDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'date', desc: true }, // Sort by date descending by default
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState('');

  const table = useReactTable({
    data,
    columns: contributionsTableColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'includesString',
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className='space-y-4'>
      {/* Search */}
      <div className='flex items-center gap-2'>
        <div className='relative max-w-sm flex-1'>
          <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-600' />
          <Input
            placeholder='Search contributors or messages...'
            value={globalFilter ?? ''}
            onChange={event => setGlobalFilter(String(event.target.value))}
            className='focus-visible:border-primary bg-background-card border-[#2B2B2B] pl-9 text-white placeholder:text-gray-600'
          />
        </div>
      </div>

      {/* Table */}
      <div className='bg-background-card rounded-lg border border-[#2B2B2B]'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow
                key={headerGroup.id}
                className='border-[#2B2B2B] hover:bg-transparent'
              >
                {headerGroup.headers.map(header => (
                  <TableHead
                    key={header.id}
                    className='font-medium text-[#B5B5B5]'
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
                  colSpan={contributionsTableColumns.length}
                  className='h-24 text-center'
                >
                  <div className='flex items-center justify-center'>
                    <div className='border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent' />
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className='border-[#2B2B2B] hover:bg-[#1A1A1A]'
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
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
                  colSpan={contributionsTableColumns.length}
                  className='h-24 text-center'
                >
                  <div className='flex flex-col items-center gap-2'>
                    <p className='text-gray-600'>No contributions yet</p>
                    <p className='text-xs text-[#B5B5B5]'>
                      Be the first to contribute to this project!
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {table.getRowModel().rows?.length > 0 && (
        <DataTablePagination table={table} loading={loading} />
      )}
    </div>
  );
}
