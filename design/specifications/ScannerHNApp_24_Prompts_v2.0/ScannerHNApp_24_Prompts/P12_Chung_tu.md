# P12 — Chứng từ

**Đây là prompt triển khai. Hãy thực hiện đến khi hoàn thành toàn bộ phạm vi dưới đây; không chỉ xác nhận đã hiểu hoặc trả về kế hoạch.**

## Contract và phạm vi

Áp dụng [00_CONTRACT_CHUNG.md](00_CONTRACT_CHUNG.md), phiên bản 2.0. Nếu đã đọc trong phiên này, sử dụng quyết định và tiến độ còn hiệu lực; không hỏi lại. Nếu file chưa được cung cấp hoặc không đọc được, nêu đúng phần thiếu, không tự bịa contract.

- ID cố định: **P12/24**. Board: **Chứng từ**. Nhóm: **LEGACY_ADAPTED — đối chiếu nghiệp vụ hiện hành**.
- Mục tiêu: Dựng danh sách chứng từ, chi tiết, sản phẩm trong chứng từ và tạo chứng từ theo luồng hiện hành.
- Phụ thuộc và kết nối: P04/P05 tạo nhập/xuất; P09 bảo hành; P16 data states; P18 tài liệu; P08 lịch sử.
- Tận dụng source, component và kết quả đã có. Chỉ sửa phần cần thiết cho board này và dependency trực tiếp. Không tạo prompt triển khai thứ 25, không yêu cầu tôi viết prompt con cho từng panel.

## Nguồn phải xem

