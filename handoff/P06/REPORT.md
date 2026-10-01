# P06 — Tra cứu: bàn giao prototype

**Bản sửa hiện tại:** [Revision04](REVISION_04.md) khắc phục tràn viền/nhãn số tồn theo ảnh người dùng;29 capture overflow đạt,11 nhóm P06 và89/89 Node PASS. Preview vẫn494×950 và dữ liệu r03.

**Mới nhất 26/09:** [Revision03](REVISION_03.md) bổ sung ảnh AI demo theo yêu cầu, đầy đủ dữ liệu6 mặt hàng và36 event mẫu;89/89 Node,7 nhóm demo +11 nhóm hồi quy P06 PASS. Giới hạn ảnh/fixture trong r01 bên dưới là hồ sơ lịch sử, xemr03 cho trạng thái hiện tại.

**Cập nhật mới nhất:** [Revision02](REVISION_02.md) sửa5 lỗi đã tái hiện về scan context/title/Back/filter và thêm xử lý ngày lịch, route Back, mã dài. Kiểm chứng mới:87/87 Node,8 ca sửa lỗi,11 nhómP06,Home14/P03 14 PASS. Các số liệu dưới đây giữ làm hồ sơ triển khai r01.

Đã dựng đủ **P06.S01–S04**, nối Home CTA và P03 → Tra cứu; P05 được người dùng tạm chốt ngày 25/09/2026. Target `prototype`, source thực tế `da9f623a19d0359c3e80c14f8cc612636ec6ab78`, working directory `C:/Users/TAN MIE/Downloads/app_Scanner/ScannerHNApp`. Giữ nguyên công việc P01–P05/warranty có trước; không push/merge/deploy. Không triển khai P07 trở đi.

## Coverage và giới hạn

| Panel | Kết quả | Visual | Behavior | Integration |
|---|---|---|---|---|
| P06.S01 | Search mã/tên/SKU/serial, clear, tabs/count, 5 card, chọn đúng item ID, giữ query/category/scroll khi Back | FAIL / chờ duyệt, thiếu ảnh gốc | BLOCKED một phần: search/tab PASS; filter nâng cao chưa có tiêu chí được duyệt | BLOCKED |
| P06.S02 | Hero, 3 action, thông tin/tồn/gallery slots; chặn in trong control và handler; capability bảo hành kiểm riêng | FAIL / thiếu ảnh, font/icon exact chưa xác minh | PASS fixture cho dữ liệu/guard/navigation; gallery ảnh thiếu nguồn | BLOCKED |
| P06.S03 | Kho khóa theo phiên, tồn12/10/1/1, vị trí6+3+2+1, chỉ đọc | FAIL / thiếu ảnh, chờ duyệt bố cục | PASS fixture | BLOCKED |
| P06.S04 | 7 event mẫu độc lập; lọc type/range inclusive; guard chứng từ theo event | FAIL / thiếu ảnh, chờ duyệt | PASS fixture | BLOCKED |

Không tự khai báo behavior toàn P06 PASS khi filter nâng cao chưa được chốt. Không đánh dấu integration PASS: chưa có adapter/API thật hoặc nguồn event thật. Dữ liệu mẫu nằm trong `fixture-adapter.mjs`, không phát sinh từ current stock/status; 128/36 là metadata tổng mẫu B06, không phải số card đang tải. Linh kiện mẫu phục vụ category/serial/missing-data, không khẳng định là sản phẩm thật.

## Bằng chứng kiểm tra

- `node --test tests/*.mjs tests/*.cjs`: **85/85 PASS**, gồm8 test P06 và77 test có trước. [Log](evidence/node-tests.txt).
- `node scripts/check_lookup.cjs`: **11 nhóm PASS**, bao gồm20 capture viewport chuẩn/mobile/desktop/reduced height, không lỗi JS và không request ngoài localhost. [Browser](evidence/browser-results.json), [metrics](evidence/render-metrics.json).
- `$env:HOME_EVIDENCE_DIR='handoff/P06/evidence/home-regression'; node scripts/check_home.cjs`: **14 nhóm PASS**. [Kết quả](evidence/home-regression/browser-results.json).
- `$env:DIALOG_EVIDENCE_DIR='handoff/P06/evidence/dialog-regression'; node scripts/check_dialogs.cjs`: **14 nhóm PASS**. [Kết quả](evidence/dialog-regression/browser-results.json).
- `$env:OUTBOUND_EVIDENCE_DIR='handoff/P06/evidence/outbound-regression'; node scripts/check_outbound.cjs`: **12 nhóm PASS**, bao gồm hồi quy P04 12 lượt/11 hợp lệ và gửi chờ Web. [Kết quả](evidence/outbound-regression/browser-results.json).
- `python handoff/P06/compare_reference.py`: B06 cung cấp khớp byte với git object tại HEAD; xuất4 native comparisons. Public gallery không truy cập được bằng web tool; dùng object/index local ở commit tham chiếu, không đổi baseline.

