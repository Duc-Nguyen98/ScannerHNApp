# P23 — 21 · Bảo hành & phiên quét

**Đây là prompt triển khai. Hãy thực hiện đến khi hoàn thành toàn bộ phạm vi dưới đây; không chỉ xác nhận đã hiểu hoặc trả về kế hoạch.**

## Contract và phạm vi

Áp dụng [00_CONTRACT_CHUNG.md](00_CONTRACT_CHUNG.md), phiên bản 2.0. Nếu đã đọc trong phiên này, sử dụng quyết định và tiến độ còn hiệu lực; không hỏi lại. Nếu file chưa được cung cấp hoặc không đọc được, nêu đúng phần thiếu, không tự bịa contract.

- ID cố định: **P23/24**. Board: **21 · Bảo hành & phiên quét**. Nhóm: **CURRENT — bộ hiện hành**.
- Mục tiêu: Triển khai board gốc21: danh sách/timeline bảo hành và danh sách/chi tiết phiên quét.
- Phụ thuộc và kết nối: P09 case; P20 linh kiện POSTED; P22 hub; P08 legacy session panel; P24 closed/waiting.
- Tận dụng source, component và kết quả đã có. Chỉ sửa phần cần thiết cho board này và dependency trực tiếp. Không tạo prompt triển khai thứ 25, không yêu cầu tôi viết prompt con cho từng panel.

## Nguồn phải xem

