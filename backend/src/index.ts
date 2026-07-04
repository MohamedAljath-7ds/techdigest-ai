import { createApp } from './app';
import { env } from './config/env';
import { prisma, persistLog } from './utils/logger';
import { initializeSources } from './services/news/newsService';
import { startScheduler } from './services/scheduler/schedulerService';
import { clearExpiredCache } from './utils/cache';
import { whatsAppService } from './services/whatsapp/whatsappService';



async function bootstrap() {
  await prisma.$connect();
  await persistLog('INFO', 'Database connected');

  await initializeSources();
  await persistLog('INFO', 'News sources initialized');

  await startScheduler();


  setInterval(() => {
    clearExpiredCache().catch(() => {});
  }, 60 * 60 * 1000);

  const app = createApp();
  app.listen(env.PORT, () => {
    persistLog('INFO', `TechDigest AI backend running on port ${env.PORT}`);
  });

  whatsAppService.initialize().catch(async (error) => {
  console.error("WhatsApp initialization failed:", error);

  await persistLog("ERROR", "WhatsApp initialization failed", {
    error: error instanceof Error ? error.message : "Unknown",
  });
});
}

bootstrap().catch(async (error) => {
  console.error('Failed to start server:', error);
  await persistLog('ERROR', 'Server startup failed', {
    error: error instanceof Error ? error.message : 'Unknown',
  });
  process.exit(1);
});
