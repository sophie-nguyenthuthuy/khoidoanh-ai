// Hệ thống ngành kinh tế Việt Nam (VSIC 2018) - Cấp 4 (lớp/class)
// Nguồn: Quyết định 27/2018/QĐ-TTg
// NOTE: tập subset thường dùng cho startups/SME — đầy đủ ~734 mã sẽ được nạp
// qua scripts/seed.ts từ data/vsic-full.csv (tải về từ Tổng cục Thống kê).

export interface VsicLevel4 {
  code: string;
  name: string;
  description?: string;
  parentCode: string; // level 3 (group)
  isConditional?: boolean;
  conditionalNote?: string;
  excludedItems?: string[];
}

export const VSIC_LEVEL_4_SEED: VsicLevel4[] = [
  // ─── J: Thông tin và truyền thông ─────────────────────────────────
  {
    code: "6201",
    name: "Lập trình máy vi tính",
    description:
      "Hoạt động thiết kế, viết, sửa đổi, thử nghiệm, hỗ trợ phần mềm theo yêu cầu",
    parentCode: "620",
  },
  {
    code: "6202",
    name: "Tư vấn máy vi tính và quản trị hệ thống máy vi tính",
    parentCode: "620",
  },
  {
    code: "6209",
    name: "Hoạt động dịch vụ công nghệ thông tin và dịch vụ khác liên quan đến máy vi tính",
    parentCode: "620",
  },
  { code: "6311", name: "Xử lý dữ liệu, cho thuê và các hoạt động liên quan", parentCode: "631" },
  { code: "6312", name: "Cổng thông tin", parentCode: "631" },
  { code: "6319", name: "Dịch vụ thông tin khác chưa được phân vào đâu", parentCode: "631" },
  {
    code: "5820",
    name: "Xuất bản phần mềm",
    parentCode: "582",
  },
  {
    code: "5911",
    name: "Hoạt động sản xuất phim điện ảnh, phim video và chương trình truyền hình",
    parentCode: "591",
    isConditional: true,
    conditionalNote: "Yêu cầu Giấy phép phát hành phim theo Luật Điện ảnh",
  },

  // ─── G: Bán buôn và bán lẻ ────────────────────────────────────────
  {
    code: "4610",
    name: "Đại lý, môi giới, đấu giá",
    parentCode: "461",
    isConditional: true,
    conditionalNote: "Đấu giá tài sản cần giấy phép theo Luật Đấu giá tài sản 2016",
  },
  { code: "4711", name: "Bán lẻ lương thực, thực phẩm trong các cửa hàng kinh doanh tổng hợp", parentCode: "471" },
  { code: "4719", name: "Bán lẻ khác trong các cửa hàng kinh doanh tổng hợp", parentCode: "471" },
  { code: "4741", name: "Bán lẻ máy vi tính, thiết bị ngoại vi, phần mềm trong các cửa hàng chuyên doanh", parentCode: "474" },
  { code: "4791", name: "Bán lẻ theo yêu cầu đặt hàng qua bưu điện hoặc internet", parentCode: "479" },
  {
    code: "4633",
    name: "Bán buôn đồ uống",
    parentCode: "463",
    isConditional: true,
    conditionalNote: "Bán buôn rượu/bia cần Giấy phép phân phối rượu",
  },

  // ─── I: Dịch vụ ăn uống ───────────────────────────────────────────
  { code: "5610", name: "Nhà hàng và các dịch vụ ăn uống phục vụ lưu động", parentCode: "561" },
  { code: "5621", name: "Cung cấp dịch vụ ăn uống theo hợp đồng không thường xuyên với khách hàng", parentCode: "562" },
  { code: "5629", name: "Dịch vụ ăn uống khác", parentCode: "562" },
  {
    code: "5630",
    name: "Dịch vụ phục vụ đồ uống",
    parentCode: "563",
    isConditional: true,
    conditionalNote: "Cần Giấy phép kinh doanh rượu (NĐ 105/2017/NĐ-CP) và đăng ký ATTP",
  },

  // ─── M: Hoạt động chuyên môn, KH&CN ──────────────────────────────
  { code: "7010", name: "Hoạt động trụ sở văn phòng", parentCode: "701" },
  { code: "7020", name: "Hoạt động tư vấn quản lý", parentCode: "702" },
  { code: "7110", name: "Hoạt động kiến trúc và tư vấn kỹ thuật có liên quan", parentCode: "711" },
  { code: "7210", name: "Nghiên cứu khoa học và phát triển công nghệ trong lĩnh vực KH tự nhiên và kỹ thuật", parentCode: "721" },
  { code: "7310", name: "Quảng cáo", parentCode: "731" },
  { code: "7320", name: "Nghiên cứu thị trường và thăm dò dư luận", parentCode: "732" },
  { code: "7410", name: "Hoạt động thiết kế chuyên dụng", parentCode: "741", description: "Thiết kế đồ họa, công nghiệp, thời trang..." },

  // ─── N: Hoạt động hành chính và DV hỗ trợ ─────────────────────────
  { code: "7820", name: "Cung ứng lao động tạm thời", parentCode: "782", isConditional: true, conditionalNote: "Cần giấy phép cho thuê lại lao động" },
  { code: "8211", name: "Dịch vụ hành chính văn phòng tổng hợp", parentCode: "821" },
  { code: "8219", name: "Photo, chuẩn bị tài liệu và các hoạt động hỗ trợ văn phòng đặc biệt khác", parentCode: "821" },

  // ─── C: Công nghiệp chế biến, chế tạo ─────────────────────────────
  { code: "1071", name: "Sản xuất các loại bánh từ bột", parentCode: "107" },
  { code: "1079", name: "Sản xuất thực phẩm khác chưa được phân vào đâu", parentCode: "107" },
  { code: "1310", name: "Sản xuất sợi", parentCode: "131" },
  { code: "1410", name: "May trang phục (trừ trang phục từ da lông thú)", parentCode: "141" },

  // ─── F: Xây dựng ──────────────────────────────────────────────────
  { code: "4101", name: "Xây dựng nhà để ở", parentCode: "410" },
  { code: "4102", name: "Xây dựng nhà không để ở", parentCode: "410" },
  { code: "4290", name: "Xây dựng công trình kỹ thuật dân dụng khác", parentCode: "429" },

  // ─── H: Vận tải kho bãi ───────────────────────────────────────────
  { code: "4933", name: "Vận tải hàng hóa bằng đường bộ", parentCode: "493", isConditional: true, conditionalNote: "Cần giấy phép kinh doanh vận tải" },
  { code: "5210", name: "Kho bãi và lưu giữ hàng hóa", parentCode: "521" },
  { code: "5320", name: "Chuyển phát", parentCode: "532", isConditional: true, conditionalNote: "Cần giấy phép bưu chính" },

  // ─── K: Tài chính, ngân hàng, bảo hiểm ────────────────────────────
  {
    code: "6499",
    name: "Hoạt động dịch vụ tài chính khác chưa được phân vào đâu (trừ bảo hiểm và BHXH)",
    parentCode: "649",
    isConditional: true,
    conditionalNote: "Hoạt động tài chính thường yêu cầu giấy phép NHNN",
  },
  { code: "6611", name: "Quản lý thị trường tài chính", parentCode: "661", isConditional: true },
  { code: "6920", name: "Hoạt động liên quan đến kế toán, kiểm toán và tư vấn về thuế", parentCode: "692", isConditional: true, conditionalNote: "Cần chứng chỉ hành nghề kế toán/kiểm toán" },

  // ─── P: Giáo dục đào tạo ──────────────────────────────────────────
  {
    code: "8559",
    name: "Giáo dục khác chưa được phân vào đâu",
    parentCode: "855",
    isConditional: true,
    conditionalNote: "Trung tâm ngoại ngữ/tin học/kỹ năng cần Quyết định cho phép hoạt động giáo dục",
  },

  // ─── Q: Y tế ──────────────────────────────────────────────────────
  { code: "8610", name: "Hoạt động của các bệnh viện", parentCode: "861", isConditional: true, conditionalNote: "Cần Giấy phép hoạt động khám bệnh, chữa bệnh" },
  { code: "8620", name: "Hoạt động của các phòng khám đa khoa, chuyên khoa và nha khoa", parentCode: "862", isConditional: true },

  // ─── R: Nghệ thuật, vui chơi giải trí ─────────────────────────────
  { code: "9329", name: "Hoạt động vui chơi giải trí khác chưa được phân vào đâu", parentCode: "932" },

  // ─── L: BĐS ────────────────────────────────────────────────────────
  {
    code: "6810",
    name: "Kinh doanh bất động sản, quyền sử dụng đất thuộc chủ sở hữu, chủ sử dụng hoặc đi thuê",
    parentCode: "681",
    isConditional: true,
    conditionalNote: "Vốn pháp định 20 tỷ VNĐ (Luật KDBĐS 2014, sửa đổi 2023)",
  },
  { code: "6820", name: "Tư vấn, môi giới, đấu giá bất động sản, đấu giá quyền sử dụng đất", parentCode: "682", isConditional: true },

  // ─── S: Dịch vụ khác ──────────────────────────────────────────────
  { code: "9601", name: "Giặt là, làm sạch các sản phẩm dệt và lông thú", parentCode: "960" },
  { code: "9602", name: "Cắt tóc, làm đầu, gội đầu", parentCode: "960" },
];
