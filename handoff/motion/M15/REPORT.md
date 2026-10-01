# MOTION_P15 — Hệ thống

Ngày2026-10-01 · **PASS_SCOPED_UI_FIXTURE** · visual chờ review, production/hardware chưa nghiệm thu. Đã thực thi đủ4panel ở **auto, OS reduced và off**. Giữ91panel/24board và trạng thái business integration cũ.

## Nguồn, gate và phạm vi

HEAD `da9f623a19d0359c3e80c14f8cc612636ec6ab78`; fixture `hn-flow-gate-2026-09-30-v1`. Đã đọc inputM15/MOTION_CONTRACT, contract gốc/UI_STANDARD, FLOW_GATE PASS (91panel), M00 và ownership hiện hành. Baseline runtime là P15 r03 cùng các sửa FLOW/M14 đã có, không dựng lại B15. [Scope](SCOPE.md), [input](inputs/MOTION_P15_He_thong.md), [manifest/delta](SOURCE_MANIFEST.json), [patch](changes.patch).

Thêm `docs/flows/system/motion.mjs`; sửa `system/view.mjs` và điểm nối mode/cancel/suspend trong `home/home.mjs`. **Primitive/token M00 giữ nguyên**, không thêm thư viện, provider, overlay manager, scroller hoặc virtualizer. CSS kích thước/footer/icon/input không sửa. M02 vẫn sở hữu route; overlay/focus vẫn do owner chung.

## Panel / policy

| Panel | Triển khai | auto / OS reduced / off |
|---|---|---|
| P15.S01 | SystemNotice: opacity .65→1 trên copy/icon140ms, không dịch camera/CTA; text có ngay; online không resend | PASS / PASS / PASS |
| P15.S02 | STATIC_BY_DESIGN: che/inert caller ngay, không exit delay hoặc snapshot định danh cũ trên màn hết phiên | PASS / PASS / PASS |
| P15.S03 | BlockingGuard áp ngay; chỉ notice opacity140ms | PASS / PASS / PASS |
| P15.S04 | Hướng dẫn tĩnh; DeviceFeedback press100ms, permission chỉ từ hành động người dùng | PASS / PASS / PASS |

Reduced notice80ms, press tĩnh; off không tạo animation. OS reduced không bị lựa chọnauto ghi đè. Notice identity được tiêu thụ cả khi off/hidden, không replay sau Back/mount lại. Đổi mode/OS, hide, auth suspension và dispose giải phóng handle/controller; animation không gọi command hoặc API thiết bị.

## Sửa flow cần thiết trước motion

Tái hiện hết phiên trong lúc đóng entryP15: [before/security-preflight.json](evidence/before/security-preflight.json) cho thấy caller vẫn `visible`, `inert:false`, chưa có S02 trong cùng lượt xử lý. Đã sửa đúng ownerP15: che caller trước mọi chờ history/dialog, hủy hiệu ứng cũ; S02 không hiển thị số phiếu khi auth đã mất. Draft/request vẫn nằm trong owner theo chính sách cùng trang/đúng tài khoản-kho. Login không animate snapshot dữ liệu cũ. Dialog hệ thống mới vẫn sử dụng được; không bị lớp chặn của caller che nhầm.

## Kiểm chứng thực tế

- Node: **35/35 PASS** — `node --test tests/motion-p15.test.mjs tests/motion-p14.test.mjs tests/motion-p02.test.mjs tests/system*.test.mjs tests/dialog-route.test.mjs`. [Log](node-tests.txt).
- `node scripts/check_motion_p15.cjs --before` và `node scripts/check_motion_p15.cjs`: **36 nhóm PASS** (12×3mode). [Kết quả](evidence/after/results.json). Gồm rapid tap, keyboard/focus, Back không replay,10chu kỳ denied-camera, đổi mode giữa press, offline→online với UNKNOWN, hết phiên giữa route fade/history close/dialog, cleanup khi Home giữ ẩn qua reauth.
- Mỗi mode: **camera1request từ click, record1, HTTPwrite0**; request phiếu giữ nguyên, không gửi lại. Không infer hardware từ fixture.
- Hồi quy trực tiếp **69 nhóm PASS**: M02 shell36 ([kết quả](shell-regression/results.json)), M14 motion21 ([kết quả](m14-regression/after/results.json)), P15 flow8+4 ([chính](flow-regression/browser-results.json), [edge](flow-regression/edge-results.json)). Chạy bằng scripts hiện có, output-dir riêng trongM15, không ghi đè evidence cũ. M02 sử dụng MOTION_PRIVATE_TRACE=1; baseline shell lấy từ evidenceM14 đã xác minh.
- **12/12 geometry và12/12PNG khớp** khi cùng caller/fixture, viewport494×950 CSSpx,DPR1,zoom1,Arial. [So sánh](pixel-comparison.json). S02 trong journey UNKNOWN có khác vùng nền sau mép footer22px do callerP04 khác Home; giữ ảnh đó ở after/, chụp thêmS02 từHome ở reference/ để so đúng điều kiện. Không sửa footer, kéo méo hoặc mask ảnh.

[Review ảnh/mode/trace](REVIEW.html). Trace thật từngmode và RAF opacity samples/WAAPI durations ở after/results. Trace kết thúc ởS02 trước nhập lại credentials; không ghi form reauth. Compact viewport/scroll/focus được kiểm ở suiteP15/shell/M14; không thay kiểm thiết bị thật.

App source liên quan tăng **3.213bytes plain source**, không phải bundle production. Không đo FPS/drop-frame/input latency trên thiết bị; không tuyên bố60fps hoặc perf speedup. Long-task logs là raw; before/after có số edge action khác nhau nên không dùng tổng để so tốc độ.

Một lỗi runner đếm toàn bộpress thay vì delta, một lần đợi Home sau reauth trong khi owner đúng là phiếu dở, và một lần chọn mode trong tools đang đóng đã được sửa để kiểm đúng hành vi. Lượt cuối kiểm thêm việc dispose controller lúc auth giữHome ẩn; đã sửa điểm nối lifecycle và chạy lại36nhóm. Logs lỗi giữ làm chẩn đoán, không là kết quả cuối.

## Bàn giao

Cập nhật4dòngM15 trong MOTION_COVERAGE và checkpoint MOTION_RUN_STATE; không đổi SCREEN_COVERAGE hoặc RUN_STATE nghiệp vụ. S01/S03 APPLIED, S02 STATIC_BY_DESIGN, S04 REUSED. Virtualization NOT_NEEDED. Camera/NFC vật lý, native keyboard/safe-area, WMS/auth thật và persistence vẫn NOT_RUN/BLOCKED. Không deploy; các motion board sau chưa được coi hoàn tất từ kết quả M15.
