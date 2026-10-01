# P15 r03 — audit UI/UX và sửa lỗi

User yêu cầu rà soát kỹ và khắc phục lỗi UI/UX còn phát sinh sau r02. **7 lỗi được tái hiện trước sửa, đều qua lại ca kiểm chứng sau sửa.** Giữ bốn panel, shell494×950, footerLOCK và nghiệp vụ UNKNOWN. Visual vẫn chờ user review; behavior PASS trong phạm vi prototype; backend/native hardware chưa nghiệm thu.

## Findings → sửa

| ID | Lỗi trước sửa | Khắc phục |
|---|---|---|
| F01 | Đóng hướng dẫn từ Xem cách xử lý trả focus về heading thay vì nút | Không dựng lại DOM cho thao tác mở hướng dẫn; retry có cập nhật khôi phục đúng CTA |
| F02 | Cập nhật camera reset vị trí đọc40→0 khi tăng cỡ chữ; mất focus; thiếu busy semantics | Giữ scroll/action trước render, trả focus vào control hoặc heading khi control disabled; aria-busy phản ánh request |
| F03 | Camera đã cho phép vẫn yêu cầu Cấp quyền để quét | Nội dung riêng cho granted; not-requested dùng màu trung tính, không giả là lỗi |
| F04 | NFC bị từ chối mở hướng dẫn thiết bị hỗ trợ chung | Title/copy riêng cho denied và hardware-error; unsupported vẫn đúng hướng dẫn thiết bị |
| F05 | Đối chiếu trả403 chỉ hiện panel, chưa gọi guard caller | onForbidden nối effective guard Home trước khi hiện S03; response trả về401/403 cũng được map, không chỉ catch |
| F06 | Nút trong panel hidden vẫn gọi camera qua handler còn gắn | Kiểm active/disposed/hidden/contains và busy trước thao tác; response muộn không mở lại UI |
| F07 | Đóng trạng thái bằng CTA để lại bước history trống | Dùng createDialogRoute chung; đóng tiêu thụ entry; chuyển menu/chuyển màn đợi route đóng xong, không lệch URL/UI |

[Trước:7 FAIL/1 PASS](evidence/revision-03/before/audit-results.json) · [Sau:8 PASS](evidence/revision-03/after/audit-results.json). F08 trong suite là kiểm không pageerror, không phải lỗi thứ8. F02 có mô phỏng tăng chữ body24px/line-height36px để tạo nội dung cuộn, cùng điều kiện trước/sau.

Thêm kiểm cleanup camera: mọi track được dừng ngay cả khi bước xác minh hoặc một track.stop lỗi. Không tiếp tục mutation, cấp quyền hoặc báo sẵn sàng từ fixture. Expired được xử lý ổn định khi đã mở, không lặp dựng màn mỗi lần chạm nav.

## Visual/source

[Review r03 trước–sau](REVIEW_03.html). 4 panel×2 bộ ảnh canonical494×950,DPR1,zoom1,Arial,Chromium; baseline B15 giữ nguyên. [Before](evidence/revision-03/before) chụp trước sửa; [after](evidence/revision-03/after) chụp sau sửa. Header/control/dock và footer giữ kích thước; không thiết kế lại màn. Phần tử hero/context không bị flex ép nhỏ khi nội dung dài. Not-requested camera từ đỏ sang màu chữ phụ theo nghĩa chưa yêu cầu, không thay màu denied/unsupported hoặc palette nghiệp vụ.

HEAD `da9f623a19d0359c3e80c14f8cc612636ec6ab78`; working copy có cập nhật P16–P19/P05 từ các chat khác. Chỉ sửa `system/view.mjs`, `system/model.mjs`, `system/style.css` và điểm nối guard/lifecycle của `home/home.mjs`; tái sử dụng shared/dialog-route, không sửa implementation shared. Source trước trong `before/source`; hash cuối ở [manifest](evidence/revision-03/source-manifest.json). Thêm tests/scripts audit-navigation, cập nhật test runner nhận địa chỉ/output; không sửa baseline/dist/gallery, không push/merge/deploy.

## Kiểm chứng

- Node suite auth/Home/P04/P05/P07/P14-retention/dialog/system: **129/129 PASS**; [log](evidence/revision-03/node-tests.txt). Gồm2 test mới response401/403 và cleanup nhiều track.
- `node scripts/audit_p15_r03.cjs`: **8/8 PASS** sau sửa; [kết quả](evidence/revision-03/after/audit-results.json).
- `node scripts/check_p15_navigation_r03.cjs`: **4/4 PASS** — nav Chứng từ/Cá nhân đúng URL, Home CTA, native Back đóng guide trước panel, expiry thay trạng thái không bị callback cũ ẩn; [kết quả](evidence/revision-03/navigation-results.json).
- `node scripts/check_p15_ux.cjs`: **6/6 PASS**, gồm Unicode2000/reader/focus, dock5viewport, configured-contact fixture, owner context; [kết quả](evidence/revision-03/ux-results.json).
- `node scripts/check_p15.cjs` + `node scripts/check_p15_edges.cjs`: **8+4 PASS**, request/ID/nháp, UNKNOWN, camera mock và reauth; [chính](evidence/revision-03/regression/browser-results.json), [edge](evidence/revision-03/regression/edge-results.json).
- `check_p14_logout.cjs`: **7/7 PASS**; [kết quả](evidence/revision-03/p14-regression/logout-results.json). `check_home_footer_locked.cjs`: **4 viewport PASS**; [kết quả](evidence/revision-03/footer-regression/results.json). Chỉ đổi output/URL khi chạy, không ghi đè evidence P14.

Tổng **41 nhóm/viewport browser** (8+4+6+8+4+7+4); không pageerror trong suite đạt. Viewport494×950,360×800,430×932,1440×900,340×420; P14 thêm1869×940. Cỡ nhỏ mô phỏng layout, không chứng minh bàn phím/native thật.

Các lượt đầu gặp cold-load/module transport treo trong preview khi source chung đang cập nhật. Kiểm cuối chạy server Node đọc đúng source trên127.0.0.1:8780 với MIME JavaScript và no-store, không mock các module ứng dụng; helper tại `evidence/revision-03/preview-server.cjs`. Không chỉnh bootstrap/source của chat khác. Chẩn đoán lỗi runner giữ trong evidence. Script cũ còn đòi UNKNOWN tự mở P15, trong khi P17.S04 đã được triển khai ở chat khác; đã cập nhật assertion chấp nhận boundary owner hiện hành và kiểm cùng request/no replay. Không đổi P17 để làm test cũ pass.

## Giới hạn

Kết luận áp dụng các nhánh đã kiểm của P15 và dependency trực tiếp, không khẳng định toàn bộ app hoặc thiết bị thật không còn lỗi. Camera/NFC trong ca tương tác dùng môi trường browser/API mock; WMS, auth/permission/contact/retention policy production chưa tích hợp. Tạm chốt r02 ở chat khác được giữ là lịch sử, không tự coi r03 đã được nghiệm thu. Coverage vẫn91panel, P15.S01–S04 visual IN_PROGRESS, behavior PASS, integration BLOCKED.
