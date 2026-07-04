import { Router, Response } from 'express';
import { prisma } from '../utils/logger';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { runDigestPipeline, getDigestById, searchDigests, searchArticles } from '../services/digest/digestService';
import { getScheduleSettings, updateScheduleSettings } from '../services/scheduler/schedulerService';

const router = Router();

router.use(authMiddleware);

router.get('/dashboard', async (_req: AuthRequest, res: Response) => {
  const [sources, recentDigests, schedule, logCount, articleCount] = await Promise.all([
    prisma.source.findMany({ orderBy: { name: 'asc' } }),
    prisma.digest.findMany({
      orderBy: { date: 'desc' },
      take: 5,
      select: { id: true, title: true, date: true, sendStatus: true, sentAt: true },
    }),
    getScheduleSettings(),
    prisma.appLog.count(),
    prisma.article.count(),
  ]);

  res.json({ sources, recentDigests, schedule, logCount, articleCount });
});

router.get('/sources', async (_req: AuthRequest, res: Response) => {
  const sources = await prisma.source.findMany({ orderBy: { name: 'asc' } });
  res.json(sources);
});

router.patch('/sources/:id', async (req: AuthRequest, res: Response) => {
  const { enabled } = req.body as { enabled?: boolean };
  const id = String(req.params.id);
  const source = await prisma.source.update({
    where: { id },
    data: { enabled: enabled ?? true },
  });
  res.json(source);
});

router.get('/schedule', async (_req: AuthRequest, res: Response) => {
  const schedule = await getScheduleSettings();
  res.json(schedule);
});

router.put('/schedule', async (req: AuthRequest, res: Response) => {
  const { cronExpr, timezone, enabled } = req.body as {
    cronExpr?: string;
    timezone?: string;
    enabled?: boolean;
  };
  const schedule = await updateScheduleSettings({ cronExpr, timezone, enabled });
  res.json(schedule);
});

router.get('/digests', async (req: AuthRequest, res: Response) => {
  const query = (req.query.q as string) ?? '';
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const result = await searchDigests(query, page, limit);
  res.json(result);
});

router.get('/digests/:id', async (req: AuthRequest, res: Response) => {
  const digest = await getDigestById(String(req.params.id));
  if (!digest) {
    res.status(404).json({ error: 'Digest not found' });
    return;
  }
  res.json(digest);
});

router.post('/digests/trigger', async (_req: AuthRequest, res: Response) => {
  try {
    const digestId = await runDigestPipeline('MANUAL');
    res.json({ success: true, digestId, message: 'Digest pipeline completed' });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Pipeline failed',
    });
  }
});

router.get('/articles', async (req: AuthRequest, res: Response) => {
  const query = (req.query.q as string) ?? '';
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const result = await searchArticles(query, page, limit);
  res.json(result);
});

router.get('/logs', async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const level = req.query.level as string | undefined;
  const skip = (page - 1) * limit;

  const where = level ? { level: level.toUpperCase() as 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' } : {};

  const [logs, total] = await Promise.all([
    prisma.appLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.appLog.count({ where }),
  ]);

  res.json({ logs, total, page, limit });
});

export default router;
