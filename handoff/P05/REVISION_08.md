# P05 revision08 — tinh gọn phần địa chỉ và đồng bộ bố cục

Theo ảnh user `C:/Users/TAN MIE/Desktop/2.png`: bỏ đúng các vùng khoanh đỏ trong Bước1.

- Bỏ hướng dẫn Chọn lần lượt1→2→3 và thông tin địa giới dưới tiêu đề; chuyển phiên bản v1 trước07/2025/quy tắc reset sang tools prototype bên ngoài app.
- Bỏ khối Địa chỉ đã lưu khỏi form, giữ dữ liệu gốc trong document như trước.
- Bỏ số thứ tự1/2/3 trong nhãn Tỉnh/Thành phố, Quận/Huyện, Địa chỉ chi tiết.
- Bỏ ghi chú đổi tỉnh/quận ở cuối cụm địa chỉ. Giữ lỗi validation cần thiết và preview địa chỉ đầy đủ khi có nội dung (không nằm trong vùng user yêu cầu bỏ).
- S01 dùng khoảng cách field14px; cụm địa chỉ và tiêu đề căn cùng lề field ngoài. Field trong cụm không cộng thêm margin ngang. Nhãn/tiêu đề/viền dùng lại màu form hiện có: `#3c5d98`, `#061570`, `#d8e6f9`; preview dùng nền `#f1f9fd`. Placeholder nhẹ hơn và weight400; lỗi vẫn đỏ.
- Không đổi API/validator/luồng chọn tuần tự/reset/request. Không sửa S02–S04 hoặc flow khác; giữ shell494×950/header/footer.

## Kiểm tra

Chạy lại `scripts/check_outbound_geography.cjs` với `OUTBOUND_EVIDENCE_DIR=handoff/P05/evidence/revision-08`: **7 nhóm PASS,30 case popup** (5 select×6 viewport), không JS errors. Kiểm tra loại bỏ copy khỏi app và thông tin bộ địa giới vẫn ở tools; lỗi tải/retry, gating, reset, cache, keyboard, không xô form, giữ địa chỉ trong UNKNOWN và lượt mới đều đạt. [Kết quả](evidence/revision-08/browser-results.json).

Đã xem ảnh actual [form tinh gọn](evidence/revision-08/02-address-complete.png). Node và API thật không chạy lại cho chỉnh HTML/CSS này; kết quả revision07 là lịch sử, không tính là kiểm chứng mới. Visual mới chờ user duyệt. Không push/merge/deploy; giữ checkpoint P08 và91 panel.
