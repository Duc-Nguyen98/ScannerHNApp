# Rà soát và sửa lỗi UI/UX — r02, 30/09/2026

Đã tái hiện và sửa **11 ca lỗi** sau đợt sáu cải tiến. Phạm vi P01–P11 và component/đường nối liên quan; giữ P01 r06 và P23 r03 hiện hành, 24 board / 91 panel, khung 494×950, footerLOCK và guard nghiệp vụ. [Ảnh trước–sau](REVIEW.html) · [Nguồn / phạm vi](DESIGN_TRACE.md).

## Lỗi thực tế và cách xử lý

| Ca | Bằng chứng trước | Sau sửa |
|---|---|---|
| Tiêu đề dialog dài che nội dung | Shared before: body cao 0px mặc dù vẫn thấy nút xác nhận | Tiêu đề có vùng cuộn tối đa 240 CSS px, keyboard focus khi cần; body đọc được, giữ toàn bộ chuỗi và xuống dòng |
| Ngữ cảnh picker dài bị cắt ngang | scope-before: chuỗi không ngắt dòng tràn khỏi vùng nhìn thấy | Wrap và vùng cuộn cao tối đa 88px, đọc nguyên văn bằng chuột/bàn phím; không thêm overlay |
| Vùng chạm không cập nhật khi chỉ đổi transform | Back từ 44px xuống 26.4px khi scale đổi mà không có window resize | Quan sát transform AppShell, cập nhật kích thước; không lặp observer do custom properties |
| Forward vào dialog đã Hủy làm Back kẹt | P11: Hủy → Forward → Back/Rời màn vẫn ở P11.S01 | Chỉ tiêu thụ marker đã đóng bởi cùng owner; trở lại P10.S04 đúng một bước, không thay marker/caller khác |
| P06 IME rồi Xóa làm tìm kiếm kẹt | Nhập HN12347 nhưng query owner vẫn rỗng | Reset composition theo vòng đời DOM ô tìm |
| P06 IME rồi đổi danh mục giữ cờ cũ | Gõ LK0001 nhưng query vẫn HN12346 | Ô tìm của danh mục mới nhận input bình thường |
| P07 Back nhanh nhảy quá bước | Bấm hai lần từ P07.S03 bỏ qua P07.S02 | Khóa một lần Back đang chờ history, mở lại khi render/show đúng route |
| P07 nguồn lỗi vẫn mở chi tiết | Row click mở dialog dù Enter đã chặn | Kiểm cùng nguồn trước mở; hiển thị lỗi nguồn và Thử tải lại, không coi là rỗng |
| P07 nguồn cũ vẫn mở chi tiết hiện tại | Row click vào dữ liệu stale vẫn mở | Cùng guard với nguồn lỗi; không tự coi dữ liệu cũ là dữ liệu vừa xác minh |
| P11 mắt mật khẩu làm mất focus/caret | Focus ở nút mắt, selection về 0/0 | Pointer giữ input và vùng chọn; Chromium đổi type được phục hồi ở frame sau chỉ khi field còn nguyên; bàn phím giữ focus nút |
| Tên người nhận dài làm phiếu xuất phình | Hàng Người nhận cao 1415px với 2100 ký tự | Hàng còn 101px, Xem đầy đủ mở reader chung; chuỗi không bị cắt/lưu đè, Back/Escape trả focus |

Các ca nguồn error/stale và clear/category được tính riêng vì có bước tái hiện riêng; không gọi mọi ca PASS là lỗi đã sửa. Những kiểm tra chưa phát hiện lỗi gồm input DOM/focus sau resize, collapse/expand, mã dở qua review/Back, phục hồi ảnh tra cứu, focus đúng hàng recent/list cùng ID, history/warranty Back/Forward và footer.

## Kiểm chứng

