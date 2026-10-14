# Tester — P01 đến P24

Ngày 14/10/2026. Preview này gồm source HTML hiện tại, 24 màn và 91 panel. Không phải APK native và không phải toàn bộ UI đã kết nối WMS.

## 1. Kiểm UI/luồng demo

Chọn màn/panel, mở mẫu, kiểm Back/focus/scroll/IME/dialog/reader/footer. “Chạy luồng demo” bắt đầu từ login mẫu minhanh / preview; **không nhập mật khẩu WMS vào iframe demo**. Demo chỉ giữ dữ liệu trong trang, refresh/reset mất bản nhập demo.

Source HTML và Android là hai target riêng. Các sửa native-only P05/P07/P12 không thể được nghiệm thu bằng screenshot HTML.

## 2. API thật theo owner

Tải P01-P24-owner-GET.postman_collection.json và import vào Postman desktop. Collection gồm core GET smoke, không phải toàn bộ mọi route/nhánh ghi hay binary acceptance.

- base_url cố định https://khohoanamdev.lptech.info.vn; ACCESS token dùng tài khoản tester được phép qua auth owner hiện có, không xin admin token/mật khẩu từ gói này.
- Lưu token ở local secret của Postman, không sync/export/public environment; không gửi token vào URL, ảnh hoặc log.
- Đặt allow_dev_read=true; selected_request bằng ID request cần chạy, ví dụ P01-GET-1. Chỉ chọn một request, không Run All.
- Điền ID/kho/scan/key thật của đúng phiên được phép. Đọc /auth/me trước, xác nhận context; không lấy kho đầu tiên hoặc code hiển thị làm ID.
- Không tạo key mới để GET reconcile. operation_key/request_id luôn thuộc request gốc; auth_session khác scan_session.
- GET không body. Header P20/P21/P22 chỉ ở đúng owner; P07 confirmation cần Idempotency-Key gốc dù là GET.
- Cursor/status/date/query của mỗi owner riêng. Mẫu trang đầu không thay test trang tiếp/cursor hết hạn/sai scope.
- Không tự gọi lại mutation khi timeout/404/UNKNOWN. Receipt lịch sử khác detail hiện tại; null khác 0.
- Tệp download phải kiểm bytes/size/checksum quyền/cache riêng; harness nhận bytes không tự tuyên bố binary đã đạt.

Public GitHub Pages hiện không có CORS từ BE. Browser API harness chỉ mở khi DEV đặt gói này tại **cùng origin BE**; UI demo vẫn tách biệt, không trộn dữ liệu. Không dùng proxy lạ mang token ra host khác.

## 3. Ghi nhận kết quả

Trả board/panel, URL/build/source snapshot SHA256, backend observed SHA, thời điểm có timezone, Request-ID, account role đã che, kho/ID cần đối chiếu, steps/expected/actual, screenshot và PASS/FAIL/BLOCKED/NOT_RUN.

Phân biệt UI fixture PASS, owner HTTP PASS, semantics PASS, device/hardware PASS và production approval. UI/health/CI không thay nhau.

Không tạo phiếu/seed/upload/NFC/đổi mật khẩu/END ca để lấy ảnh trong scope này. Luồng ghi cần release/quyền/dữ liệu thử và chấp thuận riêng. P14/recovery, P19 command recovery và mixed rollout không bật từ trang preview.
