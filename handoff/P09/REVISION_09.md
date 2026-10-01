# P09 r09 — dữ liệu bảo hành và hồ sơ đầy đủ

Yêu cầu: mô phỏng dữ liệu sát trải nghiệm sử dụng thực tế, không hiển thị badge “dữ liệu mẫu” trong app. Đây là bộ dữ liệu giả lập được tác giả chủ động tạo, không phải dữ liệu khách hàng/WMS thật; “99%” không được dùng làm tỷ lệ nghiệm thu hay tuyên bố tích hợp production.

## Dữ liệu và giao diện

- Giữ 8 mã hồ sơ và serial hiện có, bổ sung khách hàng, mã khách, liên hệ, lỗi tiếp nhận trong danh mục đã duyệt, chẩn đoán, phụ kiện, ghi chú và kết quả đúng tiến trình.
- 2 hồ sơ Đang kiểm tra, 1 Đã tiếp nhận, 1 Chờ bàn giao, 4 Đã trả khách. Tổng 4 hồ sơ mở giữ đồng bộ chỉ số Home hiện có.
- 5 phiếu POSTED: XLK-0002…XLK-0006, 7 dòng mã, tổng 8 linh kiện. Mốc xuất được liên kết vào lịch sử đúng hồ sơ; giữ nguyên phiếu BH-001 gồm 3 linh kiện.
- Hồ sơ, danh sách và Lịch sử bảo hành đọc chung nguồn case/event. Thời điểm cập nhật lấy mốc sự kiện cuối, không đứng trước phiếu xuất.
- Tab Thông tin bổ sung kết quả sửa chữa và phụ kiện. Timeline có nội dung xử lý cụ thể, dùng kiểu chữ/màu hệ thống và tự xuống dòng.
- Hồ sơ chưa sửa xong hiển thị “Chưa cập nhật kết quả sửa chữa”. Hồ sơ được xác định chưa xuất linh kiện có số 0; nguồn chưa biết vẫn là thiếu dữ liệu, không suy ra 0.
- Kiểm tra text hiển thị trong app không có “dữ liệu mẫu”, “demo”, “fixture”. Thông tin kỹ thuật prototype ngoài khung app và hồ sơ bàn giao vẫn giữ nguồn gốc minh bạch.

Không thay đổi số panel, trạng thái nghiệp vụ, quyền ghi, điều kiện UNKNOWN, hay mở giả màn thành công từ dữ liệu lịch sử. P09.S04 vẫn cần receipt xác nhận của đúng thao tác/case. Không phát sinh gửi thông tin liên hệ, gọi API hoặc phần cứng.

## Kiểm chứng revision này

- Node: **29/29 PASS** (`tests/warranty*.test.mjs`, `tests/business-history.test.mjs`).
- Browser: **28 nhóm PASS** — dataset 5, detail 6, warranty regression 10, history/shared regression 7.
- Dataset QA đọc cả 8 hồ sơ qua 3 tab; đối chiếu khách hàng, phụ kiện, kết quả, phiếu/quantity và mô tả sự kiện. Tìm “phuc an” trả đúng BH-005; kiểm tra Back giữ query, closed chỉ đọc và nút về danh sách của hồ sơ chờ bàn giao.
- UI: 6 viewport 494×1000, 360×800, 430×932, 1440×900, 340×420, 1869×940. Shell 494×950, không tràn ngang, footer ổn định. Đã xem ảnh BH-005 Thông tin/Lịch sử để kiểm tra xuống dòng và phân cấp nội dung.
- Regression đối chiếu P08 tab style, context Back, xác nhận/UNKNOWN, chống ghi lặp, logout và P06/P08 kết nối. Cập nhật kỳ vọng kiểm thử BH-002 có thêm phiếu và event; BH-004 dùng để kiểm thử ledger rỗng đã biết. Không nới lỏng điều kiện kiểm thử.

Bằng chứng: `evidence/revision-09/node-tests.txt`, `dataset/results.json`, `detail/detail-results.json`, `regression/browser-results.json`, `history-regression/browser-results.json` cùng ảnh và metrics tương ứng. `source-sha256.json` chụp nguồn ở thời điểm bàn giao; có các chat khác sửa module chung đồng thời nên không tuyên bố đây là lần nghiệm thu toàn repo.

**Visual:** chờ người dùng duyệt. **Behavior:** PASS trong prototype đã kiểm. **Integration:** BLOCKED/NOT_RUN với production, camera và phần cứng. P19/P21 và các luồng ngoài P09 giữ giới hạn trước đó.
