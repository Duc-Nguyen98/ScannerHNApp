> **Bản hiện tại: P11 r03.** Màn kết quả vừa khung và contract dialog mới. Xem [REVISION_03.md](REVISION_03.md). Các revision trước dưới đây giữ làm lịch sử.

> **Bản hiện tại: P11 r02.** Đã khắc phục luồng mặc định và nối credential/session P01–P11. Xem [REVISION_02.md](REVISION_02.md). Nội dung r01 bên dưới giữ làm lịch sử; mô tả default blocked/adapter tách biệt đã được r02 thay thế.

# P11 — Bảo mật — r01

2026-09-28. User tạm chốt P10 r02, state đồng bộ bổ sung sau; yêu cầu triển khai P11. Đã dựng đủ **4/4 panel**, nối P10 → P11 → P10. **Visual: chờ nghiệm thu. Behavior: PASS trong phạm vi kiểm thử prototype. Integration: BLOCKED backend.**

Source commit `da9f623a19d0359c3e80c14f8cc612636ec6ab78`; workspace `C:/Users/TAN MIE/Downloads/app_Scanner/ScannerHNApp`. Target `prototype`, HTML/CSS/ES modules trong `docs/flows/`. Working tree đã có nhiều thay đổi chưa commit từ các chat khác; không reset, sửa dist/gallery, push/merge/deploy hoặc gọi API/phần cứng mới.

## Xem và chạy

- [Bốn panel actual](evidence/revision-01/P11-r01-overview.png), [đối chiếu từng panel với B11](REVIEW.html), [nguồn và số đo trước code](CONTEXT.md).
- Preview: http://127.0.0.1:8766/flows/auth-session/ — `minhanh` / `preview` → Bắt đầu ca → Cá nhân → Tài khoản & bảo mật → Đổi mật khẩu hoặc Phiên đăng nhập.
- Default adapter chưa kết nối: giữ nội dung đang nhập khi bị chặn, không đổi mật khẩu, không tạo danh sách thiết bị như thật.
- Để review S03/S04 theo B11, mở **P11 · Kịch bản kiểm chứng** ngoài app, chọn **B11 · thành công & hai thiết bị (fixture)**. Chỉ nhập credential thử. Adapter đổi credential trong bộ nhớ riêng P11, không đổi credential P01/tài khoản thật. Không có badge dữ liệu mẫu trong app; metadata và cảnh báo fixture ở công cụ review ngoài app.
- Máy chủ hiện hữu dùng `python scripts/serve_preview.py --port 8766`; không khởi động server trùng cổng trong lượt này.

## Coverage

| ID | Thực hiện | Visual | Behavior | Integration |
|---|---|---|---|---|
| P11.S01 | Ba password input, eye riêng, required/local validation, hint, CTA đáy; không trim/normalize/persist/log password | IN_PROGRESS | PASS | BLOCKED policy/change API |
| P11.S02 | State lỗi của cùng form; viền đỏ và lỗi xác nhận; aria-invalid, focus đúng field; sửa khớp xóa lỗi | IN_PROGRESS | PASS | BLOCKED server policy/error contract |
| P11.S03 | Check xanh, tài khoản/kho từ P01, thời gian từ receipt; chỉ hiện sau receipt hợp lệ, CTA về P10.S04 | IN_PROGRESS | PASS fixture | BLOCKED receipt/session policy |
| P11.S04 | Tách current/other sessions, metadata thiếu hiển thị chưa có dữ liệu; xác nhận revoke và kiểm lại danh sách | IN_PROGRESS | PASS fixture | BLOCKED list/revoke/reconcile API |

S02 không cần route riêng. Deep link S03 không có receipt hợp lệ sẽ về form. Current session ID do adapter cấp, không phải token/scan-session; không có nút revoke current. Revoke chỉ dùng đúng ID được chọn. UNKNOWN giữ request và khóa gửi lại; đối chiếu trước retry. Back/rời màn xóa plaintext password; không xóa dữ liệu dở của module khác. Response muộn sau dispose/đổi actor không mở success. P15 còn pending; expired/fixture reauthenticate đi qua logout P01 và phát dependency P15, không tự dựng P15 hoặc bỏ route guard.

## Kiểm chứng đã chạy

1. `node --test tests/security.test.mjs tests/profile.test.mjs tests/home.test.mjs tests/auth-session.test.mjs tests/auth-session-stability.test.mjs tests/dialog-route.test.mjs tests/scanner-dialogs.test.mjs` — **85/85 PASS**, trong đó P11 **32/32**. [Log](evidence/revision-01/node-tests.txt).
2. `$env:SECURITY_EVIDENCE_DIR='handoff/P11/evidence/revision-01/final'; node scripts/check_security.cjs` — **20/20 nhóm**, **24 layout captures** (4 panel × 6 viewport), không pageerror/request ngoài localhost. [Kết quả và metrics](evidence/revision-01/final/browser-results.json).
3. `$env:PROFILE_EVIDENCE_DIR='handoff/P11/evidence/revision-01/profile-regression'; node scripts/check_profile.cjs` — **12/12 nhóm**. Cập nhật assertion dependency P11 từ pending sang màn thật; dirty editor/upload/quyền/P14/logout vẫn kiểm như trước. [Kết quả](evidence/revision-01/profile-regression/browser-results.json).
4. `$env:HOME_EVIDENCE_DIR='handoff/P11/evidence/revision-01/home-regression'; node scripts/check_home.cjs` — **14/14 nhóm**, 7 captures. [Kết quả](evidence/revision-01/home-regression/browser-results.json).
5. `$env:DIALOG_EVIDENCE_DIR='handoff/P11/evidence/revision-01/dialog-regression'; node scripts/check_dialogs.cjs` — **16/16 nhóm**, 29 captures. [Kết quả](evidence/revision-01/dialog-regression/browser-results.json).
6. `node --check` các module P11 / script profile và `python scripts/evidence_security.py` thực thi thành công. Không có package build riêng cho module HTML/JS này.