| Acceptance | Kết quả thật |
|---|---|
| A01 | PASS fixture: code/name/SKU/serial đúng category/kho, clear không sửa nguồn; counts độc lập5/1 card. Advanced filter vẫn BLOCKED, không bịa tiêu chí. |
| A02 | PASS: tổng12=10+1+1; vị trí6+3+2+1, từng bucket khớp. Không phép ghi tồn. |
| A03 | PASS: HN12349 zero thật; thiếu stock/serial hiển thị “—”, không điền0/SKU. |
| A04 | PASS: in disabled, Tab bỏ qua; gọi handler trực tiếp hoặc hash action=print không in; role Admin không mở quyền. |
| A05 | PASS fixture: type và ngày gồm2 đầu mút, đảo ngày báo lỗi; dấu quantity nguyên từ event; test warranty +2/0/-1 không suy dấu. |

Đã kiểm Escape/focus P03, một overlay, context item/kho/actor/returnTo, native Back và scroll khác0 với nội dung dài, kho dừng vẫn đọc, item deep link sai bị chặn, logout/Back không lộ dữ liệu. Không tự mở camera. OS keyboard/phần cứng/API production **NOT_RUN**.

## Visual

- [Actual4 panel](evidence/P06-actual-overview.png) · [B06 gốc](evidence/B06-reference.png).
- [S01 đối chiếu](evidence/comparison-S01.png) · [S02 đối chiếu](evidence/comparison-S02.png) · [S03 đối chiếu](evidence/comparison-S03.png) · [S04 đối chiếu](evidence/comparison-S04.png).
- [Thiếu tồn](evidence/P06-missing-stock.png) · [Lọc lịch sử](evidence/P06-history-filtered.png).

Shell494×950 CSS px cùng fitPreview Home; header/nav ổn định, cuộn trong; tools ngoài app. Captures494×1000,360×800,430×932,1440×900,340×420; DPR1, zoom1, Arial. Đã xem actual bốn panel và mobile. S01 thấy đủ5 card, S02 gallery tại cuối viewport, S03 đủ4 vị trí/info, S04 đủ7 event. Lịch sử trong detail nằm dưới gallery, cuộn xuống để mở.

Đo trước code tại [CONTEXT.md](CONTEXT.md). Tinh chỉnh compact sau render: card118/high, ảnh96×96, metadata14/18; detail action90, row16/19; location padding8/12; history row79. Tất cả estimated, không phải token gốc B06. Font/icon/ảnh khác baseline, nhãn thiếu ảnh cố ý. Nav tái dùng Home thay vẽ bản thứ hai. Không status bar/caption giả. S03 vị trí không gắn chevron hành động vì không có route/contract; không giả move/xác nhận vị trí. Nút mở tồn và lịch sử chỉ đổi panel read-only. Ảnh so sánh native không resize/mask, tỷ lệ baseline khác shell nên không có pixel-diff PASS.

## File thay đổi

- Mới: `docs/flows/lookup/{index.html,lookup.mjs,lookup-flow.mjs,fixture-adapter.mjs,icons.mjs,style.css}`; `tests/lookup.test.mjs`; `scripts/check_lookup.cjs`; `handoff/P06/`.
- Dependency: `docs/flows/home/home.mjs` mount/routing/context/cleanup; `docs/flows/auth-session/{index.html,app.mjs}` nạp module/CSS; `scripts/check_home.cjs`, `scripts/check_dialogs.cjs` cập nhật assertions cho P06 đã có UI.
- Tracking: `SCREEN_COVERAGE.csv`, `RUN_STATE.json`; lưu input run state trước sửa.

## Điểm cần bổ sung nguồn

1. Đường dẫn asset ảnh máy/giấy/cáp/bộ vệ sinh và gallery từng item được Designer/DEV bàn giao? Không có ảnh rời trong git asset index; hiện dùng ô “Chưa có ảnh”, không sinh/tracing ảnh.
2. Bộ lọc nâng cao gồm trường/option nào và semantics count/paging/search theo nguồn catalog thật? Hiện chỉ triển khai query/category và type/date có trong board; không bịa filter enum/API.
3. Contract đọc catalog/tồn/events/capability, mapping item → warranty/document nào được phép mở? In tem chưa có implementation được duyệt; P09/P12/camera còn pending. Event fixture không phải audit thật.

## Preview

`python scripts/serve_preview.py` → http://127.0.0.1:8766/flows/auth-session/ . Dùng `minhanh` / `preview` → xác nhận phiên → **Quét hoặc nhập mã sản phẩm**, hoặc **Quét mã → Tra cứu sản phẩm**. Chọn HN12345 → bấm **Số lượng tồn kho**; Back về detail, cuộn xuống bấm **Lịch sử giao dịch**. Linh kiện → tìm `SN-LK-0001` kiểm serial/thiếu dữ liệu. Mọi thứ chỉ ở bộ nhớ phiên; reload/đóng tab mất context. Chờ nghiệm thu visual và nguồn thiếu của P06; không chuyển P07.
