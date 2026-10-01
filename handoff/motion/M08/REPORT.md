# MOTION P08 Lịch sử

Thực thi MOTION_P08_Lich_su.md ngày01/10/2026. Đã hoàn tất bốn panel trong phạm vi UI hiện có, với auto, OS reduced và off. Giữ bản dựng/ID, dữ liệu và geometry sau settle; không redesign/deploy. Hình thức motion còn chờ user review, không tự nâng kết quả kiểm thử thành visual acceptance.

## Nguồn và điều kiện vào

- Đọc tài liệu MOTION_P08 và MOTION_CONTRACT v1.0 từ bộ người dùng cung cấp; Contract chung2.0, AGENTS, UI_STANDARD, FLOW_GATE/FLOW_REPORT, M00 REPORT/STACK_DECISION/OWNERSHIP/LIST_AUDIT và implementation M00 hiện hành.
- FLOW_GATE statusPASS, UI_FIXTURE, không còn blocker thiết yếu; M00 PASS_HARNESS_READY, M01–M07 đã triển khai. Không chạy lại prompt dựng P08 hoặc chuyển framework.
- Source commitda9f623a19d0359c3e80c14f8cc612636ec6ab78 cùng workingtree giữ nguyên công việc trước. Snapshot/mapping B08 và các thay đổi user đã giao được giữ; baseline ảnh không sửa. Chụp actual trước motion cho cả4panel×3mode:494×950,DPR1,Chromium,Asia/Ho_Chi_Minh,clock01/10/2026 12:00VN.
- SOURCE_MANIFEST.json ghi scoped before/after SHA256 và source bytes; before/source chứa bản trước chỉnh. Source token/primitive M00, CSS P08, history-model/history-source/business-history-data và fixture gốc có SHA256 không đổi.

## Owner và thay đổi tối thiểu

| Panel | Quyết định | Owner và trạng thái |
|---|---|---|
| P08.S01 | APPLIED | HistoryFilter dùng M00 dataState140ms lên danh sách/kết quả; HistoryTab dùng noticeFeedback140ms. Không stagger hàng, không animate input. Load-more nối DOM hiện hữu, native scroll. |
| P08.S02 | REUSED | M02 routeTransition180ms trên destination; key theo panel/record/business/scope, không theo query/ngày/tab. Tab feedback140ms; thứ tự label/value không đổi. |
| P08.S03 | STATIC_BY_DESIGN | Sự kiện tham chiếu đã kết thúc hiện ngay; mở rộng/Back không replay/highlight. Chưa có stream event mới của phiên quét hiện tại, không thêm API/event giả để có hiệu ứng. Shell route vẫn reuse M02. |
| P08.S04 | APPLIED | Đổi ngày/counter lập tức, dataState140ms chỉ trên danh sách hoạt động (hoặc trạng thái nguồn). Không animate/count-up số liệu, giữ vị trí cuộn khi đổi ngày. |

`history/motion.mjs` là consumer nhỏ của **createMotionController có sẵn**, không provider/engine/scroller mới. Home nối mode/cancel fanout và route key cho P08; route fade vẫn chỉ M02 sở hữu. M00 tokens/primitives và overlay owner không sửa. Reduced kế thừa M00: feedback80ms, route/row/decorative transform0ms; off không animation. OS reduction không bị auto vượt qua. Hủy/hidden/hide/dispose đều cleanup presentation.

File runtime sửa: history/history.mjs, home/home.mjs. File runtime thêm: history/motion.mjs. Không thêm dependency/package/library.

## Sửa flow cần thiết trước motion

1. Load-more trước dựng lại subtree, làm mất identity của các hàng/input cũ. Nay append theo recordID khi prefix nguồn giữ nguyên; không tạo scroller thứ hai. Nếu nguồn thay prefix, dùng render owner hiện có, không giữ danh sách sai.
2. P08.S04 trước reset scroll khi Apply ngày. Nay giữ native scrollTop (browser clamp khi nội dung ngắn hơn), focus không tự cuộn đầu ngày.
3. Picker có bước đóng route bất đồng bộ: lưu version/panel/hash để draft cũ không áp vào ngày mới hoặc màn khác. Business cập nhật trước motion và không phụ thuộc finish/cancel của animation.

