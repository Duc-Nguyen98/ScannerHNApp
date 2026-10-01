> User tạm chốt P18 r03 ngày2026-09-29; có thể bổ sung state đồng bộ sau. [Ghi nhận](TEMPORARY_ACCEPTANCE_2026-09-29.md). Production chưa xác minh.

> Bản mới nhất: [P18 r03 — audit và sửa lỗi UI/UX](REVISION_03.md) · [Review trước–sau](REVIEW_03.html).

> Bản mới nhất: [P18 r02 — sáu nâng cấp UX](REVISION_02.md) · [Review trước–sau](REVIEW_02.html).

# P18 r01 — Đính kèm, bàn giao và vị trí linh kiện

Đã triển khai đủ **P18.S01–S04** ở prototype. **Visual: chờ user review. Behavior: PASS trong phạm vi preview đã kiểm. Integration: BLOCKED production.** P17 r02 được user **tạm chốt**, có thể bổ sung state; không suy thành backend PASS. P19–P24 chưa hoàn tất.

## Nguồn / target

- Source/HEAD `da9f623a19d0359c3e80c14f8cc612636ec6ab78`; target HTML/CSS/JS `docs/flows`, workspace `C:/Users/TAN MIE/Downloads/app_Scanner/ScannerHNApp`. Không package.json/build ứng dụng tại target này; chạy bằng server preview hiện hữu `python scripts/serve_preview.py --port 8766`.
- Đã đọc prompt P18, BOARD_INDEX, Contract v2.0 được cung cấp; AGENTS/UI_STANDARD, HANDOFF và DEV_PROPOSAL tại repo. Proposal không phải backend contract.
- [B18 nguyên bản](evidence/revision-01/B18.png) có Git blob `b2097c845e4c173631a4014bfbc64f04c9d28aab`, trùng Git object ở HEAD. SHA256 `d224f33e82eab41f08b23fc092522181a5439e42b8d1901e0e483be4f95331ad`. Không sửa ảnh baseline, gallery/dist.
- [Nguồn/số đo trước sửa](SOURCE_MAP.md), [review hình thức và trước–sau](REVIEW.html), [patch dependency](evidence/revision-01/dependency-changes.patch), [manifest](evidence/revision-01/manifest.json). Các module P01–P17 đã untracked trước phiên; giữ công việc có sẵn. P18 không tồn tại trước sửa, nên before là điểm nối P12/P09/P06 thật từ source snapshot; không giả ảnh “P18 trước sửa”.

## Coverage và quyết định

| Panel | Kết quả | Disposition | Evidence |
|---|---|---|---|
| P18.S01 | Context đúng ID; hàng ready/upload75%/error/image ready; cancel/retry theo task, UNKNOWN khóa gửi lại; menu thông tin không delete | LEGACY_ADAPTED | [Actual](evidence/revision-01/P18-S01-494x950.png) |
| P18.S02 | PDF.js render bytes PDF thật, Prev/Next cùng ID, tải xuống đúng byte; viewer ảnh thật; loading/error/retry | LEGACY_ADAPTED | [Trang1](evidence/revision-01/P18-S02-494x950.png), [trang2](evidence/revision-01/viewer-page2.png) |
| P18.S03 | Đọc owner P09 và POSTED ledger; checkbox/người nhận/ngày/ghi chú200, giữ bản nhập; kiểm validation và giải thích blocker, không close case | MIGRATED | [Đầu form](evidence/revision-01/P18-S03-494x950.png), [cuối form](evidence/revision-01/handoff-form-bottom.png), [chỉ đọc](evidence/revision-01/handoff-closed.png) |
| P18.S04 | Đọc linh kiện P06; field chưa có nguồn là Chưa xác minh; fixture sáu ô có selection/legend, CTA không move/unmap/đổi tồn | MIGRATED | [Fixture](evidence/revision-01/P18-S04-494x950.png), [cuối nội dung](evidence/revision-01/P18-S04-bottom.png), [thiếu nguồn](evidence/revision-01/location-source-unknown.png) |