- Ảnh đính kèm: [references/B23.png](references/B23.png).
- [Ảnh gốc tại commit đã đối chiếu](https://github.com/Duc-Nguyen98/ScannerHNApp/blob/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/02_NEW_BOARDS/21_lich_su_bao_hanh_phien_quet.png) · [Mở ảnh trực tiếp](https://raw.githubusercontent.com/Duc-Nguyen98/ScannerHNApp/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/02_NEW_BOARDS/21_lich_su_bao_hanh_phien_quet.png).
- [Tab Tất cả của gallery chính](https://duc-nguyen98.github.io/ScannerHNApp/) — chọn đúng tên board trên; không dùng gallery phụ 22 mục làm danh mục đầy đủ.
- Commit tham chiếu: `da9f623a19d0359c3e80c14f8cc612636ec6ab78`. Đường dẫn board: `design/01_Main/BOARDS/02_NEW_BOARDS/21_lich_su_bao_hanh_phien_quet.png`.
- Nếu branch triển khai đã thay đổi, ghi source commit thực tế và chênh lệch liên quan; không tự đổi phạm vi hoặc thay ảnh baseline.
- Xem HANDOFF và DEV_PROPOSAL kèm trong references khi hành vi liên quan; chỉ HANDOFF chốt mới có quyền thay nghiệp vụ cũ. Proposal chưa phải API được duyệt.

Các scene tương ứng panel bên dưới (fixture prototype, không phải bằng chứng backend hoạt động):

- P23.S01: [warranty](https://duc-nguyen98.github.io/ScannerHNApp/flows/warranty-components/?mode=screen&scene=warranty).
- P23.S02: [warranty-detail](https://duc-nguyen98.github.io/ScannerHNApp/flows/warranty-components/?mode=screen&scene=warranty-detail).
- P23.S03: [sessions](https://duc-nguyen98.github.io/ScannerHNApp/flows/warranty-components/?mode=screen&scene=sessions).
- P23.S04: [session-detail](https://duc-nguyen98.github.io/ScannerHNApp/flows/warranty-components/?mode=screen&scene=session-detail).

[Source flow.js](https://github.com/Duc-Nguyen98/ScannerHNApp/blob/da9f623a19d0359c3e80c14f8cc612636ec6ab78/docs/flows/warranty-components/flow.js) · [style.css](https://github.com/Duc-Nguyen98/ScannerHNApp/blob/da9f623a19d0359c3e80c14f8cc612636ec6ab78/docs/flows/warranty-components/style.css) · [HANDOFF](https://github.com/Duc-Nguyen98/ScannerHNApp/blob/da9f623a19d0359c3e80c14f8cc612636ec6ab78/docs/flows/warranty-components/HANDOFF.md).

## Chi tiết từng màn / trạng thái phải triển khai

Đối chiếu từng panel của ảnh; ID bên dưới dùng để kiểm kê, không bắt tạo route riêng. Không bỏ panel chỉ vì dùng lại component. Với panel cũ bị thay nghiệp vụ, lưu disposition=MIGRATED và bằng chứng thay thế.

| ID | Màn / trạng thái | Bố cục, nội dung cần dựng | Hành vi, điều kiện và kết quả |
|---|---|---|---|
| P23.S01 | Lịch sử bảo hành — warranty | Filter Tất cả/Đang kiểm tra/Đã trả khách; search case/serial; cards BH-001/002 có sản phẩm/serial/status/time; Về lịch sử thao tác. | Dùng cùng warranty-case store/API; không copy case sang bảng lịch sử riêng. Click giữ đúng case ID. |
| P23.S02 | Quá trình xử lý hồ sơ — warranty-detail | Context case; timeline event có tên/giờ/actor/note; link Linh kiện đã xuất và notice nguồn hồ sơ hiện có. | Read-only theo events. Timeline không suy từ status cuối; hồ sơ đóng vẫn xem được lịch sử linh kiện qua đường hợp lệ, nhưng không được xuất thêm. |
| P23.S03 | Lịch sử phiên quét — sessions | Filter Tất cả/Nhập kho/Xuất linh kiện/Tra cứu; nhóm ngày; cards session ID, time range, số mã/quantity, kết quả. | Nguồn session riêng; fixture PQ-0003 xuất linh kiện đã xuất, PQ-0002 nhập chờ Web, PQ-0001 tra cứu đã kết thúc. Không đồng nhất completed session với POSTED. |
| P23.S04 | Chi tiết phiên quét — session-detail | Context session, loại/status; thời gian/actor/kho/phiếu; stats mã hợp lệ/từ chối/quantity; mã đã ghi nhận hoặc kết quả phiên; Về lịch sử phiên quét. | Dùng session ID và event IDs thật. Xuất linh kiện2 mã3 linh kiện; nhập record chưa Post; tra cứu không tạo phiếu kho hoặc tồn. Không mở details của session khác khi ID sai. |

## Ràng buộc hình thức riêng

Giữ cards/filter/timeline và stat strip; text dài wrap đúng, không rút bớt mã để vừa ảnh. Link về hub rõ, shared components không làm lệch P09/P20.

Trước khi sửa, ghi số đo có nguồn của board này: vùng nội dung, header/footer, padding/gap, font, control, radius, icon và crop ảnh. Ưu tiên CSS/component thật; số đo từ ảnh phải ghi estimated. Không áp token chung chưa được xác minh và không render cả ảnh board thành giao diện.

## Logic và dữ liệu riêng

1. Contract scan sessions trong DEV_PROPOSAL chưa mặc định có API; không nhóm phiên theo giờ gần nhau hoặc theo actor để giả session.
2. Auth token/login session không phải scan session; không lưu ảnh camera/secret để làm lịch sử.
3. Accepted/rejected/duplicate attempts/issued quantity là các đại lượng khác nhau; hiển thị Không áp dụng khi đúng nghiệp vụ.
4. Đọc lịch sử không làm đổi tồn, không gửi lại lệnh Post nếu logging lỗi.
5. BH đã trả khách chỉ đọc; giữ quyền đọc lịch sử phù hợp, không tự mở lại hồ sơ.

## Các ca nghiệm thu bắt buộc

| ID | Điều kiện đạt |
|---|---|
| P23.A01 | BH-001 và BH-002 mở đúng timeline/status, không reuse sai fixture. |
| P23.A02 | PQ-0003 hiển thị2 mã3 linh kiện; PQ-0002 Chờ xử lý trên Web; PQ-0001 không có phiếu kho. |
| P23.A03 | Route session ID lạ không fallback về phiên đầu. |
| P23.A04 | Thiếu scan-event/session schema không dựng dữ liệu giả ở production. |
| P23.A05 | Back/filter/scroll không mất context; lịch sử closed case không cho xuất thêm. |

Ngoài các ca trên, capture và đối chiếu từng panel ở viewport tham chiếu hợp lệ. Kiểm tra responsive/keyboard/focus và state tương tác liên quan theo contract. Báo riêng visual, behavior và integration; fixture không đủ để đánh dấu tích hợp PASS.

## Điểm phải xác minh, không tự đoán

Source prototype có fallback fixture phục vụ demo; production phải xác minh ID/data và không dùng fallback đó để che missing entity.

Chỉ chặn phần phụ thuộc quyết định chưa có; tiếp tục phần độc lập. Không tự thêm màn, quyền, API, enum hoặc quy tắc nghiệp vụ để che thông tin thiếu. Nêu câu hỏi cụ thể sau khi đã làm đủ phần khả thi.

## Thực hiện và bàn giao

1. Đọc tiến độ đã có, xác định source/target và các file liên quan. Nếu đã chạy 5 prompt cũ, giữ kết quả còn đúng. Không cài lại toàn bộ dự án hoặc quét lại asset/bundle khi đã có bằng chứng đủ.
2. Kiểm tra đủ 4 panel nêu trên, xác định component, state transition, data adapter và route/context cần nối; ghi quyết định có nguồn ngắn gọn, rồi triển khai ngay.
3. Dựng UI và hành vi cho tất cả panel trong phạm vi. Nếu chỉ có prototype, tách fixture rõ ràng; không tạo thông báo thành công production giả. Dùng lại component/adapter chung và nối dependency có sẵn.
4. Chạy các ca nghiệm thu, kiểm tra render và lệnh kiểm tra sẵn có của dự án phù hợp thay đổi. Chỉ mở rộng kiểm tra khi có rủi ro cụ thể; sửa lỗi còn trong phạm vi và kiểm lại phần bị ảnh hưởng.
5. Xuất `handoff/P23/REPORT.md`: source commit/target, file đã sửa, coverage từng P23.Sxx, kết quả P23.Axx, link ảnh actual và baseline, lệnh/kết quả thật, khác biệt còn lại và blocker. Cập nhật `SCREEN_COVERAGE.csv` và `RUN_STATE.json` chung.
6. Nếu phiên bị ngắt, lưu điểm đang làm để tiếp tục chính P23; không tạo prompt mới và không coi checkpoint là hoàn thành. Nếu dependency của prompt trước vừa được hoàn tất ở đây, cập nhật các dòng coverage liên quan bằng bằng chứng mới.

**Kết thúc bằng kết quả đã làm và bằng chứng. Không kết thúc ở “bạn có muốn tôi bắt đầu không?”. Không báo toàn bộ board đạt nếu có panel bị bỏ, chưa chạy hoặc tích hợp chưa xác minh.**
