import { prisma } from './logger';

export async function getCached<T>(key: string): Promise<T | null> {
  const entry = await prisma.cacheEntry.findUnique({ where: { key } });
  if (!entry) return null;
  if (entry.expiresAt < new Date()) {
    await prisma.cacheEntry.delete({ where: { key } }).catch(() => {});
    return null;
  }
  return entry.value as T;
}

export async function setCache(key: string, value: unknown, ttlMinutes: number): Promise<void> {
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);
  await prisma.cacheEntry.upsert({
    where: { key },
    create: { key, value: value as object, expiresAt },
    update: { value: value as object, expiresAt },
  });
}

export async function clearExpiredCache(): Promise<void> {
  await prisma.cacheEntry.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
}
