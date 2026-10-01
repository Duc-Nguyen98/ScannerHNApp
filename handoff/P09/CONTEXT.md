# P09 — source và quyết định trước triển khai

- User tạm chốt P08 r20 ngày 2026-09-27, sẽ bổ sung state sau; không chuyển integration thành PASS.
- Source HEAD da9f623a19d0359c3e80c14f8cc612636ec6ab78; target prototype trong docs/flows. Working copy có P01–P08 và thay đổi warranty-components, bảo toàn.
- P09_Bao_hanh.md + Contract v2.0 + BOARD_INDEX: P09.S01–S04, đúng board design/01_Main/BOARDS/01_UPDATED_BOARDS/07_bao_hanh.png. Baseline không sửa.
- OBSERVED_IMAGE (estimated): B09 1672×941; các phone khoảng x46/447/851/1258, y24–886, rộng370–373. Header ảnh y24–108; content inset14; card radius10; gap10–12; list ảnh máy64×72; text chính16–20px trong raster; button cao42–48; detail có 3 tab và 2 CTA đáy. Crop camera khoảng x463,y177,w341,h179. Không dùng kích thước ảnh làm viewport.
- VERIFIED_SOURCE/USER: shell494×950 CSS px, fit thống nhất; header86px, inset18px, font Arial hiện dùng ở P07/P08; P09 dùng text20/17/26px và control54–60px, radius12–16, adapted estimated từ B09. Không status bar giả. Footer/nav cố định, nội dung cuộn.
- USER: operation-icons.css + UI_STANDARD.md là nguồn icon pastel dùng chung; màu nghiệp vụ không thay trạng thái.
- VERIFIED_SOURCE: business-history-data.mjs có8 hồ sơ, BH-002 đã trả khách, BH-001 đang kiểm tra. Tách nguồn chung để P09 và lịch sử đọc cùng case/events, giữ fixture P08; không đổi BH-002 về trạng thái cũ B09.
- CONFIRMED_HANDOFF: chỉ POSTED đúng case; nháp riêng; đóng chỉ đọc; sửa chữa khác xuất linh kiện; chờ bàn giao không phải đã trả khách.
- UNKNOWN: enum backend, policy intake/update và quyền chi tiết; không gọi API/hardware. Adapter fixture có xác nhận riêng, công cụ kiểm thử ngoài khung app ghi rõ. Giới hạn200 ký tự lấy từ B09 chỉ là policy fixture, không phải policy production.
- P19/P20 legacy prototype có dữ liệu riêng cho thiết kế xuất linh kiện. P09 nối phần đọc theo nguồn ledger đó; không nhúng luồng ghi hardcode BH-001 cho case khác. P18 bàn giao/đóng case và P19 write integration giữ pending.
- Asset: tái sử dụng ảnh demo sản phẩm đã được phép ở P06, ảnh kho scanner-approved. Không có asset máy/font chính xác B09; visual cần user review, không báo pixel-identical.
