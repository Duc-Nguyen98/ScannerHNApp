# P14 r05 · Tổng kết → Lịch sử / Đăng xuất

User yêu cầu triển khai proposal r05. Giữ4panel, ca kết thúc khác auth logout, footerLOCK.

| Thay đổi | Nguồn | Thực thi |
|---|---|---|
| Hai action S04 | User duyệt | Xem lịch sử outline56px trên; Đăng xuất chính56px dưới, dock/lề24/gap12 |
| Logout style/confirm | P10 existing + HN-action-feedback | Dùng cùng component/style P10, Hủy/Đăng xuất, không dialog success trùng sau login |
| History route | Existing P08 | Mở danh sách hiện có, Back giữ summary/scroll/focus; không giả lọc theo ca |
| Giữ nháp | User proposal + kiểm source | Snapshot owner mất khi Home dispose. Thêm store page-memory riêng theo namespace/actor/kho, phục hồi owner P04/P05/P03 đúng ID/scan/version/codes/request sau logout-login cùng trang |
| Scope lưu | Contract preview | Không token/password, không localStorage/network. Reload/reset fixture vẫn xóa dữ liệu thử; không hứa persistenceWMS |

Không ép đăng xuất tự động hoặc tạo policy ca mới. Nút S04 chỉ xuất hiện khi có receipt end hợp lệ. Chặn P14 logout khi có owner busy/UNKNOWN hoặc không giữ được snapshot; giữ phiên và chỉ dẫn đối chiếu. Source entry/Home/P04/P05 chỉ thay bridge cần thiết cho luồng mới, bảo toàn công việc chat khác.

Before/after494×950 CSSpx/DPR1/Arial/clock2026-09-29T08:30+07. Production recovery/shift/auth/persistence còn BLOCKED, visual cần user review.
