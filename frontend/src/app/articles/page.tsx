'use client';

import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { api, Article } from '@/lib/api';

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [query, setQuery] = useState('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .getArticles(query, page)
      .then((res) => {
        setArticles(res.articles ?? []);
        setTotal(res.total);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [query, page]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Search Articles</h1>
          <p className="text-slate-400">Browse fetched and summarized articles</p>
        </div>

        <input
          type="search"
          placeholder="Search by title or description..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          className="input max-w-md"
        />

        {loading ? (
          <p className="text-slate-400">Loading...</p>
        ) : (
          <div className="space-y-3">
            {articles.map((a) => (
              <div key={a.id} className="card">
                <div className="flex flex-col gap-2">
                  <a href={a.url} target="_blank" rel="noopener noreferrer" className="font-medium text-indigo-300 hover:underline">
                    {a.title}
                  </a>
                  <p className="text-sm text-slate-400">
                    {a.sourceName}
                    {a.publishedAt && ` · ${new Date(a.publishedAt).toLocaleDateString('en-IN')}`}
                  </p>
                  {a.summary && (
                    <div className="mt-2 space-y-1 text-sm">
                      <span className="badge badge-info">{a.summary.category}</span>
                      <span className="ml-2 text-slate-500">Score: {a.summary.importanceScore}/10</span>
                      <p className="text-slate-300">{a.summary.summary}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {total > 20 && (
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary">Previous</button>
            <span className="flex items-center text-sm text-slate-400">Page {page}</span>
            <button onClick={() => setPage((p) => p + 1)} disabled={page * 20 >= total} className="btn-secondary">Next</button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
