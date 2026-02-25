import { Metadata } from 'next';
import HeroSection from '@/features/landing/components/HeroSection';
import JourneyChoice from '@/features/landing/components/JourneyChoice';
import HowItWorks from '@/features/landing/components/HowItWorks';
import TrustSection from '@/features/landing/components/TrustSection';
import FeaturesGrid from '@/features/landing/components/FeaturesGrid';
import SiteFooter from '@/features/landing/components/SiteFooter';
import LatestPosts from '@/features/landing/components/LatestPosts';

export const metadata: Metadata = {
  title: 'BuyOnline — Health Insurance Made Simple',
  description:
    "India's most trusted health insurance. Choose your perfect plan with AI guidance or step-by-step forms. IRDAI Approved.",
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <HeroSection />
      <JourneyChoice />
      <HowItWorks />
      <TrustSection />
      <FeaturesGrid />
      <LatestPosts />
      <SiteFooter />
    </main>
  );
}
