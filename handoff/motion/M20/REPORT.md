# MOTION_P20 — Lịch sử linh kiện

Đã triển khai đủ **P20.S01–S04 ở auto, OS reduced và off**. Giữ source tích hợp hiện tại (P20 r03, P21/P24, FLOW_GATE và M01–M19), không đổi nghiệp vụ hoặc hạ phiên bản màn cũ. Motion mới chờ review; backend/hardware không được nâng thành PASS.

## Nguồn, gate và ownership

- MOTION_P20/MOTION_CONTRACT1.0, Contract2.0, AGENTS/UI_STANDARD, FLOW_GATE/FLOW_REPORT và M00 REPORT/OWNERSHIP/STACK_DECISION/LIST_AUDIT đã đối chiếu. FLOW_GATE=PASS UI_FIXTURE; M00 harness ready. [Quyết định trước sửa](DESIGN_TRACE.md).
- HEAD `da9f623a19d0359c3e80c14f8cc612636ec6ab78` cộng working tree hiện hành. Stack HTML/CSS/ESmodules; không cài motion/scroll/virtual library, không đổi stack/deploy. [Source SHA256/bytes](SOURCE_MANIFEST.json), [diff](changes.patch).
- PostedHistoryViewport: native scroll và stable document-ID rows, **STATIC_BY_DESIGN**. Không fade cả viewport khi append/query/case state cập nhật; route vẫn do M02 sở hữu.
- LoadMoreFooter: reuse **M00 dataState140ms**, OS reduced80ms opacity-only, off0. Chỉ fade trạng thái lỗi hoặc empty đã đọc thành công, không trì hoãn guard/domain result. Spinner24px trong skeleton slot có sẵn, CSS900ms linear chỉ khi request thực đang pending; reduced/off tĩnh, hidden/inert/overlay pause, route/security cleanup ngay.
- AppModal hiện tại vẫn sở hữu reader/overlay/focus. Không thêm provider, scroller, timer nghiệp vụ, endpoint, enum hoặc callbacks ghi. Không animate row entrance/measurement/quantity/ID hoặc replay hàng cũ/empty khi Back.

## Mapping4panel ×3mode

| Panel | Auto | OS reduced | Off | Evidence |
|---|---|---|---|---|
| P20.S01 | PASS · native/static | PASS · static | PASS · static | 3mode S01 captures + append/ID tests |
| P20.S02 | PASS · request spinner | PASS · static progress ring/text | PASS · static progress ring/text | pending/rapidtap/overlay/hidden/mode cancellation |
| P20.S03 | PASS · error opacity140 | PASS · opacity80 | PASS · immediate static | failed cursor/retry/oldrow preservation |
| P20.S04 | PASS · notice140 after success empty | PASS · opacity80 | PASS · static | error≠empty; Back no replay |

Nội dung cả4panel và domain checkpoints giống nhau giữa3mode. Error/empty semantic DOM có ngay, fade bắt đầu opacity0.65 chứ không ẩn nội dung. Spinner aria-hidden, busy/live text giữ nguyên. Trạng thái source không bị đợi cho đủ vòng animation.

## Files thay đổi

1. Mới `docs/flows/warranty-components/history-motion.mjs`: thin consumer của controller M00, nhớ state theo instance entry; consume cả khi off/hidden, release listener/observer/WAAPI khi hide/dispose.
2. `history-view.mjs`: lifecycle/mode; status node giữ DOM nếu kind không đổi, cancel trước replace; chỉ gọi effect trên descendant error/empty. Model, fixture, P21/P24 context/linked focus giữ nguyên.
3. `history.css`: progress ring absolute trong skeleton; không thay geometry/theme/footerLOCK.
4. `home/home.mjs`: truyền mode, fanout mode/securitycancel cho owner P20. Không thay navigation/business routing.

Tăng **3.656 bytes source**, không phải bundle production. Model/fixture, M00 core/tokens, root business RUN_STATE/SCREEN_COVERAGE **giữ nguyên byte** theo manifest. Thêm scripts/tests/handoff riêng M20; tracking chỉ cập nhật motion.

## Kiểm thử thật

