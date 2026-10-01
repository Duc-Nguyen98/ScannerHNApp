# P05 revision09 — rà soát ổn định và đồng bộ UI

Ngày28/09/2026. Phạm vi user yêu cầu: rà soát luồng Xuất kho, sửa lỗi lặt vặt, UI/UX đồng bộ và hoạt động ổn định. Đã đọc AGENTS.md/UI_STANDARD.md, giữ chuẩn icon pastel được duyệt, hộp chọn chung mới của hệ thống và phần địa chỉ đã tinh gọn r08. Checkpoint toàn workspace hiện là P09; không chuyển prompt/ghi đè công việc khác.

## Lỗi có bằng chứng và cách sửa

Lượt trước sửa [before.json](evidence/revision-09/before.json) tái hiện4 lỗi:

1. Hoàn tất tải địa giới vẽ lại form, đóng hộp chọn và làm mất lựa chọn radio chưa Áp dụng. Flow gắn ngữ cảnh geographyOnly; UI cập nhật snapshot nhưng hoãn repaint khi selector mở. Khi đóng/áp dụng, đọc state mới nhất rồi repaint một lần; không giữ snapshot cũ để ghi đè lựa chọn.
2. Tải xong địa giới làm con trỏ/selection trong ghi chú về0. Lưu/khôi phục selection cho textarea như input; giữ value/focus/scroll.
3. Quay lại từ P17.S02 giữ HN99999 trong ô Nhập tay. Xóa riêng state ô nhập/phản hồi khi chọn Quét mã khác, không xóa raw trong audit hoặc accepted.
4. Phiếu bị từ chối đã có request bất biến nhưng quay lại màn quét vẫn mở Nhập tay; bấm submit bị flow từ chối im lặng. UI khóa nhập/quét, giải thích thông tin/mã được giữ nguyên để retry cùng request, vẫn cho xem mã và quay về kiểm tra. S01 readonly có giải thích tương tự. Nút Home ở failure chiếm cả hàng để cân bố cục.

Các sửa bổ sung trong phạm vi rà soát:

- Xem tất cả của S02 không tự mở danh sách serial S03; reset state hiển thị khi đổi bước.
- Đang xác nhận đổi phiếu nhưng chọn lại phiếu hiện tại sẽ hủy pending confirmation, không để CTA tiếp tục bị khóa vô lý.
- Focus lỗi bỏ qua trường đang disabled, ưu tiên trường có thể sửa/nút retry. CTA tiếp tục báo Đang tải địa giới khi dữ liệu phụ thuộc đang tải, không cho đi tiếp trước khi hợp lệ.
- Lifecycle listener của mount P05 dùng AbortController để cleanup input/submit/focus/keyboard khi dispose; selector tự cleanup listener/modal/observer. Giữ aria-controls của shared dialog đúng khi mở/đóng. Bảo vệ popup nếu anchor rời vùng nhìn trước khi mở hoàn tất.
- Ô icon quét Xuất kho dùng `hn-operation-icon`/`data-hn-operation=outbound` từ shared palette; không tự tạo màu nghiệp vụ, không đổi màu warning/success. Hộp source/recipient/group tiếp tục dùng `openChoiceDialog`; tỉnh/quận tiếp tục popup tìm kiếm neo không đẩy form.

Không đổi số lượng1–99/default1, walk-in, thứ tự tỉnh→quận→detail, namespace/version/identity/request, duplicate/blocked scan, workflow Gửi Web→Chờ xử lý/chưa Post/chưa đổi tồn. Không tự bật camera, thêm API ghi dữ liệu, đổi baseline hay cấu trúc4 panel.

## Kiểm chứng và bằng chứng

Tổng **64 nhóm browser P05 PASS**, không pageerror ở các kết quả cuối;30 case layout của selector và30 case geography bao phủ6 viewport. Đã xem thêm [ô quét dùng chuẩn icon chung](evidence/revision-09/ux/04-valid.png). Không tính các lượt rerun trùng thành nhóm kiểm tra bổ sung.

- Node toàn workspace cuối: **195/195 PASS**, [log](evidence/revision-09/node-tests-final.txt). P05 riêng27/27: [log](evidence/revision-09/outbound-node-tests.txt). Tổng195 có cả test các phần đang được cập nhật đồng thời, không quy toàn bộ cho P05.
- Rà soát mới7 nhóm: [kết quả cuối](evidence/revision-09/final-stability/stability-results.json). Trước sửa4/5 probes fail; sau sửa có thêm case chọn lại source và state Xem tất cả.
- Metadata8: [kết quả](evidence/revision-09/metadata/metadata-results.json).
- Địa giới7,30 case selector×viewport: [kết quả](evidence/revision-09/geography/browser-results.json). Script được cập nhật theo component chung hiện có:3 dialog/2 popup; không ép app quay về kiểu selector cũ để qua test.
- Selector6,30 case layout: [kết quả](evidence/revision-09/select/select-results.json).
- Lifecycle8: [kết quả](evidence/revision-09/lifecycle/browser-results.json), giữ draft/pending/UNKNOWN/retry và fresh qua cả hai đường. Process điều phối bị dừng ở giai đoạn cleanup browser sau khi đã ghi kết quả8/8, các suite còn lại được chạy riêng; không coi sự cố cleanup là lỗi app đã sửa.
- Regression P05/P04: [kết quả](evidence/revision-09/regression/browser-results.json). UX: [kết quả](evidence/revision-09/ux/ux-results.json). Validation: [kết quả](evidence/revision-09/validation/browser-results.json).
- Đã xem actual [shared picker390](evidence/revision-09/select/selector-recipient-390.png) và [failure retry/footer](evidence/revision-09/recheck/frozen-retry.png). Header/footer/shell494×950 và màu nghiệp vụ chung giữ ổn định; visual mới chờ user review.

Lưu log các lượt chưa đạt: Node lượt đầu checksum P07 chưa đồng bộ, lượt sau assertion P03 về route warranty trong kho dừng chưa đồng bộ (`node-tests.txt`, `node-tests-rerun.txt`); bản hiện tại các phần đó đã được cập nhật ngoài phạm vi P05 và full suite195 đạt. Một lượt startup browser timeout chờ #username (không pageerror) giữ trong `failure.json`; chạy lại app thành công. Không thay baseline/hash của P07/P03 để che kết quả, không ghi đè module khác.

Các browser suite dùng fixture/mock địa giới để kiểm ổn định. API địa giới thật đã được kiểm ở r07, không chạy lại ở revision này; WMS/camera/thiết bị thật vẫn chưa tích hợp/kiểm chứng. Draft vẫn bộ nhớ tab, reload sẽ mất; không thêm persistence trái scope. Không push/merge/deploy.
