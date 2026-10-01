# MOTION_P19 — Xuất linh kiện bảo hành

**Đã triển khai4panel ở auto, OS reduced và off.** Nghiệp vụ và hình thức tĩnh P19 r03 đang được tạm chốt vẫn được giữ. Motion mới chờ user review; production/backend/hardware không được nâng thành PASS.

## Nguồn và ownership

- Đọc MOTION_P19, MOTION_CONTRACT1.0, contract gốc/context, AGENTS/UI_STANDARD, FLOW_GATE/FLOW_REPORT, M00 REPORT/OWNERSHIP/STACK_DECISION/LIST_AUDIT.
- FLOW_GATE=PASS trong phạm vi UI_FIXTURE,24boards/91panels. Stack HTML/CSS/ESmodules; không cài thêm thư viện hoặc đổi stack/deploy.
- Baseline commit `da9f623a19d0359c3e80c14f8cc612636ec6ab78` cộng working source hiện hành; fixture giữ nguyên `issue-fixture.mjs` và P21 checkpoint owner. [Source/diff/bytes](SOURCE_MANIFEST.json), [patch](changes.patch), [quyết định trước sửa](DESIGN_TRACE.md).
- Tài liệu đầu vào nhắc standalone `flow.js`; runtime đã được tích hợp ở `issue-view.mjs` với owner `issue-model.mjs`/`resume-model.mjs`. Dùng runtime này, không sửa standalone legacy hoặc mất các bổ sung P20/P21/P24. P19 success hiện về P09/Linh kiện cùng marker để mở P20; P21 đối chiếu receipt mở P20. Giữ luồng đã qua FLOW_GATE.
- ComponentScan/PostFeedback dùng M00 controller hiện hành; QuantitySheet do AppModal sở hữu. M02 vẫn là owner route. Không thêm provider/scroller, camera service hoặc timer nghiệp vụ.

## Mapping4panel ×3mode

| Panel | Auto | OS reduced | Off | Phần giữ tĩnh |
|---|---|---|---|---|
| P19.S01 | PASS: opacity phản hồi160ms đúng dòng vừa accepted | PASS: row static | PASS: static | Camera/reticle/input/counter; duplicate/restore/Back không replay |
| P19.S02 | PASS: sheet220ms/translateY≤8px; exit160ms | PASS: sheet static; backdrop≤80ms | PASS: static | Validation/focus/value/domain close ngay; không animate height khi resize bàn phím |
| P19.S03 | PASS: Post press100ms | PASS: press static | PASS: static | Tổng2mã/3linh kiện hiển thị ngay, pending từ action owner, không count-up |
| P19.S04 | PASS: check có sẵn160ms sau receiptPOSTED đã xác minh | PASS: static | PASS: static | Nội dung/ID/count ngay; no confetti, no replay Back |

M00 easing `cubic-bezier(0.2,0,0,1)`. Fixture chỉ là mock, không coi timeout/timer là bằng chứng backend thật. UNKNOWN chưa xác định không tạo success; case cũ trả kết quả không mở success case mới.

## Thay đổi thực hiện

1. `warranty-components/issue-motion.mjs`: adapter nhận eventaccepted và receipt, dedup theo case/request/receipt (tránh số phiếu demo trùng số runtime); hủy/release theo hide/dispose/OS/hidden/inert. Event bị bỏ qua khi off/ẩn không replay sau đó.
2. `issue-view.mjs`: nối event và lifecycle/mode; giữ camera DOM kết nối khi mở/thu gọn nhập tay; mở/đóng sheet không thêm quantity lần hai. Không thay ownerPost/scan/stock. Chặn submit phát lại từ DOM exit đã đóng.
3. `shared/app-modal.mjs`: tùy chọn `motionExit=false` mặc định. P19 opt-in; semanticclose, focus, scroll-lock, inert và callback đóng xử lý ngay. Chỉ presentation outgoing inert/aria-hidden/pointer-none tồn tại tối đa160ms; bỏ identifiers/controls markers. Completion chỉ xóa DOM. Overlay mới, mode đổi, security/hide đều hủy exit ngay. Consumer cũ không opt-in giữ cách đóng cũ.
4. `shared/app-surfaces.css` và `issue.css`: reuse đúng geometry host cho presentationexit; không thêm layout/theme.
5. `home/home.mjs`: truyền/fanout mode và securitycancel cho P19.

