# MOTION_P22 — 20 · Lịch sử thao tác & NFC

**Thực hiện sửa code và kiểm tra toàn bộ state dưới đây, không chỉ trả kế hoạch.** Đây là lượt bổ sung motion của board P22, giữ nguyên ID/phạm vi bản dựng cũ.

## Đầu vào và ranh giới

- Đọc `MOTION_CONTRACT.md`, contract thiết kế gốc, báo cáo FLOW_GATE và M00; reuse quyết định còn hiệu lực, không đọc lại toàn bộ repo.
- Board baseline: [ảnh tại snapshot đã dùng](https://raw.githubusercontent.com/Duc-Nguyen98/ScannerHNApp/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/02_NEW_BOARDS/20_lich_su_thao_tac_nfc.png). Ưu tiên ảnh baseline mới hơn đã được người dùng chốt nếu có trace; không tự đổi ảnh.
- Context liên màn: Home Xem tất cả P02; documents P08/P12; draft P21; warranty/session P23; tag operation P07.
- Ownership của lượt này: **HistoryHub, NfcAuditViewport**. Tái sử dụng primitive M00 và consumer đã triển khai; không tạo một bản provider/scroller khác cho board.
- Chỉ bắt đầu sau khi FLOW_GATE và setup motion đủ. Nếu lỗi flow mới xuất hiện, sửa đúng owner và kiểm cạnh liên quan trước; không dùng animation che lỗi, không redesign, không deploy.

## Mapping từng panel

Các duration/easing/reduced fallback theo MOTION_CONTRACT. Thông tin nghiệp vụ hiển thị và guard áp dụng ngay, không chờ duration. Static-by-design vẫn phải kiểm và ghi bằng chứng.

| Panel ID | State tham chiếu | Motion/feedback chính xác |
|---|---|---|
| P22.S01 | Lịch sử thao tác — history-hub | Hub lịch sử: nav/tile tap100ms; indicator140ms, không stagger card khi quay lại. |
| P22.S02 | Lịch sử NFC — nfc | NFC events: native scroll và filter fade; append giữ anchor. |
| P22.S03 | Chi tiết thao tác NFC — nfc-detail | Event detail: route fade180ms theo shell; raw UID/eventID hiển thị ngay, không typewriter. |
| P22.S04 | Chưa có dữ liệu lịch sử — events-unavailable | Events-unavailable: cảnh báo nguồn chưa có hiện ngay; không animate thành zero events hoặc dựng event giả. |

## Guard, dữ liệu và scroll

NFC current mapping không đủ tạo audit; reuse domain và navigation từ P07/P08. Chuyển motion mode không sinh event.

**Virtualization:** Ứng viên virtual NFC audit dài dùng cùng list infra; scroll controller native. Chỉ áp quyết định có profile từ M00/owner chung; không thêm lib cho đủ danh sách công nghệ. Giữ seed đã có, không sinh lại fixture để dễ làm hiệu ứng.

Nguồn nghiệp vụ cần đối chiếu của board này: Contract event chưa chốt thì hoàn thành UI với fixture tách biệt; production dùng unavailable/nguồn có thật và ghi integration BLOCKED. Không đưa vấn đề PROPOSED thành requirement mới vì motion.

## Nghiệm thu riêng

1. Hub→NFC→event→Back giữ filter/scroll và event ID.
2. Nguồn event unavailable không hiển thị danh sách tự suy từ tag status.
3. Mở event từ link chia sẻ tái lập đúng fixture, không bị transition đổi ID.

4. Với từng panel: full/auto, OS reduced và off có cùng nội dung, domain result, số operation hợp lệ và quyền. Static geometry sau settle khớp baseline; modeoff vẫn hoàn thành nhiệm vụ. Không replay hàng cũ khi mount/recycle/Back.
5. Kiểm navigation vào/ra, rapid tap, Back, scroll/keyboard/focus và hủy animation giữa chừng ở các action liên quan. Cleanup không giữ listener/RAF/overlay; camera/NFC service không bị nhân đôi vì animation.
6. Nếu chạm shared primitive, xem ownership map và chạy hồi quy trực tiếp các consumer bị tác động. Dùng ảnh actual sau settle và clip/trace thật khi chứng minh chuyển động; không báo60fps từ cảm giác nhìn hoặc screenshot.

## Thực thi và bàn giao

Đọc file liên quan → sửa tối thiểu trong source → chạy kiểm tra trên các state của board → sửa regression → cập nhật tracking. Không dừng ở câu hỏi “có muốn triển khai không?”. Đừng chạy lại mọi ca toàn app sau từng panel; chỉ mở rộng khi phát hiện rủi ro.

Xuất `handoff/motion/M22/REPORT.md`: source/diff/fixture version, files changed, primitives reused, kết quả theo P22.Sxx ở3 mode, operation/scroll/focus evidence, perf delta nếu có, blocker và dependency ảnh hưởng. Cập nhật `MOTION_COVERAGE.csv` và `MOTION_RUN_STATE.json`, không ghi đè trạng thái business integration cũ bằng kết quả animation.

Nếu bị ngắt, lưu phần còn lại và tiếp tục chính MOTION_P22; không tạo prompt triển khai mới. Nếu static là lựa chọn đúng, ghi STATIC_BY_DESIGN kèm testPASS thật, không bịa hiệu ứng để đủ số lượng.
