# P22 r01 — Lịch sử thao tác & NFC

**Bản mới nhất: [P22 r03 — rà soát và sửa12ca UI/UX](REVISION_03.md) · [Review r03](REVIEW_03.html).** Báo cáo r01 bên dưới và r02 giữ làm lịch sử; không thay bằng nghiệm thu visual.

Đã triển khai đủ **P22.S01–S04**, trong app preview hiện hữu. **Visual: chờ user review. Behavior: PASS_PROTOTYPE trong phạm vi kiểm tra. Integration: BLOCKED_PRODUCTION.** P21 r03 được user tạm chốt ngày30/09/2026; state đồng bộ bổ sung sau, không thay source P21.

- Source/HEAD: `da9f623a19d0359c3e80c14f8cc612636ec6ab78`; target `prototype`, workspace `C:/Users/TAN MIE/Downloads/app_Scanner/ScannerHNApp`. Working copy đã có P01–P21 chưa commit; giữ công việc ngoài phạm vi. Không có package.json/build app production ở target này; preview phục vụ docs bằng server hiện hữu8766.
- [Review trước–sau](REVIEW.html) · [Trace/số đo trước sửa](DESIGN_TRACE.md) · [Acceptance](STATE_ACCEPTANCE.csv).
- [Baseline B22 được user cung cấp](../../../../ScannerHNApp_24_Prompts_v2.0/ScannerHNApp_24_Prompts/references/B22.png). Board path chuẩn vẫn `design/01_Main/BOARDS/02_NEW_BOARDS/20_lich_su_thao_tac_nfc.png`, file raster không có trong working copy này; không tạo/sửa baseline.

## Phạm vi và quyết định

| Panel | Thực thi | Trạng thái |
|---|---|---|
| S01 | Giữ hub6entry hiện có, bốn nghiệp vụ B22 + Lịch sử chung/Hoạt động theo ngày; không shortcut phiếu dở | MIGRATED theo quyết định user trước; Home Xem tất cả vẫn P12 |
| S02 | Owner đọc NFC riêng; event adapter/ID, loại/UID/serial/ngày/status, nhóm ngày Việt Nam; giữ query/scroll/focus | CURRENT; fixture opt-in |
| S03 | Đúng event ID; product/actor từng event; UID cũ/lý do nếu có; chỉ đọc, reader3/2dòng | CURRENT; ID thiếu/sai không chọn event đầu |
| S04 | Chưa có nguồn/chưa khả dụng; retry chỉ đọc; rỗng có xác nhận và lỗi đọc là nhánh riêng | CURRENT; default không có nguồn |

Filter/search dùng history-controls và picker chung; header/controls/footer cố định, chỉ danh sách cuộn trong khung494×950 uniform scale. Dialog/reader, pastel nghiệp vụ và trạng thái riêng giữ contract. Search250ms/Enter/IME; thay route hủy đọc/bỏ callback cũ; timeout15giây chỉ nguồn đọc preview. Không ghi WMS, không suy audit từ P07 đọc UID/prepare/current status. Fixture là mẫu minh họa, không xác nhận API enum/mapping của backend. B22 ban đầu3event +1event dependency P08; ngày09–10/09 không giả “Hôm nay” vào30/09.

## Kiểm chứng thật

- `node scripts/test_p22.cjs`: **69/69 logic PASS**, gồm13test P22 và regression auth/Home/P07/picker/date. [Log](evidence/revision-01/logic/node-tests.txt).
- `node scripts/check_p22.cjs`: **7/7 nhóm**, trong đó ma trận **20panel×viewport**, không pageerror. [Kết quả](evidence/revision-01/after/results.json), [layout](evidence/revision-01/after/layout.json).
- `node scripts/check_p22_edges.cjs`: **8/8 nhóm**: Home/P12, date Apply/Cancel/bounds, scroll/keyboard, timeout, focus ngoài app, legacy URL/P08 ID, các owner hub, login mới không mang fixture/cache cũ. [Kết quả](evidence/revision-01/edges/results.json).
- `HOME_FOOTER_EVIDENCE_DIR=handoff/P22/evidence/revision-01/footer node scripts/check_home_footer_locked.cjs` (PowerShell `$env:...`): **4viewport PASS**, Home/P03 footer không đổi. [Kết quả](evidence/revision-01/footer/results.json).
- `node --check` module mới và Home; `git diff --check`: exit0. Playwright headless Chromium, DPR1, zoom mặc định, viewport494×950/360×800/430×932/1440×900/340×420; font local. Before/after cùng494×950/DPR1; fixture trước generic P08, sau nguồn B22 tách biệt nên không dùng pixel-diff để tự PASS.

Ảnh thực tế đủ4panel, ID sai, empty/no-match/error, reader, date và timeout. Đã xem ảnh hub/list/detail/unavailable và reader. Các lượt test ban đầu lỗi selector harness (tools đóng, nav ẩn, data-screen-id, chờ login) lưu failure để truy vết; JSON results cuối là lượt đạt sau sửa. Hai cải tiến phát hiện trong kiểm: Xóa lọc xuất hiện ngay khi nhập query mà không thay DOM input; lọc/tabs neo cố định khi list cuộn.

## File thay đổi

App mới: `docs/flows/history/nfc-audit-{model,fixture,view}.mjs`, `nfc-audit.css`. Dependency trực tiếp: `home/home.mjs` route/lifecycle, `history/embedded-history.mjs` NFC entry, `auth-session/index.html` stylesheet. Giữ hub source/layout/P08/P23, backend/P07 owner/P19–P21/footer, gallery/dist.

Test: `tests/nfc-audit.test.mjs`; `scripts/capture_p22_before.cjs`, `check_p22.cjs`, `check_p22_edges.cjs`, `test_p22.cjs`. Handoff P22, ghi nhận tạm chốt P21, UI_STANDARD, SCREEN_COVERAGE và RUN_STATE cập nhật riêng phần liên quan.

## Giới hạn và bàn giao

Chưa có nguồn backend event/quyền/schema/mapping/cursor được chốt: **không gọi endpoint DEV_PROPOSAL**. Cần DEV cung cấp audit/event thật và mapping được duyệt trước tích hợp; fixture không chứng minh production. Thiết bị NFC/camera/bàn phím thật, auth backend, lưu bền NOT_RUN. Reload/logout xóa dữ liệu trong bộ nhớ preview. P23/P24 full board vẫn chưa hoàn tất.

Khác baseline có trace: hub6entry/no shortcut/HomeP12 là user-change; frame/font metrics/filter ngày/dock và actor/product sample đa dạng là adaptation cần review. Không tuyên bố pixel-perfect, không push/merge/deploy. Mở [preview](http://localhost:8766/flows/auth-session/?v=p22-r01), đăng nhập `minhanh / preview` → Lịch sử → NFC. Muốn xem S02/S03 chọn **P22 → Nguồn xem thử → Mẫu B22** ngoài khung app. Default S04 là chủ ý an toàn, không lỗi.
