'use client';

import React, { useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  VoteEntityType,
  VoteCountResponse,
  VoteType,
  VoterDto,
} from '@/types/votes';
import { reportError } from '@/lib/error-reporting';

interface VoteRealtimeOptions {
  entityType: VoteEntityType;
  entityId: string;
  userId?: string;
  enabled?: boolean;
}

interface VoteRealtimeEvents {
  onVoteUpdated: (data: {
    voters: VoterDto[];
    voteCounts: VoteCountResponse;
    entityType: VoteEntityType;
    entityId: string;
  }) => void;
  onVoteCreated: (data: {
    voters: VoterDto[];
    voteCounts: VoteCountResponse;
    entityType: VoteEntityType;
    entityId: string;
  }) => void;
  onVoteDeleted: (data: {
    voters: VoterDto[];
    voteCounts: VoteCountResponse;
    entityType: VoteEntityType;
    entityId: string;
  }) => void;
}

export function useVoteRealtime(
  options: VoteRealtimeOptions,
  events: VoteRealtimeEvents
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
        entityType: 'project', // Always subscribe to project entity for votes
        entityId,
      });
    });

    socket.on('disconnect', () => {
      isConnectedRef.current = false;
    });

    socket.on('connect_error', error => {
      reportError(error, { context: 'vote-realtime-socket' });
      isConnectedRef.current = false;
    });

    // Listen for entity updates
    socket.on(
      'entity-update',
      (update: {
        entityType: string;
        entityId: string;
        update: {
          type: string;
          data: any;
        };
      }) => {
        // Only process updates for the current entity and vote-related updates
        if (update.entityType !== 'project' || update.entityId !== entityId) {
          return;
        }

        const { type, data } = update.update;

        switch (type) {
          case 'vote-updated':
          case 'vote-created':
          case 'vote-deleted':
            // For vote updates, the data contains voters and voteCounts
            if (data.voters && data.voteCounts) {
              eventsRef.current.onVoteUpdated({
                voters: data.voters,
                voteCounts: data.voteCounts,
                entityType: data.entityType || entityType,
                entityId: data.entityId || entityId,
              });
            }

            // Specific event handlers
            if (type === 'vote-created' && data.voters && data.voteCounts) {
              eventsRef.current.onVoteCreated({
                voters: data.voters,
                voteCounts: data.voteCounts,
                entityType: data.entityType || entityType,
                entityId: data.entityId || entityId,
              });
            }

            if (type === 'vote-deleted' && data.voters && data.voteCounts) {
              eventsRef.current.onVoteDeleted({
                voters: data.voters,
                voteCounts: data.voteCounts,
                entityType: data.entityType || entityType,
                entityId: data.entityId || entityId,
              });
            }
            break;

          default:
            // Ignore other update types
            break;
        }
      }
    );

    // Cleanup on unmount or when dependencies change
    return () => {
      if (socket) {
        // Unsubscribe from entity updates
        socket.emit('unsubscribe-entity', {
          entityType: 'project',
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
        entityType: 'project',
        entityId: entityId,
      });

      // Subscribe to new entity
      socketRef.current.emit('subscribe-entity', {
        entityType: 'project',
        entityId,
      });
    }
  }, [entityType, entityId, enabled]);

  // Utility function for optimistic updates (if needed)
  const emitVoteCreated = useCallback((voteData: any) => {
    // Note: In the real-time system, the backend handles broadcasting
    // This is mainly for optimistic updates if needed
    console.log('Vote created:', voteData);
  }, []);

  return {
    isConnected: isConnectedRef.current,
    emitVoteCreated,
    socket: socketRef.current,
  };
}

// Convenience hook for simpler vote count tracking
export function useRealtimeVoteCounts(
  entityType: VoteEntityType,
  entityId: string,
  userId?: string
) {
  const [voteData, setVoteData] = React.useState({
    voteCounts: {
      upvotes: 0,
      downvotes: 0,
      totalVotes: 0,
      userVote: null as VoteType | null,
    },
    voters: [] as VoterDto[],
  });

  const { isConnected } = useVoteRealtime(
    {
      entityType,
      entityId,
      userId,
      enabled: true,
    },
    {
      onVoteUpdated: data => {
        setVoteData({
          voteCounts: {
            upvotes: data.voteCounts.upvotes,
            downvotes: data.voteCounts.downvotes,
            totalVotes: data.voteCounts.totalVotes,
            userVote: null, // User vote not included in streamlined format
          },
          voters: data.voters,
        });
      },
      onVoteCreated: data => {
        setVoteData({
          voteCounts: {
            upvotes: data.voteCounts.upvotes,
            downvotes: data.voteCounts.downvotes,
            totalVotes: data.voteCounts.totalVotes,
            userVote: null, // User vote not included in streamlined format
          },
          voters: data.voters,
        });
      },
      onVoteDeleted: data => {
        setVoteData({
          voteCounts: {
            upvotes: data.voteCounts.upvotes,
            downvotes: data.voteCounts.downvotes,
            totalVotes: data.voteCounts.totalVotes,
            userVote: null, // User vote not included in streamlined format
          },
          voters: data.voters,
        });
      },
    }
  );

  return {
    voteCounts: voteData.voteCounts,
    voters: voteData.voters,
    isConnected,
  };
}