- `node scripts/check_motion_p20.cjs --before`: **12ảnh trước**,3trace. Snapshot scoped source lưu trước sửa.
- `node scripts/check_motion_p20.cjs`: **15/15 nhóm** (5×3mode),12ảnh sau và3trace. [Results](evidence/results.json). Kiểm140/80/0, spinner/OS/off, hidden/overlay,4vòng hide/remount không tăng listener, native scroll tại360×420, cancel fade khi mode/security đổi, stale-response đổi case, rapid load chỉ1request, dedup và cursor chính xác. Row DOM/anchor cũ không bị thay/replay.
- `node scripts/test_motion_p20.cjs`: **60/60 PASS**, gồm M20/M00 và history domain. [Log](node-tests.txt). Unit kiểm8vòng lifecycle, cancellation, consume hidden/off/error/empty và no replay.
- `node scripts/regression_motion_p20.cjs <suite>`: P20main **7 nhóm**, P20edges **5**, P20UX **8**, P19 **9 +20layout**, P24 **5 +25layout**, P09navigation **11**, footerLOCK **4viewport**. Kết quả dưới `regression/`. Hai suite P20 cũ trông đợi resume thẳng P19 đã được runner thích ứng qua P21 owner đã có; closed notice đọc từ body theo P24. Không đổi source nghiệp vụ để làm test cũ đạt. Failures cũ giữ lại, kết quả cuối đọc results.json.
- `node --check` view/motion/Home và `git diff --check`: exit0. Không có package.json gốc, không bịa build/lint production.

**Geometry12/12 bằng trước sửa**, nodes chỉ tăng1progress span ở S02; nội dung/operation/cursor/IDs giống3mode. [Summary](SUMMARY.json). DPR1,494×950, local Public Sans, timezoneVN; ảnh settle và trace có thật. Đã xem actual4panel/ringoff. Ảnh tĩnh không đủ chứng minh motion; xem durations/keyframes trong results và trace. Không tuyên bố pixel-perfect/new visual acceptance từ assertion geometry.

Lỗi test đầu tiên: tool snapshot metrics cập nhật sau response, nên assertion sốrequest trong lúc loading đọc snapshot cũ. Chuyển assertion sang thời điểm settle (vẫn3rapidclick và1request thực). Không thêm latency hoặc sửa adapter để chữa test.

## Profile / virtualization

`node scripts/profile_motion_p20.cjs --before` rồi không có flag: synthetic1/30/300phiếu clone deterministic qua response routing riêng; không sửa seed/source fixture hoặc giả endpoint backend. [Trước](profile-before/results.json), [sau](profile-after/results.json), mỗi bên3trace.

| Phiếu | DOM nodes sau | Thời gian insert DOM trước/sau | Long tasks trước/sau |
|---|---:|---:|---:|
| 1 | 89 | không append | 2 / 2 |
| 30 | 1.309 | 3,3 / 3,0ms | 1 / 1 |
| 300 | 12.649 | 33,6 / 30,2ms | 17 / 5 |

Đây là một lượt Chromium emulation, có nhiễu tải máy và shared readable measurement; insert timing không phải full render/input latency. Longtasks không chứng minh FPS hoặc motion làm nhanh hơn. Có scrollRAF samples thô trong JSON; chưa đo droppedframes/physicaldevice. **Không hứa60fps.**

M00 decision virtualization vẫn **DEFERRED**; không cài TanStack chỉ vì loadmore. Fixture nhỏ hiện tại không cần virtualizer. Stress300 cho thấy DOM lớn và longtasks ở cả trước/sau: quy mô production dài cần owner profiling/thiết bị mục tiêu và quyết định riêng; không tuyên bố tối ưu long-list đã xong. Motion không animate những rows đó, không tải hết dữ liệu production.

## Bàn giao

[Review trước–sau và trace](REVIEW.html). Đã cập nhật MOTION_COVERAGE/MOTION_RUN_STATE/M00 ownership, giữ24board/91panel và business integration statuses. Production lịch sử cursor/page/scope/ID, camera/NFC/bàn phímảo và lưu bền chưa xác minh. Preview vẫn mất dữ liệu khi reload. Không deploy.

M20 scoped motion PASS_UI_FIXTURE; userreview hình thức/motion pending. MOTION_P21–P24 không được đánh dấu hoàn thành từ M20.
