# P13 — Thông báo phê duyệt

**Đây là prompt triển khai. Hãy thực hiện đến khi hoàn thành toàn bộ phạm vi dưới đây; không chỉ xác nhận đã hiểu hoặc trả về kế hoạch.**

## Contract và phạm vi

Áp dụng [00_CONTRACT_CHUNG.md](00_CONTRACT_CHUNG.md), phiên bản 2.0. Nếu đã đọc trong phiên này, sử dụng quyết định và tiến độ còn hiệu lực; không hỏi lại. Nếu file chưa được cung cấp hoặc không đọc được, nêu đúng phần thiếu, không tự bịa contract.

- ID cố định: **P13/24**. Board: **Thông báo phê duyệt**. Nhóm: **LEGACY_ADAPTED — đối chiếu nghiệp vụ hiện hành**.
- Mục tiêu: Bao phủ đủ bốn panel của board Thông báo phê duyệt, nhưng thay phần duyệt trên App bằng theo dõi/đối chiếu Web theo chốt mới.
- Phụ thuộc và kết nối: Chuông P02; chi tiết chứng từ P12; P24 chờ Web; nguồn notifications hiện có.
- Tận dụng source, component và kết quả đã có. Chỉ sửa phần cần thiết cho board này và dependency trực tiếp. Không tạo prompt triển khai thứ 25, không yêu cầu tôi viết prompt con cho từng panel.

## Nguồn phải xem

