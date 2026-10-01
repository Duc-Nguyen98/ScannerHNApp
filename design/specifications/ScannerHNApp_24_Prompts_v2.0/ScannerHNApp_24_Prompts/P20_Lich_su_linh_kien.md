# P20 — 18 · Lịch sử linh kiện

**Đây là prompt triển khai. Hãy thực hiện đến khi hoàn thành toàn bộ phạm vi dưới đây; không chỉ xác nhận đã hiểu hoặc trả về kế hoạch.**

## Contract và phạm vi

Áp dụng [00_CONTRACT_CHUNG.md](00_CONTRACT_CHUNG.md), phiên bản 2.0. Nếu đã đọc trong phiên này, sử dụng quyết định và tiến độ còn hiệu lực; không hỏi lại. Nếu file chưa được cung cấp hoặc không đọc được, nêu đúng phần thiếu, không tự bịa contract.

- ID cố định: **P20/24**. Board: **18 · Lịch sử linh kiện**. Nhóm: **CURRENT — bộ hiện hành**.
- Mục tiêu: Triển khai board gốc 18: lịch sử phiếu linh kiện đã xuất trong hồ sơ, tải thêm, lỗi tải thêm và rỗng.
- Phụ thuộc và kết nối: P09/P19/P23 cho case và xuất; P24 đóng case. Scene history/history-loading/history-error/empty.
- Tận dụng source, component và kết quả đã có. Chỉ sửa phần cần thiết cho board này và dependency trực tiếp. Không tạo prompt triển khai thứ 25, không yêu cầu tôi viết prompt con cho từng panel.

## Nguồn phải xem

