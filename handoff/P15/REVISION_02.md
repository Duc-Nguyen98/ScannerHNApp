# P15 r02 — áp dụng sáu nâng cấp UX

User yêu cầu áp dụng toàn bộ sáu đề xuất trong chat. Đã triển khai đủ trong bốn panel hiện hữu, giữ footerLOCK, dialog shared, guard và UNKNOWN. **Visual chờ user review; behavior PASS prototype; integration production BLOCKED, hardware NOT_RUN.**

## Kết quả

1. **CTA theo trạng thái:** lỗi đọc dùng Tải lại; UNKNOWN dùng Đối chiếu kết quả; chưa có hàm đọc dùng Xem cách xử lý. Đang xử lý khóa bấm trùng; không gọi mutation.
2. **Ngữ cảnh thật từ owner P04/P05:** loại/số phiếu/trạng thái, Quay lại phiếu. Projection kiểm actor/kho, giữ nguyên số Unicode, không mang note/token/password. Thiếu owner thì không dựng mã giả. Mã dài dùng reader chung.
3. **Hết phiên:** giải thích đăng nhập lại để tiếp tục phiếu, đúng tài khoản/kho và dữ liệu còn cần đối chiếu. Giữ cơ chế auth r01: đăng nhập→xác nhận→caller; không thêm persistence hoặc lời hứa lưu server.
4. **Quyền thiết bị:** camera denied ưu tiên Hướng dẫn cấp quyền; nút phụ Kiểm tra lại camera dùng sau khi người dùng đổi settings. Hardware-error ưu tiên kiểm tra lại. Camera/NFC unsupported mỗi card chỉ một hướng dẫn, đúng loại thiết bị; không xin quyền vô tác dụng. NFC chưa xác minh không báo ready.
5. **Thiếu quyền:** câu cụ thể chỉ khi caller cung cấp actionLabel đã xác định; thiếu nguồn vẫn dùng câu chung. Có contact thì nút Liên hệ quản trị mở thông tin; chưa cấu hình thì hướng dẫn phụ44px, không bịa kênh hoặc tự gửi tin. Hành vi guard r01 giữ nguyên.
6. **Bố cục:** hero112/icon76 thay144/100; S01–03 có vùng nội dung cuộn và dock CTA cố định. Giữ header100, CTA56, lề24 và footer chung. S04 giữ hai card riêng.

[Quyết định/nguồn](DECISIONS_02.md) · [Review trước–sau](REVIEW_02.html) · [Nguồn r01](REPORT.md).

## File và phạm vi

HEAD tham chiếu `da9f623a19d0359c3e80c14f8cc612636ec6ab78`, working copy prototype HTML/CSS/JS. Sửa `system/view.mjs`, `system/style.css`, `home/home.mjs`; thêm `system/presentation.mjs`, test presentation và scripts capture/UX. Hai script kiểm r01 chỉ thêm output-dir qua biến môi trường để không ghi đè evidence cũ. Bổ sung README/checkpoint/coverage. Không sửa auth policy, business models P04/P05/P07, shared dialog/footer/palette, dist/gallery hoặc baseline. Không push/merge/deploy.

## Kiểm chứng

- `node --test tests/system.test.mjs tests/system-presentation.test.mjs tests/auth-session.test.mjs tests/auth-session-stability.test.mjs tests/home.test.mjs tests/inbound.test.mjs tests/outbound.test.mjs tests/nfc.test.mjs tests/p14-logout-retention.test.mjs tests/dialog-route.test.mjs`: **127/127 PASS**. [Log](evidence/revision-02/node-tests.txt).
- `node scripts/check_p15_ux.cjs`: **6/6 nhóm PASS**: CTA đọc/khóa gửi trùng; context UNKNOWN/dock năm viewport; Unicode2000/reader/focus; action/contact có cấu hình; denied/unsupported; thông điệp reauth và owner thật. [Kết quả](evidence/revision-02/ux-results.json).
- `P15_EVIDENCE_DIR=handoff/P15/evidence/revision-02/regression node scripts/check_p15.cjs` và `node scripts/check_p15_edges.cjs`: **8+4 nhóm PASS**, gồm giữ request qua reauth, không replay, native Back/dialog và stream cleanup qua API mock. [Chính](evidence/revision-02/regression/browser-results.json) · [Edge](evidence/revision-02/regression/edge-results.json).
- `HOME_FOOTER_EVIDENCE_DIR=handoff/P15/evidence/revision-02/footer-regression node scripts/check_home_footer_locked.cjs`: **4 viewport PASS**. [Kết quả](evidence/revision-02/footer-regression/results.json).
- `node scripts/capture_p15_revision.cjs`, đặt `P15_CAPTURE_DIR` lần lượt before/after: bốn panel mỗi bộ, **494×950 CSS px, DPR1, zoom1, Chromium, Arial, cùng fixture default**. Before chụp trước khi sửa source. Năm viewport kiểm UX:494×950,360×800,430×932,1440×900,340×420. 340×420 chỉ mô phỏng vùng thấp, không phải kiểm keyboard thiết bị thật.

Tổng **22 nhóm/viewport browser**; không pageerror trong suite đạt. Hai lần đầu UX harness lỗi do chưa chờ Home mount và dùng innerText đọc pre đang ẩn; sửa harness và chạy lại6/6. Không phải lỗi sản phẩm đã được che; log chẩn đoán giữ tại ux-failure.json. Source hash ở source-manifest.json.

## Coverage / giới hạn

P15.S01–S04 đều behavior PASS, visual IN_PROGRESS (chờ review), integration BLOCKED. Bốn panel và91panel chung giữ nguyên. Contact và actionLabel cụ thể mới chỉ kiểm fixture có cấu hình; backend phải cung cấp nguồn đúng. Camera denied/granted/hardware branch dùng mock, không chứng minh thiết bị thật. HTTP/WMS/read status/P17, quyền, retention policy production và native NFC vẫn chưa tích hợp. Kết quả r02 không thay nghiệm thu các module ở chat khác.
