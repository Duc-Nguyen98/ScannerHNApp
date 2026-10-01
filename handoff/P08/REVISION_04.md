# P08 r04 — danh sách gọn và bộ chọn đồng bộ
Ngày: 2026-09-27. User yêu cầu thiết kế lại vùng khoanh ảnh1/2 và option/date selector. Phạm vi đã thông báo: P08, không select P01–P07 hoặc tools ngoài app.

## Quyết định UI/UX đã áp dụng
- Bỏ nhãn mô phỏng trên S01; ghi chú nguồn vẫn trong tools ngoài app. Không đổi fixture thành WMS thật.
- Bỏ lối tắt Hoạt động theo ngày / Phiên quét cuối S01 vì đã có ở hub. Giữ nguyên S03/S04, không bỏ panel.
- Bỏ nút Tải thêm. Tự nạp tiếp12 bản ghi khi cuộn gần cuối, số đã hiển thị / kết quả và thông báo khi hết. Cùng nguồn48, không mất dữ liệu, không thay sort mặc định.
- Giữ tìm kiếm/tab nghiệp vụ. Gom ngày/trạng thái vào dialog. Ngoài danh sách chỉ có tóm tắt lọc, Xóa lọc, số kết quả. Bỏ Tổng nguồn lặp lại.
- Sort dùng dialog radio cùng template. Date dùng lịch riêng + nhập dd/mm/yyyy. Trạng thái dùng radio. Không còn select/input date native trong P08.
- Calendar thay nội dung cùng dialog, không overlay thứ hai. Tab trap, Escape hủy, khôi phục focus, arrow keys cho ngày, radio keyboard, tháng trước/sau.
- Draft filter chỉ áp khi xác nhận. Kiểm ngày thực/nhuận/thứ tự từ-đến; khoảng giới hạn được để trống. S04 dùng cùng picker.
- Giữ shell494×950, nav/header, B08 và fixture. Không sửa panel khác ngoài bộ chọn ngày S04/cơ chế focus P08.

## Kiểm chứng đúng revision
- 7/7 nhóm browser r04 PASS. 6 viewport:494×1000,360×800,430×932,1440×900,340×420,1869×940.
- 24 ảnh list/filter/calendar/sort theo6 viewport; ảnh cuối danh sách/daily/detail attachments/session.
- 19/19 Node history/history-picker/warranty-component-history PASS. Hash B08/history-fixtures/P07 được giữ.
- Auto-load48 ID duy nhất, keyboard PageDown giữ focus, Back giữ48 hàng/vị trí cuộn; search/type/date/status/sort/scope Nhập-xuất đúng.
- Detail timeline4 sự kiện, tệp chưa có nguồn không giả mở file; session19/18/1/link P23; loading/error/empty/unavailable; logout/Back được kiểm.
- Home14/14 PASS.
- P03 chưa PASS:11 nhóm rồi timeout tại scripts/check_dialogs.cjs:234 khi html chặn click backdrop trên Home. Chưa kết luận nguyên nhân; không sửa P03. Evidence giữ nguyên.
- Không chạy lại toàn bộ Node/P05.5 lỗi P05 ghi nhận r03 chưa xử lý trong task này. Không dùng kết quả lịch sử làm PASS hiện tại.
- Visual được xem ở ảnh render, chờ user nghiệm thu. Backend/NFC thật NOT_RUN. Không tuyên bố toàn hệ thống được xử lý triệt để.

## Bằng chứng
- evidence/revision-04/browser-results.json, node-tests.txt
- evidence/revision-04/list-494x1000.png, filter-494x1000.png, calendar-494x1000.png, sort-494x1000.png
- evidence/revision-04/home-regression/browser-results.json
- evidence/revision-04/dialog-regression/browser-failure.json
- docs/flows/history/history-picker.mjs, history.mjs, style.css
- tests/history-picker.test.mjs, scripts/check_history_r04.cjs
- RUN_STATE.json/SCREEN_COVERAGE.csv giữ91 IDs. R01–r03 evidence không ghi đè.
- Không push/merge/deploy. Không triển khai notification/P09.
