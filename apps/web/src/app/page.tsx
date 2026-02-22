import HeroBanner from '@/components/landing/HeroBanner';
import MemberSelector from '@/components/landing/MemberSelector';
import LeadForm from '@/components/landing/LeadForm';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <HeroBanner />

      {/* Form Section */}
      <div className="max-w-md mx-auto px-4 -mt-4 relative z-10 pb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          <MemberSelector />
          <hr className="border-gray-100" />
          <LeadForm />
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#1A1A1A] text-white py-8 px-6">
        <div className="max-w-md mx-auto space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
              <span className="text-[#E31837] font-bold text-xs">P</span>
            </div>
            <span className="text-sm font-semibold">Prudential Health Insurance</span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            IRDAI Registration No: XYZ123. Insurance is the subject matter of solicitation.
            For more details on risk factors, terms and conditions, please read the sales brochure
            carefully before concluding a sale.
          </p>
          <div className="flex gap-6 text-xs text-gray-400">
            <a href="/terms" className="hover:text-white">Terms & Conditions</a>
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Contact Us</a>
          </div>
          <p className="text-xs text-gray-500">
            &copy; 2026 Prudential Health Insurance. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
