# P17 — Ngoại lệ quét

**Đây là prompt triển khai. Hãy thực hiện đến khi hoàn thành toàn bộ phạm vi dưới đây; không chỉ xác nhận đã hiểu hoặc trả về kế hoạch.**

## Contract và phạm vi

Áp dụng [00_CONTRACT_CHUNG.md](00_CONTRACT_CHUNG.md), phiên bản 2.0. Nếu đã đọc trong phiên này, sử dụng quyết định và tiến độ còn hiệu lực; không hỏi lại. Nếu file chưa được cung cấp hoặc không đọc được, nêu đúng phần thiếu, không tự bịa contract.

- ID cố định: **P17/24**. Board: **Ngoại lệ quét**. Nhóm: **LEGACY_ADAPTED — đối chiếu nghiệp vụ hiện hành**.
- Mục tiêu: Dựng bốn ngoại lệ scanner và bảo toàn mã hợp lệ/định danh phiếu khi có lỗi hoặc kết quả chưa rõ.
- Phụ thuộc và kết nối: P04 nhập; P05 xuất; P07 NFC; P15 hệ thống; P21 unknown Post linh kiện.
- Tận dụng source, component và kết quả đã có. Chỉ sửa phần cần thiết cho board này và dependency trực tiếp. Không tạo prompt triển khai thứ 25, không yêu cầu tôi viết prompt con cho từng panel.

## Nguồn phải xem

