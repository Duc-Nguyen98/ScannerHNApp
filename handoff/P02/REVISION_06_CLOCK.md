# P02 r06 — KPI cân đều, đồng hồ Việt Nam và nền Home liền mạch

Ngày2026-09-28. Chỉ thị mới của user cho phép chỉnh vùng KPI và màu layout Home theo ảnh `Desktop/1.png`, `Desktop/2.png`. Đây là ngoại lệ có yêu cầu rõ so với B02 LOCKED; không sửa ảnh baseline. Target prototype; giữ các triển khai P01–P12 có trước và checkpoint P12.

## Thay đổi

- KPI3 cột bằng nhau (`repeat(3,minmax(0,1fr))`), padding12, nhãn13px. Clock22px, line36, chữ số tabular; số đếm32px. Giữ card cao98px, icon clock25px cả padding; giờ/icon/nhãn có khoảng riêng, không giành chỗ khi thêm giây.
- Thay nhãn **Ca bắt đầu** bằng **Giờ Việt Nam · UTC+7**. Hiển thị `HH:mm:ss` theo `Asia/Ho_Chi_Minh`, hourCycle=h23, không dùng múi giờ mặc định máy/trình duyệt. Dữ liệu giờ là instant của thiết bị, không đồng bộ máy chủ/NTP, không phải giờ bắt đầu ca hay thời gian làm việc.
- `vietnam-clock.mjs` đọc Date.now mỗi lần tick, căn theo giây; không cộng dồn1 vào giá trị cũ. Pause khi rời Home/ẩn tab/P03 che Home, refresh ngay khi trở lại; dispose hủy timer/listener. Chỉ cập nhật text/datetime của time node; aria-live off để screen reader không đọc mỗi giây. Không network/camera/API mới.
- Hai KPI nghiệp vụ vẫn lấy adapter; UNKNOWN vẫn UNKNOWN. Clock độc lập vẫn chạy khi dữ liệu nghiệp vụ chưa có. Fixture shiftStarted được giữ để không thay contract các module khác, nhưng không còn dùng để hiển thị giờ trên Home.
-4 task cùng nền trắng và viền nhẹ; bỏ highlight Nhập kho như đang được chọn. Màu nghiệp vụ chỉ ở icon theo `operation-icons.css` đã duyệt. CTA/scan circle/avatar cùng xanh nhấn; nền main/screen/nav Home cùng một surface. Hero chuyển nhẹ về nền phía dưới. Không thay màu trạng thái đỏ/xanh/amber. Footer thay màu chỉ trong class `hn-home-active`, không áp sang các module khác.

## Kiểm chứng

- `node --test tests/vietnam-clock.test.mjs tests/home.test.mjs`:9/9 PASS. Kiểm UTC+7, padding0, 23:59:59→00:00:00, qua năm, delayed timer bắt kịp giờ thật, pause/resume/dispose và không nhân đôi timer.
- `node scripts/check_home_clock.cjs`:6 nhóm PASS;5 capture494×950,360×800,430×932,1264×712,1869×940; Chromium DPR1. Trình duyệt cố ý dùng America/New_York, clock vẫn khớp Việt Nam. Không chồng giờ/icon, cột đều, không horizontal overflow, màn vừa viewport, hàng cuối không bị nav che, task cùng nền, surface Home liền mạch.
- Kiểm tick không thay geometry/focus; UNKNOWN; rời Home qua P06 và quay lại; document visibility mô phỏng để kiểm listener (không coi là device sleep thật). JS errors=[].
- `node --check home.mjs`, `git diff --check`:exit0. B02 SHA256 vẫn `ed0d7b90fdb66778cab0ff53b9537785e55ec60227d7666e5d7693f42eb15ef8`.

[Kết quả/metrics](evidence/revision-06-clock/results.json) · [Node log](evidence/revision-06-clock/node-tests.txt) · [Actual494](evidence/revision-06-clock/home-494.png) · [Actual360](evidence/revision-06-clock/home-360.png) · [Desktop](evidence/revision-06-clock/home-1264.png).

## File và nghiệm thu

Thêm `docs/flows/home/vietnam-clock.mjs`, `tests/vietnam-clock.test.mjs`, `scripts/check_home_clock.cjs`; sửa `home.mjs`, `style.css`, cập nhật cache revision ở P01 entry và expectation UNKNOWN tại `check_home.cjs` (2 metric, clock riêng). Không sửa auth logic, session, backend, board hoặc bundle. Không chạy lại toàn bộ test các prompt khác cho thay đổi P02 này. Bố cục/màu mới cần user review; không tuyên bố giống tuyệt đối B02. Dữ liệu kho realtime/backend/hardware vẫn chưa được xác nhận bởi đồng hồ.
