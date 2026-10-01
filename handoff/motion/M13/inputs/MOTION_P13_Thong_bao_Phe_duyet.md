# MOTION_P13 — Thông báo phê duyệt

**Thực hiện sửa code và kiểm tra toàn bộ state dưới đây, không chỉ trả kế hoạch.** Đây là lượt bổ sung motion của board P13, giữ nguyên ID/phạm vi bản dựng cũ.

## Đầu vào và ranh giới

- Đọc `MOTION_CONTRACT.md`, contract thiết kế gốc, báo cáo FLOW_GATE và M00; reuse quyết định còn hiệu lực, không đọc lại toàn bộ repo.
- Board baseline: [ảnh tại snapshot đã dùng](https://raw.githubusercontent.com/Duc-Nguyen98/ScannerHNApp/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/02_NEW_BOARDS/11_thong_bao_phe_duyet.png). Ưu tiên ảnh baseline mới hơn đã được người dùng chốt nếu có trace; không tự đổi ảnh.
- Context liên màn: Chuông P02; chi tiết chứng từ P12; P24 chờ Web; nguồn notifications hiện có.
- Ownership của lượt này: **NotificationFeedback, DocumentList tái sử dụng**. Tái sử dụng primitive M00 và consumer đã triển khai; không tạo một bản provider/scroller khác cho board.
- Chỉ bắt đầu sau khi FLOW_GATE và setup motion đủ. Nếu lỗi flow mới xuất hiện, sửa đúng owner và kiểm cạnh liên quan trước; không dùng animation che lỗi, không redesign, không deploy.

## Mapping từng panel

Các duration/easing/reduced fallback theo MOTION_CONTRACT. Thông tin nghiệp vụ hiển thị và guard áp dụng ngay, không chờ duration. Static-by-design vẫn phải kiểm và ghi bằng chứng.

| Panel ID | State tham chiếu | Motion/feedback chính xác |
|---|---|---|
| P13.S01 | Danh sách thông báo | Thông báo: unread dot cập nhật theo nguồn; fade140ms vùng list, không bay badge về chuông. |
| P13.S02 | Chi tiết thông báo | Chi tiết: route fade qua shell, giữ document ID; mark-read không gắn onAnimationComplete. |
| P13.S03 | Danh sách chờ phê duyệt cũ → theo dõi phiếu chờ Web | Panel chờ duyệt cũ: giữ disposition MIGRATED; chỉ fade danh sách theo dõi chờ Web hiện hành. |
| P13.S04 | Duyệt chứng từ cũ → chi tiết chờ xử lý Web | Panel duyệt cũ: fade phần trạng thái chờ Web; tuyệt đối không tạo nút approval đẹp hơn để khôi phục chức năng cũ. |

## Guard, dữ liệu và scroll

MIGRATED phải giữ trong coverage; không dựa screenshot cũ để tạo approve/reject handler. Không tự gửi push notification.

**Virtualization:** List notification dài mới profile; đọc/đánh dấu dựa ID dữ liệu, không dựa row mount. Chỉ áp quyết định có profile từ M00/owner chung; không thêm lib cho đủ danh sách công nghệ. Giữ seed đã có, không sinh lại fixture để dễ làm hiệu ứng.

Nguồn nghiệp vụ cần đối chiếu của board này: Không được tuyên bố pixel-perfect với panel Duyệt cũ sau khi loại action. Nghiệm thu riêng phần được giữ và phần chuyển đổi theo chốt mới. Không đưa vấn đề PROPOSED thành requirement mới vì motion.

## Nghiệm thu riêng

1. Không có route/handler approve/reject/Post nhập/xuất cả khi motion off.
2. Mark-read error không làm mất thông báo hoặc badge sai nguồn.
3. Mở link phiếu từ thông báo vẫn kiểm quyền, không bị lớp exit cũ che.

4. Với từng panel: full/auto, OS reduced và off có cùng nội dung, domain result, số operation hợp lệ và quyền. Static geometry sau settle khớp baseline; modeoff vẫn hoàn thành nhiệm vụ. Không replay hàng cũ khi mount/recycle/Back.
5. Kiểm navigation vào/ra, rapid tap, Back, scroll/keyboard/focus và hủy animation giữa chừng ở các action liên quan. Cleanup không giữ listener/RAF/overlay; camera/NFC service không bị nhân đôi vì animation.
6. Nếu chạm shared primitive, xem ownership map và chạy hồi quy trực tiếp các consumer bị tác động. Dùng ảnh actual sau settle và clip/trace thật khi chứng minh chuyển động; không báo60fps từ cảm giác nhìn hoặc screenshot.

## Thực thi và bàn giao

Đọc file liên quan → sửa tối thiểu trong source → chạy kiểm tra trên các state của board → sửa regression → cập nhật tracking. Không dừng ở câu hỏi “có muốn triển khai không?”. Đừng chạy lại mọi ca toàn app sau từng panel; chỉ mở rộng khi phát hiện rủi ro.

Xuất `handoff/motion/M13/REPORT.md`: source/diff/fixture version, files changed, primitives reused, kết quả theo P13.Sxx ở3 mode, operation/scroll/focus evidence, perf delta nếu có, blocker và dependency ảnh hưởng. Cập nhật `MOTION_COVERAGE.csv` và `MOTION_RUN_STATE.json`, không ghi đè trạng thái business integration cũ bằng kết quả animation.

Nếu bị ngắt, lưu phần còn lại và tiếp tục chính MOTION_P13; không tạo prompt triển khai mới. Nếu static là lựa chọn đúng, ghi STATIC_BY_DESIGN kèm testPASS thật, không bịa hiệu ứng để đủ số lượng.
