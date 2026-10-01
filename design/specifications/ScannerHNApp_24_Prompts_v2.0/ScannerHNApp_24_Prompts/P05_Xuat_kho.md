# P05 — Xuất kho

**Đây là prompt triển khai. Hãy thực hiện đến khi hoàn thành toàn bộ phạm vi dưới đây; không chỉ xác nhận đã hiểu hoặc trả về kế hoạch.**

## Contract và phạm vi

Áp dụng [00_CONTRACT_CHUNG.md](00_CONTRACT_CHUNG.md), phiên bản 2.0. Nếu đã đọc trong phiên này, sử dụng quyết định và tiến độ còn hiệu lực; không hỏi lại. Nếu file chưa được cung cấp hoặc không đọc được, nêu đúng phần thiếu, không tự bịa contract.

- ID cố định: **P05/24**. Board: **Xuất kho**. Nhóm: **LEGACY_ADAPTED — đối chiếu nghiệp vụ hiện hành**.
- Mục tiêu: Dựng luồng xuất chính, giữ phân biệt số lượng yêu cầu/đã soạn và mốc gửi Web không ghi sổ.
- Phụ thuộc và kết nối: P03; dữ liệu P06; chứng từ P12; ngoại lệ P17; chờ Web P24.
- Tận dụng source, component và kết quả đã có. Chỉ sửa phần cần thiết cho board này và dependency trực tiếp. Không tạo prompt triển khai thứ 25, không yêu cầu tôi viết prompt con cho từng panel.

## Nguồn phải xem

