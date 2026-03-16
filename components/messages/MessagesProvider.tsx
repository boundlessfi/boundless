'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import { useAuthStatus } from '@/hooks/use-auth';
import { TetherMessage } from '@/components/messages/TetherMessage';

interface MessagesContextValue {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  selectedConversationId: string | null;
  setSelectedConversationId: (id: string | null) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  openMessages: (options?: {
    conversationId?: string;
    trigger?: HTMLElement | null;
  }) => void;
}

const MessagesContext = createContext<MessagesContextValue | null>(null);

export function useMessages(): MessagesContextValue {
  const ctx = useContext(MessagesContext);
  if (!ctx) {
    throw new Error('useMessages must be used within MessagesProvider');
  }
  return ctx;
}

export function MessagesProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const { user } = useAuthStatus();
  const triggerRef = useRef<HTMLElement | null>(null);

  const openMessages = useCallback(
    (options?: { conversationId?: string; trigger?: HTMLElement | null }) => {
      if (options?.trigger) {
        triggerRef.current = options.trigger;
      }
      setSelectedConversationId(options?.conversationId ?? null);
      setIsOpen(true);
    },
    []
  );

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const value: MessagesContextValue = {
    isOpen,
    setIsOpen,
    selectedConversationId,
    setSelectedConversationId,
    triggerRef,
    openMessages,
  };

  return (
    <MessagesContext.Provider value={value}>
      {children}
      {user && selectedConversationId && (
        <TetherMessage
          triggerRef={triggerRef}
          isOpen={isOpen}
          onClose={handleClose}
          conversationId={selectedConversationId}
        />
      )}
    </MessagesContext.Provider>
  );
}
