import ComingSoon from '@/components/ComingSoon';
import { Footer, Navbar } from '@/components/landing-page';
import React from 'react';

const page = () => {
  return (
    <>
      <Navbar />
      <main className='min-h-[calc(100vh-56px)] flex-1'>
        <ComingSoon />
      </main>
      <Footer />
    </>
  );
};

export default page;
