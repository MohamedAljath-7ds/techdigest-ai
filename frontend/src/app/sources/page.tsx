'use client';

import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { api, Source } from '@/lib/api';

export default function SourcesPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSources().then(setSources).catch(console.error).finally(() => setLoading(false));
  }, []);

  const toggleSource = async (source: Source) => {
    const updated = await api.updateSource(source.id, !source.enabled);
    setSources((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">News Sources</h1>
          <p className="text-slate-400">Enable or disable news sources</p>
        </div>

        {loading ? (
          <p className="text-slate-400">Loading...</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {sources.map((source) => (
              <div key={source.id} className="card">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold">{source.name}</h3>
                    <p className="text-sm text-slate-400">{source.type} · {source.slug}</p>
                    {source.lastFetched && (
                      <p className="mt-1 text-xs text-slate-500">
                        Last fetched: {new Date(source.lastFetched).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                      </p>
                    )}
                    {source.lastError && (
                      <p className="mt-1 text-xs text-red-400">Error: {source.lastError}</p>
                    )}
                  </div>
                  <button
                    onClick={() => toggleSource(source)}
                    className={`relative h-7 w-12 shrink-0 rounded-full transition ${source.enabled ? 'bg-indigo-600' : 'bg-slate-600'}`}
                    aria-label={`Toggle ${source.name}`}
                  >
                    <span
                      className={`absolute top-0.5 h-6 w-6 rounded-full bg-white transition ${source.enabled ? 'left-5' : 'left-0.5'}`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
