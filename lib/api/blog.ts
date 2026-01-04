import api from './api';
// import {
//   getRelatedPosts as getRelatedPostsData,
//   BlogPost as DataBlogPost,
// } from '@/lib/data/blog';
import {
  BlogPost,
  GetBlogPostsRequest,
  GetBlogPostsResponse,
  GetRelatedPostsResponse,
  CreateBlogPostRequest,
  UpdateBlogPostRequest,
  CreateBlogPostResponse,
  UpdateBlogPostResponse,
  DeleteBlogPostResponse,
  BlogApiError,
} from '@/types/blog';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
  path: string;
}

/**
 * Convert data layer BlogPost to API layer BlogPost
 */

/**
 * Get paginated blog posts with filtering and sorting
 */
export const getBlogPosts = async (
  params: GetBlogPostsRequest = {}
): Promise<GetBlogPostsResponse> => {
  try {
    const {
      authorId,
      organizationId,
      status,
      search,
      tags,
      categories,
      isFeatured,
      includePinned,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder,
    });

    if (authorId) {
      queryParams.append('authorId', authorId);
    }

    if (organizationId) {
      queryParams.append('organizationId', organizationId);
    }

    if (status) {
      queryParams.append('status', status);
    }

    if (search) {
      queryParams.append('search', search);
    }

    if (tags) {
      queryParams.append('tags', tags);
    }

    if (categories) {
      queryParams.append('categories', categories);
    }

    if (isFeatured !== undefined) {
      queryParams.append('isFeatured', isFeatured.toString());
    }

    if (includePinned !== undefined) {
      queryParams.append('includePinned', includePinned.toString());
    }

    const response = await api.get<ApiResponse<GetBlogPostsResponse>>(
      `/blog-posts?${queryParams.toString()}`
    );

    return response.data.data;
  } catch (error) {
    throw new Error(
      `Failed to fetch blog posts: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
};

/**
 * Get a single blog post by slug
 */
export const getBlogPost = async (slug: string): Promise<BlogPost> => {
  try {
    const response = await api.get<ApiResponse<BlogPost>>(
      `/blog-posts/slug/${slug}`
    );
    return response.data.data;
  } catch (error) {
    console.error('Error in getBlogPost:', error);
    if (error instanceof Error && error.message.includes('404')) {
      throw new Error(`Blog post with slug "${slug}" not found`);
    }
    throw new Error(
      `Failed to fetch blog post: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
};

/**
 * Get a single blog post by ID
 */
export const getBlogPostById = async (id: string): Promise<BlogPost> => {
  try {
    const response = await api.get<ApiResponse<BlogPost>>(
      `/blog-posts/id/${id}`
    );
    return response.data.data;
  } catch (error) {
    console.error('Error in getBlogPostById:', error);
    if (error instanceof Error && error.message.includes('404')) {
      throw new Error(`Blog post with id "${id}" not found`);
    }
    throw new Error(
      `Failed to fetch blog post: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
};

/**
 * Get related blog posts
 */
export const getRelatedPosts = async (
  id: string,
  limit: number = 5
): Promise<GetRelatedPostsResponse> => {
  try {
    const response = await api.get<ApiResponse<GetRelatedPostsResponse>>(
      `/blog-posts/${id}/related?limit=${limit}`
    );
    return response.data.data;
  } catch (error) {
    throw new Error(
      `Failed to fetch related posts: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
};

/**
 * Create a new blog post
 */
export const createBlogPost = async (
  data: CreateBlogPostRequest
): Promise<CreateBlogPostResponse> => {
  try {
    const response = await api.post<ApiResponse<CreateBlogPostResponse>>(
      '/blog-posts',
      data
    );
    return response.data.data;
  } catch (error) {
    throw new Error(
      `Failed to create blog post: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
};

/**
 * Update an existing blog post
 */
export const updateBlogPost = async (
  id: string,
  data: UpdateBlogPostRequest
): Promise<UpdateBlogPostResponse> => {
  try {
    const response = await api.put<ApiResponse<UpdateBlogPostResponse>>(
      `/blog-posts/${id}`,
      data
    );
    return response.data.data;
  } catch (error) {
    throw new Error(
      `Failed to update blog post: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
};

/**
 * Delete a blog post
 */
export const deleteBlogPost = async (
  id: string
): Promise<DeleteBlogPostResponse> => {
  try {
    const response = await api.delete<ApiResponse<DeleteBlogPostResponse>>(
      `/blog-posts/${id}`
    );
    return response.data.data;
  } catch (error) {
    throw new Error(
      `Failed to delete blog post: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
};

/**
 * Utility function to build query parameters for blog requests
 */
export const buildBlogQueryParams = (
  params: Record<string, unknown>
): string => {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        queryParams.append(key, value.join(','));
      } else {
        queryParams.append(key, String(value));
      }
    }
  });

  return queryParams.toString();
};

/**
 * Utility function to validate blog post slug
 */
export const validateBlogSlug = (slug: string): boolean => {
  const slugRegex = /^[a-z0-9-]+$/;
  return slugRegex.test(slug) && slug.length > 0 && slug.length <= 100;
};

/**
 * Utility function to sanitize search query
 */
export const sanitizeSearchQuery = (query: string): string => {
  return query.trim().replace(/[<>]/g, '').substring(0, 100);
};

/**
 * Error handling utilities
 */
export const handleBlogApiError = (error: unknown): BlogApiError => {
  if (error instanceof Error) {
    return {
      message: error.message,
      status: 500,
      code: 'INTERNAL_ERROR',
    };
  }

  return {
    message: 'An unknown error occurred',
    status: 500,
    code: 'UNKNOWN_ERROR',
  };
};

/**
 * Check if an error is a blog API error
 */
export const isBlogApiError = (error: unknown): error is BlogApiError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'status' in error
  );
};
