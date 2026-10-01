# MOTION_P04 — Nhập kho

**Thực hiện sửa code và kiểm tra toàn bộ state dưới đây, không chỉ trả kế hoạch.** Đây là lượt bổ sung motion của board P04, giữ nguyên ID/phạm vi bản dựng cũ.

## Đầu vào và ranh giới

- Đọc `MOTION_CONTRACT.md`, contract thiết kế gốc, báo cáo FLOW_GATE và M00; reuse quyết định còn hiệu lực, không đọc lại toàn bộ repo.
- Board baseline: [ảnh tại snapshot đã dùng](https://raw.githubusercontent.com/Duc-Nguyen98/ScannerHNApp/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/01_UPDATED_BOARDS/02_nhap_kho.png). Ưu tiên ảnh baseline mới hơn đã được người dùng chốt nếu có trace; không tự đổi ảnh.
- Context liên màn: P03 dialog; P06 dữ liệu sản phẩm; P12 chứng từ; P15/P17 lỗi; P24.S03 kết quả chờ Web.
- Ownership của lượt này: **ScanFeedback, FormFeedback, SubmitFeedback**. Tái sử dụng primitive M00 và consumer đã triển khai; không tạo một bản provider/scroller khác cho board.
- Chỉ bắt đầu sau khi FLOW_GATE và setup motion đủ. Nếu lỗi flow mới xuất hiện, sửa đúng owner và kiểm cạnh liên quan trước; không dùng animation che lỗi, không redesign, không deploy.

## Mapping từng panel

Các duration/easing/reduced fallback theo MOTION_CONTRACT. Thông tin nghiệp vụ hiển thị và guard áp dụng ngay, không chờ duration. Static-by-design vẫn phải kiểm và ghi bằng chứng.

| Panel ID | State tham chiếu | Motion/feedback chính xác |
|---|---|---|
| P04.S01 | Thông tin phiếu nhập | Thông tin phiếu: focus/validation fade140ms ở slot lỗi cố định; không chuyển bước khi animation hoàn tất. |
| P04.S02 | Quét hàng nhập | Quét nhập: camera và reticle đứng yên; highlight hàng mới hợp lệ160ms một lần theo event ID. Duplicate/error hiện ngay bằng text/icon, không flash toàn màn. |
| P04.S03 | Kiểm tra phiếu | Kiểm tra: summary render số cuối ngay; list không stagger/reorder khi nhận mã. Chuyển bước dùng route owner. |
| P04.S04 | Đã gửi phiếu nhập — chờ Web | Đã gửi phiếu: confirmation fade160ms chỉ sau record response hoặc mock response xác định; nhãn Chờ xử lý trên Web giữ đúng. |

## Guard, dữ liệu và scroll

Camera stream có một owner; scan feedback không remount video hoặc mở thêm reader. Số lượt/số mã/SKU/quantity giữ nghĩa riêng; record không Post/tăng tồn.

**Virtualization:** Chỉ đo accepted-list khi dài; nếu cần dùng primitive virtual dùng chung, giữ anchor lúc thêm mã. Chỉ áp quyết định có profile từ M00/owner chung; không thêm lib cho đủ danh sách công nghệ. Giữ seed đã có, không sinh lại fixture để dễ làm hiệu ứng.

Nguồn nghiệp vụ cần đối chiếu của board này: Không tự hứa hệ thống sẽ gửi thông báo khi được phê duyệt; bỏ lời hứa cũ nếu chưa có nguồn hiện hành chứng minh. Không đưa vấn đề PROPOSED thành requirement mới vì motion.

## Nghiệm thu riêng

1. Quét chuỗi12 lượt có1 trùng: count11 hợp lệ vẫn đúng với motion on/off.
2. Rời scan khi callback pending: không thêm hàng vào phiếu khác.
3. Timeout gửi: không chạy success animation và không mở nút resend trái policy.

4. Với từng panel: full/auto, OS reduced và off có cùng nội dung, domain result, số operation hợp lệ và quyền. Static geometry sau settle khớp baseline; modeoff vẫn hoàn thành nhiệm vụ. Không replay hàng cũ khi mount/recycle/Back.
5. Kiểm navigation vào/ra, rapid tap, Back, scroll/keyboard/focus và hủy animation giữa chừng ở các action liên quan. Cleanup không giữ listener/RAF/overlay; camera/NFC service không bị nhân đôi vì animation.
6. Nếu chạm shared primitive, xem ownership map và chạy hồi quy trực tiếp các consumer bị tác động. Dùng ảnh actual sau settle và clip/trace thật khi chứng minh chuyển động; không báo60fps từ cảm giác nhìn hoặc screenshot.

## Thực thi và bàn giao

Đọc file liên quan → sửa tối thiểu trong source → chạy kiểm tra trên các state của board → sửa regression → cập nhật tracking. Không dừng ở câu hỏi “có muốn triển khai không?”. Đừng chạy lại mọi ca toàn app sau từng panel; chỉ mở rộng khi phát hiện rủi ro.

Xuất `handoff/motion/M04/REPORT.md`: source/diff/fixture version, files changed, primitives reused, kết quả theo P04.Sxx ở3 mode, operation/scroll/focus evidence, perf delta nếu có, blocker và dependency ảnh hưởng. Cập nhật `MOTION_COVERAGE.csv` và `MOTION_RUN_STATE.json`, không ghi đè trạng thái business integration cũ bằng kết quả animation.

Nếu bị ngắt, lưu phần còn lại và tiếp tục chính MOTION_P04; không tạo prompt triển khai mới. Nếu static là lựa chọn đúng, ghi STATIC_BY_DESIGN kèm testPASS thật, không bịa hiệu ứng để đủ số lượng.
