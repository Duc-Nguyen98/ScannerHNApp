# P07 r03 — Thêm thẻ NFC để TEST

27/09/2026. User yêu cầu thêm thẻ NFC để test. Đã bổ sung **25 thẻ TAG-006–TAG-030**, giữ5 thẻ cũ, mặc định UI dùng **30 thẻ:16 đã liên kết,9 chưa liên kết,5 tạm khóa**. Đây là dữ liệu demo độc lập, không tạo/đọc thẻ vật lý hoặc ghi WMS.

## Dữ liệu

- TAG-006–019:14 thẻ đã liên kết, UID `NFC-DEMO-006` đến `NFC-DEMO-019`, serial `SN-DEMO-xxx`.
- TAG-020–026:7 thẻ chưa liên kết, không tự gán sản phẩm/serial.
- TAG-027–030:4 thẻ tạm khóa.
- Có máy quét mã vạch, máy in tem, giấy57mm, nguồn máy in, đầu đọc để bàn và cuộn tem. Tên máy in công nghiệp dài để kiểm xuống dòng trong card/dialog.
- Các ID/UID duy nhất. Count của bộ demo đầy đủ được adapter tính theo dữ liệu test đang nạp; không cộng2 tab để suy tổng. Count không thay đổi khi search; phản ánh tổng từng nhóm. Sau liên kết mới, count cập nhật theo rows.
- Baseline5 card/metadata8/5/2 vẫn có tại `createNfcFixtureAdapter()` mặc định; UI yêu cầu dataset mới qua `{extended:true}`. Không sửa ảnh baseline, không coi dữ liệu thêm là dữ liệu Designer/WMS. Bộ test Node baseline vẫn dùng dữ liệu cũ.
- Giữ nguyên search/tab/detail, guard conflict/UNKNOWN và modal/scroll r02. Reload nạp lại30 thẻ và xóa thay đổi thử trong bộ nhớ như trước.

## File

- Thêm `docs/flows/nfc/demo-tags.mjs`.
- Sửa `fixture-adapter.mjs`: tùy chọn extended và count theo dataset đầy đủ.
- Sửa `nfc.mjs`: bật dataset mới và mô tả tools đúng30 thẻ.
- Sửa `scripts/check_nfc.cjs`: count30/16/9, kiểm tìm TAG-030, NFC-DEMO-020, SN-DEMO-019.

## Kiểm chứng

- `node --test tests/nfc.test.mjs`:12/12 PASS, [log](evidence/revision-03/node-tests.txt).
- Node kiểm data:30 ID/UID duy nhất,16 linked/9 unlinked/5 locked; detail TAG-030 trả đúng NFC-DEMO-030.
- `$env:NFC_EVIDENCE_DIR='handoff/P07/evidence/revision-03/nfc'; node scripts/check_nfc.cjs`:11 nhóm browser PASS, bao gồm search/tag detail/tab counts,4 panel, single submit, conflict, UNKNOWN, P06 selection, Back/logout, keyboard và modal. [Kết quả](evidence/revision-03/nfc/browser-results.json).

Mở [preview](http://127.0.0.1:8766/flows/auth-session/) và tải lại → `minhanh` / `preview` → Bắt đầu ca → Thẻ NFC. Có thể tìm `TAG-030` để thử thẻ khóa cuối danh sách, `NFC-DEMO-020` để thử thẻ chưa gắn, `SN-DEMO-019` để thử tìm serial. Phần cứng/backend vẫn NOT_RUN; không chuyển P08.
