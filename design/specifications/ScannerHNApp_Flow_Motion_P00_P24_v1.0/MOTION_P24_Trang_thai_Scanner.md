# MOTION_P24 — 22 · Trạng thái Scanner

**Thực hiện sửa code và kiểm tra toàn bộ state dưới đây, không chỉ trả kế hoạch.** Đây là lượt bổ sung motion của board P24, giữ nguyên ID/phạm vi bản dựng cũ.

## Đầu vào và ranh giới

- Đọc `MOTION_CONTRACT.md`, contract thiết kế gốc, báo cáo FLOW_GATE và M00; reuse quyết định còn hiệu lực, không đọc lại toàn bộ repo.
- Board baseline: [ảnh tại snapshot đã dùng](https://raw.githubusercontent.com/Duc-Nguyen98/ScannerHNApp/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/02_NEW_BOARDS/22_trang_thai_scanner.png). Ưu tiên ảnh baseline mới hơn đã được người dùng chốt nếu có trace; không tự đổi ảnh.
- Context liên màn: P19 quantity/scan; P20 history; P21 resume; P04/P05 record; P09/P23 closed case.
- Ownership của lượt này: **ValidationFeedback, TerminalStates; tổng hợp release gate**. Tái sử dụng primitive M00 và consumer đã triển khai; không tạo một bản provider/scroller khác cho board.
- Chỉ bắt đầu sau khi FLOW_GATE và setup motion đủ. Nếu lỗi flow mới xuất hiện, sửa đúng owner và kiểm cạnh liên quan trước; không dùng animation che lỗi, không redesign, không deploy.

## Mapping từng panel

Các duration/easing/reduced fallback theo MOTION_CONTRACT. Thông tin nghiệp vụ hiển thị và guard áp dụng ngay, không chờ duration. Static-by-design vẫn phải kiểm và ghi bằng chứng.

| Panel ID | State tham chiếu | Motion/feedback chính xác |
|---|---|---|
| P24.S01 | Số lượng vượt tồn — quantity-invalid | Quantity-invalid:13>12 báo ngay bằng text/viền, không shake; xác nhận bị chặn trong mọi motion mode. |
| P24.S02 | Mã hộp chưa thể xuất — scan-error | Scan-error: highlight lỗi cục bộ140ms, giữ accepted list và vùng camera ổn định. |
| P24.S03 | Chờ xử lý trên Web — waiting-web | Waiting-web: fade160ms sau record, nhập/xuất dùng đúng fixture riêng; amber và chưa ghi sổ giữ nguyên. |
| P24.S04 | Hồ sơ đã trả khách — closed | Closed: read-only/guard có hiệu lực tức thì; lịch sử đọc bình thường, không chờ nút Xuất animate biến mất mới chặn. |

## Guard, dữ liệu và scroll

Kết thúc MOTION phải kiểm liên luồng và coverage đủ24board/91panel. Chưa có backend thật không cản UI fixture gate nhưng không được integrationPASS giả.

**Virtualization:** Không thêm virtualizer mới ở P24; kiểm regression primitive được quyết định trước. Chỉ áp quyết định có profile từ M00/owner chung; không thêm lib cho đủ danh sách công nghệ. Giữ seed đã có, không sinh lại fixture để dễ làm hiệu ứng.

Nguồn nghiệp vụ cần đối chiếu của board này: Hai biến thể nhập/xuất của waiting-web phải kiểm riêng trong cùng prompt, không làm phát sinh prompt25. 91 panel là số vị trí ảnh tham chiếu, không là tổng số state runtime duy nhất. Không đưa vấn đề PROPOSED thành requirement mới vì motion.

## Nghiệm thu riêng

1. Motion full/reduced/off đều chặnqty13,0,âm,thập phân theo rule quantity.
2. Case đóng trong lúc Post chuẩn bị: guard chặn; stale exit CTA không gọi mutation.
3. Chạy lại hành trình chéo bị tác động và so domain state/operation count giữa motion modes; báo thiếu bằng chứng, không mặc địnhPASS.

4. Với từng panel: full/auto, OS reduced và off có cùng nội dung, domain result, số operation hợp lệ và quyền. Static geometry sau settle khớp baseline; modeoff vẫn hoàn thành nhiệm vụ. Không replay hàng cũ khi mount/recycle/Back.
5. Kiểm navigation vào/ra, rapid tap, Back, scroll/keyboard/focus và hủy animation giữa chừng ở các action liên quan. Cleanup không giữ listener/RAF/overlay; camera/NFC service không bị nhân đôi vì animation.
6. Nếu chạm shared primitive, xem ownership map và chạy hồi quy trực tiếp các consumer bị tác động. Dùng ảnh actual sau settle và clip/trace thật khi chứng minh chuyển động; không báo60fps từ cảm giác nhìn hoặc screenshot.

## Thực thi và bàn giao

Đọc file liên quan → sửa tối thiểu trong source → chạy kiểm tra trên các state của board → sửa regression → cập nhật tracking. Không dừng ở câu hỏi “có muốn triển khai không?”. Đừng chạy lại mọi ca toàn app sau từng panel; chỉ mở rộng khi phát hiện rủi ro.

Xuất `handoff/motion/M24/REPORT.md`: source/diff/fixture version, files changed, primitives reused, kết quả theo P24.Sxx ở3 mode, operation/scroll/focus evidence, perf delta nếu có, blocker và dependency ảnh hưởng. Cập nhật `MOTION_COVERAGE.csv` và `MOTION_RUN_STATE.json`, không ghi đè trạng thái business integration cũ bằng kết quả animation.

Nếu bị ngắt, lưu phần còn lại và tiếp tục chính MOTION_P24; không tạo prompt triển khai mới. Nếu static là lựa chọn đúng, ghi STATIC_BY_DESIGN kèm testPASS thật, không bịa hiệu ứng để đủ số lượng.

## Gate cuối trước FINAL

Đối chiếu24 board/91panel và mọi runtime state mở rộng đã ghi; tổng hợp APPLIED/STATIC_BY_DESIGN/REUSED cùng kết quả từng mode. Chạy lại các hành trình thiết yếu trong FLOW_GATE với motion bật và reduced/off đại diện; xử lý regression navigation/data/guard/scroll từ lớp motion. Kiểm các shared primitives đã thay đổi và dependencies theo change impact.

Xuất `handoff/motion/MOTION_RELEASE_GATE.json`: source commit + diff identity, fixture version, token version, normal/reduced/off result, tested_flows, coverage gaps, known_issues, evidence, gate_status=READY_FOR_FINAL hoặc INCOMPLETE. Không yêu cầu backend thật PASS để gate UI fixture đạt, nhưng ghi rõ scope. Nếu còn state thiết yếu chưa kiểm/luồng gãy thì INCOMPLETE, không tự declare ready.

Sau READY, bàn giao `FINAL_BRIDGE.md` và file FINAL gốc để chạy; không publish ngay trong M24. FINAL phải giữ motion/source/fixture hiện hành, nối phần thiếu có thật và kiểm build public, không tạo lại bộ UI hoặc engine.
