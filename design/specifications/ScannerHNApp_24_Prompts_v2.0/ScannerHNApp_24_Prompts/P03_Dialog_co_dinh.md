# P03 — Dialog cố định

**Đây là prompt triển khai. Hãy thực hiện đến khi hoàn thành toàn bộ phạm vi dưới đây; không chỉ xác nhận đã hiểu hoặc trả về kế hoạch.**

## Contract và phạm vi

Áp dụng [00_CONTRACT_CHUNG.md](00_CONTRACT_CHUNG.md), phiên bản 2.0. Nếu đã đọc trong phiên này, sử dụng quyết định và tiến độ còn hiệu lực; không hỏi lại. Nếu file chưa được cung cấp hoặc không đọc được, nêu đúng phần thiếu, không tự bịa contract.

- ID cố định: **P03/24**. Board: **Dialog cố định**. Nhóm: **LEGACY_ADAPTED — đối chiếu nghiệp vụ hiện hành**.
- Mục tiêu: Triển khai bộ dialog/sheet chung của scanner và bốn tình huống có trong board.
- Phụ thuộc và kết nối: AppShell P02; các luồng P04/P05/P09; resume P21; lỗi hệ thống P15.
- Tận dụng source, component và kết quả đã có. Chỉ sửa phần cần thiết cho board này và dependency trực tiếp. Không tạo prompt triển khai thứ 25, không yêu cầu tôi viết prompt con cho từng panel.

## Nguồn phải xem

