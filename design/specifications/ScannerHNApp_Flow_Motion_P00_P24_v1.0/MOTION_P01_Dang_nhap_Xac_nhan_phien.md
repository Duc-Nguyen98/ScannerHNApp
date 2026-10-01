# MOTION_P01 — Đăng nhập & Xác nhận phiên

**Thực hiện sửa code và kiểm tra toàn bộ state dưới đây, không chỉ trả kế hoạch.** Đây là lượt bổ sung motion của board P01, giữ nguyên ID/phạm vi bản dựng cũ.

## Đầu vào và ranh giới

- Đọc `MOTION_CONTRACT.md`, contract thiết kế gốc, báo cáo FLOW_GATE và M00; reuse quyết định còn hiệu lực, không đọc lại toàn bộ repo.
- Board baseline: [ảnh tại snapshot đã dùng](https://raw.githubusercontent.com/Duc-Nguyen98/ScannerHNApp/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/00_LOCKED_ORIGINALS/01_Dang_nhap_va_Xac_nhan_phien_ORIGINAL.jpg). Ưu tiên ảnh baseline mới hơn đã được người dùng chốt nếu có trace; không tự đổi ảnh.
- Context liên màn: Nền tảng xác thực/source auth hiện có; liên kết quên mật khẩu sang P14, thành công sang P02. Không đợi P14 mới dựng form đăng nhập.
- Ownership của lượt này: **FormFeedback, SubmitFeedback; AppShell xử lý route transition**. Tái sử dụng primitive M00 và consumer đã triển khai; không tạo một bản provider/scroller khác cho board.
- Chỉ bắt đầu sau khi FLOW_GATE và setup motion đủ. Nếu lỗi flow mới xuất hiện, sửa đúng owner và kiểm cạnh liên quan trước; không dùng animation che lỗi, không redesign, không deploy.

## Mapping từng panel

Các duration/easing/reduced fallback theo MOTION_CONTRACT. Thông tin nghiệp vụ hiển thị và guard áp dụng ngay, không chờ duration. Static-by-design vẫn phải kiểm và ghi bằng chứng.

| Panel ID | State tham chiếu | Motion/feedback chính xác |
|---|---|---|
| P01.S01 | Đăng nhập | Form xuất hiện tức thì ở layout khóa; focus ring/pressed 100ms. Chuyển submitting bằng fade 140ms trong slot CTA cố định; mắt mật khẩu không animate hoặc remount input. |
| P01.S02 | Xác nhận phiên làm việc | Card danh tính giữ nguyên vị trí; phản hồi Bắt đầu ca/Đăng xuất theo state thật. Không parallax hero, không trượt ảnh; route fade do shell, không fade card lần hai. |

## Guard, dữ liệu và scroll

Mật khẩu, selection, focus và dữ liệu phiên không mất khi đổi trạng thái; animation không gọi auth/start-shift.

**Virtualization:** Không cần virtualization. Chỉ áp quyết định có profile từ M00/owner chung; không thêm lib cho đủ danh sách công nghệ. Giữ seed đã có, không sinh lại fixture để dễ làm hiệu ứng.

Nguồn nghiệp vụ cần đối chiếu của board này: Không suy cơ chế tạo ca làm việc từ nhãn Bắt đầu ca. Nếu auth/session khác nguồn đã khóa, ghi rõ khác biệt và chỉ hỏi quyết định thực sự cần. Không đưa vấn đề PROPOSED thành requirement mới vì motion.

## Nghiệm thu riêng

1. Gõ mật khẩu rồi đổi visibility/submitting: giá trị và focus giữ nguyên.
2. Nhấn login hai lần khi pending: không tăng request vì motion; lỗi không mở Home.
3. Thoát route giữa request rồi quay lại: callback animation cũ không thay phiên.

4. Với từng panel: full/auto, OS reduced và off có cùng nội dung, domain result, số operation hợp lệ và quyền. Static geometry sau settle khớp baseline; modeoff vẫn hoàn thành nhiệm vụ. Không replay hàng cũ khi mount/recycle/Back.
5. Kiểm navigation vào/ra, rapid tap, Back, scroll/keyboard/focus và hủy animation giữa chừng ở các action liên quan. Cleanup không giữ listener/RAF/overlay; camera/NFC service không bị nhân đôi vì animation.
6. Nếu chạm shared primitive, xem ownership map và chạy hồi quy trực tiếp các consumer bị tác động. Dùng ảnh actual sau settle và clip/trace thật khi chứng minh chuyển động; không báo60fps từ cảm giác nhìn hoặc screenshot.

## Thực thi và bàn giao

Đọc file liên quan → sửa tối thiểu trong source → chạy kiểm tra trên các state của board → sửa regression → cập nhật tracking. Không dừng ở câu hỏi “có muốn triển khai không?”. Đừng chạy lại mọi ca toàn app sau từng panel; chỉ mở rộng khi phát hiện rủi ro.

Xuất `handoff/motion/M01/REPORT.md`: source/diff/fixture version, files changed, primitives reused, kết quả theo P01.Sxx ở3 mode, operation/scroll/focus evidence, perf delta nếu có, blocker và dependency ảnh hưởng. Cập nhật `MOTION_COVERAGE.csv` và `MOTION_RUN_STATE.json`, không ghi đè trạng thái business integration cũ bằng kết quả animation.

Nếu bị ngắt, lưu phần còn lại và tiếp tục chính MOTION_P01; không tạo prompt triển khai mới. Nếu static là lựa chọn đúng, ghi STATIC_BY_DESIGN kèm testPASS thật, không bịa hiệu ứng để đủ số lượng.
