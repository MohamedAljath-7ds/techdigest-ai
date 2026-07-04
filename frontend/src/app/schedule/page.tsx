'use client';

import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { api, ScheduleSettings } from '@/lib/api';

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<ScheduleSettings | null>(null);
  const [cronExpr, setCronExpr] = useState('');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [enabled, setEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.getSchedule().then((s) => {
      setSchedule(s);
      setCronExpr(s.cronExpr);
      setTimezone(s.timezone);
      setEnabled(s.enabled);
    }).catch(console.error);
  }, []);

  const save = async () => {
    setSaving(true);
    setMessage('');
    try {
      const updated = await api.updateSchedule({ cronExpr, timezone, enabled });
      setSchedule(updated);
      setMessage('Schedule updated successfully');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Schedule Settings</h1>
          <p className="text-slate-400">Configure when the daily digest runs</p>
        </div>

        <div className="card max-w-lg space-y-4">
          <div>
            <label className="mb-1 block text-sm text-slate-400">Cron Expression</label>
            <input value={cronExpr} onChange={(e) => setCronExpr(e.target.value)} className="input" />
            <p className="mt-1 text-xs text-slate-500">Default: 0 8 * * * (8:00 AM daily)</p>
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-400">Timezone</label>
            <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="input">
              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">America/New_York</option>
              <option value="Europe/London">Europe/London</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setEnabled(!enabled)}
              className={`relative h-7 w-12 rounded-full transition ${enabled ? 'bg-indigo-600' : 'bg-slate-600'}`}
            >
              <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white transition ${enabled ? 'left-5' : 'left-0.5'}`} />
            </button>
            <span className="text-sm">{enabled ? 'Scheduler enabled' : 'Scheduler paused'}</span>
          </div>

          <button onClick={save} disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save Schedule'}
          </button>

          {message && <p className="text-sm text-indigo-300">{message}</p>}
          {schedule && (
            <p className="text-xs text-slate-500">
              Current: {schedule.cronExpr} in {schedule.timezone}
            </p>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
