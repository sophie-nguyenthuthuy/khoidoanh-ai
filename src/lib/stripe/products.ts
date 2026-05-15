export const PRODUCTS = {
  REGISTRATION_LLC: {
    code: "REGISTRATION_LLC",
    label: "Đăng ký công ty TNHH",
    description: "Trọn gói đăng ký công ty TNHH (1 hoặc 2+ thành viên)",
    priceVnd: 1_500_000,
    type: "one_time",
  },
  REGISTRATION_JSC: {
    code: "REGISTRATION_JSC",
    label: "Đăng ký công ty Cổ phần",
    description: "Trọn gói đăng ký công ty Cổ phần",
    priceVnd: 2_500_000,
    type: "one_time",
  },
  REGISTRATION_HOUSEHOLD: {
    code: "REGISTRATION_HOUSEHOLD",
    label: "Đăng ký hộ kinh doanh",
    description: "Trọn gói đăng ký hộ kinh doanh cá thể",
    priceVnd: 800_000,
    type: "one_time",
  },
  TAX_BASIC: {
    code: "TAX_BASIC",
    label: "Kế toán thuế cơ bản",
    description: "Báo cáo thuế hàng quý, quyết toán năm",
    priceVnd: 500_000,
    type: "subscription",
    interval: "month",
  },
  TAX_PRO: {
    code: "TAX_PRO",
    label: "Kế toán thuế pro",
    description: "Kế toán đầy đủ, đối soát hàng tháng, hỗ trợ thanh tra",
    priceVnd: 3_000_000,
    type: "subscription",
    interval: "month",
  },
  EINVOICE: {
    code: "EINVOICE",
    label: "Hóa đơn điện tử",
    description: "Setup + quản lý hóa đơn điện tử kết nối CQT",
    priceVnd: 200_000,
    setupVnd: 1_000_000,
    type: "subscription",
    interval: "month",
  },
  BHXH: {
    code: "BHXH",
    label: "BHXH / BHYT / BHTN",
    description: "Đăng ký + quản lý BHXH cho người lao động",
    priceVnd: 300_000,
    type: "subscription",
    interval: "month",
    perUnit: "lao động",
  },
} as const;

export type ProductCode = keyof typeof PRODUCTS;

export function getProduct(code: ProductCode) {
  return PRODUCTS[code];
}
