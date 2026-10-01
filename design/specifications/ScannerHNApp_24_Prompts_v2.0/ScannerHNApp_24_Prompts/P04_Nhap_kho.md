# P04 — Nhập kho

**Đây là prompt triển khai. Hãy thực hiện đến khi hoàn thành toàn bộ phạm vi dưới đây; không chỉ xác nhận đã hiểu hoặc trả về kế hoạch.**

## Contract và phạm vi

Áp dụng [00_CONTRACT_CHUNG.md](00_CONTRACT_CHUNG.md), phiên bản 2.0. Nếu đã đọc trong phiên này, sử dụng quyết định và tiến độ còn hiệu lực; không hỏi lại. Nếu file chưa được cung cấp hoặc không đọc được, nêu đúng phần thiếu, không tự bịa contract.

- ID cố định: **P04/24**. Board: **Nhập kho**. Nhóm: **LEGACY_ADAPTED — đối chiếu nghiệp vụ hiện hành**.
- Mục tiêu: Dựng bốn màn nhập kho từ board cũ và chuyển đúng mốc cuối sang Gửi phiếu lên Web / Chờ xử lý trên Web.
- Phụ thuộc và kết nối: P03 dialog; P06 dữ liệu sản phẩm; P12 chứng từ; P15/P17 lỗi; P24.S03 kết quả chờ Web.
- Tận dụng source, component và kết quả đã có. Chỉ sửa phần cần thiết cho board này và dependency trực tiếp. Không tạo prompt triển khai thứ 25, không yêu cầu tôi viết prompt con cho từng panel.

## Nguồn phải xem

