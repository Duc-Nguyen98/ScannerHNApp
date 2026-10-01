# P24 — 22 · Trạng thái Scanner

**Đây là prompt triển khai. Hãy thực hiện đến khi hoàn thành toàn bộ phạm vi dưới đây; không chỉ xác nhận đã hiểu hoặc trả về kế hoạch.**

## Contract và phạm vi

Áp dụng [00_CONTRACT_CHUNG.md](00_CONTRACT_CHUNG.md), phiên bản 2.0. Nếu đã đọc trong phiên này, sử dụng quyết định và tiến độ còn hiệu lực; không hỏi lại. Nếu file chưa được cung cấp hoặc không đọc được, nêu đúng phần thiếu, không tự bịa contract.

- ID cố định: **P24/24**. Board: **22 · Trạng thái Scanner**. Nhóm: **CURRENT — bộ hiện hành**.
- Mục tiêu: Triển khai board gốc22: quantity vượt tồn, hộp chưa thể xuất, chờ Web và hồ sơ đã trả khách; khép kín kiểm tra liên module.
- Phụ thuộc và kết nối: P19 quantity/scan; P20 history; P21 resume; P04/P05 record; P09/P23 closed case.
- Tận dụng source, component và kết quả đã có. Chỉ sửa phần cần thiết cho board này và dependency trực tiếp. Không tạo prompt triển khai thứ 25, không yêu cầu tôi viết prompt con cho từng panel.

## Nguồn phải xem