- **223/223 test logic PASS**, 21 file liên quan: [node-tests-verified.txt](node-tests-verified.txt). Không phải toàn repo hoặc nghiệm thu production.
- Shared: [4 nhóm](shared/verified-02/results.json), [Forward trước](shared/forward-before/results.json) / [sau](shared/forward-after/results.json), [2 nhóm nội dung dài / 6 viewport](shared/long-verified/results.json), [7 ca lifecycle](shared/lifecycle-02/shared-feedback-lifecycle.json).
- Bố cục/vùng chạm: [12 nhóm / 66 lượt đo](shared/touch-regression/results.json), [9 nhóm bấm thực tế](shared/touch-edges/results.json), [7 nhóm hồi quy P10](shared/profile-regression/results.json), [4 viewport footer Home/P03](shared/footer-regression/results.json).
- P06/P07: [7 nhóm trước](p06-p07/before/results.json) có 5 FAIL / 2 PASS; [sau 7 PASS](p06-p07/after/results.json), [6 nhóm picker/copy](p06-p07/nfc-regression/results.json), [4 nhóm liên kết/UNKNOWN](p06-p07/nfc-repeat/results.json), [10 nhóm recent/ngày/logout](p06-p07/recent-regression/after/results.json).
- P04/P05: [quan sát trước](p04-p05/before-complete/results.json) / [sau và reader nguyên văn qua 6 viewport](p04-p05/verified-02/results.json); [11 nhóm hồi quy nhập mã/diff/UNKNOWN](p04-p05/manual-regression/results.json). Các quan sát không có assertion không được cộng thành nhóm PASS.
- P11: [3 ca mắt mật khẩu](routes/eye-verified/results.json), [7 nhóm dialog/layout](routes/security-layout/results.json), [11 nhóm tài khoản preview/phiên/đổi mật khẩu](routes/security-live/results.json).
- Đường nối: [11 nhóm bảo hành](routes/warranty-regression/navigation-results.json), [11 nhóm lịch sử trên ba scene P08 hiện hành](routes/history-verified/results.json); quan sát tuyến tổng thể [trước](routes/before/observations.json) / [sau](routes/after/observations.json).

Các suite cuối được liệt kê không ghi nhận pageerror theo log. Geometry/focus assertions và ảnh actual không chứng minh pixel-perfect; **Visual: AWAITING_USER_REVIEW. Behavior: PASS_PROTOTYPE trong phạm vi đã kiểm. Integration: production/hardware NOT_RUN/BLOCKED.**

## Bằng chứng và giới hạn

Actual trước–sau dùng cùng viewport/DPR/dữ liệu của từng ca; các đồng hồ sống có thể khác thời điểm chạy, không dùng pixel-diff giả. Chuỗi dài/nguồn lỗi chỉ là route-mock hoặc dữ liệu trong browser test độc lập, không sửa dữ liệu người dùng. Đã trực tiếp xem dialog dài, picker, source-error NFC và phiếu xuất sau reader.

Lượt Node đầu có một test hardcode số thứ tự ID theo 3 nguồn cũ; workspace đã có thêm nguồn thứ tư. Đã đổi assertion theo `OUTBOUND_SOURCES.length + 1`, giữ nguyên kiểm preview không cấp ID. Lượt reader đầu đo trước khi ResizeObserver tạo layout xong; sửa test chờ hai frame, không nới điều kiện chiều cao. Lượt lịch sử r22 cũ vẫn đòi selector P08 cho NFC/bảo hành/phiên đã chuyển P22/P23; bộ hồi quy được giới hạn rõ ba scene còn thuộc P08, không rollback app. Logs FAIL được giữ.

Môi trường công cụ bị khởi động lại giữa lượt; server 8766 mất listener hai lần, đã chạy lại cùng `scripts/serve_preview.py`, không reload tab đang có nháp của user. Các lượt connection-refused không được tính là lỗi app đã sửa. Công việc dở và source snapshot vẫn ở thư mục audit.

Không sửa baseline/dist/gallery, không publish/push/merge/deploy, không thêm API/hardware/storage. Bàn phím và cảm ứng thật chưa chạy; mô phỏng IME/viewport không thay thế kiểm thiết bị kho. Không cam kết “không thể phát sinh lỗi” ngoài các ca đã kiểm. Lưu nháp bền vẫn cần contract riêng.

## Files và tái hiện

Chức năng sửa: shared `action-dialog.mjs/.css`, `app-modal.mjs`, `dialog-route.mjs`, `scaled-controls.mjs`; `history/history-picker.mjs`; `lookup/lookup.mjs`; `nfc/nfc.mjs`; `security/security.mjs`; `outbound/outbound.mjs` và `style.css`.

Script audit: `audit_shared_ux_r02.cjs`, `check_shared_long_dialog_r02.cjs`, `check_modal_forward_r02.cjs`, `check_lookup_nfc_audit_r02.cjs`, `probe_manual_audit_r02.cjs`, `check_password_eye_r02.cjs`, `probe_routes_ux_r02.cjs`. Chọn thư mục output mới khi chạy lại. `SUMMARY.json` ghi kết quả từng bộ, `source-sha256.json` ghi nguồn cuối. RUN_STATE thêm record riêng, giữ nguyên checkpoint của chat khác.
