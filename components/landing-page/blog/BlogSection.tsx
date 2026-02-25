import BlogSectionClient from './BlogSectionClient';
import { getAllBlogPosts } from '@/lib/mdx';

const BlogSection = () => {
  const posts = getAllBlogPosts().slice(0, 6);
  return <BlogSectionClient posts={posts} />;
};

export default BlogSection;
