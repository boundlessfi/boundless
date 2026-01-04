import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogPostDetails from '@/components/landing-page/blog/BlogPostDetails';
import { getBlogPost, getBlogPosts } from '@/lib/api/blog';
import { generateBlogPostMetadata } from '@/lib/metadata';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

interface StaticParams {
  slug: string;
}

const STATIC_GENERATION_LIMIT = 100;

export async function generateStaticParams(): Promise<StaticParams[]> {
  try {
    const response = await getBlogPosts({
      page: 1,
      limit: STATIC_GENERATION_LIMIT,
      status: 'PUBLISHED',
    });

    const data = response.data;

    if (!data || data.length === 0) {
      return [];
    }

    return data.map(post => ({
      slug: post.slug,
    }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;

    if (!slug || typeof slug !== 'string') {
      return getDefaultMetadata();
    }

    const post = await getBlogPost(slug);

    if (!post) {
      return getNotFoundMetadata();
    }

    return generateBlogPostMetadata(post);
  } catch {
    return getDefaultMetadata();
  }
}

const BlogPostPage = async ({ params }: BlogPostPageProps) => {
  try {
    const { slug } = await params;

    if (!slug || typeof slug !== 'string') {
      notFound();
    }

    const post = await getBlogPost(slug);

    if (!post) {
      notFound();
    }

    if (!post.id || !post.title || !post.content) {
      notFound();
    }

    return <BlogPostDetails post={post} />;
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message.includes('404') ||
        error.message.includes('not found')
      ) {
        notFound();
      }
    }

    notFound();
  }
};

function getDefaultMetadata(): Metadata {
  return {
    title: 'Blog Post | Boundless',
    description: 'Read our latest blog posts and insights.',
    robots: {
      index: false,
      follow: true,
    },
  };
}

function getNotFoundMetadata(): Metadata {
  return {
    title: 'Blog Post Not Found | Boundless',
    description:
      'The requested blog post could not be found. Please check the URL or browse our other posts.',
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default BlogPostPage;
