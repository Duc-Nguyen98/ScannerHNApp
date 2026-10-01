# MOTION_P16 — Dữ liệu quyết lỗi

**Thực hiện sửa code và kiểm tra toàn bộ state dưới đây, không chỉ trả kế hoạch.** Đây là lượt bổ sung motion của board P16, giữ nguyên ID/phạm vi bản dựng cũ.

## Đầu vào và ranh giới

- Đọc `MOTION_CONTRACT.md`, contract thiết kế gốc, báo cáo FLOW_GATE và M00; reuse quyết định còn hiệu lực, không đọc lại toàn bộ repo.
- Board baseline: [ảnh tại snapshot đã dùng](https://raw.githubusercontent.com/Duc-Nguyen98/ScannerHNApp/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/02_NEW_BOARDS/14_du_lieu_quyet_loi_fixed.png). Ưu tiên ảnh baseline mới hơn đã được người dùng chốt nếu có trace; không tự đổi ảnh.
- Context liên màn: P12 danh sách chứng từ; dùng pattern cho list khác khi không đổi baseline; P15 lỗi auth/network đặc thù.
- Ownership của lượt này: **DataState, Skeleton, EmptyState, InlineError**. Tái sử dụng primitive M00 và consumer đã triển khai; không tạo một bản provider/scroller khác cho board.
- Chỉ bắt đầu sau khi FLOW_GATE và setup motion đủ. Nếu lỗi flow mới xuất hiện, sửa đúng owner và kiểm cạnh liên quan trước; không dùng animation che lỗi, không redesign, không deploy.

## Mapping từng panel

Các duration/easing/reduced fallback theo MOTION_CONTRACT. Thông tin nghiệp vụ hiển thị và guard áp dụng ngay, không chờ duration. Static-by-design vẫn phải kiểm và ghi bằng chứng.

| Panel ID | State tham chiếu | Motion/feedback chính xác |
|---|---|---|
| P16.S01 | Đang tải chứng từ | Loading: skeleton giữ kích thước nội dung; không shimmer trang trí mặc định. Spinner chỉ khi request pending, reduced/off dùng text tĩnh. |
| P16.S02 | Chưa có chứng từ | Empty: icon/text xuất hiện140ms, không nhảy/bounce; chỉ empty sau load confirmed. |
| P16.S03 | Không tìm thấy kết quả | No results: giữ search/filter, fade vùng trạng thái; không reset query do animation key. |
| P16.S04 | Không tải được dữ liệu | Error: notice/error CTA hiện ngay; retry spinner theo request thật, dữ liệu trước giữ nếu policy quy định. |

## Guard, dữ liệu và scroll

Không dùng timer để đổi loading→success/empty. Request nhanh không bị kéo dài để đủ animation; aria-busy/live theo state, không theo CSS.

**Virtualization:** Loading viewport giữ chiều cao/anchor của list; không dựng nhiều skeleton vô hạn. Chỉ áp quyết định có profile từ M00/owner chung; không thêm lib cho đủ danh sách công nghệ. Giữ seed đã có, không sinh lại fixture để dễ làm hiệu ứng.

Nguồn nghiệp vụ cần đối chiếu của board này: Không tự triển khai spinner toàn ứng dụng hoặc thay state của màn khóa khi chỉ cần component list. Không đưa vấn đề PROPOSED thành requirement mới vì motion.

## Nghiệm thu riêng

1. A request chậm, B nhanh: stale A không đổi state B sau exit.
2. Reduced mode tắt shimmer/spinner trang trí nhưng vẫn báo đang tải bằng text.
3. Error retry thành công không nháy empty trung gian hoặc làm mất filter.

4. Với từng panel: full/auto, OS reduced và off có cùng nội dung, domain result, số operation hợp lệ và quyền. Static geometry sau settle khớp baseline; modeoff vẫn hoàn thành nhiệm vụ. Không replay hàng cũ khi mount/recycle/Back.
5. Kiểm navigation vào/ra, rapid tap, Back, scroll/keyboard/focus và hủy animation giữa chừng ở các action liên quan. Cleanup không giữ listener/RAF/overlay; camera/NFC service không bị nhân đôi vì animation.
6. Nếu chạm shared primitive, xem ownership map và chạy hồi quy trực tiếp các consumer bị tác động. Dùng ảnh actual sau settle và clip/trace thật khi chứng minh chuyển động; không báo60fps từ cảm giác nhìn hoặc screenshot.

## Thực thi và bàn giao

Đọc file liên quan → sửa tối thiểu trong source → chạy kiểm tra trên các state của board → sửa regression → cập nhật tracking. Không dừng ở câu hỏi “có muốn triển khai không?”. Đừng chạy lại mọi ca toàn app sau từng panel; chỉ mở rộng khi phát hiện rủi ro.

Xuất `handoff/motion/M16/REPORT.md`: source/diff/fixture version, files changed, primitives reused, kết quả theo P16.Sxx ở3 mode, operation/scroll/focus evidence, perf delta nếu có, blocker và dependency ảnh hưởng. Cập nhật `MOTION_COVERAGE.csv` và `MOTION_RUN_STATE.json`, không ghi đè trạng thái business integration cũ bằng kết quả animation.

Nếu bị ngắt, lưu phần còn lại và tiếp tục chính MOTION_P16; không tạo prompt triển khai mới. Nếu static là lựa chọn đúng, ghi STATIC_BY_DESIGN kèm testPASS thật, không bịa hiệu ứng để đủ số lượng.
