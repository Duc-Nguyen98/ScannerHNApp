# P03 r08 — Khung Quét mã đồng bộ Trang chủ

Ngày 2026-09-27. Theo yêu cầu mới: kích thước màn Quét mã phải khớp các màn khác.

Nguyên nhân: P03 ghi đè chiều rộng thành 394px và đặt chiều cao theo viewport; P02 dùng khung 494×950 rồi thu phóng đồng đều. Tại tab thực tế 703×873, P03 trước sửa rộng 394px, còn Home rộng 453.96px.

Đã bỏ ghi đè kích thước riêng của P03 để kế thừa trực tiếp chiều rộng/min-height từ khung P02. Bỏ tính chiều cao riêng theo viewport trong fitPreview; chỉ giữ đo chiều cao footer. Không sửa kích thước P02. Backdrop vuông 80%, footer DOM/CSS P02, nút thao tác và chặn click backdrop giữ nguyên. Cập nhật phiên bản CSS/module r08 và nạp lại tab đang dùng.

## Kiểm chứng thực tế

- Tab Codex in-app browser: Home và P03 đều 494×950 logical, cùng transform scale(0.918947), cùng x=124.516 và kích thước hiển thị 453.96×873; footer trùng vị trí/kích thước.
- 7 cặp Home/Quét mã PASS: chiều rộng, cao, lề trái sai khác dưới 1px; không tràn ngang; footer ở đáy app; dialog không chồng footer. Bao gồm màn hẹp, thấp, desktop và viewport cao hơn 950px.
- 21 trường hợp S02/S03/S04 trên cùng 7 kích thước PASS. Tổng 28 trường hợp P03 đã đo/capture. [Số đo](evidence/revision-08/frame-results.json).
- Kích thước yêu cầu 360×800, 394×692, 430×932, 494×950, 1440×900, 600×1200, 394×420. IAB có thể trừ vùng chrome: báo cáo giữ cả requestedViewport và viewport thực, so sánh bằng số đo DOM thực tế.
- 22/22 Node tests Home/P03 PASS (`node --test tests/scanner-dialogs.test.mjs tests/home.test.mjs`). Không ghi các suite lịch sử là chạy lại.
- Script check_dialogs.cjs đã đổi assertion sang khung 494×950 và footer neo đáy app. Lần này kiểm UI bằng IAB trực tiếp; không tuyên bố chạy lại script headless.

[Home thực tế](evidence/revision-08/live-home.png) / [Quét mã thực tế](evidence/revision-08/live-scan.png).

Visual: xác minh khung chung và không chồng footer; chưa nghiệm thu pixel-perfect toàn board. Behavior: Node regression PASS; backend/hardware chưa tích hợp. Không thay baseline/dist/gallery hoặc mở rộng prompt; không push/merge/deploy.
