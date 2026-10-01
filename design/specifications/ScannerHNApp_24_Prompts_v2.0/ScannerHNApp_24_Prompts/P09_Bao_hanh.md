# P09 — Bảo hành

**Đây là prompt triển khai. Hãy thực hiện đến khi hoàn thành toàn bộ phạm vi dưới đây; không chỉ xác nhận đã hiểu hoặc trả về kế hoạch.**

## Contract và phạm vi

Áp dụng [00_CONTRACT_CHUNG.md](00_CONTRACT_CHUNG.md), phiên bản 2.0. Nếu đã đọc trong phiên này, sử dụng quyết định và tiến độ còn hiệu lực; không hỏi lại. Nếu file chưa được cung cấp hoặc không đọc được, nêu đúng phần thiếu, không tự bịa contract.

- ID cố định: **P09/24**. Board: **Bảo hành**. Nhóm: **LEGACY_ADAPTED — đối chiếu nghiệp vụ hiện hành**.
- Mục tiêu: Dựng danh sách bảo hành, tiếp nhận, hồ sơ và kết quả sửa chữa; nối linh kiện đã xuất theo các board mới.
- Phụ thuộc và kết nối: P06 sản phẩm; P18 bàn giao; P19 xuất linh kiện; P20 lịch sử linh kiện; P23 timeline; P24 hồ sơ đóng.
- Tận dụng source, component và kết quả đã có. Chỉ sửa phần cần thiết cho board này và dependency trực tiếp. Không tạo prompt triển khai thứ 25, không yêu cầu tôi viết prompt con cho từng panel.

## Nguồn phải xem

