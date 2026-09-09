# Home — cập nhật theo 2.png / 5.png

Ngày: 09/09/2026. Phạm vi lần này: Trang chủ và header Trang chủ. Không chạy P04, không commit/push/deploy.

## Thay đổi thực hiện

- Gỡ các override Home chồng chéo khỏi `scanner-visual-lock.css`, đặt toàn bộ style Home tại `scanner-home.css`, import sau shared styles.
- Bỏ phụ thuộc `sc-task-grid` cũ; icon/copy/chevron có phần tử riêng. Nhãn và mô tả căn trái, primary description một dòng, icon có nền tonal, package màu vàng trên nền xanh.
- Scale typography, padding, icon, radius và section height theo chiều rộng app viewport đo được. Không còn chữ 10–12px cố định khi preview mở ở494px.
- Header: logo/brand, bell, avatar; greeting đúng copy reference; warehouse badge không đẩy lệch chiều cao hero; overlay kho tối hơn.
- Bell mở `history` hiện có; badge là tổng `db.events.length`, không phải số unread hoặc thông báo server. Accessible label “Xem hoạt động kho”. Không dựng hệ thống thông báo mới.
- KPI một surface ba cột, vạch ngăn rõ, icon cùng hàng với số; giữ giờ bắt đầu ca vừa bổ sung, không ghi đè timestamp.
- Tra cứu: nền xanh sâu, scanner icon trong tonal box, hierarchy/text/arrow đúng vị trí.
- Chứng từ: ngày `DD/MM HH:mm` sang cột phải, trạng thái ở dưới ngày, title/metadata bên trái và chevron ngoài cùng. Ngày đầy đủ gốc còn trong title; không đổi giá trị lưu trữ.
- Giữ nguyên Home task callbacks, lookup read-only, draft resume, route guards và permission checks. Không sửa bottom-nav global hoặc modal.

## Evidence

- [Gallery Reference / Before / After](index.html)
- [So sánh494×1024](reference-before-after-494.png) — cùng chiều rộng vùng app trong ảnh gốc.
- [So sánh390×844](reference-before-after-390.png) — reference được chuẩn hóa để nhìn đối chiếu, không phải pixel-diff nguyên bản.
- [Ảnh sau sửa](after/), [QA](after/qa.json), [vị trí đo](landmarks.json).

## Đối chiếu bốn khối chính ở494px

Các bounds reference được đọc thủ công từ ảnh phẳng2.png, không gồm system chrome.

| Khối | Reference x/y/w/h | After x/y/w/h | Sai số lớn nhất |
|---|---|---|---:|
| KPI | 19 / 231 / 456 / 99 | 19 / 231.78 / 456 / 99.48 | 0.78px |
| Nhập kho | 19 / 385 / 222 / 84 | 19 / 385.72 / 221.67 / 83.59 | 0.72px |
| Tra cứu | 19 / 574 / 456 / 81 | 19 / 575.69 / 456 / 81.06 | 1.69px |
| Hàng chứng từ | 19 / 706 / 456 / 67 | 19 / 706.14 / 456 / 67.13 | 0.14px |

Không suy ra từ bốn landmark rằng toàn bộ giao diện/asset/text đã giống100%. Ảnh hero vẫn dùng approved warehouse asset, không phải pixel gốc của hero trong reference; hình icon là vector runtime. Không vẽ status bar9:41, pin hoặc home indicator giả.

## Kiểm thử

- 360×800,390×844,430×932 và494×1024: Home actions, KPI destinations, record detail, lookup, bell/history, profile PASS; store trước/sau các thao tác đọc không đổi.
- 0 axe WCAG A/AA violations, 0 console/page errors trong các ca Home.
- 4 actions launcher, overlay trong app, Escape close; last document cuộn lên trên nav; nhỏ chiều cao420px vẫn truy cập được.
- Viewer/paused: write tasks bị khóa như trước; tra cứu vẫn mở được.
- Timestamp vẫn giữ sau reload; suite giờ ca chạy lại ở3 viewport PASS.
- Auth/policy/model/intent/shift-time unit tests:28/28 PASS.
- E2E nghiệp vụ:36 checkpoints PASS trên3 viewport: nhập→submit→Post, xuất→recipient/quantity→retry→Post, docs/search, linh kiện bảo hành, warranty status/tabs, NFC bind/revoke và history. Evidence trong `regression-e2e/e2e.json`.
- TypeScript scanner và scoped oxlint PASS.
- Login/Shift before/after ở4 kích thước:8/8 file screenshot giống byte-for-byte. [Entry regression](entry-regression.json).
- Hashes auth/entry/shell/overlay/launcher/domain trước/sau không đổi trong lần này. [Before](before/hashes.json), [After](after/hashes.json).
- Build có cảnh báo libuv Windows sau prerender như các lần trước; artifact đã được kiểm thử qua server4174, không chỉ kiểm tra exit build.

## Dữ liệu khác reference — giữ đúng nghiệp vụ

Store mặc định có1 chứng từPN-0001, không cóPX-0004 đã ghi sổ như ảnh. Không thêm phiếu giả hoặc lấy hồ sơ bảo hành làm chứng từ kho để đủ3 hàng. Danh sách hiển thị tối đa3 chứng từ hiện có; thời gian/ngày/trạng thái lấy từ bản ghi.

Giờ ca hiển thị thời điểm vào ca của phiên, không cố định08:30. Badge chuông là số hoạt động local hiện có, không cố định3 và không giả unread state.

## Kết luận

Cập nhật Home và functional/regression tests: PASS trong phạm vi đã chạy. Không tự chứng nhận “100% pixel-identical” hay nâng kết luận Visual Lock P01–P03 cũ thành PASS. Không tự chạy prompt kế tiếp.
