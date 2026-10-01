# M05 source/ownership trước thay đổi

Đầu vào: MOTION_P05_Xuat_kho.md và MOTION_CONTRACT v1.0 user cung cấp30/09/2026. Contract thiết kế2.0; B05 snapshot da9f623, giữ những adaptation đã có, không sửa raster. FLOW_GATE hiện PASS/blockers[], M00 verified; M01–M04 đã opt-in primitives. Business/WMS/hardware không được nâng trạng thái bởi motion.

| Vùng | Nguồn | Triển khai |
|---|---|---|
| P05.S01 | MotionP05/FormFeedback140ms; field/form hiện có | Reuse controller/consumer chung P04; chỉ opacity phản hồi field, không animate input/CTA/layout |
| P05.S02 | MotionP05 row160ms | EventId domain ổn định, highlight content hàng valid mới1lần; counter/camera/reticle static; không cuộn vì animation |
| P05.S03 | Thiếu3 ở7/10; notice140ms | Guard/text xuất hiện ngay; fade notice theo identity semantic chưa phát, không replay do Back |
| P05.S04 | Receipt xác minh + amber waiting Web | Reuse SubmitFeedback160ms của P04, không effect khiUNKNOWN/record chưa xong |
| AppShell/overlay/mode | M00/M02/M03 | Không provider/router/scroller thứ hai; OS reduced ưu tiên; hide/security/dispose cancel |

Ownership: tách consumer M04 sang shared Scan/Form/SubmitFeedback có prefix để P04/P05 dùng cùng code, giữ wrapper P04. M00 controller/token không đổi. P05 bật preserveCamera đã có trong renderer manual dùng chung; không tạo renderer/service mới. P04 cần regression sau refactor.

Virtualization: M00 LIST_AUDIT/STACK_DECISION chưa có profile đủ cho list dài; giữslice4/Xem tất cả và seed10. Không thêm lib/seed để làm motion. Geometry actualbefore/after494×950/DPR1,fixture clock2026-09-30T01:15:20Z; không lấy geometryPASS làm visual approval của Designer. Chỉ trace/RAF thật dùng làm bằng chứng motion; không hứaFPS.
