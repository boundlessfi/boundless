import { useQuery } from '@tanstack/react-query';
import { qk } from '@/lib/smartwallet/query-keys';
import { ASSETS_LIST } from '@/lib/smartwallet/config';
import { fetchOrThrow } from '@/lib/smartwallet/errors';

export function useAssets() {
  return useQuery({
    queryKey: qk.assets(),
    queryFn: () => fetchOrThrow('/api/assets'),
    staleTime: 5 * 60_000,
    gcTime: 60 * 60_000,
    placeholderData: ASSETS_LIST,
    throwOnError: false,
  });
}
