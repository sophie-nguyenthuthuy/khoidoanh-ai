# Phiên bản pháp lý

Mỗi khi luật/nghị định/thông tư liên quan thay đổi, thêm entry mới vào đây + bump `LEGAL_VERSION` trong `src/config/legal.ts` + insert row vào bảng `legal_versions`.

## v2026.01 — phát hành ban đầu

Hiệu lực từ 2026-01-01.

| Loại | Số | Tên | Ngày BH |
|------|-----|-----|---------|
| Luật | 59/2020/QH14 | Luật Doanh nghiệp | 2020-06-17 |
| Nghị định | 01/2021/NĐ-CP | Đăng ký doanh nghiệp | 2021-01-04 |
| Thông tư | 01/2021/TT-BKHĐT | Hướng dẫn đăng ký doanh nghiệp | 2021-03-16 |
| Quyết định | 27/2018/QĐ-TTg | Hệ thống ngành kinh tế VN (VSIC) | 2018-07-06 |
| Luật | 38/2019/QH14 | Luật Quản lý thuế | 2019-06-13 |
| Nghị định | 123/2020/NĐ-CP | Quy định về hoá đơn, chứng từ | 2020-10-19 |
| Thông tư | 78/2021/TT-BTC | Hướng dẫn về hoá đơn điện tử | 2021-09-17 |

### Prompt versions

| Module | Version |
|--------|---------|
| Charter | `charter@2026-05-15` |
| Business codes | `business-codes@2026-05-15` |
| Company name | `company-name@2026-05-15` |

## Quy trình cập nhật

1. Pháp chế phát hiện văn bản mới (theo dõi Cổng Thông tin Điện tử Chính phủ + VBPL).
2. Đọc văn bản → ghi diff → estimate impact (mã ngành / điều lệ / mẫu hồ sơ).
3. Mở PR với label `legal-update`. PR template có checklist.
4. QA review: re-test wizard end-to-end với điều lệ mới.
5. Merge → deploy → hồ sơ mới dùng phiên bản mới.

Hồ sơ đang trong wizard sẽ tiếp tục dùng version đã snapshot — không break existing flow.
