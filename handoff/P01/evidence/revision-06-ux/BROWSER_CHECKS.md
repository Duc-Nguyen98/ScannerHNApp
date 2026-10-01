# Browser observations — P01 r06

IAB tab kiểm tra riêng, localhost:8766, fixture. Không dùng tài khoản thật. 19 nhóm đạt:

1. Chặn `home/home.mjs`: login vẫn dựng; đăng nhập → xác nhận; bắt đầu cho lỗi tải UI, bỏ chặn → retry → Home.
2. P12 query `PN-`, tab Nhập kho, mở PN-0004 rồi Back: query/tab giữ, focus đúng PN-0004, scrollTop 303.2.
3. Mắt giữ selectionStart 1, password fixture length 9 không đổi, pointer vẫn focus password.
4. Caps Lock keyboard event tổng hợp bật/tắt hint.
5. CompositionStart + Enter + requestSubmit không gửi khi IME còn hoạt động.
6. P14 Back trả focus `forgot`, password rỗng và type password.
7. denied: start disabled, guidance nói thiếu quyền và liên hệ quản trị viên.
8. warehouse-stopped: start disabled, guidance nói kho ngừng hoạt động.
9. start-unknown: sau Để sau vẫn disabled, guidance yêu cầu đối chiếu, không gửi lại.
10. Tạm giữ Home request, mở logout dialog, cho tải xong: dialog giữ nguyên, focus Hủy, Home chưa hiện.
11. Hủy dialog rồi Mở Trang chủ dùng module đã tải, mở đúng Home.
12. Logout trước khi Home response đến: cho request tiếp tục vẫn ở login, không phục hồi session.
13. Viewport 360×800 → 360×400 khi focus password: scale 0.728745 giữ nguyên; input top332.882/bottom368.153 nằm trong vùng thấy.
14. P14 Back giữ username fixture, password rỗng, focus forgot. Kiểm bằng boolean trên DOM qua CDP vì read-only snapshot che giá trị username; không xuất credential.
15. Escape hủy logout giữ confirmation.
16. Mở trang mới không focus input.
17. Submit form rỗng focus username, aria-invalid=true.
18. Enter tại username chuyển focus password.
19. Submit có dữ liệu: eyeDisabled=true, submitDisabled=true ngay cùng tick.

8 layout không overflow ngang: S01/S02 tại360×800,430×932,494×950,1440×900. Các ảnh login-*/confirmation-* tương ứng. Khoảng làm tròn vùng bấm nhỏ nhất43.990 px. Không xác nhận physical-device/hardware/production.
