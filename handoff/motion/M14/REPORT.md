# MOTION_P14 · Khôi phục tài khoản / Ca làm việc

Đã triển khai đủ **P14.S01–S04** ở auto, OS reduced và off, sau FLOW_GATE PASS_UI_FIXTURE và M00 harness-ready. Source HEAD `da9f623a19d0359c3e80c14f8cc612636ec6ab78`; target HTML/CSS/ES modules. Giữ baseline UI hiện tại,4ID/24board/91panel, fixture `hn-recovery-shift-preview-v1`, seed và guard đã có; recovery/shift policy vẫn PROPOSED ở integration thật.

## Mapping / ownership

| Panel | Full/auto | OS reduced | Off |
|---|---|---|---|
| S01 | Press100ms, validation opacity140ms; busy/text/guard tức thì | Press0, validation<=80ms | Static |
| S02 | Receipt opacity160ms, chỉ sau verified mock/service result; tiêu thụ ID một lần | Static | Static |
| S03 | Modal do app-modal hiện có sở hữu: backdrop140ms, panel220ms/translateY tối đa8px | Backdrop<=80ms, panel static | Static |
| S04 | M02/AppShell fade180ms theo receipt key sau end xác nhận | Static | Static |

Số KPI/quantity, input/IME, trạng thái, hàng nháp và reader **STATIC_BY_DESIGN**; không count-up, không replay hàng/receipt cũ khi Back. Modal đóng tức thì: không giữ snapshot exit, không đợi160ms để gửi lệnh hoặc áp guard. Animation không tự dismiss, xóa/lưu draft, recovery, logout hay đóng ca.

Consumer `recovery-shift/motion.mjs` dùng M00 createMotionController/press/notice/rowFeedback. Core primitive/token M00 và Home motion engine giữ nguyên hash. Overlay được mở rộng **opt-in motionMode=null mặc định** trong app-modal/action-dialog/action-feedback; caller P14 bật và truyền mode/cancel, consumer cũ giữ hành vi. Không provider/scroller mới hoặc thư viện mới. Native scroll và phục hồi focus ở owner cũ; P14 thu hồi cả RAF phục hồi khi hide/dispose.

## Flow fix phát hiện trong khi kiểm

Sau P15 hết phiên → Login → Recovery error, P15 đã ẩn vẫn bắt Escape ởwindow nên dialog P14 không đóng lần đầu. Sửa đúng owner `system/view.mjs`: bỏ bắt phím khi screen đang hidden/inert. Kiểm lại cạnh đó trong cả3mode và P15 navigation4nhóm. Không dùng motion che lỗi, không đổi auth/session policy. Chẩn đoán trước sửa giữ tại evidence/after/flow-before-failure*. Đây là sửa flow cục bộ, không tái chứng nhận toàn FLOW_GATE.

## Kiểm chứng

- `node scripts/check_motion_p14.cjs --before`: baseline4panel×3mode, screenshots và6trace trước tích hợp.
- `node scripts/check_motion_p14.cjs`: **21/21 nhóm PASS (7×3mode)**: validation/rapid submit, receipt/error, Cancel giữ draft/session, history/Back/scroll, compact viewport, liveOS/mode/hidden,10vòng mount/hide, expiry/cancel giữa animation, không callback cũ mở receipt lại.
- M02 shell regression: **36/36 PASS**. P14 flow regression: **8/8 PASS**. P15 navigation: **4/4 PASS**. P10/default shared modal: **12/12 PASS**. Tổng **81 nhóm browser**, gồm21nhóm M14 và60hồi quy.
- `node --test tests/motion-p14.test.mjs tests/recovery-shift.test.mjs tests/p14-audit-r06.test.mjs tests/dialog-route.test.mjs tests/motion-p02.test.mjs`: **40/40 PASS**. [Log](node-tests.txt).
- **12/12 cặp ảnh settle bằng pixel**, geometry/text/DOM bằng trước motion. Node delta0. Đây là đối chiếu current source trước–sau, không tự công nhận pixel-perfect với Designer. [Summary](SUMMARY.json).
- Common reference journey giữ3dispatch: recovery/save/end. Edge journey cuối mỗi mode có recovery3 (gồm1lỗi), save1, end1; hardware0, HTTPwrite0. Mode không đổi nghiệp vụ/quyền.

Actual Chromium headless,494×950,DPR1,zoom1,Arial; compact360×420 là mô phỏng keyboard-height. Trace recovery dừng trước nhập password; trace shift bắt đầu sau login, không ghi credential input. Traces/WAAPI durations/RAF opacity samples thật được lưu; không có FPS/drop-frame/latency benchmark thiết bị. **Không tuyên bố60fps**. Source app liên quan tăng **4.795bytes plain source**, không phải bundle production. Long-task logs giữ raw; after có thêm edge cases nên không dùng tổng của hai journey khác nhau để báo perf speedup.

## File / evidence / giới hạn

Sửa P14 view/record-dialog và thêm motion.mjs; auth/Home chỉ nối mode/cancel/route key. Shared overlay API opt-in được kiểm default consumers; sửa P15 guard ở trên. [Patch](changes.patch), [manifest](SOURCE_MANIFEST.json), [review](REVIEW.html).

Bằng chứng chính hiện nằm trên **ổ C, ngay trong thư mục M14**: `evidence/{before,after}`, `shell-regression`, `flow-regression`, `p15-regression`, `profile-regression`. Trong lượt trước, trace được chạy trênD khiC hết chỗ. Theo yêu cầu tiếp tục trênC, đã sao chép và kiểmSHA256 **596file/67.803.582bytes** vềC, bao gồm khôi phục thư mục bằng chứngP14 cũ thành thư mục thật, không còn junction. Đường dẫn ảnh/báo cáo cũ giữ nguyên. BảnD được giữ làm dự phòng, không phải vị trí bàn giao chính. [Xác minh lưu trữ](STORAGE_RESTORE.json), [manifest checksum](STORAGE_COPY_MANIFEST.json).

Một lần harness chọn nhầm cả toolsP14 đangẩn sau expiry; đã scope selector visible. Một lần hồi quy shell thiếu before.json tại thư mục output mới; đã dùng baseline M13/M02 có nguồn. Không sửa app để ép hai lỗi setup này qua. Lỗi Escape thật được sửa riêng đúng owner như trên.

Motion/behavior **PASS_SCOPED_UI_FIXTURE**, visual chờ user review. Backend/WMS/email/persistence thật, native camera/NFC/keyboard/safe-area và perf thiết bị **NOT_RUN/BLOCKED**. Không virtualization (không có profile cần), không đổi SCREEN_COVERAGE/business RUN_STATE, không deploy. Chỉ4dòng P14 trong MOTION_COVERAGE được cập nhật; các board motion còn lại giữ trạng thái.


Checkpoint M14 đã hoàn tất sau gián đoạn: MOTION_RUN_STATE và4dòng coverage được đồng bộ. Không chạy lại test chỉ vì chuyển vị trí file: toàn bộ sourcehash vẫn khớp bản đã kiểm, vàchecksum bằng chứng đã xác minh.
