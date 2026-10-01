# P04 — nguồn và số đo trước triển khai

- Chỉ thị người dùng: P03 tạm chốt; triển khai P04, không mở P05–P24.
- VERIFIED_SOURCE: HEAD da9f623a19d0359c3e80c14f8cc612636ec6ab78; target prototype HTML/CSS/JS. Không có package.json gốc; chạy server scripts/serve_preview.py và Node tests hiện hữu.
- OBSERVED_IMAGE: B04 do người dùng cung cấp, board 1536×1024, 4 panel. BOARD_INDEX ánh xạ đúng design/01_Main/BOARDS/01_UPDATED_BOARDS/02_nhap_kho.png. Gallery public không truy cập được qua web tool; dùng docs/index.html tại commit làm bằng chứng mapping.
- CONFIRMED_HANDOFF: docs/flows/warranty-components/HANDOFF.md, Quy tắc UI: Gửi phiếu lên Web → Chờ xử lý trên Web; Phiếu đã gửi, chưa ghi sổ. Không thông báo thật, không Post. DEV_PROPOSAL chỉ tham khảo, không relax required fields/API.

| Vùng | Số đo estimated từ B04 | Quyết định |
|---|---|---|
| App crop | panel 1 x36..375, y84..931, khoảng 340×847 | Reference CSS 340×847; bỏ OS status bar và caption, giữ control |
| Header | y84..147, cao63; title22, step16 | Gradient xanh đậm; back trái, step phải |
| Body | bắt đầu y133 (overlap14), padding16..20 | Bo góc trên18; flex body/footer |
| Control | cao47..49; gap field12..16; radius8 | Theo thứ tự B04, kho/mã fixture readonly |
| Typography | body14..16; heading18..22; line20..24 | Arial hệ thống, font B04 chính xác UNKNOWN |
| Footer CTA | x53..359, y846..903, cao57 | CTA đáy trong flow, không che nội dung |
| Scan camera | khoảng314×196; action44; counter104 | Ảnh kho repo + khung scan CSS; không dùng crop board làm UI |
| Review | summary row54; SKU row60; card radius9 | 5+4+2=11; tổng từ accepted codes |
| Result | check112; title22; row50..60 | Copy mới có trace HANDOFF/P24.S03 |
| Icons/assets | SVG từ home/scanner-dialogs và lucide trong repo; ảnh scanner-approved | Không tải/sinh icon/font/ảnh; ảnh hộp và camera B04 chính xác thiếu |

Production metadata/create/record/status validation thiếu contract: chỉ fixture namespace riêng hoạt động. Context resume P03 thiếu metadata/catalog đã xác minh phải giữ nguyên context và báo dependency, không thay bằng PN-0005. PN-0005 chỉ là fixture board, không generator ID server. P24 shared waiting-web component chuẩn bị ở P04; không triển khai board P24. P17.S04 là boundary kiểm tra trạng thái trong P04, không tuyên bố hoàn tất P17.

Giữ mọi thay đổi có trước. Kết quả visual cần review, integration BLOCKED cho đến khi có adapter được duyệt. Không sửa dist/gallery/baseline.
