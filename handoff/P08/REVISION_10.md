# P08 r10 / P06 — giới hạn ngày truy vấn dùng chung
User xác nhận chỉ chọn từ hôm nay lùi90 ngày, khóa tương lai/ngày91 trở về trước. Lịch sử cũ xem thủ công.
## Phạm vi và quy tắc
- Audit docs/flows tìm thấy3 bề mặt datepicker tra cứu: P08 bộ lọc from/to, P08.S04 ngày hoạt động, P06.S04 lịch sử giao dịch sản phẩm. Không có datepicker chứng từ nghiệp vụ khác trong code hiện tại.
- Shared query-date-policy.mjs tính theo Asia/Ho_Chi_Minh và ngày lịch, không lấy mốc fixture. Hôm nay=D0, D-90 và D0 được phép; D-91/D+1 bị khóa. Hai đầu inclusive nên có91 mốc ngày nếu đếm cả hôm nay.
- P08 ngày/tháng ngoài miền disabled; nhập text được validate trước commit. Nút handler kiểm lại để không bypass bằng bỏ disabled. Arrow keyboard chỉ tới ngày enabled. Giới hạn tính lại khi paint/submit, có test qua nửa đêm.
- P06 native date có min/max; focus refresh min/max, flow.filters kiểm lại trước commit. Form novalidate để báo lỗi tại chỗ bằng cùng quy tắc, không chỉ dựa browser validity.
- Cả2 ô ngày trống=manual all-history. Chỉ1 ô trống sẽ tự điền biên tương ứng, không vô tình truy vấn vượt phạm vi90 ngày.
- P06 Bỏ lọc ngày; P08 Xóa lọc hoặc bỏ ngày trong filter. P08.S04 có Xem lịch sử không lọc ngày mở S01 không giới hạn ngày. Query/scroll/truy cập bản ghi cũ vẫn sử dụng nguồn đầy đủ.
- Không cắt/xóa records. Default fixture dates được clamp vào miền hợp lệ khi seed quá cũ; P08 saved filter quá hạn được bỏ ngày kèm thông báo, không âm thầm sửa giá trị người dùng thành ngày khác. Calendar cursor/day default clamp hợp lệ.
- Thay đổi giới hạn query UI không phải quyền/backend API hoặc thời hạn lưu dữ liệu.
## Kiểm chứng r10
-6/6 nhóm browser PASS, filter ở6 viewport. Clock test cố định27/09/2026 Việt Nam: min29/06/2026,max27/09/2026;28/06 và28/09 bị khóa. Đây là đồng hồ test, app dùng thời gian chạy thực.
- Kiểm ngày hợp lệ/không tồn tại, nhập tay, one blank/both blank, state không đổi khi invalid, keyboard trap, nav tháng giới hạn.
- Test0h Việt Nam: D-90 cũ thành D-91 bị từ chối; hôm nay mới được nhận khi submit.
- P06 native min/max + flow guard; clear date giữ các sự kiện.
- Test clock01/02/2027 khi toàn bộ fixture đã quá90 ngày: từ daily vào manual list vẫn48 records, tìm LS-0001 mở đúng PN-0005.
-35/35 Node targeted PASS. Test P06 cũ cho phép29/02/2024 được cập nhật: ngày lịch đúng nhưng ngoài90 ngày phải reject; valid correction dùng bounds động. Date validity leap-year unit test vẫn giữ.
- Không chạy suite r04/r09 cũ nguyên vẹn vì assertion chọn01/10/2026 khi hôm nay27/09 nay trái quy tắc đã duyệt. Không giả PASS các assertion lỗi thời.
- Backend/hardware NOT_RUN. Không sửa lỗi P03/P05 ngoài scope; không tuyên bố mọi test toàn hệ thống PASS.
## Bằng chứng
- evidence/revision-10/browser-results.json; node-tests.txt
- calendar-future.png; calendar-oldest.png; p06-date-limits.png; manual-old-history.png; filter6 viewport
- scripts/check_query_dates.cjs; tests/query-date-policy.test.mjs
- docs/flows/shared/query-date-policy.mjs
- P06 lookup.mjs/lookup-flow.mjs/style.css; P08 picker/model/history/style; auth CSS cache labels
Giữ baseline/fixture24 prompts91 panel; không push/merge/deploy. Chưa thiết kế thêm luồng lịch sử cũ/backend ngoài danh sách hiện có.