Không thêm cache hay nguồn fetch mới. Source P08 đang đọc đồng bộ; state loading/error/unavailable giữ policy cũ, không trình bày dữ liệu ngày trước như kết quả ngày mới. Bài kiểm deferred-callback trì hoãn **onApply của picker trong harness**, không giả đó là response backend. Transport response thật chưa có ở owner này và chưa kiểm integration.

## Kiểm chứng theo mode

| Mode | Bốn panel | Nhóm M08 | Hồi quy shell | Domain/geometry |
|---|---|---:|---:|---|
| Auto, OS no-preference | PASS |10|12|Cùng ID/nội dung;4geometry bằng trước |
| Auto, OS reduced | PASS |10|12|Cùng ID/nội dung;4geometry bằng trước |
| Off | PASS |10|12|Cùng ID/nội dung;4geometry bằng trước |

- **57/57 Node** tập trung: history, history source, query date, Home và motionP02/P08. Log node-tests.log.
- **30 nhóm browser M08**: filter/tab duration; input còn kết nối; không route replay khi query/tab; append rồi detail/Back giữ count/order/scroll; S02 dùng đúng shell; S03 không phát lại sự kiện; ngày/counter tức thì; callback lọc cũ; mode/OS/hidden/rapid navigation; P12/P18 quay về đúng record;10chu kỳ vào/ra không tích lũy listener; nguồn loading/error/unavailable/empty; logout/Back không phục hồi history.
- **36 nhóm shell regression** theo scriptM02, dùng before.json gốc M02: route/mode/cancel, các consumer hiện có, guard runtime, focus, footer và viewport nhỏ. Không sửa shared primitive nên không chạy lại mọi board.
- Domain parity được assert:48activityIDs,3scan-session tham chiếu và eventIDs/counts, timelineIDs, daily12/6/4/3/5/30, nhãn thông tin. Hardwarecalls0 ở cả3mode. Hash giữ nguyên fixture/source nghiệp vụ bổ sung, không tạo audit khi mount/modechange.
- 12geometry so sánh chính xác theo offset AppShell, không dùng ngưỡng pixel tự đặt. Đã trực tiếp xem ảnh actual list và theo ngày; CSS không đổi. Không suy geometry assertion thành pixel-perfect baseline Designer.

## Motion thực và profile

- Playwright trace có screenshots/snapshots/source cho ba mode: evidence/auto-trace.zip, os-reduced-trace.zip, off-trace.zip. Có cả trace trước trong before/.
- results.json có WAAPI calls/cancel/duration/frames và RAF opacity thực. Auto có frame trung gian opacity<1 trên node còn kết nối; đây là bằng chứng hiệu ứng chạy, **không** là benchmark60fps.
- List ban đầu6hàng/144nodes, append18hàng/336nodes giống cả3mode. Giữ nguồn48 bản ghi và pagination/native scroll. Virtualization **NOT_NEEDED cho scope đo hiện tại**, danh sách backend dài **DEFERRED** vì chưa có profile đủ căn cứ; không thêm TanStack/Lenis/Locomotive/GSAP.
- Source runtime delta **3965bytes** cho scope manifest; không phải bundle minified/gzip. Input latency, dropped-frame delta, hardwareFPS/IME thật **NOT_MEASURED/NOT_RUN**; không khẳng định60/120fps.

## Lệnh và evidence

```text
node scripts/check_motion_p08.cjs --before
node scripts/check_motion_p08.cjs
MOTION_P02_EVIDENCE_DIR=handoff/motion/M08/evidence/shell-regression node scripts/check_motion_p02.cjs
node scripts/finalize_motion_p08.cjs
```

Lượt kiểm đầu sau sửa bị connection refused vì preview local dừng; đã kiểm không có listener rồi khởi động lại scripts/serve_preview.py tại8766. Một lượt shell thiếu before.json ở thư mục evidence mới; đã reuse baseline M02, không chụp source sau sửa làm giả before. failure.json còn lại là diagnostic của lượt đầu, không kết quả cuối. results.json/summary.json và geometry-comparison.json là các lượt hoàn tất được đối chiếu.

Tracking đã cập nhật riêng4dòngM08 trong MOTION_COVERAGE.csv, giữ đủ91dòng và business coverage/integration cũ. MOTION_RUN_STATE.json giữ lịch sử M01–M07, hoàn tất M08, remaining bắt đầu P09; không tự thực thi M09 hoặc deploy. Backend/hardware vẫn NOT_RUN tách riêng, không phải blocker cho motion UI đã kiểm.
