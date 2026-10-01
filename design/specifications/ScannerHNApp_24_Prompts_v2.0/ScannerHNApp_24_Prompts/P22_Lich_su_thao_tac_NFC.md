# P22 — 20 · Lịch sử thao tác & NFC

**Đây là prompt triển khai. Hãy thực hiện đến khi hoàn thành toàn bộ phạm vi dưới đây; không chỉ xác nhận đã hiểu hoặc trả về kế hoạch.**

## Contract và phạm vi

Áp dụng [00_CONTRACT_CHUNG.md](00_CONTRACT_CHUNG.md), phiên bản 2.0. Nếu đã đọc trong phiên này, sử dụng quyết định và tiến độ còn hiệu lực; không hỏi lại. Nếu file chưa được cung cấp hoặc không đọc được, nêu đúng phần thiếu, không tự bịa contract.

- ID cố định: **P22/24**. Board: **20 · Lịch sử thao tác & NFC**. Nhóm: **CURRENT — bộ hiện hành**.
- Mục tiêu: Triển khai board gốc20: hub Lịch sử thao tác, lịch sử NFC, chi tiết event và nguồn chưa khả dụng.
- Phụ thuộc và kết nối: Home Xem tất cả P02; documents P08/P12; draft P21; warranty/session P23; tag operation P07.
- Tận dụng source, component và kết quả đã có. Chỉ sửa phần cần thiết cho board này và dependency trực tiếp. Không tạo prompt triển khai thứ 25, không yêu cầu tôi viết prompt con cho từng panel.

## Nguồn phải xem

