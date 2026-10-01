# P06 r03 — ảnh, dữ liệu và lịch sử demo

Ngày 26/09/2026. Người dùng yêu cầu thêm ảnh demo rồi tiếp tục bổ sung dữ liệu/lịch sử mẫu. Chỉ thị này cho phép ảnh minh họa và dữ liệu demo trong P06, thay cho giới hạn không tự tạo ảnh trước đó; không đổi baseline hoặc phê duyệt backend. HEAD vẫn `da9f623a19d0359c3e80c14f8cc612636ec6ab78`, target prototype `docs/flows/lookup/`. Không push/merge/deploy.

## Kết quả

- 7 PNG minh họa bằng built-in image_gen: máy in sáng/đen, cuộn giấy, dây nguồn, bộ vệ sinh, trục lăn, hộp đóng gói. Đã kiểm ảnh và copy vào [assets/demo](../../docs/flows/lookup/assets/demo/). [Prompt set](../../docs/flows/lookup/assets/demo/PROMPTS.md), [nguồn/checksum](../../docs/flows/lookup/assets/demo/MANIFEST.json). Không phải ảnh/model chính thức Xprinter.
- 5 sản phẩm + 1 linh kiện: đủ nhóm, thương hiệu mẫu khi chưa có nguồn, đơn vị, mô tả và tồn từng vị trí. Giữ tổng tồn/khả dụng của5 sản phẩm B06; HN12345 giữ12/10/1/1 và4 vị trí. Linh kiện demo24/20/3/1. SKU/serial/code vẫn tách riêng; máy đen có serial mẫu `SN-XP420B-BK-0008`.
- Tổng36 event riêng theo item/kho: HN12345=7 (giữ baseline), HN12346=6, HN12347=6, HN12348=6, HN12349=5, LK0001-HN001=6. Khoảng01–09/09/2026. Event fixture được khai báo độc lập, không suy từ current stock/status. Đây là một phần lịch sử, không phải sổ đủ để cộng ra tồn hiện tại.
- Bảo hành mẫu có quantity âm/dương/0; hàng hết tồn vẫn có lịch sử. `canOpenDocument=false` giữ nguyên; các mã PN/PX/BH-DEMO nằm trong fixture, không phải phiếu server và không tự mở P12.
- Gallery hiển thị đúng số ảnh hiện có, bấm thumbnail đổi ảnh hero. Bỏ các ô ảnh rỗng/+3 giả khi không có file. Công cụ ngoài app ghi rõ AI/demo, số dòng mẫu; vẫn giữ count128/36 từ metadata board. Có selector chuyển trạng thái thiếu tồn để kiểm null khác0; không làm mất nguồn demo.

## Kiểm chứng

- `node --test tests/*.mjs tests/*.cjs`: **89/89 PASS**,2 test mới kiểm6 item, vị trí/bucket và36 event đúng scope, thiếu dữ liệu có thể hoàn nguyên. [Log](evidence/revision-03/node-tests.txt).
- `node scripts/check_lookup_demo.cjs`: **7 nhóm PASS** (6 item + serial/responsive), ảnh decode thành công, gallery đổi đúng ảnh, tồn tổng/vị trí khớp, bảo hành -2/+1/0, hết hàng vẫn có lịch sử, không lỗi JS/404/request ngoài localhost. [Kết quả](evidence/revision-03/demo-browser-results.json).
- `$env:LOOKUP_EVIDENCE_DIR='handoff/P06/evidence/revision-03/regression'; node scripts/check_lookup.cjs`: **11 nhóm PASS**, gồm search/null/print guard/filter/date/Back/P03/logout và ma trận5 viewport. [Kết quả](evidence/revision-03/regression/browser-results.json).
- Đã xem trực quan actual S01–S04 tại494×1000 CSS px (shell494×950), DPR1/zoom1/Arial; history còn capture360×800,430×932,1440×900. Mã serial dài wrap trong hero, nội dung dài cuộn trong; không overflow ngang.

[S01 có ảnh](evidence/revision-03/P06-S01-demo.png) · [S02 máy đen](evidence/revision-03/P06-S02-demo.png) · [S03 tồn vị trí](evidence/revision-03/P06-S03-demo.png) · [S04 lịch sử máy đen](evidence/revision-03/P06-S04-demo.png) · [Hết hàng vẫn có lịch sử](evidence/revision-03/out-of-stock-history.png) · [Bảo hành linh kiện](evidence/revision-03/component-warranty-history.png).

File mới `lookup/demo-data.mjs`,7 PNG +manifest/prompt set, `scripts/check_lookup_demo.cjs`; sửa adapter/UI/CSS P06, testP06 và tracking. Không thay P01–P05 nghiệp vụ/UI.

## Trạng thái bàn giao

Đủ4 panel P06, vẫn91 dòng coverage. Behavior demo PASS theo các ca đã chạy; bộ lọc nâng cao chưa có tiêu chí nên S01 vẫn BLOCKED phần đó. Visual vẫn chờ nghiệm thu: ảnh demo được phép, chưa phải tài nguyên Designer chính thức, font/icon chưa xác minh khớp pixel. Integration BLOCKED: chưa có API catalog/tồn/event/capability thật; không có ghi WMS, camera hoặc in thật. Tài khoản preview `minhanh` / `preview`; reload mất state bộ nhớ nhưng fixture demo được nạp lại từ source. Chưa chuyển P07.
