import { prisma } from '../src/utils/logger';
import { initializeSources } from '../src/services/news/newsService';

async function main() {
  await initializeSources();

  await prisma.scheduleSettings.upsert({
    where: { id: 'default' },
    create: {
      id: 'default',
      cronExpr: '0 8 * * *',
      timezone: 'Asia/Kolkata',
      enabled: true,
    },
    update: {},
  });

  console.log('Seed completed');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
