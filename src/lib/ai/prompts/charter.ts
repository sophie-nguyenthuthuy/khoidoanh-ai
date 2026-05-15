export const CHARTER_PROMPT_VERSION = "charter@2026-05-15";

export const CHARTER_SYSTEM_PROMPT = `Bạn là luật sư doanh nghiệp Việt Nam với 20 năm kinh nghiệm soạn thảo điều lệ công ty. Bạn am hiểu Luật Doanh nghiệp 59/2020/QH14, Nghị định 01/2021/NĐ-CP, Thông tư 01/2021/TT-BKHĐT và các văn bản hướng dẫn thi hành.

Nhiệm vụ: soạn ĐIỀU LỆ CÔNG TY hoàn chỉnh, tuân thủ pháp luật Việt Nam, sẵn sàng để in và ký.

QUY TẮC BẮT BUỘC:
1. Sử dụng tiếng Việt chính thức, văn phong pháp lý chuẩn.
2. Mỗi điều khoản phải có cơ sở pháp lý cụ thể (dẫn chiếu điều luật).
3. KHÔNG được phép sao chép nguyên văn các quy định pháp luật; thay vào đó, áp dụng vào trường hợp cụ thể của doanh nghiệp.
4. Đối với LLC_MULTI và JSC, phải có đầy đủ các điều về: Đại hội đồng/Hội đồng thành viên, Hội đồng quản trị (nếu có), Giám đốc/Tổng giám đốc, Ban kiểm soát (nếu bắt buộc), phân chia lợi nhuận, chuyển nhượng phần vốn góp/cổ phần, giải thể.
5. Đối với LLC_SINGLE, điều lệ ngắn hơn nhưng vẫn phải đủ: tên/trụ sở/vốn/người đại diện/quyền chủ sở hữu/tổ chức quản lý/giải thể.
6. Trích dẫn đúng cách: "(Điều X Luật Doanh nghiệp 2020)" hoặc "(khoản X Điều Y NĐ 01/2021)".
7. Vốn điều lệ ghi cả số và chữ. Tỷ lệ vốn góp tính chính xác đến 2 chữ số thập phân.

OUTPUT FORMAT: trả về JSON với schema:
{
  "title": "ĐIỀU LỆ CÔNG TY [TÊN]",
  "preamble": "...",
  "chapters": [
    {
      "title": "CHƯƠNG I - QUY ĐỊNH CHUNG",
      "articles": [
        { "number": 1, "title": "Tên công ty", "content": "..." },
        ...
      ]
    },
    ...
  ],
  "signature_block": "...",
  "legal_references": ["Luật DN 59/2020/QH14", "NĐ 01/2021/NĐ-CP", ...]
}`;

export interface CharterPromptInput {
  entityType:
    | "LLC_SINGLE"
    | "LLC_MULTI"
    | "JSC"
    | "PARTNERSHIP"
    | "PRIVATE"
    | "HOUSEHOLD";
  companyName: string;
  companyNameEn?: string;
  companyNameAbbr?: string;
  charterCapitalVnd: number;
  headquarters: string;
  primaryBusinessCode: { code: string; name: string };
  businessCodes: Array<{ code: string; name: string; detail?: string }>;
  legalRepresentative: {
    fullName: string;
    title: string;
    idNumber: string;
    idType: string;
    address: string;
  };
  members?: Array<{
    fullName: string;
    isOrganization: boolean;
    idNumber?: string;
    contributionVnd: number;
    contributionPct: number;
    shareCount?: number;
  }>;
}

export function buildCharterPrompt(input: CharterPromptInput): string {
  const entityLabel: Record<CharterPromptInput["entityType"], string> = {
    LLC_SINGLE: "Công ty TNHH Một thành viên",
    LLC_MULTI: "Công ty TNHH Hai thành viên trở lên",
    JSC: "Công ty Cổ phần",
    PARTNERSHIP: "Công ty Hợp danh",
    PRIVATE: "Doanh nghiệp Tư nhân",
    HOUSEHOLD: "Hộ kinh doanh",
  };

  const lines: string[] = [
    `Soạn điều lệ cho ${entityLabel[input.entityType]} với các thông số sau:`,
    ``,
    `## THÔNG TIN CÔNG TY`,
    `- Tên đầy đủ: ${input.companyName}`,
    input.companyNameEn ? `- Tên tiếng Anh: ${input.companyNameEn}` : "",
    input.companyNameAbbr ? `- Tên viết tắt: ${input.companyNameAbbr}` : "",
    `- Trụ sở chính: ${input.headquarters}`,
    `- Vốn điều lệ: ${input.charterCapitalVnd.toLocaleString("vi-VN")} VNĐ`,
    ``,
    `## NGÀNH NGHỀ KINH DOANH`,
    `Ngành chính: ${input.primaryBusinessCode.code} - ${input.primaryBusinessCode.name}`,
    `Các ngành khác:`,
    ...input.businessCodes
      .filter((c) => c.code !== input.primaryBusinessCode.code)
      .map((c) => `  - ${c.code}: ${c.name}${c.detail ? ` (${c.detail})` : ""}`),
    ``,
    `## NGƯỜI ĐẠI DIỆN THEO PHÁP LUẬT`,
    `- Họ tên: ${input.legalRepresentative.fullName}`,
    `- Chức danh: ${input.legalRepresentative.title}`,
    `- ${input.legalRepresentative.idType}: ${input.legalRepresentative.idNumber}`,
    `- Địa chỉ: ${input.legalRepresentative.address}`,
  ];

  if (input.members && input.members.length > 0) {
    lines.push("", "## THÀNH VIÊN GÓP VỐN / CỔ ĐÔNG SÁNG LẬP");
    for (const m of input.members) {
      lines.push(
        `- ${m.fullName}${m.isOrganization ? " (tổ chức)" : ""}: vốn ${m.contributionVnd.toLocaleString("vi-VN")} VNĐ (${(m.contributionPct / 100).toFixed(2)}%)${m.shareCount ? `, ${m.shareCount.toLocaleString("vi-VN")} cổ phần` : ""}`,
      );
    }
  }

  lines.push(
    ``,
    `Yêu cầu: trả về JSON đúng schema, không kèm markdown wrapper, không giải thích.`,
  );

  return lines.filter(Boolean).join("\n");
}
