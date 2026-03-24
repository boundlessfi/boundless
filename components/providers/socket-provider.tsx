'use client';

import React, { createContext, useContext } from 'react';
import { Socket } from 'socket.io-client';
import { useSocket } from '@/hooks/useSocket';
import { useAuthContext } from '@/components/providers/AuthProvider';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

interface SocketProviderProps {
  children: React.ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  // Get userId from shared auth context (single session source)
  const { session } = useAuthContext();
  const userId = session.data?.user?.id;

  // Use main namespace (/) for general WebSocket events
  const { socket, isConnected } = useSocket({
    namespace: '/',
    userId,
    autoConnect: true,
  });

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
};
