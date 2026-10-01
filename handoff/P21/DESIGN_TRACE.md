# P21 r01 — nguồn và quyết định trước triển khai

Nguồn: HEAD da9f623a19d0359c3e80c14f8cc612636ec6ab78; target prototype. Đã đọc P21, BOARD_INDEX, Contract2.0, HANDOFF, DEV_PROPOSAL, AGENTS/UI_STANDARD. User29/09/2026 tạm chốt P20 r03, state đồng bộ bổ sung sau; đây là chấp nhận tạm thời, không nghiệm thu production.

| Phần | Nguồn | Áp dụng |
|---|---|---|
| 4 panel | OBSERVED_IMAGE B21; flow.js draftsView/resumeView/reconcileView/postCheckView | Giữ P21.S01–S04, thứ tự nội dung và hai CTA |
| Khung | USER_CONFIRMED 494×950; AppShell hiện hành | Co đồng nhất; không statusbar/home indicator giả |
| Header | VERIFIED_SOURCE issue.css .p19-header | 86px, padding16px20px22px; gradient110deg #073b52→#0c5d7d; tiêu đề24px/1.3 |
| Vùng nội dung | VERIFIED_SOURCE .p19-scroll | padding20px/gap14px, margin-top−12px, radius24px; flex cuộn nội bộ |
| Card | VERIFIED_SOURCE style.css + issue.css | radius12px/border1px #dce9ef; padding18px kế thừa P19 |
| Footer | VERIFIED_SOURCE .p19-footer | padding18px20px24px/gap12px; CTA tối thiểu54px; nav Home/P03 giữ nguyên |
| Chữ/icon | VERIFIED_SOURCE Public Sans local / icon source | body17px/1.5; phụ14–15px; SVG stroke1.8; nghiệp vụ theo operation-icons.css |
| Hero S03/S04 | OBSERVED_IMAGE + existing flow.js | icon pastel, tiêu đề và summary; scale/spacing thích nghi494px là implementation choice chờ review |
| Dữ liệu | CONFIRMED_HANDOFF + issue-model/fixture | owner P19 dùng lại; không create khi resume; nguồn checkpoint mô phỏng riêng, không biến cache thành backend evidence |
| Thông báo | USER_CONFIRMED dialog/readable | dialog trong app; dữ liệu dài reader2/3dòng; định danh gốc giữ nguyên |
| Retention | Existing accepted preview limitation | Bộ nhớ instance phiên; đóng/mở màn giữ phiếu; reload/logout mất, chưa lưu bền production |

P22 hub đã có chỉ thị trước xóa notice/shortcut trong source flow.js; không tự khôi phục shortcut bị user bỏ. Nối P21 từ P09/P20 và Home phiếu đang làm. P03 chỉ chuyển context thực nếu owner nhận diện đúng; fixture P03 khác không được biến thành phiếu P19 mới.

Không có API checkpoint/reload/status production hoặc URL WMS xác nhận. Dựng adapter fixture và hướng dẫn text từ HANDOFF; không thêm endpoint/quyền/auto-repair. P14 vẫn chặn kết thúc ca khi phiếu linh kiện còn dở/UNKNOWN vì lưu bền chưa tích hợp.
