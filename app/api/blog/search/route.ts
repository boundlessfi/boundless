import { NextRequest, NextResponse } from 'next/server';
import { getBlogPosts } from '@/lib/api/blog';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category');
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);

    const response = await getBlogPosts({ limit: 100 });
    const allPosts = response.data;

    let filteredPosts = allPosts;

    if (q.trim()) {
      const query = q.toLowerCase();
      filteredPosts = filteredPosts.filter(
        post =>
          post.title.toLowerCase().includes(query) ||
          post.excerpt.toLowerCase().includes(query) ||
          (post.tags &&
            post.tags.some(tag => tag.tag.name.toLowerCase().includes(query)))
      );
    }

    if (category) {
      filteredPosts = filteredPosts.filter(
        post => post.categories && post.categories.includes(category)
      );
    }

    if (tags && tags.length > 0) {
      filteredPosts = filteredPosts.filter(
        post =>
          post.tags && tags.some(tag => post.tags.some(t => t.tag.name === tag))
      );
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const posts = filteredPosts.slice(startIndex, endIndex);
    const hasMore = endIndex < filteredPosts.length;

    return NextResponse.json({
      success: true,
      data: {
        posts,
        hasMore,
        total: filteredPosts.length,
        currentPage: page,
        totalPages: Math.ceil(filteredPosts.length / limit),
        query: q,
      },
      message: 'Search completed successfully',
      timestamp: new Date().toISOString(),
      path: '/api/blog/search',
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to search blog posts',
        timestamp: new Date().toISOString(),
        path: '/api/blog/search',
      },
      { status: 500 }
    );
  }
}