- Ảnh đính kèm: [references/B20.png](references/B20.png).
- [Ảnh gốc tại commit đã đối chiếu](https://github.com/Duc-Nguyen98/ScannerHNApp/blob/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/02_NEW_BOARDS/18_lich_su_linh_kien.png) · [Mở ảnh trực tiếp](https://raw.githubusercontent.com/Duc-Nguyen98/ScannerHNApp/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/02_NEW_BOARDS/18_lich_su_linh_kien.png).
- [Tab Tất cả của gallery chính](https://duc-nguyen98.github.io/ScannerHNApp/) — chọn đúng tên board trên; không dùng gallery phụ 22 mục làm danh mục đầy đủ.
- Commit tham chiếu: `da9f623a19d0359c3e80c14f8cc612636ec6ab78`. Đường dẫn board: `design/01_Main/BOARDS/02_NEW_BOARDS/18_lich_su_linh_kien.png`.
- Nếu branch triển khai đã thay đổi, ghi source commit thực tế và chênh lệch liên quan; không tự đổi phạm vi hoặc thay ảnh baseline.
- Xem HANDOFF và DEV_PROPOSAL kèm trong references khi hành vi liên quan; chỉ HANDOFF chốt mới có quyền thay nghiệp vụ cũ. Proposal chưa phải API được duyệt.

Các scene tương ứng panel bên dưới (fixture prototype, không phải bằng chứng backend hoạt động):

- P20.S01: [history](https://duc-nguyen98.github.io/ScannerHNApp/flows/warranty-components/?mode=screen&scene=history).
- P20.S02: [history-loading](https://duc-nguyen98.github.io/ScannerHNApp/flows/warranty-components/?mode=screen&scene=history-loading).
- P20.S03: [history-error](https://duc-nguyen98.github.io/ScannerHNApp/flows/warranty-components/?mode=screen&scene=history-error).
- P20.S04: [empty](https://duc-nguyen98.github.io/ScannerHNApp/flows/warranty-components/?mode=screen&scene=empty).

[Source flow.js](https://github.com/Duc-Nguyen98/ScannerHNApp/blob/da9f623a19d0359c3e80c14f8cc612636ec6ab78/docs/flows/warranty-components/flow.js) · [style.css](https://github.com/Duc-Nguyen98/ScannerHNApp/blob/da9f623a19d0359c3e80c14f8cc612636ec6ab78/docs/flows/warranty-components/style.css) · [HANDOFF](https://github.com/Duc-Nguyen98/ScannerHNApp/blob/da9f623a19d0359c3e80c14f8cc612636ec6ab78/docs/flows/warranty-components/HANDOFF.md).

## Chi tiết từng màn / trạng thái phải triển khai

Đối chiếu từng panel của ảnh; ID bên dưới dùng để kiểm kê, không bắt tạo route riêng. Không bỏ panel chỉ vì dùng lại component. Với panel cũ bị thay nghiệp vụ, lưu disposition=MIGRATED và bằng chứng thay thế.

| ID | Màn / trạng thái | Bố cục, nội dung cần dựng | Hành vi, điều kiện và kết quả |
|---|---|---|---|
| P20.S01 | Phiếu linh kiện đã xuất — history | Context BH-001, sản phẩm/SN/khách/status; block Linh kiện đã xuất có count phiếu đã tải; phiếu XLK-0002 với LK-0001 qty1/LK-0002 qty2, timestamp; Tải thêm phiếu; thông tin/quá trình xử lý; CTA Xuất linh kiện. | Chỉ lấy POSTED gắn đúng case ID. Count 'đã tải' là loaded count, không bịa tổng server. Mở P19 vẫn cùng case. |
| P20.S02 | Tải thêm lịch sử — history-loading | Giữ card context và toàn bộ phiếu cũ; skeleton/loading nằm cuối danh sách. | Disable load-more trong request, giữ vị trí cuộn, không replace màn bằng full loading. Merge trang mới sau response. |
| P20.S03 | Lỗi tải lịch sử — history-error | Giữ phiếu đã tải, banner Chưa tải được các phiếu tiếp theo... và Thử tải lại. | Retry đúng cursor/page thất bại, không restart từ trang1 khiến mất/nhân đôi list. Không chuyển lỗi thành empty. |
| P20.S04 | Chưa có phiếu xuất — empty | Context hồ sơ vẫn có; count0 phiếu đã tải; empty icon/copy chỉ hiện sau khi fetch thành công; link quá trình xử lý; CTA Xuất linh kiện theo quyền. | DRAFT không làm list POSTED có dữ liệu; hồ sơ đóng thì CTA không được xuất dù empty. Giữ riêng pending drafts ở P21. |

## Ràng buộc hình thức riêng

Một card hồ sơ trên, block phiếu theo nhóm, từng dòng quantity bên phải; load-more inline và CTA đáy. Giữ không gian scrollbar/scroll position khi append.

Trước khi sửa, ghi số đo có nguồn của board này: vùng nội dung, header/footer, padding/gap, font, control, radius, icon và crop ảnh. Ưu tiên CSS/component thật; số đo từ ảnh phải ghi estimated. Không áp token chung chưa được xác minh và không render cả ảnh board thành giao diện.

## Logic và dữ liệu riêng

1. Chỉ POSTED; không gom DRAFT/CANCELLED/UNKNOWN vào lịch sử đã xuất.
2. Merge/dedup theo document ID bất biến; không dedup bằng thời gian hoặc SKU.
3. hasMore/nextCursor dùng contract thật; hiện kết thúc danh sách khi nguồn xác nhận hết, không suy từ list ít hơn20 trừ API quy định.
4. Không dùng số dòng SKU làm số phiếu; tổng linh kiện không dùng count mã.
5. Đổi case phải reset nguồn/cursor đúng và hủy/bỏ response cũ để không lẫn hai hồ sơ.

## Các ca nghiệm thu bắt buộc

| ID | Điều kiện đạt |
|---|---|
| P20.A01 | Trang2 có ID trùng trang1 chỉ còn một phiếu, quantity không bị cộng đôi. |
| P20.A02 | Tải thêm lỗi giữ nguyên dữ liệu/scroll; retry không nhân đôi. |
| P20.A03 | DRAFT không xuất hiện trong POSTED; empty chỉ sau successful fetch. |
| P20.A04 | Click nhanh Tải thêm chỉ một request active. |
| P20.A05 | Case đóng xem được lịch sử nhưng không xuất thêm; hết trang có nhãn kết thúc. |

Ngoài các ca trên, capture và đối chiếu từng panel ở viewport tham chiếu hợp lệ. Kiểm tra responsive/keyboard/focus và state tương tác liên quan theo contract. Báo riêng visual, behavior và integration; fixture không đủ để đánh dấu tích hợp PASS.

## Điểm phải xác minh, không tự đoán

Pagination cursor/page/ID phải kiểm backend. Hạ tầng chưa có thì triển khai fixture chống trùng đúng và ghi adapter còn chờ, không phát minh endpoint.

Chỉ chặn phần phụ thuộc quyết định chưa có; tiếp tục phần độc lập. Không tự thêm màn, quyền, API, enum hoặc quy tắc nghiệp vụ để che thông tin thiếu. Nêu câu hỏi cụ thể sau khi đã làm đủ phần khả thi.

## Thực hiện và bàn giao

1. Đọc tiến độ đã có, xác định source/target và các file liên quan. Nếu đã chạy 5 prompt cũ, giữ kết quả còn đúng. Không cài lại toàn bộ dự án hoặc quét lại asset/bundle khi đã có bằng chứng đủ.
2. Kiểm tra đủ 4 panel nêu trên, xác định component, state transition, data adapter và route/context cần nối; ghi quyết định có nguồn ngắn gọn, rồi triển khai ngay.
3. Dựng UI và hành vi cho tất cả panel trong phạm vi. Nếu chỉ có prototype, tách fixture rõ ràng; không tạo thông báo thành công production giả. Dùng lại component/adapter chung và nối dependency có sẵn.
4. Chạy các ca nghiệm thu, kiểm tra render và lệnh kiểm tra sẵn có của dự án phù hợp thay đổi. Chỉ mở rộng kiểm tra khi có rủi ro cụ thể; sửa lỗi còn trong phạm vi và kiểm lại phần bị ảnh hưởng.
5. Xuất `handoff/P20/REPORT.md`: source commit/target, file đã sửa, coverage từng P20.Sxx, kết quả P20.Axx, link ảnh actual và baseline, lệnh/kết quả thật, khác biệt còn lại và blocker. Cập nhật `SCREEN_COVERAGE.csv` và `RUN_STATE.json` chung.
6. Nếu phiên bị ngắt, lưu điểm đang làm để tiếp tục chính P20; không tạo prompt mới và không coi checkpoint là hoàn thành. Nếu dependency của prompt trước vừa được hoàn tất ở đây, cập nhật các dòng coverage liên quan bằng bằng chứng mới.

**Kết thúc bằng kết quả đã làm và bằng chứng. Không kết thúc ở “bạn có muốn tôi bắt đầu không?”. Không báo toàn bộ board đạt nếu có panel bị bỏ, chưa chạy hoặc tích hợp chưa xác minh.**