- Ảnh đính kèm: [references/B17.png](references/B17.png).
- [Ảnh gốc tại commit đã đối chiếu](https://github.com/Duc-Nguyen98/ScannerHNApp/blob/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/02_NEW_BOARDS/15_ngoai_le_quet_fixed.png) · [Mở ảnh trực tiếp](https://raw.githubusercontent.com/Duc-Nguyen98/ScannerHNApp/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/02_NEW_BOARDS/15_ngoai_le_quet_fixed.png).
- [Tab Tất cả của gallery chính](https://duc-nguyen98.github.io/ScannerHNApp/) — chọn đúng tên board trên; không dùng gallery phụ 22 mục làm danh mục đầy đủ.
- Commit tham chiếu: `da9f623a19d0359c3e80c14f8cc612636ec6ab78`. Đường dẫn board: `design/01_Main/BOARDS/02_NEW_BOARDS/15_ngoai_le_quet_fixed.png`.
- Nếu branch triển khai đã thay đổi, ghi source commit thực tế và chênh lệch liên quan; không tự đổi phạm vi hoặc thay ảnh baseline.
- Xem HANDOFF và DEV_PROPOSAL kèm trong references khi hành vi liên quan; chỉ HANDOFF chốt mới có quyền thay nghiệp vụ cũ. Proposal chưa phải API được duyệt.

## Chi tiết từng màn / trạng thái phải triển khai

Đối chiếu từng panel của ảnh; ID bên dưới dùng để kiểm kê, không bắt tạo route riêng. Không bỏ panel chỉ vì dùng lại component. Với panel cũ bị thay nghiệp vụ, lưu disposition=MIGRATED và bằng chứng thay thế.

| ID | Màn / trạng thái | Bố cục, nội dung cần dựng | Hành vi, điều kiện và kết quả |
|---|---|---|---|
| P17.S01 | Mã không hợp lệ | Màn Quét mã sản phẩm với camera khung đỏ, banner Mã không hợp lệ; nguyên nhân có thể không tìm thấy hoặc sai nghiệp vụ; Quét lại/Nhập mã. | Giữ raw code và lỗi nguồn; mã invalid không vào accepted list. Retry chỉ đọc lại mã, không tự thêm mã nếu người dùng bấm nhiều lần. |
| P17.S02 | Mã không thể xuất | Header Kiểm tra mã xuất kho; banner, nguyên nhân, card sản phẩm và phiếu liên quan đã ghi sổ; CTA Quét mã khác. | Dùng reason server: đã xuất/thuộc phiếu khác theo contract. Không tự giải phóng reservation, đổi phiếu hoặc xuất lại; dữ liệu phiếu liên quan chỉ hiện trong quyền. |
| P17.S03 | Thẻ đã liên kết | Header Đọc thẻ NFC; UID/status, sản phẩm đang liên kết, notice không ghi đè; Xem liên kết/Hủy. | Không overwrite mapping; xem chỉ read. Quy trình thay thẻ là chức năng riêng chưa được cấp ở prompt này. |
| P17.S04 | Đang xác minh kết quả gửi | Header Gửi phiếu nhập kho; icon clock, tóm tắt PN-0005/loại/ngày/actor; Kiểm tra trạng thái, Gửi lại disabled. | Giữ idempotency/request ID; chỉ cho resend khi contract xác định chưa tạo và cho phép cùng request. Khi kiểm tra ra đã record, chuyển chờ Web, không Post. |

## Ràng buộc hình thức riêng

Giữ màu cảnh báo/khung camera lỗi, card nguyên nhân và phiếu, disabled gửi lại; không gom cả bốn lỗi thành một toast chung mất context.

Trước khi sửa, ghi số đo có nguồn của board này: vùng nội dung, header/footer, padding/gap, font, control, radius, icon và crop ảnh. Ưu tiên CSS/component thật; số đo từ ảnh phải ghi estimated. Không áp token chung chưa được xác minh và không render cả ảnh board thành giao diện.

## Logic và dữ liệu riêng

1. Mã đọc nhiều lần, mã nghiệp vụ không hợp lệ, xung đột NFC và timeout submit có logic khác nhau.
2. Không xóa danh sách mã hợp lệ cũ khi một mã lỗi; số lượng không được tăng.
3. Không suy state phiếu từ timer hoặc vì request đã gửi; có evidence nguồn mới chuyển state.
4. Không tạo link Web/phiếu ngoài quyền để giải thích lỗi.
5. Trạng thái unknown xuất linh kiện giao P21/P24 tương thích; không retry Post như gửi record nhập chính.

## Các ca nghiệm thu bắt buộc

| ID | Điều kiện đạt |
|---|---|
| P17.A01 | Mã sai không đổi accepted count/quantity; scan lại giữ draft. |
| P17.A02 | Hàng đã xuất bị chặn và không gọi mutation thứ hai. |
| P17.A03 | NFC conflict không đổi mapping kể cả nhấn Hủy/Quay lại nhiều lần. |
| P17.A04 | Timeout record khóa resend; kiểm tra ra thành công mở đúng phiếu hiện hữu. |
| P17.A05 | Không có API tra trạng thái thì hiện blocker/đối chiếu, không timeout rồi tự gửi. |

Ngoài các ca trên, capture và đối chiếu từng panel ở viewport tham chiếu hợp lệ. Kiểm tra responsive/keyboard/focus và state tương tác liên quan theo contract. Báo riêng visual, behavior và integration; fixture không đủ để đánh dấu tích hợp PASS.

## Điểm phải xác minh, không tự đoán

Danh sách nguyên nhân 'có thể' trong ảnh không phải kết luận cho mọi lỗi; chỉ hiển thị dữ liệu nguồn chắc chắn, nếu chưa rõ ghi chưa xác định.

Chỉ chặn phần phụ thuộc quyết định chưa có; tiếp tục phần độc lập. Không tự thêm màn, quyền, API, enum hoặc quy tắc nghiệp vụ để che thông tin thiếu. Nêu câu hỏi cụ thể sau khi đã làm đủ phần khả thi.

## Thực hiện và bàn giao

1. Đọc tiến độ đã có, xác định source/target và các file liên quan. Nếu đã chạy 5 prompt cũ, giữ kết quả còn đúng. Không cài lại toàn bộ dự án hoặc quét lại asset/bundle khi đã có bằng chứng đủ.
2. Kiểm tra đủ 4 panel nêu trên, xác định component, state transition, data adapter và route/context cần nối; ghi quyết định có nguồn ngắn gọn, rồi triển khai ngay.
3. Dựng UI và hành vi cho tất cả panel trong phạm vi. Nếu chỉ có prototype, tách fixture rõ ràng; không tạo thông báo thành công production giả. Dùng lại component/adapter chung và nối dependency có sẵn.
4. Chạy các ca nghiệm thu, kiểm tra render và lệnh kiểm tra sẵn có của dự án phù hợp thay đổi. Chỉ mở rộng kiểm tra khi có rủi ro cụ thể; sửa lỗi còn trong phạm vi và kiểm lại phần bị ảnh hưởng.
5. Xuất `handoff/P17/REPORT.md`: source commit/target, file đã sửa, coverage từng P17.Sxx, kết quả P17.Axx, link ảnh actual và baseline, lệnh/kết quả thật, khác biệt còn lại và blocker. Cập nhật `SCREEN_COVERAGE.csv` và `RUN_STATE.json` chung.
6. Nếu phiên bị ngắt, lưu điểm đang làm để tiếp tục chính P17; không tạo prompt mới và không coi checkpoint là hoàn thành. Nếu dependency của prompt trước vừa được hoàn tất ở đây, cập nhật các dòng coverage liên quan bằng bằng chứng mới.

**Kết thúc bằng kết quả đã làm và bằng chứng. Không kết thúc ở “bạn có muốn tôi bắt đầu không?”. Không báo toàn bộ board đạt nếu có panel bị bỏ, chưa chạy hoặc tích hợp chưa xác minh.**
