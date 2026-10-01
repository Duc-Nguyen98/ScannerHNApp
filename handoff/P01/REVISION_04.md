# P01 revision04 — xác minh và bổ sung ảnh đủ header

Người dùng xác nhận phần vừa sửa đã giống thiết kế, nhưng phản hồi mất background header. Giữ nguyên màu/icon revision03; không diễn giải thành phê duyệt mọi phần khác hoặc quyền thay asset.

## Kết quả kiểm tra

Background KHÔNG bị xóa trong source hoặc runtime. Ảnh bàn giao revision03 chỉ chụp vùng card, tại scrollY276 (S02) và284.8 (S01), nên bỏ phần header. Đây là thiếu sót cách trình bày ảnh bàn giao, không phải bằng chứng lỗi background của app.

- CSS `.hero-image` vẫn chứa ảnh kho, `.confirmation .hero-image` vẫn chứa ảnh nhân sự. File local có thật; HEAD HTTP cả2 asset trả200/image/jpeg.
- Quan sát trực tiếp preview: header đăng nhập ởtop0,height285; ảnh kho hiện rõ. Sau login fixture, header xác nhận có ảnh nhân sự hiện rõ. Primary vẫnrgb(2,81,122), stroke card2.25; không tràn ngang tại viewport kiểm438px.
- Không sửa source ứng dụng, không thay hero/logo/màu/icon, không thay baseline. `style.css` SHA256 `CC18C8BDA0A09805EDE17C37E3C7C6B0B79E8C2839043FDEDA0B2E77223DEEA7`; `app.mjs` `EBCE68D4B94B5554BF92200FA2DE2EAF530F83E58228538EFB140CEA398A0284`.
- Trả emulation/viewport về mặc định và cuộn preview vềtop0 để người dùng thấy header.

## Ảnh bàn giao bổ sung

[Đăng nhập đầy đủ](evidence/revision-04/S01-full.png) · [Xác nhận phiên đầy đủ](evidence/revision-04/S02-full.png).

Do fullPage capture của host có artifact lặp ở phần thấp, ảnh đầy đủ được ghép liên tục từ hai ảnh chụp thật cùng viewport438×570 CSS px, DPR1.25, zoom1; top chụp scroll0, body chụp tại mép card. Không resize/recolor/retouch/inpaint. [capture-parts.json](evidence/revision-04/capture-parts.json) lưu vị trí thật; [assembly.json](evidence/revision-04/assembly.json) ghi đường ghép. Vùng overlap100 raster rows hai capture trùng RGB tuyệt đối (mean difference0 cả3 kênh), không che lỗi. Đây chỉ là evidence, KHÔNG render ảnh ghép làm UI. Script tái lập `python handoff/P01/assemble_header_evidence.py`.

`login-full-capture.png` là raw fullPage diagnostic có lỗi compositor, không dùng nghiệm thu. Các ảnh top/body và ảnh assembled giữ riêng. Không chạy lại unit tests vì không thay app; dùng kết quả27tests revision03 là lịch sử, không PASS mới.

Nền giữ đúng tài nguyên đang dùng trước đó; chưa thay được crop/asset original B01. Không tuyên bố đã tìm ra asset gốc hoặc đã đạt pixel-identical. Visual toàn P01 chưa được nâng PASS; xác nhận mới của người dùng được ghi riêng cho phần màu/icon vừa sửa.
