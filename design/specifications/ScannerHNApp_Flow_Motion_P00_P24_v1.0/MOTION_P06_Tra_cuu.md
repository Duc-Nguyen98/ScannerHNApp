# MOTION_P06 — Tra cứu

**Thực hiện sửa code và kiểm tra toàn bộ state dưới đây, không chỉ trả kế hoạch.** Đây là lượt bổ sung motion của board P06, giữ nguyên ID/phạm vi bản dựng cũ.

## Đầu vào và ranh giới

- Đọc `MOTION_CONTRACT.md`, contract thiết kế gốc, báo cáo FLOW_GATE và M00; reuse quyết định còn hiệu lực, không đọc lại toàn bộ repo.
- Board baseline: [ảnh tại snapshot đã dùng](https://raw.githubusercontent.com/Duc-Nguyen98/ScannerHNApp/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/01_UPDATED_BOARDS/04_tra_cuu.png). Ưu tiên ảnh baseline mới hơn đã được người dùng chốt nếu có trace; không tự đổi ảnh.
- Context liên màn: Danh mục/tồn/audit đọc hiện có; scan context P03; bảo hành P09; ngoại lệ dữ liệu P16.
- Ownership của lượt này: **SearchFeedback, TabFeedback, ListViewport**. Tái sử dụng primitive M00 và consumer đã triển khai; không tạo một bản provider/scroller khác cho board.
- Chỉ bắt đầu sau khi FLOW_GATE và setup motion đủ. Nếu lỗi flow mới xuất hiện, sửa đúng owner và kiểm cạnh liên quan trước; không dùng animation che lỗi, không redesign, không deploy.

## Mapping từng panel

Các duration/easing/reduced fallback theo MOTION_CONTRACT. Thông tin nghiệp vụ hiển thị và guard áp dụng ngay, không chờ duration. Static-by-design vẫn phải kiểm và ghi bằng chứng.

| Panel ID | State tham chiếu | Motion/feedback chính xác |
|---|---|---|
| P06.S01 | Tra cứu sản phẩm | Search/filter: giữ caret/IME, render kết quả mới khi query hợp lệ trả về; fade140ms vùng kết quả, không reset input hay fade từng ký tự. |
| P06.S02 | Thông tin sản phẩm | Chi tiết sản phẩm: route fade180ms qua shell; ảnh giữ kích thước, không shared-element morph mặc định. |
| P06.S03 | Tồn kho sản phẩm | Tồn kho: số đổi ngay; tab indicator140ms nếu không đổi kích thước; không count-up tồn. |
| P06.S04 | Lịch sử giao dịch | Lịch sử sản phẩm: append giữ anchor, hàng cũ không replay entrance; lỗi tải chỉ đổi footer. |

## Guard, dữ liệu và scroll

Query ID/cancel-stale do data layer; motion không debounce hay thay rule tìm kiếm. Back trả filter+scroll, không mở item đầu khi ID sai.

**Virtualization:** Ứng viên virtual: kết quả tra cứu/lịch sử rất dài; giữ semantic list và tìm kiếm trên dataset, không chỉ DOM. Chỉ áp quyết định có profile từ M00/owner chung; không thêm lib cho đủ danh sách công nghệ. Giữ seed đã có, không sinh lại fixture để dễ làm hiệu ứng.

Nguồn nghiệp vụ cần đối chiếu của board này: Chi tiết filter/nguồn ảnh sản phẩm và action In tem chưa đủ nguồn phải ghi rõ; không thay bằng icon/ảnh bên ngoài. Không đưa vấn đề PROPOSED thành requirement mới vì motion.

## Nghiệm thu riêng

1. Gõ A→B nhanh với response A đến muộn: chỉ B hiển thị, không flash A sau transition.
2. List→detail→Back: query/filter/anchor đúng.
3. Với fixture12=10+1+1, số không đi qua các giá trị sai để tạo hiệu ứng.

4. Với từng panel: full/auto, OS reduced và off có cùng nội dung, domain result, số operation hợp lệ và quyền. Static geometry sau settle khớp baseline; modeoff vẫn hoàn thành nhiệm vụ. Không replay hàng cũ khi mount/recycle/Back.
5. Kiểm navigation vào/ra, rapid tap, Back, scroll/keyboard/focus và hủy animation giữa chừng ở các action liên quan. Cleanup không giữ listener/RAF/overlay; camera/NFC service không bị nhân đôi vì animation.
6. Nếu chạm shared primitive, xem ownership map và chạy hồi quy trực tiếp các consumer bị tác động. Dùng ảnh actual sau settle và clip/trace thật khi chứng minh chuyển động; không báo60fps từ cảm giác nhìn hoặc screenshot.

## Thực thi và bàn giao

Đọc file liên quan → sửa tối thiểu trong source → chạy kiểm tra trên các state của board → sửa regression → cập nhật tracking. Không dừng ở câu hỏi “có muốn triển khai không?”. Đừng chạy lại mọi ca toàn app sau từng panel; chỉ mở rộng khi phát hiện rủi ro.

Xuất `handoff/motion/M06/REPORT.md`: source/diff/fixture version, files changed, primitives reused, kết quả theo P06.Sxx ở3 mode, operation/scroll/focus evidence, perf delta nếu có, blocker và dependency ảnh hưởng. Cập nhật `MOTION_COVERAGE.csv` và `MOTION_RUN_STATE.json`, không ghi đè trạng thái business integration cũ bằng kết quả animation.

Nếu bị ngắt, lưu phần còn lại và tiếp tục chính MOTION_P06; không tạo prompt triển khai mới. Nếu static là lựa chọn đúng, ghi STATIC_BY_DESIGN kèm testPASS thật, không bịa hiệu ứng để đủ số lượng.
