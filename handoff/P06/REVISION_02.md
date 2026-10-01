# P06 r02 — sửa context, Back/focus và lọc ngày

Yêu cầu: tiếp tục xử lý khắc phục P06. Source HEAD vẫn `da9f623a19d0359c3e80c14f8cc612636ec6ab78`; target prototype `docs/flows/lookup/`, dependency trực tiếp Home/P03. Không sửa baseline, không P07+, không push/merge/deploy.

## Lỗi tái hiện và sửa

| Trước sửa | Sau sửa |
|---|---|
| Từ detail về list rồi Quét mã vẫn mang item HN12345 cũ | Scan từ list mang itemId=null, giữ query/category; scan trong detail giữ đúng item |
| Escape khỏi P03 đổi tiêu đề về P02 | Khôi phục tiêu đề của màn gọi |
| Hủy quét ở P06, về Home rồi mở picker bằng tools bị đưa lại detail cũ | Context hết hiệu lực sau dismiss; không truyền context đã hủy sang lần mở mới |
| Back từ lịch sử mất scroll và focus detail | Lưu vị trí theo panel/item; trả focus về nút Lịch sử giao dịch cùng vị trí cuộn |
| App Back luôn push route cha khiến browser Back quay ngược lại màn con | Pop entry nội bộ đúng cha, fallback replace khi mở deep link; không tạo vòng lặp |
| Áp dụng khoảng ngày đảo ngược xóa 7 event và đóng editor | Giữ bộ lọc/kết quả hợp lệ, giữ editor mở và báo lỗi cạnh input; sửa rồi áp dụng được |
| Ngày không tồn tại như30/02 vẫn qua regex; bỏ cả2 ngày chỉ hiện dấu“-” | Kiểm ngày lịch thực, năm nhuận; cả2 trống hiển thị“Tất cả ngày” |
| Chip chưa có dữ liệu có thể đè mã dài trong hero lịch sử | Chip nằm trong luồng bố cục riêng; mã/SKU/serial dài wrap, card top cho phép xuống dòng |

Nguồn trước/sau: [before-results](evidence/revision-02/before-results.json) tái hiện5 FAIL, [after-results](evidence/revision-02/after-results.json) **8/8 PASS**. [Ngày sai trước](evidence/revision-02/before-invalid-dates.png), [sau](evidence/revision-02/after-invalid-dates.png), [hero mã dài](evidence/revision-02/after-component-history.png), [khoảng ngày mở](evidence/revision-02/after-open-range.png).

## Kiểm chứng

- `node --test tests/*.mjs tests/*.cjs`: **87/87 PASS**, thêm2 test state context và ngày lịch/giữ filter. [Log](evidence/revision-02/node-tests.txt).
- `node scripts/check_lookup_revision.cjs --before`: tái hiện5 lỗi trước thay đổi. Sau sửa: `node scripts/check_lookup_revision.cjs` → **8/8 PASS**.
- `$env:LOOKUP_EVIDENCE_DIR='handoff/P06/evidence/revision-02/regression'; node scripts/check_lookup.cjs`: **11 nhóm PASS**,20 capture ở494×1000,360×800,430×932,1440×900,340×420; DPR1/zoom1/Arial, shell494×950, không overflow ngang. [Kết quả](evidence/revision-02/regression/browser-results.json), [metrics](evidence/revision-02/regression/render-metrics.json).
- Home14 nhóm và P03 14 nhóm PASS sau sửa callback context/title. [Home](evidence/revision-02/home-regression/browser-results.json), [P03](evidence/revision-02/dialog-regression/browser-results.json). Không lỗi JS/request ngoài localhost trong các bộ hồi quy.
- Đã xem ảnh ngày sai/hero linh kiện và actual4 panel sau sửa. Vẫn giữ UI baseline cần nghiệm thu riêng; không suy integration PASS từ fixture.

File sửa: `lookup/{lookup.mjs,lookup-flow.mjs,fixture-adapter.mjs,style.css}`, `home/home.mjs`, `tests/lookup.test.mjs`, `scripts/check_lookup.cjs`; thêm `scripts/check_lookup_revision.cjs`; báo cáo/coverage/run state.

## Phần còn thiếu nguồn

Ảnh sản phẩm/gallery gốc, tiêu chí bộ lọc catalog nâng cao, adapter backend và capability/action in/P09/P12 vẫn chưa được cung cấp. Không tự sinh ảnh, cắt baseline, bịa API hay quyền. Behavior các ca đã kiểm PASS, S01 advanced filter vẫn BLOCKED; visual FAIL/chờ duyệt; integration BLOCKED. Giữ đủ4 panel P06 và91 dòng coverage. P05 vẫn tạm chốt.

Preview local được khởi động lại tại http://127.0.0.1:8766/flows/auth-session/ . Tài khoản fixture `minhanh` / `preview`. Reload xóa context/nháp trong bộ nhớ; không có ghi WMS.
