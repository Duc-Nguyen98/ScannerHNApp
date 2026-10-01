# MOTION_P09 — Bảo hành

**Thực hiện sửa code và kiểm tra toàn bộ state dưới đây, không chỉ trả kế hoạch.** Đây là lượt bổ sung motion của board P09, giữ nguyên ID/phạm vi bản dựng cũ.

## Đầu vào và ranh giới

- Đọc `MOTION_CONTRACT.md`, contract thiết kế gốc, báo cáo FLOW_GATE và M00; reuse quyết định còn hiệu lực, không đọc lại toàn bộ repo.
- Board baseline: [ảnh tại snapshot đã dùng](https://raw.githubusercontent.com/Duc-Nguyen98/ScannerHNApp/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/01_UPDATED_BOARDS/07_bao_hanh.png). Ưu tiên ảnh baseline mới hơn đã được người dùng chốt nếu có trace; không tự đổi ảnh.
- Context liên màn: P06 sản phẩm; P18 bàn giao; P19 xuất linh kiện; P20 lịch sử linh kiện; P23 timeline; P24 hồ sơ đóng.
- Ownership của lượt này: **CaseTabs, FormFeedback, ScanFeedback**. Tái sử dụng primitive M00 và consumer đã triển khai; không tạo một bản provider/scroller khác cho board.
- Chỉ bắt đầu sau khi FLOW_GATE và setup motion đủ. Nếu lỗi flow mới xuất hiện, sửa đúng owner và kiểm cạnh liên quan trước; không dùng animation che lỗi, không redesign, không deploy.

## Mapping từng panel

Các duration/easing/reduced fallback theo MOTION_CONTRACT. Thông tin nghiệp vụ hiển thị và guard áp dụng ngay, không chờ duration. Static-by-design vẫn phải kiểm và ghi bằng chứng.

| Panel ID | State tham chiếu | Motion/feedback chính xác |
|---|---|---|
| P09.S01 | Bảo hành danh sách | Danh sách case: tap feedback và filter fade; không làm rung card trạng thái. |
| P09.S02 | Tiếp nhận bảo hành | Tiếp nhận: vùng camera đứng yên; error slot fade, checkbox/toggle phản hồi nhanh; giữ form khi bàn phím mở. |
| P09.S03 | Hồ sơ bảo hành | Hồ sơ: tab indicator140ms, giữ context case và scroll riêng mỗi tab; không crossfade hai bộ CTA cùng active. |
| P09.S04 | Kết quả sửa chữa | Kết quả sửa chữa: success fade160ms sau update; nhãn Chờ bàn giao không animate thành Đã trả khách. |

## Guard, dữ liệu và scroll

Kết quả sửa chữa, Post linh kiện và bàn giao là ba action riêng. Case closed chặn ghi ngay, không đợi animation cũ kết thúc.

**Virtualization:** List case/timeline dài có thể dùng viewport chung; form và nhóm linh kiện ngắn giữ native. Chỉ áp quyết định có profile từ M00/owner chung; không thêm lib cho đủ danh sách công nghệ. Giữ seed đã có, không sinh lại fixture để dễ làm hiệu ứng.

Nguồn nghiệp vụ cần đối chiếu của board này: Nguồn cũ có số linh kiện đã sử dụng2, bộ mới ví dụ2 mã/3 linh kiện; không trộn hai fixture rồi báo dữ liệu mâu thuẫn production. Không đưa vấn đề PROPOSED thành requirement mới vì motion.

## Nghiệm thu riêng

1. Đổi Thông tin→Linh kiện→Lịch sử nhanh vẫn cùng case.
2. Nhận closed update trong lúc sheet xuất mở: chặn mutation trước mọi transition.
3. Intake failure giữ serial/ghi chú và focus; không reset form do key animation.

4. Với từng panel: full/auto, OS reduced và off có cùng nội dung, domain result, số operation hợp lệ và quyền. Static geometry sau settle khớp baseline; modeoff vẫn hoàn thành nhiệm vụ. Không replay hàng cũ khi mount/recycle/Back.
5. Kiểm navigation vào/ra, rapid tap, Back, scroll/keyboard/focus và hủy animation giữa chừng ở các action liên quan. Cleanup không giữ listener/RAF/overlay; camera/NFC service không bị nhân đôi vì animation.
6. Nếu chạm shared primitive, xem ownership map và chạy hồi quy trực tiếp các consumer bị tác động. Dùng ảnh actual sau settle và clip/trace thật khi chứng minh chuyển động; không báo60fps từ cảm giác nhìn hoặc screenshot.

## Thực thi và bàn giao

Đọc file liên quan → sửa tối thiểu trong source → chạy kiểm tra trên các state của board → sửa regression → cập nhật tracking. Không dừng ở câu hỏi “có muốn triển khai không?”. Đừng chạy lại mọi ca toàn app sau từng panel; chỉ mở rộng khi phát hiện rủi ro.

Xuất `handoff/motion/M09/REPORT.md`: source/diff/fixture version, files changed, primitives reused, kết quả theo P09.Sxx ở3 mode, operation/scroll/focus evidence, perf delta nếu có, blocker và dependency ảnh hưởng. Cập nhật `MOTION_COVERAGE.csv` và `MOTION_RUN_STATE.json`, không ghi đè trạng thái business integration cũ bằng kết quả animation.

Nếu bị ngắt, lưu phần còn lại và tiếp tục chính MOTION_P09; không tạo prompt triển khai mới. Nếu static là lựa chọn đúng, ghi STATIC_BY_DESIGN kèm testPASS thật, không bịa hiệu ứng để đủ số lượng.
