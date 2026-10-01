# P07 — Thẻ NFC

Ngày 26/09/2026. Đã triển khai **4/4 panel prototype**, chờ người dùng review hình thức. P06 được người dùng **tạm chốt**, có thể bổ sung state đồng bộ sau. Không chuyển P08.

## Source / target

- HEAD thực tế và commit tham chiếu: `da9f623a19d0359c3e80c14f8cc612636ec6ab78`.
- Working directory: `C:/Users/TAN MIE/Downloads/app_Scanner/ScannerHNApp`; `target_kind=prototype`, HTML/CSS/JS trong `docs/flows/nfc/`.
- Đã đọc P07, Contract v2.0 và BOARD_INDEX người dùng cung cấp, HANDOFF/DEV_PROPOSAL, source Home/P03/P06, P06 REVISION_04. Quyết định và số đo trước code: [CONTEXT.md](CONTEXT.md).
- B07 cung cấp **khớp byte** với git object của commit. SHA256 `63f4b3876547ffec943f0e8f369eb22b48ba715ec38b14c51030a150b19a3b65`; [chứng cứ](evidence/baseline-source.json), [baseline](evidence/B07-reference.png). Web tool không tải được gallery/ảnh remote; danh mục local `docs/index.html` có NFC đúng `01_UPDATED_BOARDS/05_nfc.png`.
- Working copy P01–P06/warranty có trước được giữ; không sửa gallery, bundle dist, baseline, API hoặc dữ liệu WMS. Không push/merge/deploy.

## Coverage

| Panel | Nội dung và hành vi | Visual | Behavior | Integration |
|---|---|---|---|---|
| P07.S01 | Danh sách TAG, trạng thái, UID/tên/SKU/serial search, ba tab, mở detail bằng tag ID, nút thêm/entry | IN_PROGRESS | BLOCKED: filter nâng cao thiếu tiêu chí; phần fixture còn lại PASS | BLOCKED |
| P07.S02 | Bước1/3, chọn qua P06, kho khóa, artwork NFC, UID/chưa đọc, CTA disabled | IN_PROGRESS | PASS fixture | BLOCKED |
| P07.S03 | Bước2/3, UID/copy/ngày đọc, sản phẩm/kho, chờ xác nhận, kiểm mapping trước gửi | IN_PROGRESS | PASS fixture | BLOCKED |
| P07.S04 | Check/success summary từ receipt, xem đúng thẻ, về Home; list/detail cập nhật cùng tag ID | IN_PROGRESS | PASS fixture | BLOCKED |

Không thiếu panel. Chi tiết thẻ là dialog runtime của S01/S04, không tạo board mới. P15/P17 chỉ có cảnh báo và navigation context pending; **chưa coi panel P15/P17.S03 đã được dựng**. P03 vẫn có đúng4 nghiệp vụ theo nguồn; NFC vào từ Home. Tab Quét mã vẫn mở P03.

## Logic và giới hạn dữ liệu

- Adapter độc lập namespace `hn-scanner-nfc-fixture-v1`, chỉ bộ nhớ; reload/đăng xuất mất state demo. Controls mô phỏng nằm ngoài app; không gọi Web NFC/camera/API ghi.
- Đọc UID chỉ tạo read result. Tiếp tục kiểm context/capability/mapping. Xác nhận khóa submit trùng, kiểm lại mapping và chỉ mở S04 khi receipt khớp request/UID/tag/item/actor/kho, có thời gian và product response.
- Unsupported, permission denied, read error, locked và conflict phân biệt. Conflict cung cấp context `P17.S03`, không overwrite. Không định nghĩa NDEF/payload/secret/write/read-back.
- UNKNOWN giữ request/UID/item, không gửi lại mù hoặc đổi sản phẩm; nút Kiểm tra kết quả đối chiếu cùng request. Kho dừng chặn ghi và giữ context. Back/Forward không tạo receipt, logout không phục hồi dữ liệu qua Back.
- S04 actor/thời gian/kho/sản phẩm dùng response fixture, không dựng từ thời điểm render. Không phát audit event hoặc suy lịch sử từ current tag state. P22 audit vẫn thiếu nguồn thật.
- Counts8/5/2 là metadata fixture từ board, 5 card là tập nạp một phần; thêm thẻ demo mới cập nhật metadata trong adapter, không suy 8=5+2.
- P07 mặc định dùng item serial fixture riêng HN12345 theo B07. P06 HN12345 có serial null nên khi chọn từ P06 vẫn hiện `—`; không đổi code thành serial hoặc sửa P06 để ép giống B07. Mọi lựa chọn P06 giữ ID/code/SKU/serial nguồn P06.

## Kiểm chứng thật đã chạy

