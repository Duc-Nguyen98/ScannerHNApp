# P18 r01 — nguồn và số đo trước triển khai

HEAD da9f623a19d0359c3e80c14f8cc612636ec6ab78. Target prototype HTML/CSS/JS `docs/flows`; working copy có các module P01–P17 untracked và hai file warranty-components modified trước phiên. Giữ nguyên công việc đó. Baseline B18 nguyên bản ở evidence/revision-01/B18.png. Không sửa gallery/dist.

| Thành phần | Nguồn | Số đo / quyết định |
|---|---|---|
| 4 panel | OBSERVED_IMAGE B18 1536×1024 | panel raster khoảng354×916, x30/407/782/1157,y74; estimated, không phải viewport app |
| Header, footer | B18 estimated + VERIFIED_SOURCE UI_STANDARD/home/style.css | B18 header79px kể cả status bar, footer78px; actual shell494×950 theo user, header76px, dùng footerLOCK75px; không tạo status bar giả |
| Nội dung | B18 estimated | inset10–20px, card gap10px, card radius10–12px; actual padding20px/gap14px từ component app để phù hợp494px |
| Chữ | B18 estimated + source P12/P09 | raster title20/body14–16; actual Arial heading23/body17/line1.5, metadata14; lựa chọn adaptation cần review |
| Control | B18 estimated + source shared | raster CTA42–48px, input38px; actual CTA56/input48, target44 tối thiểu; dialog action-feedback, reader2/3 dòng, note200 |
| Icon/ảnh | VERIFIED_SOURCE UI_STANDARD + lookup assets | SVG sẵn có stroke1.8, pastel md44/icon26; ảnh minh họa box có sẵn, object-fit contain; không crop screenshot thành asset |
| Viewer | B18 + implementation choice | một trang PDF thật, canvas PDF.js5.6.205 từ runtime (Apache2.0); footer paginator và download. Tài liệu2trang tổng hợp từ hai PDF fixture P12 có sẵn, byte thật/không vẽ bảng HTML giả |
| Handoff | CONFIRMED_HANDOFF + P09 owner | trạng thái, serial, POSTED parts đọc owner. BH-001 hiện Đang kiểm tra, không đổi thành Đã sửa chữa theo ảnh; đủ form nhưng không gọi close mutation |
| Location | PROPOSED/UNKNOWN | A1…B3 và12/20… là fixture chỉ ở bộ B18 preview; nguồn thường không có capacity hiển thị chưa xác minh; chọn ô không move/unmap |

Màn S03/S04 giữ ID, MIGRATED ở action cũ: bàn giao không tự đóng case; xác nhận vị trí chỉ giải thích chưa có policy. Không tự tạo API/quyền/enum backend. Upload fixture độc lập từng task; không upload file thật, không tự thêm delete. Bộ điều khiển fixture đặt ngoài khung app.

P17 user tạm chốt ngày29/09/2026, có thể bổ sung state sau; không suy thành tích hợp production PASS. P12–P14 giữ revision mới nhất.
