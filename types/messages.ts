/**
 * Types for in-app 1:1 messaging (DMs).
 * Align with backend API response shapes.
 */

export interface OtherUser {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
  readAt?: string | null;
}

export interface Conversation {
  id: string;
  otherUser: OtherUser;
  lastMessage?: {
    id: string;
    body: string;
    senderId: string;
    createdAt: string;
  };
  unreadCount: number;
  updatedAt: string;
}

export interface ConversationDetail {
  id: string;
  otherUser: OtherUser;
  createdAt: string;
}

export interface ConversationsListPagination {
  total: number;
  limit: number;
  offset: number;
  hasMore?: boolean;
}

export interface ConversationsListResponse {
  data: Conversation[];
  pagination: ConversationsListPagination;
}

export interface MessagesListPagination {
  hasMore: boolean;
  nextCursor?: string;
}

export interface MessagesListResponse {
  data: Message[];
  pagination: MessagesListPagination;
}

export interface CreateConversationResponse {
  conversation: ConversationDetail;
  created: boolean;
}
