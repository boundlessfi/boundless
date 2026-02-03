'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
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
  PaginationState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { CardContent } from '@/components/ui/card';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { CrowdfundingCampaign } from '@/lib/api/types';
import { getCrowdfundingTableColumns } from './crowdfunding-table-columns';
import { CrowdfundingTableToolbar } from './crowdfunding-table-toolbar';

interface CrowdfundingDataTableProps {
  data: CrowdfundingCampaign[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPaginationChange: (page: number, limit: number) => void;
  onDeleteSuccess?: () => void;
  loading?: boolean;
}

export function CrowdfundingDataTable({
  data,
  pagination,
  onPaginationChange,
  onDeleteSuccess,
  loading = false,
}: CrowdfundingDataTableProps) {
  const router = useRouter();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [paginationState, setPaginationState] = React.useState<PaginationState>(
    {
      pageIndex: pagination.page - 1, // TanStack uses 0-based indexing
      pageSize: pagination.limit,
    }
  );

  React.useEffect(() => {
    setPaginationState({
      pageIndex: pagination.page - 1,
      pageSize: pagination.limit,
    });
  }, [pagination.page, pagination.limit]);

  const columns = getCrowdfundingTableColumns(onDeleteSuccess);

  const table = useReactTable({
    data: data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: updater => {
      const newPagination =
        typeof updater === 'function' ? updater(paginationState) : updater;
      setPaginationState(newPagination);
      // Convert from 0-based to 1-based indexing for API call
      onPaginationChange(newPagination.pageIndex + 1, newPagination.pageSize);
    },
    onRowSelectionChange: setRowSelection,
    manualPagination: true,
    rowCount: pagination.total,
    pageCount: pagination.totalPages,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: paginationState,
    },
  });

  const handleRowClick = (campaign: CrowdfundingCampaign) => {
    router.push(`/me/crowdfunding/${campaign.slug}`);
  };

  return (
    <CardContent className='space-y-4'>
      <CrowdfundingTableToolbar table={table} />

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
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='text-muted-foreground h-24 text-center'
                >
                  Loading campaigns...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className='border-border hover:bg-muted/50 cursor-pointer'
                  onClick={() => handleRowClick(row.original)}
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
                  No campaigns found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} loading={loading} />
    </CardContent>
  );
}
