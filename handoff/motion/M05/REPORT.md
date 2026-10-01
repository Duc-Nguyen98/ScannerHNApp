# MOTION_P05 — Xuất kho

Thực thi tài liệu user MOTION_P05_Xuat_kho.md và MOTION_CONTRACT1.0. Source HEAD da9f623a19d0359c3e80c14f8cc612636ec6ab78 + working tree hiện hành, target prototype-local-ui-fixture. FLOW_GATE PASS/blockers[] và M00–M04 đủ trước triển khai. Không đổi4panel/B05, không redesign, publish hoặc nâng business integration thành PASS.

## Mapping/ownership

| Panel | Auto/full | OS reduced | Off | Kết quả |
|---|---|---|---|---|
| P05.S01 | FormFeedback140ms ở wrapper focus/lỗi, CTA không dịch chuyển | Opacity≤80ms | Static | APPLIED, guard/validation tức thì |
| P05.S02 | ScanFeedback160ms cho event accepted mới đúng1lần | Static row | Static row | APPLIED; counter/camera/reticle STATIC_BY_DESIGN |
| P05.S03 | Notice thiếu hàng hiện ngay, fade140ms lần đầu theo document/planned/count | Opacity≤80ms | Static | APPLIED;7/10 vẫn thiếu3, không gửi |
| P05.S04 | SubmitFeedback160ms sau receipt khớp request | Static result | Static result | APPLIED; amber Chờ xử lý trên Web, chưa Post/chưa đổi tồn |

Reuse: M00 `createMotionController`, `noticeFeedback`, `rowFeedback`, token/easing/media policy. Consumer M04 được tách thành `shared/motion/scan-flow-feedback.mjs`; P04 giữ wrapper, P05 dùng cùng consumer có prefix và reviewNotice riêng. Không provider/scroller/engine/library mới; M02 tiếp tục sở hữu opacity route, M03 sở hữu overlay.

Home truyền mode/cancel vào P05 như P04. OS reduced không bị auto vượt qua. Trước repaint/hide/security/dispose hủy WAAPI; hidden document hủy effects qua M00. Callback hoàn tất animation không gọi mutation hay thay quyền. Input/camera/counters không animate. Kết quả có ô xanh **Đã gửi** vốn có; không thêm xanh **Đã ghi sổ**, amber chờ Web giữ nguyên.

## Sửa đúng owner để bảo toàn flow/scroll

- Domain P05 thêm eventId từ scanSessionId+sequence chỉ khi có lượt quét thật. Restore giữ eventId và reserve sequence; seen-set tiêu thụ cả filtered/hidden/off events. Activate seed dữ liệu đã có để không phát lại khi mount/Back/restore. Request/document/version/raw/quantity không bị motion thay đổi.
- `bindScan` ràng buộc callback vào epoch+scanSession, đổi bước/leave/newdocument/dispose làm callback cũ vô hiệu. Kiểm cả P04→P05, không có camera stream thật hoặc callback cũ cộng mã vào owner khác.
- P05 bật preserveCamera có sẵn của `inbound/manual-entry.mjs`. Renderer không sửa; camera/input giữ cùng DOM **connected** qua scan cùng bước. Bỏ lần render thứ hai sau manual submit để không hủy highlight trước khi frame được vẽ; cập nhật value/error tại input đang giữ.
- Khi append scan trong danh sách đang cuộn, lưu eventId+offset hàng đang thấy; owner khôi phục native scroll sau render và sau phép đo readable-text kế tiếp. Dùng handle RAF sẵn của P05, có guard row/document/step/count/visible/user-scroll; hủy trên repaint/hide/dispose. Không smooth-scroll hoặc kéo người dùng lên mã mới. Counter thay ngay, không chờ frame/motion.

## Kiểm chứng

