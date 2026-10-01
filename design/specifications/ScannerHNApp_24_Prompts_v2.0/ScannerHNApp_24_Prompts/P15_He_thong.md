# P15 — Hệ thống

**Đây là prompt triển khai. Hãy thực hiện đến khi hoàn thành toàn bộ phạm vi dưới đây; không chỉ xác nhận đã hiểu hoặc trả về kế hoạch.**

## Contract và phạm vi

Áp dụng [00_CONTRACT_CHUNG.md](00_CONTRACT_CHUNG.md), phiên bản 2.0. Nếu đã đọc trong phiên này, sử dụng quyết định và tiến độ còn hiệu lực; không hỏi lại. Nếu file chưa được cung cấp hoặc không đọc được, nêu đúng phần thiếu, không tự bịa contract.

- ID cố định: **P15/24**. Board: **Hệ thống**. Nhóm: **LEGACY_ADAPTED — đối chiếu nghiệp vụ hiện hành**.
- Mục tiêu: Triển khai bốn trạng thái dùng chung: kết nối, phiên hết hạn, thiếu quyền và quyền thiết bị.
- Phụ thuộc và kết nối: P01 auth; P03 modal; caller nhập/xuất/NFC; P17 trạng thái gửi chưa xác định.
- Tận dụng source, component và kết quả đã có. Chỉ sửa phần cần thiết cho board này và dependency trực tiếp. Không tạo prompt triển khai thứ 25, không yêu cầu tôi viết prompt con cho từng panel.

## Nguồn phải xem

