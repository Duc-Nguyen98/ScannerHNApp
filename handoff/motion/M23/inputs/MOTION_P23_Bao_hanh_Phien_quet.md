# MOTION_P23 — 21 · Bảo hành & phiên quét

**Thực hiện sửa code và kiểm tra toàn bộ state dưới đây, không chỉ trả kế hoạch.** Đây là lượt bổ sung motion của board P23, giữ nguyên ID/phạm vi bản dựng cũ.

## Đầu vào và ranh giới

- Đọc `MOTION_CONTRACT.md`, contract thiết kế gốc, báo cáo FLOW_GATE và M00; reuse quyết định còn hiệu lực, không đọc lại toàn bộ repo.
- Board baseline: [ảnh tại snapshot đã dùng](https://raw.githubusercontent.com/Duc-Nguyen98/ScannerHNApp/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/02_NEW_BOARDS/21_lich_su_bao_hanh_phien_quet.png). Ưu tiên ảnh baseline mới hơn đã được người dùng chốt nếu có trace; không tự đổi ảnh.
- Context liên màn: P09 case; P20 linh kiện POSTED; P22 hub; P08 legacy session panel; P24 closed/waiting.
- Ownership của lượt này: **WarrantyTimeline, ScanSessionHistory**. Tái sử dụng primitive M00 và consumer đã triển khai; không tạo một bản provider/scroller khác cho board.
- Chỉ bắt đầu sau khi FLOW_GATE và setup motion đủ. Nếu lỗi flow mới xuất hiện, sửa đúng owner và kiểm cạnh liên quan trước; không dùng animation che lỗi, không redesign, không deploy.

## Mapping từng panel

Các duration/easing/reduced fallback theo MOTION_CONTRACT. Thông tin nghiệp vụ hiển thị và guard áp dụng ngay, không chờ duration. Static-by-design vẫn phải kiểm và ghi bằng chứng.

| Panel ID | State tham chiếu | Motion/feedback chính xác |
|---|---|---|
| P23.S01 | Lịch sử bảo hành — warranty | Warranty history: filter/selected feedback, list không reorder tự động vì animation. |
| P23.S02 | Quá trình xử lý hồ sơ — warranty-detail | Timeline case: toàn bộ thông tin đọc được ngay; không vẽ đường timeline chạy dài hoặc lần lượt bật event lịch sử. |
| P23.S03 | Lịch sử phiên quét — sessions | Scan sessions: native scroll, load-more giữanchor; số lượt/thành công/lỗi hiển thị ngay. |
| P23.S04 | Chi tiết phiên quét — session-detail | Session detail: giữ filter/ID/offset; chỉ feedback selection nhỏ, không replay từng mã khi vào lại. |

## Guard, dữ liệu và scroll

Scan session ID từ model, không gom timestamp để bịa phiên; case closed vẫn xem lịch sử theo quyền, không lộ action ghi trong exit tree.

**Virtualization:** Ứng viên virtual timeline/session-code list dài; giữ semantics/focus và không animate height hàng đo. Chỉ áp quyết định có profile từ M00/owner chung; không thêm lib cho đủ danh sách công nghệ. Giữ seed đã có, không sinh lại fixture để dễ làm hiệu ứng.

Nguồn nghiệp vụ cần đối chiếu của board này: Source prototype có fallback fixture phục vụ demo; production phải xác minh ID/data và không dùng fallback đó để che missing entity. Không đưa vấn đề PROPOSED thành requirement mới vì motion.

## Nghiệm thu riêng

1. ID không tồn tại ra notfound hiện hành, không fallback phiên đầu.
2. List→detail→Back giữ anchor kể cả dataset đã append.
3. Timeline không thay thứ tự hoặc tạo event khi bật/tắt animation.

4. Với từng panel: full/auto, OS reduced và off có cùng nội dung, domain result, số operation hợp lệ và quyền. Static geometry sau settle khớp baseline; modeoff vẫn hoàn thành nhiệm vụ. Không replay hàng cũ khi mount/recycle/Back.
5. Kiểm navigation vào/ra, rapid tap, Back, scroll/keyboard/focus và hủy animation giữa chừng ở các action liên quan. Cleanup không giữ listener/RAF/overlay; camera/NFC service không bị nhân đôi vì animation.
6. Nếu chạm shared primitive, xem ownership map và chạy hồi quy trực tiếp các consumer bị tác động. Dùng ảnh actual sau settle và clip/trace thật khi chứng minh chuyển động; không báo60fps từ cảm giác nhìn hoặc screenshot.

## Thực thi và bàn giao

Đọc file liên quan → sửa tối thiểu trong source → chạy kiểm tra trên các state của board → sửa regression → cập nhật tracking. Không dừng ở câu hỏi “có muốn triển khai không?”. Đừng chạy lại mọi ca toàn app sau từng panel; chỉ mở rộng khi phát hiện rủi ro.

Xuất `handoff/motion/M23/REPORT.md`: source/diff/fixture version, files changed, primitives reused, kết quả theo P23.Sxx ở3 mode, operation/scroll/focus evidence, perf delta nếu có, blocker và dependency ảnh hưởng. Cập nhật `MOTION_COVERAGE.csv` và `MOTION_RUN_STATE.json`, không ghi đè trạng thái business integration cũ bằng kết quả animation.

Nếu bị ngắt, lưu phần còn lại và tiếp tục chính MOTION_P23; không tạo prompt triển khai mới. Nếu static là lựa chọn đúng, ghi STATIC_BY_DESIGN kèm testPASS thật, không bịa hiệu ứng để đủ số lượng.
