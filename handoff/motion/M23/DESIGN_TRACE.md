# M23 — nguồn và quyết định trước motion

Nguồn: MOTION_P23 + MOTION_CONTRACT v1.0 được user yêu cầu thực thi 01/10/2026; Contract2.0/AGENTS/UI_STANDARD; FLOW_GATE PASS UI_FIXTURE và M00 ready; P23 r03 đã được tạm chốt theo TEMPORARY_ACCEPTANCE trong working copy. Không đổi trạng thái integration nghiệp vụ.

| Phần | Nguồn / owner | Quyết định |
|---|---|---|
| Khung, header/footer, typography | P23 r03 và CSS hiện có | Giữ494×950, geometry settle; không sửa CSS/ảnh |
| Timeline S02, mã/metrics S04 | P09/P23 model + MOTION_P23 | Static-by-design; không event stagger/line draw/typewriter/count-up |
| Filter S01/S03 | M00 noticeFeedback140/80/off | Chỉ selected control; kết quả và quyền cập nhật ngay; không animate rows |
| Selection S01–S04 | M00 pressFeedback100/static | Chỉ press nút có thật, không mutation callback |
| Route | M02 AppShell | Truyền key scene+ID; không key theo filter hoặc tạo provider mới |
| Scroll/Back | P23 native owner | Sửa anchor theo ID+offset, giữ node không đổi khi append; không smooth scroll |
| Overlay | Shared AppModal/reader/picker | Giữ lifecycle/focus; cancel effect nền khi overlay mở |
| Virtualization | M00 LIST_AUDIT / ownership | DEFERRED, không thêm thư viện do chưa có profile đủ |

Before:12 ảnh và3trace Chromium494×950,DPR1,Vietnam,fixed clock2026-10-01; seed B23 không đổi. Test-only interception thêm20phiên và1phiên mới để tái hiện append, không thay fixture shipped hoặc bịa backend paging. Trước sửa anchor M23-SESSION-15 lệch182.5→425.5px (243px), node cũ bị tháo; sửa flow trước khi bật motion, kiểm tại flow-recheck.

Static baseline raster gốc ở handoff/P23/evidence/revision-01/baseline/B23.png; source snapshot trong before/source. Không tự đánh dấu pixel-perfect hoặc visual approved từ test geometry.
