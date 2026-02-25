import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogPostDetails from '@/components/landing-page/blog/BlogPostDetails';
import { getAllBlogPosts, getBlogPostBySlug, getRelatedPosts } from '@/lib/mdx';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllBlogPosts().map(post => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: 'Blog Post Not Found | Boundless',
      description:
        'The requested blog post could not be found. Please check the URL or browse our other posts.',
      robots: { index: false, follow: true },
    };
  }

  return {
    title: `${post.title} | Boundless Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [{ url: post.coverImage }] : [],
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author.name],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [post.coverImage] : [],
    },
  };
}

const BlogPostPage = async ({ params }: BlogPostPageProps) => {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const related = getRelatedPosts(post.slug, post.tags, post.categories);

  return <BlogPostDetails post={post} relatedPosts={related} />;
};

export default BlogPostPage;
