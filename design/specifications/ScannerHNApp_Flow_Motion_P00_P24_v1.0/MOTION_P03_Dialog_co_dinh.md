# MOTION_P03 — Dialog cố định

**Thực hiện sửa code và kiểm tra toàn bộ state dưới đây, không chỉ trả kế hoạch.** Đây là lượt bổ sung motion của board P03, giữ nguyên ID/phạm vi bản dựng cũ.

## Đầu vào và ranh giới

- Đọc `MOTION_CONTRACT.md`, contract thiết kế gốc, báo cáo FLOW_GATE và M00; reuse quyết định còn hiệu lực, không đọc lại toàn bộ repo.
- Board baseline: [ảnh tại snapshot đã dùng](https://raw.githubusercontent.com/Duc-Nguyen98/ScannerHNApp/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/01_UPDATED_BOARDS/01_dialog_header_aligned_v2.png). Ưu tiên ảnh baseline mới hơn đã được người dùng chốt nếu có trace; không tự đổi ảnh.
- Context liên màn: AppShell P02; các luồng P04/P05/P09; resume P21; lỗi hệ thống P15.
- Ownership của lượt này: **ModalMotion, SheetMotion, OverlayManager**. Tái sử dụng primitive M00 và consumer đã triển khai; không tạo một bản provider/scroller khác cho board.
- Chỉ bắt đầu sau khi FLOW_GATE và setup motion đủ. Nếu lỗi flow mới xuất hiện, sửa đúng owner và kiểm cạnh liên quan trước; không dùng animation che lỗi, không redesign, không deploy.

## Mapping từng panel

Các duration/easing/reduced fallback theo MOTION_CONTRACT. Thông tin nghiệp vụ hiển thị và guard áp dụng ngay, không chờ duration. Static-by-design vẫn phải kiểm và ghi bằng chứng.

| Panel ID | State tham chiếu | Motion/feedback chính xác |
|---|---|---|
| P03.S01 | Chọn tác vụ quét | Chọn tác vụ: backdrop fade 140ms; panel fade/translate tối đa8px trong220ms; focus đến lựa chọn đúng, không sinh hộp thoại kiểu mới. |
| P03.S02 | Phiếu chưa hoàn tất | Phiếu chưa hoàn tất: mở cùng primitive; nội dung/ID giữ nguyên khi tiếp tục hoặc đóng; không animate reorder danh sách mã. |
| P03.S03 | Kho tạm dừng | Kho tạm dừng: cảnh báo hiện ngay; panel chỉ fade, không bounce/đếm ngược tự đóng. |
| P03.S04 | Xác nhận bỏ phiếu | Xác nhận bỏ phiếu: modal có focus trap; nút hủy/tiếp tục rõ, exit160ms chỉ trình bày; kết quả nghiệp vụ không chờ exit. |

## Guard, dữ liệu và scroll

Một owner body scroll lock có đếm lớp; focus restore đúng trigger còn tồn tại. Rapid open/close không để backdrop mồ côi; server-recorded lines không bị xóa bởi onExit.

**Virtualization:** Không cần cho modal ngắn; modal dài dùng native overflow. Chỉ áp quyết định có profile từ M00/owner chung; không thêm lib cho đủ danh sách công nghệ. Giữ seed đã có, không sinh lại fixture để dễ làm hiệu ứng.

Nguồn nghiệp vụ cần đối chiếu của board này: Quyền bỏ phiếu hoặc quy tắc lưu nháp chưa có API cần tích hợp đúng nguồn, không tự bổ sung DELETE. Không đưa vấn đề PROPOSED thành requirement mới vì motion.

## Nghiệm thu riêng

1. Mở/đóng modal lặp10 lần: body scroll/focus trở lại bình thường.
2. Bấm Xác nhận rồi đóng nhanh: thao tác theo contract xảy ra đúng một lần.
3. Mở dialog kho tạm dừng qua deep link: mutation vẫn bị chặn khi motion off.

4. Với từng panel: full/auto, OS reduced và off có cùng nội dung, domain result, số operation hợp lệ và quyền. Static geometry sau settle khớp baseline; modeoff vẫn hoàn thành nhiệm vụ. Không replay hàng cũ khi mount/recycle/Back.
5. Kiểm navigation vào/ra, rapid tap, Back, scroll/keyboard/focus và hủy animation giữa chừng ở các action liên quan. Cleanup không giữ listener/RAF/overlay; camera/NFC service không bị nhân đôi vì animation.
6. Nếu chạm shared primitive, xem ownership map và chạy hồi quy trực tiếp các consumer bị tác động. Dùng ảnh actual sau settle và clip/trace thật khi chứng minh chuyển động; không báo60fps từ cảm giác nhìn hoặc screenshot.

## Thực thi và bàn giao

Đọc file liên quan → sửa tối thiểu trong source → chạy kiểm tra trên các state của board → sửa regression → cập nhật tracking. Không dừng ở câu hỏi “có muốn triển khai không?”. Đừng chạy lại mọi ca toàn app sau từng panel; chỉ mở rộng khi phát hiện rủi ro.

Xuất `handoff/motion/M03/REPORT.md`: source/diff/fixture version, files changed, primitives reused, kết quả theo P03.Sxx ở3 mode, operation/scroll/focus evidence, perf delta nếu có, blocker và dependency ảnh hưởng. Cập nhật `MOTION_COVERAGE.csv` và `MOTION_RUN_STATE.json`, không ghi đè trạng thái business integration cũ bằng kết quả animation.

Nếu bị ngắt, lưu phần còn lại và tiếp tục chính MOTION_P03; không tạo prompt triển khai mới. Nếu static là lựa chọn đúng, ghi STATIC_BY_DESIGN kèm testPASS thật, không bịa hiệu ứng để đủ số lượng.
