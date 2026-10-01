# P14 r02 · Căn chỉnh biên nhận khôi phục

Đã áp dụng đề xuất user duyệt vào **P14.S02**. Visual triển khai xong/chờ user review; behavior PASS prototype; integration production vẫn BLOCKED. Không đổi bốn panel, model/receipt/request, authentication, lưu phiếu hay policy ca.

## Kết quả

- Ba cột rõ ràng: icon44px / nội dung co giãn / tác vụ44px. Nhãn16px, giá trị18px, gap4px, leading1.5. Card padding16px; hàng padding dọc12px, tránh cộng đúp mép đầu/cuối; divider bắt đầu cột chữ.
- Bỏ float; nút Sao chép dùng SVG có sẵn từ NFC, vùng44×44px, aria-label/title rõ, nằm ngoài vùng giá trị/reader. Sao chép từ receipt nguyên vẹn; dialog success chỉ sau clipboard xác nhận, fail/unavailable dùng dialog lỗi. Không thêm toast.
- Thời gian `02:21 · 29/09/2026`, theo Asia/Ho_Chi_Minh; giữ timestamp gốc trong datetime và giữ nguyên ID nguồn. Phần ngày trong mã fixture vẫn là ID opaque của adapter r01, không viết lại theo giờ hiển thị.
- Về Đăng nhập vào dock riêng trong AppShell, cao56px/lề24px. Nội dung ngắn không cuộn dư; nội dung dài cuộn nội bộ. Dùng reader shared hai dòng, không cắt dữ liệu.
- CSS chỉ áp metadata receipt; S01/S03/S04 và footer Home/P03 không đổi. Bộ lọc/phiên/phiếu/WMS không nằm trong sửa đổi này.

## Nguồn và ảnh

HEAD da9f623a19d0359c3e80c14f8cc612636ec6ab78; working copy có công việc chat khác. [Bảng quyết định trước sửa](UI_UX_REVISION_02.md). [Review trước–sau](REVIEW_02.html). [Before](evidence/revision-02/before/S02-494x950.png) · [After](evidence/revision-02/after/S02-494x950.png).

Ảnh cùng494×950 CSS px, DPR1, zoom1, Arial, fixture minhanh, clock cố định2026-09-29T02:21:00+07. Không sửa B14 hoặc ảnh feedback. Kích thước/spacing mới là proposal đã được user cho triển khai, chưa tự coi là nghiệm thu visual.

## Kiểm chứng

- `node scripts/check_p14_receipt.cjs`: **6/6 nhóm PASS**. Layout ba cột/sáu viewport, date chính xác, clipboard native/denied/unavailable, Back/Escape/focus/trap/backdrop, reader250/2200ký tự, Unicode/newline/HTML không thực thi, copy nguyên nguồn, CTA cố định. [Results](evidence/revision-02/receipt-results.json).
- `P14_EVIDENCE_DIR=handoff/P14/evidence/revision-02/regression node scripts/check_recovery_shift.cjs`: **16/16 nhóm PASS**, đủ4panel/sáu viewport và regression A01–A05, recovery/shift/error/UNKNOWN/resume/logout. [Results](evidence/revision-02/regression/browser-results.json).
- Viewport494×950,360×800,430×932,1440×900,340×420,1869×940; browser Chromium headless, không pageerror trong lần chạy đạt. Keyboard thiết bị thật NOT_RUN; viewport thấp chỉ mô phỏng.
- Lần kiểm clipboard dài đầu tiên phát hiện **test fixture** cắt đôi surrogate emoji và Windows chuẩn hóaLF thànhCRLF. Đã sửa generator theo code point; kiểm riêng chuỗi nguyên văn truyền vào writeText và kết quả clipboard native với quy tắc newline Windows. Không sửa/cắt nguồn ứng dụng để làm test đạt. Log lỗi đầu ở receipt-failure.json được giữ là lịch sử, kết quả cuối tại receipt-results.json.
- Mã receipt dài được cấp qua intercept module trong browser test cô lập; không thêm test hook vào app hoặc thay adapter thật. Không chạy lại Node/model suite vì model không đổi; evidence49tests r01 vẫn là lịch sử. Syntax view đã kiểm.

## File sửa

`docs/flows/recovery-shift/view.mjs`, `style.css`; thêm `scripts/capture_p14_receipt.cjs`, `check_p14_receipt.cjs`; `check_recovery_shift.cjs` nhận thư mục evidence qua env để không đè r01. Cập nhật report/review/coverage/RUN_STATE. Source manifest ở evidence/revision-02/source-manifest.json. Không push/merge/deploy; production blockers giữ nguyên.
