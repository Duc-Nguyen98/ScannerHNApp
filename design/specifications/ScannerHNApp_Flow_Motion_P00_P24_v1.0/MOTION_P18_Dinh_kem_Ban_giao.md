# MOTION_P18 — Đính kèm bàn giao

**Thực hiện sửa code và kiểm tra toàn bộ state dưới đây, không chỉ trả kế hoạch.** Đây là lượt bổ sung motion của board P18, giữ nguyên ID/phạm vi bản dựng cũ.

## Đầu vào và ranh giới

- Đọc `MOTION_CONTRACT.md`, contract thiết kế gốc, báo cáo FLOW_GATE và M00; reuse quyết định còn hiệu lực, không đọc lại toàn bộ repo.
- Board baseline: [ảnh tại snapshot đã dùng](https://raw.githubusercontent.com/Duc-Nguyen98/ScannerHNApp/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/02_NEW_BOARDS/16_dinh_kem_ban_giao_fixed.png). Ưu tiên ảnh baseline mới hơn đã được người dùng chốt nếu có trace; không tự đổi ảnh.
- Context liên màn: P12 document; P09 warranty; P06 item/location; nguồn upload/file/download và contract handoff.
- Ownership của lượt này: **AttachmentRow, ViewerShell, FormFeedback**. Tái sử dụng primitive M00 và consumer đã triển khai; không tạo một bản provider/scroller khác cho board.
- Chỉ bắt đầu sau khi FLOW_GATE và setup motion đủ. Nếu lỗi flow mới xuất hiện, sửa đúng owner và kiểm cạnh liên quan trước; không dùng animation che lỗi, không redesign, không deploy.

## Mapping từng panel

Các duration/easing/reduced fallback theo MOTION_CONTRACT. Thông tin nghiệp vụ hiển thị và guard áp dụng ngay, không chờ duration. Static-by-design vẫn phải kiểm và ghi bằng chứng.

| Panel ID | State tham chiếu | Motion/feedback chính xác |
|---|---|---|
| P18.S01 | Tệp đính kèm PN-0005 | Tệp: progress dùng tỷ lệ task thật; interpolation tối đa100ms không vượt giá trị xác nhận, text % đổi ngay. Cancel/retry độc lập hàng, không animate cả list theo tick. |
| P18.S02 | Xem tài liệu 1/2 | Viewer: container cố định; page swap fade140ms sau render ready, không kéo biến dạng PDF hoặc intercept pinch/scroll. |
| P18.S03 | Bàn giao bảo hành BH-001 | Bàn giao: field/check feedback nhẹ; success chỉ sau response hợp lệ, không tự đóng hồ sơ bởi checkbox motion. |
| P18.S04 | Vị trí linh kiện kho | Vị trí: selected outline đổi140ms; không morph ô, animate move/unmap hoặc làm occupancy trông như dữ liệu thật. |

## Guard, dữ liệu và scroll

Progress không được chạy giả tới100%; proposal bàn giao/location giữ nhãn trong review. Không thêm drag-and-drop hoặc CRUD từ hiệu ứng.

**Virtualization:** Attachment list thường ngắn; chỉ profile nếu dài, không virtualize document viewer bằng row virtualizer. Chỉ áp quyết định có profile từ M00/owner chung; không thêm lib cho đủ danh sách công nghệ. Giữ seed đã có, không sinh lại fixture để dễ làm hiệu ứng.

Nguồn nghiệp vụ cần đối chiếu của board này: Panel vị trí và bàn giao cần policy/schema cụ thể. Không loại chúng khỏi bộ24, không tự sửa nghiệp vụ để hoàn tất giả. Không đưa vấn đề PROPOSED thành requirement mới vì motion.

## Nghiệm thu riêng

1. Một file fail khi file khác upload: trạng thái hai task không lẫn.
2. Viewer next/prev nhanh: giữ file/page ID, page cũ không hiện lại muộn.
3. Tick bàn giao/chọn ô không tự gửi mutation chưa chốt.

4. Với từng panel: full/auto, OS reduced và off có cùng nội dung, domain result, số operation hợp lệ và quyền. Static geometry sau settle khớp baseline; modeoff vẫn hoàn thành nhiệm vụ. Không replay hàng cũ khi mount/recycle/Back.
5. Kiểm navigation vào/ra, rapid tap, Back, scroll/keyboard/focus và hủy animation giữa chừng ở các action liên quan. Cleanup không giữ listener/RAF/overlay; camera/NFC service không bị nhân đôi vì animation.
6. Nếu chạm shared primitive, xem ownership map và chạy hồi quy trực tiếp các consumer bị tác động. Dùng ảnh actual sau settle và clip/trace thật khi chứng minh chuyển động; không báo60fps từ cảm giác nhìn hoặc screenshot.

## Thực thi và bàn giao

Đọc file liên quan → sửa tối thiểu trong source → chạy kiểm tra trên các state của board → sửa regression → cập nhật tracking. Không dừng ở câu hỏi “có muốn triển khai không?”. Đừng chạy lại mọi ca toàn app sau từng panel; chỉ mở rộng khi phát hiện rủi ro.

Xuất `handoff/motion/M18/REPORT.md`: source/diff/fixture version, files changed, primitives reused, kết quả theo P18.Sxx ở3 mode, operation/scroll/focus evidence, perf delta nếu có, blocker và dependency ảnh hưởng. Cập nhật `MOTION_COVERAGE.csv` và `MOTION_RUN_STATE.json`, không ghi đè trạng thái business integration cũ bằng kết quả animation.

Nếu bị ngắt, lưu phần còn lại và tiếp tục chính MOTION_P18; không tạo prompt triển khai mới. Nếu static là lựa chọn đúng, ghi STATIC_BY_DESIGN kèm testPASS thật, không bịa hiệu ứng để đủ số lượng.
