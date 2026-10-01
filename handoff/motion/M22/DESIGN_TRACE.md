# MOTION P22 — nguồn, phạm vi và quyết định

User giao thực thi MOTION_P22 ngày01/10/2026. Đã đọc inputs/MOTION_P22_Lich_su_thao_tac_NFC.md, MOTION_CONTRACT.md, Contract2.0, AGENTS/UI_STANDARD, FLOW_GATE/FLOW_REPORT, M00 REPORT/OWNERSHIP/LIST_AUDIT và M21. FLOW_GATE PASS UI_FIXTURE; M00 sẵn sàng. Source hiện tại đã có P23/P24/FLOW/M01–M21; giữ nguyên, không quay về bản snapshot r03 cũ để ghi đè.

P22 r03 đã được user tạm chốt khi chuyển P23 theo handoff/P22/TEMPORARY_ACCEPTANCE.md. Bản motion mới cần review riêng. Giữ 4 panel và S01 MIGRATED, hub6, không shortcut draft; Home recent vẫn P12. Chữ “Context Home Xem tất cả P02” trong tài liệu motion không thay đổi quyết định route trước đó.

| Phần | Nguồn | Quyết định M22 |
|---|---|---|
| Frame/header/footer/cards/fonts | P22 r03 hiện hành; UI_STANDARD; DESIGN_TRACE P22 | Không đổi geometry, màu/font/icon hoặc footerLOCK. Baseline thực thi chụp trước sửa theo từng mode. |
| Hub | embedded-history + M02 shell | Tile press100; nav press100/selected140 qua shell hiện có; không stagger khi Back |
| Danh sách | M00 dataState/noticeFeedback | Filter fade140; reduced opacity80; off0. Nội dung/count có hiệu lực ngay. |
| Chi tiết | M02 routeTransition | Key list/detail/event ID, không theo query; opacity180 auto và0 reduced/off. UID/event ID không typewriter. |
| Unavailable | P22 event adapter | STATIC_BY_DESIGN; không tự đổi thành empty, không thêm event |
| Scroll/append | P22 native owner | Reconcile event/day nodes giữ dòng không đổi, anchor/focus; không animation từng row hoặc thay chiều cao |
| Virtualization | M00 LIST_AUDIT | DEFERRED: không có profile/decision đủ để thêm virtualizer; không cài library |
| Overlay/security | AppModal + Home owners | Không thêm overlay/provider; ngắt motion khi dialog/security/ẩn màn, guard áp ngay |

Reference viewport494×950 CSS px, DPR1, fontlocal, zoom mặc định, fixed clock2026-10-01 tại Chromium. Số đo runtime header/footer/cards/dock/scroll nằm trong before/results.json; giữ đúng sau settle cả12panel×mode. Before/source lưu nguyên source trước sửa; không chỉnh ảnh baseline. Trace thật chứng minh runtime, ảnh settle không được dùng để tuyên bố FPS.

Fixture B22 và model giữ nguyên byte. Test append chỉ can thiệp response module trong Playwright với một event có ID cố định, không sửa nguồn shipped. Deep link chỉ giải đúng ID đã có trong nguồn fixture đã chọn; fresh session vẫn unavailable, không URL tự bật fixture.
