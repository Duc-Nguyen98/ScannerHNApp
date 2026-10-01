# FLOW_LINK_GATE — Nối hoàn chỉnh P00–P24 trước khi thêm animation

Đọc `00_CONTRACT_CHUNG.md` và phần scope/gate trong `MOTION_CONTRACT.md`. Thực hiện trên source đã chạy P01–P24. P00 ở đây là nền tảng chung, không thêm board. Mục tiêu của lượt này là app UI liên tục với dữ liệu mẫu nhất quán, chưa thêm thư viện/effect mới và chưa deploy.

## Việc phải thực hiện

1. Đọc trạng thái git/source/entrypoint và báo cáo/coverage đã có. Xác nhận source_commit + working diff, target và fixture version. Không thay source đang làm bằng snapshot cũ. Nếu mới có file prompt, nêu code thiếu; không giả app đã dựng.
2. Lập route/state graph từ code thật. Mỗi edge ghi từ màn/state nào, action, guard, payload IDs, đích, Back/scroll/focus, response/error/cancel. Không bịa tên route/API từ tiêu đề board. Đối chiếu `FLOW_PANEL_MATRIX.csv` và bảng24 board bên dưới.
3. Thực hiện sửa nối luồng: handler/route/context/store dùng chung; giữ seed/quan hệ document/case/SKU/serial/NFC/session, không sinh lại demo ngẫu nhiên. Proposal và phần migrated theo contract. Các màn lịch sử dùng cùng domain source, không24 store độc lập.
4. Kiểm luồng theo thứ tự24 board, giữ nguyên state/mutation guard. Có thể checkpoint sau từng nhóm6 board để tiết kiệm context; đó là checkpoint nội bộ, không prompt bổ sung. Không dừng sau bản kế hoạch nếu còn làm được.
5. Từ entry app đi đến chức năng và quay lại; không coi test deep link riêng lẻ là đủ. Kiểm deep link/refresh/Back/Forward và payload invalid. Fixture/UI pass riêng với integration/hardware; demo không gọi production hoặc gửi thông báo thật.
6. Sửa lỗi tìm được trong scope. Giữ flow gate INCOMPLETE nếu thiếu luồng thiết yếu; không bắt đầu motion để che lỗi. Khi hoàn thành xuất `handoff/flow/FLOW_GATE.json`, `FLOW_GRAPH.csv`, `FLOW_REPORT.md`, `FIXTURE_MANIFEST.json` và evidence; cập nhật coverage có sẵn.

## Các bất biến bắt buộc

- Nhập/xuất chính record→chờWeb, không Post/duyệt trên App; warranty components mới Post trực tiếp theo contract. UNKNOWN phải kiểm trạng thái trước retry, không duplicate mutation.
- Hai original giữ visual đã khóa. Kho/quyền/case closed guard từ state nguồn, không chỉ disable bằng CSS. Logout/session expiry không lộ dữ liệu cũ.
- Mọi số lượng/tổng/badge theo cùng fixture scenario; ID sai ra lỗi hiện hành, không mở record đầu. Back giữ filter/anchor/draft cần giữ. Scene khác thời điểm được tách seed/scenario, không ép merge mâu thuẫn.
- One owner cho router, overlay/focus/body lock, scanner/NFC, request/cache; callback cũ không ghi sang màn/phiếu mới. Không bổ sung effect hay thay framework ở bước này.

## Ánh xạ đầy đủ24 board

