# MOTION_P05 — Xuất kho

**Thực hiện sửa code và kiểm tra toàn bộ state dưới đây, không chỉ trả kế hoạch.** Đây là lượt bổ sung motion của board P05, giữ nguyên ID/phạm vi bản dựng cũ.

## Đầu vào và ranh giới

- Đọc `MOTION_CONTRACT.md`, contract thiết kế gốc, báo cáo FLOW_GATE và M00; reuse quyết định còn hiệu lực, không đọc lại toàn bộ repo.
- Board baseline: [ảnh tại snapshot đã dùng](https://raw.githubusercontent.com/Duc-Nguyen98/ScannerHNApp/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/01_UPDATED_BOARDS/03_xuat_kho.png). Ưu tiên ảnh baseline mới hơn đã được người dùng chốt nếu có trace; không tự đổi ảnh.
- Context liên màn: P03; dữ liệu P06; chứng từ P12; ngoại lệ P17; chờ Web P24.
- Ownership của lượt này: **ScanFeedback, FormFeedback, SubmitFeedback dùng chung P04**. Tái sử dụng primitive M00 và consumer đã triển khai; không tạo một bản provider/scroller khác cho board.
- Chỉ bắt đầu sau khi FLOW_GATE và setup motion đủ. Nếu lỗi flow mới xuất hiện, sửa đúng owner và kiểm cạnh liên quan trước; không dùng animation che lỗi, không redesign, không deploy.

## Mapping từng panel

Các duration/easing/reduced fallback theo MOTION_CONTRACT. Thông tin nghiệp vụ hiển thị và guard áp dụng ngay, không chờ duration. Static-by-design vẫn phải kiểm và ghi bằng chứng.

| Panel ID | State tham chiếu | Motion/feedback chính xác |
|---|---|---|
| P05.S01 | Thông tin phiếu xuất | Thông tin xuất: field interaction nhẹ, không animate dịch chuyển CTA theo focus. |
| P05.S02 | Quét hàng xuất | Quét xuất: highlight accepted item160ms; counter đổi tức thì; không tự cuộn khỏi hàng người dùng đang xem. |
| P05.S03 | Kiểm tra thiếu hàng | Thiếu hàng: notice và số thiếu hiện ngay, fade140ms nếu cần; không shake toàn form hoặc thêm hàng bằng animation. |
| P05.S04 | Đã gửi phiếu xuất — chờ Web | Đã gửi xuất: fade160ms sau record confirmed, giữ amber Chờ xử lý trên Web; không hiệu ứng xanh Đã ghi sổ. |

## Guard, dữ liệu và scroll

State7/10 và thiếu3 không được morph thành10/10 chỉ để mở success. P04/P05 dùng chung scan primitive nhưng tách document/session identity.

**Virtualization:** Chỉ cân nhắc danh sách mã dài dựa trên profile, không virtualize form. Chỉ áp quyết định có profile từ M00/owner chung; không thêm lib cho đủ danh sách công nghệ. Giữ seed đã có, không sinh lại fixture để dễ làm hiệu ứng.

Nguồn nghiệp vụ cần đối chiếu của board này: Nhánh gửi thiếu metadata/thiếu kế hoạch trong DEV_PROPOSAL phải có quyết định riêng; prompt này không tự cấp quyền xuất thiếu. Không đưa vấn đề PROPOSED thành requirement mới vì motion.

## Nghiệm thu riêng

1. Ở7/10, bật animation không làm mất cảnh báo thiếu hoặc cho submit ngoài policy.
2. Tap gửi liên tục rồi Back: một record operation theo contract, không tạo phiếu thứ hai.
3. Chuyển từ scan nhập sang xuất không mang camera callback/accepted codes cũ.

4. Với từng panel: full/auto, OS reduced và off có cùng nội dung, domain result, số operation hợp lệ và quyền. Static geometry sau settle khớp baseline; modeoff vẫn hoàn thành nhiệm vụ. Không replay hàng cũ khi mount/recycle/Back.
5. Kiểm navigation vào/ra, rapid tap, Back, scroll/keyboard/focus và hủy animation giữa chừng ở các action liên quan. Cleanup không giữ listener/RAF/overlay; camera/NFC service không bị nhân đôi vì animation.
6. Nếu chạm shared primitive, xem ownership map và chạy hồi quy trực tiếp các consumer bị tác động. Dùng ảnh actual sau settle và clip/trace thật khi chứng minh chuyển động; không báo60fps từ cảm giác nhìn hoặc screenshot.

## Thực thi và bàn giao

Đọc file liên quan → sửa tối thiểu trong source → chạy kiểm tra trên các state của board → sửa regression → cập nhật tracking. Không dừng ở câu hỏi “có muốn triển khai không?”. Đừng chạy lại mọi ca toàn app sau từng panel; chỉ mở rộng khi phát hiện rủi ro.

Xuất `handoff/motion/M05/REPORT.md`: source/diff/fixture version, files changed, primitives reused, kết quả theo P05.Sxx ở3 mode, operation/scroll/focus evidence, perf delta nếu có, blocker và dependency ảnh hưởng. Cập nhật `MOTION_COVERAGE.csv` và `MOTION_RUN_STATE.json`, không ghi đè trạng thái business integration cũ bằng kết quả animation.

Nếu bị ngắt, lưu phần còn lại và tiếp tục chính MOTION_P05; không tạo prompt triển khai mới. Nếu static là lựa chọn đúng, ghi STATIC_BY_DESIGN kèm testPASS thật, không bịa hiệu ứng để đủ số lượng.
