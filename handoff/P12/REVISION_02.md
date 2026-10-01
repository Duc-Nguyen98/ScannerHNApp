# P12 r02 · Dữ liệu kiểm thử sát vận hành

User xác nhận 2026-09-28: **dữ liệu kiểm thử sát thực tế, không badge demo trong app**. Không phải kết nối dữ liệu thật WMS và không đặt chỉ số “99%” chưa có phép đo.

## Đã thay đổi

- 24 chứng từ: 8 nhập, 8 xuất, 8 bảo hành. Mỗi bản ghi có đối tác, ngày, ghi chú, dòng sản phẩm, số lượng, serial và sự kiện lịch sử. PN-0005 giữ11 sản phẩm /3 SKU (5+4+2).
- Tám hồ sơ bảo hành đọc trực tiếp nguồn `shared/warranty-cases.mjs`: danh tính, khách hàng, serial,4 trạng thái và event được đồng bộ với P09. Có nút mở hồ sơ theo case ID; hồ sơ đã trả khách giữ chỉ đọc. Không bổ sung hồ sơ/phiếu linh kiện vào dữ liệu P09.
- Chứng từ stock có event kiểm tra/gửi Web/ghi sổ rõ ràng trong dữ liệu kiểm thử; không suy lịch sử production từ badge. Phiếu tạo mới ở P04/P05 chỉ đi vào danh sách khi receipt được xác minh, giữ ghi chú/sản phẩm; không gán PDF/serial kiểm thử sang phiếu người dùng vừa tạo.
- Nút mã mở dialog nhập mã/nhận máy quét kiểu bàn phím. Mã chứng từ tìm exact ID/number; SKU/serial/code chỉ tìm trong chứng từ hiện tại. Không tìm thấy hiển thị validation tại field; không gọi camera/NFC hay API mới.
- Chi tiết dòng hiển thị danh sách serial. Dữ liệu scanner mới chỉ có raw code thì ghi đúng “Mã đã ghi nhận”, không tự khẳng định serial.
- Hai PDF PN-0005 đã được tạo từ cùng nguồn dữ liệu. Xem tài liệu mở bản đọc thông tin trong dialog; Tải PDF tải byte PDF thật sau khi kiểm HTTP và header. Có xử lý404/lỗi, hủy request khi rời màn, không báo thành công giả. Các phiếu khác có danh sách attachment rỗng xác định, hiển thị đúng chưa có tệp.
- Trong AppShell không có badge/copy demo, fixture, prototype hoặc dữ liệu thử. Thông tin nguồn dữ liệu nằm ngoài app ở công cụ kiểm thử, source và báo cáo. Không đổi cấu trúc4 panel; coverage tiếp tục đúng91 panel và24 board.

## Kiểm chứng

- **59/59 Node PASS**: `node --test tests/documents.test.mjs tests/inbound.test.mjs tests/home.test.mjs tests/history-picker.test.mjs tests/query-date-policy.test.mjs tests/dialog-route.test.mjs`. [Log](evidence/revision-02/node-tests.txt).
- **12/12 nhóm browser PASS**, zero pageerror: `node scripts/check_documents_data.cjs`. Bao gồm24 records/8 mỗi nhóm, Back giữ scroll/query, validation mã, tìm serial,2 PDF download byte thực, direct download,404 không tải giả, lịch sử POSTED, đồng bộ P09 và navigation,24 panel×viewport, focus/Back nhỏ, P04 gửi rồi mở đúng ID, logout/Back. [Kết quả](evidence/revision-02/browser-results.json).
- Layout: 494×950,360×800,430×932,1440×900,340×420,1869×940; DPR1/zoom1, Chromium. Danh sách24 bản ghi cần cuộn nội bộ; panel ngắn giữ vừa khung. PDF/serial dialog cuộn nội dung nhưng giữ footer. Bốn actual: [Danh sách](evidence/revision-02/S01-494x950.png), [Chi tiết](evidence/revision-02/S02-494x950.png), [Sản phẩm](evidence/revision-02/S03-494x950.png), [Tạo](evidence/revision-02/S04-494x950.png).
- PDF: reportlab, font Arial có sẵn,2 file một trang, pypdf xác minh text/page, Poppler render đã kiểm tra trực quan. [Kết quả PDF](evidence/revision-02/pdf-checks.json). Hai tệp có metadata nguồn synthetic, không giả chữ ký/dấu hay hóa đơn thuế.
- Lượt browser đầu dừng ở selector test `.hn-tools>details` không duy nhất; sửa `.first()`, chạy lại toàn suite đạt. File failure lưu lịch sử, không phải trạng thái cuối.

## Giới hạn còn đúng

Đây là bộ dữ liệu kiểm thử local theo yêu cầu. Reload khôi phục dữ liệu ban đầu và bỏ thay đổi trong memory. Không tích hợp WMS, không kiểm phần cứng thật, không thay tồn thật; số lượng barcode hỗ trợ vẫn theo catalogue P04/P05 hiện có. Hai PDF là tệp local PN-0005, chưa có upload/storage backend P18. Ảnh đúng model ZD421/DS2208 chưa có; icon neutral được giữ. Visual vẫn chờ user nghiệm thu; không tuyên bố độ giống dữ liệu thật99% hoặc toàn app đã ổn định production.

## File thay đổi r02

`docs/flows/documents/document-model.mjs`, `documents.mjs`, `style.css`, `assets/{PhieuNhap_PN-0005.pdf,BienBanKiemDem_PN-0005.pdf}`; `home/home.mjs` thêm exact case navigation; `tests/documents.test.mjs`; `scripts/check_documents_data.cjs`, `scripts/build_documents_pdf.py`; handoff/coverage/RUN_STATE. Không sửa shared P09 store, các draft owner P04/P05 hay contract backend.
