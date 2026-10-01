# MOTION_P21 — 19 · Tiếp tục phiếu linh kiện

**Thực hiện sửa code và kiểm tra toàn bộ state dưới đây, không chỉ trả kế hoạch.** Đây là lượt bổ sung motion của board P21, giữ nguyên ID/phạm vi bản dựng cũ.

## Đầu vào và ranh giới

- Đọc `MOTION_CONTRACT.md`, contract thiết kế gốc, báo cáo FLOW_GATE và M00; reuse quyết định còn hiệu lực, không đọc lại toàn bộ repo.
- Board baseline: [ảnh tại snapshot đã dùng](https://raw.githubusercontent.com/Duc-Nguyen98/ScannerHNApp/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/02_NEW_BOARDS/19_tiep_tuc_phieu_linh_kien.png). Ưu tiên ảnh baseline mới hơn đã được người dùng chốt nếu có trace; không tự đổi ảnh.
- Context liên màn: P03 draft dialog; P19 scan/review/Post; P20 lịch sử; P22 shortcut phiếu dở.
- Ownership của lượt này: **DraftList, ResumeFeedback, ReconcileNotice**. Tái sử dụng primitive M00 và consumer đã triển khai; không tạo một bản provider/scroller khác cho board.
- Chỉ bắt đầu sau khi FLOW_GATE và setup motion đủ. Nếu lỗi flow mới xuất hiện, sửa đúng owner và kiểm cạnh liên quan trước; không dùng animation che lỗi, không redesign, không deploy.

## Mapping từng panel

Các duration/easing/reduced fallback theo MOTION_CONTRACT. Thông tin nghiệp vụ hiển thị và guard áp dụng ngay, không chờ duration. Static-by-design vẫn phải kiểm và ghi bằng chứng.

| Panel ID | State tham chiếu | Motion/feedback chính xác |
|---|---|---|
| P21.S01 | Phiếu đang thực hiện — drafts | Drafts: tap highlight100ms, ID/status ngay; không kéo reorder theo updatedAt mỗi tick animation. |
| P21.S02 | Tiếp tục đúng phiếu — resume | Resume: route fade theo shell; form giữ doc/version/mã, không remount draft store. |
| P21.S03 | Cần đối chiếu trên Web — reconcile | Reconcile: cảnh báo tĩnh/fade140ms; không flash liên tục hoặc hiện CTA sửa server-recorded lines. |
| P21.S04 | Kiểm tra kết quả xuất — post-check | Post-check: spinner chỉ khi status-check chạy, không endless background polling do animation; success khi nguồn xác nhận. |

## Guard, dữ liệu và scroll

Agent checkpoint khác phiếu checkpoint. UNKNOWN không retryPost, draft/version không được reset để transition đẹp hơn.

**Virtualization:** Draft list dài có thể reuse viewport; reconcile form không virtualize. Chỉ áp quyết định có profile từ M00/owner chung; không thêm lib cho đủ danh sách công nghệ. Giữ seed đã có, không sinh lại fixture để dễ làm hiệu ứng.

Nguồn nghiệp vụ cần đối chiếu của board này: Cơ chế checkpoint ở đây là dữ liệu nghiệp vụ trong app, khác file ghi tiến độ của AI. Không dùng file RUN_STATE của agent làm nguồn draft người dùng. Không đưa vấn đề PROPOSED thành requirement mới vì motion.

## Nghiệm thu riêng

1. Resume→Back→resume giữ đúng version và mã đã ghi nhận.
2. Unknown→status-check→networkfail vẫnUNKNOWN, không phiếu bù.
3. Rời màn: cancel subscription/timer animation; kết quả dữ liệu lưu theo contract chứ không bị animation xóa.

4. Với từng panel: full/auto, OS reduced và off có cùng nội dung, domain result, số operation hợp lệ và quyền. Static geometry sau settle khớp baseline; modeoff vẫn hoàn thành nhiệm vụ. Không replay hàng cũ khi mount/recycle/Back.
5. Kiểm navigation vào/ra, rapid tap, Back, scroll/keyboard/focus và hủy animation giữa chừng ở các action liên quan. Cleanup không giữ listener/RAF/overlay; camera/NFC service không bị nhân đôi vì animation.
6. Nếu chạm shared primitive, xem ownership map và chạy hồi quy trực tiếp các consumer bị tác động. Dùng ảnh actual sau settle và clip/trace thật khi chứng minh chuyển động; không báo60fps từ cảm giác nhìn hoặc screenshot.

## Thực thi và bàn giao

Đọc file liên quan → sửa tối thiểu trong source → chạy kiểm tra trên các state của board → sửa regression → cập nhật tracking. Không dừng ở câu hỏi “có muốn triển khai không?”. Đừng chạy lại mọi ca toàn app sau từng panel; chỉ mở rộng khi phát hiện rủi ro.

Xuất `handoff/motion/M21/REPORT.md`: source/diff/fixture version, files changed, primitives reused, kết quả theo P21.Sxx ở3 mode, operation/scroll/focus evidence, perf delta nếu có, blocker và dependency ảnh hưởng. Cập nhật `MOTION_COVERAGE.csv` và `MOTION_RUN_STATE.json`, không ghi đè trạng thái business integration cũ bằng kết quả animation.

Nếu bị ngắt, lưu phần còn lại và tiếp tục chính MOTION_P21; không tạo prompt triển khai mới. Nếu static là lựa chọn đúng, ghi STATIC_BY_DESIGN kèm testPASS thật, không bịa hiệu ứng để đủ số lượng.
