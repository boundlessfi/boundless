'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthContext } from '@/components/providers/AuthProvider';
import type { WalletBalance, WalletTransaction } from '@/types/wallet';

const SOCKET_URL = process.env.NEXT_PUBLIC_BETTER_AUTH_URL;

export interface WalletUpdatePayload {
  type: 'wallet:update';
  data: {
    balances: WalletBalance[];
    transactions: WalletTransaction[];
    address: string;
    walletType: 'smart' | 'custodial';
    syncedCount: number;
    source?: 'watcher' | 'cron';
    timestamp: string;
  };
  timestamp: string;
}

interface UseWalletRealtimeOptions {
  onUpdate: (payload: WalletUpdatePayload) => void;
  enabled?: boolean;
}

/**
 * Hook that subscribes to real-time wallet updates via WebSocket.
 * Connects to the /realtime namespace and listens for `wallet:update` events
 * pushed by WalletWatcherService or WalletSyncCron on the backend.
 */
export function useWalletRealtime({
  onUpdate,
  enabled = true,
}: UseWalletRealtimeOptions) {
  const { session } = useAuthContext();
  const userId = session.data?.user?.id;
  const socketRef = useRef<Socket | null>(null);
  const onUpdateRef = useRef(onUpdate);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const reconnectAttempts = useRef(0);

  // Keep callback ref fresh
  onUpdateRef.current = onUpdate;

  const connect = useCallback(() => {
    if (!userId || !enabled || !SOCKET_URL) return;
    if (socketRef.current?.connected) return;

    // Disconnect any stale socket
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const socket = io(`${SOCKET_URL}/realtime`, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      autoConnect: true,
      query: { userId },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1_000,
      reconnectionDelayMax: 10_000,
    });

    socket.on('connect', () => {
      reconnectAttempts.current = 0;
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('wallet:update', (payload: WalletUpdatePayload) => {
      setLastUpdate(
        payload.data?.timestamp ?? payload.timestamp ?? new Date().toISOString()
      );
      onUpdateRef.current(payload);
    });

    socket.on('connect_error', () => {
      reconnectAttempts.current += 1;
      setIsConnected(false);
    });

    socketRef.current = socket;
  }, [userId, enabled]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return { isConnected, lastUpdate };
}
