import api from './api';
import type {
  Conversation,
  ConversationDetail,
  ConversationsListResponse,
  CreateConversationResponse,
  Message,
  MessagesListResponse,
} from '@/types/messages';

/** Backend list payload: either top-level or nested under data */
interface RawConversationsPayload {
  data?: Conversation[];
  pagination?: ConversationsListResponse['pagination'];
}

interface RawMessagesPayload {
  data?: Message[];
  pagination?: MessagesListResponse['pagination'];
}

function unwrapConversationsList(raw: unknown): ConversationsListResponse {
  const obj = raw as Record<string, unknown>;
  const inner = (obj?.data as RawConversationsPayload) ?? obj;
  const data = Array.isArray(inner?.data)
    ? inner.data
    : Array.isArray(obj?.data)
      ? obj.data
      : [];
  const pagination = inner?.pagination ??
    obj?.pagination ?? { total: 0, limit: 20, offset: 0 };
  return {
    data,
    pagination: pagination as ConversationsListResponse['pagination'],
  };
}

function unwrapMessagesList(raw: unknown): MessagesListResponse {
  const obj = raw as Record<string, unknown>;
  const inner = (obj?.data as RawMessagesPayload) ?? obj;
  const data = Array.isArray(inner?.data)
    ? inner.data
    : Array.isArray(obj?.data)
      ? obj.data
      : [];
  const pagination = inner?.pagination ?? obj?.pagination ?? { hasMore: false };
  return { data, pagination: pagination as MessagesListResponse['pagination'] };
}

/**
 * List conversations for the current user (inbox).
 */
export const getConversations = async (
  limit: number = 20,
  offset: number = 0
): Promise<ConversationsListResponse> => {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  const res = await api.get<unknown>(
    `/messages/conversations?${params.toString()}`
  );
  const raw = (res as { data?: unknown }).data ?? res;
  return unwrapConversationsList(raw);
};

/**
 * Get one conversation (for thread header).
 */
export const getConversation = async (
  id: string
): Promise<ConversationDetail> => {
  const res = await api.get<{ data?: ConversationDetail } | ConversationDetail>(
    `/messages/conversations/${id}`
  );
  const raw = (res as { data?: unknown }).data ?? res;
  const obj = raw as Record<string, unknown>;
  const detail = obj?.data ?? obj;
  return detail as ConversationDetail;
};

/**
 * List messages in a conversation (oldest first; use before cursor for "load older").
 */
export const getMessages = async (
  conversationId: string,
  limit: number = 50,
  before?: string
): Promise<MessagesListResponse> => {
  const params = new URLSearchParams({ limit: String(limit) });
  if (before) params.set('before', before);
  const res = await api.get<unknown>(
    `/messages/conversations/${conversationId}/messages?${params.toString()}`
  );
  const raw = (res as { data?: unknown }).data ?? res;
  return unwrapMessagesList(raw);
};

/**
 * Start or get existing conversation with another user.
 */
export const createConversation = async (
  otherUserId: string
): Promise<CreateConversationResponse> => {
  const res = await api.post<
    { data?: CreateConversationResponse } | CreateConversationResponse
  >('/messages/conversations', { otherUserId });
  const raw = (res as { data?: unknown }).data ?? res;
  const obj = raw as Record<string, unknown>;
  const payload = obj?.data ?? obj;
  const conv = (payload as Record<string, unknown>)?.conversation;
  const created = (payload as Record<string, unknown>)?.created as
    | boolean
    | undefined;
  return {
    conversation: conv as ConversationDetail,
    created: created ?? false,
  };
};

/**
 * Send a message in a conversation.
 */
export const sendMessage = async (
  conversationId: string,
  body: string
): Promise<Message> => {
  const res = await api.post<{ data?: Message } | Message>(
    `/messages/conversations/${conversationId}/messages`,
    { body: body.trim() }
  );
  const raw = (res as { data?: unknown }).data ?? res;
  const obj = raw as Record<string, unknown>;
  const message = obj?.data ?? obj;
  const inner = (message as Record<string, unknown>)?.data ?? message;
  return (inner ?? message) as Message;
};

/**
 * Mark a conversation as read.
 */
export const markConversationRead = async (
  conversationId: string
): Promise<void> => {
  await api.patch<unknown>(
    `/messages/conversations/${conversationId}/read`,
    {}
  );
};
