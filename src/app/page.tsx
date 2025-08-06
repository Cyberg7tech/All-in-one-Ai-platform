// This is the entry component for the landing page of the application.

import Features from '@/components/landing-page/Features';
import FeaturedOn from '@/components/landing-page/FeaturedOn';
import Footer from '@/components/landing-page/Footer';
import FAQs from '@/components/landing-page/FAQs';
import Hero from '@/components/landing-page/Hero';
import Pricing from '@/components/landing-page/Pricing';
import WorkFlow from '@/components/landing-page/WorkFlow';
import Navbar from '@/components/landing-page/Navbar';

export default async function Home() {
  return (
    <>
      <Navbar />
      <div className='bg-lp-background'>
        <div className='max-w-6xl mx-auto pt-20'>
          <Hero />
          <FeaturedOn />
          <Features />
          <WorkFlow />
          <Pricing />
          <FAQs />
          <Footer />
        </div>
      </div>
    </>
  );
}
