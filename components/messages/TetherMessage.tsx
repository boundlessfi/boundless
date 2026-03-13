'use client';

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  getConversation,
  getMessages,
  markConversationRead,
  sendMessage,
} from '@/lib/api/messages';
import type {
  ConversationDetail,
  Message as MessageType,
} from '@/types/messages';
import { useAuthStatus } from '@/hooks/use-auth';
import { useMessageRealtime } from '@/hooks/use-message-realtime';
import { Loader2, MessageCircle, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import type { ApiError } from '@/lib/api/api';
import BasicAvatar from '../avatars/BasicAvatar';

const DESKTOP_PANEL_WIDTH = 360;
const DESKTOP_PANEL_HEIGHT = 480;
const VIEWPORT_MARGIN = 12;
/** Gap between trigger and panel edge */
const TRIGGER_GAP = 8;

type Placement = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

interface SmartTetherResult {
  x: number;
  y: number;
  placement: Placement;
  caretStyle: React.CSSProperties;
}

interface PanelSize {
  width: number;
  height: number;
}

/** Stable reference so useSmartTether's recompute callback doesn't change every render */
const DESKTOP_PANEL_SIZE: PanelSize = {
  width: DESKTOP_PANEL_WIDTH,
  height: DESKTOP_PANEL_HEIGHT,
};

const isApiError = (e: unknown): e is ApiError => {
  return (
    e !== null &&
    typeof e === 'object' &&
    'message' in e &&
    typeof (e as ApiError).message === 'string'
  );
};

/** Returns null during SSR and first client render; only set to boolean inside useEffect to avoid hydration mismatch. */
const useIsMobile = (): boolean | null => {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const update = () => {
      if (typeof window === 'undefined') return;
      setIsMobile(window.innerWidth < 768);
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return isMobile;
};

const computeSmartTether = (
  triggerRect: DOMRect,
  panelSize: PanelSize
): SmartTetherResult => {
  const vw = typeof window !== 'undefined' ? window.innerWidth : 0;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 0;

  const originX = triggerRect.left + triggerRect.width / 2;
  const originY = triggerRect.top + triggerRect.height / 2;

  const quadrants: Array<{
    id: Placement;
    width: number;
    height: number;
  }> = [
    {
      id: 'bottom-right',
      width: vw - originX - VIEWPORT_MARGIN,
      height: vh - originY - VIEWPORT_MARGIN,
    },
    {
      id: 'bottom-left',
      width: originX - VIEWPORT_MARGIN,
      height: vh - originY - VIEWPORT_MARGIN,
    },
    {
      id: 'top-right',
      width: vw - originX - VIEWPORT_MARGIN,
      height: originY - VIEWPORT_MARGIN,
    },
    {
      id: 'top-left',
      width: originX - VIEWPORT_MARGIN,
      height: originY - VIEWPORT_MARGIN,
    },
  ];

  // Prefer bottom-right, otherwise quadrant with largest area that can fit the panel.
  const fits = quadrants.filter(
    q => q.width >= panelSize.width && q.height >= panelSize.height
  );

  let chosen: Placement;
  if (fits.length > 0) {
    const preferred = fits.find(q => q.id === 'bottom-right');
    chosen =
      preferred?.id ??
      fits.reduce((best, q) => {
        const bestArea = best.width * best.height;
        const qArea = q.width * q.height;
        return qArea > bestArea ? q : best;
      }).id;
  } else {
    const best = quadrants.reduce((best, q) => {
      const bestArea = best.width * best.height;
      const qArea = q.width * q.height;
      return qArea > bestArea ? q : best;
    });
    chosen = best.id;
  }

  // Position panel adjacent to trigger with a small gap (not centered on trigger)
  const left = triggerRect.left;
  const right = triggerRect.right;
  const top = triggerRect.top;
  const bottom = triggerRect.bottom;

  let x: number;
  let y: number;

  switch (chosen) {
    case 'bottom-right':
      x = left;
      y = bottom + TRIGGER_GAP;
      break;
    case 'bottom-left':
      x = right - panelSize.width;
      y = bottom + TRIGGER_GAP;
      break;
    case 'top-right':
      x = left;
      y = top - panelSize.height - TRIGGER_GAP;
      break;
    case 'top-left':
      x = right - panelSize.width;
      y = top - panelSize.height - TRIGGER_GAP;
      break;
  }

  // Clamp to viewport
  x = Math.min(
    Math.max(VIEWPORT_MARGIN, x),
    Math.max(VIEWPORT_MARGIN, vw - panelSize.width - VIEWPORT_MARGIN)
  );
  y = Math.min(
    Math.max(VIEWPORT_MARGIN, y),
    Math.max(VIEWPORT_MARGIN, vh - panelSize.height - VIEWPORT_MARGIN)
  );

  // Caret at panel edge aiming at trigger center (originX, originY)
  const caretSize = 10;
  const caretBaseStyle: React.CSSProperties = {
    width: caretSize,
    height: caretSize,
    position: 'fixed',
    transform: 'rotate(45deg)',
    zIndex: 50,
  };

  let caretLeft: number;
  let caretTop: number;

  if (chosen.startsWith('top')) {
    caretTop = y + panelSize.height - caretSize / 2;
  } else {
    caretTop = y - caretSize / 2;
  }

  if (chosen.endsWith('left')) {
    caretLeft = x + panelSize.width - caretSize / 2;
  } else {
    caretLeft = x - caretSize / 2;
  }

  const caretStyle: React.CSSProperties = {
    ...caretBaseStyle,
    left: caretLeft,
    top: caretTop,
  };

  return { x, y, placement: chosen, caretStyle };
};

const useSmartTether = (
  triggerRef: React.RefObject<HTMLElement | null>,
  panelRef: React.RefObject<HTMLDivElement | null>,
  panelSize: PanelSize,
  isOpen: boolean
): SmartTetherResult | null => {
  const [state, setState] = useState<SmartTetherResult | null>(null);

  const width = panelSize.width;
  const height = panelSize.height;
  const recompute = useCallback(() => {
    if (typeof window === 'undefined') return;
    const triggerEl = triggerRef.current;
    if (!triggerEl) return;
    const rect = triggerEl.getBoundingClientRect();
    const result = computeSmartTether(rect, { width, height });
    setState(result);
  }, [triggerRef, width, height]);

  useLayoutEffect(() => {
    if (!isOpen) return;
    recompute();
  }, [isOpen, recompute]);

  useEffect(() => {
    if (!isOpen) return;
    const handle = () => recompute();
    window.addEventListener('resize', handle);
    window.addEventListener('scroll', handle, true);
    return () => {
      window.removeEventListener('resize', handle);
      window.removeEventListener('scroll', handle, true);
    };
  }, [isOpen, recompute]);

  useEffect(() => {
    if (!isOpen) return;
    const panelEl = panelRef.current;
    if (!panelEl || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(() => {
      recompute();
    });
    observer.observe(panelEl);
    return () => observer.disconnect();
  }, [isOpen, panelRef, recompute]);

  return state;
};

interface TetherMessageProps {
  triggerRef: React.RefObject<HTMLElement | null>;
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
}

export const TetherMessage: React.FC<TetherMessageProps> = ({
  triggerRef,
  isOpen,
  onClose,
  conversationId,
}) => {
  const isMobile = useIsMobile();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const initialFocusRef = useRef<HTMLTextAreaElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const sendButtonRef = useRef<HTMLButtonElement | null>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);

  const tether = useSmartTether(
    triggerRef,
    panelRef,
    DESKTOP_PANEL_SIZE,
    isOpen && !isMobile
  );

  // Focus management
  useEffect(() => {
    if (isOpen) {
      if (typeof document !== 'undefined') {
        const active = document.activeElement;
        if (active instanceof HTMLElement) {
          lastFocusedElementRef.current = active;
        }
      }
      const timer = window.setTimeout(() => {
        initialFocusRef.current?.focus();
      }, 10);
      return () => window.clearTimeout(timer);
    }

    if (!isOpen && lastFocusedElementRef.current) {
      lastFocusedElementRef.current.focus();
    }
  }, [isOpen]);

  // Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
      if (event.key === 'Tab') {
        // Simple focus trap: close → textarea → send
        const focusable: HTMLElement[] = [];
        if (closeButtonRef.current) focusable.push(closeButtonRef.current);
        if (initialFocusRef.current) focusable.push(initialFocusRef.current);
        if (sendButtonRef.current) focusable.push(sendButtonRef.current);
        if (!focusable.length) return;

        const currentIndex = focusable.indexOf(
          document.activeElement as HTMLElement
        );
        let nextIndex = currentIndex;
        if (event.shiftKey) {
          nextIndex =
            currentIndex <= 0 ? focusable.length - 1 : currentIndex - 1;
        } else {
          nextIndex =
            currentIndex === -1 || currentIndex === focusable.length - 1
              ? 0
              : currentIndex + 1;
        }
        event.preventDefault();
        focusable[nextIndex]?.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  // Click outside to close (desktop)
  useEffect(() => {
    if (!isOpen || isMobile) return;
    const handleClick = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (panelRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target as Node)) return;
      onClose();
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, [isOpen, isMobile, onClose, triggerRef]);

  if (!isOpen) return null;

  if (isMobile) {
    return (
      <AnimatePresence>
        <div
          aria-label='Messages'
          aria-modal='true'
          role='dialog'
          className='fixed inset-0 z-9999 flex items-end justify-center'
        >
          <motion.div
            ref={overlayRef}
            className='absolute inset-0 z-0 bg-black/50'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            className='bg-background-main-bg relative z-50 flex h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-t-[16px] border border-white/10'
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.28, ease: [0.25, 0.8, 0.25, 1] }}
          >
            <ThreadContent
              conversationId={conversationId}
              initialFocusRef={initialFocusRef}
              closeButtonRef={closeButtonRef}
              sendButtonRef={sendButtonRef}
              onClose={onClose}
              isMobile
            />
          </motion.div>
        </div>
      </AnimatePresence>
    );
  }

  if (!tether) return null;

  return (
    <AnimatePresence>
      <div
        aria-label='Messages'
        aria-modal='true'
        role='dialog'
        className='pointer-events-none fixed inset-0 z-9999'
      >
        <motion.div
          ref={panelRef}
          className='bg-background-main-bg pointer-events-auto relative z-10 flex flex-col overflow-hidden rounded-[12px] border border-white/10'
          style={{
            position: 'fixed',
            left: tether.x,
            top: tether.y,
            width: DESKTOP_PANEL_WIDTH,
            minHeight: DESKTOP_PANEL_HEIGHT,
            maxHeight: DESKTOP_PANEL_HEIGHT,
            height: DESKTOP_PANEL_HEIGHT,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          }}
          initial={{ scale: 0.88, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.96, opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <ThreadContent
            conversationId={conversationId}
            initialFocusRef={initialFocusRef}
            closeButtonRef={closeButtonRef}
            sendButtonRef={sendButtonRef}
            onClose={onClose}
            isMobile={false}
          />
        </motion.div>
        <motion.div
          className='bg-background-main-bg pointer-events-none'
          style={{
            ...tether.caretStyle,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      </div>
    </AnimatePresence>
  );
};

interface ThreadContentProps {
  conversationId: string;
  initialFocusRef: React.RefObject<HTMLTextAreaElement | null>;
  closeButtonRef: React.RefObject<HTMLButtonElement | null>;
  sendButtonRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  isMobile: boolean;
}

const MAX_BODY_LENGTH = 10_000;

const ThreadContent: React.FC<ThreadContentProps> = ({
  conversationId,
  initialFocusRef,
  closeButtonRef,
  sendButtonRef,
  onClose,
  isMobile,
}) => {
  const { user } = useAuthStatus();
  const [conversation, setConversation] = useState<ConversationDetail | null>(
    null
  );
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
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
    enabled: !!conversationId,
    userId: currentUserId ?? undefined,
    onMessage: (message: MessageType) => {
      setMessages(prev =>
        prev.some(m => m.id === message.id) ? prev : [...prev, message]
      );
    },
  });

  // Scroll to bottom when new message added
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
    setError(null);
    try {
      const res = await getMessages(conversationId, 50, nextCursor);
      setMessages(prev => [...(res.data ?? []), ...prev]);
      setHasMore(res.pagination.hasMore ?? false);
      setNextCursor(res.pagination.nextCursor ?? null);
    } catch (e) {
      console.error('loadOlder failed', e);
      const msg = isApiError(e) ? e.message : 'Failed to load older messages';
      setError(msg);
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

  const header = useMemo(() => {
    if (!conversation) return null;
    return (
      <div className='flex items-center justify-between border-b border-white/10 px-4 py-2'>
        <div className='flex items-center gap-2'>
          <BasicAvatar
            name={conversation.otherUser.name ?? 'Unknown'}
            username={conversation.otherUser.username ?? 'Unknown'}
            image={conversation.otherUser.avatarUrl ?? undefined}
            truncate={false}
          />
        </div>
        <Button
          ref={closeButtonRef}
          type='button'
          variant='ghost'
          size='icon'
          className='shrink-0 text-zinc-400 hover:text-white'
          onClick={onClose}
          aria-label='Close messages'
        >
          <X className='h-4 w-4' />
        </Button>
      </div>
    );
  }, [conversation, onClose]);

  if (loading && !conversation) {
    return (
      <div className='flex h-full flex-col overflow-hidden'>
        <div className='flex items-center justify-between border-b border-white/10 px-4 py-2'>
          <div className='flex items-center gap-2'>
            <Skeleton className='h-8 w-8 shrink-0 rounded-full' />
            <div className='flex flex-col gap-1'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-3 w-14' />
            </div>
          </div>
          <Skeleton className='h-8 w-8 shrink-0 rounded-md' />
        </div>
        <div className='flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3'>
          <div className='flex justify-start'>
            <Skeleton className='h-12 max-w-[75%] rounded-2xl rounded-bl-sm' />
          </div>
          <div className='flex justify-end'>
            <Skeleton className='h-10 max-w-[60%] rounded-2xl rounded-br-sm' />
          </div>
          <div className='flex justify-start'>
            <Skeleton className='h-8 max-w-[50%] rounded-2xl rounded-bl-sm' />
          </div>
          <div className='flex justify-end'>
            <Skeleton className='h-14 max-w-[70%] rounded-2xl rounded-br-sm' />
          </div>
        </div>
        <div className='shrink-0 border-t border-white/10 p-3'>
          <div className='flex gap-2'>
            <Skeleton className='min-h-[72px] flex-1 rounded-lg' />
            <Skeleton className='h-10 w-10 shrink-0 rounded-md' />
          </div>
        </div>
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className='flex h-full flex-col items-center justify-center gap-3 p-6 text-center'>
        <p className='text-sm text-red-400'>
          {error ?? 'Conversation not found'}
        </p>
        <Button variant='outline' size='sm' onClick={onClose}>
          Close
        </Button>
      </div>
    );
  }

  return (
    <div className='flex h-full flex-col overflow-hidden'>
      {header}
      <div className='flex min-h-0 flex-1 flex-col overflow-hidden'>
        <div className='flex-1 overflow-y-auto p-3'>
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
              <motion.div
                key={msg.id}
                initial={{ y: 4, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.16 }}
                className='w-full'
              >
                <MessageBubble
                  message={msg}
                  isOwn={msg.senderId === currentUserId}
                />
              </motion.div>
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
              ref={initialFocusRef}
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
                'focus:border-primary focus:ring-primary min-h-[72px] w-full resize-none rounded-lg border border-white/10 bg-zinc-900/80 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:ring-1 focus:outline-none'
              )}
            />
            <Button
              ref={sendButtonRef}
              type='button'
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
};

const MessageBubble: React.FC<{
  message: MessageType;
  isOwn: boolean;
}> = ({ message, isOwn }) => {
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
};