- Ảnh đính kèm: [references/B22.png](references/B22.png).
- [Ảnh gốc tại commit đã đối chiếu](https://github.com/Duc-Nguyen98/ScannerHNApp/blob/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/02_NEW_BOARDS/20_lich_su_thao_tac_nfc.png) · [Mở ảnh trực tiếp](https://raw.githubusercontent.com/Duc-Nguyen98/ScannerHNApp/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/02_NEW_BOARDS/20_lich_su_thao_tac_nfc.png).
- [Tab Tất cả của gallery chính](https://duc-nguyen98.github.io/ScannerHNApp/) — chọn đúng tên board trên; không dùng gallery phụ 22 mục làm danh mục đầy đủ.
- Commit tham chiếu: `da9f623a19d0359c3e80c14f8cc612636ec6ab78`. Đường dẫn board: `design/01_Main/BOARDS/02_NEW_BOARDS/20_lich_su_thao_tac_nfc.png`.
- Nếu branch triển khai đã thay đổi, ghi source commit thực tế và chênh lệch liên quan; không tự đổi phạm vi hoặc thay ảnh baseline.
- Xem HANDOFF và DEV_PROPOSAL kèm trong references khi hành vi liên quan; chỉ HANDOFF chốt mới có quyền thay nghiệp vụ cũ. Proposal chưa phải API được duyệt.

Các scene tương ứng panel bên dưới (fixture prototype, không phải bằng chứng backend hoạt động):

- P22.S01: [history-hub](https://duc-nguyen98.github.io/ScannerHNApp/flows/warranty-components/?mode=screen&scene=history-hub).
- P22.S02: [nfc](https://duc-nguyen98.github.io/ScannerHNApp/flows/warranty-components/?mode=screen&scene=nfc).
- P22.S03: [nfc-detail](https://duc-nguyen98.github.io/ScannerHNApp/flows/warranty-components/?mode=screen&scene=nfc-detail).
- P22.S04: [events-unavailable](https://duc-nguyen98.github.io/ScannerHNApp/flows/warranty-components/?mode=screen&scene=events-unavailable).

[Source flow.js](https://github.com/Duc-Nguyen98/ScannerHNApp/blob/da9f623a19d0359c3e80c14f8cc612636ec6ab78/docs/flows/warranty-components/flow.js) · [style.css](https://github.com/Duc-Nguyen98/ScannerHNApp/blob/da9f623a19d0359c3e80c14f8cc612636ec6ab78/docs/flows/warranty-components/style.css) · [HANDOFF](https://github.com/Duc-Nguyen98/ScannerHNApp/blob/da9f623a19d0359c3e80c14f8cc612636ec6ab78/docs/flows/warranty-components/HANDOFF.md).

## Chi tiết từng màn / trạng thái phải triển khai

Đối chiếu từng panel của ảnh; ID bên dưới dùng để kiểm kê, không bắt tạo route riêng. Không bỏ panel chỉ vì dùng lại component. Với panel cũ bị thay nghiệp vụ, lưu disposition=MIGRATED và bằng chứng thay thế.

| ID | Màn / trạng thái | Bố cục, nội dung cần dựng | Hành vi, điều kiện và kết quả |
|---|---|---|---|
| P22.S01 | Lịch sử thao tác — history-hub | Eyebrow Kho Hoa Nam, tiêu đề xem lại công việc; bốn cards Nhập/xuất, NFC, Bảo hành, Phiên quét; shortcut Tiếp tục phiếu dở và badge; Về Trang chủ. | Điều hướng đúng loại dữ liệu; Nhập/xuất là record và kết quả Web, NFC là event, Bảo hành là hồ sơ, Phiên quét là session. Shortcut mở P21. |
| P22.S02 | Lịch sử NFC — nfc | Tabs Tất cả/Gán thẻ/Thay thẻ/Thu hồi thẻ; search UID/serial; nhóm theo ngày, counter, cards loại/giờ/UID/serial/status/actor. | Lọc/search theo event adapter; không thao tác thay trạng thái thẻ từ list lịch sử. Nhãn event dùng mapping backend được chốt. |
| P22.S03 | Chi tiết thao tác NFC — nfc-detail | Card icon+loại+status; bảng UID/serial/sản phẩm/actor/thời điểm/kho; nội dung thao tác và notice chỉ đọc; Về lịch sử NFC. | Mở theo event ID, không tự chọn event đầu khi ID sai. Previous/current UID/reason hiển thị nếu nguồn có; không suy timeline từ tag status. |
| P22.S04 | Chưa có dữ liệu lịch sử — events-unavailable | Empty icon, tiêu đề Chưa có dữ liệu lịch sử; mô tả danh sách hiện chưa khả dụng; Tải lại lịch sử/Về lịch sử thao tác. | Dùng khi chưa có event source hoặc source unavailable; khác 'không có thao tác' do dataset thật rỗng. Retry chỉ đọc, không tạo event giả. |

## Ràng buộc hình thức riêng

Theo prototype Public Sans, cards rộng có icon trái và arrow phải, filter chips, detail summary và unavailable empty state. Hub là lối vào Home Xem tất cả theo chốt mới.

Trước khi sửa, ghi số đo có nguồn của board này: vùng nội dung, header/footer, padding/gap, font, control, radius, icon và crop ảnh. Ưu tiên CSS/component thật; số đo từ ảnh phải ghi estimated. Không áp token chung chưa được xác minh và không render cả ảnh board thành giao diện.

## Logic và dữ liệu riêng

1. Event chỉ sau mapping/thay/thu hồi backend xác nhận; đọc UID/prepare chưa phải event gán thành công.
2. Không biến danh sách nfc-tags/current status thành lịch sử; thiếu nguồn vẫn render unavailable đúng.
3. DEV_PROPOSAL schema/API chỉ là đề xuất; map nguồn hiện có trước, không gọi endpoint đề xuất như đã tồn tại.
4. List/detail read-only, không nút thay/thu hồi/ghi thẻ phát sinh.
5. Không hardcode cùng sản phẩm/actor cho mọi event như fixture; field riêng từng event.

## Các ca nghiệm thu bắt buộc

| ID | Điều kiện đạt |
|---|---|
| P22.A01 | Home Xem tất cả mở hub này; bốn entry/shortcut chuyển đúng context. |
| P22.A02 | Filter+query UID/serial không bị reset sai; Back detail giữ kết quả. |
| P22.A03 | event ID không tồn tại không âm thầm hiển thị event đầu. |
| P22.A04 | Không có source event → unavailable, không 'Chưa có thao tác' hoặc lịch sử giả. |
| P22.A05 | Operation NFC thành công chỉ xuất hiện khi event source xác nhận, không khi mới đọc thẻ. |

Ngoài các ca trên, capture và đối chiếu từng panel ở viewport tham chiếu hợp lệ. Kiểm tra responsive/keyboard/focus và state tương tác liên quan theo contract. Báo riêng visual, behavior và integration; fixture không đủ để đánh dấu tích hợp PASS.

## Điểm phải xác minh, không tự đoán

Contract event chưa chốt thì hoàn thành UI với fixture tách biệt; production dùng unavailable/nguồn có thật và ghi integration BLOCKED.

Chỉ chặn phần phụ thuộc quyết định chưa có; tiếp tục phần độc lập. Không tự thêm màn, quyền, API, enum hoặc quy tắc nghiệp vụ để che thông tin thiếu. Nêu câu hỏi cụ thể sau khi đã làm đủ phần khả thi.

## Thực hiện và bàn giao

1. Đọc tiến độ đã có, xác định source/target và các file liên quan. Nếu đã chạy 5 prompt cũ, giữ kết quả còn đúng. Không cài lại toàn bộ dự án hoặc quét lại asset/bundle khi đã có bằng chứng đủ.
2. Kiểm tra đủ 4 panel nêu trên, xác định component, state transition, data adapter và route/context cần nối; ghi quyết định có nguồn ngắn gọn, rồi triển khai ngay.
3. Dựng UI và hành vi cho tất cả panel trong phạm vi. Nếu chỉ có prototype, tách fixture rõ ràng; không tạo thông báo thành công production giả. Dùng lại component/adapter chung và nối dependency có sẵn.
4. Chạy các ca nghiệm thu, kiểm tra render và lệnh kiểm tra sẵn có của dự án phù hợp thay đổi. Chỉ mở rộng kiểm tra khi có rủi ro cụ thể; sửa lỗi còn trong phạm vi và kiểm lại phần bị ảnh hưởng.
5. Xuất `handoff/P22/REPORT.md`: source commit/target, file đã sửa, coverage từng P22.Sxx, kết quả P22.Axx, link ảnh actual và baseline, lệnh/kết quả thật, khác biệt còn lại và blocker. Cập nhật `SCREEN_COVERAGE.csv` và `RUN_STATE.json` chung.
6. Nếu phiên bị ngắt, lưu điểm đang làm để tiếp tục chính P22; không tạo prompt mới và không coi checkpoint là hoàn thành. Nếu dependency của prompt trước vừa được hoàn tất ở đây, cập nhật các dòng coverage liên quan bằng bằng chứng mới.

**Kết thúc bằng kết quả đã làm và bằng chứng. Không kết thúc ở “bạn có muốn tôi bắt đầu không?”. Không báo toàn bộ board đạt nếu có panel bị bỏ, chưa chạy hoặc tích hợp chưa xác minh.**
