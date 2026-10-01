# HN-readable-content-v1 · Áp dụng P01–P11, khóa cho P12 trở đi

Ngày2026-09-28. User yêu cầu mở rộng nâng cấp nội dung dài của P12 r05 về P01–P11 và khóa contract để các màn sau tuân thủ. **Đã triển khai và khóa trong AGENTS.md/UI_STANDARD.md.** Không tạo prompt mới; giữ24 board/91 panel và công việc của các chat khác.

## Contract đã khóa

- Ghi chú xem gọn **2 dòng**, mô tả/narrative **3 dòng**. Xem đầy đủ chỉ hiện nếu số đo render thật cho thấy nội dung bị rút gọn.
- Nội dung nguồn giữ nguyên; reader dùng dialog cuộn được, line-height1.6, Đóng, focus/backdrop/Escape/Back theo component chung. Không tạo overlay chồng.
- Dòng body khoảng1.5, phân nhóm16–24px. Textarea giữ chiều cao theo màn, cuộn nội bộ; không cho kéo dài vô hạn. Giữ nguyên limit/validation hiện hành của owner, không lấy250 làm limit mới.
- Không dùng reader để cắt thông tin xác nhận, cảnh báo, UNKNOWN hoặc validation. Không áp lên input/password/textarea. Nội dung đã ở dialog được đọc đầy đủ qua scroller hiện có.
- Tên nằm trong card có action không được sinh button lồng button. Trường hợp P06 đặt trigger mô tả ngoài nút mở giao dịch.
- Bắt buộc dùng `shared/readable-text.mjs`/`.css` cho phần mới P12–P24. P02 dùng adapter xem tên đã có; P12 r05 giữ UI đã kiểm và dùng primitive `isTextTruncated` chung.

Nguồn quy ước: [UI_STANDARD.md](../../docs/flows/shared/UI_STANDARD.md), [AGENTS.md](../../AGENTS.md). Không thay backend contract, không nới quyền, không ghi WMS, không đổi trạng thái nghiệp vụ.

## Mapping áp dụng

| Phạm vi | Cách xử lý |
|---|---|
| P01.S01–S02 | Input/password bị loại khỏi controller, kể cả gắn marker sai. Danh tính/vai trò dài có reader; greeting không kéo vỡ hero. Giữ phiên/validation. |
| P02.S01 | Giữ nút xem tên đầy đủ đã có; không thêm viewer trùng. Nội dung ngắn/static không bị đổi thành ghi chú giả. |
| P03.S01–S04 | Confirmation/cảnh báo giữ toàn văn trong dialog đang mở, hỗ trợ cuộn/wrap. Không rút gọn hậu quả hành động hay tạo overlay thứ hai. |
| P04.S01–S04 | Note input giữ200; note trong Kiểm tra phiếu là block riêng có reader. Không đổi mã/version/codes/request hay record. |
| P05.S01–S04 | Như P04; giữ recipient/address/planned, request/UNKNOWN và inventoryDelta=0. |
| P06.S01–S04 | Tên/mô tả chi tiết sản phẩm và mô tả giao dịch có reader. Mô tả trong hàng có action dùng trigger bên ngoài nút, tránh nested button. |
| P07.S01–S04 | Tên sản phẩm trong phần xác minh/read-only có reader. UID/serial và detail hiện hữu đọc đầy đủ trong dialog; artwork/motion/quyền/link/reconcile giữ nguyên. |
| P08.S01–S04 và history dùng chung | Note ở chi tiết dùng reader; filter/date/scope/scroll/Back giữ nguyên. Các trang lịch sử dùng renderer chung nhận cùng cải tiến. |
| P09.S01–S04 | Ghi chú/lỗi/chẩn đoán/kết quả/phụ kiện và mô tả event có reader. Khối narrative trong hồ sơ dùng toàn chiều rộng. Intake/update textarea cuộn nội bộ, giữ validation/counter. Case đóng vẫn read-only. |
| P10.S01–S04 | Danh tính/vai trò dài đọc đầy đủ; không đổi input/editor hoặc cấp quyền. Giữ dirty draft/logout/kết thúc ca. |
| P11.S01–S04 | Tên thiết bị/OS/vị trí/app và metadata kết quả có reader. Không đọc giá trị password, không log/persist secret, không thay session/revoke hoặc chính sách password. |
| P12 | R05 giữ card/dialog hiện có, dùng cùng phép đo tràn dòng; không bị controller tạo nút/dialog trùng. |

## Component và lifecycle

