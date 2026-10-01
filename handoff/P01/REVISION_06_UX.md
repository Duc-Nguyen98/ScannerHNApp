# P01 r06 — áp dụng sáu đề xuất UX

User yêu cầu “Áp dụng đề xuất cho tôi” sau sáu đề xuất trong chat. Phạm vi chính: P01 → P02 và các điểm nối hiện hữu. Không đổi API/policy, không đại tu P03–P23. Hình thức phần mới là adaptation chờ user review, không tự nâng thành mẫu Designer.

## Đã triển khai

1. Tên đăng nhập dùng Next/Enter chuyển tới mật khẩu; password dùng Go/Enter qua validation hiện có. IME không gửi form khi còn composition. Không autofocus input khi mở app. Khi viewport thu hẹp trong lúc nhập, giữ tỷ lệ AppShell và đưa input vào vùng thấy được, không tự scale lại toàn màn theo bàn phím.
2. Caps Lock chỉ hiển thị khi keyboard event báo hỗ trợ và đang bật; không đoán từ ký tự. Mắt giữ nguyên selection/value, pointer giữ focus input, keyboard giữ thứ tự Tab. Không lưu/trim/normalize mật khẩu.
3. Notice xác nhận giải thích riêng kho dừng, kho chưa xác minh, thiếu quyền, quyền chưa xác minh và UNKNOWN. Giữ guard strict-true; không tạo quyền, đổi kho hoặc giả đối chiếu. Kết quả thao tác vẫn dùng dialog chung.
4. Home import động sau xác nhận, giữ source/version Home hiện hành. Lỗi import có nút Thử tải lại Trang chủ, không gọi startShift lần nữa. Logout/reset bỏ callback cũ; kiểm session khi module trả về. Nếu dialog đang mở, không giành focus: sau khi đóng người dùng chọn Mở Trang chủ. Expiry trước khi Home mount trả về login an toàn.
5. Tăng vùng bấm Quên mật khẩu/reader/dialog P01 và điều chỉnh khoảng trống để giữ vị trí nhãn/nút ở 494×950. Trong lúc làm việc, công việc khác bổ sung `priority-touch.mjs/.css`, `scaled-controls.mjs` và nối vào app/index. Đã giữ nguyên, bỏ cơ chế scale vùng bấm riêng bị trùng để tái sử dụng shared. Shared controller không phải code do lượt r06 này viết. Bộ lọc và footerLOCK không bị r06 sửa.
6. P14 Back trả focus về Quên mật khẩu, giữ tên đăng nhập và cuộn form trong bộ nhớ cùng credential epoch; mật khẩu luôn xóa khi rời form. Giữ nguyên cơ chế Back của Home/P12 và kiểm thực tế query/tab/scroll/focus theo ID, không dựng controller mới cho danh sách.

## Kiểm chứng

- `node --test tests/*.mjs tests/*.cjs`: 633/633 đạt ở snapshot đã lưu; chỉ 10 test mới thuộc lượt này, số khác tăng do công việc đồng thời. `evidence/revision-06-ux/node-tests-summary.txt`.
- Bộ auth/Home tập trung: 41/41 đạt. `node --check` ba module thay đổi và `git diff --check` đạt.
- 19 quan sát browser tại `evidence/revision-06-ux/BROWSER_CHECKS.md`. Chặn/tạm giữ script chỉ trong tab test, đã gỡ. Caps Lock/IME/viewport keyboard dùng sự kiện hoặc viewport mô phỏng, không coi là thiết bị thật.
- 8 layout: P01.S01/S02 × 360×800, 430×932, 494×950, 1440×900. Không overflow ngang; start/logout trong màn. Vùng bấm P01 nhỏ nhất đo khoảng 43.99–44 CSS px do làm tròn transform; không tuyên bố số đo chính xác tuyệt đối 44.000.
- Nội dung guidance kiểm denied/stopped/start-unknown; ảnh trong thư mục evidence. Ảnh Home lỗi tải ban đầu bị scroll, bản `home-load-error-full.png` là ảnh đầu trang dùng review.
- SVG giữ SHA256 `E40F728522EFA29582D165AB5458918A02B797CF60978AC3F84C9E347A1C9833`; checksum board gốc vẫn được test bảo vệ. Không thay assets, header/footer palette, navLOCK, ID panel hoặc dist/gallery.

## Giới hạn / chưa xác minh

- Thử lại đã kiểm cho lỗi tải entry Home. Không khẳng định phục hồi mọi lỗi của module phụ hoặc lỗi thực thi module; lỗi module bị browser cache có thể vẫn cần tải lại preview. Không tự reload vì sẽ mất dữ liệu fixture trong trang.
- Thiết bị/IME/bàn phím ảo thật, camera/NFC, auth/start/reconcile production chưa được kiểm. Tên nút bàn phím thực tế do hệ điều hành quyết định; `enterkeyhint` là gợi ý.
- Chỉ kiểm điểm nối Home/P12/P14, không phải full regression nghiệp vụ P03–P23. Root checkpoint P23 và công việc shared được giữ nguyên.
- Ảnh trước/sau là actual cùng viewport 494×950, không chứng minh pixel-perfect với B01. Nội dung Caps Lock, guidance lỗi và loading/retry chưa có raster Designer; cần user duyệt. Phần desktop Login/Confirmation bình thường giữ artwork và nhịp bố cục hiện hành.

## Files do lượt này thay đổi

`docs/flows/auth-session/app.mjs`, `experience.mjs`, `lazy-home.mjs`, `style.css`, query version trong `bootstrap.mjs`/`index.html`, `tests/auth-session-experience.test.mjs`, báo cáo/evidence P01 và field checkpoint riêng. Không sửa auth-flow/fixture policy hoặc source Home; giữ import/mountPriorityTouch và stylesheet do công việc khác thêm.
