# P22 r01 — nguồn và số đo trước triển khai

Source/HEAD: da9f623a19d0359c3e80c14f8cc612636ec6ab78, working copy có nhiều thay đổi P01–P21; giữ nguyên ngoài dependency trực tiếp. Target prototype HTML/CSS/JS tại docs/flows, không sửa gallery/dist. B22 có 4 panel, giữ ID.

| Phần | Nguồn / phân loại | Quyết định |
|---|---|---|
| Hub | VERIFIED_SOURCE: embedded-history.css / flow.js, user context | Giữ hub 6 entry hiện có, không khôi phục shortcut phiếu dở. S01 MIGRATED. |
| Home recent | AGENTS.md + user context, CONFIRMED | Xem tất cả → P12; tab Lịch sử → hub. A01 của prompt được thay thế tương ứng. |
| Khung | User khóa | 494×950 CSS px, uniform scale; không dùng viewport390×844 cũ. |
| Hub header/body | embedded-history.css, VERIFIED_SOURCE | Header86, body margin-top−12/radius24, padding20/18, gap20; card86+/padding14/gap14. Giữ nguyên. |
| NFC header | history/style.css + prototype source | Reuse header86/radius24; content cuộn trong khung; footer hành động56+padding16. Footer Home không sửa. |
| NFC cards | B22 + warranty-components/style.css | White cards/radius12/border1, padding18 (adaptation494), gap14. B22 list loại/giờ, UID/serial, trạng thái/actor; detail hero + bảng + nội dung. |
| Font | Public Sans local ở warranty-components/fonts | Dùng font đã có, title26/body16/metadata14, line1.5; adaptation theo khung, cần review. Hub Arial hiện có không đổi. |
| Controls | history-controls.mjs / history-picker.mjs | Search50, type tabs44+, date44+, dùng picker chung Đặt lại–Hủy–Áp dụng; mặc định Tất cả ngày. Đây là đồng bộ contract mới, khác B22 gốc không có date. |
| Icons | UI_STANDARD + operation-icons.css | NFC pastel tím; md44/icon26 và lg56/icon30, stroke1.8; trạng thái độc lập. |
| Crop | B22 raster3584×2080, OBSERVED_IMAGE | 4 điện thoại trên board chỉ tham chiếu; không dùng raster làm UI, không bịa pixel-diff PASS. |
| Event source | HANDOFF + DEV_PROPOSAL §B | Chưa có backend schema được chốt. Default unavailable; fixture opt-in, không lấy trạng thái thẻ P07 dựng event. |
| P21 | User30/09/2026 | Tạm chốt r03; state đồng bộ bổ sung sau, production chưa xác minh. |

Trước: NFC entry dùng generic P08 fixture list/detail; S04 iframe khác kiểu, actor/product detail chưa đủ nguồn. Sau dự kiến: một owner chỉ đọc P22 cho S02–S04, adapter tách fixture; giữ P08/P23 và hub. Backend mapping/URL/quyền thật không tự chốt.
