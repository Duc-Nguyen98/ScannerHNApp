# P06 — sửa lỗi UI/UX sau nâng cấp, 29/09/2026

User yêu cầu rà kỹ lại các lỗi phát sinh. Phạm vi thực thi:4 panelP06 và các điểm nối NFC/Bảo hành/vị trí linh kiện hiện có. Đã đọc AGENTS/UI_STANDARD/RUN_STATE mới nhất; repo đang có thêmP18/P19 trong các luồng khác, không ghi đè progress của chúng. Source HEAD `da9f623a19d0359c3e80c14f8cc612636ec6ab78`; target prototype. Không đổi baseline/dist/gallery,24prompt/91panel, footerLOCK; không push/merge/deploy.

## 9 vấn đề đã xử lý

| Vấn đề | Trước sửa | Sau sửa |
|---|---|---|
|Back về nhầm nút|Mở tồn ở section dưới, Back lại focus shortcut trên vì cùng data-action|Markerfocus riêng cho từng nút, giữ scroll/caller|
|Bấm Back liên tiếp|Hai click cùng event-loop tạo2 history.back, bỏ qua detail|Khóa Back trong lúc chuyển history; mở khóa khi route tới nơi, không debounce bằng thời gian tùy ý|
|Mất focus ở ảnh cuối|Next vừa bịdisabled làm focus rơi khỏi dialog|Chuyển focus sang nút ảnh còn dùng được hoặc Đóng|
|Query dài đẩy màn|Chuỗi900ký tự hiển thị toàn bộ trong chip|Preview2dòng và Xem đầy đủ bằng shared/readable-text; input/query gốc không cắt|
|IME nhảy kết quả|Input đangcomposition đã commit query và dựng lại results|Đợi compositionend; Enter229/isComposing không mở sản phẩm|
|Ảnh lỗi không phục hồi|Brokenimg không giải thích/tải lại|Viewer có lỗi nguồn và Thử tải ảnh lại; thumbnail lỗi có placeholder cùng kích thước; load thành công mới phục hồi ảnh, không mất item/selection|
|Focus search hai viền|Viền chữ nhật trêninput lồng trong roundedcontrol|Một outline theo wrapper; keyboard focus vẫn rõ|
|Empty lặp action|Hai nút cùng chữ Xóa từ khóa + Enterhint không đúng lúc0kết quả|Một CTAtext Xóa từ khóa ở empty, giữ iconX trong ô nhập; hint phù hợp empty/error|
|Nút vị trí linh kiện lệch chuẩn|NútHTML mặc định cao30px,padding1/6,radius0|Dùng lại p06-open-filter với iconpin, min48px; điP18 vàBack về đúng linh kiện|

[DECISIONS.md](DECISIONS.md) ghi nguồn trước sửa. [Before-results](evidence/before-results.json) có6caFAIL trước thay đổi; các lỗi hình thức còn lại được thấy trong before screenshots/đo nút30px. [After-results](evidence/after-results.json) có11caPASS, không consoleerror.

## Ảnh và điều kiện

- [Query dài trước/sau](evidence/compare-long-query.png)
- [Ảnh lỗi trước/sau](evidence/compare-image-error.png)
- [Nút vị trí trước/sau](evidence/compare-component-location.png)
- [Viewer ở340×420](evidence/viewer-340x420.png), [tồn ở494×1000](evidence/stock-494x1000.png).

So sánh native494×1000CSSviewport,494×950shell,DPR1,Arial,cùngfixture; không resize/mask. Ma trận6viewport494×1000,360×800,430×932,1440×900,340×420,1869×940. Đã xem ảnh thật query/error/viewer/stock/component. Giữ nội dung cuộn trong app; footer/header không đổi. Đây là visualreview cho phần sửa, không khẳng định toàn boardpixel-perfect hoặc đã được user nghiệm thu.

## Kiểm chứng

Số cuối tổng hợp tại[SUMMARY.json](SUMMARY.json).

- `node scripts/check_lookup_polish.cjs --before`:6lỗi tái hiện trước sửa. Chỉ dùng logbefore đã lưu, không chạy đè sau sửa.
- `node scripts/check_lookup_polish.cjs`:11caPASS. Thêm fullquery2000+Unicode/HTML đọc đúng nguyên văn; chặn requestảnh thật rồi mở lại nguồn và retry;6viewport;P06→P18→Back giữ đúngitem. [Kết quả](evidence/after-results.json).
- `LOOKUP_UX_EVIDENCE_DIR=.../ux-regression node scripts/check_lookup_ux_upgrade.cjs`:10nhómPASS, gồm tìm kiếm/count/IME/modal/type-date/empty/error/scopedcache,footerstyle vàlogout. [Kết quả](evidence/ux-regression/results.json).
- `WARRANTY_NAVIGATION_EVIDENCE_DIR=.../warranty node scripts/check_warranty_navigation.cjs`:11nhómPASS; caller,serial,draft,UNKNOWN,Back/Forward giữ. [Kết quả](evidence/warranty/navigation-results.json).
- FullNode nguồn hiện tại:[node-tests.txt](evidence/node-tests.txt). Snapshot458/458PASS. Đây là toànworkspace, không phải458test do lượt này viết.
- NFC: script tổng cũ `check_nfc.cjs` ban đầu đọc data-copied trước khi ClipboardPromise hoàn tất; đã thêm chờ đúngbằngchứng. Sau đó đi qua5nhóm đầuPASS (gồmP06 exactID) nhưng dừng ở kỳ vọng dialog của các lỗi NFC đã chuyển sangP17. Không sửa app lùi vềUI cũ hoặc báo toànscriptPASS. Testhiệnhành `check_nfc_r13.cjs` được chạy riêng, xemSUMMARYvàevidence/nfc-current.

File được sửa: lookup/lookup.mjs,lookup/style.css; auth-session/index.html versionCSS. Scripts mới check_lookup_polish.cjs; thêm env output cho UX/NFC-r13 suite để không đè bằng chứng trước; sửa testNFC chờ clipboard. Không đổi source nghiệp vụNFC/P09/P18, không thêmAPI/capability.

## Giới hạn

Các lỗi tái hiện nêu trên đã được sửa và kiểm lại. Không có căn cứ khẳng định toàn ứng dụng không còn bất kỳ lỗi nào. Advancedcatalogfilter/backend/hardware vẫn là giới hạn nguồn cũ, không che bằngdata demo. Tiếp tục giữ visual/behavior/integration riêng; integrationproductionNOT_RUN, state trong bộ nhớ mất khi reload. Không tự chuyển prompt hoặc coi report là nghiệm thu.
