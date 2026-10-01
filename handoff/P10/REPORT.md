> Mới nhất: [P10 r10 — sửa lỗi tương tác UI/UX](REVISION_10.md). 27 nhóm browser và31 Node PASS;4 nhóm nguyên nhân được xử lý, actual cần review.

> Mới nhất: [P10 r09 — Tài khoản của tôi căn giữa](REVISION_09.md), theo chỉ thị mới của user.

> Mới nhất: [P10 r08 — Tài khoản của tôi](REVISION_08.md). Câu chữ đã được áp dụng; giữ vị trí cũ và nav Cá nhân.

> Mới nhất: [P10 r07 — trả vị trí tiêu đề cũ theo user](REVISION_07.md). Bản căn giữa r06 đã được thay thế. Câu chữ mới đang là đề xuất.

> Mới nhất: [P10 r06 — căn giữa tiêu đề Cá nhân](REVISION_06.md).

> Mới nhất: [P10 r05 — vùng chạm, đường tắt, keyboard](REVISION_05.md). 28 nhóm browser và30 test logic PASS; actual trước–sau chờ review, thiết bị thật chưa kiểm.

> Mới nhất: [P10 r04 — chỉ báo chưa lưu và nhóm Bảo mật](REVISION_04.md). Hai nâng cấp được duyệt đã áp dụng;20 nhóm browser PASS.

> Mới nhất: [P10 r03 — audit luồng và UI/UX](REVISION_03.md). 46/46 Node, 70 nhóm browser PASS. [Đề xuất bổ sung](UI_UX_PROPOSALS.md). P11 prototype hiện đã nối; backend vẫn chưa tích hợp.

> Mới nhất: [P10 r02 — nhóm menu và nút Đăng xuất](REVISION_02.md). 12/12 nhóm browser PASS; phương án user đã duyệt được áp dụng. Báo cáo r01 bên dưới giữ làm lịch sử.

# P10 · Cá nhân · r01

Đã triển khai đủ **4/4 panel** vào prototype hiện có. Người dùng tạm chốt P09 r09 ngày 28/09/2026; các state P09 bổ sung sau. Không sửa source P09 hoặc coi P11–P24 đã hoàn thành.

## Source và phạm vi

- HEAD: `da9f623a19d0359c3e80c14f8cc612636ec6ab78`. Thư mục: `C:/Users/TAN MIE/Downloads/app_Scanner/ScannerHNApp`. Target: `prototype`.
- Source editable HTML/CSS/ES modules; không có package/build pipeline ở target này. Server đang chạy `scripts/serve_preview.py` tại `http://127.0.0.1:8766/flows/auth-session/`.
- Working tree chứa các thay đổi P01–P09 từ trước. Chỉ thay dependency trực tiếp; không sửa dist/gallery/baseline, push/merge/deploy hoặc gọi API/phần cứng.
- Baseline sử dụng đúng B10 do user cung cấp, SHA256 `751f5f0d7b840d3a75e98aca9e52a9bdfedb2ae0a3d275fcf20df7d021affee4`. Đường dẫn ảnh design được tài liệu trỏ tới không có trong working checkout; dùng bản đính kèm, không suy nguồn ảnh mới. Bảng số đo trước code: [CONTEXT.md](CONTEXT.md).

## Coverage

| Panel | Kết quả | Visual | Behavior | Integration |
|---|---|---|---|---|
| P10.S01 | Hero identity từ phiên, năm menu, version metadata prototype, nav hiện có; logout P01 độc lập end shift | IN_PROGRESS: chờ user | PASS prototype | BLOCKED auth/shift production |
| P10.S02 | Avatar/camera, ba field editable, email/role/kho readonly; footer lưu; dirty guard | IN_PROGRESS: chờ user | PASS safe preview; A01 save thật BLOCKED | BLOCKED profile/upload/validation |
| P10.S03 | Vai trò/kho khóa; sáu ô quyền chỉ đọc; notice admin | IN_PROGRESS: chờ user | PASS không tự cấp quyền | BLOCKED mapping quyền riêng |
| P10.S04 | Ba menu bảo mật, notice có nguồn B10; intent P11/context và dialog pending | IN_PROGRESS: chờ user | PASS điểm nối hiện có | BLOCKED P11/session/security backend |

## Hành vi và quyết định có nguồn

- Actor ID/tên/role/kho lấy cùng P01 state; không đổi fixture P01 để khớp B10. Contact B10 riêng `fixture-minhanh` trong namespace auth preview; Lan Nguyễn không nhận nhầm email/phone của Minh Anh.
- Profile patch chỉ allowlist `name/nickname/phone`; đây là boundary preview, chưa phải schema API. Email, role, kho, ID, permission không được gửi qua patch. Không tự thêm regex/length/required policy từ dấu sao ảnh. Khi nhấn Lưu, action báo chưa tích hợp và giữ bản nhập; không phát sinh thành công giả hoặc đổi Home identity.
- Avatar chưa có upload adapter: báo chưa kết nối, giữ avatar cũ; không mở camera, chọn file hoặc upload giả. A05 backend failure thật vẫn chưa chạy.
- P01 chỉ xác nhận `warehouseOperations`; sáu capability riêng chưa có nguồn. Hiển thị `? Chưa xác minh` thay sáu tick xanh của ảnh, không suy role thành quyền. Grid không có checkbox/button cấp quyền.
- Đổi mật khẩu → intent P11.S01; Phiên đăng nhập → P11.S04; Kết thúc ca → P14. Context gồm actor/warehouse/returnTo, không chứa token; chưa có màn đích nên hiện dialog pending và giữ màn gọi. Thông tin bảo mật chỉ dùng lời nhắc trong B10, không thêm thiết bị/2FA/OTP.
- Dirty Back và điều hướng URL dùng shared app modal: tiếp tục chỉnh hoặc bỏ có xác nhận, không tự lưu. Dialog nằm trong app, trap focus, Escape/Back đóng dialog trước, không chồng overlay.
- Logout gọi P01 teardown, không gọi end-shift, không clear localStorage; Back không phục hồi phiên. Fixture phiếu dở kiểm chứng vẫn giữ.

