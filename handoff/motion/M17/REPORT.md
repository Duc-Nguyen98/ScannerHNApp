# MOTION_P17 — Ngoại lệ quét

**4/4 panel hoàn tất trong phạm vi prototype, đạt auto, OS reduced và off.** Giữ ID/baseline nghiệp vụ, shell494×950 và footerLOCK. Không redesign/deploy; visual cần user review; không nâng business integration thành PASS từ motion.

## Gate, nguồn và ownership

Đã đọc MOTION_P17, MOTION_CONTRACT1.0, AGENTS/UI_STANDARD hiện hành, contract và P17 r03. FLOW_GATE gate_status **PASS** và M00 ready đã xác minh. HEAD `da9f623a19d0359c3e80c14f8cc612636ec6ab78`; working copy gồm các lượt M01–M16 và các bản UI mới hơn tới P24. [Nguồn trước sửa](SOURCE_MAP.md), [source hash/summary](SUMMARY.json), [patch](changes.patch).

Giữ seed/IDs của các fixture hiện hành: inbound `hn-inbound-preview-v1`, outbound `hn-outbound-preview-v1`, NFC `hn-scanner-nfc-fixture-v1`. Test cố định clock2026-10-01 08:15:20 giờ Việt Nam; không sửa fixture/domain để tạo hiệu ứng. Status-check được thêm delay chỉ qua request interception trong test để quan sát busy, không thêm thời gian chờ vào ứng dụng.

Sửa6file ứng dụng: `shared/motion/scan-flow-feedback.mjs`, `inbound/inbound.mjs`, `outbound/outbound.mjs`, `nfc/nfc.mjs`, `scan-exceptions/view.mjs`, `scan-exceptions/style.css`. Không đổi **M00 motion-primitives.mjs/motion-tokens.css**, model/adapter, router Home hoặc seed. P04/P05 mở rộng controller ScanFeedback chung; AppModal tiếp tục sở hữu overlay/focus/scroll-lock. Không có provider, scroller hay engine thứ hai.

## Mapping panel và ba chế độ

| Panel | Auto | OS reduced / off | Guard và static |
|---|---|---|---|
| P17.S01 | M00 noticeFeedback140ms trên text cảnh báo |80ms /0ms | Raw/reason hiện ngay; video/reticle, counters và accepted list tĩnh; không rung/chớp video |
| P17.S02 | ConflictNotice opacity .65→1 trong140ms trên khối cảnh báo |80ms /0ms | Reason, sản phẩm và phiếu đọc được ngay; không scan lại/record do callback motion |
| P17.S03 | Mapping panel **STATIC_BY_DESIGN**; Xem liên kết dùng AppModal hiện hữu: panel220ms, backdrop140ms | Panel tĩnh, backdrop80ms / toàn bộ tĩnh | Đóng tức thì theo owner; không exit snapshot, không overwrite mapping. Motion chỉ opt-in khi thực sự ở P17.S03 |
| P17.S04 | Nội dung UNKNOWN/disabled static; spinner24px trong slot icon khi status-check thực sự pending, vòng0.9s | Indicator/text tĩnh / tĩnh | Resend khóa ngay; không countdown, auto retry hoặc minimum busy duration |

Easing theo M00 cubic-bezier(0.2,0,0,1). Lượt scan có eventId nguồn: event mới mới feedback; restored/off/hidden events được tiêu thụ để không replay trên repaint, mode change hoặc Back. Quét lỗi hợp lệ có thể thêm **attempt** theo owner cũ; motion không tự thêm attempt hoặc làm tăng accepted/quantity. Không giả quy tắc dedup nghiệp vụ mới.

Spinner dừng khi document hidden, overlay inert, cancel/hide/dispose hoặc modeoff/reduced. Chỉ đổi presentation; request đối chiếu tiếp tục theo lifecycle domain. Primitive finish không gọi scan, record, Post hay link NFC.

## Flow/lifecycle fix trực tiếp

Trong preflight, P07 dispose chưa gọi dispose của controller M07. Đã nối `motion.dispose()` đúng owner, đồng thời fanout mode/cancel tới detail modal đang mở. Không thay NFC service; giữ stopRead/abort ở flow hiện hữu. Shared ScanFeedback chỉ gỡ listener khi controller đã activate, tránh cleanup lặp không cân với đăng ký.

## Kiểm chứng thực chạy

