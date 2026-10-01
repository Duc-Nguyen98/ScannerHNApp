# P07 r04 — Căn cột kết quả và test liên tiếp5 mã NFC

Theo yêu cầu user27/09/2026, từ Desktop/2.png: sửa căn hàng vùng summary, cho chọn4–5 mã mô phỏng và làm rõ thao tác để test tiếp sau thành công. Giữ4 panel P07, prototype local, không đổi baseline hoặc triển khai P08.

## Nguyên nhân và xử lý

- Các hàng summary dùng flex chia nhãn/giá trị theo phần không gian còn lại. Hàng UID có nút copy là phần tử thứ tư nên điểm bắt đầu giá trị lệch so với những hàng khác.
- Chuyển summary sang grid3 cột ổn định: icon / nhãn / giá trị. Nút copy nằm trong ô UID với khoảng trống riêng; không chiếm cột làm lệch nhãn/giá trị. Tên dài tự xuống dòng, serial thiếu vẫn là `—`, không suy từ code.
- Trước đây mọi lần đọc bình thường đều trả `NFC-8A2F`; sau khi gắn thẻ này, đổi sản phẩm sẽ conflict, hoặc cùng sản phẩm tạo cảm giác thực hiện lại thành công. Nay bộ mô phỏng cho chọn5 UID độc lập và hiển thị `Chưa dùng`/`Đã liên kết` kèm số thẻ chưa dùng.

## Luồng dễ thử hơn

1. Home → Thẻ NFC → **Quét hoặc liên kết thẻ NFC** (hoặc Bắt đầu liên kết ở tools).
2. Kiểm tra card sản phẩm trong app; bấm card nếu cần chọn qua P06. Chọn **Mã thẻ dùng để thử** ở tools → **Đọc thẻ mô phỏng**.
3. Sau đọc hợp lệ, bấm **Tiếp tục** → kiểm tra UID/sản phẩm → **Xác nhận liên kết**. Đọc không tạo mapping/success.
4. Màn hoàn tất có **Xem thông tin thẻ**, **Liên kết thẻ khác**, **Về Trang chủ**. Liên kết thẻ khác giữ sản phẩm, xóa read/request/receipt cũ, chọn sẵn mã chưa dùng và trả về bước đọc. Không tự đọc hoặc tự lưu.
5. Test đủ5 mã không cần reload. Khi dùng hết, tools thông báo hết mã; có thể xem lại thẻ hoặc reload để bắt đầu lại bộ test. Reload mất thay đổi demo trong bộ nhớ như trước.

5 UID: `NFC-8A2F`, `NFC-DEMO-020`, `NFC-DEMO-021`, `NFC-DEMO-022`, `NFC-DEMO-023`. Bốn mã DEMO dùng đúng TAG-020–023 đang có, giữ tag ID/label khi cập nhật; NFC-8A2F thêm một thẻ khi xác nhận. Dataset ban đầu30 thẻ (16 linked/9 unlinked/5 locked); sau5 liên kết mới tổng31, linked21, unlinked5, locked5.

Tools mô phỏng vẫn ngoài app, bên phải desktop/dưới app mobile. Hướng dẫn đổi theo bước; selector/nút đọc đặt ở mức đầu, không cần mở mục kịch bản. Kịch bản lỗi nằm trong details, JSON nằm trong `Chi tiết kỹ thuật` đóng mặc định, select giới hạn theo chiều rộng để tránh scrollbar ngang. Giảm độ lớn minh họa check và rút gọn copy success để summary/CTA mới vừa khung494×950.

## Guard và dữ liệu

- Chọn mã khác xóa UID đã đọc, request cũ và khóa Tiếp tục đến khi đọc lại. Thay kịch bản ở bước đọc cũng làm mất hiệu lực kết quả đọc cũ.
- Kho dừng, capability, session guard, P06 ID/code/SKU/serial giữ nguyên. UNKNOWN/đang đọc/đang gửi không được đổi mã/sản phẩm hoặc mở lượt mới; giữ cùng request để reconcile.
- Kịch bản conflict/locked ghi rõ đọc UID lỗi chuyên biệt thay vì mã đang chọn. Đọc thấy conflict/locked/already-linked hiển thị lỗi ngay và khóa Tiếp tục. Không overwrite; cùng sản phẩm đã linked cũng không giả thành một lần liên kết mới.
- Sau thành công mở lượt mới, kịch bản về bình thường để tiện test tiếp; không tự reset dữ liệu thẻ đã liên kết. Mỗi xác nhận mới có request ID mới; double submit/idempotent receipt vẫn được kiểm.
- Fixture chỉ kiểm no-overwrite phía thẻ; chưa xác nhận policy số thẻ trên một sản phẩm của backend. Giữ sản phẩm giữa lượt là tiện ích demo, không tự chốt cardinality nghiệp vụ WMS.

## Kiểm chứng

- `node --test tests/*.mjs tests/*.cjs`: **104/104 PASS**, gồm15 test NFC. [Log](evidence/revision-04/node-tests.txt).
- `$env:NFC_EVIDENCE_DIR='handoff/P07/evidence/revision-04/nfc'; node scripts/check_nfc.cjs`: **11 nhóm PASS**, 0JS error/0external request. [Kết quả](evidence/revision-04/nfc/browser-results.json).
- `node scripts/check_nfc_repeat.cjs`: **4 nhóm PASS**, gồm5 lượt thành công trong một phiên, giữ sản phẩm/null serial, UID/request riêng, cập nhật đúng detail, khóa đổi UID khi busy/UNKNOWN, resume UNKNOWN qua Home, cảnh báo khi hết mã, stress text dài. [Kết quả và rect](evidence/revision-04/repeat/results.json).
- 6 viewport:1869×940,1495×752,685×872,494×1000,360×800,340×420. Đo tất cả `dd` cùng tọa độ x (sai khác dưới0.5px), `dt` cùng cột, copy trong ô UID, không overflow ngang tools/nội dung; scrollbar giữ none. Bài long text cuộn summary cuối vẫn nằm trên footer. DPR1/Chromium; chưa test phần cứng NFC/backend.
- Đã xem trực quan [desktop success](evidence/revision-04/repeat/success-1869x940.png), [mobile success](evidence/revision-04/repeat/success-360x800.png), [hướng dẫn đọc và selector](evidence/revision-04/repeat/read-guide-desktop.png). [Long values](evidence/revision-04/repeat/success-long-values.png), [dùng hết5 thẻ](evidence/revision-04/repeat/all-five-used.png).

## File và phạm vi

Sửa `docs/flows/nfc/{nfc.mjs,nfc-flow.mjs,fixture-adapter.mjs,style.css}`, `tests/nfc.test.mjs`, `scripts/check_nfc.cjs`; thêm `scripts/check_nfc_repeat.cjs`. Cập nhật REPORT, SCREEN_COVERAGE và RUN_STATE. Giữ các kết quả P01–P06 có trước, component modal/scroller r02 và dataset30 thẻ r03. Không push/merge/deploy. Visual toàn P07 vẫn chờ user nghiệm thu; phần căn cột/test liên tiếp đạt ma trận trên. Backend/device/filter nâng cao còn thiếu nguồn như các báo cáo trước.

Mở [preview](http://127.0.0.1:8766/flows/auth-session/) và tải lại, đăng nhập `minhanh` / `preview` → Thẻ NFC để nạp JS/CSS mới.
