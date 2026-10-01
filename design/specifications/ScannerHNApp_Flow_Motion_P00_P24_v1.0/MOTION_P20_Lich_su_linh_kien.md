# MOTION_P20 — 18 · Lịch sử linh kiện

**Thực hiện sửa code và kiểm tra toàn bộ state dưới đây, không chỉ trả kế hoạch.** Đây là lượt bổ sung motion của board P20, giữ nguyên ID/phạm vi bản dựng cũ.

## Đầu vào và ranh giới

- Đọc `MOTION_CONTRACT.md`, contract thiết kế gốc, báo cáo FLOW_GATE và M00; reuse quyết định còn hiệu lực, không đọc lại toàn bộ repo.
- Board baseline: [ảnh tại snapshot đã dùng](https://raw.githubusercontent.com/Duc-Nguyen98/ScannerHNApp/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/02_NEW_BOARDS/18_lich_su_linh_kien.png). Ưu tiên ảnh baseline mới hơn đã được người dùng chốt nếu có trace; không tự đổi ảnh.
- Context liên màn: P09/P19/P23 cho case và xuất; P24 đóng case. Scene history/history-loading/history-error/empty.
- Ownership của lượt này: **PostedHistoryViewport, LoadMoreFooter**. Tái sử dụng primitive M00 và consumer đã triển khai; không tạo một bản provider/scroller khác cho board.
- Chỉ bắt đầu sau khi FLOW_GATE và setup motion đủ. Nếu lỗi flow mới xuất hiện, sửa đúng owner và kiểm cạnh liên quan trước; không dùng animation che lỗi, không redesign, không deploy.

## Mapping từng panel

Các duration/easing/reduced fallback theo MOTION_CONTRACT. Thông tin nghiệp vụ hiển thị và guard áp dụng ngay, không chờ duration. Static-by-design vẫn phải kiểm và ghi bằng chứng.

| Panel ID | State tham chiếu | Motion/feedback chính xác |
|---|---|---|
| P20.S01 | Phiếu linh kiện đã xuất — history | History: native scroll; list phản ánh POSTED, không animate cả viewport khi filter đổi. |
| P20.S02 | Tải thêm lịch sử — history-loading | Loading thêm: spinner/footer cố định theo request; giữ các hàng cũ và vị trí đọc. |
| P20.S03 | Lỗi tải lịch sử — history-error | Error thêm: footer lỗi fade140ms; retry không clear list hoặc replay entrance. |
| P20.S04 | Chưa có phiếu xuất — empty | Empty: notice140ms chỉ khi query thành công không có POSTED; không coi lỗi là empty. |

## Guard, dữ liệu và scroll

Virtual position wrapper do virtualizer sở hữu transform, motion chỉ ở inner row khi cần; không layout animation trên hàng đang đo.

**Virtualization:** Ưu tiên đo danh sách POSTED dài để quyết định TanStack Virtual; không cài chỉ vì có load-more. Chỉ áp quyết định có profile từ M00/owner chung; không thêm lib cho đủ danh sách công nghệ. Giữ seed đã có, không sinh lại fixture để dễ làm hiệu ứng.

Nguồn nghiệp vụ cần đối chiếu của board này: Pagination cursor/page/ID phải kiểm backend. Hạ tầng chưa có thì triển khai fixture chống trùng đúng và ghi adapter còn chờ, không phát minh endpoint. Không đưa vấn đề PROPOSED thành requirement mới vì motion.

## Nghiệm thu riêng

1. Append page có ID trùng: dedup, không nhảy anchor hoặc replay hàng cũ.
2. Load-more fail/retry giữ list và scroll.
3. Nếu virtualized, Back khôi phục anchor theo itemID+offset, không chỉ index.

4. Với từng panel: full/auto, OS reduced và off có cùng nội dung, domain result, số operation hợp lệ và quyền. Static geometry sau settle khớp baseline; modeoff vẫn hoàn thành nhiệm vụ. Không replay hàng cũ khi mount/recycle/Back.
5. Kiểm navigation vào/ra, rapid tap, Back, scroll/keyboard/focus và hủy animation giữa chừng ở các action liên quan. Cleanup không giữ listener/RAF/overlay; camera/NFC service không bị nhân đôi vì animation.
6. Nếu chạm shared primitive, xem ownership map và chạy hồi quy trực tiếp các consumer bị tác động. Dùng ảnh actual sau settle và clip/trace thật khi chứng minh chuyển động; không báo60fps từ cảm giác nhìn hoặc screenshot.

## Thực thi và bàn giao

Đọc file liên quan → sửa tối thiểu trong source → chạy kiểm tra trên các state của board → sửa regression → cập nhật tracking. Không dừng ở câu hỏi “có muốn triển khai không?”. Đừng chạy lại mọi ca toàn app sau từng panel; chỉ mở rộng khi phát hiện rủi ro.

Xuất `handoff/motion/M20/REPORT.md`: source/diff/fixture version, files changed, primitives reused, kết quả theo P20.Sxx ở3 mode, operation/scroll/focus evidence, perf delta nếu có, blocker và dependency ảnh hưởng. Cập nhật `MOTION_COVERAGE.csv` và `MOTION_RUN_STATE.json`, không ghi đè trạng thái business integration cũ bằng kết quả animation.

Nếu bị ngắt, lưu phần còn lại và tiếp tục chính MOTION_P20; không tạo prompt triển khai mới. Nếu static là lựa chọn đúng, ghi STATIC_BY_DESIGN kèm testPASS thật, không bịa hiệu ứng để đủ số lượng.
