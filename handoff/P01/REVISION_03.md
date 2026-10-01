# P01 revision03 — màu và độ đậm icon

Yêu cầu mới: “màu và icon vẫn nhợt nhạt không đậm như trong thiết kế”. Phạm vi: sắc độ/độ tương phản và độ dày nét của icon sẵn có; không đổi geometry/layout, source path icon, hero/logo, font family hoặc auth. Không tạo/thay ảnh.

## Đo trước sửa

`measure_palette.py` lấy mẫu đọc-only từ crop B01 và JPEG revision02, cùng438×834. Các màu dưới đây là median raster **estimated**, không phải CSS original và không là ngưỡng pixel acceptance:

| Vùng | B01 | Revision02 |
| --- | --- | --- |
| Nút chính, vùng không có chữ | #02517a | #005677 |
| Nền ghi chú | #eff8fd | #eff8fd |
| Nền nút đăng xuất | #f6fbff | #f7fbfc |
| Avatar, vùng không có chữ | #016d9c | #007390 |
| Icon kho, pixel xanh | #0c6087 | #19758d |
| Icon thông tin, pixel xanh | #337aeb | #4588b0 |
| Footer, pixel chữ | #8c9ab3 | #97a5ac |

Sampling có ảnh hưởng JPEG/antialias; không lấy màu median pixel viền làm màu source. Sắc icon thông tin cần xanh dương hơn, không cyan. Nét icon card hiện1.8 cần tăng theo phản hồi. Nền ghi chú đã khớp mẫu đo nên không phủ filter/darken cả page.

## Thay đổi được thực hiện

- Nút chính #02517a, hover #034667 cùng sắc xanh dương (bỏ hover xanh lục cũ); avatar #016d9c; ink và footer bớt ngả xám/xanh lục.
- Accent icon thông tin/khiên xanh dương #087aff; khiên fill đậm hơn; kho xanh sâu; nút đăng xuất xanh navy.
- Nét SVG chỉ trong card2.25, thông tin2.4; icon header/logo vẫn giữ nguyên. Không đổi path hoặc kích thước; giữ phân biệt disabled.
- Nền ô Play bớt trong suốt và chuyển sang xanh dương, trạng thái hoạt động đậm chữ/màu hơn.

## Kết quả đã kiểm tra

- 27/27 tests cấu trúc/hành vi/hồi quy PASS; `git diff --check` exit0 (chỉ cảnh báo LF/CRLF ở file history cũ). [Log](evidence/revision-03/test-output.txt).
- `app.mjs` vẫn SHA256 EBCE68D4B94B5554BF92200FA2DE2EAF530F83E58228538EFB140CEA398A0284; `sourced-icons.mjs` vẫn E40F728522EFA29582D165AB5458918A02B797CF60978AC3F84C9E347A1C9833. Không đổi source path icon, logic/render JS, auth và ảnh.
- Browser computed styles xác nhận primary rgb(2,81,122), avatar rgb(1,109,156), accent rgb(8,122,255), card stroke2.25, info2.4, header icon vẫn1.8; opacity enabled=1, hover=false khi capture. [Metrics](evidence/revision-03/confirmation-metrics.json).
- Login→confirmation→logout hoạt động với fixture; ở360px badge không đè caption (caption right218.98, badge left230.90), card/CTA không tràn ngang. Font-weight600 làm badge tăng chiều ngang trong phần trống, không đổi kích thước card/CTA. [Browser checks](evidence/revision-03/browser-checks.json).
- Server preview cũ đã dừng; khởi động lại đúng `python scripts/serve_preview.py`, tải lại tab người dùng. Trả viewport/emulation về mặc định, màn login ở đầu trang.

## Bằng chứng hình thức

[Card xác nhận](evidence/revision-03/confirmation-card.png) · [Card đăng nhập](evidence/revision-03/login-card.png).

Ảnh PNG chụp trực tiếp vùng card, viewport438×570 CSS px, DPR1.25, zoom1; S02 scrollY276, S01 scrollY284.8 (fractional host). Không resize/chỉnh màu ảnh. Capture là ảnh chi tiết để kiểm màu/icon, KHÔNG đối chiếu toàn màn 438×834 như revision02. Capture toàn màn ở viewport lớn gặp lỗi compositor lặp vùng trên host; không dùng ảnh lỗi đó làm bằng chứng và không coi đó là lỗi source đã chứng minh. Các ảnh chi tiết cuối đã xem trực quan, đủ card/CTA/footer, không hover.

Màu/nét đã sửa theo phản hồi; visual toàn P01 vẫn FAIL vì các phần hero/logo/font/texture còn khác. Không báo giống100% hoặc dùng27 tests làm nghiệm thu màu. Không tự sửa những phần ngoài phạm vi phản hồi này.
