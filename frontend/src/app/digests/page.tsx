'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { api, DigestSummary } from '@/lib/api';

export default function DigestsPage() {
  const [digests, setDigests] = useState<DigestSummary[]>([]);
  const [query, setQuery] = useState('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .getDigests(query, page)
      .then((res) => {
        setDigests(res.digests ?? []);
        setTotal(res.total);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [query, page]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Previous Digests</h1>
          <p className="text-slate-400">Browse and search sent digests</p>
        </div>

        <input
          type="search"
          placeholder="Search digests..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          className="input max-w-md"
        />

        {loading ? (
          <p className="text-slate-400">Loading...</p>
        ) : digests.length === 0 ? (
          <p className="text-slate-400">No digests found.</p>
        ) : (
          <div className="space-y-3">
            {digests.map((d) => (
              <Link key={d.id} href={`/digests/${d.id}`} className="card block transition hover:border-indigo-500/50">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium">{d.title}</p>
                    <p className="text-sm text-slate-400">
                      {new Date(d.date).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                    </p>
                    {d.trendingTopics?.length > 0 && (
                      <p className="mt-1 text-xs text-indigo-400">
                        Trending: {d.trendingTopics.join(', ')}
                      </p>
                    )}
                  </div>
                  <span className={`badge ${d.sendStatus === 'SENT' ? 'badge-success' : d.sendStatus === 'FAILED' ? 'badge-error' : 'badge-warning'}`}>
                    {d.sendStatus}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {total > 10 && (
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary">
              Previous
            </button>
            <span className="flex items-center text-sm text-slate-400">Page {page}</span>
            <button onClick={() => setPage((p) => p + 1)} disabled={page * 10 >= total} className="btn-secondary">
              Next
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
