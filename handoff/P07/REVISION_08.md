# P07 r08 — Hai điều hướng phụ và căn mép thông tin thẻ

27/09/2026. User yêu cầu thiết kế lại Liên kết thẻ khác/Về Trang chủ và xử lý cảm giác lệch ở khối thông tin thẻ S02. Chỉ đổi bố cục P07 theo phạm vi yêu cầu mới; không đổi nghiệp vụ hoặc baseline.

## Thiết kế và thực hiện

- S04: nút chính Xem thông tin thẻ toàn chiều rộng. Hai điều hướng phụ nằm chung một hàng, chia đều chiều rộng, gap12px, cao56px; icon23px và chữ17px được căn giữa. Nền nhẹ/viền mảnh cùng màu, trạng thái hover và focus bàn phím giữ rõ. Nhóm này cùng hai mép với bảng thông tin và nút chính.
- S02: khối UID/trạng thái có inset8px, viền1px, padding12px giống hệ lề của thẻ sản phẩm/kho. Các cột nhãn giữ bên trái; giá trị căn phải và chung mép với cột icon trailing bên trên. Quyết định căn phải này thay cho cột giá trị căn trái r05 theo yêu cầu bố cục mới, không chỉ dịch riêng chữ Chưa đọc được.
- Chevron sản phẩm và khóa kho cùng ô24px; chuẩn hóa padding và border để mép phải thực sự trùng nhau. Giá trị dài được xuống dòng trong cột. Nội dung trạng thái có span riêng để giữ chấm và chữ là hai phần ổn định khi wrap.
- Giữ minh họa điện thoại ở trục giữa, sóng lớn r07 và reduced-motion; giữ shell494×950, cuộn trong và footer cố định. CSS version p07-r08.

## Kiểm chứng

- 33 captures PASS với `check_nfc_alignment.cjs`: S01/S02 unread/read/S03/S04 ở6 viewport, dialog, mã/trạng thái dài và cuộn cuối. Đo thêm mép phải chung product/warehouse/UID/status và trục giữa điện thoại, lề inset và tràn chữ. Test được cập nhật theo bố cục mới: nhóm hai nút có tổng chiều rộng chung, không yêu cầu mỗi nút nửa hàng chiếm cả hàng; giá trị S02 dùng mép phải.
- `check_nfc_motion.cjs` PASS: motion/reduced-motion, sáu viewport kiểm hai nút cùng hàng/cùng rộng/cùng cao và đúng mép ngoài, nút chính, viền summary, Home action.
- `check_nfc_repeat.cjs`:4 nhóm PASS, gồm liên kết liên tiếp5 mã, invalidate read khi đổi mã, UNKNOWN/reconcile, chuỗi dài/cuộn cuối. Không đổi flow/adapter/API.
- Đã xem S02, S04 và stress chuỗi dài. Viewports1869×940,1495×752,685×872,494×1000,360×800,340×420, Chromium DPR1. Node không chạy lại cho thay đổi markup/CSS này;104/104 là kết quả lịch sử r05. Backend/hardware NOT_RUN. Visual cuối chờ user review.

[Đọc thẻ](evidence/revision-08/alignment/S02-unread-1869x940.png) · [Hoàn tất](evidence/revision-08/alignment/S04-1869x940.png) · [Alignment](evidence/revision-08/alignment/metrics.json) · [Motion/footer](evidence/revision-08/motion/results.json) · [Luồng lặp](evidence/revision-08/repeat/results.json).

Giữ91 hàng coverage, P01–P06 tạm chốt, P08 chưa bắt đầu. Không push/merge/deploy.
