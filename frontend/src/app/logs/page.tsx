'use client';

import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { api, AppLog } from '@/lib/api';

export default function LogsPage() {
  const [logs, setLogs] = useState<AppLog[]>([]);
  const [level, setLevel] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .getLogs(page, level || undefined)
      .then((res) => {
        setLogs(res.logs ?? []);
        setTotal(res.total);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, level]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Application Logs</h1>
          <p className="text-slate-400">Monitor system activity and errors</p>
        </div>

        <select value={level} onChange={(e) => { setLevel(e.target.value); setPage(1); }} className="input max-w-xs">
          <option value="">All levels</option>
          <option value="INFO">INFO</option>
          <option value="WARN">WARN</option>
          <option value="ERROR">ERROR</option>
          <option value="DEBUG">DEBUG</option>
        </select>

        {loading ? (
          <p className="text-slate-400">Loading...</p>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <div key={log.id} className="card py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`badge ${
                    log.level === 'ERROR' ? 'badge-error' :
                    log.level === 'WARN' ? 'badge-warning' :
                    log.level === 'INFO' ? 'badge-info' : 'badge-success'
                  }`}>
                    {log.level}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(log.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                  </span>
                </div>
                <p className="mt-1 text-sm">{log.message}</p>
                {log.context && (
                  <pre className="mt-1 overflow-x-auto text-xs text-slate-500">
                    {JSON.stringify(log.context, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}

        {total > 50 && (
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary">Previous</button>
            <span className="flex items-center text-sm text-slate-400">Page {page}</span>
            <button onClick={() => setPage((p) => p + 1)} disabled={page * 50 >= total} className="btn-secondary">Next</button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
