# P15 · Hệ thống · r01

**Mới nhất: [P15 r03 — audit và sửa UI/UX](REVISION_03.md) · [Review](REVIEW_03.html).**

**Bản mới nhất: [P15 r02 — sáu nâng cấp UX](REVISION_02.md). [Review trước–sau](REVIEW_02.html).** Nội dung r01 bên dưới giữ làm lịch sử.

Đã triển khai **4/4 panel**. **Visual: chờ user review; behavior: PASS prototype; integration: BLOCKED/NOT_RUN production.** P14 r05 được user tạm chốt ngày2026-09-29, có thể bổ sung state sau; không suy thành nghiệm thu backend.

## Nguồn / target

HEAD `da9f623a19d0359c3e80c14f8cc612636ec6ab78`; target HTML/CSS/JS trong `docs/flows/`. Đã đọc P15, Contract2.0, BOARD_INDEX, B15, AGENTS/UI_STANDARD, HANDOFF và source trực tiếp. B15 đính kèm **trùng SHA256 với blob tại HEAD**: [xác minh](evidence/revision-01/baseline-verification.json). Gallery online không truy cập được qua web tool; không đổi baseline. [Số đo/nguồn trước code](MEASUREMENTS.md).

Mới: `docs/flows/system/{model.mjs,view.mjs,style.css,README.md}`, `tests/system.test.mjs`, `scripts/check_p15.cjs`, `scripts/check_p15_edges.cjs`. Dependency sửa giới hạn: auth-session app/auth-flow/index, Home lifecycle/guard, callback system của P04/P05/P07. Không sửa shared footer/dialog/palette, ảnh baseline, dist/gallery; không push/merge/deploy. Working copy chứa nhiều module untracked của chat khác; báo cáo không nhận các thay đổi đó là của P15.

## Coverage và hành vi

| Panel | Thực thi | Visual / Behavior / Integration |
|---|---|---|
| P15.S01 | Kết nối/UNKNOWN; Thử lại chỉ gọi nguồn đọc hoặc owner.check; không nguồn thì dialog hướng dẫn; giữ phiếu/request | IN_PROGRESS / PASS / BLOCKED |
| P15.S02 | Hủy auth/epoch; chặn caller và nav; login→xác nhận; đúng identity mới phục hồi owner trong cùng trang | IN_PROGRESS / PASS / BLOCKED |
| P15.S03 | Quay lại/Contact cấu hình; effective guard route+action, không đổi role hoặc tự gửi liên hệ | IN_PROGRESS / PASS / BLOCKED |
| P15.S04 | Camera và NFC riêng; not-requested/denied/unsupported/hardware-error; xin camera theo click, đóng stream | IN_PROGRESS / PASS / BLOCKED |

[Review toàn board](REVIEW.html) · [S01](evidence/revision-01/P15-S01.png) · [S02](evidence/revision-01/P15-S02.png) · [S03](evidence/revision-01/P15-S03.png) · [S04](evidence/revision-01/P15-S04.png) · [Baseline](evidence/revision-01/B15-baseline.png).

A01–A05 **PASS prototype**: UNKNOWN→đọc cùng request, recordCalls vẫn1 và tồn không đổi; hết phiên chặn mutation kể cả response muộn; direct route khi bị thu hồi quyền bị chặn; từ chối camera không crash/NFC không hỗ trợ không hiện ready; Back giữ caller/phiếu/scroll. [Acceptance](STATE_ACCEPTANCE.csv).

## Kiểm chứng

- `node --test tests/system.test.mjs tests/auth-session.test.mjs tests/auth-session-stability.test.mjs tests/home.test.mjs tests/inbound.test.mjs tests/outbound.test.mjs tests/nfc.test.mjs tests/p14-logout-retention.test.mjs tests/dialog-route.test.mjs`: **123/123 PASS**, gồm11 ca P15. [Log](evidence/revision-01/node-tests.txt).
- `node scripts/check_p15.cjs`: **8/8 nhóm PASS**, ba panel×5viewport, S02 auth/caller, guard, modal Back/Escape/Tab/backdrop, context, UNKNOWN/read. [Kết quả](evidence/revision-01/browser-results.json).
- `node scripts/check_p15_edges.cjs`: **4/4 nhóm PASS**, S02×5viewport, expiry khi dialog mở, UNKNOWN qua reauth, camera hardware-error/live-track grant bằng API mock, reload. [Kết quả](evidence/revision-01/edge-results.json).
- `HOME_FOOTER_EVIDENCE_DIR=handoff/P15/evidence/revision-01/footer-regression node scripts/check_home_footer_locked.cjs`: **4/4 viewport PASS**. [Kết quả](evidence/revision-01/footer-regression/results.json).
- Chạy source `scripts/check_p14_logout.cjs` bằng Node, chỉ thay thư mục output sang evidence P15: **7/7 nhóm PASS**, P14 history/Back/logout/retention,6viewport. [Kết quả](evidence/revision-01/p14-regression/logout-results.json). Không ghi đè evidence P14.

Tổng **23 nhóm/viewport trình duyệt** (8+4+4+7), không pageerror trong các suite đạt. Chromium headless, DPR1, zoom1, Arial; CSS viewport494×950,360×800,430×932,1440×900,340×420; P14 thêm1869×940. Không build/package pipeline riêng cho target; kiểm Node và browser trực tiếp. Failures lúc phát triển được giữ như diagnostics, không tính vào kết quả cuối: selector Back trùng; metric checkCalls không tồn tại trong adapter; ca Back đi qua document navigation gây reset fixture theo policy. Đã sửa selector/assertion để kiểm đúng cùng trang. Ảnh canonical đã chụp lại sau sửa lớp che scan-circle và ổn định scroll preview.

## Khác biệt hình thức / giới hạn

494×950 theo khóa mới thay ratio ảnh B15; không status bar giả. Header25px, nền/card/icon pastel dùng component hiện có, CTA56px. Icon mạng/khóa dùng glyph sẵn có cộng cảnh báo, không tracing dấu gạch/cấm trong raster. Camera ban đầu hiện **Chưa yêu cầu quyền** đúng bằng chứng; B15 là tình huống đã từ chối. State granted chỉ sau live-track API; screenshot granted là **API mock**, không chứng minh camera vật lý. Footer dùng nguyên node/style Home/P03; P15 cho hiện menu ngay cả khi caller P04/P05 đang ẩn, và giữ guard khi expired. Những adaptation này chờ review; không pixel-perfect/PASS raster.

HTTP auth/WMS, contract đọc kết quả P17, mapping quyền nguồn, contact quản trị, policy giữ phiếu nhạy cảm qua reauth và persistence chưa có production adapter. Home boundary nhận lỗi đã phân loại; P04/P05 hiện chỉ có fixture, không có HTTP production để nghiệm thu401/403 thật. P07 fixture mở P15 nhưng không biến fixture thành bằng chứng phần cứng. Native camera/NFC, system settings, keyboard thật **NOT_RUN**. Bộ nhớ phục hồi chỉ cùng trang/đúng namespace–actor–kho; reload/reset/pagehide xóa fixture; không lưu password/token vào checkpoint. P16–P24 chưa hoàn tất.

Mở [preview](http://localhost:8766/flows/auth-session/), đăng nhập `minhanh / preview` → xác nhận → mở **P15 · Hệ thống** trong công cụ prototype ngoài khung app. Không thêm mục Hệ thống vào menu sản phẩm.