- Ảnh đính kèm: [references/B04.png](references/B04.png).
- [Ảnh gốc tại commit đã đối chiếu](https://github.com/Duc-Nguyen98/ScannerHNApp/blob/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/01_UPDATED_BOARDS/02_nhap_kho.png) · [Mở ảnh trực tiếp](https://raw.githubusercontent.com/Duc-Nguyen98/ScannerHNApp/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/01_UPDATED_BOARDS/02_nhap_kho.png).
- [Tab Tất cả của gallery chính](https://duc-nguyen98.github.io/ScannerHNApp/) — chọn đúng tên board trên; không dùng gallery phụ 22 mục làm danh mục đầy đủ.
- Commit tham chiếu: `da9f623a19d0359c3e80c14f8cc612636ec6ab78`. Đường dẫn board: `design/01_Main/BOARDS/01_UPDATED_BOARDS/02_nhap_kho.png`.
- Nếu branch triển khai đã thay đổi, ghi source commit thực tế và chênh lệch liên quan; không tự đổi phạm vi hoặc thay ảnh baseline.
- Xem HANDOFF và DEV_PROPOSAL kèm trong references khi hành vi liên quan; chỉ HANDOFF chốt mới có quyền thay nghiệp vụ cũ. Proposal chưa phải API được duyệt.

## Chi tiết từng màn / trạng thái phải triển khai

Đối chiếu từng panel của ảnh; ID bên dưới dùng để kiểm kê, không bắt tạo route riêng. Không bỏ panel chỉ vì dùng lại component. Với panel cũ bị thay nghiệp vụ, lưu disposition=MIGRATED và bằng chứng thay thế.

| ID | Màn / trạng thái | Bố cục, nội dung cần dựng | Hành vi, điều kiện và kết quả |
|---|---|---|---|
| P04.S01 | Thông tin phiếu nhập | Header Nhập kho Bước 1/3; kho khóa, loại nhập, mã phiếu, nhà cung cấp, ghi chú và khối lưu ý; CTA Tiếp tục quét mã. | Field required/editable theo contract thật. Mã server cấp không được tự sinh từ PN-0005. Metadata chưa chốt không tự nới validation theo DEV_PROPOSAL. |
| P04.S02 | Quét hàng nhập | Bước 2/3; camera, Bật đèn/Nhập tay, bộ đếm tổng/hợp lệ/trùng, danh sách mã có thời gian và trạng thái; CTA Kiểm tra phiếu. | Fixture board 12 lượt = 11 hợp lệ + 1 trùng; trùng không thêm dòng phiếu. Manual và camera cùng pipeline validate; không đổi tồn khi quét. |
| P04.S03 | Kiểm tra phiếu | Bước 3/3; tóm tắt kho/phiếu/NCC/người tạo; danh sách SKU với fixture 5+4+2=11; khối Tồn kho chưa thay đổi. | Sửa nhãn CTA cũ Gửi duyệt thành Gửi phiếu lên Web theo nghiệp vụ hiện hành; submit chỉ record, không Post. Quay lại giữ draft/định danh. |
| P04.S04 | Đã gửi phiếu nhập — chờ Web | Giữ bố cục kết quả/tóm tắt nhưng dùng trạng thái Chờ xử lý trên Web và mô tả Phiếu đã gửi, chưa ghi sổ; đích xem chứng từ/lịch sử và Home. | Chỉ hiển thị sau record xác nhận. Timeout mở P17.S04 kiểm tra trạng thái; không tự hiển thị success. Component trạng thái chờ Web dùng chung P24. |

## Ràng buộc hình thức riêng

Giữ wizard 1/3–3/3, thứ tự trường, các card scan/review và CTA đáy; chỉ thay phần copy/hành vi bị supersede. Không thay toàn bộ flow bằng ảnh board.

Trước khi sửa, ghi số đo có nguồn của board này: vùng nội dung, header/footer, padding/gap, font, control, radius, icon và crop ảnh. Ưu tiên CSS/component thật; số đo từ ảnh phải ghi estimated. Không áp token chung chưa được xác minh và không render cả ảnh board thành giao diện.

## Logic và dữ liệu riêng

1. Không có nút Duyệt/Post nhập chính trên App. Record không tăng tồn; kết quả Post về sau đọc từ Web/backend.
2. Kho Hoa Nam cố định; không đổi warehouse sau mã đầu tiên.
3. Không lấy ngày/actor/ID trong ảnh làm giá trị production; actor/quyền từ phiên hợp lệ.
4. Giữ mã gốc, kết quả kiểm tra, số lượt và số dòng hợp lệ phân biệt; không cộng mã trùng vào quantity.
5. DEV_PROPOSAL cho thiếu metadata là đề xuất, không phải quyền bỏ validation backend. Thiếu contract thì chặn phần gửi liên quan, preview vẫn dựng đủ bốn state.

## Các ca nghiệm thu bắt buộc

| ID | Điều kiện đạt |
|---|---|
| P04.A01 | Quét fixture 12 lượt chỉ tạo 11 mã hợp lệ và tổng review 11. |
| P04.A02 | Sửa ghi chú/quay lại không mất mã đã quét. |
| P04.A03 | Gửi thành công chỉ record một lần, tồn chưa đổi, không có Post API trong luồng. |
| P04.A04 | Timeout giữ request/document ID và không gửi lại mù. |
| P04.A05 | Ảnh cả bốn state đúng bố cục; nhãn được đổi có trace tới HANDOFF và P24. |

Ngoài các ca trên, capture và đối chiếu từng panel ở viewport tham chiếu hợp lệ. Kiểm tra responsive/keyboard/focus và state tương tác liên quan theo contract. Báo riêng visual, behavior và integration; fixture không đủ để đánh dấu tích hợp PASS.

## Điểm phải xác minh, không tự đoán

Không tự hứa hệ thống sẽ gửi thông báo khi được phê duyệt; bỏ lời hứa cũ nếu chưa có nguồn hiện hành chứng minh.

Chỉ chặn phần phụ thuộc quyết định chưa có; tiếp tục phần độc lập. Không tự thêm màn, quyền, API, enum hoặc quy tắc nghiệp vụ để che thông tin thiếu. Nêu câu hỏi cụ thể sau khi đã làm đủ phần khả thi.

## Thực hiện và bàn giao

1. Đọc tiến độ đã có, xác định source/target và các file liên quan. Nếu đã chạy 5 prompt cũ, giữ kết quả còn đúng. Không cài lại toàn bộ dự án hoặc quét lại asset/bundle khi đã có bằng chứng đủ.
2. Kiểm tra đủ 4 panel nêu trên, xác định component, state transition, data adapter và route/context cần nối; ghi quyết định có nguồn ngắn gọn, rồi triển khai ngay.
3. Dựng UI và hành vi cho tất cả panel trong phạm vi. Nếu chỉ có prototype, tách fixture rõ ràng; không tạo thông báo thành công production giả. Dùng lại component/adapter chung và nối dependency có sẵn.
4. Chạy các ca nghiệm thu, kiểm tra render và lệnh kiểm tra sẵn có của dự án phù hợp thay đổi. Chỉ mở rộng kiểm tra khi có rủi ro cụ thể; sửa lỗi còn trong phạm vi và kiểm lại phần bị ảnh hưởng.
5. Xuất `handoff/P04/REPORT.md`: source commit/target, file đã sửa, coverage từng P04.Sxx, kết quả P04.Axx, link ảnh actual và baseline, lệnh/kết quả thật, khác biệt còn lại và blocker. Cập nhật `SCREEN_COVERAGE.csv` và `RUN_STATE.json` chung.
6. Nếu phiên bị ngắt, lưu điểm đang làm để tiếp tục chính P04; không tạo prompt mới và không coi checkpoint là hoàn thành. Nếu dependency của prompt trước vừa được hoàn tất ở đây, cập nhật các dòng coverage liên quan bằng bằng chứng mới.

**Kết thúc bằng kết quả đã làm và bằng chứng. Không kết thúc ở “bạn có muốn tôi bắt đầu không?”. Không báo toàn bộ board đạt nếu có panel bị bỏ, chưa chạy hoặc tích hợp chưa xác minh.**
