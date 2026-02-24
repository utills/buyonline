import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AppProviders from '@/providers/AppProviders';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'BuyOnline', template: '%s | BuyOnline' },
  description: "India's most trusted health insurance platform. IRDAI Approved.",
  keywords: ['health insurance', 'India', 'IRDAI', 'family health plan'],
  openGraph: {
    title: 'BuyOnline - Health Insurance',
    description: "India's most trusted health insurance platform. IRDAI Approved.",
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ED1B2D',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-white text-gray-900`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
