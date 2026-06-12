# Khởi Doanh AI

> Stripe Atlas cho Việt Nam — đăng ký kinh doanh trong 15 phút với AI

Nền tảng SaaS giúp founder Việt Nam thành lập **công ty (TNHH/CP)** hoặc **hộ kinh doanh** trong 15 phút. AI sinh điều lệ, chọn mã ngành VSIC, chuẩn bị hồ sơ và nộp qua Cổng thông tin quốc gia về đăng ký doanh nghiệp. Sau khi có giấy phép, upsell sang các dịch vụ định kỳ: kế toán thuế, hóa đơn điện tử, BHXH.

## Moat

Luật doanh nghiệp / thuế / lao động Việt Nam thay đổi liên tục (TT, NĐ ban hành hàng quý). Hệ thống `lib/business-codes` và `lib/ai/prompts` được phiên bản hoá; mỗi update pháp lý là một migration có audit trail → đối thủ nước ngoài như Stripe Atlas không thể bắt kịp tốc độ địa phương hoá.

## Sản phẩm

| Module | Mô tả | Doanh thu |
|---|---|---|
| `wizard/new` | Wizard 6 bước thành lập DN/HKD | 1.500.000đ / hồ sơ |
| `services/tax` | Kế toán thuế hàng tháng | 500k–3M/tháng |
| `services/einvoice` | Đăng ký + quản lý hóa đơn điện tử | 1M setup + 200k/tháng |
| `services/bhxh` | Đăng ký BHXH/BHYT/BHTN cho người lao động | 300k/lao động/tháng |

## Stack

- **Next.js 14** App Router, RSC, Server Actions
- **TypeScript** strict mode
- **Drizzle ORM** + **PostgreSQL** (Neon / Supabase)
- **OSS LLM tự host** (Qwen 2.5 mặc định, qua Ollama/vLLM với OpenAI-compatible endpoint) cho sinh điều lệ + tư vấn mã ngành — dữ liệu founder không rời hạ tầng VN
- **Auth.js v5** (email OTP + Google)
- **Stripe** cho thanh toán
- **Tailwind** + **shadcn/ui**
- **React PDF** cho tạo hồ sơ
- **Vitest** + **Playwright** cho test
- **Docker** + **GitHub Actions** cho CI/CD

## Bắt đầu

```bash
pnpm install
cp .env.example .env.local      # điền API keys
pnpm db:push                    # tạo schema
pnpm db:seed                    # nạp VSIC + templates
pnpm dev                        # http://localhost:3000
```

## Lệnh

| Lệnh | Mô tả |
|---|---|
| `pnpm dev` | Dev server |
| `pnpm build` | Build production |
| `pnpm start` | Start production |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | tsc --noEmit |
| `pnpm test` | Vitest |
| `pnpm test:e2e` | Playwright |
| `pnpm db:push` | Push schema |
| `pnpm db:generate` | Tạo migration |
| `pnpm db:migrate` | Chạy migration |
| `pnpm db:seed` | Seed VSIC + templates |
| `pnpm db:studio` | Drizzle Studio |

## Cấu trúc

```
src/
├── app/
│   ├── (marketing)/         # Landing, pricing, services
│   ├── (auth)/              # Login, register
│   ├── (dashboard)/         # Customer dashboard
│   ├── wizard/new/          # 6-step registration wizard
│   └── api/                 # Route handlers
├── lib/
│   ├── ai/                  # Claude integration + prompts (versioned)
│   ├── business-codes/      # VSIC database + recommender
│   ├── db/                  # Drizzle schema + client
│   ├── documents/           # PDF generation (charter, hồ sơ)
│   ├── stripe/              # Billing
│   └── validations/         # Zod schemas
├── server/
│   ├── actions/             # Server actions
│   └── services/            # Business logic
└── components/              # React components
```

## Kiến trúc

```
┌─────────────────────────────────────────────────────────────┐
│  Client (Next.js RSC + Client Components)                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┬────────────────┐
        ▼              ▼              ▼                ▼
   Server Actions  Route Handlers  Auth.js        Webhooks
        │              │              │                │
        └──────────────┼──────────────┘                │
                       ▼                                ▼
              ┌──────────────────┐            ┌────────────────┐
              │  Services Layer  │            │   Stripe       │
              │  (business logic)│            │   Webhook      │
              └────────┬─────────┘            └────────────────┘
                       │
       ┌───────────────┼────────────────┐
       ▼               ▼                ▼
   Drizzle ORM    Claude API      PDF Service
       │
       ▼
   PostgreSQL
```

## Pháp lý

Phiên bản hiện tại tham chiếu các văn bản pháp luật sau (xem `docs/legal-versions.md`):

- Luật Doanh nghiệp 59/2020/QH14
- Nghị định 01/2021/NĐ-CP về đăng ký doanh nghiệp
- Thông tư 01/2021/TT-BKHĐT
- Luật Quản lý thuế 38/2019/QH14
- Quyết định 27/2018/QĐ-TTg ban hành hệ thống ngành kinh tế VN (VSIC)

Khi có cập nhật, tạo migration trong `docs/legal-versions.md` và bump `LEGAL_VERSION` trong `src/config/legal.ts`.

## Bảo mật

- Tất cả PII (CCCD, CMND, MST) mã hoá at-rest bằng `pgcrypto`
- Audit log cho mọi thao tác chỉnh sửa hồ sơ
- Rate limit trên route AI (5 req/phút/user)
- CSP headers trong `next.config.mjs`
- Secret rotation qua environment

## License

Proprietary © 2026 Khởi Doanh AI JSC. All rights reserved.