- Ảnh đính kèm: [references/B15.png](references/B15.png).
- [Ảnh gốc tại commit đã đối chiếu](https://github.com/Duc-Nguyen98/ScannerHNApp/blob/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/02_NEW_BOARDS/13_he_thong_fixed.png) · [Mở ảnh trực tiếp](https://raw.githubusercontent.com/Duc-Nguyen98/ScannerHNApp/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/02_NEW_BOARDS/13_he_thong_fixed.png).
- [Tab Tất cả của gallery chính](https://duc-nguyen98.github.io/ScannerHNApp/) — chọn đúng tên board trên; không dùng gallery phụ 22 mục làm danh mục đầy đủ.
- Commit tham chiếu: `da9f623a19d0359c3e80c14f8cc612636ec6ab78`. Đường dẫn board: `design/01_Main/BOARDS/02_NEW_BOARDS/13_he_thong_fixed.png`.
- Nếu branch triển khai đã thay đổi, ghi source commit thực tế và chênh lệch liên quan; không tự đổi phạm vi hoặc thay ảnh baseline.
- Xem HANDOFF và DEV_PROPOSAL kèm trong references khi hành vi liên quan; chỉ HANDOFF chốt mới có quyền thay nghiệp vụ cũ. Proposal chưa phải API được duyệt.

## Chi tiết từng màn / trạng thái phải triển khai

Đối chiếu từng panel của ảnh; ID bên dưới dùng để kiểm kê, không bắt tạo route riêng. Không bỏ panel chỉ vì dùng lại component. Với panel cũ bị thay nghiệp vụ, lưu disposition=MIGRATED và bằng chứng thay thế.

| ID | Màn / trạng thái | Bố cục, nội dung cần dựng | Hành vi, điều kiện và kết quả |
|---|---|---|---|
| P15.S01 | Mất kết nối mạng | Header Kết nối; icon mạng/cảnh báo; Chưa thể đồng bộ; lời nhắc không gửi lại phiếu khi chưa kiểm kết quả; Thử lại/Về Trang chủ. | Retry đọc hoặc kiểm kết quả phù hợp; không tự replay mutation. Giữ draft/context và ghi trạng thái pending/unknown. |
| P15.S02 | Phiên đăng nhập hết hạn | Header Phiên hết hạn; icon tài liệu/clock; thông báo đăng nhập lại; CTA Đăng nhập lại. | Đưa đến P01 qua flow auth hiện có, chặn route bảo vệ. Bảo vệ dữ liệu draft theo policy; không lưu password/token vào checkpoint. |
| P15.S03 | Không có quyền | Header Quyền truy cập; icon khóa; Không có quyền thực hiện; Quay lại/Liên hệ quản trị. | Guard action/route, không chỉ ẩn nút. Contact dùng kênh cấu hình; không tự gửi tin hoặc nâng role. |
| P15.S04 | Quyền thiết bị Camera & NFC | Hai card riêng: Camera chưa cho phép với Cho phép camera/Mở hướng dẫn; NFC không khả dụng với Dùng thiết bị hỗ trợ/Mở hướng dẫn. | Phân biệt not requested, denied, unsupported, hardware error. Chỉ gọi permission API từ thao tác user phù hợp; không báo support qua fixture hoặc từ tên máy. |

## Ràng buộc hình thức riêng

Giữ trung tâm icon/copy/CTA và card thiết bị, header/bottom nav đúng caller; không thay màn lỗi toàn cục bằng toast thoáng qua gây mất hướng xử lý.

Trước khi sửa, ghi số đo có nguồn của board này: vùng nội dung, header/footer, padding/gap, font, control, radius, icon và crop ảnh. Ưu tiên CSS/component thật; số đo từ ảnh phải ghi estimated. Không áp token chung chưa được xác minh và không render cả ảnh board thành giao diện.

## Logic và dữ liệu riêng

1. Lỗi mạng khác auth401 và forbidden403; map từ lỗi thực, không đưa mọi lỗi vào 'mất mạng'.
2. Không dùng Retry để tạo lại phiếu hoặc Post chưa biết kết quả.
3. Không xóa dữ liệu đã được xác minh server; draft bảo mật tách khỏi auth secrets.
4. Unsupported NFC không đồng nghĩa permission denied; không nút xin quyền vô tác dụng.
5. Các state phải reusable cho module khác, không render route debug trong production navigation.

## Các ca nghiệm thu bắt buộc

| ID | Điều kiện đạt |
|---|---|
| P15.A01 | Đang gửi mất mạng → unknown, không replay; đọc lại trạng thái chỉ theo source hỗ trợ. |
| P15.A02 | Phiên hết hạn không tiếp tục mutation từ màn đang mở. |
| P15.A03 | Forbidden route trực tiếp vẫn chặn. |
| P15.A04 | Từ chối camera có hướng dẫn và không crash; NFC unsupported không hiện đã sẵn sàng. |
| P15.A05 | Thoát error state quay đúng caller/context không mất draft ngoài policy. |

Ngoài các ca trên, capture và đối chiếu từng panel ở viewport tham chiếu hợp lệ. Kiểm tra responsive/keyboard/focus và state tương tác liên quan theo contract. Báo riêng visual, behavior và integration; fixture không đủ để đánh dấu tích hợp PASS.

## Điểm phải xác minh, không tự đoán

Không cam kết mọi platform hỗ trợ camera/NFC giống nhau; đánh dấu phần test thiết bị thật chưa chạy, không suy từ render.

Chỉ chặn phần phụ thuộc quyết định chưa có; tiếp tục phần độc lập. Không tự thêm màn, quyền, API, enum hoặc quy tắc nghiệp vụ để che thông tin thiếu. Nêu câu hỏi cụ thể sau khi đã làm đủ phần khả thi.

## Thực hiện và bàn giao

1. Đọc tiến độ đã có, xác định source/target và các file liên quan. Nếu đã chạy 5 prompt cũ, giữ kết quả còn đúng. Không cài lại toàn bộ dự án hoặc quét lại asset/bundle khi đã có bằng chứng đủ.
2. Kiểm tra đủ 4 panel nêu trên, xác định component, state transition, data adapter và route/context cần nối; ghi quyết định có nguồn ngắn gọn, rồi triển khai ngay.
3. Dựng UI và hành vi cho tất cả panel trong phạm vi. Nếu chỉ có prototype, tách fixture rõ ràng; không tạo thông báo thành công production giả. Dùng lại component/adapter chung và nối dependency có sẵn.
4. Chạy các ca nghiệm thu, kiểm tra render và lệnh kiểm tra sẵn có của dự án phù hợp thay đổi. Chỉ mở rộng kiểm tra khi có rủi ro cụ thể; sửa lỗi còn trong phạm vi và kiểm lại phần bị ảnh hưởng.
5. Xuất `handoff/P15/REPORT.md`: source commit/target, file đã sửa, coverage từng P15.Sxx, kết quả P15.Axx, link ảnh actual và baseline, lệnh/kết quả thật, khác biệt còn lại và blocker. Cập nhật `SCREEN_COVERAGE.csv` và `RUN_STATE.json` chung.
6. Nếu phiên bị ngắt, lưu điểm đang làm để tiếp tục chính P15; không tạo prompt mới và không coi checkpoint là hoàn thành. Nếu dependency của prompt trước vừa được hoàn tất ở đây, cập nhật các dòng coverage liên quan bằng bằng chứng mới.

**Kết thúc bằng kết quả đã làm và bằng chứng. Không kết thúc ở “bạn có muốn tôi bắt đầu không?”. Không báo toàn bộ board đạt nếu có panel bị bỏ, chưa chạy hoặc tích hợp chưa xác minh.**
