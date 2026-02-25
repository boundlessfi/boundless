import BlogHero from '@/components/landing-page/blog/BlogHero';
import StreamingBlogGrid from '@/components/landing-page/blog/StreamingBlogGrid';
import { getAllBlogPosts } from '@/lib/mdx';

const BlogsPage = async () => {
  const posts = getAllBlogPosts();

  return (
    <div className='bg-background-main-bg min-h-screen'>
      <div className='mx-auto max-w-[1440px] px-5 py-5 md:px-[50px] lg:px-[100px]'>
        <BlogHero />
        <StreamingBlogGrid initialPosts={posts} />
      </div>
    </div>
  );
};

export default BlogsPage;
