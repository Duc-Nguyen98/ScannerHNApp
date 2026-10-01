# P06 — Tra cứu

**Đây là prompt triển khai. Hãy thực hiện đến khi hoàn thành toàn bộ phạm vi dưới đây; không chỉ xác nhận đã hiểu hoặc trả về kế hoạch.**

## Contract và phạm vi

Áp dụng [00_CONTRACT_CHUNG.md](00_CONTRACT_CHUNG.md), phiên bản 2.0. Nếu đã đọc trong phiên này, sử dụng quyết định và tiến độ còn hiệu lực; không hỏi lại. Nếu file chưa được cung cấp hoặc không đọc được, nêu đúng phần thiếu, không tự bịa contract.

- ID cố định: **P06/24**. Board: **Tra cứu**. Nhóm: **LEGACY_ADAPTED — đối chiếu nghiệp vụ hiện hành**.
- Mục tiêu: Dựng bốn màn tra cứu sản phẩm/linh kiện, thông tin, tồn theo vị trí và lịch sử giao dịch.
- Phụ thuộc và kết nối: Danh mục/tồn/audit đọc hiện có; scan context P03; bảo hành P09; ngoại lệ dữ liệu P16.
- Tận dụng source, component và kết quả đã có. Chỉ sửa phần cần thiết cho board này và dependency trực tiếp. Không tạo prompt triển khai thứ 25, không yêu cầu tôi viết prompt con cho từng panel.

## Nguồn phải xem

