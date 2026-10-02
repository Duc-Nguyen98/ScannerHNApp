# P14 · Recovery / Shift · prototype r01

Entry: `/flows/auth-session/` → Quên mật khẩu; hoặc minhanh/preview → xác nhận phiên → Cá nhân → Kết thúc ca. Bốn panel giữ nguyên P14.S01–S04. Tools ngoài khung app có ready/error/unknown/timeout-recorded/blocked. Không gửi email/thông báo, không thay password/quyền/tồn, không có OTP/2FA.

`model.mjs` là controller/adapter **nội bộ preview**, không phải API đề xuất được duyệt. Recovery trả receipt chỉ sau xác nhận fixture; thông báo không phân biệt username tồn tại. Receipt ID/time do adapter trả. UNKNOWN giữ cùng request; chỉ check mới đối chiếu, đổi kịch bản không xóa pending. `blocked` mô phỏng chưa có kênh production. Reload khôi phục dữ liệu ban đầu.

Phiếu dở dùng snapshot owner P04/P05/P03. Lần đầu mở P14, nếu nguồn trống, preview khởi tạo **một phiếu P04 bằng owner flow hiện có** để trình diễn S03 theo B14; không có API tạo phiếu thật. PN-0005 là nhãn từ P04, không đổi ID để khớp PN-0001 trong ảnh. Source snapshot giữ documentId/scanSessionId/version/accepted/request/note; lưu checkpoint trong bộ nhớ P14, không xóa/submit/Post phiếu, không tự chuyển chủ sở hữu. Snapshot bị sửa sau lưu thì khóa End lại. UNKNOWN/busy trên owner phải đối chiếu tại owner trước khi lưu. P03 legacy resume/P21 vẫn phụ thuộc owner, không hydrate phiếu khác vào P04.

End chỉ mở S04 khi không còn snapshot chưa lưu và receipt khớp request, actor/auth-session/kho/quyền còn hợp lệ. Phiên auth giữ nguyên. Summary là snapshot tại thời điểm kết thúc, không cập nhật ngầm bằng số hàng đã tải. S04 dùng identity/thời gian bắt đầu từ phiên và thời gian kết thúc adapter (giờ Việt Nam), thay giờ/ngày in cứng của ảnh. KPI B1412/6/4/3/5 là **30 sự kiện minh họa thuộc các nhóm loại trừ nhau**; 5 chứng từ là lượt xem riêng, không cộng trùng sự kiện nhập/xuất. Đây chưa phải định nghĩa aggregate được backend phê duyệt.

Proposal còn chờ: kênh/xác minh/rate-limit recovery; contract liệt kê/lưu/đối chiếu phiếu dở và policy kết thúc/bắt đầu ca tiếp; định nghĩa aggregate/scope/timezone backend. End preview không thiết lập policy khóa thao tác sau ca hay tự bàn giao. P21 chưa nghiệm thu. Không suy PASS production từ fixture.

UI tái dùng action-feedback + readable-text + operation-icons, footer Home/P03 nguyên mẫu. Adapter paint ở auth P14 dùng biến palette shared, không sửa palette. Source hình và số đo tại handoff/P14/MEASUREMENTS.md. Chú thích đề xuất quy trình bàn giao của B14 đặt ở tài liệu/tools, không thành lời hứa trong app.


## r03 · user duyệt triển khai audit

State banner/CTA dùng presentation.mjs; recovery dock gửi/check riêng. record-dialog.mjs dùng app-modal/dialog-route, pending chỉ đọc, summary luôn đọc receipt.request.records. Request end trong preview chốt actor/kho/startTime cùng records; không là contractAPI mới. Scroll/focus lưu trong controller theo panel/phiên và dispose khi logout. Xem handoff/P14/REVISION_03.md,30nhóm browser/24Node; hình thức chờ review.


## r05 · Lịch sử/Đăng xuất sau Tổng kết

S04 dùng shared P10 logout button và một confirmation trước gọi P01 teardown. Xem lịch sử mở P08 hiện có; Back về summary/scroll/focus. draft-retention.mjs thuộc auth adapter page lifetime, chỉ checkpoint đường logoutP14 theo namespace/actor/kho, restore owner P04/P05/P03 khi login lại; không persist token hoặc dữ liệu lênstorage/WMS. Reload/reset vẫn đặt lại fixture. Không quảng cáo giữ nháp bền vững. Source/evidence tại handoff/P14/REVISION_05.md.


## r06 · audit UI và reauth

Focus/caret form và keyboard disclosure đã sửa; receiptfixture dùng page-sequence/dateVN. Home P15 resume chỉ rebind cùngowner đã xác nhận; late request giữ nguyênscope/ID và cần check, không replay. Cachegeography đọc không làm dirtycheckpoint; nội dung thật vẫn kiểm. Giữ logoutWarningP18 và hợp đồng UI đã khóa. Evidence35Node/53browser tại handoff/P14/REVISION_06.md; không chứng nhận WMS/hardware.
