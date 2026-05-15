'use client'; // if using Next.js 13+ App Router

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { reportError } from '@/lib/error-reporting';

const SOCKET_URL = process.env.NEXT_PUBLIC_BETTER_AUTH_URL;

interface UseSocketOptions {
  namespace?: string; // '/', '/notifications', '/realtime', '/chat'
  userId?: string;
  autoConnect?: boolean;
}

type ConnectionListener = (connected: boolean) => void;

interface CacheEntry {
  socket: Socket;
  refCount: number;
  connected: boolean;
  listeners: Set<ConnectionListener>;
  disconnectTimer: ReturnType<typeof setTimeout> | null;
}

// Module-level cache so multiple consumers (sidebar, bell, page) share a single
// socket per (namespace, userId). Prevents N parallel socket.io connections and
// the duplicate REST/socket fan-out that was hammering the backend.
const socketCache = new Map<string, CacheEntry>();

const DISCONNECT_GRACE_MS = 1000;

function getCacheKey(namespace: string, userId: string | undefined): string {
  return `${namespace}|${userId ?? ''}`;
}

function acquireSocket(
  namespace: string,
  userId: string | undefined,
  autoConnect: boolean
): CacheEntry {
  const key = getCacheKey(namespace, userId);
  const existing = socketCache.get(key);

  if (existing) {
    if (existing.disconnectTimer) {
      clearTimeout(existing.disconnectTimer);
      existing.disconnectTimer = null;
    }
    existing.refCount += 1;
    if (autoConnect && !existing.socket.connected) {
      existing.socket.connect();
    }
    return existing;
  }

  const socket = io(`${SOCKET_URL}${namespace}`, {
    transports: ['websocket', 'polling'],
    withCredentials: true,
    autoConnect,
    query: userId ? { userId } : undefined,
  });

  const entry: CacheEntry = {
    socket,
    refCount: 1,
    connected: socket.connected,
    listeners: new Set(),
    disconnectTimer: null,
  };

  socket.on('connect', () => {
    entry.connected = true;
    entry.listeners.forEach(listener => listener(true));
  });

  socket.on('disconnect', () => {
    entry.connected = false;
    entry.listeners.forEach(listener => listener(false));
  });

  socket.on('connect_error', error => {
    reportError(error, { context: 'websocket-connection' });
    entry.connected = false;
    entry.listeners.forEach(listener => listener(false));
  });

  socketCache.set(key, entry);
  return entry;
}

function releaseSocket(namespace: string, userId: string | undefined): void {
  const key = getCacheKey(namespace, userId);
  const entry = socketCache.get(key);
  if (!entry) return;

  entry.refCount -= 1;
  if (entry.refCount > 0) return;

  // Grace period to handle StrictMode double-mount and rapid route changes —
  // if a consumer re-mounts within the window, the disconnect is cancelled.
  entry.disconnectTimer = setTimeout(() => {
    const current = socketCache.get(key);
    if (!current || current.refCount > 0) return;
    current.socket.removeAllListeners();
    current.socket.disconnect();
    socketCache.delete(key);
  }, DISCONNECT_GRACE_MS);
}

export function useSocket(options: UseSocketOptions = {}) {
  const { namespace = '/', userId, autoConnect = true } = options;
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const entry = acquireSocket(namespace, userId, autoConnect);
    setSocket(entry.socket);
    setIsConnected(entry.connected);

    const listener: ConnectionListener = connected => setIsConnected(connected);
    entry.listeners.add(listener);

    return () => {
      entry.listeners.delete(listener);
      releaseSocket(namespace, userId);
      setSocket(null);
      setIsConnected(false);
    };
  }, [namespace, userId, autoConnect]);

  return {
    socket,
    isConnected,
  };
}
