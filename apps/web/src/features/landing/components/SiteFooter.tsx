import Link from 'next/link';

const PLAN_LINKS = [
  { label: 'Individual Plans', href: '/otp-verify' },
  { label: 'Family Floater', href: '/otp-verify' },
  { label: 'Senior Citizen Plans', href: '/otp-verify' },
  { label: 'Critical Illness Cover', href: '/otp-verify' },
];

const COMPANY_LINKS = [
  { label: 'About Us', href: '#' },
  { label: 'Careers', href: '#' },
  { label: 'Press', href: '#' },
  { label: 'Contact', href: '#' },
];

const SUPPORT_LINKS = [
  { label: 'Claims Process', href: '#' },
  { label: 'Network Hospitals', href: '#' },
  { label: 'FAQs', href: '#' },
  { label: 'Policy Documents', href: '#' },
];

const LEGAL_LINKS = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Service', href: '#' },
  { label: 'Cookie Policy', href: '#' },
  { label: 'Disclaimer', href: '#' },
];

export default function SiteFooter() {
  return (
    <footer style={{ backgroundColor: '#1A1A1A' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        {/* Top grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: '#ED1B2D' }}
              >
                P
              </div>
              <span className="font-semibold text-white text-lg">BuyOnline</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              India&apos;s trusted health insurance platform. IRDAI Approved.
            </p>
            <p className="text-gray-500 text-xs">
              IRDAI Reg. No. 128
              <br />
              CIN: U66010MH2000PLC128
            </p>
          </div>

          {/* Plans */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wide">
              Plans
            </h4>
            <ul className="space-y-2.5">
              {PLAN_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-400 text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wide">
              Support
            </h4>
            <ul className="space-y-2.5">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-400 text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wide">
              Company
            </h4>
            <ul className="space-y-2.5">
              {COMPANY_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-400 text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact bar */}
        <div className="border-t border-gray-800 pt-8 pb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
              <span>1800-123-4567 (Toll Free)</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              <span>support@buyonline.in</span>
            </div>
          </div>
        </div>

        {/* Legal bottom */}
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <p className="text-gray-600 text-xs">
            &copy; {new Date().getFullYear()} BuyOnline Insurance Pvt. Ltd. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-4">
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-gray-600 text-xs hover:text-gray-400 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* IRDAI disclaimer */}
        <p className="mt-6 text-gray-700 text-xs leading-relaxed">
          Insurance is the subject matter of solicitation. IRDAI Reg. No. 128. Trade logo displayed
          belongs to BuyOnline Insurance Pvt. Ltd. and used by it under licence. The information
          provided on this website is for general information purposes only and does not constitute
          professional advice.
        </p>
      </div>
    </footer>
  );
}
