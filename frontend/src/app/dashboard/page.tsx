'use client';

import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { api, DashboardData } from '@/lib/api';

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.getDashboard().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  const triggerDigest = async () => {
    setTriggering(true);
    setMessage('');
    try {
      const result = await api.triggerDigest();
      setMessage(`Digest triggered successfully! ID: ${result.digestId}`);
      const updated = await api.getDashboard();
      setData(updated);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to trigger digest');
    } finally {
      setTriggering(false);
    }
  };

  if (loading) return <AppLayout><div className="text-slate-400">Loading dashboard...</div></AppLayout>;
  if (!data) return <AppLayout><div className="text-red-400">Failed to load dashboard</div></AppLayout>;

  const enabledSources = data.sources.filter((s) => s.enabled).length;

  return (
    <AppLayout>
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400">Overview of your daily tech digest</p>
        </div>
        <button onClick={triggerDigest} disabled={triggering} className="btn-primary">
          {triggering ? 'Running...' : '⚡ Trigger Digest Now'}
        </button>
      </div>

      {message && (
        <div className="card border-indigo-500/30 bg-indigo-500/10 text-indigo-200">{message}</div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Articles Stored" value={data.articleCount} icon="📚" />
        <StatCard label="Active Sources" value={`${enabledSources}/${data.sources.length}`} icon="📡" />
        <StatCard
          label="Schedule"
          value={data.schedule.enabled ? 'Active' : 'Paused'}
          icon="⏰"
          sub={`${data.schedule.cronExpr} (${data.schedule.timezone})`}
        />
        <StatCard label="Log Entries" value={data.logCount} icon="📋" />
      </div>

      <div className="card">
        <h2 className="mb-4 text-lg font-semibold">Recent Digests</h2>
        {data.recentDigests.length === 0 ? (
          <p className="text-slate-400">No digests yet. Trigger one to get started.</p>
        ) : (
          <div className="space-y-3">
            {data.recentDigests.map((d) => (
              <div
                key={d.id}
                className="flex flex-col gap-2 rounded-lg border border-slate-700/50 bg-slate-900/50 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{d.title}</p>
                  <p className="text-sm text-slate-400">
                    {new Date(d.date).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                    {' · '}
                    {d.triggeredBy}
                  </p>
                </div>
                <StatusBadge status={d.sendStatus} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </AppLayout>
  );
}

function StatCard({
  label,
  value,
  icon,
  sub,
}: {
  label: string;
  value: string | number;
  icon: string;
  sub?: string;
}) {
  return (
    <div className="card">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {sub && <p className="text-xs text-slate-500">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === 'SENT' ? 'badge-success' : status === 'FAILED' ? 'badge-error' : 'badge-warning';
  return <span className={`badge ${cls}`}>{status}</span>;
}