- Ảnh đính kèm: [references/B09.png](references/B09.png).
- [Ảnh gốc tại commit đã đối chiếu](https://github.com/Duc-Nguyen98/ScannerHNApp/blob/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/01_UPDATED_BOARDS/07_bao_hanh.png) · [Mở ảnh trực tiếp](https://raw.githubusercontent.com/Duc-Nguyen98/ScannerHNApp/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/01_UPDATED_BOARDS/07_bao_hanh.png).
- [Tab Tất cả của gallery chính](https://duc-nguyen98.github.io/ScannerHNApp/) — chọn đúng tên board trên; không dùng gallery phụ 22 mục làm danh mục đầy đủ.
- Commit tham chiếu: `da9f623a19d0359c3e80c14f8cc612636ec6ab78`. Đường dẫn board: `design/01_Main/BOARDS/01_UPDATED_BOARDS/07_bao_hanh.png`.
- Nếu branch triển khai đã thay đổi, ghi source commit thực tế và chênh lệch liên quan; không tự đổi phạm vi hoặc thay ảnh baseline.
- Xem HANDOFF và DEV_PROPOSAL kèm trong references khi hành vi liên quan; chỉ HANDOFF chốt mới có quyền thay nghiệp vụ cũ. Proposal chưa phải API được duyệt.

## Chi tiết từng màn / trạng thái phải triển khai

Đối chiếu từng panel của ảnh; ID bên dưới dùng để kiểm kê, không bắt tạo route riêng. Không bỏ panel chỉ vì dùng lại component. Với panel cũ bị thay nghiệp vụ, lưu disposition=MIGRATED và bằng chứng thay thế.

| ID | Màn / trạng thái | Bố cục, nội dung cần dựng | Hành vi, điều kiện và kết quả |
|---|---|---|---|
| P09.S01 | Bảo hành danh sách | Header Bảo hành có thêm; entry Tiếp nhận và sửa chữa bảo hành; search mã hồ sơ/serial/tên, filter trạng thái và sort; cards BH-001/002/003, ảnh máy, SN, khách, ngày, chip. | Mở đúng case ID; action thêm/mở tiếp nhận chỉ theo quyền. Trạng thái như Đang xử lý/Đã tiếp nhận/Chờ linh kiện map enum hiện hành, không tự tạo enum. |
| P09.S02 | Tiếp nhận bảo hành | Bước 1/2; camera, Bật đèn/Nhập tay; thông tin sản phẩm/serial/khách/liên hệ; lỗi tiếp nhận, ghi chú, phụ kiện; CTA Tiếp nhận bảo hành. | Scan chỉ xác định item/context; submit qua contract intake. Không thay SKU cho serial hoặc tự tạo khách khi không tìm thấy. Required/length lấy policy thật. |
| P09.S03 | Hồ sơ bảo hành | Card BH-001, ngày tiếp nhận/cập nhật; tabs Thông tin/Linh kiện/Lịch sử; lỗi tiếp nhận/chẩn đoán/ghi chú; danh sách linh kiện và CTA Xem linh kiện/Cập nhật xử lý. | Linh kiện đã sử dụng trong ảnh cũ phải đối chiếu ledger POSTED ở P20; không biến record nháp thành tiêu hao. Tab lịch sử dùng cùng case events P23. |
| P09.S04 | Kết quả sửa chữa | Success mark, Đã cập nhật kết quả, Chờ bàn giao; tóm tắt case/khách/sản phẩm/serial/kết quả/linh kiện/ngày/actor; Xem hồ sơ. | Chỉ hiển thị sau update xác nhận; Chờ bàn giao chưa phải Đã trả khách. Không đóng case hoặc chuyển tồn chỉ vì mở màn kết quả. |

## Ràng buộc hình thức riêng

Giữ card ảnh máy, tabs hồ sơ, bảng label/value và hai CTA đáy; counter linh kiện bind dữ liệu đúng, không cố giữ số2 của ảnh khi nguồn POSTED khác.

Trước khi sửa, ghi số đo có nguồn của board này: vùng nội dung, header/footer, padding/gap, font, control, radius, icon và crop ảnh. Ưu tiên CSS/component thật; số đo từ ảnh phải ghi estimated. Không áp token chung chưa được xác minh và không render cả ảnh board thành giao diện.

## Logic và dữ liệu riêng

1. Tái sử dụng warranty-case source hiện có; không tạo kho dữ liệu độc lập cho module lịch sử.
2. Sửa chữa và xuất linh kiện là hai thao tác; xuất linh kiện trên App theo P19, không áp luồng gửi Web của nhập/xuất chính.
3. Case đã trả khách phải read-only với action xuất mới bị chặn theo P24; không chỉ ẩn nút.
4. Điều kiện đóng hồ sơ/bàn giao trong ảnh là đề xuất phải chốt; không tự coi checkbox là đủ điều kiện server.
5. Không tự gửi thông báo khách, trừ tiền, kích hoạt bảo hành mới hoặc thay policy bảo hành.

## Các ca nghiệm thu bắt buộc

| ID | Điều kiện đạt |
|---|---|
| P09.A01 | Intake đúng serial tạo/mở đúng hồ sơ; quét không tự tiêu hao linh kiện. |
| P09.A02 | Tab Linh kiện chỉ hiển thị xuất đã xác nhận, nháp xuất nằm nơi tiếp tục riêng. |
| P09.A03 | Cập nhật kết quả thành công chưa đổi case thành Đã trả khách. |
| P09.A04 | Hồ sơ đóng không thể xuất thêm qua route/handler. |
| P09.A05 | Chọn case khác không giữ nhầm khách/serial/timeline của case trước. |

Ngoài các ca trên, capture và đối chiếu từng panel ở viewport tham chiếu hợp lệ. Kiểm tra responsive/keyboard/focus và state tương tác liên quan theo contract. Báo riêng visual, behavior và integration; fixture không đủ để đánh dấu tích hợp PASS.

## Điểm phải xác minh, không tự đoán

Nguồn cũ có số linh kiện đã sử dụng2, bộ mới ví dụ2 mã/3 linh kiện; không trộn hai fixture rồi báo dữ liệu mâu thuẫn production.

Chỉ chặn phần phụ thuộc quyết định chưa có; tiếp tục phần độc lập. Không tự thêm màn, quyền, API, enum hoặc quy tắc nghiệp vụ để che thông tin thiếu. Nêu câu hỏi cụ thể sau khi đã làm đủ phần khả thi.

## Thực hiện và bàn giao

1. Đọc tiến độ đã có, xác định source/target và các file liên quan. Nếu đã chạy 5 prompt cũ, giữ kết quả còn đúng. Không cài lại toàn bộ dự án hoặc quét lại asset/bundle khi đã có bằng chứng đủ.
2. Kiểm tra đủ 4 panel nêu trên, xác định component, state transition, data adapter và route/context cần nối; ghi quyết định có nguồn ngắn gọn, rồi triển khai ngay.
3. Dựng UI và hành vi cho tất cả panel trong phạm vi. Nếu chỉ có prototype, tách fixture rõ ràng; không tạo thông báo thành công production giả. Dùng lại component/adapter chung và nối dependency có sẵn.
4. Chạy các ca nghiệm thu, kiểm tra render và lệnh kiểm tra sẵn có của dự án phù hợp thay đổi. Chỉ mở rộng kiểm tra khi có rủi ro cụ thể; sửa lỗi còn trong phạm vi và kiểm lại phần bị ảnh hưởng.
5. Xuất `handoff/P09/REPORT.md`: source commit/target, file đã sửa, coverage từng P09.Sxx, kết quả P09.Axx, link ảnh actual và baseline, lệnh/kết quả thật, khác biệt còn lại và blocker. Cập nhật `SCREEN_COVERAGE.csv` và `RUN_STATE.json` chung.
6. Nếu phiên bị ngắt, lưu điểm đang làm để tiếp tục chính P09; không tạo prompt mới và không coi checkpoint là hoàn thành. Nếu dependency của prompt trước vừa được hoàn tất ở đây, cập nhật các dòng coverage liên quan bằng bằng chứng mới.

**Kết thúc bằng kết quả đã làm và bằng chứng. Không kết thúc ở “bạn có muốn tôi bắt đầu không?”. Không báo toàn bộ board đạt nếu có panel bị bỏ, chưa chạy hoặc tích hợp chưa xác minh.**
