'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { api, DigestDetail } from '@/lib/api';

export default function DigestDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [digest, setDigest] = useState<DigestDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDigest(id).then(setDigest).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <AppLayout><p className="text-slate-400">Loading...</p></AppLayout>;
  if (!digest) return <AppLayout><p className="text-red-400">Digest not found</p></AppLayout>;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{digest.title}</h1>
          <p className="text-slate-400">
            {new Date(digest.date).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
            {' · '}{digest.sendStatus}
          </p>
        </div>

        <div className="card">
          <h2 className="mb-3 font-semibold">WhatsApp Message</h2>
          <pre className="whitespace-pre-wrap text-sm text-slate-300">{digest.message}</pre>
        </div>

        {digest.topFiveMessage && (
          <div className="card">
            <h2 className="mb-3 font-semibold">Top 5 in 60 Seconds</h2>
            <pre className="whitespace-pre-wrap text-sm text-slate-300">{digest.topFiveMessage}</pre>
          </div>
        )}

        <div className="card">
          <h2 className="mb-3 font-semibold">Articles ({digest.items?.length ?? 0})</h2>
          <div className="space-y-4">
            {digest.items?.map((item) => (
              <div key={item.article.id} className="rounded-lg border border-slate-700/50 p-4">
                <p className="font-medium">#{item.rank} {item.article.title}</p>
                <p className="text-sm text-slate-400">{item.article.sourceName}</p>
                {item.article.summary && (
                  <p className="mt-2 text-sm text-slate-300">{item.article.summary.summary}</p>
                )}
                <a href={item.article.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm text-indigo-400 hover:underline">
                  View source →
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