M00 core/token, issue-model, issue-fixture, root RUN_STATE và SCREEN_COVERAGE **giữ nguyên byte**.6file nguồn thay đổi/tạo mới, tăng **5.984bytes source**; không phải bundle production. Bản snapshot trước sửa ở `before/source`.

## Kiểm thử đã chạy

- `node --test tests/motion-p19.test.mjs tests/component-issue*.test.mjs tests/motion-p01.test.mjs`: **51/51 PASS** — [log](node-tests.txt).
- `node scripts/check_motion_p19.cjs`: **21/21 nhóm**,7nhóm ×3mode — [results](evidence/results.json). Có accepted-only/no duplicate, input/camera giữ kết nối, rapid sheet/Back/doubleSubmit,2mã/3qty, Post100ms/chống lặp, UNKNOWN/đối chiếu cùng request, success160ms một lần, case cũ callback muộn, modeoff/OS/hidden/security cancellation, compact360×420,4vòng hide/mount không tăng listener.
- Domain ở3mode giống nhau tại checkpoint xác nhận:2mã/3linh kiện;2Post calls (lần đầuUNKNOWN, lần sau sau đối chiếu authoritative chưa xuất),1check,1commit,POSTED. ScenarioUNKNOWN riêng không commit. Không gọi camera/NFC/hardware từ motion.
- RegressionP19: **9nhóm +20layout**; P20: **7nhóm +5viewport**; P21: **9nhóm +20layout**; P24: **5nhóm +25layout**; M14/sharedmodal: **21nhóm/3mode**; footerLOCK: **4viewport**. Evidence ở `regression/`.
- Runner cũ có2 assertion lỗi thời được giữ dấu vết failure và điều chỉnh theo integration đã có: P21 check thành công sang P20 (như run_p21_r03); P24 đã chuyển lời giải thích hồ sơ đóng từ footer sang bodyP20. Không đổi source nghiệp vụ để làm các assertion cũ đạt.

## Ảnh/trace và performance

- `--before` render snapshot nguồn đã lưu qua Playwright response routing, không rollback repo.12ảnh trước/12ảnh sau, cùng494×950/DPR1/fixture/fonts. **Geometry/DOM12/12 bằng nhau**. [So sánh ảnh](visual-comparison.json):10ảnh không có pixel khác;2ảnh sheet auto/reduced có41pixel khác ở viền focus, geometry không đổi. Đã xem actual4panel, không lấy threshold ảnh để tự nghiệm thu visual.
- Có **3Playwright trace thực** sau triển khai và3trace trước; WAAPI frames/duration cùng intermediate opacity/transform được ghi trong results. [Review và trace](REVIEW.html). Ảnh tĩnh chỉ chứng minh trạng thái settle, không chứng minh chuyển động.
- `--profile` đo riêng đúng4scene như before; [profile](profile/results.json), [summary](SUMMARY.json). Ghi longtasks/DOM/sourcebytes thực; thời gian gồm startup/screenshot và tải máy nên không suy ra input latency hay FPS. Resource decoded bytes trả0 trong harness này: **không dùng làm bundle/transfer metric**. Không tuyên bố60fps hoặc cải thiện tốc độ từ số đo này.
- Virtualization **NOT_NEEDED cho fixture2mã hiện tại**; M00 không có profile longscan chứng minh cần virtualizer. Sheet/review/native scroll giữ nguyên; không sinh lại seed để làm motion.

## Handoff

Đã cập nhật MOTION_COVERAGE/MOTION_RUN_STATE riêng, không ghi đè nghiệm thu business. Physicalcamera/NFC, bàn phímảo/IMEthiết bị thật, productionPost/status/idempotency/stock và lưu bền chưa được xác minh. Chỉ Chromium emulation/focus lifecycle được kiểm ở lượt này. Không deploy.

Preview: http://localhost:8766/flows/auth-session/ · minhanh / preview. Reload rồi vào Bảo hành → BH-001 → Linh kiện → Xuất linh kiện. Motion mode nằm ngoài khung app trong công cụ AppShell. Tiếp theo: userreview M19; MOTION_P20 vẫn chờ yêu cầu.
