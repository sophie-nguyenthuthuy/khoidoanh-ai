import { describe, expect, it } from "vitest";

import { formatVnd, generateReferenceCode, numberToVietnameseText } from "@/lib/utils";

describe("formatVnd", () => {
  it("formats VND amount with currency symbol", () => {
    expect(formatVnd(1_000_000)).toMatch(/1\.000\.000/);
  });
});

describe("generateReferenceCode", () => {
  it("uses given prefix", () => {
    expect(generateReferenceCode("KD")).toMatch(/^KD-[A-Z0-9]{8}$/);
  });
  it("produces uniqueness across calls", () => {
    const a = generateReferenceCode();
    const b = generateReferenceCode();
    expect(a).not.toEqual(b);
  });
});

describe("numberToVietnameseText", () => {
  it("handles zero", () => {
    expect(numberToVietnameseText(0)).toBe("không đồng");
  });
  it("handles billion-scale charter capital", () => {
    expect(numberToVietnameseText(1_000_000_000)).toContain("tỷ");
  });
  it("handles one million", () => {
    const result = numberToVietnameseText(1_000_000);
    expect(result).toContain("triệu");
  });
});
