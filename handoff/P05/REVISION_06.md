# P05 revision06 — focus Bước1 và template danh sách chọn

Yêu cầu27/09/2026: bỏ active input trên toàn Bước1, đồng bộ option khi mở select với template màn xuất kho. Hiểu theo vùng khoanh ảnh: bỏ viền xanh vuông bên trong input; vẫn nhập/sửa và thấy lỗi bình thường.

## Thay đổi

- S01 input (kho khóa/tên khách/phone/address/planned) và textarea bỏ outline/box-shadow mặc định. Focus bàn phím nhận biết bằng viền ngoài trầm cùng bo góc của field; lỗi đỏ ưu tiên, không bị focus ghi đè. Scope chỉ S01, không thay input quét S02 hoặc các flow khác.
- Ba native select nguồn/người nhận/nhóm được thay bằng component `select-control.mjs`: trigger cùng icon/font/khung; danh sách trắng bo góc, option48px, hover nhẹ, mục đang chọn nền nhạt+dấu tích; nhãn dài wrap. Không còn popup option hệ điều hành lệch template.
- Danh sách mở trong luồng cuộn của app để luôn cùng scale494×950, không bị cắt bởi transformed shell/CTA. Chỉ một danh sách mở; tự đưa danh sách vào vùng nhìn thấy. Không thêm board/panel mới, không thay baseline.
- ARIA listbox/option, selected/expanded/controls/label; mũi tên/Home/End chỉ di chuyển focus; Enter/Space/click chốt chọn; gõ tìm theo tiền tố; Escape hủy trả focus; Tab đóng và tiếp tục thứ tự; click ngoài đóng không chọn. Không có modal mới hoặc overlay chồng.
- Khi đổi giữa các danh sách, đóng sau khi click được nhận, tránh layout đổi ở pointerdown khiến mất click. Render/hide/dispose đóng danh sách và dọn listener toàn cục.
- Commit nguồn vẫn phải qua xác nhận r05; hủy giữ trigger/option/dữ liệu cũ. Walk-in, liên hệ tự điền, planned1–99/default1, khóa sau scan/request vẫn giữ nguyên. Kiểm tra giá trị trong flow không đổi.

## Kiểm chứng

- Node workspace **122/122 PASS**: [log](evidence/revision-06/node-tests.txt).
- Select/focus **8 nhóm PASS**, **18 case bố cục** (3 list ×6 viewport340×420/390×844/494×1000/768×1024/1440×1000/1869×940). Bao gồm keyboard/cancel/commit/outside/Tab/single-list, selected sync, walk-in, khóa sau scan. [Kết quả](evidence/revision-06/select-results.json).
- Metadata **8**, validation **8**, lifecycle **8**, hồi quy P05/P04 **12** nhóm PASS; tổng **44 nhóm browser**. Kết quả dưới `evidence/revision-06/{metadata,validation,lifecycle,regression}/browser-results.json` (metadata dùng `metadata-results.json`). Không JS errors trong các suite.
- Đã xem ảnh [người nhận mở](evidence/revision-06/02-recipient-open.png), [input lỗi không viền xanh](evidence/revision-06/01-input-error.png). Header/CTA cố định, body cuộn, không tràn ngang/cắt option. Visual mới chờ user duyệt; thiết bị và trợ năng screen-reader thật chưa kiểm chứng.

Giữ checkpoint P08/công việc P03 và91 coverage rows. Backend vẫn chưa tích hợp; không reload tab nháp của user, push/merge/deploy.
