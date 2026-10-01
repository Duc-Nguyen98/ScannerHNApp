# MOTION_P15 — Hệ thống

**Thực hiện sửa code và kiểm tra toàn bộ state dưới đây, không chỉ trả kế hoạch.** Đây là lượt bổ sung motion của board P15, giữ nguyên ID/phạm vi bản dựng cũ.

## Đầu vào và ranh giới

- Đọc `MOTION_CONTRACT.md`, contract thiết kế gốc, báo cáo FLOW_GATE và M00; reuse quyết định còn hiệu lực, không đọc lại toàn bộ repo.
- Board baseline: [ảnh tại snapshot đã dùng](https://raw.githubusercontent.com/Duc-Nguyen98/ScannerHNApp/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/02_NEW_BOARDS/13_he_thong_fixed.png). Ưu tiên ảnh baseline mới hơn đã được người dùng chốt nếu có trace; không tự đổi ảnh.
- Context liên màn: P01 auth; P03 modal; caller nhập/xuất/NFC; P17 trạng thái gửi chưa xác định.
- Ownership của lượt này: **SystemNotice, BlockingGuard, DeviceFeedback**. Tái sử dụng primitive M00 và consumer đã triển khai; không tạo một bản provider/scroller khác cho board.
- Chỉ bắt đầu sau khi FLOW_GATE và setup motion đủ. Nếu lỗi flow mới xuất hiện, sửa đúng owner và kiểm cạnh liên quan trước; không dùng animation che lỗi, không redesign, không deploy.

## Mapping từng panel

Các duration/easing/reduced fallback theo MOTION_CONTRACT. Thông tin nghiệp vụ hiển thị và guard áp dụng ngay, không chờ duration. Static-by-design vẫn phải kiểm và ghi bằng chứng.

| Panel ID | State tham chiếu | Motion/feedback chính xác |
|---|---|---|
| P15.S01 | Mất kết nối mạng | Mất mạng: banner text/icon hiện ngay, fade140ms không shift vùng camera/CTA; online trở lại không tự resend mutation. |
| P15.S02 | Phiên đăng nhập hết hạn | Hết phiên: che hoặc unmount nội dung nhạy cảm ngay, bỏ exit delay; login route không animate snapshot thông tin cũ. |
| P15.S03 | Không có quyền | Không quyền: guard tức thì, notice chỉ fade; không cho xem route cũ suốt exit. |
| P15.S04 | Quyền thiết bị Camera & NFC | Quyền thiết bị: hướng dẫn tĩnh, pressed feedback; không mở permission dialog tự động mỗi lần mount/animation. |

## Guard, dữ liệu và scroll

Security/session transitions ưu tiên tức thì hơn độ mượt. Auth loss không để outgoing subtree còn focus/pointer hoặc nội dung nhạy cảm trên màn.

**Virtualization:** Không cần. Chỉ áp quyết định có profile từ M00/owner chung; không thêm lib cho đủ danh sách công nghệ. Giữ seed đã có, không sinh lại fixture để dễ làm hiệu ứng.

Nguồn nghiệp vụ cần đối chiếu của board này: Không cam kết mọi platform hỗ trợ camera/NFC giống nhau; đánh dấu phần test thiết bị thật chưa chạy, không suy từ render. Không đưa vấn đề PROPOSED thành requirement mới vì motion.

## Nghiệm thu riêng

1. Hết phiên giữa route transition: không còn dữ liệu nhạy cảm/CTA active.
2. Offline→online không gửi lại phiếu chưa rõ kết quả.
3. Deny camera rồi điều hướng10 lần không spam permission request/listener.

4. Với từng panel: full/auto, OS reduced và off có cùng nội dung, domain result, số operation hợp lệ và quyền. Static geometry sau settle khớp baseline; modeoff vẫn hoàn thành nhiệm vụ. Không replay hàng cũ khi mount/recycle/Back.
5. Kiểm navigation vào/ra, rapid tap, Back, scroll/keyboard/focus và hủy animation giữa chừng ở các action liên quan. Cleanup không giữ listener/RAF/overlay; camera/NFC service không bị nhân đôi vì animation.
6. Nếu chạm shared primitive, xem ownership map và chạy hồi quy trực tiếp các consumer bị tác động. Dùng ảnh actual sau settle và clip/trace thật khi chứng minh chuyển động; không báo60fps từ cảm giác nhìn hoặc screenshot.

## Thực thi và bàn giao

Đọc file liên quan → sửa tối thiểu trong source → chạy kiểm tra trên các state của board → sửa regression → cập nhật tracking. Không dừng ở câu hỏi “có muốn triển khai không?”. Đừng chạy lại mọi ca toàn app sau từng panel; chỉ mở rộng khi phát hiện rủi ro.

Xuất `handoff/motion/M15/REPORT.md`: source/diff/fixture version, files changed, primitives reused, kết quả theo P15.Sxx ở3 mode, operation/scroll/focus evidence, perf delta nếu có, blocker và dependency ảnh hưởng. Cập nhật `MOTION_COVERAGE.csv` và `MOTION_RUN_STATE.json`, không ghi đè trạng thái business integration cũ bằng kết quả animation.

Nếu bị ngắt, lưu phần còn lại và tiếp tục chính MOTION_P15; không tạo prompt triển khai mới. Nếu static là lựa chọn đúng, ghi STATIC_BY_DESIGN kèm testPASS thật, không bịa hiệu ứng để đủ số lượng.
