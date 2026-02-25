import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { compileMDX } from 'next-mdx-remote/rsc';
import type { ReactElement } from 'react';

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

export interface MdxBlogPost {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  publishedAt: string;
  author: {
    name: string;
    image: string;
  };
  categories: string[];
  tags: string[];
  readingTime: number;
  isFeatured?: boolean;
}

export interface MdxBlogPostWithContent extends MdxBlogPost {
  content: ReactElement;
}

function parseFrontmatter(slug: string): MdxBlogPost {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  const raw = fs.readFileSync(filePath, 'utf8');
  const { data } = matter(raw);

  return {
    slug,
    title: data.title ?? '',
    excerpt: data.excerpt ?? '',
    coverImage: data.coverImage ?? '',
    publishedAt: data.publishedAt ?? '',
    author: {
      name: data.author?.name ?? '',
      image: data.author?.image ?? '',
    },
    categories: Array.isArray(data.categories) ? data.categories : [],
    tags: Array.isArray(data.tags) ? data.tags : [],
    readingTime: data.readingTime ?? 0,
    isFeatured: data.isFeatured ?? false,
  };
}

export function getAllBlogPosts(): MdxBlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const files = fs
    .readdirSync(BLOG_DIR)
    .filter(f => f.endsWith('.mdx'));

  const posts = files.map(file => {
    const slug = file.replace(/\.mdx$/, '');
    return parseFrontmatter(slug);
  });

  return posts.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export async function getBlogPostBySlug(
  slug: string
): Promise<MdxBlogPostWithContent | null> {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, content: mdxSource } = matter(raw);

  const { content } = await compileMDX({
    source: mdxSource,
    options: { parseFrontmatter: false },
  });

  return {
    slug,
    title: data.title ?? '',
    excerpt: data.excerpt ?? '',
    coverImage: data.coverImage ?? '',
    publishedAt: data.publishedAt ?? '',
    author: {
      name: data.author?.name ?? '',
      image: data.author?.image ?? '',
    },
    categories: Array.isArray(data.categories) ? data.categories : [],
    tags: Array.isArray(data.tags) ? data.tags : [],
    readingTime: data.readingTime ?? 0,
    isFeatured: data.isFeatured ?? false,
    content,
  };
}

export function getRelatedPosts(
  currentSlug: string,
  tags: string[],
  categories: string[],
  limit = 3
): MdxBlogPost[] {
  const all = getAllBlogPosts().filter(p => p.slug !== currentSlug);

  const scored = all.map(post => {
    const tagMatches = post.tags.filter(t => tags.includes(t)).length;
    const catMatches = post.categories.filter(c =>
      categories.includes(c)
    ).length;
    return { post, score: tagMatches + catMatches };
  });

  return scored
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ post }) => post);
}