## Kiểm chứng thật

| Lệnh | Kết quả |
|---|---|
| `node --test tests/profile.test.mjs tests/dialog-route.test.mjs tests/home.test.mjs tests/auth-session.test.mjs tests/scanner-dialogs.test.mjs` | **46/46 PASS**, gồm 5 test P10 và regression namespace modal |
| `node scripts/check_profile.cjs` | **12/12 nhóm PASS**, 24 layout captures (4 panel × 6 viewport) |
| `HOME_EVIDENCE_DIR=handoff/P10/evidence/revision-01/home-regression node scripts/check_home.cjs` | **14/14 nhóm PASS**, 7 captures |
| `DIALOG_EVIDENCE_DIR=handoff/P10/evidence/revision-01/dialog-regression node scripts/check_dialogs.cjs` | **16/16 nhóm PASS**, 29 captures |
| `node scripts/capture_profile.cjs` | 4 ảnh reference riêng từng browser surface |
| `python scripts/evidence_profile.py` | Crop baseline, overview, REVIEW và source checksum |

Tổng browser: **42 nhóm**. Không lỗi JS hay request ngoài localhost trong các lần chạy cuối. Các lệnh env trên viết dạng rút gọn; thực tế dùng `$env:...` trong PowerShell. Không chạy full repo để nhận nghiệm thu toàn app. Browser kiểm pointer, Tab/Shift+Tab/Enter/Escape, native Back, dữ liệu khác actor, readonly, blocked-save, logout; viewport thấp chỉ mô phỏng vùng hiển thị khi bàn phím xuất hiện, **bàn phím thiết bị thật NOT_RUN**.

Ma trận: 494×1000, 360×800, 430×932, 1440×900, 340×420, 1869×940 CSS px, DPR1, zoom1, Arial. App vẫn 494×950, co đồng nhất; header/footer/nav ổn định, nội dung cuộn trong app; không tràn ngang. Lần đầu phát hiện card flex bị co và màu chữ CTA sai do specificity: đã sửa rồi chụp/kiểm lại. Hai assertion regression cũ coi P10 là pending đã đổi sang chờ panel P10 thực. Ảnh reference cuối lấy từ browser surface mới sau khi font/layout ổn định; giữ ảnh chụp nguyên bản, không chỉnh pixel.

## Bằng chứng và khác biệt visual

- [Review baseline/actual](REVIEW.html), [overview 4 panel](evidence/revision-01/P10-r01-overview.png), [B10 nguyên bản](evidence/revision-01/B10-baseline.png).
- Actual: [S01](evidence/revision-01/P10-S01-actual.png), [S02](evidence/revision-01/P10-S02-actual.png), [S03](evidence/revision-01/P10-S03-actual.png), [S04](evidence/revision-01/P10-S04-actual.png).
- [Browser results](evidence/revision-01/browser-results.json), [metrics](evidence/revision-01/metrics.json), [logic log](evidence/revision-01/node-tests.txt), [source manifest](evidence/revision-01/source-sha256.json), [acceptance](STATE_ACCEPTANCE.csv).
- So với B10: dùng khung/navigation chung đã chốt; bỏ status bar giả; font Arial/icon repo thay asset gốc chưa có; ô nghiệp vụ theo pastel chuẩn chung; logout dùng đỏ riêng; quyền thiếu nguồn hiển thị unknown; build label lấy metadata P10-r01. Bố cục bảo toàn hero/menu/form/grid/notice, không render ảnh thành UI.
- Chưa có ngưỡng pixel/asset font B10 để tuyên bố pixel-perfect. **Visual chờ duyệt**, không tự PASS board.

## File thay đổi

Mới: `docs/flows/profile/{index.html,profile.mjs,profile-model.mjs,icons.mjs,style.css}`; `tests/profile.test.mjs`; `scripts/{check_profile.cjs,capture_profile.cjs,evidence_profile.py}`; `handoff/P10/`.

Dependency: `home/home.mjs` mount/route/lifecycle/dirty guard; `auth-session/index.html` thêm CSS; `shared/dialog-route.mjs` thêm key tùy chọn (P03 giữ default, P10 key riêng); `tests/dialog-route.test.mjs` kiểm độc lập owner. `scripts/check_home.cjs`, `scripts/check_dialogs.cjs` cập nhật kỳ vọng P10 đã có màn. Metadata: `RUN_STATE.json`, `SCREEN_COVERAGE.csv`, ghi user tạm chốt P09.

## Phần cần nguồn để tích hợp tiếp

1. Contract đọc/PATCH profile, validation tên/điện thoại và upload avatar (allowed fields, errors, session refresh).
2. Mapping sáu quyền riêng từ nguồn xác thực/quản trị; chưa dùng `warehouseOperations` để suy tick.
3. Màn và contract P11/P14 cùng metadata build thật; sẽ nối theo prompt tương ứng. Chưa cần mở rộng nghiệp vụ để hoàn thiện UI P10 hiện tại.
