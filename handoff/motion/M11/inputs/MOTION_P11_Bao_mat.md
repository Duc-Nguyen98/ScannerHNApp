# MOTION_P11 — Bảo mật

**Thực hiện sửa code và kiểm tra toàn bộ state dưới đây, không chỉ trả kế hoạch.** Đây là lượt bổ sung motion của board P11, giữ nguyên ID/phạm vi bản dựng cũ.

## Đầu vào và ranh giới

- Đọc `MOTION_CONTRACT.md`, contract thiết kế gốc, báo cáo FLOW_GATE và M00; reuse quyết định còn hiệu lực, không đọc lại toàn bộ repo.
- Board baseline: [ảnh tại snapshot đã dùng](https://raw.githubusercontent.com/Duc-Nguyen98/ScannerHNApp/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/01_UPDATED_BOARDS/09_bao_mat.png). Ưu tiên ảnh baseline mới hơn đã được người dùng chốt nếu có trace; không tự đổi ảnh.
- Context liên màn: P10 trang tài khoản; P01 auth; P15 phiên hết hạn.
- Ownership của lượt này: **SecureFormFeedback, SettingsRows**. Tái sử dụng primitive M00 và consumer đã triển khai; không tạo một bản provider/scroller khác cho board.
- Chỉ bắt đầu sau khi FLOW_GATE và setup motion đủ. Nếu lỗi flow mới xuất hiện, sửa đúng owner và kiểm cạnh liên quan trước; không dùng animation che lỗi, không redesign, không deploy.

## Mapping từng panel

Các duration/easing/reduced fallback theo MOTION_CONTRACT. Thông tin nghiệp vụ hiển thị và guard áp dụng ngay, không chờ duration. Static-by-design vẫn phải kiểm và ghi bằng chứng.

| Panel ID | State tham chiếu | Motion/feedback chính xác |
|---|---|---|
| P11.S01 | Đổi mật khẩu | Đổi mật khẩu: focus/error feedback nhẹ; input password không remount khi toggle visibility. |
| P11.S02 | Xác thực thông tin — lỗi | Thông tin sai: lỗi hiện ngay có text, không shake input hoặc tự xóa mật khẩu. |
| P11.S03 | Đã đổi mật khẩu | Đã đổi: icon fade160ms chỉ sau response; không dùng timeout animation để coi đổi thành công. |
| P11.S04 | Phiên đăng nhập | Phiên đăng nhập: list giữ session ID; removal phản ánh revoke confirmed nếu có contract; exit không tự revoke. |

## Guard, dữ liệu và scroll

Không log/capture mật khẩu; preview dùng fixture riêng. Reduced mode không bỏ lỗi và focus semantics.

**Virtualization:** Không virtualize danh sách phiên nhỏ; kiểm bằng dữ liệu thực tế trước quyết định. Chỉ áp quyết định có profile từ M00/owner chung; không thêm lib cho đủ danh sách công nghệ. Giữ seed đã có, không sinh lại fixture để dễ làm hiệu ứng.

Nguồn nghiệp vụ cần đối chiếu của board này: Chỉ dựng/test tính năng bằng tài khoản fixture/test được cấp; prompt không yêu cầu agent đổi mật khẩu tài khoản cá nhân thật của người dùng. Không đưa vấn đề PROPOSED thành requirement mới vì motion.

## Nghiệm thu riêng

1. Mismatch/validation xuất hiện giống nhau ở full/reduced/off.
2. Double-submit và navigate-away không đổi tài khoản thêm lần nữa.
3. Đổi visibility giữ focus; revoke lỗi không làm mất phiên khỏi nguồn dữ liệu.

4. Với từng panel: full/auto, OS reduced và off có cùng nội dung, domain result, số operation hợp lệ và quyền. Static geometry sau settle khớp baseline; modeoff vẫn hoàn thành nhiệm vụ. Không replay hàng cũ khi mount/recycle/Back.
5. Kiểm navigation vào/ra, rapid tap, Back, scroll/keyboard/focus và hủy animation giữa chừng ở các action liên quan. Cleanup không giữ listener/RAF/overlay; camera/NFC service không bị nhân đôi vì animation.
6. Nếu chạm shared primitive, xem ownership map và chạy hồi quy trực tiếp các consumer bị tác động. Dùng ảnh actual sau settle và clip/trace thật khi chứng minh chuyển động; không báo60fps từ cảm giác nhìn hoặc screenshot.

## Thực thi và bàn giao

Đọc file liên quan → sửa tối thiểu trong source → chạy kiểm tra trên các state của board → sửa regression → cập nhật tracking. Không dừng ở câu hỏi “có muốn triển khai không?”. Đừng chạy lại mọi ca toàn app sau từng panel; chỉ mở rộng khi phát hiện rủi ro.

Xuất `handoff/motion/M11/REPORT.md`: source/diff/fixture version, files changed, primitives reused, kết quả theo P11.Sxx ở3 mode, operation/scroll/focus evidence, perf delta nếu có, blocker và dependency ảnh hưởng. Cập nhật `MOTION_COVERAGE.csv` và `MOTION_RUN_STATE.json`, không ghi đè trạng thái business integration cũ bằng kết quả animation.

Nếu bị ngắt, lưu phần còn lại và tiếp tục chính MOTION_P11; không tạo prompt triển khai mới. Nếu static là lựa chọn đúng, ghi STATIC_BY_DESIGN kèm testPASS thật, không bịa hiệu ứng để đủ số lượng.
