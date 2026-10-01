# MOTION_P06 — Tra cứu

Đã thực thi `MOTION_P06_Tra_cuu.md` theo MOTION_CONTRACT 1.0. FLOW_GATE có `gate_status=PASS`, `blockers=[]`; M00 và các consumer M01–M05 đã sẵn sàng. Source HEAD `da9f623a19d0359c3e80c14f8cc612636ec6ab78` cộng working tree hiện hành; target là prototype HTML/CSS/JS.

Giữ đủ bốn panel, baseline B06, footer và dữ liệu nghiệp vụ. Không chuyển React, thêm thư viện, tạo scroller/provider khác hoặc deploy. Không sửa kết quả business integration trong `RUN_STATE.json`/`SCREEN_COVERAGE.csv`.

## Mapping và ownership

| Panel | Auto/full | OS reduced | Off | Quyết định |
|---|---|---|---|---|
| P06.S01 | Vùng kết quả fade 140ms; selected tab feedback 140ms | Opacity tối đa 80ms | Static | APPLIED |
| P06.S02 | Route fade 180ms qua M02 AppShell | Static route theo M00 | Static | REUSED |
| P06.S03 | Số tồn đổi ngay; không count-up | Cùng giá trị tức thì | Cùng giá trị tức thì | STATIC_BY_DESIGN cho số/vị trí; route dùng shell |
| P06.S04 | Filter feedback 140ms; append giữ hàng cũ, lỗi chỉ đổi footer | Feedback tối đa 80ms, hàng static | Static | APPLIED cho filter/ListViewport; hàng không replay |

P06 dùng `createMotionController`, `dataState`, `noticeFeedback` và tokens của M00. Controller local chỉ sống khi module active. M02 vẫn là owner duy nhất của route opacity trên `#hn-destination`; Home nhận khóa panel + item của P06. Không có route clone, shared-element morph hoặc hiệu ứng riêng trên input, số tồn, camera, header hay footer.

## Data và scroll được bảo toàn

- `read-owner.mjs` quản lý query ID, AbortSignal, latest-only commit và cache theo actor/kho/query/item/filter. Adapter fixture đồng bộ vẫn trả ngay; adapter Promise chỉ commit phản hồi còn hiệu lực. Motion không debounce hoặc trì hoãn dữ liệu.
- A trả muộn sau B không thể thay B hoặc phát lại feedback. Mode change chỉ hủy presentation, không sinh query hay mutation.
- Search giữ input DOM, caret và IME. Loading/error khác empty; Enter không mở kết quả pending hoặc nguồn lỗi. Đổi danh mục reset composition flag tại owner, giữ hành vi đã có trước khi bỏ full repaint.
- List → detail → Back giữ query, scroll và focus. ID sai không tự mở sản phẩm đầu. In tem vẫn chặn ở control và handler trong cả ba chế độ.
- History dùng event ID ổn định để tái sử dụng DOM hàng cũ. Append giữ anchor/offset bằng native scroll. Error/loading chỉ cập nhật status slot cuối. Source đổi nội dung cùng ID thì cập nhật text/quantity ngay trên wrapper đó, không chạy entrance.
- Hide/dispose/security/mode/OS/visibility hủy hiệu ứng qua M00. Pending read của owner đã rời màn không repaint Home hoặc trang đăng nhập. Ba chu kỳ vào/ra P06 không tích lũy listener motion. Completion callback của animation không thực hiện nghiệp vụ.

## Kiểm chứng đã chạy

| Bộ kiểm tra | Kết quả | Bằng chứng |
|---|---|---|
| `check_motion_p06.cjs` | 36 nhóm = 12 × 3 mode | [results](evidence/results.json) |
| `check_motion_p02.cjs` | 36 nhóm AppShell hồi quy | [results](evidence/shell-regression/results.json) |
| `check_lookup_nfc_audit_r02.cjs` | 7 nhóm flow/IME/Back | [results](evidence/flow-regression/results.json) |
| `check_lookup_recent_edges.cjs` | 2 nhóm, ba viewport | [results](evidence/recent-edges/results.json) |
| `node --test tests/lookup*.mjs tests/motion-p01.test.mjs tests/motion-p02.test.mjs` | 39/39 Node | [log](evidence/node-tests.txt) |

