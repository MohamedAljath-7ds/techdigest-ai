'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clearToken } from '@/lib/api';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/digests', label: 'Digests', icon: '📰' },
  { href: '/articles', label: 'Articles', icon: '🔍' },
  { href: '/sources', label: 'Sources', icon: '📡' },
  { href: '/schedule', label: 'Schedule', icon: '⏰' },
  { href: '/logs', label: 'Logs', icon: '📋' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const logout = () => {
    clearToken();
    router.push('/login');
  };

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-700/50 bg-slate-900/95 backdrop-blur md:flex">
        <div className="flex h-16 items-center gap-2 border-b border-slate-700/50 px-6">
          <span className="text-2xl">🚀</span>
          <div>
            <h1 className="text-lg font-bold text-white">TechDigest AI</h1>
            <p className="text-xs text-slate-400">Daily tech news</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? 'bg-indigo-600/20 text-indigo-300'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-700/50 p-4">
          <button onClick={logout} className="btn-secondary w-full text-sm">
            Sign out
          </button>
        </div>
      </aside>

      <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-slate-700/50 bg-slate-900/95 px-4 backdrop-blur md:hidden">
        <div className="flex items-center gap-2">
          <span className="text-xl">🚀</span>
          <span className="font-bold">TechDigest AI</span>
        </div>
        <button onClick={logout} className="text-sm text-slate-400 hover:text-white">
          Sign out
        </button>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-slate-700/50 bg-slate-900/95 md:hidden">
        {navItems.slice(0, 5).map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center py-2 text-xs ${
                active ? 'text-indigo-400' : 'text-slate-400'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
