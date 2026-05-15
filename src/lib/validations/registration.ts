import { z } from "zod";

export const entityTypeSchema = z.enum([
  "LLC_SINGLE",
  "LLC_MULTI",
  "JSC",
  "PARTNERSHIP",
  "PRIVATE",
  "HOUSEHOLD",
]);

export const vietnameseIdSchema = z
  .string()
  .trim()
  .regex(/^\d{9}$|^\d{12}$/u, "CCCD/CMND phải là 9 hoặc 12 chữ số");

export const passportSchema = z
  .string()
  .trim()
  .regex(/^[A-Z0-9]{6,12}$/u, "Số hộ chiếu không hợp lệ");

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^(\+84|0)\d{9,10}$/u, "Số điện thoại Việt Nam không hợp lệ");

export const addressSchema = z.object({
  streetAddress: z.string().min(5, "Địa chỉ chi tiết tối thiểu 5 ký tự"),
  ward: z.string().min(2, "Phường/Xã không được trống"),
  district: z.string().min(2, "Quận/Huyện không được trống"),
  province: z.string().min(2, "Tỉnh/Thành phố không được trống"),
  provinceCode: z.string().regex(/^\d{2}$/u),
});

export const legalRepresentativeSchema = z.object({
  fullName: z.string().min(2),
  title: z.string().min(2),
  idNumber: z.string().min(6),
  idType: z.enum(["CCCD", "PASSPORT"]),
  idIssuedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/u),
  idIssuedPlace: z.string().min(2),
  permanentAddress: z.string().min(5),
  contactAddress: z.string().min(5),
  phone: phoneSchema,
  email: z.string().email(),
  gender: z.enum(["MALE", "FEMALE"]),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/u),
  nationality: z.string().min(2).default("Việt Nam"),
  ethnicity: z.string().optional(),
});

export const memberSchema = z.object({
  fullName: z.string().min(2),
  isOrganization: z.boolean().default(false),
  idNumber: z.string().optional(),
  idType: z.enum(["CCCD", "PASSPORT", "BUSINESS_LICENSE"]).optional(),
  nationality: z.string().default("Việt Nam"),
  address: z.string().min(5),
  phone: phoneSchema.optional(),
  email: z.string().email().optional(),
  contributionVnd: z.number().int().positive(),
  contributionPct: z.number().int().min(1).max(10000),
  shareCount: z.number().int().nonnegative().optional(),
  shareType: z.enum(["ORDINARY", "PREFERRED"]).optional(),
});

export const businessCodeEntrySchema = z.object({
  code: z.string().regex(/^\d{4}$/u),
  detail: z.string().max(500).optional(),
  isPrimary: z.boolean().default(false),
});

export const companyInfoSchema = z.object({
  proposedName: z.string().min(3).max(255),
  proposedNameEn: z.string().max(255).optional(),
  proposedNameAbbr: z.string().max(64).optional(),
  charterCapitalVnd: z.number().int().min(1_000_000),
  headquartersAddress: addressSchema,
});

export const fullRegistrationSchema = z.object({
  entityType: entityTypeSchema,
  ...companyInfoSchema.shape,
  primaryBusinessCode: z.string().regex(/^\d{4}$/u),
  businessCodes: z.array(businessCodeEntrySchema).min(1).max(20),
  legalRepresentative: legalRepresentativeSchema,
  members: z.array(memberSchema).optional(),
});

export type FullRegistration = z.infer<typeof fullRegistrationSchema>;
export type CompanyInfo = z.infer<typeof companyInfoSchema>;
export type LegalRepresentative = z.infer<typeof legalRepresentativeSchema>;
export type MemberInput = z.infer<typeof memberSchema>;
