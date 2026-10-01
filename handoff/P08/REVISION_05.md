# P08 r05 — Chi tiết lịch sử

Phạm vi: P08.S02 theo ảnh user LS-0026 / BH-DEMO-026. Không đổi fixture hoặc baseline, không mở rộng P03/P05 hoặc triển khai prompt khác.

## Thiết kế đã áp dụng

- Bỏ nhãn mô phỏng trong S02; ghi chú fixture ngoài app vẫn còn. Đây không phải dữ liệu WMS thật.
- Tách rõ mã lịch sử/trạng thái và chứng từ liên quan. Nút sao chép riêng44×44, focus sau sao chép, thông báo thành công/thất bại trung thực.
- Bỏ dòng Loại giao dịch/Kết quả lặp với header. Thông tin ghi nhận gồm kho/người/thời gian, khoảng cách rõ và icon chung hệ thống. Không dùng khóa để ám chỉ quyền chưa xác nhận.
- Thiếu ghi chú hiển thị Chưa có ghi chú; chi tiết chứng từ chưa khả dụng được ghi ngay cạnh mã, không CTA giả.
- Ba tab đồng đều, tối thiểu48px, hỗ trợ Arrow/Home/End, aria-controls/labelledby. Đính kèm0 không hiển thị số0 ở nhãn, bên trong có empty state rõ; hai tệp nguồn chưa khả dụng không giả tải được.
- Đang xử lý dùng màu xanh dương/đồng hồ, Chờ Web dùng màu hổ phách. Không có dấu tick chung cho mọi sự kiện. Timeline dùng mốc trung tính, giữ nguyên ID/nội dung/thứ tự.
- Bỏ CTA Xem dòng thời gian trùng tab. Thông tin chỉ có sự kiện gần nhất; timeline chứa tất cả sự kiện.
- Giữ link phiên/NFC đúng ID khi có; warning chưa ghi sổ với phiếu chờ Web.

## Kiểm chứng r05

- Browser detail5/5 nhóm PASS, 3 tab ×6 viewport =18 ảnh LS-0026; thêm trạng thái waiting/linked/recorded và timeline/tệp LS-0001.
- Hồi quy r04 trên source r05:7/7 nhóm PASS, evidence riêng r05/r04-regression. Không ghi đè bằng chứng r04.
- Node liên quan21/21 PASS: history-detail/history/history-picker/warranty-component-history. Hash baseline/history-fixtures/P07 giữ nguyên theo test.
- Copy thành công/clipboard từ chối, focus restore, query khi Back, timeline ID, attachment unavailable, session19/18/1, NFC serial, loading/error/unavailable, logout Back được kiểm tra.
- Shell494×950, nội dung cuộn trên nav, không tràn ngang qua6 viewport. Đã xem trực tiếp ảnh LS-0026 info/empty và LS-0001 waiting.
- Preview server ban đầu không chạy (ERR_CONNECTION_REFUSED), đã khởi động lại bằng script hiện có trên127.0.0.1:8766; các lượt chạy cuối PASS. failure.json/png giữ để truy vết, browser-results.json là kết quả cuối.
- Visual chờ user nghiệm thu; integration backend/hardware NOT_RUN. Không tuyên bố toàn hệ thống PASS. P03 timeout/P05 failures đã ghi ởr03/r04 chưa xử lý hoặc kiểm lại ởr05.

## Bàn giao

- evidence/revision-05/browser-results.json
- evidence/revision-05/LS-0026-info-494x1000.png
- evidence/revision-05/LS-0026-timeline-494x1000.png
- evidence/revision-05/LS-0026-attachments-494x1000.png
- evidence/revision-05/r04-regression/browser-results.json
- evidence/revision-05/node-tests.txt
- docs/flows/history/history-detail.mjs / history.mjs / style.css
- scripts/check_history_detail.cjs / tests/history-detail.test.mjs
- Không push/merge/deploy; không sửa baseline. Giữ24 prompt và91 panel.