- Ảnh đính kèm: [references/B03.png](references/B03.png).
- [Ảnh gốc tại commit đã đối chiếu](https://github.com/Duc-Nguyen98/ScannerHNApp/blob/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/01_UPDATED_BOARDS/01_dialog_header_aligned_v2.png) · [Mở ảnh trực tiếp](https://raw.githubusercontent.com/Duc-Nguyen98/ScannerHNApp/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/01_UPDATED_BOARDS/01_dialog_header_aligned_v2.png).
- [Tab Tất cả của gallery chính](https://duc-nguyen98.github.io/ScannerHNApp/) — chọn đúng tên board trên; không dùng gallery phụ 22 mục làm danh mục đầy đủ.
- Commit tham chiếu: `da9f623a19d0359c3e80c14f8cc612636ec6ab78`. Đường dẫn board: `design/01_Main/BOARDS/01_UPDATED_BOARDS/01_dialog_header_aligned_v2.png`.
- Nếu branch triển khai đã thay đổi, ghi source commit thực tế và chênh lệch liên quan; không tự đổi phạm vi hoặc thay ảnh baseline.
- Xem HANDOFF và DEV_PROPOSAL kèm trong references khi hành vi liên quan; chỉ HANDOFF chốt mới có quyền thay nghiệp vụ cũ. Proposal chưa phải API được duyệt.

## Chi tiết từng màn / trạng thái phải triển khai

Đối chiếu từng panel của ảnh; ID bên dưới dùng để kiểm kê, không bắt tạo route riêng. Không bỏ panel chỉ vì dùng lại component. Với panel cũ bị thay nghiệp vụ, lưu disposition=MIGRATED và bằng chứng thay thế.

| ID | Màn / trạng thái | Bố cục, nội dung cần dựng | Hành vi, điều kiện và kết quả |
|---|---|---|---|
| P03.S01 | Chọn tác vụ quét | Bottom sheet có grip, nút đóng X, tiêu đề Chọn tác vụ quét và bốn hàng icon: Nhập kho, Xuất kho, Bảo hành, Tra cứu sản phẩm. | Chọn hàng mở scanner với đúng operation context; chưa chọn thì không gửi mã vào nghiệp vụ mặc định. Đóng sheet trả lại màn gọi. |
| P03.S02 | Phiếu chưa hoàn tất | Dialog cảnh báo giữa màn: Bạn đang có phiếu chưa hoàn tất; nút Tiếp tục phiếu, Lưu nháp và thoát, Bỏ phiếu, Hủy theo phân cấp trong ảnh. | Tiếp tục dùng đúng document/session; Lưu nháp phải xác nhận kết quả lưu trước khi thoát; Bỏ phiếu mở dialog xác nhận S04. |
| P03.S03 | Kho tạm dừng | Dialog icon đỏ, thông báo Kho tạm dừng; CTA Về Trang chủ và Liên hệ quản trị. | Chặn action ghi của kho theo trạng thái nguồn; không dùng đóng dialog để bỏ guard. Liên hệ dùng kênh đã cấu hình, không tự gửi tin. |
| P03.S04 | Xác nhận bỏ phiếu | Dialog icon thùng rác và cảnh báo dữ liệu chưa lưu; Quay lại trung tính, Bỏ phiếu đỏ. | Chỉ bỏ dữ liệu chưa lưu trong phạm vi được phép. Không xóa mã server đã ghi nhận/phiếu đã Post; loại đó chuyển đối chiếu hoặc theo contract hủy hiện có. |

## Ràng buộc hình thức riêng

Dùng đúng ảnh 01_dialog_header_aligned_v2.png, không lấy 01_dialog_fixed.png làm baseline thay thế. Header gradient và bottom nav giữ đồng bộ; overlay, radius, độ rộng và thứ tự CTA lấy từ board/component hiện có.

Trước khi sửa, ghi số đo có nguồn của board này: vùng nội dung, header/footer, padding/gap, font, control, radius, icon và crop ảnh. Ưu tiên CSS/component thật; số đo từ ảnh phải ghi estimated. Không áp token chung chưa được xác minh và không render cả ảnh board thành giao diện.

## Logic và dữ liệu riêng

1. Tách close/cancel, save draft và discard; không gộp ba hành động thành clear localStorage.
2. Focus vào dialog, giữ focus trong dialog khi mở, đóng trả focus về control gọi; Esc/backdrop chỉ đóng khi chính sách của loại dialog cho phép.
3. Không hiện thông báo lưu thành công trước phản hồi; timeout lưu giữ nội dung và định danh để kiểm tra.
4. Tạm dừng kho không có nghĩa xóa phiên hay mất quyền đọc nếu contract không nói vậy.
5. Không tạo một dialog riêng lệch style cho mỗi module; dùng cùng component với props rõ ràng.

## Các ca nghiệm thu bắt buộc

| ID | Điều kiện đạt |
|---|---|
| P03.A01 | Mở/đóng từng state từ caller; không bị hai overlay cùng lúc. |
| P03.A02 | Tiếp tục phiếu giữ document ID và mã đã quét. |
| P03.A03 | Cancel bỏ phiếu giữ dữ liệu; xác nhận chỉ xóa draft được phép. |
| P03.A04 | Kho dừng chặn action ở cả dialog và route/handler, không chỉ disable nút. |
| P03.A05 | Keyboard focus và CTA cuối không bị safe area che. |

Ngoài các ca trên, capture và đối chiếu từng panel ở viewport tham chiếu hợp lệ. Kiểm tra responsive/keyboard/focus và state tương tác liên quan theo contract. Báo riêng visual, behavior và integration; fixture không đủ để đánh dấu tích hợp PASS.

## Điểm phải xác minh, không tự đoán

Quyền bỏ phiếu hoặc quy tắc lưu nháp chưa có API cần tích hợp đúng nguồn, không tự bổ sung DELETE.

Chỉ chặn phần phụ thuộc quyết định chưa có; tiếp tục phần độc lập. Không tự thêm màn, quyền, API, enum hoặc quy tắc nghiệp vụ để che thông tin thiếu. Nêu câu hỏi cụ thể sau khi đã làm đủ phần khả thi.

## Thực hiện và bàn giao

1. Đọc tiến độ đã có, xác định source/target và các file liên quan. Nếu đã chạy 5 prompt cũ, giữ kết quả còn đúng. Không cài lại toàn bộ dự án hoặc quét lại asset/bundle khi đã có bằng chứng đủ.
2. Kiểm tra đủ 4 panel nêu trên, xác định component, state transition, data adapter và route/context cần nối; ghi quyết định có nguồn ngắn gọn, rồi triển khai ngay.
3. Dựng UI và hành vi cho tất cả panel trong phạm vi. Nếu chỉ có prototype, tách fixture rõ ràng; không tạo thông báo thành công production giả. Dùng lại component/adapter chung và nối dependency có sẵn.
4. Chạy các ca nghiệm thu, kiểm tra render và lệnh kiểm tra sẵn có của dự án phù hợp thay đổi. Chỉ mở rộng kiểm tra khi có rủi ro cụ thể; sửa lỗi còn trong phạm vi và kiểm lại phần bị ảnh hưởng.
5. Xuất `handoff/P03/REPORT.md`: source commit/target, file đã sửa, coverage từng P03.Sxx, kết quả P03.Axx, link ảnh actual và baseline, lệnh/kết quả thật, khác biệt còn lại và blocker. Cập nhật `SCREEN_COVERAGE.csv` và `RUN_STATE.json` chung.
6. Nếu phiên bị ngắt, lưu điểm đang làm để tiếp tục chính P03; không tạo prompt mới và không coi checkpoint là hoàn thành. Nếu dependency của prompt trước vừa được hoàn tất ở đây, cập nhật các dòng coverage liên quan bằng bằng chứng mới.

**Kết thúc bằng kết quả đã làm và bằng chứng. Không kết thúc ở “bạn có muốn tôi bắt đầu không?”. Không báo toàn bộ board đạt nếu có panel bị bỏ, chưa chạy hoặc tích hợp chưa xác minh.**
