# R20 — chuẩn icon nghiệp vụ Hoa Nam đã được user duyệt

## Phê duyệt và ghi nhớ

User thích ô icon pastel nét mảnh trong Lịch sử và yêu cầu đồng bộ toàn app, giữ cho các màn sau. Đã lưu hướng dẫn có hiệu lực trong repo:
- AGENTS.md: yêu cầu đọc và dùng chuẩn khi sửa docs/flows.
- docs/flows/shared/UI_STANDARD.md: palette, component, kích thước, phạm vi và checklist.
- docs/flows/shared/operation-icons.css: nguồn token duy nhất; history/category-colors.css không còn giữ bản palette riêng.

Chuẩn icon được user duyệt; không suy ra toàn bộ P08 hoặc các board đã được nghiệm thu.

## Rollout hiện tại

- Home:4 tác vụ, lối tra cứu,3 chứng từ gần đây dùng cùng operation palette. Hero/KPI/nav/layout giữ nguyên. Đây là thay đổi màu icon được user yêu cầu, không sửa baseline Home LOCKED.
- P03:4 ô chọn nghiệp vụ. Warning/stop/discard emblems không đổi.
- P04/P05: icon mã phiếu/loại nghiệp vụ theo inbound/outbound; metadata dùng neutral documents. Không đổi validation/submit/receipt.
- P06: icon lịch sử giao dịch theo type, giữ dấu lượng/status. Glyph30px, ô cũ giữ kích thước.
- P07: NFC identity tiles nhận cùng màu tím và glyph30px qua adapter CSS ngoài module. Không sửa nfc.mjs/style.css/artwork/motion r10.
- Hub history nhúng và6 trang history dùng cùng tokens. Standalone boardpreview không bị repaint bởi app-only selectors.
- Các màn sau dùng hn-operation-icon + data-hn-operation + size sm/md/lg. Không thêm/gộp panel hoặc triển khai P09 ngoài phạm vi.

## Kiểm chứng

- check_system_icon_standard.cjs:6/6 nhóm PASS. Home6 viewport; P03/P04/P05/P06/P07/hub actual palettes, fillnone/stroke1.8, CSS layoutbox không đổi khi bật/tắt stylesheet.
- Lượt test đầu dùng tọa độ viewport bị ảnh hưởng timingfit; đổi sang CSSoffset geometry và chờ2RAF. Lượt tiếp gặp Homehidden selector khi mởP03; test được giới hạn visible icons. Không dùng 2lượt lỗi làm PASS.
- Home14/14, Inbound11/11, Lookup11/11, NFC11/11 browser regression PASS trong thư mục riêng r20.
- NFC motion cuối cùng PASS ở nfc-motion-final (infinite/reduced-motion/6 footer layouts/Home). Một lượt trước đó timeout khi chờ #username; chạy lại sạch PASS, không sửa app hoặc bỏ assertion để vượt test. History color regression2/2 PASS, contrast vẫn>=4.5:1 cho palette hiện có.
- Node151/151 PASS, thêm2 test bảo vệ centralpalette/entrypoints và hướng dẫn contributor.
- Đã xem Home, P03, P04, P07 và hub captures. Kiểm thử không thay user nghiệm thu các vùng mới. Integration/hardware NOT_RUN.

## Evidence

evidence/revision-20/system-icon-results.json; home-494x1000.png; p03-operations.png; p04-review.png; p05-review.png; p06-history.png; p07-list.png; history-hub.png.
Subfolders home-regression/inbound-regression/lookup-regression/nfc-regression/nfc-motion-final/history-regression và node-tests.txt.

Giữ24 prompt,91 baseline IDs, dữ liệu và công việc có trước. Không push/merge/deploy.