Controller gắn marker rõ ràng `data-hn-readable`, không quét rồi đọc mọi input. Mutation/resize observer chỉ đo node được đánh dấu; không biến đổi record hay ghi storage. Viewer chụp text nguyên văn khi mở bằng textContent (không thực thi HTML). Đăng ký handler navigation từ lúc mount để tiêu thụ Back trước router; tools được resolve khi mở để nền được khóa đúng. Node/phiên mất hoặc marker bị gỡ thì bỏ reader/observer/trigger cũ. Metadata có kind=value giữ leading nguồn, tránh làm lệch hình thức ngắn đã chốt.

## Kiểm chứng

| Bộ kiểm tra | Kết quả |
|---|---|
| Node: toàn29 file test hiện có | **268/268 PASS** · [log](evidence/node-tests.txt) |
| Audit nội dung dài P01–P12 | **15 nhóm PASS** · [kết quả](evidence/audit/results.json) |
| P01/P02/P03/P10 hiện hành | **17 nhóm PASS**,66 panel×viewport · [kết quả](evidence/root/results.json) |
| P04/P05 | **23 nhóm PASS**,66 đo layout · [kết quả](evidence/p04-p05/browser-results.json) |
| P06/P07 | **11 nhóm PASS**,48 panel×viewport · [kết quả](evidence/p06-p07/browser-results.json) |
| P08/P09 | **12 nhóm PASS**,61 đo layout · [kết quả](evidence/p08-p09/browser-results.json) |
| P11 shared account/session | **11 nhóm PASS** · [kết quả](evidence/p11/results.json) |
| P11 result/dialog/layout | **7 nhóm PASS** · [kết quả](evidence/p11-layout/results.json) |

Tổng **96 nhóm browser**, zero pageerror trong các kết quả cuối. Các suite có phần hồi quy giao nhau; đây không phải96 nghiệp vụ production độc lập. Audit gồm rỗng/ngắn/250/2000+, từ liền, newline, Unicode/HTML,6 viewport cho reader, bấm nền, full string, focus, Back, storage/secret exclusion, repeated lifecycle. Các suite nền kiểm panel/layout/permissions/UNKNOWN/record, logout và password/session preview. Các kích thước phổ biến360×800,430×932,494×950/1000,1440×900/1000 và340×420; DPR1, Chromium local, không phần cứng/WMS thật.

- Lệnh chính: `node --test` với danh sách `rg --files tests -g '*.test.mjs' -g '*.test.cjs'`; `node scripts/check_readable_content.cjs`; các `check_dialog_sync_root`, `check_inbound_outbound_dialog_sync`, `check_dialog_sync_p06_p07`, `check_dialog_sync_p08_p09`, `check_security_live_preview`, `check_security_dialog_layout` với env output dưới thư mục evidence này.
- Lượt đầu đã sửa lifecycle reader/route và một thẻ đóng HTML dư trong list P06. Check responsive có chờ observer ổn định100ms. Logs/failure cũ được giữ; kết quả cuối theo JSON ở trên.
- Suite legacy `check_dialogs.cjs` còn assertion context PN-0001 trên đường dẫn đã thay ở revision khác; **không tính PASS**, dùng suite root hiện hành kiểm đủ4 panel P03. P04/P05 test được cập nhật để Xem chứng từ đi P12 thật; các stress test P09/P11 dùng full reader thay giả định note dài phải phình hết trang.

## Bằng chứng hình thức và giới hạn

Đã xem ảnh reader dài ở P04/P09/P10/P11. Actual trong từng thư mục evidence; ví dụ [P04 note](evidence/audit/P04-note-494x950.png), [P09 note](evidence/audit/P09-note-494x950.png), [P11 device](evidence/audit/P11-device-494x950.png). Các ảnh stress hiển thị chuỗi kiểm thử, không phải dữ liệu thật.

Visual áp dụng theo pattern user chốt, actual mới vẫn cần user review; status baseline/pixel match cũ không được tự nâng thành PASS. Behavior đạt trong prototype cho các ca liệt kê. Integration production, API/hardware và nội dung không có contract vẫn giữ blocker cũ. Footer, icon nghiệp vụ, baseline, dist/gallery không sửa; không push/merge/deploy.

File chính: shared/readable-text.mjs/.css; action-feedback.mjs hỗ trợ tools getter; auth-session app/index; markup inbound/outbound/lookup/nfc/history-detail/warranty/profile/security; documents.mjs dùng primitive chung; AGENTS/UI_STANDARD/CONTRACT_CONTEXT và checkpoint/coverage. Không sửa auth/warehouse/warranty/security model hoặc validator để vượt kiểm tra.
