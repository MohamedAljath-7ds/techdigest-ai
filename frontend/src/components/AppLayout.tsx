'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/api';
import Sidebar from '@/components/Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="md:ml-64">
        <div className="px-4 pb-20 pt-16 md:px-8 md:pb-8 md:pt-8">{children}</div>
      </main>
    </div>
  );
}
