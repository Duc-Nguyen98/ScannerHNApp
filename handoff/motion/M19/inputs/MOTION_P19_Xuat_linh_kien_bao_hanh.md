# MOTION_P19 — 17 · Xuất linh kiện bảo hành

**Thực hiện sửa code và kiểm tra toàn bộ state dưới đây, không chỉ trả kế hoạch.** Đây là lượt bổ sung motion của board P19, giữ nguyên ID/phạm vi bản dựng cũ.

## Đầu vào và ranh giới

- Đọc `MOTION_CONTRACT.md`, contract thiết kế gốc, báo cáo FLOW_GATE và M00; reuse quyết định còn hiệu lực, không đọc lại toàn bộ repo.
- Board baseline: [ảnh tại snapshot đã dùng](https://raw.githubusercontent.com/Duc-Nguyen98/ScannerHNApp/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/02_NEW_BOARDS/17_xuat_linh_kien_bao_hanh.png). Ưu tiên ảnh baseline mới hơn đã được người dùng chốt nếu có trace; không tự đổi ảnh.
- Context liên màn: Case P09; thành công về P20; resume P21; exception P24. Reuse editable source docs/flows/warranty-components/flow.js, các scene scan/quantity/review/success.
- Ownership của lượt này: **ComponentScan, QuantitySheet, PostFeedback**. Tái sử dụng primitive M00 và consumer đã triển khai; không tạo một bản provider/scroller khác cho board.
- Chỉ bắt đầu sau khi FLOW_GATE và setup motion đủ. Nếu lỗi flow mới xuất hiện, sửa đúng owner và kiểm cạnh liên quan trước; không dùng animation che lỗi, không redesign, không deploy.

## Mapping từng panel

Các duration/easing/reduced fallback theo MOTION_CONTRACT. Thông tin nghiệp vụ hiển thị và guard áp dụng ngay, không chờ duration. Static-by-design vẫn phải kiểm và ghi bằng chứng.

| Panel ID | State tham chiếu | Motion/feedback chính xác |
|---|---|---|
| P19.S01 | Quét linh kiện / mã hộp — scan | Scan linh kiện: chỉ highlight mã vừa accepted160ms; reticle/video ổn định, quantity không count-up. |
| P19.S02 | Nhập số lượng hộp — quantity | Quantity: sheet chung220ms/exit160ms; không animate height khi bàn phím; validation ngay, focus input đúng. |
| P19.S03 | Xác nhận xuất linh kiện — review | Review: summary2 mã/3qty hiện tức thì theo fixture; CTA Post phản hồi100ms, pending theo action owner. |
| P19.S04 | Xuất thành công — success | Success: icon có sẵn fade160ms sau POSTED confirmed trong adapter thật/mock đã phân biệt; không confetti. |

## Guard, dữ liệu và scroll

Không Post trong useEffect/mount/animation completion. Repeated taps/key-enter chỉ một operation logic; response của case cũ không mở success case mới.

**Virtualization:** Chỉ scan list dài có nhu cầu đo; sheet/review ngắn giữ native. Chỉ áp quyết định có profile từ M00/owner chung; không thêm lib cho đủ danh sách công nghệ. Giữ seed đã có, không sinh lại fixture để dễ làm hiệu ứng.

Nguồn nghiệp vụ cần đối chiếu của board này: Source prototype có action fake/fixture phục vụ demo; dùng để hiểu tương tác, không coi setTimeout hoặc localStorage là bằng chứng backend đã Post. Không đưa vấn đề PROPOSED thành requirement mới vì motion.

## Nghiệm thu riêng

1. Mã hộpqty2 cộngtemqty1 thành3; mở/đóng sheet không thêmqty lần hai.
2. Post timeout: không chạy success hay đổi tồn mẫu nếu kết quả vẫnUNKNOWN.
3. Scan→sheet→Back nhanh không mất camera stream owner, không tạo listener thứhai.

4. Với từng panel: full/auto, OS reduced và off có cùng nội dung, domain result, số operation hợp lệ và quyền. Static geometry sau settle khớp baseline; modeoff vẫn hoàn thành nhiệm vụ. Không replay hàng cũ khi mount/recycle/Back.
5. Kiểm navigation vào/ra, rapid tap, Back, scroll/keyboard/focus và hủy animation giữa chừng ở các action liên quan. Cleanup không giữ listener/RAF/overlay; camera/NFC service không bị nhân đôi vì animation.
6. Nếu chạm shared primitive, xem ownership map và chạy hồi quy trực tiếp các consumer bị tác động. Dùng ảnh actual sau settle và clip/trace thật khi chứng minh chuyển động; không báo60fps từ cảm giác nhìn hoặc screenshot.

## Thực thi và bàn giao

Đọc file liên quan → sửa tối thiểu trong source → chạy kiểm tra trên các state của board → sửa regression → cập nhật tracking. Không dừng ở câu hỏi “có muốn triển khai không?”. Đừng chạy lại mọi ca toàn app sau từng panel; chỉ mở rộng khi phát hiện rủi ro.

Xuất `handoff/motion/M19/REPORT.md`: source/diff/fixture version, files changed, primitives reused, kết quả theo P19.Sxx ở3 mode, operation/scroll/focus evidence, perf delta nếu có, blocker và dependency ảnh hưởng. Cập nhật `MOTION_COVERAGE.csv` và `MOTION_RUN_STATE.json`, không ghi đè trạng thái business integration cũ bằng kết quả animation.

Nếu bị ngắt, lưu phần còn lại và tiếp tục chính MOTION_P19; không tạo prompt triển khai mới. Nếu static là lựa chọn đúng, ghi STATIC_BY_DESIGN kèm testPASS thật, không bịa hiệu ứng để đủ số lượng.
