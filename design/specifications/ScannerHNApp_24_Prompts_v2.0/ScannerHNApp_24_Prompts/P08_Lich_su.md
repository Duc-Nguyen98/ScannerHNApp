# P08 — Lịch sử

**Đây là prompt triển khai. Hãy thực hiện đến khi hoàn thành toàn bộ phạm vi dưới đây; không chỉ xác nhận đã hiểu hoặc trả về kế hoạch.**

## Contract và phạm vi

Áp dụng [00_CONTRACT_CHUNG.md](00_CONTRACT_CHUNG.md), phiên bản 2.0. Nếu đã đọc trong phiên này, sử dụng quyết định và tiến độ còn hiệu lực; không hỏi lại. Nếu file chưa được cung cấp hoặc không đọc được, nêu đúng phần thiếu, không tự bịa contract.

- ID cố định: **P08/24**. Board: **Lịch sử**. Nhóm: **LEGACY_ADAPTED — đối chiếu nghiệp vụ hiện hành**.
- Mục tiêu: Dựng lịch sử chung, chi tiết, phiên quét tham chiếu và hoạt động theo ngày; phối hợp hub mới mà không tạo hai kho dữ liệu lịch sử.
- Phụ thuộc và kết nối: P12 chứng từ; P22 hub/NFC; P23 phiên quét và bảo hành; P18 đính kèm.
- Tận dụng source, component và kết quả đã có. Chỉ sửa phần cần thiết cho board này và dependency trực tiếp. Không tạo prompt triển khai thứ 25, không yêu cầu tôi viết prompt con cho từng panel.

## Nguồn phải xem