Tổng **62 nhóm browser** ở các suite trên, không phải kiểm toàn bộ app. Không chạy lại mọi suite P04–P09 ngoài những edge đã có trong Home/dialog. Không kết luận production từ fixture.

Lượt browser đầu dừng tại assertion dùng nhầm `.p03-dialog[open]` trong test; P03 thực tế là `section[role=dialog]`, không có thuộc tính open. Sửa selector đúng DOM rồi chạy lại toàn suite P11 thành công. Giữ [failure gốc](evidence/revision-01/failure.json) và ảnh ở thư mục cha; evidence hậu kiểm ở `final/`. Không nới điều kiện hành vi. Một lượt Node khám phá đầu dùng tên auth test chưa tồn tại nên không được dùng làm bằng chứng auth; command 85/85 ở trên dùng đúng các file thực tế.

## Các ca P11.Axx

| ID | Kết quả và bằng chứng |
|---|---|
| A01 | PASS local: mismatch không gọi adapter, đúng confirm field/aria/focus; sửa khớp bỏ lỗi. Node + browser nhóm A01. |
| A02 | PASS: 3 eye độc lập, value không đổi, summary/storage/history không có password; snapshot model không giữ field password. |
| A03 | PASS fixture: sai current tách mismatch, server reject không success; busy chặn duplicate, receipt sai actor/kho/session/request/policy/time → UNKNOWN. |
| A04 | PASS fixture: current và ID lạ bị chặn; failed giữ dòng; UNKNOWN giữ dòng trước đối chiếu; chỉ xác nhận revoke khi danh sách authoritative không còn target. |
| A05 | PASS fixture boundary / BLOCKED production: adapter thử trả policy keep hoặc reauthenticate rõ ràng; thiếu/khác policy không success. Reauthenticate/expired đưa về P01; Back không phục hồi phiên. Không suy ra policy backend. |

## Visual và khác biệt còn lại

- Đã xem actual S01–S04, bố cục nội dung/CTA và nav trong khung, hint/labels/error không chồng nhau. Shell **494×950 CSS px**, co đồng nhất; 6 viewport: 494×1000, 360×800, 430×932, 1440×900, 340×420, 1869×940; DPR1. Header/footer/nav không cuộn theo nội dung.
- B11 raster 1536×1024, phone khoảng358×783; crop estimated giữ tỷ lệ nguyên. Khung chuẩn user đã chốt khác tỷ lệ ảnh B11; bỏ status bar giả theo contract. Không kéo méo ảnh để tạo pixel diff PASS.
- Arial và SVG repo có nguồn; **font Designer và pixel match chưa xác minh**. Icon metadata dùng pastel documents chung theo chuẩn đã duyệt, không giữ màu xanh tươi cũ của B11. Màu xanh thành công/đỏ lỗi và revoke riêng.
- Ngày giờ định dạng dd/MM/yyyy HH:mm, múi giờ Việt Nam; fixture B11 cố định. Danh tính S03 từ phiên chung, đã kiểm Minh Anh và Lan Nguyễn.
- Keyboard/focus và khung thấp được kiểm trên desktop browser; **chưa kiểm bàn phím mềm/thiết bị thật**. Không tự kết luận user đã nghiệm thu.
- [Capture context](evidence/revision-01/capture-context.json), [source hashes](evidence/revision-01/source-sha256.json).

## File và dependency

- Mới: `docs/flows/security/{security.mjs,security-model.mjs,preview-adapter.mjs,icons.mjs,style.css,index.html}`.
- Sửa dependency: Home route/mount/lifecycle/scanner restore; `home-flow.mjs` thêm route security; `profile/profile.mjs` nối hai nút P11 và cập nhật metadata ngoài app; auth-session entry nạp CSS P11. Không thay CSS/giao diện P10 đã chốt.
- Kiểm chứng: `tests/security.test.mjs`, `scripts/check_security.cjs`, `scripts/check_profile.cjs`, `scripts/evidence_security.py`.
- Bàn giao: thư mục này, SCREEN_COVERAGE.csv, root RUN_STATE.json, P10 RUN_STATE.json với tạm chốt của user và dependency P11 đã nối.

## Cần backend/BA chốt để tích hợp

1. **Mật khẩu:** policy/validation authoritative và contract đổi mật khẩu, mã lỗi current/policy, receipt + xử lý UNKNOWN/đối chiếu.
2. **Auth sau đổi:** giữ phiên hiện tại, yêu cầu đăng nhập lại hay hủy các phiên khác; cơ chế thông báo hết phiên/P15.
3. **Quản lý phiên:** list/current-session ID, metadata được phép hiển thị, revoke đúng ID và cách xác minh/đối chiếu kết quả.

Các thiếu hụt này chỉ chặn tích hợp tương ứng; phần UI/behavior prototype trong phạm vi P11 đã triển khai. P12–P24 không được tự triển khai.
