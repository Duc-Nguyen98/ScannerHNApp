# P07 r02 — Dialog trong app và cuộn thống nhất

27/09/2026. Theo yêu cầu mới của user, dựa trên Desktop/2.png và 3.png: dialog không được ra ngoài khung app; khắc phục scrollbar khi chuyển tab và áp dụng đồng loạt các màn đã có. Không thay đổi nghiệp vụ, không triển khai thêm P08–P24.

## Giải pháp đã áp dụng

- Lỗi gốc: `dialog.showModal()` đưa NFC detail lên browser top layer; kích thước dùng viewport thay vì tọa độ shell đang scale. Backdrop phủ cả cửa sổ và tools, dialog có thể rộng hơn app.
- Thêm `docs/flows/shared/app-modal.mjs`: dialog dùng `show()` bên trong overlay absolute giới hạn theo shell; vẫn có semantics dialog/aria-modal, focus trap, Escape, backdrop dismiss, hoàn trả focus, inert nội dung/nav/tools và cleanup khi đổi route/logout. Không dùng native top-layer backdrop. Overlay dim chỉ trong app; tools không bị phủ nền tối.
- Header và nút Đóng tách khỏi body cuộn, giới hạn chiều rộng/chiều cao bằng khung app. Nội dung dài xuống dòng và cuộn bên trong; không tràn/không mất nút Đóng. Copy UID giữ nguyên.
- Thêm `docs/flows/shared/app-surfaces.css`: thống nhất `scrollbar-width:none`, WebKit scrollbar 0 và `scrollbar-gutter:auto` cho app surfaces; **giữ overflow auto/native scrolling**. Không dùng `overflow:hidden` để che hoặc cắt dữ liệu. Không thêm wheel hijack cho danh sách. Header/footer giữ nguyên bố cục đã chốt.
- Dùng chung stylesheet tại auth-session entry (P01–P07) và warranty-components entry (25 scene hiện có, kể cả iframe lịch sử Home/P22). Các scroller P04/P05 đã có semantics bàn phím, giữ nguyên; P06/P07 bổ sung tabindex/region để nhận phím cuộn. Tab/search P07 trả về đầu danh sách; width không thay đổi theo việc có/không có nội dung overflow.
- P03 và các sheet warranty đã nằm trong shell, giữ component/behavior cũ; áp quy tắc cuộn chung. Gallery scanner-screens/design không thuộc app, giữ nguyên.
- Outer preview page ẩn chrome scrollbar nhưng vẫn cuộn tới tools ở mobile. Tools ngoài app vẫn có thể cuộn riêng trên desktop; đây là phần DEV, không phải màn sản phẩm.

## Kiểm chứng

`node scripts/check_app_surfaces.cjs`: **7 nhóm PASS**, **39 snapshot audit**, gồm P01.S01/S02, Home, owner P03/P04/P05/P06/P07, modal6 kích thước và **25 scene warranty/history hiện có**. Kiểm style thực đã render: scrollbar none, gutter auto. Chạy Chromium với overlay scrollbar bị tắt để kiểm cả cấu hình desktop scrollbar.

- Sáu viewport CSS: 1869×940,1495×752,685×872,494×1000,360×800,340×420; DPR1.
- So sánh rect dialog/backdrop/shell: dialog nằm trong, backdrop khớp khung app, dialog không thuộc `:modal` top layer.
- Đóng/Esc/backdrop/trap Tab và hoàn trả focus; tools được inert, không bị dim; nội dung nền không cuộn khi cuộn dialog.
- Wheel và End/Control+Home cuộn đến trường cuối TAG-005, header giữ nguyên vị trí; đổi3 tab không đổi width/left. Cảm ứng bằng Chromium CDP touch swipe đạt, thiết bị cảm ứng thật **NOT_RUN**.
- Stress tên sản phẩm dài90 lần: body cuộn trong dialog, nút Đóng luôn trong bounds. Không thay source fixture để chạy stress.
- [Kết quả audit](evidence/revision-02/surfaces/results.json).

Hồi quy tất cả module đã chạm qua shared CSS:

| Lệnh | Kết quả | Evidence |
|---|---|---|
| `node --test tests/*.mjs tests/*.cjs` | 101/101 PASS | [Log](evidence/revision-02/node-tests.txt) |
| `node scripts/check_home.cjs` | 14 nhóm PASS | [Home](evidence/revision-02/home/browser-results.json) |
| `node scripts/check_dialogs.cjs` | 14 nhóm PASS | [P03](evidence/revision-02/dialogs/browser-results.json) |
| `node scripts/check_inbound.cjs` | 11 nhóm PASS | [P04](evidence/revision-02/inbound/browser-results.json) |
| `node scripts/check_outbound.cjs` | 12 nhóm PASS | [P05](evidence/revision-02/outbound/browser-results.json) |
| `node scripts/check_lookup.cjs` | 11 nhóm PASS | [P06](evidence/revision-02/lookup/browser-results.json) |
| `node scripts/check_nfc.cjs` | 11 nhóm PASS | [P07](evidence/revision-02/nfc/browser-results.json) |

Các lệnh browser dùng biến môi trường `HOME/DIALOG/INBOUND/OUTBOUND/LOOKUP/NFC_EVIDENCE_DIR` trỏ lần lượt vào các thư mục `handoff/P07/evidence/revision-02/...` trên; giữ evidence cũ. Tổng80 nhóm browser (73 hồi quy +7 surfaces), 0 JS error. Không test API/NFC thật.

## Ảnh sau sửa

- [Desktop đúng viewport ảnh user](evidence/revision-02/surfaces/modal-1869x940.png).
- [Khung685×872](evidence/revision-02/surfaces/modal-685x872.png).
- [Mobile360×800](evidence/revision-02/surfaces/modal-360x800.png).
- [Modal nội dung dài](evidence/revision-02/surfaces/modal-long-content.png).
- [Danh sách cuộn cuối, không scrollbar](evidence/revision-02/surfaces/nfc-scroll-end.png).
- [Hub lịch sử dùng shared CSS](evidence/revision-02/surfaces/history-hub.png).

Đã xem trực quan desktop, mobile, stress modal và cuối danh sách. Phần lỗi user báo PASS trong ma trận trên. Visual toàn bộ P07 vẫn chờ user nghiệm thu; không tự khẳng định mọi zoom/trình duyệt/thiết bị thật đạt. Các blocker backend/filter/hardware từ REPORT.md giữ nguyên. Bộ25 scene hiện có được kiểm về scroll, không coi P08–P24 đã hoàn thành.

## File sửa

Thêm shared `app-modal.mjs`, `app-surfaces.css`, `scripts/check_app_surfaces.cjs`. Sửa `nfc/nfc.mjs` modal lifecycle/tab scroll reset; `lookup/lookup.mjs` keyboard region; `auth-session/index.html`, `warranty-components/index.html` import CSS; `scripts/check_nfc.cjs` output env và backdrop trong app. Không sửa module nghiệp vụ. Các file inbound/outbound được rà semantics và giữ markup region cũ.

Mở [preview](http://127.0.0.1:8766/flows/auth-session/), tải lại để nạp JS/CSS mới; `minhanh` / `preview` → Bắt đầu ca → Thẻ NFC → TAG-001. Reload đặt lại state demo như trước.