- Ảnh đính kèm: [references/B05.png](references/B05.png).
- [Ảnh gốc tại commit đã đối chiếu](https://github.com/Duc-Nguyen98/ScannerHNApp/blob/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/01_UPDATED_BOARDS/03_xuat_kho.png) · [Mở ảnh trực tiếp](https://raw.githubusercontent.com/Duc-Nguyen98/ScannerHNApp/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/01_UPDATED_BOARDS/03_xuat_kho.png).
- [Tab Tất cả của gallery chính](https://duc-nguyen98.github.io/ScannerHNApp/) — chọn đúng tên board trên; không dùng gallery phụ 22 mục làm danh mục đầy đủ.
- Commit tham chiếu: `da9f623a19d0359c3e80c14f8cc612636ec6ab78`. Đường dẫn board: `design/01_Main/BOARDS/01_UPDATED_BOARDS/03_xuat_kho.png`.
- Nếu branch triển khai đã thay đổi, ghi source commit thực tế và chênh lệch liên quan; không tự đổi phạm vi hoặc thay ảnh baseline.
- Xem HANDOFF và DEV_PROPOSAL kèm trong references khi hành vi liên quan; chỉ HANDOFF chốt mới có quyền thay nghiệp vụ cũ. Proposal chưa phải API được duyệt.

## Chi tiết từng màn / trạng thái phải triển khai

Đối chiếu từng panel của ảnh; ID bên dưới dùng để kiểm kê, không bắt tạo route riêng. Không bỏ panel chỉ vì dùng lại component. Với panel cũ bị thay nghiệp vụ, lưu disposition=MIGRATED và bằng chứng thay thế.

| ID | Màn / trạng thái | Bố cục, nội dung cần dựng | Hành vi, điều kiện và kết quả |
|---|---|---|---|
| P05.S01 | Thông tin phiếu xuất | Bước 1/3; kho khóa, mã phiếu, người nhận, điện thoại, địa chỉ giao, số lượng cần soạn, nhóm hàng, ghi chú; CTA Bắt đầu soạn hàng. | Bind phiếu nguồn hoặc trường hợp tạo mới theo contract thật; giữ quantity yêu cầu. Không tự nới các trường người nhận/địa chỉ đang bắt buộc. |
| P05.S02 | Quét hàng xuất | Camera và Bật đèn/Nhập tay; counter 7/10, 7 hợp lệ/1 trùng/0 không hợp lệ; banner mã trùng; danh sách quét; Kiểm tra phiếu/Tiếp tục soạn. | Validate đúng mã/kho/trạng thái; mã trùng không tăng số đã soạn. Không tự chuyển 7/10 thành 10/10. |
| P05.S03 | Kiểm tra thiếu hàng | Tóm tắt phiếu/người nhận/địa chỉ/nhóm; hai counter yêu cầu 10, đã soạn 7; cảnh báo Còn thiếu 3 sản phẩm; SKU 5+2; Quay lại soạn hàng và CTA gửi bị chặn theo baseline. | Mặc định giữ gating hiện hành. Chỉ cho gửi phiếu chưa đủ để hoàn thiện Web nếu policy mới được xác nhận; dù được record thì không được coi đã xuất đủ hoặc đã Post. |
| P05.S04 | Đã gửi phiếu xuất — chờ Web | Kết quả cho fixture đã soạn đủ 10/10; thông tin phiếu/kho/người nhận/thời gian; trạng thái Chờ xử lý trên Web và ghi rõ chưa ghi sổ. | Đi từ S03 sang đây chỉ sau bổ sung đủ và record thành công, hoặc nhánh incomplete-record đã được duyệt với số thực tế giữ nguyên. Không nối thẳng 7/10 sang ảnh success 10/10. |

## Ràng buộc hình thức riêng

Giữ form một cột, vùng camera, counter soạn hàng, đôi CTA và cách trình bày cảnh báo; màu trạng thái phân biệt trùng/thiếu/thành công gửi. Không redesign thành bảng desktop.

Trước khi sửa, ghi số đo có nguồn của board này: vùng nội dung, header/footer, padding/gap, font, control, radius, icon và crop ảnh. Ưu tiên CSS/component thật; số đo từ ảnh phải ghi estimated. Không áp token chung chưa được xác minh và không render cả ảnh board thành giao diện.

## Logic và dữ liệu riêng

1. Nhập/xuất chính không Duyệt/Post trong App; không giảm tồn lúc camera nhận mã hoặc gửi record.
2. Quantity planned không được tự giảm về scanned để vượt gate; mã không hợp lệ không vào danh sách accepted.
3. Field policy trước record và trước Post khác nhau nếu nguồn chốt cho phép, nhưng không tự suy từ bản đề xuất.
4. Giữ cùng document/request ID khi tiếp tục; đóng/mở màn không tạo phiếu mới thay thế.
5. Người nhận/điện thoại/địa chỉ trong ảnh là fixture; không gửi chúng vào hệ thống thật.

## Các ca nghiệm thu bắt buộc

| ID | Điều kiện đạt |
|---|---|
| P05.A01 | 7/10 hiển thị còn thiếu 3; duplicate không đổi counter. |
| P05.A02 | Không thể nhận nhãn đã xuất/POSTED sau record. |
| P05.A03 | Quay lại bổ sung ba mã hợp lệ cho 10/10; chỉ sau xác nhận record mới mở kết quả. |
| P05.A04 | Quét hàng không thể xuất mở P17.S02, danh sách cũ không mất. |
| P05.A05 | Nhấn gửi hai lần/timeout không tạo hai record; kết quả số lượng không tự thay đổi. |

Ngoài các ca trên, capture và đối chiếu từng panel ở viewport tham chiếu hợp lệ. Kiểm tra responsive/keyboard/focus và state tương tác liên quan theo contract. Báo riêng visual, behavior và integration; fixture không đủ để đánh dấu tích hợp PASS.

## Điểm phải xác minh, không tự đoán

Nhánh gửi thiếu metadata/thiếu kế hoạch trong DEV_PROPOSAL phải có quyết định riêng; prompt này không tự cấp quyền xuất thiếu.

Chỉ chặn phần phụ thuộc quyết định chưa có; tiếp tục phần độc lập. Không tự thêm màn, quyền, API, enum hoặc quy tắc nghiệp vụ để che thông tin thiếu. Nêu câu hỏi cụ thể sau khi đã làm đủ phần khả thi.

## Thực hiện và bàn giao

1. Đọc tiến độ đã có, xác định source/target và các file liên quan. Nếu đã chạy 5 prompt cũ, giữ kết quả còn đúng. Không cài lại toàn bộ dự án hoặc quét lại asset/bundle khi đã có bằng chứng đủ.
2. Kiểm tra đủ 4 panel nêu trên, xác định component, state transition, data adapter và route/context cần nối; ghi quyết định có nguồn ngắn gọn, rồi triển khai ngay.
3. Dựng UI và hành vi cho tất cả panel trong phạm vi. Nếu chỉ có prototype, tách fixture rõ ràng; không tạo thông báo thành công production giả. Dùng lại component/adapter chung và nối dependency có sẵn.
4. Chạy các ca nghiệm thu, kiểm tra render và lệnh kiểm tra sẵn có của dự án phù hợp thay đổi. Chỉ mở rộng kiểm tra khi có rủi ro cụ thể; sửa lỗi còn trong phạm vi và kiểm lại phần bị ảnh hưởng.
5. Xuất `handoff/P05/REPORT.md`: source commit/target, file đã sửa, coverage từng P05.Sxx, kết quả P05.Axx, link ảnh actual và baseline, lệnh/kết quả thật, khác biệt còn lại và blocker. Cập nhật `SCREEN_COVERAGE.csv` và `RUN_STATE.json` chung.
6. Nếu phiên bị ngắt, lưu điểm đang làm để tiếp tục chính P05; không tạo prompt mới và không coi checkpoint là hoàn thành. Nếu dependency của prompt trước vừa được hoàn tất ở đây, cập nhật các dòng coverage liên quan bằng bằng chứng mới.

**Kết thúc bằng kết quả đã làm và bằng chứng. Không kết thúc ở “bạn có muốn tôi bắt đầu không?”. Không báo toàn bộ board đạt nếu có panel bị bỏ, chưa chạy hoặc tích hợp chưa xác minh.**