- Ảnh đính kèm: [references/B24.png](references/B24.png).
- [Ảnh gốc tại commit đã đối chiếu](https://github.com/Duc-Nguyen98/ScannerHNApp/blob/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/02_NEW_BOARDS/22_trang_thai_scanner.png) · [Mở ảnh trực tiếp](https://raw.githubusercontent.com/Duc-Nguyen98/ScannerHNApp/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/02_NEW_BOARDS/22_trang_thai_scanner.png).
- [Tab Tất cả của gallery chính](https://duc-nguyen98.github.io/ScannerHNApp/) — chọn đúng tên board trên; không dùng gallery phụ 22 mục làm danh mục đầy đủ.
- Commit tham chiếu: `da9f623a19d0359c3e80c14f8cc612636ec6ab78`. Đường dẫn board: `design/01_Main/BOARDS/02_NEW_BOARDS/22_trang_thai_scanner.png`.
- Nếu branch triển khai đã thay đổi, ghi source commit thực tế và chênh lệch liên quan; không tự đổi phạm vi hoặc thay ảnh baseline.
- Xem HANDOFF và DEV_PROPOSAL kèm trong references khi hành vi liên quan; chỉ HANDOFF chốt mới có quyền thay nghiệp vụ cũ. Proposal chưa phải API được duyệt.

Các scene tương ứng panel bên dưới (fixture prototype, không phải bằng chứng backend hoạt động):

- P24.S01: [quantity-invalid](https://duc-nguyen98.github.io/ScannerHNApp/flows/warranty-components/?mode=screen&scene=quantity-invalid).
- P24.S02: [scan-error](https://duc-nguyen98.github.io/ScannerHNApp/flows/warranty-components/?mode=screen&scene=scan-error).
- P24.S03: [waiting-web](https://duc-nguyen98.github.io/ScannerHNApp/flows/warranty-components/?mode=screen&scene=waiting-web).
- P24.S04: [closed](https://duc-nguyen98.github.io/ScannerHNApp/flows/warranty-components/?mode=screen&scene=closed).

[Source flow.js](https://github.com/Duc-Nguyen98/ScannerHNApp/blob/da9f623a19d0359c3e80c14f8cc612636ec6ab78/docs/flows/warranty-components/flow.js) · [style.css](https://github.com/Duc-Nguyen98/ScannerHNApp/blob/da9f623a19d0359c3e80c14f8cc612636ec6ab78/docs/flows/warranty-components/style.css) · [HANDOFF](https://github.com/Duc-Nguyen98/ScannerHNApp/blob/da9f623a19d0359c3e80c14f8cc612636ec6ab78/docs/flows/warranty-components/HANDOFF.md).

## Chi tiết từng màn / trạng thái phải triển khai

Đối chiếu từng panel của ảnh; ID bên dưới dùng để kiểm kê, không bắt tạo route riêng. Không bỏ panel chỉ vì dùng lại component. Với panel cũ bị thay nghiệp vụ, lưu disposition=MIGRATED và bằng chứng thay thế.

| ID | Màn / trạng thái | Bố cục, nội dung cần dựng | Hành vi, điều kiện và kết quả |
|---|---|---|---|
| P24.S01 | Số lượng vượt tồn — quantity-invalid | Sheet mã hộp/tồn12; input13 màu đỏ; lỗi Số lượng cần xuất vượt tồn khả dụng của hộp (12); Xác nhận số lượng/Hủy. | Không chấp nhận13; sửa về số nguyên dương≤available mới confirm. Giữ định dạng CTA theo nguồn nhưng validation handler bắt buộc chặn; không chỉ đổi màu. |
| P24.S02 | Mã hộp chưa thể xuất — scan-error | Context BH-001; icon hộp và giải thích hộp chưa ghi nhận nhập; mã/kho; notice mã chưa thêm, các mã hợp lệ vẫn giữ; Quét mã khác/Nhập lại mã. | Reject đúng mã, accepted list không đổi. Không tạo inbound hoặc ép trạng thái hộp để cho xuất; giữ reason server. |
| P24.S03 | Chờ xử lý trên Web — waiting-web | Header Đã gửi phiếu; icon monitor; Đã gửi phiếu nhập/xuất; badge Chờ xử lý trên Web; copy Phiếu đã gửi, chưa ghi sổ; tóm tắt mã/kho/số mã/thời gian; Xem lịch sử. | Chỉ sau record thành công; nhập fixture PN-0005/12 mã, xuất fixture PX-0004/10 mã là hai biến thể của cùng state. Không biến record thành POSTED hoặc coi badge UI là enum server. |
| P24.S04 | Hồ sơ đã trả khách — closed | Context hồ sơ status Đã trả khách, Linh kiện đã xuất với load-more, note vẫn xem được, link quá trình xử lý, CTA Về lịch sử. | Read-only: không có Xuất linh kiện; chặn new-issue/scan/Post từ deep link, resume hoặc handler khi case đóng. Lịch sử POSTED vẫn đọc được. |

## Ràng buộc hình thức riêng

Dùng cùng sheet P19, history P20 và success-layout chờ Web; không dựng phiên bản lỗi khác style. Status amber cho chờ Web, green cho đã xuất/đã trả theo đúng ý nghĩa.

Trước khi sửa, ghi số đo có nguồn của board này: vùng nội dung, header/footer, padding/gap, font, control, radius, icon và crop ảnh. Ưu tiên CSS/component thật; số đo từ ảnh phải ghi estimated. Không áp token chung chưa được xác minh và không render cả ảnh board thành giao diện.

## Logic và dữ liệu riêng

1. Validation không dựa vào trạng thái nút; phía xử lý phải chặn dữ liệu không hợp lệ và tôn trọng server check lại.
2. Không có available quantity không tự giả12; kiểm theo contract source, unknown không tự cho vượt.
3. Chờ Web áp dụng nhập/xuất chính, KHÔNG áp lên thành công xuất linh kiện P19.
4. Case đóng phải kiểm cả UI, route và mutation guard; danh sách read-only vẫn có load-more.
5. Cuối prompt chỉ tổng hợp độ bao phủ24 board và91 panel tham chiếu từ báo cáo đã có; không âm thầm sửa các board ngoài scope hoặc báo toàn app PASS khi còn blocker.

## Các ca nghiệm thu bắt buộc

| ID | Điều kiện đạt |
|---|---|
| P24.A01 | 13>12 bị reject không thêm qty; thử0/âm/thập phân/non-numeric cũng không qua. |
| P24.A02 | Hộp chưa nhập bị reject và các mã hợp lệ cũ giữ nguyên. |
| P24.A03 | Record PN/PX hiện chờ Web và không đổi tồn; Post linh kiện mới được Đã xuất. |
| P24.A04 | Case đóng không xuất qua nút, direct route, resume hay submit cũ; vẫn xem lịch sử. |
| P24.A05 | Coverage cuối giữ đủ P01–P24, báo riêng UI/function/integration; không bỏ P13 migrated hay P18 chưa chốt. |

Ngoài các ca trên, capture và đối chiếu từng panel ở viewport tham chiếu hợp lệ. Kiểm tra responsive/keyboard/focus và state tương tác liên quan theo contract. Báo riêng visual, behavior và integration; fixture không đủ để đánh dấu tích hợp PASS.

## Điểm phải xác minh, không tự đoán

Hai biến thể nhập/xuất của waiting-web phải kiểm riêng trong cùng prompt, không làm phát sinh prompt25. 91 panel là số vị trí ảnh tham chiếu, không là tổng số state runtime duy nhất.

Chỉ chặn phần phụ thuộc quyết định chưa có; tiếp tục phần độc lập. Không tự thêm màn, quyền, API, enum hoặc quy tắc nghiệp vụ để che thông tin thiếu. Nêu câu hỏi cụ thể sau khi đã làm đủ phần khả thi.

## Thực hiện và bàn giao

1. Đọc tiến độ đã có, xác định source/target và các file liên quan. Nếu đã chạy 5 prompt cũ, giữ kết quả còn đúng. Không cài lại toàn bộ dự án hoặc quét lại asset/bundle khi đã có bằng chứng đủ.
2. Kiểm tra đủ 4 panel nêu trên, xác định component, state transition, data adapter và route/context cần nối; ghi quyết định có nguồn ngắn gọn, rồi triển khai ngay.
3. Dựng UI và hành vi cho tất cả panel trong phạm vi. Nếu chỉ có prototype, tách fixture rõ ràng; không tạo thông báo thành công production giả. Dùng lại component/adapter chung và nối dependency có sẵn.
4. Chạy các ca nghiệm thu, kiểm tra render và lệnh kiểm tra sẵn có của dự án phù hợp thay đổi. Chỉ mở rộng kiểm tra khi có rủi ro cụ thể; sửa lỗi còn trong phạm vi và kiểm lại phần bị ảnh hưởng.
5. Xuất `handoff/P24/REPORT.md`: source commit/target, file đã sửa, coverage từng P24.Sxx, kết quả P24.Axx, link ảnh actual và baseline, lệnh/kết quả thật, khác biệt còn lại và blocker. Cập nhật `SCREEN_COVERAGE.csv` và `RUN_STATE.json` chung.
6. Nếu phiên bị ngắt, lưu điểm đang làm để tiếp tục chính P24; không tạo prompt mới và không coi checkpoint là hoàn thành. Nếu dependency của prompt trước vừa được hoàn tất ở đây, cập nhật các dòng coverage liên quan bằng bằng chứng mới.

**Kết thúc bằng kết quả đã làm và bằng chứng. Không kết thúc ở “bạn có muốn tôi bắt đầu không?”. Không báo toàn bộ board đạt nếu có panel bị bỏ, chưa chạy hoặc tích hợp chưa xác minh.**
