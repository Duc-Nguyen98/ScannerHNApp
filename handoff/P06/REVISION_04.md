# P06 r04 — sửa tràn viền và cụm số tồn

Yêu cầu người dùng: sửa tràn lề/tràn viền P06 và vùng khoanh đỏ trong `C:/Users/TAN MIE/Desktop/2.png`; tiếp tục khắc phục đầy đủ. Target prototype; HEAD `da9f623a19d0359c3e80c14f8cc612636ec6ab78`. Không đổi dữ liệu demo, baseline B06, phạm vi4 panel hoặc khung494×950. Không push/merge/deploy.

## Nguyên nhân và sửa

- Tái hiện tại1869×940 CSS px với scrollbar gutter15px như Windows: chữ “Không khả dụng” vượt phần nội dung cột khoảng12.6px; warehouse scrollWidth444 > clientWidth441. `white-space:nowrap` cộng padding hai bên cột khiến nhãn không đủ chỗ. [Trước sửa](evidence/revision-04/before-S03-1869x940.png), [số đo](evidence/revision-04/before-metrics.json).
- Chia4 cột `minmax(0,1fr)`, nhãn wrap đủ chữ, vùng nhãn tối thiểu36px, số căn giữa cùng hàng, tabular digits. Font số28/36; số trên4 chữ số dùng20px. Giá trị12/10/1/1 và màu được giữ nguyên; không rút nhãn nghiệp vụ.
- Tách lớp `.p06-body` giữ bo góc khỏi `.p06-scroll` chứa thanh cuộn. Gutter ổn định để nội dung không nhảy chiều rộng; không che text tràn bằng overflow:hidden trên text.
- Chừa24px trước nav cho phần nhô của nút Quét mã. Khi cuộn cuối, thông tin và nút Lịch sử giao dịch nằm trên nút quét; header/nav giữ vị trí. Bốn vị trí và info của HN12345 nhìn được ở đầu màn chuẩn sau chỉnh gap/padding nhẹ.
- Đảm bảo text dài trong mã, serial, mô tả, lịch sử, thông tin kho xuống dòng trong card. Gallery wrap theo số ảnh. Nhãn/trị trong bảng chi tiết dùng grid minmax0; hàng lịch sử cho tên/ngày wrap khi thiếu chỗ. Trạng thái feedback hiện không bị body âm margin đè lên.

## Kiểm chứng

1. `node scripts/check_lookup_overflow.cjs --before`: lưu bằng chứng lỗi trước sửa, không chạy lại đè ảnh trước.
2. `node scripts/check_lookup_overflow.cjs`: **29 capture đạt**, không overflow ngang ở viewport/page/scroller/card/text ranges, không lỗiJS. 4 panel×6 viewport (1869×940,1495×752,494×1000,360×800,430×932,340×420), thêm long serial/detail/history/date editor và stress text. Kiểm tâm4 số/hàng, tỷ lệ494×950; kiểm keyboard Enter mở lịch sử, header đứng yên, cuối nội dung không nằm dưới scan circle. [Số đo sau](evidence/revision-04/after-metrics.json).
3. `$env:LOOKUP_EVIDENCE_DIR='handoff/P06/evidence/revision-04/regression'; node scripts/check_lookup.cjs`: **11 nhóm PASS**, gồm search,missing,print guard,date filter,Back/scroll,P03 context,logout. [Kết quả](evidence/revision-04/regression/browser-results.json).
4. `node --test tests/*.mjs tests/*.cjs`: **89/89 PASS**. [Log](evidence/revision-04/node-tests.txt).

Captures dùng Chromium, DPR1, Arial, browser zoom1 và fitPreview cùng Home. Scrollbar gutter được chủ động dành chỗ trong test, vì headless có thể dùng overlay scrollbar. Không khẳng định test OS scrollbar/keyboard thật hay mọi zoom chưa chạy. Stress9999/text dài chỉ thay DOM trong browser kiểm tra; không ghi fixture hoặc WMS.

Đã xem trực quan [S03 sau sửa](evidence/revision-04/after-S03-1869x940.png), [S02 mobile](evidence/revision-04/after-S02-360x800.png), [serial dài](evidence/revision-04/after-long-serial-history.png), [cuộn cuối](evidence/revision-04/after-scroll-end.png). Nội dung dài vẫn cuộn trong màn; đó là hành vi có chủ đích, không co khung theo dữ liệu. Không tự tuyên bố toàn B06 pixel-perfect; phần lỗi khoanh đỏ PASS trong ma trận trên, visual tổng thể vẫn chờ duyệt.

File sửa: `docs/flows/lookup/style.css`, `lookup.mjs` (body wrapper/number class), `docs/flows/auth-session/index.html` version stylesheet. Thêm `scripts/check_lookup_overflow.cjs`; cập nhật báo cáo/coverage/run state. Phần còn thiếu nguồn như advanced filter/backend giữ trạng tháiBLOCKED; không liên quan lỗi tràn vừa sửa. Không chuyển P07.
