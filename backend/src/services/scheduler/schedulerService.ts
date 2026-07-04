import cron from 'node-cron';
import { prisma, persistLog } from '../../utils/logger';
import { env } from '../../config/env';
import { runDigestPipeline } from '../digest/digestService';

let scheduledTask: cron.ScheduledTask | null = null;

export async function getScheduleSettings() {
  return prisma.scheduleSettings.upsert({
    where: { id: 'default' },
    create: {
      id: 'default',
      cronExpr: env.SCHEDULE_CRON,
      timezone: env.SCHEDULE_TIMEZONE,
      enabled: true,
    },
    update: {},
  });
}

export async function updateScheduleSettings(data: {
  cronExpr?: string;
  timezone?: string;
  enabled?: boolean;
}) {
  const settings = await prisma.scheduleSettings.upsert({
    where: { id: 'default' },
    create: {
      id: 'default',
      cronExpr: data.cronExpr ?? env.SCHEDULE_CRON,
      timezone: data.timezone ?? env.SCHEDULE_TIMEZONE,
      enabled: data.enabled ?? true,
    },
    update: data,
  });

  await restartScheduler();
  return settings;
}

export async function startScheduler(): Promise<void> {
  const settings = await getScheduleSettings();
  if (!settings.enabled) {
    await persistLog('INFO', 'Scheduler disabled');
    return;
  }

  if (!cron.validate(settings.cronExpr)) {
    await persistLog('ERROR', 'Invalid cron expression', { cron: settings.cronExpr });
    return;
  }

  scheduledTask = cron.schedule(
    settings.cronExpr,
    async () => {
      try {
        await runDigestPipeline('SCHEDULED');
      } catch (error) {
        await persistLog('ERROR', 'Scheduled digest failed', {
          error: error instanceof Error ? error.message : 'Unknown',
        });
      }
    },
    { timezone: settings.timezone }
  );

  await persistLog('INFO', 'Scheduler started', {
    cron: settings.cronExpr,
    timezone: settings.timezone,
  });
}

export async function restartScheduler(): Promise<void> {
  if (scheduledTask) {
    scheduledTask.stop();
    scheduledTask = null;
  }
  await startScheduler();
}

export function stopScheduler(): void {
  if (scheduledTask) {
    scheduledTask.stop();
    scheduledTask = null;
  }
}
