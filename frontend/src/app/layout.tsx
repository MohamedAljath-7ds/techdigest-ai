import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TechDigest AI',
  description: 'Daily AI-powered technology news digest dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
