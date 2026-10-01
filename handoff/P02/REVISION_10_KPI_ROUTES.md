# P02 r10 — KPI mở danh sách đúng trạng thái

Yêu cầu: bấm hai KPI Phiếu chờ duyệt/Bảo hành đang mở trả về danh sách tương ứng. Phạm vi P02 và hai dependency hiện có P12/P09; giữ footerLOCK, layout KPI, ca bắt đầu và các công việc P13 đang được cập nhật đồng thời.

## Kết quả

- KPI phiếu mở `#p02/documents?panel=1&kpi=waiting`, preset trạng thái `waiting` = **Chờ xử lý trên Web**, tất cả loại/ngày, không mang truy vấn/lọc cũ vào. Đây là trạng thái nhập/xuất hiện có theo HANDOFF, không cấp quyền duyệt/Post. Caption Home “Phiếu chờ duyệt” giữ theo baseline; title và accessible label chỉ rõ danh sách chờ xử lý Web.
- KPI bảo hành mở `#p02/warranty?panel=1&kpi=open`. Nhóm UI “Bảo hành đang mở” bao gồm3 trạng thái hiện có **Đã tiếp nhận / Đang kiểm tra / Chờ bàn giao**; loại **Đã trả khách** và trạng thái chưa biết. Nhóm này có trong picker để người dùng nhận biết/chuyển lọc; không phải enum backend mới.
- Hai KPI là button thật, có focus/Enter/Space, hover nhẹ; không thêm badge/mũi tên và không sửa footer. Zero mở empty state đúng filter; UNKNOWN disabled và handler không tự mở danh sách all.
- Số KPI lấy từ cùng **nguồn fixture hoàn chỉnh** mà P12/P09 sử dụng, không đếm từ3 recent rows hay một trang phân trang. Fixture hiện **5 phiếu waiting /4 hồ sơ open**, thay số1 minh họa cũ. P04/P05 confirmed receipts hợp nhất theo ID cùng P12, không đếm nháp/UNKNOWN; Home cập nhật count khi quay về. Closed case làm giảm count open.
- Bộ lọc KPI được lưu vào history entry riêng, giữ khi xem chi tiết rồi Back/Về danh sách. Lần bấm KPI mới reset preset đúng trạng thái. Mở tab/card module bình thường khôi phục bộ lọc bình thường của module, không bị preset KPI ghi đè. P12 Tất cả(5) ở entry KPI là tổng các loại dưới status/date đó, không hiển thị24 khiến hiểu nhầm.

## Kiểm chứng

- `node --test tests/home.test.mjs tests/home-kpi.test.mjs tests/documents.test.mjs tests/warranty.test.mjs`: **32/32 PASS**. Count và predicate shared; dedup receipt; scope kho; unknown/returned loại khỏi open; state updates không dùng sốhardcode.
- `node scripts/check_home_kpi.cjs`: **6 nhóm PASS**. Click/Enter đúng5waiting; stale search reset; detailBack giữ search/filter; normal entry khôi phục riêng;4open không córeturned; nút Về danh sách giữopen;0/UNKNOWN; focus và footer. Không JS errors;494/360px không overflow sau resize đã render xong.
- `node scripts/check_home_footer_locked.cjs`: **4 viewport PASS**, footerHome/P03 vẫn cùng styleLOCK, timestamp ca giữ nguyên.
- `node --check` modules đã sửa và `git diff --check` exit0. Lần kiểm resize đầu đo trước requestAnimationFrame nên báo overflow trong frame trung gian; đã chờ render/ResizeObserver rồi chạy lại PASS, không sửa UI để che lỗi.

[Browser results](evidence/revision-10-kpi/results.json) · [Node log](evidence/revision-10-kpi/node-tests.txt) · [Home](evidence/revision-10-kpi/home-494.png) · [Danh sách phiếu chờ](evidence/revision-10-kpi/waiting-documents.png) · [Bảo hành đang mở](evidence/revision-10-kpi/open-warranties.png).

Files: Home home/fixture-adapter/style, P12 documents module (preset/history restoration), P09 warranty module (open grouping/preset/restoration), shared/warranty-cases (predicate trạng thái có sẵn), cache entry P01, tests Home/KPI, scriptcheck. Không sửa source rows để ép count khớp ảnh. Không thay nghiệp vụ/API/quyền/camera hoặc làm các prompt khác. Backend totals/filter/permission phải nối nguồn thật sau; current counts chỉ là fixture, không integrationPASS.
