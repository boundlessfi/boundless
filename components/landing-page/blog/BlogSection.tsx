import BlogSectionClient from './BlogSectionClient';
import { getBlogPosts } from '@/lib/api/blog';

const BlogSection = async () => {
  try {
    const response = await getBlogPosts({
      page: 1,
      limit: 6,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      status: 'PUBLISHED',
    });

    return <BlogSectionClient posts={response.data} />;
  } catch {
    return <BlogSectionClient posts={[]} />;
  }
};

export default BlogSection;
