import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function LeaderboardSkeleton() {
  return (
    <div className='overflow-hidden rounded-xl border border-zinc-800'>
      <Table>
        <TableHeader>
          <TableRow className='border-zinc-800 hover:bg-transparent'>
            <TableHead className='w-16 text-zinc-400'>Rank</TableHead>
            <TableHead className='text-zinc-400'>Contributor</TableHead>
            <TableHead className='text-zinc-400'>Tier</TableHead>
            <TableHead className='text-right text-zinc-400'>Score</TableHead>
            <TableHead className='text-right text-zinc-400'>
              Completed
            </TableHead>
            <TableHead className='text-right text-zinc-400'>Rate</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 10 }).map((_, i) => (
            <TableRow key={i} className='border-zinc-800'>
              <TableCell>
                <Skeleton className='h-4 w-8 bg-zinc-800' />
              </TableCell>
              <TableCell>
                <div className='flex items-center gap-3'>
                  <Skeleton className='h-9 w-9 rounded-full bg-zinc-800' />
                  <Skeleton className='h-4 w-32 bg-zinc-800' />
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className='h-5 w-20 rounded-md bg-zinc-800' />
              </TableCell>
              <TableCell className='text-right'>
                <Skeleton className='ml-auto h-4 w-16 bg-zinc-800' />
              </TableCell>
              <TableCell className='text-right'>
                <Skeleton className='ml-auto h-4 w-10 bg-zinc-800' />
              </TableCell>
              <TableCell className='text-right'>
                <Skeleton className='ml-auto h-4 w-12 bg-zinc-800' />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
