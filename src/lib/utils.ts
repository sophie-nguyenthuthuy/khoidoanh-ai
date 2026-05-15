import { clsx, type ClassValue } from "clsx";
import { customAlphabet } from "nanoid";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const referenceAlphabet = "ACDEFGHJKMNPQRSTUVWXYZ23456789";
const referenceGen = customAlphabet(referenceAlphabet, 8);

export function generateReferenceCode(prefix = "KD") {
  return `${prefix}-${referenceGen()}`;
}

export function formatVnd(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateVi(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(d);
}

export function numberToVietnameseText(amount: number): string {
  if (amount === 0) return "không đồng";
  const units = ["", "nghìn", "triệu", "tỷ"];
  const digits = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];

  const readThreeDigits = (n: number, full: boolean): string => {
    const h = Math.floor(n / 100);
    const t = Math.floor((n % 100) / 10);
    const o = n % 10;
    const parts: string[] = [];
    if (h > 0 || full) parts.push(`${digits[h]} trăm`);
    if (t > 1) {
      parts.push(`${digits[t]} mươi`);
      if (o === 1) parts.push("mốt");
      else if (o === 5) parts.push("lăm");
      else if (o > 0) parts.push(digits[o]!);
    } else if (t === 1) {
      parts.push("mười");
      if (o === 5) parts.push("lăm");
      else if (o > 0) parts.push(digits[o]!);
    } else if (t === 0 && o > 0) {
      if (h > 0 || full) parts.push("lẻ");
      parts.push(digits[o]!);
    }
    return parts.join(" ").trim();
  };

  const chunks: number[] = [];
  let n = amount;
  while (n > 0) {
    chunks.push(n % 1000);
    n = Math.floor(n / 1000);
  }
  const out: string[] = [];
  for (let i = chunks.length - 1; i >= 0; i--) {
    const c = chunks[i]!;
    if (c === 0 && i !== 0) continue;
    out.push(readThreeDigits(c, i !== chunks.length - 1));
    if (units[i]) out.push(units[i]!);
  }
  return `${out.join(" ").replace(/\s+/g, " ").trim()} đồng`;
}