Giữ shell494×950 co đồng nhất, nội dung cuộn trong app, footer Home/P03 không đổi. S02/S03 dùng action footer của board; S01/S04 dùng nav đã khóa. Dialog trong app, Back/Escape/focus và backdrop không đóng; nội dung dài dùng reader chung. Không thêm status bar giả.

**Nguồn tệp có hai chế độ tách biệt:** mở từ P12 giữ hai attachment ID/URL hiện có của PN-0005, viewer đọc đúng tệp đó. Nút “S01 · Bốn tệp mẫu B18” ngoài app bật dataset riêng để trình diễn upload; không trộn bốn tệp này vào danh sách/tổng P12. Bộ B18 gồm PDF2trang tạo bằng cách ghép hai PDF fixture P12, hai ảnh box có sẵn và một upload lỗi. Kích thước PDF2trang đo từ byte thật; ảnh không tự gán2.1MB theo raster. Mô phỏng upload chỉ phát event local, không gửi file/tài khoản thật. Không có timer tự kết luận thành công production.

**Bàn giao:** BH-001 hiện Đang kiểm tra, tổng quantity POSTED là3 (hai dòng), không đổi nguồn thành “Đã sửa chữa”/2chiếc để khớp B18. BH-005 cho kiểm trạng thái Chờ bàn giao; BH-002 kiểm read-only. Checklist không phải quyền đóng hồ sơ. Khác biệt ở ngày/linh kiện/tên sản phẩm là dữ liệu owner hiện tại. Ngày mặc định form là ngày Việt Nam, không giả ngày server xác nhận.

**Vị trí:** P06 xác định linh kiện `fixture-component-01`/SKU `LK-0001`, tên “Trục lăn máy in XP-420B”, vị trí hiện có D-02-01. Không đổi SKU/stock để khớp tên Đầu in trên ảnh. Pallet/khay/capacity chưa có nguồn; bộ20 chỉ xuất hiện khi bật “Số liệu B18 (chỉ fixture)” ngoài app. Chọn B2=0 trong fixture khác dữ liệu thiếu=null.

## Acceptance thực chạy

| Ca | Kết quả preview |
|---|---|
| A01 | PASS: retry độc lập; chống begin trùng, cancel vô hiệu callback muộn, error/UNKNOWN giữ taskID; không reset tệp khác |
| A02 | PASS: PDF2trang render khác nhau, giữ document/fileID; download SHA256 trùng nguồn; source P12 mở PDF1trang đúng ID; guard scope/actor/authSession/kho/quyền |
| A03 | PASS: thiếu field focus lỗi; note200; đủ field vẫn không đóng case khi thiếu policy; hồ sơ trả khách chỉ đọc |
| A04 | PASS: selection chỉ đổi UI; keyboard giữ focus; CTA dialog giải thích chưa thực hiện thay đổi |
| A05 | PASS behavior: không có nguồn thì không hiện capacity20; fixture opt-in rõ nguồn. Integration vẫn BLOCKED |

- `node --test tests/attachments.test.mjs tests/documents.test.mjs tests/warranty.test.mjs tests/lookup.test.mjs tests/home.test.mjs`: **54/54 PASS**, gồm9 test P18. [Log](evidence/revision-01/node-tests.txt).
- `node scripts/check_p18.cjs`: **9/9 nhóm PASS**, bốn panel×5viewport, download byte/hash, lỗi tải, quyền/phiên, owner navigation. [Kết quả](evidence/revision-01/browser-results.json).
- `node scripts/check_p18_edges.cjs`: **4/4 nhóm PASS**, Unicode/2000+, reader, backdrop/Back/focus, response đến muộn, form200ký tự và viewer ảnh. [Kết quả](evidence/revision-01/edges/results.json).
- `DOCUMENTS_TABS_EVIDENCE_DIR=handoff/P18/evidence/revision-01/p12-tabs node scripts/check_documents_tabs.cjs`: **9/9 nhóm PASS**, có6viewport. [Kết quả](evidence/revision-01/p12-tabs/tabs-results.json). Assertion cũ đợi HTML preview đã được cập nhật thành viewer PDF P18 và Back về tab P12; lượt thử cũ FAIL selector không được tính PASS.
- `HOME_FOOTER_EVIDENCE_DIR=handoff/P18/evidence/revision-01/footer node scripts/check_home_footer_locked.cjs`: **4/4 viewport PASS**. [Kết quả](evidence/revision-01/footer/results.json).
- Syntax module chỉnh và `git diff --check`: PASS. Git diff chỉ bao phủ tracked; dependency patch đối chiếu source snapshot cho module untracked. Không tự bịa build/lint command.
- Chromium headless, Arial, DPR1, zoom1, reduced motion, ngày theo Asia/Ho_Chi_Minh. Reference494×950; thêm360×800,430×932,1440×900,340×420. Ảnh capture cuối chờ font/image decode; có đầu/cuối vùng cuộn. [Điều kiện](evidence/revision-01/capture-conditions.json).

