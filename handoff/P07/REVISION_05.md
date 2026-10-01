# P07 r05 — Đồng bộ lề/viền và căn nội dung bên trong ô

27/09/2026. User cung cấp Desktop/1.png, yêu cầu sửa dứt điểm lề/viền không đều, đặc biệt S02 Thông tin thẻ. Rà4 panel P07 và dialog; giữ4 panel, dữ liệu/logic5 mã và công việc khác có trước. Không push/merge/deploy.

## Nguyên nhân

- r04 đã căn khung `dd` nhưng `.p07-read-state` còn `justify-content:flex-end`. Vì vậy text UID ở đầu cột, còn chấm/trạng thái ở cuối cột. Trước sửa, mép trái chấm trạng thái lệch **112.23px** khỏi đầu ô ở capture1869×940.
- Card sản phẩm con margin5px, card kho8px, card UID0px; tiêu đề padding12px nhưng dl14px, lệch2 CSS px.
- Dialog dùng flex; padding dành cho nút copy trong `dd` làm flex chia bề rộng khác với hàng thường, vẫn có lệch cột giá trị.

## Sửa

- Cụm trạng thái căn đầu cột, không còn căn phải; chấm đứng đầu cùng cột UID, text tiếp sau với gap10px. Chuỗi dài wrap trong ô, không dùng nowrap để tràn.
- P07 dùng các biến cục bộ: lề trang18px cho scroller/footer; lề card con8px cho product/warehouse/UID hero; lề text12px cho heading/dl. Tính cả border1px thì card con cách mép ngoài9px mỗi bên.
- Bỏ margin âm của khối minh họa/hướng dẫn. Giữ outer card/full-width button thẳng hai mép, header/nav và shell494×950 không thay đổi.
- Dialog P07 chuyển hàng dl sang grid2 cột cùng tỷ lệ như màn thông tin; heading/body/footer cùng padding18px. Nút copy giữ trong ô UID.
- Sửa quy tắc gốc gây mâu thuẫn (không chỉ bổ sung một offset cho chữ “Chưa đọc được”). Cache version NFC CSS đổi `p07-r05`.

## Kiểm chứng

`node scripts/check_nfc_alignment.cjs --before`:6 capture trước sửa, [số đo](evidence/revision-05/before/metrics.json). Chụp trước thay đổi, không chạy đè sau sửa.

`node scripts/check_nfc_alignment.cjs`: **33 capture PASS** sau sửa: S01/S02-chưa đọc/S02-đã đọc/S03/S04 ×6 viewport +dialog +2 stress text/cuộn cuối. Viewports1869×940,1495×752,685×872,494×1000,360×800,340×420; Chromium, DPR1, zoom1, Arial, đợi layout qua2 animation frame trước đo. [Kết quả](evidence/revision-05/after/metrics.json).

Kiểm bằng DOM rect thực: outer left/right của các section và CTA, cân hai lề card con, inset card con giống nhau, heading/label thẳng nhau, `dd` cùng cột; **chấm trạng thái thực sự bắt đầu tại mép ô**, không chỉ so sánh khung `dd`. Sai khác hình học yêu cầu<1px là assertion kỹ thuật, không là ngưỡng pixel-perfect Designer. Kiểm overflow ngang, nội dung dài, modal trong app, scrollbar none qua hồi quy.

- `node --test tests/*.mjs tests/*.cjs`: **104/104 PASS** — [log](evidence/revision-05/node-tests.txt).
- `$env:NFC_EVIDENCE_DIR='handoff/P07/evidence/revision-05/nfc'; node scripts/check_nfc.cjs`: **11 nhóm PASS**,0 lỗiJS/0request ngoài — [kết quả](evidence/revision-05/nfc/browser-results.json).
- `$env:NFC_REPEAT_EVIDENCE_DIR='handoff/P07/evidence/revision-05/repeat'; node scripts/check_nfc_repeat.cjs`: **4 nhóm PASS**, gồm5 mã liên tiếp/UNKNOWN/null serial/cột summary/nội dung dài — [kết quả](evidence/revision-05/repeat/results.json).
- Các bài test P07 được scope selector `.p07-dialog` để không nhầm với dialog tên Home mới có trong working copy; không sửa component Home hoặc công việc đó. Lần đầu test mới bắt được lỗi dialog flex; sửa grid và chạy lại đạt.

## Ảnh nghiệm thu

- [S02 chưa đọc desktop](evidence/revision-05/after/S02-unread-1869x940.png).
- [S02 chưa đọc mobile](evidence/revision-05/after/S02-unread-360x800.png).
- [S02 đã đọc](evidence/revision-05/after/S02-read-1869x940.png).
- [S03 xác minh](evidence/revision-05/after/S03-1869x940.png).
- [S04 hoàn tất](evidence/revision-05/after/S04-1869x940.png).
- [Dialog](evidence/revision-05/after/detail.png).
- [Nội dung dài](evidence/revision-05/after/S02-long-values.png).

Đã xem ảnh S02 desktop, S03 và dialog. Lỗi alignment cụ thể PASS trong ma trận trên. Visual tổng thể vẫn chờ user review, không khẳng định mọi browser/zoom thiết bị thật. Backend/hardware vẫn NOT_RUN; không đổi logic NFC.

File sửa: `nfc/style.css`, `shared/app-surfaces.css` (chỉ selector dialog P07), `auth-session/index.html` (versionCSS), tests browser P07 và thêm `scripts/check_nfc_alignment.cjs`. Cập nhật REPORT/SCREEN_COVERAGE/RUN_STATE. Các bằng chứng revision cũ giữ nguyên.

Tải lại [preview](http://127.0.0.1:8766/flows/auth-session/) → `minhanh` / `preview` → Thẻ NFC → Quét hoặc liên kết thẻ NFC để kiểm khối Thông tin thẻ.
