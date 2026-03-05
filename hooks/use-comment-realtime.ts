'use client';

import { useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Comment, CommentEntityType, ReactionType } from '@/types/comment';
import { reportError } from '@/lib/error-reporting';

interface CommentRealtimeOptions {
  entityType: CommentEntityType;
  entityId: string;
  userId?: string;
  enabled?: boolean;
}

interface CommentRealtimeEvents {
  onCommentCreated: (comment: Comment) => void;
  onCommentUpdated: (comment: Comment) => void;
  onCommentDeleted: (commentId: string) => void;
  onReactionAdded: (data: {
    commentId: string;
    reactionType: ReactionType;
    userId: string;
  }) => void;
  onReactionRemoved: (data: {
    commentId: string;
    reactionType: ReactionType;
    userId: string;
  }) => void;
  onCommentStatusChanged: (data: { commentId: string; status: string }) => void;
}

export function useCommentRealtime(
  options: CommentRealtimeOptions,
  events: CommentRealtimeEvents
) {
  const { entityType, entityId, userId, enabled = true } = options;
  const socketRef = useRef<Socket | null>(null);
  const isConnectedRef = useRef(false);
  const eventsRef = useRef(events);

  // Update events ref when events change
  eventsRef.current = events;

  // Initialize socket connection to /realtime namespace
  useEffect(() => {
    if (!enabled) return;

    const baseUrl =
      process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
      (process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : '');
    if (!baseUrl) return;

    const socket = io(`${baseUrl}/realtime`, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      query: userId ? { userId } : undefined,
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      isConnectedRef.current = true;

      // Subscribe to entity updates
      socket.emit('subscribe-entity', {
        entityType,
        entityId,
      });
    });

    socket.on('disconnect', () => {
      isConnectedRef.current = false;
    });

    socket.on('connect_error', error => {
      reportError(error, { context: 'comment-realtime-socket' });
      isConnectedRef.current = false;
    });

    // Listen for entity updates
    socket.on(
      'entity-update',
      (update: {
        entityType: CommentEntityType;
        entityId: string;
        update: {
          type: string;
          data: any;
        };
      }) => {
        // Only process updates for the current entity
        if (update.entityType !== entityType || update.entityId !== entityId) {
          return;
        }

        const { type, data } = update.update;

        switch (type) {
          case 'comment-added':
            eventsRef.current.onCommentCreated(data as Comment);
            break;

          case 'comment-updated':
            eventsRef.current.onCommentUpdated(data as Comment);
            break;

          case 'comment-deleted':
            eventsRef.current.onCommentDeleted(data.commentId as string);
            break;

          case 'comment-status-changed':
            eventsRef.current.onCommentStatusChanged({
              commentId: data.commentId as string,
              status: data.status as string,
            });
            break;

          case 'reaction-added':
            eventsRef.current.onReactionAdded({
              commentId: data.commentId as string,
              reactionType: data.reactionType as ReactionType,
              userId: data.userId as string,
            });
            break;

          case 'reaction-removed':
            eventsRef.current.onReactionRemoved({
              commentId: data.commentId as string,
              reactionType: data.reactionType as ReactionType,
              userId: data.userId as string,
            });
            break;

          default:
            console.log('Unknown real-time event type:', type);
        }
      }
    );

    // Cleanup on unmount or when dependencies change
    return () => {
      if (socket) {
        // Unsubscribe from entity updates
        socket.emit('unsubscribe-entity', {
          entityType,
          entityId,
        });

        socket.off('connect');
        socket.off('disconnect');
        socket.off('connect_error');
        socket.off('entity-update');
        socket.disconnect();
      }
      socketRef.current = null;
      isConnectedRef.current = false;
    };
  }, [entityType, entityId, userId, enabled]);

  // Re-subscribe when entity changes
  useEffect(() => {
    if (socketRef.current && isConnectedRef.current && enabled) {
      // Unsubscribe from old entity
      socketRef.current.emit('unsubscribe-entity', {
        entityType: entityType,
        entityId: entityId,
      });

      // Subscribe to new entity
      socketRef.current.emit('subscribe-entity', {
        entityType,
        entityId,
      });
    }
  }, [entityType, entityId, enabled]);

  // Utility functions for emitting events (optional, mainly for optimistic updates)
  const emitCommentCreated = useCallback((comment: Comment) => {
    // Note: In the real-time system, the backend handles broadcasting
    // This is mainly for optimistic updates if needed
    console.log('Comment created:', comment);
  }, []);

  const emitReactionAdded = useCallback(
    (commentId: string, reactionType: ReactionType) => {
      // Note: In the real-time system, the backend handles broadcasting
      // This is mainly for optimistic updates if needed
      console.log('Reaction added:', { commentId, reactionType });
    },
    []
  );

  const emitReactionRemoved = useCallback(
    (commentId: string, reactionType: ReactionType) => {
      // Note: In the real-time system, the backend handles broadcasting
      // This is mainly for optimistic updates if needed
      console.log('Reaction removed:', { commentId, reactionType });
    },
    []
  );

  return {
    isConnected: isConnectedRef.current,
    emitCommentCreated,
    emitReactionAdded,
    emitReactionRemoved,
    socket: socketRef.current,
  };
}
