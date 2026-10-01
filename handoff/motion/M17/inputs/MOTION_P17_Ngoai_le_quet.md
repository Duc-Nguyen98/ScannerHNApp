# MOTION_P17 — Ngoại lệ quét

**Thực hiện sửa code và kiểm tra toàn bộ state dưới đây, không chỉ trả kế hoạch.** Đây là lượt bổ sung motion của board P17, giữ nguyên ID/phạm vi bản dựng cũ.

## Đầu vào và ranh giới

- Đọc `MOTION_CONTRACT.md`, contract thiết kế gốc, báo cáo FLOW_GATE và M00; reuse quyết định còn hiệu lực, không đọc lại toàn bộ repo.
- Board baseline: [ảnh tại snapshot đã dùng](https://raw.githubusercontent.com/Duc-Nguyen98/ScannerHNApp/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/02_NEW_BOARDS/15_ngoai_le_quet_fixed.png). Ưu tiên ảnh baseline mới hơn đã được người dùng chốt nếu có trace; không tự đổi ảnh.
- Context liên màn: P04 nhập; P05 xuất; P07 NFC; P15 hệ thống; P21 unknown Post linh kiện.
- Ownership của lượt này: **ScanFeedback, ConflictNotice, UnknownState**. Tái sử dụng primitive M00 và consumer đã triển khai; không tạo một bản provider/scroller khác cho board.
- Chỉ bắt đầu sau khi FLOW_GATE và setup motion đủ. Nếu lỗi flow mới xuất hiện, sửa đúng owner và kiểm cạnh liên quan trước; không dùng animation che lỗi, không redesign, không deploy.

## Mapping từng panel

Các duration/easing/reduced fallback theo MOTION_CONTRACT. Thông tin nghiệp vụ hiển thị và guard áp dụng ngay, không chờ duration. Static-by-design vẫn phải kiểm và ghi bằng chứng.

| Panel ID | State tham chiếu | Motion/feedback chính xác |
|---|---|---|
| P17.S01 | Mã không hợp lệ | Mã invalid: viền/text lỗi phản hồi140ms, không chớp đỏ video hoặc rung màn; accepted list giữ nguyên. |
| P17.S02 | Mã không thể xuất | Không thể xuất: reason hiển thị ngay; panel fade nhẹ, không biến scan lại thành retry mutation. |
| P17.S03 | Thẻ đã liên kết | Thẻ đã liên kết: mapping cũ đọc rõ; mở/đóng dùng modal chung, không tự overwrite. |
| P17.S04 | Đang xác minh kết quả gửi | Đang xác minh gửi: text pending và nút resend disabled tức thì; spinner nhỏ khi đang status-check, không countdown tự gửi. |

## Guard, dữ liệu và scroll

Một code invalid, một NFC conflict và một unknown mutation có owner khác; animation không xóa draft hay suy kết quả.

**Virtualization:** Dùng scan list chung nếu có; không virtualize khối lỗi. Chỉ áp quyết định có profile từ M00/owner chung; không thêm lib cho đủ danh sách công nghệ. Giữ seed đã có, không sinh lại fixture để dễ làm hiệu ứng.

Nguồn nghiệp vụ cần đối chiếu của board này: Danh sách nguyên nhân 'có thể' trong ảnh không phải kết luận cho mọi lỗi; chỉ hiển thị dữ liệu nguồn chắc chắn, nếu chưa rõ ghi chưa xác định. Không đưa vấn đề PROPOSED thành requirement mới vì motion.

## Nghiệm thu riêng

1. Bắn cùng lỗi liên tiếp: feedback không chồng, counters/accepted list không tăng.
2. Unknown request chưa rõ: resend luôn guard dù có rapid tap khi transition.
3. NFC conflict đóng/mở lại không thay mapping cũ.

4. Với từng panel: full/auto, OS reduced và off có cùng nội dung, domain result, số operation hợp lệ và quyền. Static geometry sau settle khớp baseline; modeoff vẫn hoàn thành nhiệm vụ. Không replay hàng cũ khi mount/recycle/Back.
5. Kiểm navigation vào/ra, rapid tap, Back, scroll/keyboard/focus và hủy animation giữa chừng ở các action liên quan. Cleanup không giữ listener/RAF/overlay; camera/NFC service không bị nhân đôi vì animation.
6. Nếu chạm shared primitive, xem ownership map và chạy hồi quy trực tiếp các consumer bị tác động. Dùng ảnh actual sau settle và clip/trace thật khi chứng minh chuyển động; không báo60fps từ cảm giác nhìn hoặc screenshot.

## Thực thi và bàn giao

Đọc file liên quan → sửa tối thiểu trong source → chạy kiểm tra trên các state của board → sửa regression → cập nhật tracking. Không dừng ở câu hỏi “có muốn triển khai không?”. Đừng chạy lại mọi ca toàn app sau từng panel; chỉ mở rộng khi phát hiện rủi ro.

Xuất `handoff/motion/M17/REPORT.md`: source/diff/fixture version, files changed, primitives reused, kết quả theo P17.Sxx ở3 mode, operation/scroll/focus evidence, perf delta nếu có, blocker và dependency ảnh hưởng. Cập nhật `MOTION_COVERAGE.csv` và `MOTION_RUN_STATE.json`, không ghi đè trạng thái business integration cũ bằng kết quả animation.

Nếu bị ngắt, lưu phần còn lại và tiếp tục chính MOTION_P17; không tạo prompt triển khai mới. Nếu static là lựa chọn đúng, ghi STATIC_BY_DESIGN kèm testPASS thật, không bịa hiệu ứng để đủ số lượng.
