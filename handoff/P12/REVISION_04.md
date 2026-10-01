# P12 r04 · Thống nhất màu/bố cục và test tài liệu PX-0011

User yêu cầu đồng bộ màu và bố cục toàn màn Chứng từ/bốn tab, đồng thời bổ sung case có file để tải và mở. **Đã triển khai**, giữ24 board/91 panel và ID P12.S01–S04. Dữ liệu vẫn là bộ kiểm thử đã được user cho phép; không gắn badge demo trong app.

## Giải pháp đã áp dụng

Nguyên nhân là nhiều màu xanh trung tính gần giống nhau và nhiều rule ghi đè tích lũy qua r01–r03. `style.css` đã được gom rule trùng, và `tokens.css` trở thành nguồn màu trung tính của P12, theo hệ chữ/thẻ P09 và tab chung P08/P09:

| Vai trò | Token / giá trị |
|---|---|
| Chữ chính | `--p12-ink: #203f60` |
| Chữ phụ | `--p12-muted: #526b7d` |
| Hành động | `--p12-primary: #006887` |
| Viền | `--p12-line: #dce9ef` |
| Nền màn/thẻ | `--p12-surface: #ffffff` |
| Nền điều khiển/empty/summary | `--p12-soft: #f7fbfe` |
| Tab chọn | `--p12-selected: #edf8fc` |

- Danh sách, Thông tin, Sản phẩm, Tài liệu, Lịch sử và dialog dùng cùng thứ bậc chữ chính/chữ phụ/hành động. Tiêu đề nội dung đồng nhất20px/600; tên sản phẩm/tệp/sự kiện18px/600. Badge trạng thái và icon nghiệp vụ giữ ý nghĩa riêng, không nhuộm thành màu primary.
- Lề nội dung và thanh tab đều24px; title/card/đường viền căn cùng trục. Các thẻ sản phẩm/tài liệu/timeline dùng nền trắng, viền/radius thống nhất; empty state dùng soft surface chung.
- Phần đầu và4 tab luôn hiện; Sản phẩm có tiêu đề và số dòng như hai tab Tài liệu/Lịch sử. Nút Back có vùng44×44. Chữ selected không xuống dòng; giữ query/scroll/keyboard/Back của r03.
- Cân lại spacing để phiếu7 SP/2 SKU có hai tài liệu vẫn vừa khung Thông tin; baseline11 SP/3 SKU vẫn vừa Sản phẩm. Nội dung dài thực sự tiếp tục cuộn nội bộ.
- Footer giữ contract HN-footer-locked-v1. P12 không chỉnh home/style.css hoặc operation-icons.css/detail-tabs.css. Hash palette/tab chung không đổi. Home CSS có thay đổi trong công việc đồng thời ngoài P12; không ghi đè. Computed footer Home/P12 được kiểm bằng nhau tại lần chạy cuối.

## Case tài liệu để user test

**Chứng từ → PX-0011 → Tài liệu (2)**:

1. `PhieuXuat_PX-0011.pdf`: Phiếu xuất kho,7 sản phẩm/2 SKU, đúng đối tác Cửa hàng An Bình, ngày27/09/2026, người lập Lan Nguyễn.
2. `BienBanGiaoNhan_PX-0011.pdf`: cùng chứng từ và số lượng, bổ sung7 serial từ chính dữ liệu dòng.

Bấm tên tệp mở bản xem thông tin trong app. **Mở PDF** mở file PDF thật trong tab browser mới; **Tải về** lưu PDF về máy. Nút mũi tên ở hàng tệp tải trực tiếp. Mở tệp vừa tải bằng Chrome/Edge hoặc phần mềm đọc PDF. Hai tệp PN-0005 trước đây vẫn còn; PN-0010 giữ0 tệp để test empty state. Không tạo chữ ký/dấu/hóa đơn thuế giả. Metadata PDF ghi nguồn local synthetic; không có badge demo trong UI.

## Kiểm chứng

- **59/59 Node PASS**: document model/inbound/Home/history-picker/query-date/dialog-route. [Log](evidence/revision-04/node-tests.txt).
- **6/6 nhóm theme/download PASS** với Chromium đầy đủ: màu neutral/section/font/align24 tab×viewport, footer khóa, icon/status/action tách biệt, PX-0011 có2 file, popup PDF thật, download/direct download và context. [Kết quả](evidence/revision-04/theme-download-results.json).
- **9/9 nhóm tab/navigation PASS**: persistent tabs, empty/missing, keyboard, query riêng, scroll từng tab, Back/Forward/dialog. [Kết quả](evidence/revision-04/tabs-regression/tabs-results.json).
- **12/12 nhóm data regression PASS**:24 records, scan/serial, PDF cũ/404, P09, ma trận24 panel×viewport, P04 receipt và logout. [Kết quả](evidence/revision-04/data-regression/browser-results.json).
- Tổng **27 nhóm browser**, zero pageerror;59 Node. Viewport494×950,360×800,430×932,1440×900,340×420,1869×940, DPR1/zoom1.
- PDF tải từ UI được lưu thật, so byte và SHA-256 bằng file nguồn; đã mở lại bằng pypdf, xác minh số phiếu/đối tác/tổng7 và2 SKU. Poppler render file đã tải được kiểm. [Kiểm file tải](evidence/revision-04/downloaded-pdf-open-checks.json), [PDF viewer thực](evidence/revision-04/viewer-p12-px0011-receipt.png).
- Lượt đầu headless-shell không có PDF viewer đầy đủ; chuyển sang Chromium `channel: chromium`, native viewer mở được. Lượt kiểm ngắn phát hiện3px cuộn dư sau thêm heading Sản phẩm, đã giảm spacing và chạy lại đạt. Các failure artifact giữ làm lịch sử.

Lệnh: `node scripts/check_documents_theme.cjs`; `DOCUMENTS_TABS_EVIDENCE_DIR=.../tabs-regression node scripts/check_documents_tabs.cjs`; `DOCUMENTS_DATA_EVIDENCE_DIR=.../data-regression node scripts/check_documents_data.cjs`; `node --test tests/documents.test.mjs tests/inbound.test.mjs tests/home.test.mjs tests/history-picker.test.mjs tests/query-date-policy.test.mjs tests/dialog-route.test.mjs`.

## Actual

[Danh sách](evidence/revision-04/list-494x950.png) · [Thông tin](evidence/revision-04/info-494x950.png) · [Sản phẩm](evidence/revision-04/products-494x950.png) · [Tài liệu2 tệp](evidence/revision-04/files-494x950.png) · [Lịch sử](evidence/revision-04/events-494x950.png) · [Xem/Mở/Tải PDF](evidence/revision-04/preview-p12-px0011-receipt.png).

## File và giới hạn

Thay đổi P12: documents/{tokens.css,style.css,documents.mjs,document-model.mjs,assets/PhieuXuat_PX-0011.pdf,assets/BienBanGiaoNhan_PX-0011.pdf}; auth-session/index.html chỉ đổi version stylesheet P12; scripts build/check; handoff/coverage/RUN_STATE. Không sửa dist/gallery/baseline, không push/merge/deploy, không thêm API/quyền/thay tồn.

Visual đã kiểm actual/geometry, chờ user nghiệm thu. Browser/download được kiểm trong Chromium local; không suy mọi PDF reader hoặc hệ điều hành đều đã được test. WMS, storage/upload backend P18, camera/NFC thật vẫn chưa xác minh. Reload khôi phục dữ liệu kiểm thử; không tự reload tab đang có phiếu dở của user.
