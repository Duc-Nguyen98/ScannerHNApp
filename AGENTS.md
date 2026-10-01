# ScannerHNApp — các quyết định cần giữ qua các phiên làm việc

Khi sửa giao diện trong `docs/flows/`, đọc `docs/flows/shared/UI_STANDARD.md` trước khi chỉnh.

- User 30/09/2026 yêu cầu áp dụng sáu cải tiến thao tác: vùng bấm ưu tiên P01–P11 theo scale (P10 giữ controller riêng), nhập tay tập trung P04/P05, Vừa xem và ngày nhanh P06, Enter tìm UID P07, dialog đổi phiếu P05 trước→sau. Giữ footerLOCK và scope thật của selector; không mở rộng blanket 44px vào calendar/nav/board sau. Xem `handoff/ux-upgrade-2026-09-30/REPORT.md` và mục tương ứng UI_STANDARD. Visual mới chờ review, không xem yêu cầu triển khai là nghiệm thu hình thức.

- Home recent (user2026-09-29): Xem tất cả ở **Chứng từ gần đây** mở quản lý **Chứng từ P12**, không còn mở hubLịch sử theo chốt cũ. Tab Lịch sử vẫn mở Lịch sử. Home tối đa3 chứng từ mới nhất từ nguồn P12, mở chi tiết bằng ID thật của bản ghi; giữ footerLOCK.

- FOOTER LOCK (user nhắc lại 2026-09-28): giữ footer Home/P03 đã chốt theo `handoff/P03/REVISION_04.md`. Không đổi nền trắng, nhấn tab, scan-circle, radius, kích thước hoặc thứ tự menu khi chỉnh KPI/màu nền Home; không thêm override riêng Home làm lệch footer chung. Xem “HN-footer-locked-v1” trong UI_STANDARD.md.

- User đã duyệt kiểu icon nét mảnh trong ô nền pastel bo góc (ảnh Lịch sử có Nhập/Xuất/Bảo hành/NFC). Đây là chuẩn nhận diện nghiệp vụ Hoa Nam cho các màn hiện có và màn triển khai sau.
- Dùng `shared/operation-icons.css` làm nguồn palette duy nhất; component `hn-operation-icon` + `data-hn-operation`, không tự tạo bảng màu riêng cho mỗi màn.
- Giữ màu nhận diện nghiệp vụ tách khỏi màu trạng thái/warning/error/success. Không nhuộm lại logo, artwork, ảnh sản phẩm, icon khóa/cảnh báo hoặc thanh nav bằng quy tắc nghiệp vụ.
- Với màn đã chốt, giữ cấu trúc và kích thước component khi đồng bộ màu. Màn mới dùng biến thể sm/md/lg trong UI_STANDARD.md.
- Chuẩn icon là quyết định được duyệt, KHÔNG có nghĩa user đã nghiệm thu toàn bộ các màn hoặc cho phép đổi nghiệp vụ.
- Giữ đúng 24 prompt/board và tối thiểu 91 panel baseline, giữ nguyên ID. Không tự gộp/tách/bỏ màn, sửa baseline, dist/gallery, push/merge/deploy nếu không được yêu cầu.
- Chỉ thị user mới nhất có ưu tiên trong đúng phạm vi. Các validation/bộ lọc/Back dùng component hiện có, không nhân bản logic theo màn.
- Đọc RUN_STATE.json và báo cáo revision mới nhất để tiếp tục đúng chỗ. Tách visual/behavior/integration trong bàn giao, không đánh dấu PASS nếu chưa kiểm chứng.
- KHÓA CONTRACT UI (user 2026-09-28, P11 r03): thông báo kết quả thao tác và xác nhận hành động dùng dialog nổi TRONG app, không chèn dòng toast/status vào nội dung làm đổi bố cục. Màn triển khai sau bắt buộc theo mục “HN-action-feedback-v1” trong `docs/flows/shared/UI_STANDARD.md`, tái sử dụng `shared/action-dialog.mjs`/`.css` và `dialog-route.mjs`.
- Phân biệt trước/sau thao tác: trước hành động cần quyết định dùng Hủy + tên hành động; sau thành công đã xác minh dùng Đã hiểu/Đóng, không đặt Hủy để giả có thể hoàn tác. Giữ validation ngay field, hint tĩnh và panel kết quả đã có ID; không tự bỏ/gộp panel hoặc đại tu màn đã chốt ngoài phạm vi.
- User đã mở rộng rõ phạm vi đồng bộ này về P01–P10 ngày 2026-09-28. Kết quả và mapping theo `handoff/dialog-sync-2026-09-28/REPORT.md`; giữ các chuẩn mới khi chỉnh màn cũ, không quay lại banner kết quả. `shared/action-feedback.mjs` quản lý queue/lifecycle/Back trên `action-dialog.mjs`; gọi clear/dispose khi rời module để không chạy callback cũ.

- KHÓA CONTRACT HN-readable-content-v1 (user 2026-09-28): áp dụng P01–P11 và bắt buộc từ P12 trở đi. Ghi chú xem gọn2 dòng, mô tả dài3 dòng; nếu rút gọn phải có Xem đầy đủ trong dialog cuộn được. Không cắt/lưu đè dữ liệu, không đổi giới hạn nhập để chữa layout. Dùng `shared/readable-text.mjs`/`.css`, chi tiết tại UI_STANDARD.md. Giữ đầy đủ cảnh báo/confirmation/validation trong vùng cuộn; không gắn reader vào password/input. P12 r05 dùng adapter cùng `isTextTruncated`. Khi sửa màn phải kiểm dài250/2000+, newline, Unicode, từ liền, Back/focus và footer.

- VISUAL EVIDENCE GATE (P12 review2026-09-28): không gọi bản sửa “đúng thiết kế/đã đồng bộ/visual PASS” chỉ vì test logic/overflow đạt. Trước sửa phải có bảng baseline/component/user-change/implementation-choice; sau sửa có actual trước–sau cùng điều kiện và liệt kê phần chưa có nguồn. Không dùng báo cáo do agent tự viết làm bằng chứng user đã duyệt. Form/nhánh không có baseline phải ghi rõ adaptation/proposal, không tự nâng thành contract. Xem mục HN-visual-evidence-v1 trong UI_STANDARD.md.
