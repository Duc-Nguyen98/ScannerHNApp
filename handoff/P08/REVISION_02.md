# P08 r02 — UI/UX trong phạm vi đã duyệt

Ngày: 2026-09-27. Phạm vi: 7 hạng mục tại REVISION_02_SCOPE.md, P08 và điểm nối trực tiếp lịch sử P22/P23. Chưa triển khai P09 hay toàn bộ P22/P23. Không push/merge/deploy.

## Kết quả

1. Lịch sử nhúng dùng shell 494×950, Arial, header/nav và nhịp khoảng cách chung. Bỏ statusbar giả, Back ngoài iframe và footer Back lặp. Standalone vẫn có statusbar/footer.
2. Lịch sử chung và Nhập/xuất cùng nguồn 48 hoạt động. Scope Nhập/xuất chỉ có 29 hoạt động inbound/outbound.
3. Tách số kết quả/tổng nguồn, hiển thị ngày chính xác, nhãn sort rõ. Xóa lọc giữ scope. Không đổi thứ tự mặc định của fixture.
4. Thông tin chỉ hiển thị sự kiện cuối. Tab dòng thời gian hiển thị đầy đủ. Grid tổng quan ngày chỉ đọc, drilldown qua danh sách nhóm.
5. CTA phiên mở danh sách P23. Chọn phiên mở lại P08.S03 theo đúng ID. Back giữ bộ lọc và vị trí cuộn, kể cả phiên đã mở rộng.
6. Nhãn Dữ liệu mô phỏng trong app. Ghi chú kỹ thuật ngoài app. Chứng từ/tệp chưa có nguồn hiển thị tại chỗ, không có CTA xem giả.
7. Badge theo trạng thái dữ liệu, bao gồm Chờ xử lý trên Web ở danh sách phiên. Thiếu actor/kho hiển thị Chưa có dữ liệu. Không thêm dữ liệu giả.

## Visual

- Đã xem ảnh thực tế 4 panel, hub và danh sách phiên. Đã kiểm tra hình học ở 6 viewport: 494×1000, 360×800, 430×932, 1440×900, 340×420, 1869×940.
- 24 ảnh panel, 18 ảnh hub/session/NFC nhúng, 4 ảnh runtime và 1 ảnh thiếu actor/kho. Nội dung cuộn bên trong, không tràn ngang, nav ổn định.
- B08 nguyên bản giữ SHA256 78aa9384caf3f2ed600ead4f1c8518a8c254fccaadc96d1e5c8483d5f4c67aa2.
- Các thay đổi bố cục/badge/nội dung trùng được duyệt là delta so với B08; không sửa baseline để khớp bản dựng. So sánh pixel tự nhiên, không tuyên bố pixel-perfect.
- Trạng thái: chờ user nghiệm thu r02. Không tự đánh dấu user đã nghiệm thu.

## Behavior — fixture

- Node: 112/112 PASS, gồm 8 test P08.
- Browser P08 r02: 14/14 nhóm PASS, không page error/request ngoài localhost.
- Home: 14/14 PASS.
- P03: 14/14 PASS, 29 captures.
- P07: 11/11 PASS. Motion: PASS lặp vô hạn, giảm chuyển động, 6 footer layouts, Home.
- Kiểm tra giữ nguyên SHA256 của nfc.mjs, NFC CSS và history-fixtures.js đều PASS.
- Test P03 chỉ cập nhật selector nút về Home ở history hub vì nút ngoài iframe đã được duyệt bỏ. Không bỏ assertion nghiệp vụ.
- Lần chạy trước đã phát hiện lỗi lưu view cùng session ID; đã tách key theo trạng thái mở rộng/filter và kiểm tra lại PASS. Một assertion scroll đã đo trước khi trình duyệt tự cuộn tới dòng cần bấm; sửa test đo sau scrollIntoView. Fixture ngày test được đặt rõ trước assertion grid.
- failure.json/failure.png và dialog-regression/browser-failure.json còn lưu để truy vết lần chạy trước, không phải kết quả cuối. Kết quả cuối ở browser-results.json và node-tests.txt.

## Integration

BLOCKED / NOT_RUN: backend/WMS, NFC thật, quyền production, định nghĩa thống kê/ngày production, nguồn chứng từ P12/tệp P18. Không gọi API/hardware, không thay tồn. Fixture PASS không phải integration PASS. P22/P23 chỉ là điểm nối prototype, chưa nghiệm thu full board.

## Bằng chứng và preview

- evidence/revision-02/P08-four-panels.png
- evidence/revision-02/comparison-S01.png đến comparison-S04.png
- evidence/revision-02/browser-results.json và render-metrics.json
- evidence/revision-02/node-tests.txt và source-sha256.json
- evidence/revision-02/home-regression, dialog-regression, nfc-regression, nfc-motion
- REVIEW.html có cả r02 và r01. Toàn bộ evidence r01 được giữ nguyên.
- http://127.0.0.1:8766/flows/auth-session/ → minhanh / preview → Bắt đầu ca → Lịch sử → Lịch sử chung.
