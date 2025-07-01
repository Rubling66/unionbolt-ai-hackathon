import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import ErrorBoundary from '@/components/ErrorBoundary';
import PageTransition from '@/components/PageTransition';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'UnionBolt AI - Power of Knowledge',
  description: 'Harness the power of AI-driven knowledge management. Transform how organizations learn, protect, and grow.',
  keywords: 'union, AI, knowledge management, workplace safety, collective bargaining, member services',
  authors: [{ name: 'UnionBolt AI Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#00ff00',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <ErrorBoundary>
          <PageTransition>
            {children}
          </PageTransition>
        </ErrorBoundary>
      </body>
    </html>
  );
}