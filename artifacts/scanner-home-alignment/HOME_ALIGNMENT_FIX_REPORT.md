# Home alignment fix

Ngày09/09/2026. Phạm vi: hai vùng đỏ trong ảnh6 mới nhất. Chỉ sửa `components/scanner-home.css`, thêm QA/evidence. Không đổi mock, dữ liệu store, auth, RBAC, navigation hay nghiệp vụ.

## Nguyên nhân

1. Mỗi KPI dùng luồng block riêng; số1/4 dùng26px, giờ dùng19px và icon khác cỡ, nên vùng số/giờ có chiều cao khác nhau. Nhãn phía dưới lệch5.17–7.09px tùy viewport. Ở434px là6.27px.
2. Mỗi chứng từ tự tính cột metadata bằng `max-content`. Ngày dùng chữ số proportional và badge dài/ngắn khác nhau tạo cột rộng khác nhau; mép trái lệch6.81–9.34px. Ở434px là8.22px.

## Cách sửa

- Tất cả KPI dùng cùng hai grid tracks: hàng giá trị29×scale, gap7×scale, nhãn bắt đầu ở cùng tọa độY. Không dùng margin bù riêng cho “Ca bắt đầu”.
- Danh sách khai báo duy nhất `--sh-record-meta-width`; mỗi hàng dùng cùng độ rộng metadata72×scale. Ngày/giờ và badge căn trái cùng cột; chevron có track riêng, không bị nội dung đẩy.
- Ngày giờ dùng `font-variant-numeric: tabular-nums`, chiều rộng không thay đổi theo chữ số.
- Kích thước vẫn lấy từ app viewport được đo, không lấy chiều rộng cửa sổ desktop. Giữ nguyên cỡ chữ, dữ liệu và action.
- Đường ngăn giữa chứng từ dùng inset shadow không chiếm kích thước layout, loại bỏ chênh lệch chiều cao/offset nội dung do border-top ở riêng hàng2–3.

## Tọa độ đo trực tiếp — CSS px

| Viewport width | ΔY nhãn KPI trước → sau | ΔX metadata trước → sau | Result |
|---|---:|---:|---|
| 360 | 5.17 → 0 | 6.81 → 0 | PASS |
| 390 | 5.59 → 0 | 7.38 → 0 | PASS |
| 430 | 6.20 → 0 | 8.14 → 0 | PASS |
| 434 | 6.27 → 0 | 8.22 → 0 | PASS |
| 494 | 7.09 → 0 | 9.34 → 0 | PASS |
| Desktop1440 (app390) | 5.59 → 0 | 7.38 → 0 | PASS |

Ngoài hai số trong bảng, QA assert cả label bottom, value row top/height, metadata width, timeX, badgeX, chevronX, chiều cao các hàng và offsetY của ngày/badge so với hàng với ngưỡng≤0.1px. Tất cả chênh lệch sau sửa đều0px trong các bản chụp chuẩn.

## Kiểm thử

- 6 kích thước:360×800,390×844,430×932,434×914 (khung gần ảnh đánh dấu),494×1024 và desktop1440×1000 chứa app390.
- Thử đổi DOM trong browser QA sang số128, ngày11/11 11:11 và28/08 20:08, trạng tháiĐã huỷ: các cột giữ vị trí. Không lưu các giá trị stress này vào store.
- Reload vẫn thẳng hàng; dữ liệu08:30 và ba bản ghi approved giữ nguyên.
- Mở ba record đi đúng PN-0001/PX-0004/BH-001; nhấn hai KPI đi đúng danh sách. Store không đổi sau các thao tác đọc.
- Last row cuộn lên trên nav; chiều cao420px vẫn truy cập được. Global scanner sheet vẫn contained và có thể đóng bằngEscape.
- 0 console/page errors; 0 axe WCAG A/AA violations ở6 viewport. Đây là kiểm tra tự động, không thay thế kiểm thử screen reader trên thiết bị thật.
- Hashes JS/TS/domain/entry/launcher/shell/nav trước và sau giống nhau; chỉ Home CSS đổi.
- Standalone build và TypeScript scanner PASS.

## Evidence

- [Before/After](index.html)
- [QA trước](before/qa.json), [QA sau](after/qa.json)
- [Ảnh434 so sánh](comparison-434.png)
- [Ảnh390 sau sửa](after/390-home.png)

Kết luận: **PASS — hai lỗi căn hàng đã sửa và được đo kiểm**. Không suy rộng thành toàn bộ Visual Lock P01–P03 PASS. Không chạyP04; không commit/push/deploy.