- Ảnh đính kèm: [references/B06.png](references/B06.png).
- [Ảnh gốc tại commit đã đối chiếu](https://github.com/Duc-Nguyen98/ScannerHNApp/blob/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/01_UPDATED_BOARDS/04_tra_cuu.png) · [Mở ảnh trực tiếp](https://raw.githubusercontent.com/Duc-Nguyen98/ScannerHNApp/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/01_UPDATED_BOARDS/04_tra_cuu.png).
- [Tab Tất cả của gallery chính](https://duc-nguyen98.github.io/ScannerHNApp/) — chọn đúng tên board trên; không dùng gallery phụ 22 mục làm danh mục đầy đủ.
- Commit tham chiếu: `da9f623a19d0359c3e80c14f8cc612636ec6ab78`. Đường dẫn board: `design/01_Main/BOARDS/01_UPDATED_BOARDS/04_tra_cuu.png`.
- Nếu branch triển khai đã thay đổi, ghi source commit thực tế và chênh lệch liên quan; không tự đổi phạm vi hoặc thay ảnh baseline.
- Xem HANDOFF và DEV_PROPOSAL kèm trong references khi hành vi liên quan; chỉ HANDOFF chốt mới có quyền thay nghiệp vụ cũ. Proposal chưa phải API được duyệt.

## Chi tiết từng màn / trạng thái phải triển khai

Đối chiếu từng panel của ảnh; ID bên dưới dùng để kiểm kê, không bắt tạo route riêng. Không bỏ panel chỉ vì dùng lại component. Với panel cũ bị thay nghiệp vụ, lưu disposition=MIGRATED và bằng chứng thay thế.

| ID | Màn / trạng thái | Bố cục, nội dung cần dựng | Hành vi, điều kiện và kết quả |
|---|---|---|---|
| P06.S01 | Tra cứu sản phẩm | Header và scan shortcut; ô tìm mã/tên/SKU/Serial, clear, filter; tabs Sản phẩm/Linh kiện có count; card ảnh/tên/mã/SKU/SN/kho/vị trí/tồn/khả dụng và chip Còn hàng/Hết hàng. | Search/filter/tab phối hợp theo adapter đã có; mở đúng item ID. Count không lấy số dòng của trang hiện tại giả làm tổng server. |
| P06.S02 | Thông tin sản phẩm | Hero ảnh + HN12345/XP-420B; ba action Quét mã, In tem, Bảo hành; nhóm thông tin cơ bản, tồn kho và gallery thumbnail. | Bind trường đúng dữ liệu; In tem không có quyền phải thực sự bị chặn. Chỉ mở hành động đã có contract, không tự làm tính năng in. |
| P06.S03 | Tồn kho sản phẩm | Thông tin item/kho khóa; strip tổng tồn/khả dụng/đang giữ/không khả dụng; danh sách vị trí A-01-03, B-02-01, C-01-02, D-01-01. | Read-only; fixture 12 = 10+1+1 và vị trí 6+3+2+1. Không đổi tồn, move hàng, xác nhận vị trí hoặc thêm capacity từ màn khác. |
| P06.S04 | Lịch sử giao dịch | Thông tin sản phẩm; filter loại giao dịch và khoảng ngày; timeline nhập/xuất/bảo hành có số lượng +/- và status. | Lấy event thật; dấu quantity theo event backend, không suy rằng mọi sự kiện bảo hành đều giảm tồn. Mở đúng chứng từ liên quan khi được phép. |

## Ràng buộc hình thức riêng

Giữ danh sách card compact, tabs đầu danh sách, thông tin chia section, trạng thái bằng text+chip; bottom nav đồng bộ. Tái sử dụng asset sản phẩm có thật, không sinh ảnh máy/linh kiện.

Trước khi sửa, ghi số đo có nguồn của board này: vùng nội dung, header/footer, padding/gap, font, control, radius, icon và crop ảnh. Ưu tiên CSS/component thật; số đo từ ảnh phải ghi estimated. Không áp token chung chưa được xác minh và không render cả ảnh board thành giao diện.

## Logic và dữ liệu riêng

1. SKU, serial và item code là ba trường khác nhau; thiếu SN hiển thị theo policy nguồn, không điền SKU thay serial.
2. Available/held/unavailable không tự định nghĩa bằng phép trừ nếu backend định nghĩa khác; chỉ fixture đã thống nhất mới dùng tổng kiểm.
3. Quyền in/xem bảo hành là capability, không suy từ role display name.
4. Search/filter không làm mất loại danh mục đang chọn; Back từ detail giữ query/list position khi nguồn đã hỗ trợ.
5. Không thêm CRUD, điều chỉnh tồn, chuyển kho hoặc chức năng in thật chỉ từ icon trên board.

## Các ca nghiệm thu bắt buộc

| ID | Điều kiện đạt |
|---|---|
| P06.A01 | Search mã/tên/SKU/serial trả đúng dữ liệu theo scope; clear không xóa dữ liệu gốc. |
| P06.A02 | Tồn fixture tổng 12/khả dụng10/giữ1/không khả dụng1 khớp vị trí. |
| P06.A03 | Item hết hàng có zero thật; field thiếu không biến thành 0. |
| P06.A04 | Không có quyền in không gọi action qua keyboard/route. |
| P06.A05 | Lịch sử lọc đúng range/type và không dựng event từ current status. |

Ngoài các ca trên, capture và đối chiếu từng panel ở viewport tham chiếu hợp lệ. Kiểm tra responsive/keyboard/focus và state tương tác liên quan theo contract. Báo riêng visual, behavior và integration; fixture không đủ để đánh dấu tích hợp PASS.

## Điểm phải xác minh, không tự đoán

Chi tiết filter/nguồn ảnh sản phẩm và action In tem chưa đủ nguồn phải ghi rõ; không thay bằng icon/ảnh bên ngoài.

Chỉ chặn phần phụ thuộc quyết định chưa có; tiếp tục phần độc lập. Không tự thêm màn, quyền, API, enum hoặc quy tắc nghiệp vụ để che thông tin thiếu. Nêu câu hỏi cụ thể sau khi đã làm đủ phần khả thi.

## Thực hiện và bàn giao

1. Đọc tiến độ đã có, xác định source/target và các file liên quan. Nếu đã chạy 5 prompt cũ, giữ kết quả còn đúng. Không cài lại toàn bộ dự án hoặc quét lại asset/bundle khi đã có bằng chứng đủ.
2. Kiểm tra đủ 4 panel nêu trên, xác định component, state transition, data adapter và route/context cần nối; ghi quyết định có nguồn ngắn gọn, rồi triển khai ngay.
3. Dựng UI và hành vi cho tất cả panel trong phạm vi. Nếu chỉ có prototype, tách fixture rõ ràng; không tạo thông báo thành công production giả. Dùng lại component/adapter chung và nối dependency có sẵn.
4. Chạy các ca nghiệm thu, kiểm tra render và lệnh kiểm tra sẵn có của dự án phù hợp thay đổi. Chỉ mở rộng kiểm tra khi có rủi ro cụ thể; sửa lỗi còn trong phạm vi và kiểm lại phần bị ảnh hưởng.
5. Xuất `handoff/P06/REPORT.md`: source commit/target, file đã sửa, coverage từng P06.Sxx, kết quả P06.Axx, link ảnh actual và baseline, lệnh/kết quả thật, khác biệt còn lại và blocker. Cập nhật `SCREEN_COVERAGE.csv` và `RUN_STATE.json` chung.
6. Nếu phiên bị ngắt, lưu điểm đang làm để tiếp tục chính P06; không tạo prompt mới và không coi checkpoint là hoàn thành. Nếu dependency của prompt trước vừa được hoàn tất ở đây, cập nhật các dòng coverage liên quan bằng bằng chứng mới.

**Kết thúc bằng kết quả đã làm và bằng chứng. Không kết thúc ở “bạn có muốn tôi bắt đầu không?”. Không báo toàn bộ board đạt nếu có panel bị bỏ, chưa chạy hoặc tích hợp chưa xác minh.**
