# P12 r05 · Nhịp dòng, khoảng cách khối và nội dung dài

Yêu cầu ngày2026-09-28: xử lý ghi chú sát phần Tài liệu, rà các trang trong Chứng từ và có cách trình bày ghi chú dài hơn250 ký tự. **Đã áp dụng trong P12**, giữ4 panel,24 board/91 panel, palette r04 và footer đã khóa.

## Quyết định UX đã triển khai

| Vùng | Giải pháp |
|---|---|
| Thông tin chung | Dòng label/value17px, line-height1.5, padding dọc8px. Đọc dễ hơn so với5px ở r04. Nội dung dài được cuộn trong vùng thân. |
| Ghi chú | Tách thành khối riêng rộng toàn vùng nội dung; tiêu đề và khoảng đệm riêng. Xem trước tối đa2 dòng, giãn1.5 lần. Nút **Xem đầy đủ** chỉ xuất hiện nếu thực sự bị rút gọn theo số đo render. |
| Ghi chú đầy đủ | Dialog trong app, giữ nguyên nội dung/newline/Unicode; line-height1.6. Nội dung dài cuộn trong dialog, nút Đóng cố định. Back/Escape/focus/backdrop theo component chung; không chồng overlay. |
| Tài liệu | Cách khối ghi chú24px; heading và danh sách có nhịp riêng. Tên file tối đa2 dòng trong card, tên đầy đủ có khi mở tệp; download/PDF đã có vẫn hoạt động. |
| Lịch sử | Mô tả dài xem trước3 dòng và mở đầy đủ đúng event. Không sửa hoặc suy thêm sự kiện. |
| Sản phẩm/danh sách | Tên sản phẩm/tên tệp/đối tác được wrap an toàn, phần xem gọn có giới hạn dòng. Mở sản phẩm hiển thị đầy đủ tên trong body dialog. |
| Tạo chứng từ | Textarea128px, cuộn nội bộ, không cho kéo cao phá bố cục. Counter kèm “ký tự”, mô tả truy cập đúng input. Giữ giới hạn200 ký tự và validator P04/P05. |

**Phân biệt giới hạn nhập và hiển thị:** nguồn hiện tại P12/P04/P05 đều giới hạn ghi chú mới200 ký tự. Ví dụ250 trong yêu cầu không được tự biến thành một contract ghi mới. Nội dung đọc từ nguồn có thể dài hơn200/250 và vẫn được hiển thị an toàn; không cắt mất hay lưu đè dữ liệu gốc. Bản xem gọn chỉ trim khoảng trắng đầu/cuối để đọc; dialog giữ nguyên string gốc.

**Case để thử:** PN-0010 có ghi chú749 ký tự, nhiều đoạn. Vào Thông tin → Ghi chú → Xem đầy đủ. PX-0011 giữ ghi chú cũ và2 PDF r04.

Không ép toàn bộ metadata+ghi chú+tài liệu vào một viewport bằng cách nén dòng. Với phần Thông tin nhiều khối, body được cuộn; header/mã phiếu/tab/nav vẫn giữ ổn định. Sản phẩm3 dòng và form tạo thông thường vẫn vừa khung.

## Kiểm chứng thật

- **59/59 Node PASS**: documents/inbound/Home/history-picker/query-date/dialog-route. [Log](evidence/revision-05/node-tests.txt).
- **7/7 nhóm text/spacing PASS**: `node scripts/check_documents_text.cjs`. Kiểm6 viewport; gap24px và line-height1.5;749-char nguyên văn; rỗng/ngắn/250/2000+/2400 ký tự liền/9000+ ký tự/nhiều dòng/Unicode/HTML; không injection; note/full-dialog không tràn; read-more/focus/Back; event/file/product dài;200-char validation và bypass DOM251 vẫn bị chặn. [Kết quả](evidence/revision-05/text-spacing-results.json).
- **9/9 nhóm tabs/navigation PASS**: `DOCUMENTS_TABS_EVIDENCE_DIR=.../tabs-regression node scripts/check_documents_tabs.cjs`. [Kết quả](evidence/revision-05/tabs-regression/tabs-results.json).
- **12/12 nhóm data regression PASS**: `DOCUMENTS_DATA_EVIDENCE_DIR=.../data-regression node scripts/check_documents_data.cjs`. Gồm24 records, P09 sync, serial, PDF tải thật/404, P04 receipt, logout/Back,24 panel×viewport. [Kết quả](evidence/revision-05/data-regression/browser-results.json).
- Tổng **28 nhóm browser**, zero pageerror. Chromium/DPR1/zoom1:494×950,360×800,430×932,1440×900,340×420,1869×940.
- Assertions cũ “mọi tab phải không cuộn” được giới hạn lại cho nội dung ngắn Sản phẩm/Tài liệu; phần Thông tin/Lịch sử được kiểm đọc hết qua internal scroll. Stress scroll của Thông tin chuyển sang metadata dài vì ghi chú nay cố ý bị giới hạn dòng. Phiếu mới vẫn được kiểm đúng note nhưng selector chuyển từ bảng metadata sang note preview riêng.
- Vòng đầu phát hiện3px cuộn dư ở Sản phẩm và7px ở form Tạo sau khi tăng nhịp chữ; giảm khoảng trống giữa các nhóm điều khiển, giữ line-height và textarea128px; chạy lại đạt. Không cắt/ẩn phần dữ liệu để che overflow.

## Actual

[Thông tin giãn dòng](evidence/revision-05/info-494x950.png) · [Tài liệu sau khi cuộn](evidence/revision-05/attachments-494x950.png) · [749 ký tự xem gọn](evidence/revision-05/long-note-preview.png) · [Ghi chú nguyên văn](evidence/revision-05/full-note-dialog.png) · [Dialog nội dung rất dài](evidence/revision-05/full-long-494x950.png).

## File và trạng thái

P12: documents.mjs, style.css, tokens.css, document-model.mjs (case note749), auth-session/index.html (stylesheet r05); scripts/check_documents_text.cjs, kiểm tabs/data và handoff/checkpoint/coverage. Không sửa P04/P05 validator hay backend, không đổi palette/footer/chứng từ PDF, không đụng dist/gallery hoặc push/deploy.

Visual đã xem actual, chờ user nghiệm thu. Behavior PASS trong phạm vi các ca trên. Integration WMS/P18/hardware vẫn chưa xác minh; không suy “mọi lỗi production đã được loại bỏ”. Reload khôi phục dữ liệu kiểm thử và bỏ thay đổi trong bộ nhớ phiên.
