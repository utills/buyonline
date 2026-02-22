'use client';

import React from 'react';

export interface FooterProps {
  className?: string;
}

const linkSections = [
  {
    title: 'Insurance Plans',
    links: ['Health Insurance', 'Family Health Plan', 'Senior Citizen Plan', 'Critical Illness Cover'],
  },
  {
    title: 'Tools & Educational Resources',
    links: ['Premium Calculator', 'Claim Settlement Ratio', 'Health Articles', 'FAQs'],
  },
  {
    title: 'Claims',
    links: ['Claim Process', 'Track Claim', 'Network Hospitals', 'Download Forms'],
  },
  {
    title: 'Legal',
    links: ['Privacy Policy', 'Terms & Conditions', 'Disclaimer', 'Grievance Redressal'],
  },
  {
    title: 'About Prudential',
    links: ['About Us', 'Careers', 'Media', 'Contact Us'],
  },
  {
    title: 'Login',
    links: ['Customer Login', 'Agent Login', 'Partner Login'],
  },
];

export const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  return (
    <footer className={`bg-[#1A1A1A] text-white ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Company Info */}
        <div className="mb-10">
          <div className="text-xl font-bold text-white mb-4">
            Prudential Health Insurance
          </div>
          <p className="text-gray-400 text-sm max-w-md">
            501, BKC Corporate Tower, Bandra (E), Mumbai - 400051
          </p>
          <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-gray-400">
            <span className="flex items-center gap-1.5">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14.5 11.3V13.3C14.5 13.7 14.2 14 13.8 14C7.6 14 2 8.9 2 3.2C2 2.8 2.3 2.5 2.7 2.5H4.7C5.1 2.5 5.4 2.8 5.5 3.2L6 5.2C6.1 5.5 6 5.9 5.7 6.1L4.4 7.2C5.3 9.1 6.9 10.7 8.8 11.6L9.9 10.3C10.1 10 10.5 9.9 10.8 10L12.8 10.5C13.2 10.6 13.5 10.9 13.5 11.3H14.5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              1800 123 4567 | 1860 500 7890
            </span>
            <span className="flex items-center gap-1.5">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 4L8 9L14 4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="2" y="3" width="12" height="10" rx="1" stroke="currentColor" strokeLinecap="round" />
              </svg>
              prudentialcareforyou@phi.com
            </span>
          </div>
        </div>

        {/* Link Sections */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 mb-10">
          {linkSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-white mb-3">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social Media */}
        <div className="flex items-center gap-4 pb-8 border-b border-gray-700">
          <span className="text-sm text-gray-400">Follow us</span>
          {['Facebook', 'LinkedIn', 'X', 'YouTube'].map((platform) => (
            <div
              key={platform}
              className="w-9 h-9 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center cursor-pointer transition-colors duration-200"
              title={platform}
            >
              <span className="text-xs text-gray-300 font-medium">
                {platform[0]}
              </span>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="pt-8">
          <p className="text-xs text-gray-500 leading-relaxed">
            Disclaimer: Prudential Health Insurance is the brand name of Prudential Health Insurance Company Limited.
            Insurance is the subject matter of solicitation. Visitors are hereby informed that their information
            submitted on the website may be shared with insurers. Product information is authentic and solely based on
            the information received from the insurers. IRDAI is not involved in activities like selling insurance
            directly or indirectly. Please verify the authenticity of the claims made before acting upon them.
          </p>
          <p className="text-xs text-gray-500 mt-4">
            &copy; {new Date().getFullYear()} Prudential Health Insurance. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
