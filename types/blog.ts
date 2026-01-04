export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;
  authorId: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'SCHEDULED';
  publishedAt: string;
  scheduledFor: string | null;
  categories: string[];
  isFeatured: boolean;
  isPinned: boolean;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  viewCount: number;
  readingTime: number;
  metadata: any | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    email: string;
    image: string;
    username: string;
    role: string;
  };
  tags: BlogPostTag[];
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  postCount: number;
  color: string;
  icon: string;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
}

export interface BlogPostTag {
  id: string;
  blogPostId: string;
  tagId: string;
  createdAt: string;
  tag: BlogTag;
}

export interface GetBlogPostsRequest {
  authorId?: string;
  organizationId?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'SCHEDULED';
  search?: string;
  tags?: string;
  categories?: string;
  includePrivate?: boolean;
  isFeatured?: boolean;
  includePinned?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'publishedAt' | 'viewCount' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface GetRelatedPostsRequest {
  limit?: number;
}

export interface GetBlogPostsResponse {
  data: BlogPost[];
  hasMore: boolean;
  total: number;
  currentPage: number;
  totalPages: number;
}

export interface GetBlogPostResponse {
  post: BlogPost;
}

export interface GetRelatedPostsResponse {
  posts: BlogPost[];
}

export interface GetCategoriesResponse {
  categories: BlogCategory[];
}

export interface GetTagsResponse {
  tags: BlogTag[];
}

export interface CreateBlogPostRequest {
  title: string;
  content: string;
  categories?: string[];
  tags?: string[];
  coverImage?: string;
  excerpt?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'SCHEDULED';
  isFeatured?: boolean;
  isPinned?: boolean;
  readingTime?: number;
  scheduledFor?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  generateAI?: boolean;
}

export interface UpdateBlogPostRequest extends Partial<CreateBlogPostRequest> {}

export interface CreateBlogPostResponse {
  post: BlogPost;
}

export interface UpdateBlogPostResponse {
  post: BlogPost;
}

export interface DeleteBlogPostResponse {
  message: string;
}

export interface BlogApiError {
  message: string;
  status: number;
  code?: string;
  details?: Record<string, unknown>;
}
