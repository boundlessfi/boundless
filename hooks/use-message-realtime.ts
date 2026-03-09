'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Message } from '@/types/messages';
import { reportError } from '@/lib/error-reporting';

interface MessageNewPayload {
  conversationId: string;
  message: Message;
}

interface UseMessageRealtimeOptions {
  conversationId: string;
  enabled?: boolean;
  onMessage: (message: Message) => void;
  userId?: string;
}

export function useMessageRealtime({
  conversationId,
  enabled = true,
  onMessage,
  userId,
}: UseMessageRealtimeOptions): void {
  const socketRef = useRef<Socket | null>(null);
  const onMessageRef = useRef(onMessage);
  const conversationIdRef = useRef(conversationId);
  const subscribeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  onMessageRef.current = onMessage;
  conversationIdRef.current = conversationId;

  useEffect(() => {
    if (!enabled || !conversationId) return;

    // Messages Socket.IO lives on the same server as the REST API (boundless-nestjs)
    let baseUrl =
      process.env.NEXT_PUBLIC_API_URL || 'https://staging-api.boundlessfi.xyz';
    baseUrl = baseUrl.replace(/\/$/, '').replace(/\/api$/i, '');
    if (!baseUrl) return;

    const socket = io(`${baseUrl}/messages`, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      auth: {
        userId: userId ?? undefined,
        conversationId,
      },
      query: userId ? { userId, conversationId } : { conversationId },
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      const cid = conversationIdRef.current;
      const doSubscribe = () =>
        socket.emit('subscribe-conversation', { conversationId: cid });
      subscribeTimeoutRef.current = setTimeout(doSubscribe, 150);
      socket.once('error', (payload: { message?: string; code?: string }) => {
        if (
          payload?.code === 'auth_pending' ||
          payload?.message?.includes('Unauthorized or missing conversationId')
        ) {
          setTimeout(doSubscribe, 300);
        }
      });
    });

    socket.on('disconnect', () => {});

    socket.on('connect_error', (error: Error) => {
      reportError(error, { context: 'message-realtime-socket' });
    });

    socket.on('message:new', (payload: MessageNewPayload) => {
      if (payload.conversationId !== conversationIdRef.current) return;
      onMessageRef.current(payload.message);
    });

    return () => {
      if (subscribeTimeoutRef.current) {
        clearTimeout(subscribeTimeoutRef.current);
        subscribeTimeoutRef.current = null;
      }
      socket.off('error');
      socket.emit('unsubscribe-conversation', { conversationId });
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('message:new');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [conversationId, enabled, userId]);
}