| Ca | Kết quả | Bằng chứng |
|---|---|---|
| P07.A01 | PASS fixture: chưa đọc disabled; unsupported không gọi adapter đọc/hardware giả | `tests/nfc.test.mjs`, browser group1–3/6 |
| P07.A02 | PASS fixture: read/prepare không mapping/success; deep link không vượt receipt guard | Node và browser group3/10 |
| P07.A03 | PASS fixture: thẻ đã gắn item khác không overwrite | Node và browser group6 |
| P07.A04 | PASS fixture: single-flight, 1 mutation; detail/list cùng tag ID | Node và browser group4/7 |
| P07.A05 | **NOT_RUN phần cứng thật**; mock PASS không thay E2E | browser hardware field, không có thiết bị/adapter production |

- `node --test tests/*.mjs tests/*.cjs`: **101/101 PASS** (12 NFC + 89 hiện có), [log](evidence/node-tests.txt).
- `node scripts/check_nfc.cjs`: **11 nhóm PASS**, 0 JS error, 0 external request, không gọi `NDEFReader`; [kết quả](evidence/browser-results.json).
- **32 capture có số đo đạt kiểm tràn**: 4 panel ×6 viewport (494×1000,360×800,430×932,1440×900,340×420,1869×940), 6 trạng thái lỗi/UNKNOWN, 2 long text/cuộn cuối. DPR1, zoom1, Chromium, Arial. Không tràn ngang page/scroller/text; nội dung nằm trên footer. Thêm ảnh dialog mobile, focus trap/Tab/Esc/backdrop/copy và Back/Forward được kiểm. [Metrics](evidence/render-metrics.json).
- `$env:LOOKUP_EVIDENCE_DIR='handoff/P07/evidence/lookup-regression'; node scripts/check_lookup.cjs`: **11 nhóm PASS**, [kết quả](evidence/lookup-regression/browser-results.json).
- `$env:HOME_EVIDENCE_DIR='handoff/P07/evidence/home-regression'; node scripts/check_home.cjs`: **14 nhóm PASS**, [kết quả](evidence/home-regression/browser-results.json). Assertion NFC đã đổi từ pending sang panel thực.
- `node handoff/P07/compare_reference.cjs`: xuất4 so sánh native và overview. Lần chạy đầu từng gặp preview server cũ dừng và lỗi timing/điểm xuất phát trong harness; đã khởi động lại server, sửa harness, chạy lại thành công. Các file `browser-failure.*` là chẩn đoán lần trước, không phải kết quả cuối.

## Visual review

[Review HTML](REVIEW.html) · [Overview actual](evidence/P07-actual-overview.png) · [Thông số so sánh](evidence/baseline-comparison.json).

| Panel | Actual | Baseline cạnh actual |
|---|---|---|
| S01 | [Danh sách](evidence/P07-S01-494x1000.png) | [So sánh1](evidence/comparison-S01.png) |
| S02 | [Đọc thẻ](evidence/P07-S02-494x1000.png) | [So sánh2](evidence/comparison-S02.png) |
| S03 | [Xác minh](evidence/P07-S03-494x1000.png) | [So sánh3](evidence/comparison-S03.png) |
| S04 | [Hoàn tất](evidence/P07-S04-494x1000.png) | [So sánh4](evidence/comparison-S04.png) |

Đã xem4 panel actual và ảnh long identifier/dialog mobile. Giữ shell494×950, scale cùng Home, nội dung cuộn trong; S01 dùng nav chung, S02–S04 không nav theo B07. Header/footer ổn định; sửa gutter ngoài riêng P07 để không cắt góc phải. S01 card cuối có thể cần cuộn theo viewport/font; toàn bộ5 card truy cập được. UID/status và summary không bị footer phủ khi cuộn cuối.

Khác biệt còn lại: ảnh board native có tỷ lệ khác shell được chốt; không kéo méo baseline/đặt ngưỡng pixel tự duyệt. Bỏ status bar/caption theo contract; Arial và icon repo chưa được xác nhận trùng font/icon Designer; hộp là ảnh AI demo P06. Artwork NFC dùng đúng phần minh họa sẵn có của B07 qua CSS crop, không dùng full board làm UI; [provenance](../../docs/flows/nfc/assets/README.md). Visual **IN_PROGRESS**, chưa tuyên bố pixel-perfect/được user chốt.

## File và bàn giao

- Thêm `docs/flows/nfc/{index.html,nfc.mjs,nfc-flow.mjs,fixture-adapter.mjs,style.css,assets/*}`.
- Sửa `docs/flows/auth-session/index.html` thêm stylesheet; `home/home.mjs` mount/route/cleanup/P06 selection context; `lookup/lookup.mjs` callback chọn item chỉ trong mode NFC. UI P06 thông thường giữ nguyên.
- Thêm `tests/nfc.test.mjs`, `scripts/check_nfc.cjs`; sửa route assertion trong `scripts/check_home.cjs`.
- Thêm `handoff/P07/*`, cập nhật `SCREEN_COVERAGE.csv`, `RUN_STATE.json`; snapshot đầu phiên tại [INPUT_RUN_STATE.json](INPUT_RUN_STATE.json).

