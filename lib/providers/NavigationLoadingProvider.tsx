'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface NavigationLoadingContextValue {
  isNavigating: boolean;
  setIsNavigating: (value: boolean) => void;
}

const NavigationLoadingContext = createContext<
  NavigationLoadingContextValue | undefined
>(undefined);

export const NavigationLoadingProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();

  // Clear loading state when pathname changes (navigation completes)
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  return (
    <NavigationLoadingContext.Provider
      value={{ isNavigating, setIsNavigating }}
    >
      {children}
    </NavigationLoadingContext.Provider>
  );
};

export const useNavigationLoading = (): NavigationLoadingContextValue => {
  const context = useContext(NavigationLoadingContext);
  if (!context) {
    throw new Error(
      'useNavigationLoading must be used within NavigationLoadingProvider'
    );
  }
  return context;
};
