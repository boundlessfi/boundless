'use client';

import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Table } from '@tanstack/react-table';

interface CrowdfundingTableToolbarProps {
  table: Table<any>;
}

export function CrowdfundingTableToolbar({
  table,
}: CrowdfundingTableToolbarProps) {
  return (
    <div className='flex items-center py-4'>
      <Input
        placeholder='Filter campaigns...'
        value={
          (table.getColumn('project.title')?.getFilterValue() as string) ?? ''
        }
        onChange={event =>
          table.getColumn('project.title')?.setFilterValue(event.target.value)
        }
        className='bg-background border-border text-foreground placeholder:text-muted-foreground max-w-sm'
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='outline'
            className='bg-background border-border text-foreground hover:bg-muted/50 ml-auto'
          >
            Columns <ChevronDown className='ml-2 h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align='end'
          className='bg-background border-border'
        >
          {table
            .getAllColumns()
            .filter(column => column.getCanHide())
            .map(column => {
              return (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className='text-foreground hover:bg-muted/50 capitalize'
                  checked={column.getIsVisible()}
                  onCheckedChange={value => column.toggleVisibility(!!value)}
                >
                  {column.id === 'project.title'
                    ? 'Title'
                    : column.id === 'project.category'
                      ? 'Category'
                      : column.id === 'project.status'
                        ? 'Status'
                        : column.id === 'fundingRaised'
                          ? 'Funding Progress'
                          : column.id === 'fundingEndDate'
                            ? 'Deadline'
                            : column.id === 'createdAt'
                              ? 'Created'
                              : column.id}
                </DropdownMenuCheckboxItem>
              );
            })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