- `node scripts/check_motion_p17.cjs --before`: **12 ảnh baseline** và3trace, trước sửa.
- `node --test tests/motion-p17.test.mjs tests/motion-p05.test.mjs tests/motion-p01.test.mjs tests/scan-exceptions.test.mjs tests/nfc.test.mjs`: **59/59 PASS**. [Log](node-tests.txt).
- `node scripts/check_motion_p17.cjs`: **18 nhóm PASS**,6×3mode. [Results](evidence/results.json). Bao gồm same-error/repaint/no replay, single-flight status-check, rapid resend, đúng request sau đối chiếu, static camera, Back/Forward, mode/OS/hidden cancel, overlay/focus, compact viewport và cleanup cycles.
- Consumer regression bằng runner lưu tại `regression/`, chỉ đổi destination evidence/base URL và đường dẫn helper: **M04 39 nhóm**, **M05 39 nhóm**, **M07 21 nhóm**. [M04](regression/m04/results.json), [M05](regression/m05/results.json), [M07](regression/m07/results.json). Giữ geometry comparison với baseline của từng consumer.
- M05 recorder bổ sung RAF sampling ngay tại lời gọi animate vì đo sau `waitForSelector` có thể bỏ lỡ hiệu ứng160ms; vẫn kiểm opacity thật, duration và số lần record. Không kéo dài animation ứng dụng để đạt test.
- Cả3mode M17 có **1 inbound record +1 status-check**, **0 outbound record/check**, accepted nhập đúng1mã/quantity1, accepted xuất0 và không gọi camera thật. NFC conflict mutation0 qua các ca; M07 regression xác minh domain/stats bằng nhau giữa3mode.
- **12/12 geometry/text/DOM comparisons bằng trước sửa** sau settle. Pixel raw **10/12 bằng tuyệt đối**; auto/reduced S02 mỗi ảnh khác26pixel. [Comparison](evidence/comparison.json). Không resize/mask hoặc đặt threshold để tự nghiệm thu hình thức.
- Syntax và `git diff --check` đạt. Source phần lớn untracked nên có thêm hash/patch. Không pageerror/request HTTP ghi trong suite M17 hoàn tất.

Lượt harness đầu được giữ ở diagnostics: counter listener ghi nhận cả remove không có registration, điều hướng nhảy Home khi exception còn mở, sampling quá muộn và một lần chờ startup. Đã sửa teardown/harness đúng ý nghĩa, chạy lại các suite liên quan; các lỗi đó không được tính PASS. Native Back phải đóng exception trước khi rời owner, không dùng test shortcut để bỏ guard.

## Bằng chứng motion và hiệu năng

Trace thật: [auto](evidence/auto-trace.zip), [OS reduced](evidence/os-reduced-trace.zip), [off](evidence/off-trace.zip). Có **104 mẫu opacity trung gian auto,33 reduced,0 off**, được lấy theo RAF từ animation đang chạy; raw samples vẫn giữ cả node đã disconnect. [Review](REVIEW.html).

Source delta **+1933byte chưa nén**, không phải production bundle/gzip. Pending spinner dùng slot24px hiện có; idle DOM/geometry không tăng. Raw long-task entries lưu trong results; workload baseline chỉ capture, workload after gồm guard/cleanup nên không so tổng long-task để kết luận nhanh hơn/chậm hơn. **Không tuyên bố60fps hoặc hardware PASS.**

Virtualization **NOT_NEEDED trong khối lỗi**; scan list dùng owner/native viewport và quyết định profile M00/M04/M05, không thêm TanStack/lib hoặc tạo lại dữ liệu.

## Giới hạn và bàn giao

Camera/NFC/keyboard/screen reader và API/quyền/WMS/clipboard trên thiết bị thật **NOT_RUN**. Fixture chỉ chứng minh UI và guard hiện hành. Visual motion cần user review; giới hạn business integration cũ giữ nguyên. Chỉ cập nhật `handoff/motion/MOTION_COVERAGE.csv` và `MOTION_RUN_STATE.json`; không sửa tracking business để ghi đè trạng thái integration.

Preview: `minhanh / preview` → Nhập kho nhập `HN-NOT-FOUND`; Xuất kho nhập `HN99999`; NFC chọn fixture conflict; gửi nhập với Timeout rồi Kiểm tra trạng thái. Bộ **Motion P02/AppShell** ngoài app chọn auto/reduced/off; auto vẫn tôn trọng OS reduced. M18–M24 motion chưa hoàn tất trong lượt này.
