# MOTION_P08 — Lịch sử

**Thực hiện sửa code và kiểm tra toàn bộ state dưới đây, không chỉ trả kế hoạch.** Đây là lượt bổ sung motion của board P08, giữ nguyên ID/phạm vi bản dựng cũ.

## Đầu vào và ranh giới

- Đọc `MOTION_CONTRACT.md`, contract thiết kế gốc, báo cáo FLOW_GATE và M00; reuse quyết định còn hiệu lực, không đọc lại toàn bộ repo.
- Board baseline: [ảnh tại snapshot đã dùng](https://raw.githubusercontent.com/Duc-Nguyen98/ScannerHNApp/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/01_UPDATED_BOARDS/06_lich_su.png). Ưu tiên ảnh baseline mới hơn đã được người dùng chốt nếu có trace; không tự đổi ảnh.
- Context liên màn: P12 chứng từ; P22 hub/NFC; P23 phiên quét và bảo hành; P18 đính kèm.
- Ownership của lượt này: **ListViewport, TabFeedback, HistoryDetail**. Tái sử dụng primitive M00 và consumer đã triển khai; không tạo một bản provider/scroller khác cho board.
- Chỉ bắt đầu sau khi FLOW_GATE và setup motion đủ. Nếu lỗi flow mới xuất hiện, sửa đúng owner và kiểm cạnh liên quan trước; không dùng animation che lỗi, không redesign, không deploy.

## Mapping từng panel

Các duration/easing/reduced fallback theo MOTION_CONTRACT. Thông tin nghiệp vụ hiển thị và guard áp dụng ngay, không chờ duration. Static-by-design vẫn phải kiểm và ghi bằng chứng.

| Panel ID | State tham chiếu | Motion/feedback chính xác |
|---|---|---|
| P08.S01 | Lịch sử danh sách | Danh sách lịch sử: filter transition140ms, giữ dữ liệu trước khi loading nếu policy cho; không xuất hiện từng hàng kéo dài. |
| P08.S02 | Chi tiết lịch sử | Chi tiết lịch sử: route fade qua shell; bảng label/value giữ nguyên thứ tự. |
| P08.S03 | Phiên quét tham chiếu | Phiên quét: timeline hiện ngay; chỉ highlight event vừa phát sinh trong phiên hiện tại, không replay event cũ khi Back. |
| P08.S04 | Hoạt động theo ngày | Theo ngày: đổi ngày/counter tức thì; fade vùng nội dung, không count-up tổng hoặc cuộn tự động đầu ngày. |

## Guard, dữ liệu và scroll

Một history model dùng chung với P22/P23, không tạo event từ mount/unmount; scan-session khác login-session.

**Virtualization:** Ứng viên virtual cho history/timeline dài; reuse P20/P23 viewport, không nhiều controller trên một scroller. Chỉ áp quyết định có profile từ M00/owner chung; không thêm lib cho đủ danh sách công nghệ. Giữ seed đã có, không sinh lại fixture để dễ làm hiệu ứng.

Nguồn nghiệp vụ cần đối chiếu của board này: Định nghĩa thống kê theo ngày chưa có contract thì chỉ fixture preview/UNKNOWN, không tuyên bố báo cáo nghiệp vụ chính xác. Không đưa vấn đề PROPOSED thành requirement mới vì motion.

## Nghiệm thu riêng

1. Load-more rồi mở detail/Back: số hàng, thứ tự và scroll không nhảy.
2. Thay ngày rồi nhận response cũ: không hiển thị timeline ngày sai.
3. Motion off/on không thêm audit event hoặc nhân đôi số phiên.

4. Với từng panel: full/auto, OS reduced và off có cùng nội dung, domain result, số operation hợp lệ và quyền. Static geometry sau settle khớp baseline; modeoff vẫn hoàn thành nhiệm vụ. Không replay hàng cũ khi mount/recycle/Back.
5. Kiểm navigation vào/ra, rapid tap, Back, scroll/keyboard/focus và hủy animation giữa chừng ở các action liên quan. Cleanup không giữ listener/RAF/overlay; camera/NFC service không bị nhân đôi vì animation.
6. Nếu chạm shared primitive, xem ownership map và chạy hồi quy trực tiếp các consumer bị tác động. Dùng ảnh actual sau settle và clip/trace thật khi chứng minh chuyển động; không báo60fps từ cảm giác nhìn hoặc screenshot.

## Thực thi và bàn giao

Đọc file liên quan → sửa tối thiểu trong source → chạy kiểm tra trên các state của board → sửa regression → cập nhật tracking. Không dừng ở câu hỏi “có muốn triển khai không?”. Đừng chạy lại mọi ca toàn app sau từng panel; chỉ mở rộng khi phát hiện rủi ro.

Xuất `handoff/motion/M08/REPORT.md`: source/diff/fixture version, files changed, primitives reused, kết quả theo P08.Sxx ở3 mode, operation/scroll/focus evidence, perf delta nếu có, blocker và dependency ảnh hưởng. Cập nhật `MOTION_COVERAGE.csv` và `MOTION_RUN_STATE.json`, không ghi đè trạng thái business integration cũ bằng kết quả animation.

Nếu bị ngắt, lưu phần còn lại và tiếp tục chính MOTION_P08; không tạo prompt triển khai mới. Nếu static là lựa chọn đúng, ghi STATIC_BY_DESIGN kèm testPASS thật, không bịa hiệu ứng để đủ số lượng.