Mở [preview](http://127.0.0.1:8766/flows/auth-session/), dùng `minhanh` / `preview` → Bắt đầu ca → **Thẻ NFC** → Quét hoặc liên kết thẻ NFC → **Mô phỏng đọc thẻ NFC** ở tools ngoài app → Tiếp tục → Xác nhận liên kết. Bấm card sản phẩm để chọn ở P06. Tools ở dưới app trên mobile, bên phải trên desktop.

## Phần cần nguồn để tích hợp thật

1. Schema/status/filter/capability hiện hành cho list/detail/mapping/link/status-check: chưa có contract/API production; không dùng DEV_PROPOSAL như nguồn duyệt.
2. Adapter thiết bị, phân biệt support/permission/read error và yêu cầu write/read-back: chưa xác minh; hardware **NOT_RUN**.
3. Nguồn audit NFC và routing đầy đủ P15/P17/P22; asset/font chính thức và visual review của user. Tiếp tục đúng P07 khi có nguồn, không tự chuyển P08.


## Cập nhật27/09/2026

Xem [REVISION_02.md](REVISION_02.md): dialog trong app và chính sách cuộn chung, có bằng chứng regression mới. Các ảnh/report r01 ở trên giữ làm lịch sử; dùng revision02 khi nghiệm thu lỗi dialog/scroll.


## Bộ test mở rộng27/09/2026

[REVISION_03.md](REVISION_03.md): user yêu cầu thêm thẻ; UI mặc định30 thẻ (16/9/5), giữ baseline dataset để đối chiếu.


## Sửa căn cột và test liên tiếp

[REVISION_04.md](REVISION_04.md):5 UID chọn được, lượt mới giữ sản phẩm/chọn thẻ chưa dùng, summary grid căn cột,104/104 Node và15 nhóm browser đạt. Dùng revision04 cho nghiệm thu hiện tại.


## Sửa lề/viền và nội dung ô

[REVISION_05.md](REVISION_05.md):căn cụm trạng thái,đồng bộ inset và grid dialog;33 capture alignment PASS.Dùng revision05 khi review căn hàng.


## 27/09/2026 — r06

[REVISION_06.md](REVISION_06.md): thêm sóng NFC, hỗ trợ reduced-motion, căn ba nút hoàn tất cùng lề/cột/chiều cao; bảo đảm viền summary hiện đủ. 33 capture alignment + motion/sáu viewport + bốn nhóm repeat PASS. Node giữ kết quả r05, không chạy lại. Visual chờ user review; hardware/backend NOT_RUN.


## r07 — Sóng lớn hơn

[REVISION_07.md](REVISION_07.md): đường kính sóng tối đa 264px, tăng khoảng 38%, giữ vị trí điện thoại/bố cục. Kiểm motion/reduced-motion PASS.


## r08 — Điều hướng phụ và lề khối đọc thẻ

[REVISION_08.md](REVISION_08.md): hai nút phụ chung một hàng cân đối; S02 inset đồng bộ và giá trị căn mép phải với controls phía trên. 33 capture + motion/sáu footer viewports +4 repeat groups PASS. Chờ user review visual.


## r09 — Chỉ sửa minh họa khoanh đỏ

[REVISION_09.md](REVISION_09.md): dùng lại crop artwork B07 gốc, giữ animation mờ phía sau. So sánh desktop:0 pixel thay đổi ngoài dải minh họa. Motion/reduced-motion PASS.


## r10 — Sóng vô hạn, foreground NFC

[REVISION_10.md](REVISION_10.md): infinite staggered waves, z-index0/1/2, bỏ multiply. Kiểm motion/layer/reduced-motion PASS; bố cục ngoài minh họa giữ nguyên.


## r11 — Rà ổn định và đồng bộ UI/UX

[REVISION_11.md](REVISION_11.md): sửa recovery UNKNOWN, read-only reentry/đối chiếu khi kho dừng, vòng đời thất bại, response về muộn, IME/search, clipboard/feedback.195 Node;11 NFC+4 repeat+5 stability+14 Home+6 icon;33 alignment captures PASS. Giữ CSS/layout/artwork r10 và tiến độ P08/P09 từ công việc khác. Integration chưa xác minh.


## r12 — Áp dụng7 đề xuất UI/UX

[REVISION_12.md](REVISION_12.md): hướng dẫn trạng thái, CTA phục hồi trong dialog, nhắc sản phẩm/Đổi sản phẩm, clear/reset, copy tại nút, vùng chạm44px, Back dialog.323 Node +12 UX +11 NFC +4 repeat PASS;24 capture viewport và ảnh trước/sau. Visual mới chờ review; hardware/backend NOT_RUN. Giữ tiến độ module khác.


## r13 — Rà UI/UX lại sau r12

[REVISION_13.md](REVISION_13.md): picker/history/focus, copy không che hàng và không mất focus; giữ P17 dialog.416 Node,6 ca mới,4 repeat,33 alignment captures,4 viewport footer đạt. Suite Home legacy còn kỳ vọng lỗi thời, không tính đạt. Visual chờ user review; production/hardware NOT_RUN.