Đã xem actual cả bốn panel, PDF trang2, form cuối và ảnh ở viewport thấp. Các lượt đầu có lỗi timing của script capture/login và normalization newline của input một dòng; đã sửa harness, chạy lại đạt. Các diagnostic failure giữ để truy vết, không phải kết quả cuối. Test layout không phải raster sign-off hay kiểm screen reader/thiết bị thật.

## File sửa / thêm

- Mới `docs/flows/attachments/{model,fixture-adapter,view,icons}.mjs`, `style.css`, PDF sample và vendor PDF.js5.6.205 (bundled runtime; Apache2.0 LICENSE kèm theo). SVG từ Git HEAD/Lucide đã có, giấy phép ISC theo app.
- `home/home-flow.mjs`, `home/home.mjs`: đăng ký/mount/cleanup route và truyền context P18. `auth-session/index.html`: CSS scoped.
- `documents/documents.mjs`: entry danh sách tệp và viewer thật; không đổi dữ liệu/ID/tổng tệp P12. `warranty/warranty.mjs`: entry bàn giao đúng case. `lookup/lookup.mjs`: entry vị trí đúng item, chỉ component.
- Test P18/ảnh/reference/report/review; chỉnh một assertion hồi quy `scripts/check_documents_tabs.cjs`. Cập nhật SCREEN_COVERAGE/RUN_STATE và acceptance tạm thời P17; không đổi P12–P14 revision gốc.

## Hình thức còn chờ review / integration blocker

1. Header/type/padding/card là adaptation B18 theo shell và component đã khóa. Form S03 và thông tin vị trí S04 cuộn nội bộ, CTA luôn thấy; ảnh cuối vùng cuộn được cung cấp. Chưa có ngưỡng pixel-diff/Designer sign-off; **visual IN_PROGRESS**, không tuyên bố pixel-perfect.
2. Chưa có policy upload production: loại/MIME, size, quyền, endpoint, receipt và đối chiếu UNKNOWN. Không lấy dung lượng ví dụ làm giới hạn; không có nút chọn file thật để vượt policy.
3. Chưa có điều kiện/quyền/API bàn giao/đóng hồ sơ, receipt/version/retry và field người nhận phía server. Form/validation ở đây không cấp quyền đó.
4. Chưa có schema pallet/khay/ô/capacity và policy xác nhận vị trí. Không ghi stock/location/case; không giả production PASS từ fixture.

Mọi phần độc lập đã thực hiện. Ba nhóm quyết định backend còn cần DEV/BA chốt chính là upload, bàn giao và vị trí ở trên; không chặn review giao diện. Không push/merge/deploy.

## Mở review

[Ứng dụng](http://localhost:8766/flows/auth-session/) · `minhanh / preview`.

- Chứng từ → PN-0005 → tab Tài liệu → “Tệp và tác vụ tải lên”; bấm tên PDF để xem tài liệu thật. Back về đúng tab.
- Hồ sơ bảo hành → tab Thông tin → “Bàn giao bảo hành”. Tra cứu → Linh kiện → Xem tồn → “Xem vị trí linh kiện”.
- Để review đủ trạng thái B18, mở bộ **P18** ngoài khung app: S01 bốn tệp; S03 BH-001/BH-005/BH-002; S04 và checkbox số liệu fixture. Retry có ba kết quả ready/error/unknown. Reload reset fixture, không tuyên bố lưu bền production.