| Board | State tối thiểu | Kết nối/context cần nối và kiểm |
|---|---|---|
| P01 — Đăng nhập & Xác nhận phiên | Đăng nhập; Xác nhận phiên làm việc | Nền tảng xác thực/source auth hiện có; liên kết quên mật khẩu sang P14, thành công sang P02. Không đợi P14 mới dựng form đăng nhập. |
| P02 — Trang chủ đã khóa | Trang chủ mặc định | P01 cho phiên; P04/P05/P06/P07/P09/P10/P12/P13 cho các đích; hub lịch sử P22. Đích chưa tồn tại phải ghi dependency, không tạo trang thành công giả. |
| P03 — Dialog cố định | Chọn tác vụ quét; Phiếu chưa hoàn tất; Kho tạm dừng; Xác nhận bỏ phiếu | AppShell P02; các luồng P04/P05/P09; resume P21; lỗi hệ thống P15. |
| P04 — Nhập kho | Thông tin phiếu nhập; Quét hàng nhập; Kiểm tra phiếu; Đã gửi phiếu nhập — chờ Web | P03 dialog; P06 dữ liệu sản phẩm; P12 chứng từ; P15/P17 lỗi; P24.S03 kết quả chờ Web. |
| P05 — Xuất kho | Thông tin phiếu xuất; Quét hàng xuất; Kiểm tra thiếu hàng; Đã gửi phiếu xuất — chờ Web | P03; dữ liệu P06; chứng từ P12; ngoại lệ P17; chờ Web P24. |
| P06 — Tra cứu | Tra cứu sản phẩm; Thông tin sản phẩm; Tồn kho sản phẩm; Lịch sử giao dịch | Danh mục/tồn/audit đọc hiện có; scan context P03; bảo hành P09; ngoại lệ dữ liệu P16. |
| P07 — NFC | Thẻ NFC; Đọc thẻ NFC; Xác minh liên kết; Đã liên kết thẻ NFC | P06 chọn sản phẩm; P15 thiết bị/quyền; P17 xung đột thẻ; P22 lịch sử event. |
| P08 — Lịch sử | Lịch sử danh sách; Chi tiết lịch sử; Phiên quét tham chiếu; Hoạt động theo ngày | P12 chứng từ; P22 hub/NFC; P23 phiên quét và bảo hành; P18 đính kèm. |
| P09 — Bảo hành | Bảo hành danh sách; Tiếp nhận bảo hành; Hồ sơ bảo hành; Kết quả sửa chữa | P06 sản phẩm; P18 bàn giao; P19 xuất linh kiện; P20 lịch sử linh kiện; P23 timeline; P24 hồ sơ đóng. |
| P10 — Cá nhân | Cá nhân; Chỉnh sửa hồ sơ; Công việc & quyền; Tài khoản & bảo mật | P01/P02 identity; P11 đổi mật khẩu/session; P14 kết thúc ca; P15 guard. |
| P11 — Bảo mật | Đổi mật khẩu; Xác thực thông tin — lỗi; Đã đổi mật khẩu; Phiên đăng nhập | P10 trang tài khoản; P01 auth; P15 phiên hết hạn. |
| P12 — Chứng từ | Chứng từ danh sách; Chi tiết chứng từ; Sản phẩm trong chứng từ; Tạo chứng từ mới | P04/P05 tạo nhập/xuất; P09 bảo hành; P16 data states; P18 tài liệu; P08 lịch sử. |
| P13 — Thông báo phê duyệt | Danh sách thông báo; Chi tiết thông báo; Danh sách chờ phê duyệt cũ → theo dõi phiếu chờ Web; Duyệt chứng từ cũ → chi tiết chờ xử lý Web | Chuông P02; chi tiết chứng từ P12; P24 chờ Web; nguồn notifications hiện có. |
| P14 — Khôi phục ca | Khôi phục tài khoản; Yêu cầu đã tiếp nhận; Kết thúc ca có phiếu dở; Tổng kết ca | P01 quên mật khẩu; P10 kết thúc ca; P03 draft dialog; P21 tiếp tục phiếu. |
| P15 — Hệ thống | Mất kết nối mạng; Phiên đăng nhập hết hạn; Không có quyền; Quyền thiết bị Camera & NFC | P01 auth; P03 modal; caller nhập/xuất/NFC; P17 trạng thái gửi chưa xác định. |
| P16 — Dữ liệu quyết lỗi | Đang tải chứng từ; Chưa có chứng từ; Không tìm thấy kết quả; Không tải được dữ liệu | P12 danh sách chứng từ; dùng pattern cho list khác khi không đổi baseline; P15 lỗi auth/network đặc thù. |
| P17 — Ngoại lệ quét | Mã không hợp lệ; Mã không thể xuất; Thẻ đã liên kết; Đang xác minh kết quả gửi | P04 nhập; P05 xuất; P07 NFC; P15 hệ thống; P21 unknown Post linh kiện. |
| P18 — Đính kèm bàn giao | Tệp đính kèm PN-0005; Xem tài liệu 1/2; Bàn giao bảo hành BH-001; Vị trí linh kiện kho | P12 document; P09 warranty; P06 item/location; nguồn upload/file/download và contract handoff. |
| P19 — 17 · Xuất linh kiện bảo hành | Quét linh kiện / mã hộp — scan; Nhập số lượng hộp — quantity; Xác nhận xuất linh kiện — review; Xuất thành công — success | Case P09; thành công về P20; resume P21; exception P24. Reuse editable source docs/flows/warranty-components/flow.js, các scene scan/quantity/review/success. |
| P20 — 18 · Lịch sử linh kiện | Phiếu linh kiện đã xuất — history; Tải thêm lịch sử — history-loading; Lỗi tải lịch sử — history-error; Chưa có phiếu xuất — empty | P09/P19/P23 cho case và xuất; P24 đóng case. Scene history/history-loading/history-error/empty. |
| P21 — 19 · Tiếp tục phiếu linh kiện | Phiếu đang thực hiện — drafts; Tiếp tục đúng phiếu — resume; Cần đối chiếu trên Web — reconcile; Kiểm tra kết quả xuất — post-check | P03 draft dialog; P19 scan/review/Post; P20 lịch sử; P22 shortcut phiếu dở. |
| P22 — 20 · Lịch sử thao tác & NFC | Lịch sử thao tác — history-hub; Lịch sử NFC — nfc; Chi tiết thao tác NFC — nfc-detail; Chưa có dữ liệu lịch sử — events-unavailable | Home Xem tất cả P02; documents P08/P12; draft P21; warranty/session P23; tag operation P07. |
| P23 — 21 · Bảo hành & phiên quét | Lịch sử bảo hành — warranty; Quá trình xử lý hồ sơ — warranty-detail; Lịch sử phiên quét — sessions; Chi tiết phiên quét — session-detail | P09 case; P20 linh kiện POSTED; P22 hub; P08 legacy session panel; P24 closed/waiting. |
| P24 — 22 · Trạng thái Scanner | Số lượng vượt tồn — quantity-invalid; Mã hộp chưa thể xuất — scan-error; Chờ xử lý trên Web — waiting-web; Hồ sơ đã trả khách — closed | P19 quantity/scan; P20 history; P21 resume; P04/P05 record; P09/P23 closed case. |

## Gate và bàn giao

FLOW_GATE.json tối thiểu: source_commit, working_diff_hash, target, fixture_version, board_count, panel_count, tested_edges, blockers, evidence_paths, gate_status. gate_status là READY_FOR_MOTION hoặc INCOMPLETE, độc lập status enum của SCREEN_COVERAGE. Ghi rõ evidence_scope=UI_FIXTURE/UI_CONNECTED; không đưa hardware/backend vào PASS khi chỉ mô phỏng. Các scenario PROPOSED đánh dấu trong review và báo giới hạn.

Điều kiện READY: đủ kiểm kê24board/91panel tham chiếu; mọi edge thiết yếu hiện hành đã kiểm hoạt động/guard đúng; không có crash, route cụt, mất context, sai fixture quan hệ hoặc duplicate operation chặn đánh giá. Phần chưa quyết định không tự chốt; nếu thiết yếu còn thiếu thì INCOMPLETE. Không cần phê duyệt lại visual/luật đã khóa.

Kết thúc báo đã nối/sửa gì, bằng chứng, gate và bước tiếp theo. Chỉ khi gate đủ mới chuyển sang MOTION_P00. Không tuyên bố code toàn hệ thống xong chỉ vì file graph đầy đủ.
