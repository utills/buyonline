import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AppProviders from '@/providers/AppProviders';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'BuyOnline - Health Insurance',
  description:
    "India's health insurance that puts your family first. Get comprehensive health coverage with Prudential Health Insurance.",
  keywords: [
    'health insurance',
    'family insurance',
    'medical coverage',
    'Prudential',
    'BuyOnline',
  ],
  openGraph: {
    title: 'BuyOnline - Health Insurance',
    description:
      "India's health insurance that puts your family first.",
    type: 'website',
  },
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