- Ảnh đính kèm: [references/B08.png](references/B08.png).
- [Ảnh gốc tại commit đã đối chiếu](https://github.com/Duc-Nguyen98/ScannerHNApp/blob/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/01_UPDATED_BOARDS/06_lich_su.png) · [Mở ảnh trực tiếp](https://raw.githubusercontent.com/Duc-Nguyen98/ScannerHNApp/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/01_UPDATED_BOARDS/06_lich_su.png).
- [Tab Tất cả của gallery chính](https://duc-nguyen98.github.io/ScannerHNApp/) — chọn đúng tên board trên; không dùng gallery phụ 22 mục làm danh mục đầy đủ.
- Commit tham chiếu: `da9f623a19d0359c3e80c14f8cc612636ec6ab78`. Đường dẫn board: `design/01_Main/BOARDS/01_UPDATED_BOARDS/06_lich_su.png`.
- Nếu branch triển khai đã thay đổi, ghi source commit thực tế và chênh lệch liên quan; không tự đổi phạm vi hoặc thay ảnh baseline.
- Xem HANDOFF và DEV_PROPOSAL kèm trong references khi hành vi liên quan; chỉ HANDOFF chốt mới có quyền thay nghiệp vụ cũ. Proposal chưa phải API được duyệt.

## Chi tiết từng màn / trạng thái phải triển khai

Đối chiếu từng panel của ảnh; ID bên dưới dùng để kiểm kê, không bắt tạo route riêng. Không bỏ panel chỉ vì dùng lại component. Với panel cũ bị thay nghiệp vụ, lưu disposition=MIGRATED và bằng chứng thay thế.

| ID | Màn / trạng thái | Bố cục, nội dung cần dựng | Hành vi, điều kiện và kết quả |
|---|---|---|---|
| P08.S01 | Lịch sử danh sách | Search mã phiếu/serial/người; tabs Tất cả/Nhập kho/Xuất kho/Bảo hành/NFC; date range, status và sort; card LS có loại, phiếu, kho, giờ, trạng thái. | Filter theo nguồn đọc hiện có; phiếu record chờ Web không đổi thành POSTED. Đây là list/subview được hub P22 mở, không thay hub mới bằng list cũ. |
| P08.S02 | Chi tiết lịch sử | Card LS-0001/PN-0005; tabs Thông tin/Dòng thời gian/Đính kèm; thông tin loại, phiếu copy, kho, actor, giờ, kết quả và timeline. | Đọc sự kiện thật; bước Gửi duyệt trong ảnh cũ map thành gửi lên Web khi đúng event hiện hành. Không tạo dấu tick cho bước chưa xảy ra. |
| P08.S03 | Phiên quét tham chiếu | Card PQ-0001, người/kho, bắt đầu/kết thúc; counter 19 tổng/18 hợp lệ/1 trùng; danh sách mã theo thời gian. | Dùng cùng session ID/model với P23, không dựng phiên mới theo khoảng giờ. Giữ layout tham chiếu trừ phần đã được board mới thay thế rõ ràng; document result tách session status. |
| P08.S04 | Hoạt động theo ngày | Date picker; tên người/kho; grid tổng hợp nhập12/xuất6/bảo hành4/NFC3/chứng từ5/tổng30 trong fixture; danh sách nhóm dẫn drilldown. | Dùng nguồn aggregate có định nghĩa; không cộng các nhóm có giao nhau trong production để ra tổng nếu chưa xác minh. Chọn ngày cập nhật scope nhất quán. |

## Ràng buộc hình thức riêng

Header navy/teal, card list và filter chips, timeline dọc, counter theo nhóm và bottom nav; reuse event/list components của P22/P23. Không sao chép active tab quét sai ngữ cảnh trong ảnh cũ.

Trước khi sửa, ghi số đo có nguồn của board này: vùng nội dung, header/footer, padding/gap, font, control, radius, icon và crop ảnh. Ưu tiên CSS/component thật; số đo từ ảnh phải ghi estimated. Không áp token chung chưa được xác minh và không render cả ảnh board thành giao diện.

## Logic và dữ liệu riêng

1. Phân biệt tổng lượt quét, mã accepted, mã duplicate và quantity; số lượt không phải stock movement.
2. Một sự kiện gửi phiếu chưa phải xác nhận xuất/nhập; không đánh đồng kết quả 'thành công gửi' với đã ghi sổ.
3. NFC không có event source thì unavailable, không lấy trạng thái tag cuối cùng dựng nhật ký.
4. Phiên quét và phiên đăng nhập P11 khác định danh; không đưa token auth vào lịch sử.
5. Phần trùng P23 được reuse cùng route/component khi phù hợp, nhưng vẫn ghi evidence bao phủ panel P08; không bỏ prompt hay triển khai hai version xung đột.

## Các ca nghiệm thu bắt buộc

| ID | Điều kiện đạt |
|---|---|
| P08.A01 | Kết hợp search/date/status không làm nhảy loại nghiệp vụ. |
| P08.A02 | LS detail hiển thị đúng document ID và đúng event timeline. |
| P08.A03 | Fixture 19=18+1; mã trùng không được tính hai lần vào quantity. |
| P08.A04 | Chọn ngày thay dữ liệu, tổng mẫu30 có nguồn fixture; production totals không suy từ page hiện tại. |
| P08.A05 | Link NFC/phiên quét mở đúng P22/P23 và Back giữ context. |

Ngoài các ca trên, capture và đối chiếu từng panel ở viewport tham chiếu hợp lệ. Kiểm tra responsive/keyboard/focus và state tương tác liên quan theo contract. Báo riêng visual, behavior và integration; fixture không đủ để đánh dấu tích hợp PASS.

## Điểm phải xác minh, không tự đoán

Định nghĩa thống kê theo ngày chưa có contract thì chỉ fixture preview/UNKNOWN, không tuyên bố báo cáo nghiệp vụ chính xác.

Chỉ chặn phần phụ thuộc quyết định chưa có; tiếp tục phần độc lập. Không tự thêm màn, quyền, API, enum hoặc quy tắc nghiệp vụ để che thông tin thiếu. Nêu câu hỏi cụ thể sau khi đã làm đủ phần khả thi.

## Thực hiện và bàn giao

1. Đọc tiến độ đã có, xác định source/target và các file liên quan. Nếu đã chạy 5 prompt cũ, giữ kết quả còn đúng. Không cài lại toàn bộ dự án hoặc quét lại asset/bundle khi đã có bằng chứng đủ.
2. Kiểm tra đủ 4 panel nêu trên, xác định component, state transition, data adapter và route/context cần nối; ghi quyết định có nguồn ngắn gọn, rồi triển khai ngay.
3. Dựng UI và hành vi cho tất cả panel trong phạm vi. Nếu chỉ có prototype, tách fixture rõ ràng; không tạo thông báo thành công production giả. Dùng lại component/adapter chung và nối dependency có sẵn.
4. Chạy các ca nghiệm thu, kiểm tra render và lệnh kiểm tra sẵn có của dự án phù hợp thay đổi. Chỉ mở rộng kiểm tra khi có rủi ro cụ thể; sửa lỗi còn trong phạm vi và kiểm lại phần bị ảnh hưởng.
5. Xuất `handoff/P08/REPORT.md`: source commit/target, file đã sửa, coverage từng P08.Sxx, kết quả P08.Axx, link ảnh actual và baseline, lệnh/kết quả thật, khác biệt còn lại và blocker. Cập nhật `SCREEN_COVERAGE.csv` và `RUN_STATE.json` chung.
6. Nếu phiên bị ngắt, lưu điểm đang làm để tiếp tục chính P08; không tạo prompt mới và không coi checkpoint là hoàn thành. Nếu dependency của prompt trước vừa được hoàn tất ở đây, cập nhật các dòng coverage liên quan bằng bằng chứng mới.

**Kết thúc bằng kết quả đã làm và bằng chứng. Không kết thúc ở “bạn có muốn tôi bắt đầu không?”. Không báo toàn bộ board đạt nếu có panel bị bỏ, chưa chạy hoặc tích hợp chưa xác minh.**
