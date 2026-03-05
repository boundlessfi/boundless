'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import {
  getConversations,
  getConversation,
  getMessages,
  sendMessage,
  markConversationRead,
} from '@/lib/api/messages';
import { useMessageRealtime } from '@/hooks/use-message-realtime';
import { useAuthStatus } from '@/hooks/use-auth';
import type {
  Conversation,
  ConversationDetail,
  Message,
} from '@/types/messages';
import { ChevronLeft, MessageCircle, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { ApiError } from '@/lib/api/api';

const MAX_BODY_LENGTH = 10_000;

function isApiError(e: unknown): e is ApiError {
  return (
    e !== null &&
    typeof e === 'object' &&
    'message' in e &&
    typeof (e as ApiError).message === 'string'
  );
}

interface MessagesSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedConversationId: string | null;
  onSelectConversation: (id: string | null) => void;
}

export function MessagesSheet({
  open,
  onOpenChange,
  selectedConversationId,
  onSelectConversation,
}: MessagesSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side='right'
        className={cn(
          'bg-background-main-bg flex w-full flex-col border-[rgba(255,255,255,0.10)] p-0 sm:max-w-md'
        )}
        showCloseButton={true}
      >
        <SheetHeader className='shrink-0 border-b border-white/10 px-4 py-3'>
          <SheetTitle className='text-left text-lg font-semibold text-white'>
            Messages
          </SheetTitle>
        </SheetHeader>
        <div className='flex min-h-0 flex-1 flex-col overflow-hidden'>
          {selectedConversationId ? (
            <ThreadView
              conversationId={selectedConversationId}
              sheetOpen={open}
              onBack={() => onSelectConversation(null)}
            />
          ) : (
            <InboxView onSelectConversation={onSelectConversation} />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function InboxView({
  onSelectConversation,
}: {
  onSelectConversation: (id: string) => void;
}) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getConversations(50, 0);
      setConversations(res.data);
    } catch (e) {
      const msg = isApiError(e) ? e.message : 'Failed to load conversations';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  if (loading) {
    return (
      <div className='flex flex-1 items-center justify-center p-6'>
        <Loader2 className='h-8 w-8 animate-spin text-zinc-500' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex flex-1 flex-col items-center justify-center gap-3 p-6'>
        <p className='text-sm text-red-400'>{error}</p>
        <Button variant='outline' size='sm' onClick={fetchConversations}>
          Try again
        </Button>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className='flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center'>
        <MessageCircle className='h-12 w-12 text-zinc-600' />
        <p className='text-sm text-zinc-400'>No conversations yet</p>
        <p className='text-xs text-zinc-500'>
          Message someone from their profile to start a conversation.
        </p>
      </div>
    );
  }

  return (
    <div className='flex-1 overflow-y-auto'>
      {conversations.map(conv => (
        <button
          key={conv.id}
          type='button'
          onClick={() => onSelectConversation(conv.id)}
          className={cn(
            'flex w-full items-center gap-3 border-b border-white/5 px-4 py-3 text-left transition-colors hover:bg-white/5'
          )}
        >
          <Avatar className='h-10 w-10 shrink-0'>
            <AvatarImage src={conv.otherUser.avatarUrl ?? undefined} />
            <AvatarFallback className='bg-zinc-800 text-zinc-300'>
              {conv.otherUser.name?.slice(0, 2)?.toUpperCase() ?? '?'}
            </AvatarFallback>
          </Avatar>
          <div className='min-w-0 flex-1'>
            <div className='flex items-center justify-between gap-2'>
              <span className='truncate font-medium text-white'>
                {conv.otherUser.name || 'Unknown'}
              </span>
              {conv.lastMessage && (
                <span className='shrink-0 text-xs text-zinc-500'>
                  {formatDistanceToNow(new Date(conv.lastMessage.createdAt), {
                    addSuffix: false,
                  })}
                </span>
              )}
            </div>
            {conv.lastMessage && (
              <p className='truncate text-sm text-zinc-400'>
                {conv.lastMessage.body}
              </p>
            )}
          </div>
          {conv.unreadCount > 0 && (
            <span className='bg-primary text-primary-foreground flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-medium'>
              {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

function ThreadView({
  conversationId,
  sheetOpen,
  onBack,
}: {
  conversationId: string;
  sheetOpen: boolean;
  onBack: () => void;
}) {
  const { user } = useAuthStatus();
  const [conversation, setConversation] = useState<ConversationDetail | null>(
    null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastScrollBottomMessageId = useRef<string | null>(null);

  const currentUserId = (user as { id?: string } | null)?.id ?? null;

  const fetchThread = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [convRes, messagesRes] = await Promise.all([
        getConversation(conversationId),
        getMessages(conversationId, 50),
      ]);
      setConversation(convRes);
      setMessages(messagesRes.data);
      setHasMore(messagesRes.pagination.hasMore ?? false);
      setNextCursor(messagesRes.pagination.nextCursor ?? null);
      await markConversationRead(conversationId);
    } catch (e) {
      const msg = isApiError(e) ? e.message : 'Failed to load conversation';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    fetchThread();
  }, [fetchThread]);

  useEffect(() => {
    lastScrollBottomMessageId.current = null;
  }, [conversationId]);

  useMessageRealtime({
    conversationId,
    enabled: !!conversationId && sheetOpen,
    userId: currentUserId ?? undefined,
    onMessage: (message: Message) => {
      setMessages(prev =>
        prev.some(m => m.id === message.id) ? prev : [...prev, message]
      );
    },
  });

  // Scroll to bottom when a new message is added at the end (send or realtime)
  useEffect(() => {
    const lastId = messages.length ? messages[messages.length - 1]?.id : null;
    if (lastId && lastId !== lastScrollBottomMessageId.current) {
      lastScrollBottomMessageId.current = lastId;
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const loadOlder = useCallback(async () => {
    if (!nextCursor || loadingOlder) return;
    setLoadingOlder(true);
    try {
      const res = await getMessages(conversationId, 50, nextCursor);
      setMessages(prev => [...(res.data ?? []), ...prev]);
      setHasMore(res.pagination.hasMore ?? false);
      setNextCursor(res.pagination.nextCursor ?? null);
    } finally {
      setLoadingOlder(false);
    }
  }, [conversationId, nextCursor, loadingOlder]);

  const handleSend = useCallback(async () => {
    const trimmed = body.trim();
    if (!trimmed || sending || trimmed.length > MAX_BODY_LENGTH) return;
    setSendError(null);
    setSending(true);
    try {
      const sent = await sendMessage(conversationId, trimmed);
      setMessages(prev =>
        prev.some(m => m.id === sent.id) ? prev : [...prev, sent]
      );
      setBody('');
    } catch (e) {
      const msg = isApiError(e)
        ? e.message
        : e instanceof Error
          ? e.message
          : 'Failed to send message';
      setSendError(msg);
    } finally {
      setSending(false);
    }
  }, [body, conversationId, sending]);

  if (loading && !conversation) {
    return (
      <div className='flex flex-1 items-center justify-center p-6'>
        <Loader2 className='h-8 w-8 animate-spin text-zinc-500' />
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className='flex flex-1 flex-col items-center justify-center gap-3 p-6'>
        <p className='text-sm text-red-400'>
          {error ?? 'Conversation not found'}
        </p>
        <Button variant='outline' size='sm' onClick={onBack}>
          Back to inbox
        </Button>
      </div>
    );
  }

  return (
    <div className='flex flex-1 flex-col overflow-hidden'>
      <div className='flex shrink-0 items-center gap-2 border-b border-white/10 px-4 py-2'>
        <Button
          variant='ghost'
          size='icon'
          className='shrink-0 text-zinc-400 hover:text-white'
          onClick={onBack}
          aria-label='Back to inbox'
        >
          <ChevronLeft className='h-5 w-5' />
        </Button>
        <Avatar className='h-8 w-8 shrink-0'>
          <AvatarImage src={conversation.otherUser.avatarUrl ?? undefined} />
          <AvatarFallback className='bg-zinc-800 text-xs text-zinc-300'>
            {conversation.otherUser.name?.slice(0, 2)?.toUpperCase() ?? '?'}
          </AvatarFallback>
        </Avatar>
        <span className='min-w-0 truncate font-medium text-white'>
          {conversation.otherUser.name || 'Unknown'}
        </span>
      </div>

      <div className='flex min-h-0 flex-1 flex-col overflow-hidden'>
        <div className='flex-1 overflow-y-auto p-4'>
          {hasMore && (
            <div className='mb-2 flex justify-center'>
              <Button
                variant='ghost'
                size='sm'
                disabled={loadingOlder}
                onClick={loadOlder}
              >
                {loadingOlder ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  'Load older'
                )}
              </Button>
            </div>
          )}
          <div className='flex flex-col gap-2'>
            {messages.map(msg => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwn={msg.senderId === currentUserId}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className='shrink-0 border-t border-white/10 p-3'>
          {sendError && (
            <p className='mb-2 text-xs text-red-400'>{sendError}</p>
          )}
          <div className='flex gap-2'>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder='Type a message...'
              maxLength={MAX_BODY_LENGTH}
              rows={2}
              className={cn(
                'focus:border-primary focus:ring-primary min-h-[80px] w-full resize-none rounded-lg border border-white/10 bg-zinc-900/80 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:ring-1 focus:outline-none'
              )}
            />
            <Button
              size='icon'
              className='shrink-0'
              onClick={handleSend}
              disabled={!body.trim() || sending}
              aria-label='Send message'
            >
              {sending ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <MessageCircle className='h-4 w-4' />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  isOwn,
}: {
  message: Message;
  isOwn: boolean;
}) {
  return (
    <div
      className={cn(
        'flex max-w-[85%] flex-col gap-0.5',
        isOwn ? 'ml-auto items-end' : 'items-start'
      )}
    >
      <div
        className={cn(
          'rounded-2xl px-3 py-2 text-sm',
          isOwn
            ? 'bg-primary text-primary-foreground'
            : 'bg-zinc-800 text-white'
        )}
      >
        {message.body}
      </div>
      <span className='text-[10px] text-zinc-500'>
        {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
      </span>
    </div>
  );
}