- Ảnh đính kèm: [references/B13.png](references/B13.png).
- [Ảnh gốc tại commit đã đối chiếu](https://github.com/Duc-Nguyen98/ScannerHNApp/blob/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/02_NEW_BOARDS/11_thong_bao_phe_duyet.png) · [Mở ảnh trực tiếp](https://raw.githubusercontent.com/Duc-Nguyen98/ScannerHNApp/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/02_NEW_BOARDS/11_thong_bao_phe_duyet.png).
- [Tab Tất cả của gallery chính](https://duc-nguyen98.github.io/ScannerHNApp/) — chọn đúng tên board trên; không dùng gallery phụ 22 mục làm danh mục đầy đủ.
- Commit tham chiếu: `da9f623a19d0359c3e80c14f8cc612636ec6ab78`. Đường dẫn board: `design/01_Main/BOARDS/02_NEW_BOARDS/11_thong_bao_phe_duyet.png`.
- Nếu branch triển khai đã thay đổi, ghi source commit thực tế và chênh lệch liên quan; không tự đổi phạm vi hoặc thay ảnh baseline.
- Xem HANDOFF và DEV_PROPOSAL kèm trong references khi hành vi liên quan; chỉ HANDOFF chốt mới có quyền thay nghiệp vụ cũ. Proposal chưa phải API được duyệt.

## Chi tiết từng màn / trạng thái phải triển khai

Đối chiếu từng panel của ảnh; ID bên dưới dùng để kiểm kê, không bắt tạo route riêng. Không bỏ panel chỉ vì dùng lại component. Với panel cũ bị thay nghiệp vụ, lưu disposition=MIGRATED và bằng chứng thay thế.

| ID | Màn / trạng thái | Bố cục, nội dung cần dựng | Hành vi, điều kiện và kết quả |
|---|---|---|---|
| P13.S01 | Danh sách thông báo | Header Thông báo; tabs Chưa đọc/Tất cả; card dot chưa đọc, icon loại, tiêu đề, thời gian, mô tả và status. | Dùng notification/event nguồn thật. Mark read theo API nếu có; click mở đúng đối tượng. Không tự tạo push notification hoặc giả badge unread. |
| P13.S02 | Chi tiết thông báo | Tiêu đề, badge/time; người tạo, loại, số chứng từ, kho, thời điểm; nội dung thông báo và CTA Xem chứng từ. | Theo dõi chứng từ hoặc mở hướng dẫn Web. Copy 'cần duyệt' lịch sử không cấp quyền duyệt cho App; thông báo mới dùng thuật ngữ nguồn hiện hành. |
| P13.S03 | Danh sách chờ phê duyệt cũ → theo dõi phiếu chờ Web | Giữ cấu trúc list/filter Phiếu nhập/Phiếu xuất, thông tin phiếu/sản phẩm/người/ngày khi thích hợp; banner giải thích xử lý trên Web. | MIGRATED: chỉ đọc danh sách theo scope có thật, mở chi tiết; không tạo inbox duyệt cho role App. Nếu không có nguồn list phù hợp, state preview tách biệt và integration BLOCKED. |
| P13.S04 | Duyệt chứng từ cũ → chi tiết chờ xử lý Web | Giữ card PN-0005, kho, các SKU 5/4/2 và tóm tắt; thay vùng quyết định bằng trạng thái Chờ xử lý trên Web/hướng dẫn phù hợp. | MIGRATED: không render nút Duyệt/Từ chối hoặc form lý do từ chối để submit trên App. Không gọi approve/reject/Post. URL Web chỉ dùng cấu hình được cung cấp. |

## Ràng buộc hình thức riêng

Giữ style thông báo/list/detail theo board. Vùng approval bị supersede là ngoại lệ có trace tới HANDOFF, không phải yêu cầu copy pixel cũ. Phần bố cục thay thế chưa có baseline dùng component đã duyệt và ghi candidate cần kiểm tra, không tự gắn LOCKED.

Trước khi sửa, ghi số đo có nguồn của board này: vùng nội dung, header/footer, padding/gap, font, control, radius, icon và crop ảnh. Ưu tiên CSS/component thật; số đo từ ảnh phải ghi estimated. Không áp token chung chưa được xác minh và không render cả ảnh board thành giao diện.

## Logic và dữ liệu riêng

1. Đây vẫn là P13 và vẫn bao phủ bốn panel; không xóa board khỏi coverage và không tạo prompt thứ25.
2. Nhập/xuất chính xử lý trên Web bất kể màn cũ ghi 'dành cho người có quyền duyệt'.
3. Không tự tạo notifications service, email, SMS hoặc nhắc khách; xem thông báo không thay đổi tồn.
4. Unread count chỉ cập nhật sau logic đã có; thất bại mark-read không làm mất notification.
5. Phần chưa chốt notification/approval được README đánh dấu đề xuất: không nâng thành API hiện hành.

## Các ca nghiệm thu bắt buộc

| ID | Điều kiện đạt |
|---|---|
| P13.A01 | Đủ bốn mục coverage: hai hiện hành theo nguồn, hai MIGRATED kèm lý do. |
| P13.A02 | Không có handler approve/reject/Post nhập/xuất hoặc route App lách để gọi chúng. |
| P13.A03 | Notification click giữ đúng document ID và quyền xem. |
| P13.A04 | URL Web không bị tự suy từ hostname kho khác; thiếu URL vẫn có hướng dẫn không bịa link. |
| P13.A05 | Unread/filter không đổi khi request lỗi trừ cơ chế optimistic đã có rollback. |

Ngoài các ca trên, capture và đối chiếu từng panel ở viewport tham chiếu hợp lệ. Kiểm tra responsive/keyboard/focus và state tương tác liên quan theo contract. Báo riêng visual, behavior và integration; fixture không đủ để đánh dấu tích hợp PASS.

## Điểm phải xác minh, không tự đoán

Không được tuyên bố pixel-perfect với panel Duyệt cũ sau khi loại action. Nghiệm thu riêng phần được giữ và phần chuyển đổi theo chốt mới.

Chỉ chặn phần phụ thuộc quyết định chưa có; tiếp tục phần độc lập. Không tự thêm màn, quyền, API, enum hoặc quy tắc nghiệp vụ để che thông tin thiếu. Nêu câu hỏi cụ thể sau khi đã làm đủ phần khả thi.

## Thực hiện và bàn giao

1. Đọc tiến độ đã có, xác định source/target và các file liên quan. Nếu đã chạy 5 prompt cũ, giữ kết quả còn đúng. Không cài lại toàn bộ dự án hoặc quét lại asset/bundle khi đã có bằng chứng đủ.
2. Kiểm tra đủ 4 panel nêu trên, xác định component, state transition, data adapter và route/context cần nối; ghi quyết định có nguồn ngắn gọn, rồi triển khai ngay.
3. Dựng UI và hành vi cho tất cả panel trong phạm vi. Nếu chỉ có prototype, tách fixture rõ ràng; không tạo thông báo thành công production giả. Dùng lại component/adapter chung và nối dependency có sẵn.
4. Chạy các ca nghiệm thu, kiểm tra render và lệnh kiểm tra sẵn có của dự án phù hợp thay đổi. Chỉ mở rộng kiểm tra khi có rủi ro cụ thể; sửa lỗi còn trong phạm vi và kiểm lại phần bị ảnh hưởng.
5. Xuất `handoff/P13/REPORT.md`: source commit/target, file đã sửa, coverage từng P13.Sxx, kết quả P13.Axx, link ảnh actual và baseline, lệnh/kết quả thật, khác biệt còn lại và blocker. Cập nhật `SCREEN_COVERAGE.csv` và `RUN_STATE.json` chung.
6. Nếu phiên bị ngắt, lưu điểm đang làm để tiếp tục chính P13; không tạo prompt mới và không coi checkpoint là hoàn thành. Nếu dependency của prompt trước vừa được hoàn tất ở đây, cập nhật các dòng coverage liên quan bằng bằng chứng mới.

**Kết thúc bằng kết quả đã làm và bằng chứng. Không kết thúc ở “bạn có muốn tôi bắt đầu không?”. Không báo toàn bộ board đạt nếu có panel bị bỏ, chưa chạy hoặc tích hợp chưa xác minh.**
