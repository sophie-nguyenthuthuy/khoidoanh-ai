import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

// ─── Enums ─────────────────────────────────────────────────────────────

export const entityTypeEnum = pgEnum("entity_type", [
  "LLC_SINGLE", // Cty TNHH 1 thành viên
  "LLC_MULTI", // Cty TNHH 2 thành viên trở lên
  "JSC", // Cty Cổ phần
  "PARTNERSHIP", // Cty Hợp danh
  "PRIVATE", // Doanh nghiệp tư nhân
  "HOUSEHOLD", // Hộ kinh doanh
]);

export const registrationStatusEnum = pgEnum("registration_status", [
  "DRAFT",
  "READY_FOR_REVIEW",
  "PAYMENT_PENDING",
  "SUBMITTING",
  "SUBMITTED",
  "GRANTED",
  "REJECTED",
  "CANCELLED",
]);

export const documentTypeEnum = pgEnum("document_type", [
  "CHARTER", // Điều lệ
  "APPLICATION_FORM", // Giấy đề nghị đăng ký
  "MEMBER_LIST", // Danh sách thành viên
  "SHAREHOLDER_LIST", // Danh sách cổ đông
  "POA", // Giấy ủy quyền
  "ID_COPY", // Bản sao CCCD
  "LEASE", // Hợp đồng thuê trụ sở
  "LICENSE", // Giấy phép kinh doanh
  "TAX_CERTIFICATE", // Chứng nhận đăng ký thuế
  "OTHER",
]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "TRIALING",
  "ACTIVE",
  "PAST_DUE",
  "CANCELLED",
  "EXPIRED",
]);

export const subscriptionPlanEnum = pgEnum("subscription_plan", [
  "TAX_BASIC", // Kế toán thuế cơ bản
  "TAX_PRO", // Kế toán thuế pro
  "EINVOICE", // Hóa đơn điện tử
  "BHXH", // BHXH
]);

export const auditActionEnum = pgEnum("audit_action", [
  "CREATE",
  "UPDATE",
  "DELETE",
  "SUBMIT",
  "GENERATE",
  "DOWNLOAD",
  "PAY",
  "LOGIN",
]);

// ─── Auth.js tables ────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  emailVerified: timestamp("email_verified", { withTimezone: true }),
  name: varchar("name", { length: 255 }),
  image: text("image"),
  phone: varchar("phone", { length: 20 }),
  stripeCustomerId: varchar("stripe_customer_id", { length: 64 }).unique(),
  role: varchar("role", { length: 32 }).notNull().default("customer"),
  ...timestamps,
});

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 32 }).notNull(),
    provider: varchar("provider", { length: 32 }).notNull(),
    providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),
    refreshToken: text("refresh_token"),
    accessToken: text("access_token"),
    expiresAt: integer("expires_at"),
    tokenType: varchar("token_type", { length: 32 }),
    scope: text("scope"),
    idToken: text("id_token"),
    sessionState: text("session_state"),
  },
  (t) => [primaryKey({ columns: [t.provider, t.providerAccountId] })],
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { withTimezone: true }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { withTimezone: true }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

// ─── VSIC: Mã ngành kinh tế Việt Nam ────────────────────────────────

export const businessCodes = pgTable(
  "business_codes",
  {
    code: varchar("code", { length: 8 }).primaryKey(), // VSIC code, e.g. "6201"
    name: text("name").notNull(),
    description: text("description"),
    level: integer("level").notNull(), // 1=section, 2=division, 3=group, 4=class, 5=sub-class
    parentCode: varchar("parent_code", { length: 8 }),
    isConditional: boolean("is_conditional").notNull().default(false),
    conditionalNote: text("conditional_note"),
    excludedItems: jsonb("excluded_items").$type<string[]>(),
    embedding: jsonb("embedding").$type<number[] | null>(), // OpenAI/Voyage embedding for semantic search
    legalVersion: varchar("legal_version", { length: 32 }).notNull().default("QD-27-2018"),
    ...timestamps,
  },
  (t) => [
    index("business_codes_parent_idx").on(t.parentCode),
    index("business_codes_level_idx").on(t.level),
  ],
);

// ─── Registration: Hồ sơ đăng ký kinh doanh ─────────────────────────

