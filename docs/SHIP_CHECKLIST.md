# Ship checklist — khoidoanh-ai

## 1. AI model

- [ ] **LLM tier**: dev defaults to `qwen2.5:7b-instruct`. Production GPU
      should set `LLM_MODEL=qwen2.5:32b-instruct` — charter generation
      (`generateCharter`) materially improves with the larger model.

## 2. Payments — Stripe

- [ ] **Stripe account** registered for the operating entity.
  - Note: Stripe doesn't directly onboard VN entities — most VN startups
    incorporate a US Delaware LLC or Singapore Pte Ltd as the merchant.
  - Alternatives if you want to stay VN-only: VNPay / MoMo / OnePay
    (would require swapping `lib/stripe/` for a VN gateway adapter).
- [ ] **Webhook endpoint** set in Stripe dashboard:
      `https://<your-domain>/api/stripe/webhook`
- [ ] **Webhook secret** copied to `.env` as `STRIPE_WEBHOOK_SECRET`.
- [ ] **Test mode → live mode** switch documented; PII-free webhook log
      retention ≥ 6 months.

## 3. Email — Resend

- [ ] **Resend account** at <https://resend.com> (or swap for AWS SES /
      Mailgun if you prefer).
- [ ] **Verify sending domain** with DNS records (SPF, DKIM, DMARC).
- [ ] **API key** in `.env` as `RESEND_API_KEY`.
- [ ] **From-address** in `EMAIL_FROM`.

## 4. Auth — Auth.js + Google OAuth

- [ ] **Google Cloud Console project** created.
- [ ] **OAuth consent screen** configured + verified (Google review takes
      4–6 weeks for production scopes).
- [ ] **OAuth client ID + secret** → `.env` as `AUTH_GOOGLE_ID` /
      `AUTH_GOOGLE_SECRET`.
- [ ] **Authorised redirect URIs** include `https://<domain>/api/auth/callback/google`.
- [ ] **`AUTH_SECRET`** generated: `openssl rand -base64 32`.

## 5. Database

- [ ] **Neon** or **Supabase Postgres** project (free tier covers pilot).
- [ ] **Connection string** in `.env` as `DATABASE_URL`.
- [ ] **Direct connection** for migrations (`DIRECT_URL` if using a
      connection pooler).
- [ ] **Migrations**: `pnpm db:migrate && pnpm db:seed`.

## 6. Rate limiting — Upstash Redis

- [ ] **Upstash Redis** instance.
- [ ] `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` in `.env`.

## 7. File storage — Vercel Blob (or swap)

- [ ] **Vercel Blob** token (`BLOB_READ_WRITE_TOKEN`) if hosting on Vercel.
- [ ] Or swap to S3/MinIO — adapter lives at `lib/documents/pdf-service.ts`.

## 8. Compliance — Luật Doanh Nghiệp 2020

- [ ] **VSIC code dataset** kept current (yearly update from Tổng cục Thống kê).
- [ ] **Charter template versions** captured in `prompts/charter.ts` —
      any breaking change to legal-references gets a `_PROMPT_VERSION` bump.
- [ ] **DKKD National Portal** integration (`DKKD_NATIONAL_PORTAL_API_KEY`)
      — apply via Sở Kế Hoạch Đầu Tư province by province.

## 9. Smoke before release

```
make smoke PROJECT=khoidoanh-ai
SKIP_ENV_VALIDATION=1 pnpm typecheck && pnpm test
```
