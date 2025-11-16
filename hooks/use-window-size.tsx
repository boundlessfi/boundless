'use client';

import { useState } from 'react';
import { useDebounceCallback } from './use-debounce-callback';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';
import * as React from 'react';

type WindowSize<T extends number | undefined = number | undefined> = {
  width: T;
  height: T;
};

type UseWindowSizeOptions<InitializeWithValue extends boolean | undefined> = {
  initializeWithValue: InitializeWithValue;
  debounceDelay?: number;
};

const IS_SERVER = typeof window === 'undefined';

// Compact event listener hook for resize events
function useEventListener(eventName: string, handler: () => void) {
  const savedHandler = React.useRef(handler);

  React.useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  React.useEffect(() => {
    if (IS_SERVER) return;
    const eventListener = () => savedHandler.current();
    window.addEventListener(eventName, eventListener);
    return () => window.removeEventListener(eventName, eventListener);
  }, [eventName]);
}

// SSR version of useWindowSize.
export function useWindowSize(options: UseWindowSizeOptions<false>): WindowSize;
// CSR version of useWindowSize.
export function useWindowSize(
  options?: Partial<UseWindowSizeOptions<true>>
): WindowSize<number>;
export function useWindowSize(
  options: Partial<UseWindowSizeOptions<boolean>> = {}
): WindowSize | WindowSize<number> {
  let { initializeWithValue = true } = options;
  if (IS_SERVER) {
    initializeWithValue = false;
  }

  const [windowSize, setWindowSize] = useState<WindowSize>(() => {
    if (initializeWithValue) {
      return {
        width: window.innerWidth,
        height: window.innerHeight,
      };
    }
    return {
      width: undefined,
      height: undefined,
    };
  });

  const debouncedSetWindowSize = useDebounceCallback((...args: unknown[]) => {
    const size = args[0] as WindowSize;
    setWindowSize(size);
  }, options.debounceDelay);

  function handleSize() {
    const newSize = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    if (options.debounceDelay) {
      debouncedSetWindowSize(newSize);
    } else {
      setWindowSize(newSize);
    }
  }

  useEventListener('resize', handleSize);

  // Set size at the first client-side load
  useIsomorphicLayoutEffect(() => {
    handleSize();
  }, []);

  return windowSize;
}