- **64/64 Node PASS**: inbound/outbound/geography +4 bài M05 event identity/callback epoch/cross-owner/restore sequence. [Log](evidence/node-tests.txt).
- **39 nhóm M05 PASS** (13×3mode), domain snapshot bằng nhau và mỗi mode `record=3, check=1, camera=0`: [results](evidence/results.json). Bốn panel mỗi mode so geometry settled trực tiếp với before; trạng thái7/10 không biến thành10/10 bởi hiệu ứng.
- Rapid submit+Back:1operation cho lượt đó, receipt không render đè Home. UNKNOWN không chạy SubmitFeedback hoặc mở retry; check giữ nguyênrequest. P12 Back không replay hero. Mode/OS đổi giữa chừng, hidden/guard/logout cleanup được kiểm; camera/input giữ identity, duplicate/filter/Back không replay row.
- **39 nhóm M04 hồi quy PASS** sau refactor shared consumer: [results](evidence/p04-regression/results.json). Geometry trướcM04 được copy nguyên để đối chiếu, không đổi baseline.
- **36 nhóm M02/AppShell hồi quy PASS**: [results](evidence/shell-regression/results.json), root/footer/route/guards/mode giữ owner.
- **11 nhóm manual-entry P04/P05 PASS**,12layoutcases: [results](evidence/manual-regression/results.json), DOM/focus/IME/nguồn phiếu/UNKNOWN giữ nguyên.
- Tổng **125 nhóm browser**, không pageerror ở các kết quả thành công. Node/browser là acceptance fixture scoped, không nghiệm thu production.

## Bằng chứng hình thức và motion thật

Source/baseline/implementation choices: [DESIGN_TRACE](DESIGN_TRACE.md). Before4panel và geometry: [before](evidence/before/geometry.json). Actual12panel ở auto/OS reduced/off trong evidence, ví dụ [auto S02](evidence/auto-P05.S02.png), [auto S03](evidence/auto-P05.S03.png), [off S04](evidence/off-P05.S04.png). Đã xem S03/S04; viewport494×950,DPR1,clock2026-09-30T01:15:20Z và fixture không thay.

Trace Playwright thực: [auto](evidence/auto-trace.zip), [OS reduced](evidence/os-reduced-trace.zip), [off](evidence/off-trace.zip). `frames` trong results có RAF/computed opacity cho field, thiếu hàng, acceptedrow và verifiedresult. Auto có giá trị opacity<1; row/result reduced/off giữ1. Không dùng screenshot làm bằng chứng thời gian hoặc tự báo60fps.

Profile seed:10accepted, slice4rows, số DOM/handle ghi trong `listProfile` từngmode. Virtualization **NOT_NEEDED cho seed hiện hành / DEFERRED cho backend dài** theo M00; không thêm TanStack/lib hay fixture giả. Source byte delta/hash được đo trong SOURCE_MANIFEST, không gọi là bundle production hoặc benchmarkFPS. Dropped frames/target-device input latency/hardwareIME/safe-area/camera/NFC/backend/durable storage: NOT_RUN.

Lưu lỗi phát triển để truy vết: selectorFormFeedback ban đầu đếm cả focus wrapper và field-error (sửa assertion theo node lỗi); anchor lệch2px sau readable-text đo lại (sửa native restoration đúng owner); script ban đầu tìm new-run P04 không có ở P05 (sửa dùng Home→Xuất kho); một lần cache-bump regex làm lỗi syntax dynamicHome import P01 (khôi phục nguyên đoạn từ snapshot trước và thay đúng query; final auth diff chỉ cachekey, app đã vào được ở toàn bộ suites). Không đổi nghiệp vụ/baseline để né test.

## Files/tracking

Thêm shared `scan-flow-feedback.mjs`, outbound `motion.mjs/.css`; sửa wrapper+activate P04, outbound view/flow, Home mode/security wiring, entry/cache. M00 controller/tokens và shared renderer không đổi. Thêm capture/test/finalize M05, sửa M04test cho outputdir override để giữ bằng chứng cũ.

Cập nhật riêng `handoff/motion/MOTION_COVERAGE.csv`4hàngP05 và `MOTION_RUN_STATE.json`, M05 checkpoint/manifest. Business SCREEN_COVERAGE/RUN_STATE không bị thay bằng motion. Visual motion vẫn chờ user review, không có xác nhận pixel-perfect/production. Không tự bắt đầu MOTION_P06.
