import { describe, expect, it } from "vitest";

import {
  legalRepresentativeSchema,
  memberSchema,
  phoneSchema,
  vietnameseIdSchema,
} from "@/lib/validations/registration";

describe("vietnameseIdSchema", () => {
  it("accepts 9-digit CMND", () => {
    expect(() => vietnameseIdSchema.parse("123456789")).not.toThrow();
  });
  it("accepts 12-digit CCCD", () => {
    expect(() => vietnameseIdSchema.parse("123456789012")).not.toThrow();
  });
  it("rejects 10-digit number", () => {
    expect(() => vietnameseIdSchema.parse("1234567890")).toThrow();
  });
});

describe("phoneSchema", () => {
  it("accepts 0xxx VN phone", () => {
    expect(() => phoneSchema.parse("0987654321")).not.toThrow();
  });
  it("accepts +84xxx VN phone", () => {
    expect(() => phoneSchema.parse("+84987654321")).not.toThrow();
  });
  it("rejects too-short numbers", () => {
    expect(() => phoneSchema.parse("098765")).toThrow();
  });
});

describe("memberSchema", () => {
  it("requires positive contribution", () => {
    expect(() =>
      memberSchema.parse({
        fullName: "Nguyễn Văn A",
        isOrganization: false,
        address: "12 Lê Lợi, Q1, TPHCM",
        contributionVnd: 0,
        contributionPct: 0,
      }),
    ).toThrow();
  });
});

describe("legalRepresentativeSchema", () => {
  it("rejects invalid ISO date", () => {
    expect(() =>
      legalRepresentativeSchema.parse({
        fullName: "Nguyễn Văn A",
        title: "Giám đốc",
        idNumber: "123456789",
        idType: "CCCD",
        idIssuedDate: "01/01/2020",
        idIssuedPlace: "TPHCM",
        permanentAddress: "12 Lê Lợi",
        contactAddress: "12 Lê Lợi",
        phone: "0987654321",
        email: "a@b.vn",
        gender: "MALE",
        dateOfBirth: "1990-01-01",
        nationality: "Việt Nam",
      }),
    ).toThrow();
  });
});
