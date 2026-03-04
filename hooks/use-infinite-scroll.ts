'use client';

import { useEffect, useRef } from 'react';

export interface UseInfiniteScrollOptions {
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
  rootMargin?: string;
  /** When true, logs observer lifecycle and skip reasons to console. Default: false. */
  debug?: boolean;
}

/**
 * Triggers onLoadMore when the sentinel element enters the viewport (or within rootMargin of it).
 * Pass the sentinel DOM element (e.g. from a callback ref + state) so the observer attaches after mount.
 * onLoadMore does not need to be memoized (useCallback); a ref is used internally.
 */
export const useInfiniteScroll: (
  sentinel: HTMLElement | null,
  options: UseInfiniteScrollOptions
) => void = (sentinel, options) => {
  const {
    onLoadMore,
    hasMore,
    loading,
    rootMargin = '0px 0px 400px 0px',
    debug = false,
  } = options;

  const onLoadMoreRef = useRef(onLoadMore);
  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  useEffect(() => {
    if (!sentinel) {
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        const [entry] = entries;
        const isIntersecting = !!entry?.isIntersecting;

        if (!isIntersecting) return;
        onLoadMoreRef.current?.();
      },
      {
        root: null,
        rootMargin,
        threshold: 0,
      }
    );

    observer.observe(sentinel);
    return () => {
      observer.disconnect();
    };
  }, [sentinel, hasMore, loading, rootMargin, debug]);
};
