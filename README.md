# TechDigest AI

Daily AI-powered technology news digest that fetches articles from trusted sources, summarizes them with strict content integrity rules, formats a WhatsApp-friendly message, and sends it on a schedule.

## Features

- **Multi-source news fetching** — TechCrunch, The Verge, Hacker News, Ars Technica, GitHub Trending, Product Hunt, Google AI Blog, OpenAI Blog, Microsoft Dev Blog, AWS Blog
- **AI summarization** — 2–3 sentence summaries with category, importance score, why it matters, and key takeaway
- **Content integrity** — Verification step before sending; no invented facts; original URLs preserved
- **WhatsApp delivery** — WhatsApp Cloud API or Twilio
- **Daily scheduling** — Configurable cron (default 8:00 AM IST)
- **Web dashboard** — Manage sources, schedule, view digests, search articles, view logs
- **Production ready** — Docker Compose, PostgreSQL, rate limiting, caching, retries

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Next.js    │────▶│   Express    │────▶│ PostgreSQL  │
│  Dashboard  │     │   Backend    │     │   (Prisma)  │
└─────────────┘     └──────┬───────┘     └─────────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
         News RSS/    OpenAI API    WhatsApp
         HN API       Summaries     Cloud/Twilio
```

## Quick Start (Docker)

1. **Clone and configure**

```bash
cd techdigest-ai
cp .env.example .env
# Edit .env with your API keys and WhatsApp credentials
```

2. **Start all services**

```bash
docker compose up -d --build
```

3. **Open the dashboard**

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- Default login: `admin` / value of `ADMIN_PASSWORD` in `.env`

## Local Development

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- OpenAI API key (optional for fallback mode)

### Backend

```bash
cd backend
cp ../.env.example .env
npm install
npx prisma db push
npm run db:seed
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | — |
| `JWT_SECRET` | JWT signing secret | — |
| `ADMIN_USERNAME` | Dashboard admin username | `admin` |
| `ADMIN_PASSWORD` | Dashboard admin password | — |
| `OPENAI_API_KEY` | OpenAI API key | — |
| `OPENAI_MODEL` | Model for summarization | `gpt-4o-mini` |
| `WHATSAPP_PROVIDER` | `cloud`, `twilio`, or `baileys` | `cloud` |
| `WHATSAPP_CLOUD_TOKEN` | Meta WhatsApp Cloud API token | — |
| `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp phone number ID | — |
| `WHATSAPP_RECIPIENT` | Recipient phone (country code, no +) | — |
| `SCHEDULE_CRON` | Cron expression | `0 8 * * *` |
| `SCHEDULE_TIMEZONE` | Timezone | `Asia/Kolkata` |
| `MAX_ARTICLES_PER_DIGEST` | Max articles in digest | `10` |
| `MIN_IMPORTANCE_SCORE` | Minimum AI score to include | `6` |

## WhatsApp Setup

### Option A: WhatsApp Cloud API

1. Create a Meta Developer app with WhatsApp product
2. Get access token and phone number ID
3. Set `WHATSAPP_PROVIDER=cloud` and related env vars

### Option B: Twilio WhatsApp

1. Set up Twilio WhatsApp sandbox or approved sender
2. Set `WHATSAPP_PROVIDER=twilio` and Twilio env vars

### Option C: Baileys WhatsApp

1. Use the local Baileys provider for direct WhatsApp connection.
2. Set `WHATSAPP_PROVIDER=baileys` and scan the QR code when prompted.

> If WhatsApp is not configured, digests are still generated and stored; messages are logged instead of sent.

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/login` | No | Admin login |
| GET | `/auth/health` | No | Health check |
| GET | `/api/dashboard` | Yes | Dashboard overview |
| GET/PATCH | `/api/sources` | Yes | Manage news sources |
| GET/PUT | `/api/schedule` | Yes | Schedule settings |
| GET | `/api/digests` | Yes | List/search digests |
| POST | `/api/digests/trigger` | Yes | Manual digest run |
| GET | `/api/articles` | Yes | Search articles |
| GET | `/api/logs` | Yes | Application logs |

## Content Integrity

TechDigest AI enforces strict summarization rules:

- Never alter, exaggerate, or invent information
- Preserve facts, numbers, dates, names, and technical terms
- Verify each summary against the source before sending
- One summary per source article — no mixing
- Include source name, publication time, and URL for every item

## Testing

```bash
cd backend
npm test
```

## Project Structure

```
techdigest-ai/
├── backend/
│   ├── prisma/           # Database schema
│   └── src/
│       ├── config/       # Environment config
│       ├── middleware/   # Auth, error handling
│       ├── routes/       # API routes
│       ├── services/
│       │   ├── ai/       # OpenAI summarization & verification
│       │   ├── digest/   # Digest pipeline & formatting
│       │   ├── news/     # News fetching
│       │   ├── scheduler/# Cron scheduling
│       │   └── whatsapp/ # WhatsApp delivery
│       └── utils/        # Cache, logging, helpers
├── frontend/
│   └── src/
│       ├── app/          # Next.js pages
│       ├── components/   # UI components
│       └── lib/          # API client
└── docker-compose.yml
```

## License

MIT
