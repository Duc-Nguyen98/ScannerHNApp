# P08 r23 — rà UI/UX lần hai, sửa lỗi cụ thể

## Phạm vi và nguồn

User yêu cầu rà kỹ và khắc phục lỗi phát sinh sau r22. Phạm vi sáu trang Lịch sử, chi tiết, phiên quét và picker liên quan. Nguồn/chỉ thị/lựa chọn trước sửa trong REVISION_23_SCOPE.md. Giữ footerLOCK, palette nghiệp vụ và các component đã chốt; không sửa baseline, dữ liệu hoặc nghiệp vụ. Current prompt của workspace khác P08 được giữ nguyên.

## Lỗi và sửa

1. **Mở rộng phiên quét làm nhảy vị trí:** audit trước đo nút Xem tất cả từy339.531 sang490.531 (151px). Giữ scroll khi mở/thu gọn, thêm aria-expanded; nút rộng124px ổn định. Audit sau cùngtọa độx352/y287.828/width124 trước–sau mở rộng.
2. **Tên loại phiên sai:** mọi session đều ghi Phiên quét mã, kể cả PQ-0002 Nhập kho/PQ-0003 Xuất linh kiện. Nay dùng type từ chính session, không suy loại từ mã chứng từ.
3. **Màu chi tiết phiên không đồng bộ:** metadata/icon xanh gắt, heading/counters đời cũ; số trùng0 vẫn đỏ. Đồng bộ chữ/lề/viền và metadata tokens chung; số0 trung tính, có trùng mới amber. Màu trạng thái không lấy màu nhận diện nghiệp vụ.
4. **Mã và giờ chen nhau:** timestamp và mã dài cùng hàng quá chật. Cho wrap có kiểm soát, giảm độ đậm/nhịp chữ theo danh sách, giữ toàn bộ mã/SKU/serial/time, không ellipsis định danh. Kiểm box mã/time không giao nhau.
5. **Trạng thái bảo hành đã biết bị báo unknown:** BH-003 received/BH-005 handover ở nguồn mới có nhãn nhưng detail dùng toneunknown/icon cảnh báo. Bổ sung mapping cho cả chip danh sách và detail: received xử lý/trung tính, handover màu chờ/iconclock, không thành completed.
6. **Phím lịch kẹt ở ranh giới tháng:** điều hướng từng chỉ số nút trong tháng, không sang ngày liền trước/sau của tháng khác. Nay di chuyển ngày thực±1/±7, clamp theo giới hạn chung và endpoint còn lại. Chỉ chuyển focus, Enter/click mới chọn ngày, Apply mới commit. Home/End giữ hành vi cũ.
7. **Copy callback cũ phát vào lần xem mới:** khi đi sang tab rồi quay lại cùng record/key, request cũ có thể phát dialog hoặc giữ khóa copy. Khóa theo chính button-instance bằng WeakSet; phản hồi chỉ phát nếu trigger vẫn thuộc view đang hiển thị. Không ngăn thao tác của view mới, không chồng dialog.

## Kiểm chứng

### Behavior

- Node32/32: history*.test.mjs, business-history, query-date-policy, ui-operation-standard.
- check_history_r23.cjs6/6 nhóm: cả sáu danh sách×sáu viewport; dòng cuối đọc được; type/count phiên; expand/collapse anchor; list/detail statuses; calendar qua tháng và validation; latecopy/tab/focus; nestedsession Back giữ timeline và code/time không overlap.
- check_history_ux_r22.cjs hồi quy14/14 PASS, không pageerror, chạy riêng trong `r22-regression/results.json`: giữ kiểm tra preset, Cancel/Apply, context sáu trang, P12 opt-out, empty/error, dialog sáu viewport, copy và logout.
- Audit trước/sau giữ geometry/thông tin thực tế trong before/audit.json và after-final/audit.json; audit sau không có pageerror, không thấy overflow trong các mẫu đã chụp.

### Visual

- Before/after-final cùng494×1000,DPR1,29/09/2026,source mặc định; xem REVIEW_23.html. Đã trực tiếp xem sessionPQ-0002 và BH-005 sau sửa, đối chiếu bản trước.
- Mẫu kiểm: sáu trang list, các detail/timeline, session collapsed/expanded, BH-003/BH-005, filter lỗi, calendarreturn; layout list6viewport và dialog6viewport trong hồi quy.
- Typography phiên, màu counters, width CTA là adaptation sửa lỗi theo yêu cầu. Chờ user review; không tự đánh dấu visualPASS hoặc toàn hệ thống hết lỗi.
- Bàn phím mềm/IME thiết bị thật chưa kiểm. Kiểm keyboard browser và viewport nhỏ không thay thế thiết bị thật.

### Giới hạn và lịch sử kiểm

- Lượt audit đầu chọn PQ-0003 chỉ2mã nên không có nút Xem tất cả; sửa script chọn PQ-0002, không thêm nút giả vào app.
- Lượt capture sau đầu tiên timeout tải hub sessions; giữ ảnh trung gian ở after/. Lượt after-final hoàn tất. Không kết luận đã xử lý nguyên nhân tải hub dùng chung chỉ từ lượt chạy lại thành công.
- Không thay đổi frontend/backend nghiệp vụ khác; không đánh dấu integrationPASS. Không push/merge/deploy; source và evidence cũ giữ nguyên.

## Source cuối

history.mjs `2A73F96076980F27726CCA5C10C9AB7FC24635DD346CD54D1FB66E349683B81B`

history-picker.mjs `2F8B4586DEB56271A6CB0099DD80CB841FC4BA193D12F5482A968C8DBA130778`

history-detail.mjs `A996347DB10333E8B4856E93611B9F8B4A5EE10AFF0A78E82A32951089991141`

style.css `52B16768BB414511BC1CC32E30F42C89093E413CCBC0F4ED612B212D0DF3CFDE`

Giữ nguyên24board/91baseline IDs và trạng thái nghiệm thu; không tạo/bỏ panel.