export const registrations = pgTable(
  "registrations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    referenceCode: varchar("reference_code", { length: 16 }).notNull().unique(),

    entityType: entityTypeEnum("entity_type").notNull(),
    status: registrationStatusEnum("status").notNull().default("DRAFT"),
    currentStep: integer("current_step").notNull().default(1),

    // Thông tin DN
    proposedName: varchar("proposed_name", { length: 255 }),
    proposedNameEn: varchar("proposed_name_en", { length: 255 }),
    proposedNameAbbr: varchar("proposed_name_abbr", { length: 64 }),
    nameAlternatives: jsonb("name_alternatives").$type<string[]>(),

    // Vốn
    charterCapitalVnd: integer("charter_capital_vnd"), // VND (stored as integer for amounts up to ~21B; use bigint if needed)

    // Trụ sở
    headquartersAddress: jsonb("headquarters_address").$type<{
      streetAddress: string;
      ward: string;
      district: string;
      province: string;
      provinceCode: string;
    }>(),

    // Mã ngành
    primaryBusinessCode: varchar("primary_business_code", { length: 8 }).references(
      () => businessCodes.code,
    ),
    businessCodes: jsonb("business_codes").$type<
      Array<{ code: string; detail?: string; isPrimary: boolean }>
    >(),

    // Người đại diện theo PL
    legalRepresentative: jsonb("legal_representative").$type<{
      fullName: string;
      title: string;
      idNumber: string;
      idType: "CCCD" | "PASSPORT";
      idIssuedDate: string;
      idIssuedPlace: string;
      permanentAddress: string;
      contactAddress: string;
      phone: string;
      email: string;
      gender: "MALE" | "FEMALE";
      dateOfBirth: string;
      nationality: string;
      ethnicity?: string;
    }>(),

    // AI sinh điều lệ
    charterContent: text("charter_content"),
    charterDraftedAt: timestamp("charter_drafted_at", { withTimezone: true }),
    charterModel: varchar("charter_model", { length: 64 }),
    charterPromptVersion: varchar("charter_prompt_version", { length: 32 }),

    // Submission tracking
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    grantedAt: timestamp("granted_at", { withTimezone: true }),
    licenseNumber: varchar("license_number", { length: 32 }),
    taxCode: varchar("tax_code", { length: 16 }),

    // Audit
    legalVersion: varchar("legal_version", { length: 32 }).notNull().default("v2026.01"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),

    ...timestamps,
  },
  (t) => [
    index("registrations_user_idx").on(t.userId),
    index("registrations_status_idx").on(t.status),
    uniqueIndex("registrations_tax_code_idx").on(t.taxCode),
  ],
);

// ─── Members / Shareholders (cho LLC_MULTI, JSC) ────────────────────

export const members = pgTable(
  "members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    registrationId: uuid("registration_id")
      .notNull()
      .references(() => registrations.id, { onDelete: "cascade" }),

    role: varchar("role", { length: 32 }).notNull(), // "MEMBER" | "SHAREHOLDER" | "FOUNDER"
    isOrganization: boolean("is_organization").notNull().default(false),

    fullName: varchar("full_name", { length: 255 }).notNull(),
    idNumber: varchar("id_number", { length: 32 }),
    idType: varchar("id_type", { length: 16 }), // CCCD, PASSPORT, BUSINESS_LICENSE
    nationality: varchar("nationality", { length: 64 }).default("Việt Nam"),
    address: text("address"),
    phone: varchar("phone", { length: 20 }),
    email: varchar("email", { length: 320 }),

    contributionVnd: integer("contribution_vnd"),
    contributionPct: integer("contribution_pct"), // 0–10000 (basis points)
    shareCount: integer("share_count"), // chỉ cho JSC
    shareType: varchar("share_type", { length: 32 }), // ORDINARY, PREFERRED

    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    ...timestamps,
  },
  (t) => [index("members_registration_idx").on(t.registrationId)],
);

// ─── Documents ─────────────────────────────────────────────────────────

export const documents = pgTable(
  "documents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    registrationId: uuid("registration_id")
      .notNull()
      .references(() => registrations.id, { onDelete: "cascade" }),
    type: documentTypeEnum("type").notNull(),
    fileName: varchar("file_name", { length: 255 }).notNull(),
    mimeType: varchar("mime_type", { length: 128 }).notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    storageUrl: text("storage_url").notNull(), // Vercel Blob URL
    checksum: varchar("checksum", { length: 64 }), // SHA-256
    generatedBy: varchar("generated_by", { length: 32 }), // "ai" | "user" | "system"
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    ...timestamps,
  },
  (t) => [
    index("documents_registration_idx").on(t.registrationId),
    index("documents_type_idx").on(t.type),
  ],
);

// ─── Payments ──────────────────────────────────────────────────────────

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    registrationId: uuid("registration_id").references(() => registrations.id, {
      onDelete: "set null",
    }),
    stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 64 }).unique(),
    stripeInvoiceId: varchar("stripe_invoice_id", { length: 64 }),
    amountVnd: integer("amount_vnd").notNull(),
    currency: varchar("currency", { length: 8 }).notNull().default("VND"),
    status: varchar("status", { length: 32 }).notNull(),
    description: text("description"),
    receiptUrl: text("receipt_url"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    ...timestamps,
  },
  (t) => [
    index("payments_user_idx").on(t.userId),
    index("payments_registration_idx").on(t.registrationId),
  ],
);