- Ảnh đính kèm: [references/B12.png](references/B12.png).
- [Ảnh gốc tại commit đã đối chiếu](https://github.com/Duc-Nguyen98/ScannerHNApp/blob/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/01_UPDATED_BOARDS/10_chung_tu.png) · [Mở ảnh trực tiếp](https://raw.githubusercontent.com/Duc-Nguyen98/ScannerHNApp/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/01_UPDATED_BOARDS/10_chung_tu.png).
- [Tab Tất cả của gallery chính](https://duc-nguyen98.github.io/ScannerHNApp/) — chọn đúng tên board trên; không dùng gallery phụ 22 mục làm danh mục đầy đủ.
- Commit tham chiếu: `da9f623a19d0359c3e80c14f8cc612636ec6ab78`. Đường dẫn board: `design/01_Main/BOARDS/01_UPDATED_BOARDS/10_chung_tu.png`.
- Nếu branch triển khai đã thay đổi, ghi source commit thực tế và chênh lệch liên quan; không tự đổi phạm vi hoặc thay ảnh baseline.
- Xem HANDOFF và DEV_PROPOSAL kèm trong references khi hành vi liên quan; chỉ HANDOFF chốt mới có quyền thay nghiệp vụ cũ. Proposal chưa phải API được duyệt.

## Chi tiết từng màn / trạng thái phải triển khai

Đối chiếu từng panel của ảnh; ID bên dưới dùng để kiểm kê, không bắt tạo route riêng. Không bỏ panel chỉ vì dùng lại component. Với panel cũ bị thay nghiệp vụ, lưu disposition=MIGRATED và bằng chứng thay thế.

| ID | Màn / trạng thái | Bố cục, nội dung cần dựng | Hành vi, điều kiện và kết quả |
|---|---|---|---|
| P12.S01 | Chứng từ danh sách | Header có thêm, search mã/loại/đối tác, shortcut scan; tabs Tất cả/Nhập/Xuất/Bảo hành, thời gian/trạng thái; cards PN/PX/BH có ngày, đối tác và badge. | Filter/sort từ nguồn đã có; mở document ID thật. Các record chờ Web và POSTED khác nhau; không đổi mọi badge cũ thành một trạng thái. |
| P12.S02 | Chi tiết chứng từ | Card loại/mã/ngày/status; tabs Thông tin/Sản phẩm/Tài liệu/Lịch sử; label/value, copy ID, kho khóa, ghi chú và files. | Read-only theo trạng thái/quyền; không có Duyệt/Post nhập/xuất chính. Dấu ba chấm chỉ chứa action được xác minh. |
| P12.S03 | Sản phẩm trong chứng từ | Context PN-0005; search/scan trong phạm vi; counter 11 sản phẩm/3 SKU; card XP-420B qty5, ZD421 qty4, DS2208 qty2 có serial count. | Tách quantity/SKU count/serial count; mở detail theo dòng. Không chỉnh quantity hoặc xóa dòng POSTED tùy ý. |
| P12.S04 | Tạo chứng từ mới | Loại Nhập/Xuất/Bảo hành; kho khóa, đối tác, ngày, ghi chú; CTA Tiếp tục thêm sản phẩm. | Reuse flow tạo tương ứng P04/P05/P09, tránh thêm endpoint tạo song song. Required/date editable phải theo contract; submit record không Post. |

## Ràng buộc hình thức riêng

Giữ tabs/filter gọn và selected bottom tab Chứng từ; detail có context nhất quán qua các tab; list file icon và nút download đúng hàng.

Trước khi sửa, ghi số đo có nguồn của board này: vùng nội dung, header/footer, padding/gap, font, control, radius, icon và crop ảnh. Ưu tiên CSS/component thật; số đo từ ảnh phải ghi estimated. Không áp token chung chưa được xác minh và không render cả ảnh board thành giao diện.

## Logic và dữ liệu riêng

1. Mã PN/PX/BH có thể là display number, API dùng ID riêng; không lấy prefix đoán endpoint hoặc quyền.
2. Count24 trong screenshot là fixture danh sách, không liên quan số24 board triển khai.
3. Không tự thêm export, bulk, cancel/reversal hoặc delete chỉ vì menu overflow.
4. Nhập/xuất chờ Web; bảo hành và xuất linh kiện có lifecycle riêng, không map mọi record thành draft/posted kho.
5. Tài liệu/lịch sử dùng nguồn P18/P08, không đính kèm file giả ở production.

## Các ca nghiệm thu bắt buộc

| ID | Điều kiện đạt |
|---|---|
| P12.A01 | Tabs và filter kết hợp trả đúng scope; state loading/empty/error do P16 dùng cùng list. |
| P12.A02 | Tổng11/3 SKU đúng 5+4+2, không đếm3 thành tổng quantity. |
| P12.A03 | Xem file không mất document context; Back giữ filter và vị trí. |
| P12.A04 | Tạo nhập/xuất điều hướng vào cùng flow hiện có, không tạo hai draft. |
| P12.A05 | Không xuất hiện nút hoặc API Duyệt/Post nhập/xuất trong App. |

Ngoài các ca trên, capture và đối chiếu từng panel ở viewport tham chiếu hợp lệ. Kiểm tra responsive/keyboard/focus và state tương tác liên quan theo contract. Báo riêng visual, behavior và integration; fixture không đủ để đánh dấu tích hợp PASS.

## Điểm phải xác minh, không tự đoán

Metadata cho phép thiếu trước record là đề xuất chưa mặc định được áp dụng. Màn tạo phải giữ validation hiện hành cho đến có chốt.

Chỉ chặn phần phụ thuộc quyết định chưa có; tiếp tục phần độc lập. Không tự thêm màn, quyền, API, enum hoặc quy tắc nghiệp vụ để che thông tin thiếu. Nêu câu hỏi cụ thể sau khi đã làm đủ phần khả thi.

## Thực hiện và bàn giao

1. Đọc tiến độ đã có, xác định source/target và các file liên quan. Nếu đã chạy 5 prompt cũ, giữ kết quả còn đúng. Không cài lại toàn bộ dự án hoặc quét lại asset/bundle khi đã có bằng chứng đủ.
2. Kiểm tra đủ 4 panel nêu trên, xác định component, state transition, data adapter và route/context cần nối; ghi quyết định có nguồn ngắn gọn, rồi triển khai ngay.
3. Dựng UI và hành vi cho tất cả panel trong phạm vi. Nếu chỉ có prototype, tách fixture rõ ràng; không tạo thông báo thành công production giả. Dùng lại component/adapter chung và nối dependency có sẵn.
4. Chạy các ca nghiệm thu, kiểm tra render và lệnh kiểm tra sẵn có của dự án phù hợp thay đổi. Chỉ mở rộng kiểm tra khi có rủi ro cụ thể; sửa lỗi còn trong phạm vi và kiểm lại phần bị ảnh hưởng.
5. Xuất `handoff/P12/REPORT.md`: source commit/target, file đã sửa, coverage từng P12.Sxx, kết quả P12.Axx, link ảnh actual và baseline, lệnh/kết quả thật, khác biệt còn lại và blocker. Cập nhật `SCREEN_COVERAGE.csv` và `RUN_STATE.json` chung.
6. Nếu phiên bị ngắt, lưu điểm đang làm để tiếp tục chính P12; không tạo prompt mới và không coi checkpoint là hoàn thành. Nếu dependency của prompt trước vừa được hoàn tất ở đây, cập nhật các dòng coverage liên quan bằng bằng chứng mới.

**Kết thúc bằng kết quả đã làm và bằng chứng. Không kết thúc ở “bạn có muốn tôi bắt đầu không?”. Không báo toàn bộ board đạt nếu có panel bị bỏ, chưa chạy hoặc tích hợp chưa xác minh.**
