# P24 — nguồn trước triển khai

Source HEAD da9f623a19d0359c3e80c14f8cc612636ec6ab78; working copy chứa P01–P23 và nâng cấp UX chưa commit. Target prototype HTML/CSS/JS tại docs/flows. Không sửa baseline, gallery, dist hoặc triển khai public.

| Phần | Nguồn / quyết định |
|---|---|
| 4 ID P24.S01–S04 | B24 / P24 / BOARD_INDEX v2.0, CURRENT; không tạo 4 owner mới |
| S01 | P19 sheet; thêm chữ đỏ khi invalid, chặn handler cả tồn chưa xác minh |
| S02 | B24 scan-error qua P19; giữ nguyên reason adapter, mã và accepted list; điều hướng về cùng phiếu |
| S03 | HANDOFF record không Post; reuse shared waiting-web và owner P04/P05, giữ actions đã có; bổ sung badge, kho, số mã/thời gian có nguồn |
| S04 | P20/P09 owner case; closed chỉ đọc, giữ tải thêm và link hồ sơ; bỏ CTA xuất bị khóa, thay bằng Về lịch sử; UNKNOWN yêu cầu cũ vẫn được đối chiếu |
| Dialog / text / footer | Các contract đã khóa UI_STANDARD; P03 footer không đổi |

## Số đo VERIFIED_SOURCE trước sửa

Khung AppShell 494×950 CSS px, scale đồng nhất. P19/P20: header min86px/padding16px 20px 22px; nội dung padding20px/gap14px/margin-top−12px/radius24px; footer padding18px 20px 24px/gap12px. Card radius12px/border1px #dce9ef/padding18px. Public Sans local, body17px/1.5, heading24px/1.3, meta15px. Icon24px/stroke1.8; Back44px. Sheet radius26px/max-height88%, padding24px, input70px, stepper60px, CTA60px; vùng body cuộn. Camera dùng asset kho đã duyệt, cover/center, 210px (manual64px). Nguồn issue.css, history.css và shared operation-icons.css. Không có ảnh mới cần crop trong S02/S03/S04.

B24 gốc 3584×2080 raster; 4 phone khoảng780×1690 raster (estimated), thuộc prototype cũ390×844, không dùng làm CSS viewport của app mới. Giữ ảnh gốc không resize méo. Hình thức từ ảnh và component đã cập nhật khác tỷ lệ/typography; actual cần user review, không tự đặt ngưỡng pixel PASS.

## Điều kiện evidence

Before/after: Chromium494×950 CSS px, DPR1, font local đã tải, timezone Asia/Ho_Chi_Minh, reduced motion. Nhánh thực dùng owner preview; mẫu riêng ghi rõ khi khác bộ B04/B05/P09 hiện hành. Không đổi BH-001 đang xử lý thành closed để khớp ảnh; dùng BH-002 closed từ owner, giữ ID receipt đúng case. B04 batch12 lượt chỉ11 mã khác nhau; không gọi12 lượt là12 mã.