// ─── Subscriptions (upsell: tax, einvoice, BHXH) ────────────────────

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    registrationId: uuid("registration_id").references(() => registrations.id, {
      onDelete: "set null",
    }),
    plan: subscriptionPlanEnum("plan").notNull(),
    status: subscriptionStatusEnum("status").notNull().default("TRIALING"),
    stripeSubscriptionId: varchar("stripe_subscription_id", { length: 64 }).unique(),
    stripePriceId: varchar("stripe_price_id", { length: 64 }),
    currentPeriodStart: timestamp("current_period_start", { withTimezone: true }),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
    cancelAt: timestamp("cancel_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    ...timestamps,
  },
  (t) => [
    index("subscriptions_user_idx").on(t.userId),
    index("subscriptions_status_idx").on(t.status),
  ],
);

// ─── AI generation logs (for cost tracking + audit) ─────────────────

export const aiGenerations = pgTable(
  "ai_generations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    registrationId: uuid("registration_id").references(() => registrations.id, {
      onDelete: "cascade",
    }),
    purpose: varchar("purpose", { length: 64 }).notNull(), // "charter", "business_codes", "company_name"
    model: varchar("model", { length: 64 }).notNull(),
    promptVersion: varchar("prompt_version", { length: 32 }).notNull(),
    inputTokens: integer("input_tokens"),
    outputTokens: integer("output_tokens"),
    cacheReadTokens: integer("cache_read_tokens"),
    cacheCreationTokens: integer("cache_creation_tokens"),
    latencyMs: integer("latency_ms"),
    costUsd: integer("cost_usd"), // micro-cents (cost * 1_000_000)
    input: jsonb("input").$type<Record<string, unknown>>(),
    output: jsonb("output").$type<Record<string, unknown>>(),
    error: text("error"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("ai_generations_user_idx").on(t.userId),
    index("ai_generations_registration_idx").on(t.registrationId),
    index("ai_generations_purpose_idx").on(t.purpose),
  ],
);

// ─── Audit log ─────────────────────────────────────────────────────────

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    action: auditActionEnum("action").notNull(),
    entity: varchar("entity", { length: 64 }).notNull(), // "registration", "document"
    entityId: uuid("entity_id"),
    changes: jsonb("changes").$type<Record<string, { from: unknown; to: unknown }>>(),
    ip: varchar("ip", { length: 64 }),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("audit_logs_user_idx").on(t.userId),
    index("audit_logs_entity_idx").on(t.entity, t.entityId),
    index("audit_logs_created_idx").on(t.createdAt),
  ],
);

// ─── Legal versions (changelog of regulatory updates) ───────────────

export const legalVersions = pgTable("legal_versions", {
  version: varchar("version", { length: 32 }).primaryKey(),
  effectiveFrom: timestamp("effective_from", { withTimezone: true }).notNull(),
  effectiveTo: timestamp("effective_to", { withTimezone: true }),
  summary: text("summary").notNull(),
  references: jsonb("references").$type<
    Array<{ type: string; number: string; date: string; url?: string }>
  >(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Relations ─────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  registrations: many(registrations),
  payments: many(payments),
  subscriptions: many(subscriptions),
  accounts: many(accounts),
  sessions: many(sessions),
}));

export const registrationsRelations = relations(registrations, ({ one, many }) => ({
  user: one(users, { fields: [registrations.userId], references: [users.id] }),
  primaryCode: one(businessCodes, {
    fields: [registrations.primaryBusinessCode],
    references: [businessCodes.code],
  }),
  members: many(members),
  documents: many(documents),
  payments: many(payments),
}));

export const membersRelations = relations(members, ({ one }) => ({
  registration: one(registrations, {
    fields: [members.registrationId],
    references: [registrations.id],
  }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  registration: one(registrations, {
    fields: [documents.registrationId],
    references: [registrations.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, { fields: [payments.userId], references: [users.id] }),
  registration: one(registrations, {
    fields: [payments.registrationId],
    references: [registrations.id],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, { fields: [subscriptions.userId], references: [users.id] }),
  registration: one(registrations, {
    fields: [subscriptions.registrationId],
    references: [registrations.id],
  }),
}));

// ─── Types ─────────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Registration = typeof registrations.$inferSelect;
export type NewRegistration = typeof registrations.$inferInsert;
export type Member = typeof members.$inferSelect;
export type NewMember = typeof members.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type BusinessCode = typeof businessCodes.$inferSelect;
export type AiGeneration = typeof aiGenerations.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;

export const _sql = sql; // re-export for migrations
