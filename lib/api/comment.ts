import api from './api';
import {
  CommentEntityType,
  CreateCommentRequest,
  CreateCommentResponse,
  GetCommentsResponse,
  GetSingleCommentResponse,
  UpdateCommentRequest,
  UpdateCommentResponse,
  DeleteCommentResponse,
  AddReactionRequest,
  AddReactionResponse,
  RemoveReactionResponse,
  ReportCommentRequest,
  ReportCommentResponse,
  GetReactionsResponse,
  GetCommentsQuery,
} from '@/types/comment';

/**
 * Get comments with advanced filtering and pagination
 */
export const getComments = async (
  query: GetCommentsQuery
): Promise<GetCommentsResponse> => {
  const params = new URLSearchParams();

  // Add pagination
  if (query.page) params.append('page', query.page.toString());
  if (query.limit) params.append('limit', query.limit.toString());

  // Add filters
  if (query.entityType) params.append('entityType', query.entityType);
  if (query.entityId) params.append('entityId', query.entityId);
  if (query.authorId) params.append('authorId', query.authorId);
  if (query.parentId) params.append('parentId', query.parentId);
  if (query.status) params.append('status', query.status);
  if (query.includeReactions !== undefined)
    params.append('includeReactions', query.includeReactions.toString());
  if (query.includeReports !== undefined)
    params.append('includeReports', query.includeReports.toString());

  // Add sorting
  if (query.sortBy) params.append('sortBy', query.sortBy);
  if (query.sortOrder) params.append('sortOrder', query.sortOrder);

  const res = await api.get(`/api/comments?${params.toString()}`);
  return res.data;
};

/**
 * Get a single comment by ID
 */
export const getComment = async (
  commentId: string
): Promise<GetSingleCommentResponse> => {
  const res = await api.get(`/api/comments/${commentId}`);
  return res.data;
};

/**
 * Get comments by entity (convenience method)
 */
export const getCommentsByEntity = async (
  entityType: CommentEntityType,
  entityId: string,
  query: Partial<GetCommentsQuery> = {}
): Promise<GetCommentsResponse> => {
  return getComments({
    entityType,
    entityId,
    ...query,
  });
};

/**
 * Create a new comment
 */
export const createComment = async (
  data: CreateCommentRequest & {
    entityType: CommentEntityType;
    entityId: string;
  }
): Promise<CreateCommentResponse> => {
  const res = await api.post('/api/comments', data);
  return res.data;
};

/**
 * Update an existing comment
 */
export const updateComment = async (
  commentId: string,
  data: UpdateCommentRequest
): Promise<UpdateCommentResponse> => {
  const res = await api.put(`/api/comments/${commentId}`, data);
  return res.data;
};

/**
 * Delete a comment
 */
export const deleteComment = async (
  commentId: string
): Promise<DeleteCommentResponse> => {
  const res = await api.delete(`/api/comments/${commentId}`);
  return res.data;
};

/**
 * Add a reaction to a comment
 */
export const addReaction = async (
  commentId: string,
  data: AddReactionRequest
): Promise<AddReactionResponse> => {
  const res = await api.post(`/api/comments/${commentId}/react`, data);
  return res.data;
};

/**
 * Remove a reaction from a comment
 */
export const removeReaction = async (
  commentId: string,
  reactionType: string
): Promise<RemoveReactionResponse> => {
  const res = await api.delete(
    `/api/comments/${commentId}/reactions/${reactionType}`
  );
  return res.data;
};

/**
 * Get reactions for a comment
 */
export const getReactions = async (
  commentId: string
): Promise<GetReactionsResponse> => {
  const res = await api.get(`/api/comments/${commentId}/reactions`);
  return res.data;
};

/**
 * Report a comment
 */
export const reportComment = async (
  commentId: string,
  data: ReportCommentRequest
): Promise<ReportCommentResponse> => {
  const res = await api.post(`/api/comments/${commentId}/report`, data);
  return res.data;
};

// Legacy project-specific functions for backward compatibility
/**
 * Get comments for a project (legacy)
 */
export const getProjectComments = async (
  projectId: string,
  page = 1,
  limit = 10,
  filters?: {
    parentCommentId?: string;
    sortBy?: 'createdAt' | 'updatedAt' | 'totalReactions';
    sortOrder?: 'asc' | 'desc';
  }
): Promise<GetCommentsResponse> => {
  return getComments({
    entityType: CommentEntityType.PROJECT,
    entityId: projectId,
    page,
    limit,
    parentId: filters?.parentCommentId,
    sortBy: filters?.sortBy,
    sortOrder: filters?.sortOrder,
  });
};

/**
 * Create a comment on a project (legacy)
 */
export const createProjectComment = async (
  projectId: string,
  data: CreateCommentRequest
): Promise<CreateCommentResponse> => {
  return createComment({
    ...data,
    entityType: CommentEntityType.PROJECT,
    entityId: projectId,
  });
};

/**
 * Update a project comment (legacy)
 */
export const updateProjectComment = async (
  projectId: string,
  commentId: string,
  data: UpdateCommentRequest
): Promise<UpdateCommentResponse> => {
  return updateComment(commentId, data);
};

/**
 * Delete a project comment (legacy)
 */
export const deleteProjectComment = async (
  projectId: string,
  commentId: string
): Promise<DeleteCommentResponse> => {
  return deleteComment(commentId);
};

/**
 * Report a project comment (legacy)
 */
export const reportProjectComment = async (
  projectId: string,
  commentId: string,
  data: ReportCommentRequest
): Promise<ReportCommentResponse> => {
  return reportComment(commentId, data);
};
