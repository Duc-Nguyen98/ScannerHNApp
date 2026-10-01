# P15 — trạng thái hệ thống dùng chung

P15 r02 áp dụng sáu đề xuất user đã yêu cầu: presentation.mjs chọn CTA theo read/reconcile, project context từ owner cùng actor/kho; view dùng getContext và actionLabel có nguồn, camera denied ưu tiên hướng dẫn, unsupported không lặp CTA; S01–03 dùng dock cố định. Không có context thì không bịa số phiếu. Số dài dùng readable-text shared. Evidence và khác biệt: handoff/P15/REVISION_02.md.

`mountSystem` gắn một vùng nội dung trong shell494×950 của caller, dùng nguyên node footer. Caller DOM/scroll/owner request vẫn còn; nội dung caller inert và không nhìn thấy khi P15 mở. Không route/menu debug trong navigation sản phẩm. Công cụ P15 nằm ngoài app ở trang prototype.

- `classifySystemError`:401→expired,403→forbidden, network/unknown→connection, device→device. Không đoán TypeError/500 là mất mạng.
- `showSystem(error,{read})` trong Home là bridge cho owner. `read` chỉ được nối hàm đọc/đối chiếu đã có contract. P04/P05 nối `flow.check()` có kiểm cùng request; không nối `send`/`record`/`Post`. `verified` chỉ cho phép đóng boundary sau khi owner xác minh; P15 không tạo receipt hay đổi tồn.
- Actual403 đóng effective write/route guard trong Home cho đến đăng nhập lại; không sửa quyền nguồn hay role. Controls deny/allow chỉ dành cho fixture ngoài app.
- `createAuthFlow.expire()` hủy auth adapter/session và vô hiệu hóa epoch. App giữ owner đang làm trong bộ nhớ cùng trang, chỉ phục hồi khi identity namespace/actor/kho khớp sau P01 login + xác nhận. UNKNOWN còn UNKNOWN, không replay. Khác identity bỏ giao diện caller cũ; reload/reset/pagehide đặt lại fixture. Không lưu password/token/localStorage/checkpoint mới. Đây chưa phải persistence hoặc policy reauth của production.
- `createDeviceAccess` kiểm API secure context; NDEFReader tồn tại chỉ nghĩa có thể kiểm, không báo phần cứng sẵn sàng. Camera chỉ gọi getUserMedia khi người dùng bấm, xác minh live track rồi dừng mọi track. Hướng dẫn không tự đổi settings. `reportFailure(device,error,{fixture})` nhận lỗi thiết bị thật từ caller; fixture bị bỏ qua. P07 fixture chỉ mở panel; trạng thái khả dụng lấy từ môi trường thực.
- `contact` là cấu hình tùy chọn `{label,value}` của mountSystem, chỉ hiển thị trong dialog. Hiện chưa có kênh được cung cấp nên không bịa số/URL hoặc gửi tin.

Contract API production không được phát minh ở đây. Adapter HTTP/WMS, contact thật, retention policy, native camera/NFC và P17 chưa tích hợp. Xem `handoff/P15/REPORT.md` và evidence cho phạm vi test prototype.