Tổng **81 nhóm browser**, không page error trong kết quả cuối. Cả ba mode có cùng domain snapshot: tồn **12/10/1/1**, bảy event sản phẩm chính, **36 lượt đọc search + 7 lượt đọc history**, camera **0**. Đây là operation read trong kịch bản kiểm, không phải thao tác ghi WMS. Geometry tĩnh của **12 tổ hợp panel–mode** bằng actual trước sửa.

Test browser bọc nguồn search bằng Promise để chủ động trả A muộn; history chia ba rồi bảy event từ seed hiện có. Một ca đổi mô tả/quantity của cùng event ID rồi hoàn nguyên để kiểm cập nhật dữ liệu. Các override chỉ trong browser kiểm tra, không sửa fixture thật hoặc sinh thêm record để làm hiệu ứng.

Lỗi trong lượt phát triển được giữ ở `failure.json`: test append ban đầu chưa invalidate cache khi đổi giới hạn QA; test logout tìm confirmation ở nút fixture vốn logout trực tiếp. Đã sửa test theo owner thật. Hồi quy category/IME phát hiện lỗi cờ composition khi input không còn remount; đã sửa handler P06 và chạy lại PASS. Không dùng các log lỗi cũ làm bằng chứng đạt.

## Visual, trace và performance

- [Nguồn và quyết định trước sửa](DESIGN_TRACE.md), [geometry trước](evidence/before/geometry.json).
- [S01](evidence/auto-P06.S01.png), [S02](evidence/auto-P06.S02.png), [S03](evidence/auto-P06.S03.png), [S04](evidence/auto-P06.S04.png); đủ ảnh OS reduced/off trong evidence. Đã xem actual S01/S03.
- Trace thật: [auto](evidence/auto-trace.zip), [OS reduced](evidence/os-reduced-trace.zip), [off](evidence/off-trace.zip). `feedbackFrames` trong results ghi opacity qua RAF: auto/reduced có frame dưới 1, off bằng 1. Ảnh tĩnh không được dùng làm bằng chứng FPS.
- Điều kiện chính: viewport 494×950, DPR1, Arial, clock `2026-09-30T01:15:20Z`. Small viewport/keyboard-height có hồi quy M02 và recent-edge. Không tự đặt ngưỡng pixel-diff hoặc nghiệm thu raster B06.
- Profile ban đầu mỗi mode: **120 DOM nodes, 5 product rows**, native scroll. Theo M00: **NOT_NEEDED cho seed hiện hành / DEFERRED cho backend list dài**; không thêm virtualization hoặc thư viện.
- Source tăng **7.072 byte** trong phạm vi đo so với manifest M05; xem [SOURCE_MANIFEST](SOURCE_MANIFEST.json). Đây không phải production bundle hoặc benchmark tốc độ. Dropped frames, input latency trên thiết bị thật, FPS, camera/NFC, IME hardware, safe area, WMS và durable storage: **NOT_RUN**. Không tuyên bố 60fps.

## Files và tiến độ

Thêm `lookup/motion.mjs`, `lookup/read-owner.mjs`, test read owner, `check_motion_p06.cjs` và script finalize. Sửa consumer P06, Home mode/cancel/route identity, auth loader cache key. M00 controller/tokens không đổi; manifest kiểm hash của hai nguồn chung.

Cập nhật riêng `handoff/motion/MOTION_COVERAGE.csv` bốn hàng P06 và `MOTION_RUN_STATE.json`; checkpoint tại `M06/RUN_STATE.json`. [Tổng kết máy đọc](evidence/summary.json). Visual motion chờ bạn review; behavior PASS fixture; integration không được nâng thành PASS. Không tự chạy M07 hoặc publish.
