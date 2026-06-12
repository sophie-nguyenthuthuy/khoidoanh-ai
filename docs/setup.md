# Local setup

## Yêu cầu

- Node 20.10+ (xem `.nvmrc`)
- pnpm 9
- Postgres 16 (Docker hoặc local)
- Tài khoản: Anthropic, Stripe (test mode), Upstash, Resend, Vercel Blob

## Bước

```bash
git clone <repo>
cd khoidoanh-ai
nvm use
pnpm install
cp .env.example .env.local
```

Điền các biến môi trường trong `.env.local`. Tối thiểu cần:
- `DATABASE_URL` — chỉ Postgres
- `AUTH_SECRET` — `openssl rand -base64 32`
- `LLM_BASE_URL` (mặc định Ollama: `http://localhost:11434/v1`) — tự host Qwen 2.5 hoặc model OSS khác
- `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET`
- `UPSTASH_REDIS_REST_URL` + token
- `NEXT_PUBLIC_APP_URL=http://localhost:3000`

Khởi động Postgres + Redis qua Docker:

```bash
docker compose up -d postgres redis
```

Tạo schema + seed VSIC:

```bash
pnpm db:push
pnpm db:seed
```

Chạy dev:

```bash
pnpm dev
```

Mở http://localhost:3000.

## Stripe webhooks (local)

```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy webhook secret (`whsec_...`) vào `STRIPE_WEBHOOK_SECRET` trong `.env.local`.

## Troubleshooting

- **`env validation failed`** — set `SKIP_ENV_VALIDATION=1` chỉ khi build CI.
- **`drizzle-kit push` báo lỗi enum** — drop database và push lại (vì enum thay đổi không tự migrate).
- **Webhook 400 invalid signature** — đảm bảo `STRIPE_WEBHOOK_SECRET` khớp với secret từ `stripe listen`.
