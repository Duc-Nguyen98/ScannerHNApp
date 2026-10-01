# P09 r02 — đồng bộ màn quét với P04/P05

Yêu cầu user ngày2026-09-28, ảnh `C:/Users/TAN MIE/Desktop/1.png`: đồng bộ màn quét tra cứu/tiếp nhận bảo hành với UI/UX Nhập kho và Xuất kho đã nâng cấp. Phạm vi P09.S02; không thêm/gộp panel hoặc đổi nghiệp vụ bảo hành.

## Nguồn và thay đổi

- Đọc AGENTS/UI_STANDARD, RUN_STATE và r01. Nguồn UI đo từ `inbound/style.css` + `outbound/style.css`, manual flow trong hai module, P05 r04 và P04 upgrade. Shell494×950 giữ nguyên.
- Header63px, title22px, bước16px; body inset16px; camera220px theo P05, khi nhập tay128px theo cả P04/P05. Reticle và nhãn camera góc dưới theo cùng mẫu, không thêm thiết bị giả.
- Tạo `shared/scan-entry.mjs` + `scan-entry.css` cho vùng quét/nhập mã dùng lại; P09 sử dụng component này. P04/P05 giữ source/layout hiện có. Icon nghiệp vụ bảo hành lấy màu cam đất từ `operation-icons.css`; không tô lại ảnh kho hay màu lỗi/thành công.
- Nhập tay chuyển từ dialog sang thẻ inline: header/Nhập mã sản phẩm, Thu gọn, label serial, input52px + nút126×52px; camera thu gọn để nhường chỗ. Đèn disabled, nhãn Đèn chưa sẵn sàng; không gọi camera.
- Enter kiểm tra; hợp lệ xóa ô và giữ focus; serial đã chọn/lỗi giữ raw và chọn lại để sửa. Escape/Thu gọn giữ mã chưa gửi, trả focus về Nhập tay. Không xử lý Enter khi đang composition IME.
- Phản hồi inline có chữ và màu: hướng dẫn/xanh hợp lệ/vàng đã chọn/đỏ lỗi; không nhân đôi lỗi ở cuối màn. Không biến cùng serial thành sản phẩm thứ2, không thêm bộ đếm quantity/lượt quét của nhập/xuất.
- Thông tin sản phẩm rỗng có hướng dẫn thay bốn dòng thiếu dữ liệu lặp; khi xác định serial vẫn hiện đúng sản phẩm/serial/khách/liên hệ. Form lỗi/ghi chú/phụ kiện, counter và footer theo mật độ control P04/P05. Footer có lý do khóa và hướng dẫn bước tiếp theo.
- Mã mới đang nhập chưa kiểm tra khóa CTA cả UI/handler; trường lỗi/ghi chú/phụ kiện và mã chưa gửi được giữ khi thu gọn/Back. UNKNOWN/busy khóa thay serial/tra cứu, giữ request/scanSessionId/version. `warranty-model.mjs` không đổi ở revision này.

## Kiểm chứng

- `node scripts/check_warranty_scan.cjs`: **8/8 nhóm PASS**, [scan-results.json](evidence/revision-02/scan-results.json). Đo trực tiếp P04/P05/P09: camera nhập tay128px, input52px, button52px rộng126px, radius8px bằng nhau.
- Sáu viewport494×1000,360×800,430×932,1440×900,340×420,1869×940: không tràn ngang, chữ nút không cắt, header/footer trong shell, cuộn nội bộ. [scan-metrics.json](evidence/revision-02/scan-metrics.json). Đã xem ảnh idle, valid và cuối form.
- `WARRANTY_EVIDENCE_DIR=handoff/P09/evidence/revision-02/regression node scripts/check_warranty.cjs`: **10/10 nhóm hồi quy P09 PASS**, [browser-results.json](evidence/revision-02/regression/browser-results.json). Script cập nhật thao tác nhập tay theo UI mới; logic acceptance A01–A05 giữ nguyên.
- `node --test tests/*.test.mjs tests/*.test.cjs`: **159/159 PASS**, [log](evidence/revision-02/node-tests.txt). Không thêm test unit chỉ sao chép implementation; bổ sung browser test cho tương tác thay đổi thực tế.
- Không pageerror trong hai suite; không gọi camera/hardware/API ghi. P05 reference trong test dùng fixture geography có sẵn, không mở API mới.

Ảnh: [mặc định](evidence/revision-02/01-idle.png), [nhập tay hợp lệ](evidence/revision-02/03-valid.png), [lỗi inline](evidence/revision-02/02-invalid.png), [cuối form](evidence/revision-02/form-bottom.png), [P04 đối chiếu](evidence/revision-02/reference-P04.png), [P05 đối chiếu](evidence/revision-02/reference-P05.png).

## Trạng thái bàn giao

Visual **IN_PROGRESS / chờ user review**; behavior **PASS fixture**; integration **BLOCKED** theo r01. Source HEAD vẫn da9f623…; không đổi backend policy/enum, không biến tiếp nhận thành nhập kho/gửi Web, không tạo thành công từ đọc mã. Giữ91 IDs và P08 tạm chốt. Evidence r01 bảo toàn; r02 có thư mục riêng.

Files: shared/scan-entry.mjs + scan-entry.css; warranty/warranty.mjs + style.css; auth-session/index.html; scripts/check_warranty.cjs + check_warranty_scan.cjs; coverage/RUN_STATE và báo cáo r02. P09.S01/S03/S04 giữ bố cục. Không push/merge/deploy.
