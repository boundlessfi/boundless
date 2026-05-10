import BeamBackground from '@/components/landing-page/BeamBackground';
import NewsLetter from '@/components/landing-page/NewsLetter';
import BlogSection from '@/components/landing-page/blog/BlogSection';
import Hero2 from '@/components/landing-page/Hero2';
import Explore from '@/components/landing-page/Explore';
import AudienceSplit from '@/components/landing-page/AudienceSplit';
import FourPrograms from '@/components/landing-page/FourPrograms';
import HowItWorksCompact from '@/components/landing-page/HowItWorksCompact';
import WhyStellar from '@/components/landing-page/WhyStellar';
import TrustAndProof from '@/components/landing-page/TrustAndProof';
import FinalCta from '@/components/landing-page/FinalCta';

export default function LandingPage() {
  return (
    <div className='relative overflow-x-clip'>
      <BeamBackground />
      <div className='relative z-10 mx-auto max-w-[1440px] space-y-[80px] px-5 pt-0 pb-5 md:space-y-[120px] md:px-[50px] lg:px-[100px]'>
        {/* §1 — Hero (production) */}
        <Hero2 />

        {/* Active opportunities */}
        <Explore />

        {/* §2 — Two-audience split */}
        <AudienceSplit />

        {/* §3 — The four programs */}
        <FourPrograms />

        {/* §4 — How it works (compact) */}
        <HowItWorksCompact />

        {/* §5 — Why Stellar */}
        <WhyStellar />

        {/* §6 — Trust and proof (SCF #40) */}
        <TrustAndProof />

        {/* §7 — From the blog */}
        <BlogSection />

        {/* Newsletter — between blog and final CTA */}
        <NewsLetter />

        {/* §8 — Final CTA */}
        <FinalCta />
      </div>
    </div>
  );
}
