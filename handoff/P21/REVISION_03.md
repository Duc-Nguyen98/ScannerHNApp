# P21 r03 — rà soát và khắc phục UI/UX

Đã sửa **14 ca lỗi tái hiện** trong P21 và kiểm lại các điểm nối P19/P20. Giữ 6 cải tiến r02, 4 panel P21.S01–S04, frame 494×950 CSS px và footer Home/P03 đã khóa. Source baseline da9f623a19d0359c3e80c14f8cc612636ec6ab78; target prototype. [Review trước–sau](REVIEW_03.html) · [Nguồn/quyết định](REVISION_03_CONTEXT.md).

| Ca | Trước sửa | Sau sửa |
|---|---|---|
| F15 | Thông tin đối chiếu dồn thành đoạn văn | Giữ nguyên xuống dòng và khoảng trắng trong dialog hướng dẫn/copy lỗi; nội dung dài cuộn, nút Đóng luôn truy cập được. |
| F01 | Tải xong giành focus khỏi nút Back | Giữ control người dùng đang chọn, không đưa focus về heading. |
| F02 | Tải xong cuộn về đầu | Lấy vị trí cuộn ngay trước cập nhật DOM, giữ vị trí người dùng vừa đọc. |
| F03 | Reader tự đóng khi checkpoint trả về | Hoãn repaint khi dialog còn mở; đóng xong cập nhật và trả focus về reader. |
| F04 | Giành focus khỏi control bên ngoài app | Không chuyển focus nếu người dùng đã chuyển sang control khác trong khi chờ. |
| F05 | Ngày checkpoint lỗi làm hỏng render | Dùng parser thời gian chung, hiển thị Chưa xác minh; không gọi formatter với ngày sai. |
| F07 | Tổng số dài tràn footer | Cho text dài xuống dòng trong footer, giữ CTA và dữ liệu gốc. |
| F08 | Thiếu số lượng hiện null/undefined | Hiển thị Chưa xác minh; không tự chuyển thành 0. Số 0 hợp lệ giữ riêng. |
| F09 | Icon chưa xuất có màu xanh thành công | Clock chưa xác nhận xuất giữ màu trung tính; chỉ checkpoint được xác minh dùng xanh. |
| F10Escape | Escape sau xác minh chưa xuất làm kẹt S04 | Đóng thông báo bằng Escape vẫn đọc lại checkpoint trước khi cho phép tiếp tục. |
| F10Back | Back sau xác minh chưa xuất làm kẹt S04 | Native Back đóng thông báo có cùng hậu điều kiện với Đóng; giữ nguyên request/version. |
| F11 | Kết quả copy cũ xuất hiện sau khi cùng phiếu đổi định danh | So sánh lại payload sau Promise; bỏ phản hồi cũ nếu version/request/checkpoint đã đổi. |
| F12 | Cập nhật owner làm mất focus của Xem đầy đủ | Ghi nhớ reader bằng nhãn/thứ tự; phục hồi sau khi component chung tạo lại trigger, không giành focus mới. |
| F13 | Header Back rồi native Back mở lại chi tiết vừa rời | Tiêu thụ đúng entry danh sách trước đó nếu cùng scope live/mẫu; khóa nhấn Back trùng trong lúc chuyển. |

F06 (số lượng dòng dài) và F14 (copy trả về khi dialog mới đang mở) đã đạt trước sửa, được giữ làm hồi quy; không tính vào 14 ca sửa. Các ca date/count/chuỗi bất thường là fixture tại ranh giới view. Owner P19 thật trong preview được dùng cho Post/UNKNOWN/đối chiếu, không giả API production.

## Kiểm chứng

- **160/160 test logic**: `node scripts/run_p21_r03.cjs test_p21.cjs`; [log](evidence/revision-03/regression/after/node-tests.txt). Bao gồm 24 test P21 và các owner/phụ thuộc.
- **16/16 nhóm audit mới**: `node scripts/audit_p21_r03.cjs after`; [kết quả](evidence/revision-03/after/audit/results.json) và [dialog nhiều dòng](evidence/revision-03/after-format/audit/results.json). Trước sửa 12 FAIL/1 PASS tại [lượt đầu](evidence/revision-03/before/audit/results.json), thêm 1 FAIL về xuống dòng tại [dialog](evidence/revision-03/before-format/audit/results.json) và 1 FAIL/1 PASS tại [điều hướng](evidence/revision-03/before-navigation/audit/results.json).
- **9/9 nhóm P21 chính** và **20 tổ hợp panel/viewport**: `node scripts/run_p21_r03.cjs check_p21.cjs`; [kết quả](evidence/revision-03/regression/after/browser-results.json), [layout](evidence/revision-03/regression/after/layout.json). Kiểm đủ bốn panel, 494×950/360×800/430×932/1440×900/340×420 viewport, button ≥44 CSS px, footer trong app.
- **6/6 nhóm cạnh**: `node scripts/run_p21_r03.cjs check_p21_edges.cjs`; [kết quả](evidence/revision-03/regression/edges/results.json). Nội dung Unicode dài, reader, đọc treo/cancel/error, owner Post trả về khi chuyển màn, UNKNOWN/not-posted.
- **9/9 nhóm nâng cấp r02**: `node scripts/run_p21_r03.cjs check_p21_r02.cjs`; [kết quả](evidence/revision-03/regression/r02-ux/results.json). Native keyboard/click, copy success/fail/cancel/stale, closed-case, list scroll và receipt P20 đúng yêu cầu.
- **4 viewport footer khóa**: `node scripts/run_p21_r03.cjs regression_p21.cjs check_home_footer_locked.cjs`; [kết quả](evidence/revision-03/regression/footer/results.json).
- Tổng **40 nhóm trình duyệt**, không cộng 20 layout và 4 footer vào số nhóm. Không có pageerror trong các nhóm đã đạt. `node --check` các module sửa và `git diff --check`: exit 0.

## Phạm vi và hình thức

File app sửa: `resume-view.mjs`, `resume-experience.mjs`, `resume.css`. Không đổi owner Post/stock, Home, module dialog/reader chung, backend schema hoặc policy. Thêm kiểm tra `component-resume-experience.test.mjs`, scripts audit/hồi quy, cập nhật coverage/RUN_STATE/UI_STANDARD.

Ảnh trước–sau mặc định đủ 4 panel cùng 494×950 CSS px/DPR1/fixture B21; ảnh nhánh lỗi tại before/after audit. Đã xem ảnh thực tế S02, lỗi ngày, tổng số dài và các dialog trước–sau. Nội dung bản thường giữ hình thức r02; màu clock chưa xuất được sửa trung tính. Không dùng số test để tự nghiệm thu thiết kế.

**Visual: AWAITING_USER_REVIEW. Behavior: PASS_PROTOTYPE trong phạm vi đã kiểm. Integration: BLOCKED_PRODUCTION.** Backend checkpoint/status, lưu bền, URL WMS, clipboard/camera/NFC/bàn phím thiết bị thật chưa xác minh. Reload/đăng xuất vẫn mất phiếu preview. Các kiểm tra này không phải cam kết toàn bộ ứng dụng không còn lỗi. P20 r03 vẫn tạm chốt; P22–P24 full boards chưa hoàn tất. Không sửa dist/gallery/ảnh baseline, không push/merge/deploy.
