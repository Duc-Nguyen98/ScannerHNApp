# Kiểm chứng bộ màn 17–22

- `QA.json`: 72 kiểm tra bố cục (24 trạng thái × 360/390/430px), kiểm tra tương tác browser và metadata khung xuất.
- `MANIFEST.json`: kích thước và checksum 6 board PNG 3584×2080 + 24 ảnh màn riêng 780×1688.
- Ảnh được chụp từ prototype HTML/CSS bằng trình duyệt; không upscale ảnh board cũ, không sửa ảnh baseline.
- Kiểm tra: số lượng 0/vượt tồn, tổng số lượng, Post fixture rồi xem lịch sử, tải thêm chống trùng, resume đúng phiếu và giữ dòng, chặn mã cũ, chặn tiếp tục khi chưa xác minh, hồ sơ đã trả không xuất thêm, lọc/mở chi tiết NFC và phiên quét.
- Đây là kiểm tra prototype/dữ liệu thiết kế; không thực hiện giao dịch WMS hoặc kiểm thử backend/camera/NFC thật.
- Cách xuất: mở `docs/flows/warranty-components/?mode=board&board=17&export=2x` (tương tự 18–22), chụp toàn trang; khung từng phone nằm tại x=144/980/1816/2652, y=228, kích thước 780×1688. Dùng ảnh chụp browser, không tự vẽ lại màn QA.
- `scripts/package_screen_handoff.py` chỉ đóng gói và kiểm checksum, không biến đổi ảnh.

Contract NFC/phiên quét và trường thiếu metadata nằm trong `docs/flows/warranty-components/DEV_PROPOSAL.md`, là đề xuất chờ DEV chốt. Quy tắc App/Web mới nhất nằm trong `HANDOFF.md` cùng thư mục.
