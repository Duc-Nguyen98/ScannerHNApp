# Hoa Nam Scanner — Approved UI Baseline v1

Người dùng xác nhận ngày09/09/2026:

> “Tôi chốt màn hình Đăng nhập, Xác nhận phiên làm việc, và màn hình trang chủ là base thống nhất”.

Trạng thái: **USER APPROVED — ba màn làm chuẩn cho các lần triển khai sau**.

## Nguồn chuẩn

- Runtime được duyệt: bản local `entry-reference-2`, đã bao gồm Home alignment fix và design mock data.
- Snapshot ảnh cố định: `artifacts/scanner-approved-baseline-v1/screenshots/` — 9 ảnh,3 màn×360/390/430px.
- Hash source/ảnh tại thời điểm chốt: `artifacts/scanner-approved-baseline-v1/manifest.json`.
- Git HEAD lúc chốt:`6dfb8aa`, nhưng implementation được duyệt nằm trong working tree có thay đổi chưa commit. **Không checkout6dfb8aa để khôi phục UI đã duyệt**; đó không phải commit chứa baseline hiện tại.

Ảnh snapshot được sao chép từ bản AFTER của cùng lượt entry-reference cuối cùng; không ghi đè bằng các lần QA tương lai. Các report trước đó giữ nguyên như lịch sử; việc người dùng duyệt ở đây xác lập baseline mới cho đúng ba màn, không phải tuyên bố toàn bộ app đạt Visual Lock.

## Những gì được khóa

| Màn | Thành phần chuẩn |
|---|---|
| Đăng nhập | Warehouse hero, logo/brand, title/subtitle, motto, floating form card, label/input/user/lock/eye, forgot link, login arrow CTA, security surface và footer |
| Xác nhận phiên | Warehouse/staff hero, greeting/name, motto riêng, avatar/role/chevron, warehouse icon/status dot, Info surface, play+chevron CTA, divider/logout, footer |
| Trang chủ | Header/brand/bell/avatar, hero/status, KPI3cột cùng hàng, task2×2, lookup bar,3 recent records với metadata thẳng cột, bottom navigation/scanner button hiện tại |

Font **Public Sans**, bảng màu Hoa Nam, hệ icon/surface/radius/spacing và cách scale trong app viewport giữ theo source snapshot. Overlay luôn contained trong app viewport.

Footer cả hai màn vào app:

**HOA NAM SCANNER**  
**KẾT NỐI CON NGƯỜI - VẬN HÀNH HIỆU QUẢ**

Mock Home mặc định: Minh Anh/MA, badge3, KPI1/4, ca08:30; PN-0001/12/04 08:32/Chờ duyệt; PX-0004/Đại lý Minh Phát/11/04 16:20/Đã ghi sổ; BH-001/SN: HN12345/10/04 14:15/Đang xử lý. Chi tiết ở `SCANNER_MOCK_DATA_CONTRACT.md`.

## Quy trình chống lệch khi triển khai tiếp

1. Đọc yêu cầu hiện tại và baseline; xác định rõ phần được phép thay đổi.
2. Tái sử dụng tokens/component đã duyệt. Không style lại ba màn để phục vụ một màn mới; ưu tiên scoped CSS.
3. Khi sửa shared CSS, assets, shell, font, auth entry hoặc Home: chụp cả ba màn tại360×800,390×844,430×932 với fixture mặc định. Không dùng store đã bị thao tác làm dữ liệu chuẩn cho visual comparison.
4. Đối chiếu với ảnh v1; kiểm tra bbox, baseline chữ, CTA, icon, alignment và cuộn. Sai khác raster nhỏ do engine cần phân biệt với drift layout; không tuyên bố pixel-identical khi chưa có bằng chứng.
5. Chạy regression chức năng phù hợp: Login→Shift→Home, show/hide/Enter/error/loading, paused/RBAC, navigation/record detail và overlay containment. Không sửa domain để che một vấn đề visual.
6. Sửa mọi drift ngoài phạm vi trước khi bàn giao. Không ghi đè golden images để bỏ qua lỗi.
7. Khi người dùng yêu cầu đổi baseline: chỉ sửa phần được yêu cầu; v1 vẫn giữ làm lịch sử. Ghi version mới sau khi được duyệt.

## Các nguồn implementation cần lưu ý

- `components/scanner-auth.tsx`, `scanner-entry-reference.css`, `scanner-entry-ui.css`.
- `components/scanner-home.tsx`, `scanner-home.css`.
- `components/scanner-preview.tsx`, `scanner-preview.css`, `scanner-visual-lock.css`.
- `components/scanner-mobile-layout.*`, `scanner-app-shell.*`, `scanner-app-overlay.tsx`.
- `components/scanner-approved-assets/`, `lib/scanner-design-fixtures.ts`, `app/layout.tsx`.

Không thay UI trong lần ghi nhận approval này. Không commit/push/deploy và không tự chạy prompt tiếp theo.
