# MOTION_P14 — Khôi phục ca

**Thực hiện sửa code và kiểm tra toàn bộ state dưới đây, không chỉ trả kế hoạch.** Đây là lượt bổ sung motion của board P14, giữ nguyên ID/phạm vi bản dựng cũ.

## Đầu vào và ranh giới

- Đọc `MOTION_CONTRACT.md`, contract thiết kế gốc, báo cáo FLOW_GATE và M00; reuse quyết định còn hiệu lực, không đọc lại toàn bộ repo.
- Board baseline: [ảnh tại snapshot đã dùng](https://raw.githubusercontent.com/Duc-Nguyen98/ScannerHNApp/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/02_NEW_BOARDS/12_khoi_phuc_va_ca_fixed.png). Ưu tiên ảnh baseline mới hơn đã được người dùng chốt nếu có trace; không tự đổi ảnh.
- Context liên màn: P01 quên mật khẩu; P10 kết thúc ca; P03 draft dialog; P21 tiếp tục phiếu.
- Ownership của lượt này: **FormFeedback, ModalMotion, ShiftSummary**. Tái sử dụng primitive M00 và consumer đã triển khai; không tạo một bản provider/scroller khác cho board.
- Chỉ bắt đầu sau khi FLOW_GATE và setup motion đủ. Nếu lỗi flow mới xuất hiện, sửa đúng owner và kiểm cạnh liên quan trước; không dùng animation che lỗi, không redesign, không deploy.

## Mapping từng panel

Các duration/easing/reduced fallback theo MOTION_CONTRACT. Thông tin nghiệp vụ hiển thị và guard áp dụng ngay, không chờ duration. Static-by-design vẫn phải kiểm và ghi bằng chứng.

| Panel ID | State tham chiếu | Motion/feedback chính xác |
|---|---|---|
| P14.S01 | Khôi phục tài khoản | Khôi phục tài khoản: form giữ geometry; submit feedback tức thì, không OTP mới. |
| P14.S02 | Yêu cầu đã tiếp nhận | Yêu cầu tiếp nhận: fade160ms nếu service/mock đã xác nhận; không dùng màn này để giả có email gửi thật. |
| P14.S03 | Kết thúc ca có phiếu dở | Kết thúc ca có phiếu dở: modal chung; làm rõ draft giữ hay bỏ theo policy, không auto-dismiss vì animation. |
| P14.S04 | Tổng kết ca | Tổng kết ca: số liệu hiện ngay, không count-up; transition kết thúc ca theo trạng thái nguồn. |

## Guard, dữ liệu và scroll

Shift/session policy chưa chốt giữ PROPOSED. Animation không đóng ca, xóa draft hoặc gửi yêu cầu recovery.

**Virtualization:** Không cần cho form/summary; list draft dài tái sử dụng P21 nếu cần. Chỉ áp quyết định có profile từ M00/owner chung; không thêm lib cho đủ danh sách công nghệ. Giữ seed đã có, không sinh lại fixture để dễ làm hiệu ứng.

Nguồn nghiệp vụ cần đối chiếu của board này: Cả nhận yêu cầu recovery và điều kiện kết thúc ca cần chốt theo nguồn; UI_READY không được ghi INTEGRATION_PASS. Không đưa vấn đề PROPOSED thành requirement mới vì motion.

## Nghiệm thu riêng

1. Cancel kết thúc ca giữ toàn bộ draft/phiên.
2. Recovery network error không mở confirmation thành công.
3. Rời/đổi ca khi transition đang chạy không mang callback vào ca mới.

4. Với từng panel: full/auto, OS reduced và off có cùng nội dung, domain result, số operation hợp lệ và quyền. Static geometry sau settle khớp baseline; modeoff vẫn hoàn thành nhiệm vụ. Không replay hàng cũ khi mount/recycle/Back.
5. Kiểm navigation vào/ra, rapid tap, Back, scroll/keyboard/focus và hủy animation giữa chừng ở các action liên quan. Cleanup không giữ listener/RAF/overlay; camera/NFC service không bị nhân đôi vì animation.
6. Nếu chạm shared primitive, xem ownership map và chạy hồi quy trực tiếp các consumer bị tác động. Dùng ảnh actual sau settle và clip/trace thật khi chứng minh chuyển động; không báo60fps từ cảm giác nhìn hoặc screenshot.

## Thực thi và bàn giao

Đọc file liên quan → sửa tối thiểu trong source → chạy kiểm tra trên các state của board → sửa regression → cập nhật tracking. Không dừng ở câu hỏi “có muốn triển khai không?”. Đừng chạy lại mọi ca toàn app sau từng panel; chỉ mở rộng khi phát hiện rủi ro.

Xuất `handoff/motion/M14/REPORT.md`: source/diff/fixture version, files changed, primitives reused, kết quả theo P14.Sxx ở3 mode, operation/scroll/focus evidence, perf delta nếu có, blocker và dependency ảnh hưởng. Cập nhật `MOTION_COVERAGE.csv` và `MOTION_RUN_STATE.json`, không ghi đè trạng thái business integration cũ bằng kết quả animation.

Nếu bị ngắt, lưu phần còn lại và tiếp tục chính MOTION_P14; không tạo prompt triển khai mới. Nếu static là lựa chọn đúng, ghi STATIC_BY_DESIGN kèm testPASS thật, không bịa hiệu ứng để đủ số lượng.
