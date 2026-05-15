# Kiến trúc hệ thống

## Tổng quan

Khởi Doanh AI là Next.js 14 monolith (App Router + RSC + Server Actions) chạy trên Vercel (hoặc Docker tự host). Postgres lưu trữ dữ liệu chính, Upstash Redis cho rate-limit và session ngắn hạn, Vercel Blob cho file PDF.

## Lớp

```
Client (RSC + Client Components)
     │
     ▼
Server Actions / Route Handlers / Auth.js
     │
     ▼
Services Layer (src/server/services)
     │
     ├─→ Drizzle ORM ─→ Postgres
     ├─→ Anthropic SDK ─→ Claude API
     ├─→ Stripe SDK ─→ Stripe
     └─→ Resend / Vercel Blob
```

### 1. Client

- RSC làm mặc định, Client Components chỉ khi cần interactivity.
- Tailwind + shadcn/ui cho design system.
- `react-hook-form` + `zod` cho form, validation chạy 2 lớp (client + server).

### 2. Server Actions / Route Handlers

- **Server Actions** dùng cho mọi mutation từ form (wizard).
- **Route Handlers** (`app/api/*`) dùng cho:
  - Webhooks (Stripe)
  - Calls từ client component (AI streaming, fetch tài liệu)
  - Public health check

### 3. Services Layer

`src/server/services/*` chứa business logic. KHÔNG được call trực tiếp DB từ component/server action — phải đi qua service.

### 4. AI Layer

`src/lib/ai/*`:
- `client.ts` — Anthropic SDK với connection pool + cost tracking.
- `charter-generator.ts` — wrapper với schema validation + DB logging.
- `business-code-recommender.ts` — keyword shortlist → Claude → validate against VSIC.
- `prompts/` — prompt strings được **versioned** (e.g. `charter@2026-05-15`).

**Quan trọng:** mỗi lần update prompt, tăng version. Lưu lại ai_generations.promptVersion để audit về sau.

### 5. Data

```
users ──┬─→ registrations ──┬─→ members
        │                   ├─→ documents
        │                   └─→ payments
        ├─→ payments
        ├─→ subscriptions
        └─→ accounts/sessions (Auth.js)

business_codes (VSIC standalone, ~734 entries)
ai_generations (cost + audit log)
audit_logs (PII edit trail)
legal_versions (changelog of regulatory updates)
```

## Pháp lý — moat chính

Hệ thống ngành kinh tế VSIC (`Quyết định 27/2018/QĐ-TTg`) và mẫu điều lệ (`Luật DN 59/2020`) có thể thay đổi. Quy trình cập nhật:

1. Bump `LEGAL_VERSION` trong `src/config/legal.ts`.
2. Thêm entry vào bảng `legal_versions`.
3. Update prompt version trong `lib/ai/prompts/*`.
4. Hồ sơ mới dùng version mới; hồ sơ cũ vẫn giữ snapshot.

## Bảo mật

- PII (CCCD, MST) ở `legal_representative` JSONB. Production nên mã hoá at-rest bằng `pgcrypto` (chưa implement).
- Rate limit 3 cấp: AI (5/min), API thường (30/min), auth (5/10min).
- CSP + HSTS headers ở `next.config.mjs`.
- Audit log cho UPDATE/DELETE trên registrations.
- Stripe webhook verify signature.

## Cost tracking

Mỗi gọi Claude → `ai_generations` ghi tokens + estimated cost. Query dashboard:

```sql
SELECT date_trunc('day', created_at) day,
       SUM(cost_usd) / 1000000 AS usd
FROM ai_generations
GROUP BY 1 ORDER BY 1 DESC LIMIT 30;
```
