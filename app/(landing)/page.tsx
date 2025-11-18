import BeamBackground from '@/components/landing-page/BeamBackground';
import WhyBoundless from '@/components/landing-page/WhyBoundless';
import BackedBy from '@/components/landing-page/BackedBy';
import NewsLetter from '@/components/landing-page/NewsLetter';
import BlogSection from '@/components/landing-page/blog/BlogSection';
import Explore from '@/components/landing-page/Explore';
import CleanBanner from '@/components/landing-page/Banner';
import Hero2 from '@/components/landing-page/Hero2';

export default function LandingPage() {
  return (
    <div className='relative overflow-hidden'>
      <BeamBackground />
      <div className='relative z-10 mx-auto max-w-[1440px] space-y-[60px] px-5 py-5 md:space-y-[80px] md:px-[50px] lg:px-[100px]'>
        {/* <Hero /> */}
        <Hero2 />
        <Explore />
        <WhyBoundless />
        <BackedBy />
        <NewsLetter />
        <BlogSection />
        <CleanBanner />
      </div>
    </div>
  );
}
