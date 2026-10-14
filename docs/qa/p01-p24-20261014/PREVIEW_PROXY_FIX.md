# Preview — lỗi HTTP 405 và phạm vi chạy thật

Ngày 14/10/2026, lỗi đăng nhập HTTP 405 đã được tái hiện trên Pages: host này không có proxy `/wms-api`. Đây là lỗi hosting, không phải kết luận mật khẩu sai.

Build mới `PREVIEW_PROXY_FIX_20261014` giữ giao diện app nhưng khóa đăng nhập và các API WMS trên GitHub Pages để không gửi credential vào static host. Pages không phải preview chạy API live.

Bản local đang chạy trên máy phát triển: `http://127.0.0.1:8799/`, proxy cố định DEV/TEST; app và health HTTP 200, `/auth/me` không token HTTP 401. Người dùng tự đăng nhập bằng tài khoản được phép. Localhost không phải link cho tester ở máy khác.

Link public chạy API cần triển khai cùng origin BE theo lựa chọn đã chốt. Đường dự kiến `https://khohoanamdev.lptech.info.vn/test-preview/p01-p24-20261014/` hiện chưa deploy (404). Không mở CORS/quyền, không đổi flag hoặc dựng dữ liệu giả để vượt điều kiện.

Source fingerprint bản sửa: `08dde84438767b1eb82265266e75c6cfc2690a691ecf2c974099301b0a039a74`; backend candidate `709744875a039178f432574ce1b59aaa3b42395c`; authenticated smoke chưa chạy. Không tuyên bố toàn bộ P01–P24 đã nghiệm thu.
