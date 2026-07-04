import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().default('http://localhost:3000'),
  JWT_SECRET: z.string().min(8),
  ADMIN_USERNAME: z.string().default('admin'),
  ADMIN_PASSWORD: z.string().min(4),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),
  WHATSAPP_PROVIDER: z.enum(['cloud', 'twilio', 'baileys']).default('baileys'),
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
  WHATSAPP_RECIPIENT: z.string().default('919384422891'),
  SCHEDULE_CRON: z.string().default('0 11 * * *'),
  SCHEDULE_TIMEZONE: z.string().default('Asia/Kolkata'),
  MAX_ARTICLES_PER_DIGEST: z.coerce.number().default(10),
  MIN_IMPORTANCE_SCORE: z.coerce.number().default(6),
  CACHE_TTL_MINUTES: z.coerce.number().default(30),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
});

export const env = envSchema.parse(process.env);

export const NEWS_SOURCES = [
  // Tech News
  {
    name: 'TechCrunch',
    slug: 'techcrunch',
    type: 'RSS' as const,
    url: 'https://techcrunch.com/feed/',
  },
  {
    name: 'The Verge',
    slug: 'the-verge',
    type: 'RSS' as const,
    url: 'https://www.theverge.com/rss/index.xml',
  },
  {
    name: 'Ars Technica',
    slug: 'ars-technica',
    type: 'RSS' as const,
    url: 'https://feeds.arstechnica.com/arstechnica/index',
  },
  {
    name: 'InfoQ',
    slug: 'infoq',
    type: 'RSS' as const,
    url: 'https://feed.infoq.com/',
  },

  // AI
  {
    name: 'Google AI',
    slug: 'google-ai',
    type: 'RSS' as const,
    url: 'https://blog.google/technology/ai/rss/',
  },

  // Cloud
  {
    name: 'AWS',
    slug: 'aws',
    type: 'RSS' as const,
    url: 'https://aws.amazon.com/blogs/aws/feed/',
  },
  {
    name: 'Microsoft DevBlogs',
    slug: 'microsoft',
    type: 'RSS' as const,
    url: 'https://devblogs.microsoft.com/feed/',
  },
  {
    name: 'Cloudflare',
    slug: 'cloudflare',
    type: 'RSS' as const,
    url: 'https://blog.cloudflare.com/rss/',
  },

  // Frameworks
  {
    name: 'GitHub Blog',
    slug: 'github-blog',
    type: 'RSS' as const,
    url: 'https://github.blog/feed/',
  },
  {
    name: 'Vercel',
    slug: 'vercel',
    type: 'RSS' as const,
    url: 'https://vercel.com/blog/rss.xml',
  },

  // APIs
  {
    name: 'Hacker News',
    slug: 'hacker-news',
    type: 'API' as const,
    url: 'https://hacker-news.firebaseio.com/v0',
  },

  // Scraping
  {
    name: 'GitHub Trending',
    slug: 'github-trending',
    type: 'SCRAPE' as const,
    url: 'https://github.com/trending',
  },
];

export const CATEGORIES = [
  'AI', 'Programming', 'Cloud', 'Security', 'Mobile', 'Startup', 'Web', 'DevOps', 'Hardware', 'Other',
];
