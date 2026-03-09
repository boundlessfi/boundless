'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';
import { useAuthStatus } from '@/hooks/use-auth';
import { MessagesSheet } from '@/components/messages/MessagesSheet';

interface MessagesContextValue {
  sheetOpen: boolean;
  setSheetOpen: (open: boolean) => void;
  selectedConversationId: string | null;
  setSelectedConversationId: (id: string | null) => void;
  openMessages: (conversationId?: string) => void;
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
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const { user } = useAuthStatus();

  const openMessages = useCallback((conversationId?: string) => {
    setSheetOpen(true);
    setSelectedConversationId(conversationId ?? null);
  }, []);

  const value: MessagesContextValue = {
    sheetOpen,
    setSheetOpen,
    selectedConversationId,
    setSelectedConversationId,
    openMessages,
  };

  return (
    <MessagesContext.Provider value={value}>
      {children}
      {user && (
        <MessagesSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          selectedConversationId={selectedConversationId}
          onSelectConversation={setSelectedConversationId}
        />
      )}
    </MessagesContext.Provider>
  );
}
