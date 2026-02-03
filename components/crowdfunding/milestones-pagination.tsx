'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MilestonesPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function MilestonesPagination({
  currentPage,
  totalPages,
  onPageChange,
}: MilestonesPaginationProps) {
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, currentPage + 2);
  const pages = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );

  return (
    <div className='mt-8 flex items-center justify-center gap-2'>
      {/* Previous Button */}
      <Button
        variant='outline'
        size='sm'
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className='h-9'
      >
        <ChevronLeft className='h-4 w-4' />
      </Button>

      {/* Ellipsis - Start */}
      {startPage > 1 && (
        <>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => onPageChange(1)}
            className='h-9 w-9 p-0'
          >
            1
          </Button>
          {startPage > 2 && (
            <span className='text-muted-foreground px-1 text-xs'>...</span>
          )}
        </>
      )}

      {/* Page Numbers */}
      {pages.map(page => (
        <Button
          key={page}
          variant={currentPage === page ? 'default' : 'outline'}
          size='sm'
          onClick={() => onPageChange(page)}
          className={`h-9 w-9 p-0 ${
            currentPage === page
              ? 'border-amber-500 bg-amber-500 text-white hover:bg-amber-600'
              : ''
          }`}
        >
          {page}
        </Button>
      ))}

      {/* Ellipsis - End */}
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && (
            <span className='text-muted-foreground px-1 text-xs'>...</span>
          )}
          <Button
            variant='ghost'
            size='sm'
            onClick={() => onPageChange(totalPages)}
            className='h-9 w-9 p-0'
          >
            {totalPages}
          </Button>
        </>
      )}

      {/* Next Button */}
      <Button
        variant='outline'
        size='sm'
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className='h-9'
      >
        <ChevronRight className='h-4 w-4' />
      </Button>
    </div>
  );
}
