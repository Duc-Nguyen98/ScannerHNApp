# P01 r07 — rà soát lại UI/UX và khắc phục

Theo yêu cầu user rà soát kỹ sau r06. Phạm vi: P01, điểm nối P14 khôi phục và handoff Home. Không phải audit toàn bộ nghiệp vụ 24 board. Giữ ID, palette/icon/background/footerLOCK; không sửa baseline/nguồn auth hoặc quyền.

## Lỗi / khắc phục / bằng chứng

| Nhóm | Trước | Sau |
|---|---|---|
| IME bị hủy | compositionstart rồi rời field không có compositionend làm form không gửi dù hợp lệ (aria-busy=false) | Reset composition khi focusout; Enter đang composition vẫn bị chặn |
| Caps hint lifecycle | Blur giấu hint nhưng không báo layout, vùng nhìn thấy có thể không cập nhật | onLayout khi hint thật sự biến mất; test số lần gọi |
| P14 header Back | replaceState biến entry recovery thành login thứ hai; mất caller state | Token caller riêng; Back tiêu thụ đúng entry, chống nhấn trùng; giữ username/cuộn trong epoch, password xóa |
| UNKNOWN sau Để sau | Chỉ còn Đăng xuất có thể bấm, không mở lại hướng dẫn đối chiếu | Cùng nút chính đổi thành Thông tin đối chiếu, mở lại dialog đã có. Không gọi start hoặc giả API đối chiếu |
| Metadata phiên bị cũ | Kho active→false: badge vẫn xanh Đang hoạt động nhưng start đã disabled; đổi tên kho không phản ánh | Update text/badge tại chỗ, không thay controls; unknown dùng nhãn và màu trung tính, không giả ngừng hoạt động |
| Nội dung tên kho dài | Chưa có reader cho tên kho; dữ liệu cùng màn không cập nhật | Dùng readable-text chung, giữ nguyên tên đầy đủ/newline/Unicode; tên ngắn giữ bố cục, tên dài đọc trong dialog |
| Focus handoff | Sau retry Home focus rơi về body, không ở nội dung Home | Focus heading một lần khi mount; không giành focus khi Home đã mount |
| Dialog bị cắt | Sau thao tác khiến trang ngoài cuộn, long reader có top âm (ví dụ -35.2 tại494×950; -41.65 tại320×568) | Neo outer preview về đầu AppShell khi dialog P01 mới mở, không reset cuộn trong dialog; không sửa shared modal |

Ảnh và dữ liệu tái hiện ở `evidence/revision-07-audit/`. Màu trung tính UNKNOWN, reader tên kho và nhãn Thông tin đối chiếu là cách thể hiện trạng thái cần user review, không có raster Designer riêng. Nguồn và giới hạn tại `REVISION_07_CONTEXT.md`.

## Kiểm chứng sau sửa

- `node --test tests/*.mjs tests/*.cjs`: **641/641 đạt** tại snapshot đã chạy, exit0. Thêm **6** test r07, không nhận test của công việc đồng thời là do audit này viết.
- Auth/Home tập trung **47/47 đạt**. `node --check app.mjs`, `git diff --check` đạt.
- Browser xác minh IME hủy vẫn login được; header Back trở lại history state `auditCaller=P01`, focus forgot và username fixture còn; password không được lưu qua recovery.
- UNKNOWN mở được dialog Đối chiếu phiên sau Để sau; controller test xác nhận không start lại. Nguồn đối chiếu thật vẫn chưa kết nối.
- Adapter fixture thay thế chỉ trong response tab audit: kho dừng cập nhật badge; unknown ra `badge unverified`; tên kho2000+ký tự hiển thị reader, full string đúng nguyên văn. Không ghi adapter này vào source và đã bỏ interception/đóng tab cũ.
- Home sau handoff: headingFocused=true, hiddenFocus=false.
- 5 kích thước:320×568,360×800,430×932,494×950,844×390. Login validation không overflow ngang và focus username. Long metadata trước khi modal fix không overflow card. Long reader sau fix top lần lượt14.35/17.49/20.89/24/9.85; bottom553.65/674.82/806.03/926/380.15, đều trong viewport, nút Đóng còn thấy. Ảnh `dialog-*.png`.
- Hồi quy fixture: denied và kho dừng giữ disabled; expired khi start và auth-unknown về P01.S01; Escape đóng dialog không thực hiện mutation.

## Giới hạn

Không tuyên bố toàn hệ thống hết lỗi hoặc visual100%. Kiểm IME/state đổi/long data bằng event và fixture trong trình duyệt; keyboard/thiết bị thật và backend chưa xác minh. Lỗi tải module phụ/timeout nghiệp vụ vẫn theo giới hạn r06, không thêm policy tự suy. Các màn P03–P23 chưa được full business regression trong lượt này. Shared priority-touch đang có được giữ, không sửa hoặc nhận công việc của lượt khác.

## Files

app.mjs, experience.mjs, style.css, version query bootstrap/index, tests/auth-session-audit-r07.test.mjs, báo cáo/evidence P01; cập nhật field checkpoint riêng giữ active P23. Không sửa auth-flow/fixture-adapter/Home/shared modal.
