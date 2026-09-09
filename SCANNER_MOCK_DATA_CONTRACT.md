# Scanner — bộ dữ liệu thiết kế mặc định

Ngày duyệt:09/09/2026. Nguồn: yêu cầu trực tiếp của người dùng và ảnh `C:/Users/Admin/Desktop/6.png`.

## Quy tắc áp dụng từ thời điểm này

App Scanner preview phải sử dụng dữ liệu giả giống thiết kế, bao gồm mã, số dòng, số đếm, ngày/giờ và trạng thái. Không yêu cầu xác nhận lại chỉ vì cần mock. Quy tắc đã ghi vào `AGENTS.md`, thay thế các hạn chế mock trước đó cho Scanner.

Tài liệu là contract cho DEV; không đặt thông báo “dữ liệu giả/demo” trên UI khách hàng. Việc đấu nối API thật do người dùng/bên triển khai phụ trách; không phải điều kiện chặn dựng visual.

## Home mặc định

| Vị trí | Dữ liệu |
|---|---|
| Người dùng | Minh Anh / MA |
| Kho | Kho Hoa Nam / Đang hoạt động |
| Badge chuông | 3 hoạt động |
| Phiếu chờ duyệt | 1 |
| Bảo hành đang mở | 4 |
| Ca bắt đầu | 08:30 |
| PN-0001 | Nhập kho · Lô máy đầu ca /12/04 08:32 /Chờ duyệt |
| PX-0004 | Xuất kho · Đại lý Minh Phát /11/04 16:20 /Đã ghi sổ |
| BH-001 | Bảo hành · SN: HN12345 /10/04 14:15 /Đang xử lý |

## Implementation

- `lib/scanner-design-fixtures.ts`: seed/upgrade và read-model ba dòng Home. Metadata `designFixtureVersion:1` chống thêm lặp. Preview mới và store cũ chưa có fixture đều được bổ sung tự động khi tải lại.
- PN-0001/PX-0004 là Doc trong store, mở chi tiết phiếu đang dùng; PX có line và hiện vật lịch sử đã xuất tương ứng. BH-001 là Warranty, mở hồ sơ hiện có; serialHN12345 được hiển thị cả Home và chi tiết.
- “Đang xử lý” là trạng thái tổng hợp Home của hồ sơ đang tiếp nhận/kiểm tra/sửa chữa. Bên trong hồ sơ giữ bước xử lý cụ thể để các action bảo hành hoạt động đúng.
- Home hiển thị giờ thiết kế08:30, kể cả phiên cũ đã có timestamp thực. `shiftStartedAt` nội bộ và expiry/route guard không đổi; không dùng08:30 để tính hết hạn phiên.
- Số đếm/trạng thái và danh sách vẫn phản hồi thao tác trong preview sau trạng thái khởi đầu chuẩn. Không khóa cứng “Chờ duyệt” sau khi người xem đã duyệt/hủy phiếu.
- Upgrade không xóa localStorage, không reset phiếu người dùng đã sửa, không đổi trạng thái kho đang paused. Date của PN seed nguyên bản được cập nhật theo reference, phiếu sửa/hủy giữ nguyên; các event bổ sung không lặp sau reload.
- Các số ID lịch sử có khoảng trống nhưPX-0004 yêu cầu ID giao dịch mới lấy max suffix+1, không lấy riêng số phần tử. Đã bổ sung chống trùng ID; không thay validation/Post/stock/RBAC.

## Kiểm thử và evidence

- [Home390](artifacts/scanner-design-data/390-home.png), [360](artifacts/scanner-design-data/360-home.png), [430](artifacts/scanner-design-data/430-home.png).
- [Browser QA](artifacts/scanner-design-data/qa.json): khớp toàn bộ bảng trên, mở cả3 chi tiết, reload không thêm lặp, last row không bị nav che, launcher4actions. 0 console/page errors và0 axe violations ở3 viewport.
- [Regression E2E](artifacts/scanner-design-data/e2e/e2e.json): nhập/xuất/Post, warranty parts, warranty transition, NFC, tra cứu và lịch sử.
- Unit fixture/model/policy/auth/shift:28/28 PASS. Test fixture bảo đảm destinations tồn tại, upgrade idempotent vàPX-0004 không bị giao dịch mới ghi đè.
- TypeScript scanner và scoped oxlint PASS. Preview artifact chạy trên4174; chưa commit/push/deploy.

Các báo cáo/evidence trước yêu cầu này là snapshot lịch sử; câu “không thêm phiếu giả” và giờ thực của Home trong các báo cáo đó đã được yêu cầu mới thay thế. Không tự đánh dấu toàn bộ Visual Lock P01–P03 PASS và không chạy P04 từ thay đổi dữ liệu này.
