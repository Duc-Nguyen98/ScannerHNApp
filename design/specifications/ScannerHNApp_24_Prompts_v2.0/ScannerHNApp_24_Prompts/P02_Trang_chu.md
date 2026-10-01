# P02 — Trang chủ đã khóa

**Đây là prompt triển khai. Hãy thực hiện đến khi hoàn thành toàn bộ phạm vi dưới đây; không chỉ xác nhận đã hiểu hoặc trả về kế hoạch.**

## Contract và phạm vi

Áp dụng [00_CONTRACT_CHUNG.md](00_CONTRACT_CHUNG.md), phiên bản 2.0. Nếu đã đọc trong phiên này, sử dụng quyết định và tiến độ còn hiệu lực; không hỏi lại. Nếu file chưa được cung cấp hoặc không đọc được, nêu đúng phần thiếu, không tự bịa contract.

- ID cố định: **P02/24**. Board: **Trang chủ đã khóa**. Nhóm: **ORIGINAL — đã khóa**.
- Mục tiêu: Giữ nguyên Trang chủ đã khóa và nối các lối vào tới đúng module, đặc biệt Xem tất cả đi Lịch sử theo chốt mới.
- Phụ thuộc và kết nối: P01 cho phiên; P04/P05/P06/P07/P09/P10/P12/P13 cho các đích; hub lịch sử P22. Đích chưa tồn tại phải ghi dependency, không tạo trang thành công giả.
- Tận dụng source, component và kết quả đã có. Chỉ sửa phần cần thiết cho board này và dependency trực tiếp. Không tạo prompt triển khai thứ 25, không yêu cầu tôi viết prompt con cho từng panel.

## Nguồn phải xem

- Ảnh đính kèm: [references/B02.jpg](references/B02.jpg).
- [Ảnh gốc tại commit đã đối chiếu](https://github.com/Duc-Nguyen98/ScannerHNApp/blob/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/00_LOCKED_ORIGINALS/02_Trang_chu_ORIGINAL.jpg) · [Mở ảnh trực tiếp](https://raw.githubusercontent.com/Duc-Nguyen98/ScannerHNApp/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/00_LOCKED_ORIGINALS/02_Trang_chu_ORIGINAL.jpg).
- [Tab Tất cả của gallery chính](https://duc-nguyen98.github.io/ScannerHNApp/) — chọn đúng tên board trên; không dùng gallery phụ 22 mục làm danh mục đầy đủ.
- Commit tham chiếu: `da9f623a19d0359c3e80c14f8cc612636ec6ab78`. Đường dẫn board: `design/01_Main/BOARDS/00_LOCKED_ORIGINALS/02_Trang_chu_ORIGINAL.jpg`.
- Nếu branch triển khai đã thay đổi, ghi source commit thực tế và chênh lệch liên quan; không tự đổi phạm vi hoặc thay ảnh baseline.
- Xem HANDOFF và DEV_PROPOSAL kèm trong references khi hành vi liên quan; chỉ HANDOFF chốt mới có quyền thay nghiệp vụ cũ. Proposal chưa phải API được duyệt.

## Chi tiết từng màn / trạng thái phải triển khai

Đối chiếu từng panel của ảnh; ID bên dưới dùng để kiểm kê, không bắt tạo route riêng. Không bỏ panel chỉ vì dùng lại component. Với panel cũ bị thay nghiệp vụ, lưu disposition=MIGRATED và bằng chứng thay thế.

| ID | Màn / trạng thái | Bố cục, nội dung cần dựng | Hành vi, điều kiện và kết quả |
|---|---|---|---|
| P02.S01 | Trang chủ mặc định | Hero nền kho, logo, chuông có badge và avatar MA; Kho Hoa Nam, lời chào, chip Đang hoạt động. Thẻ KPI 1 phiếu chờ duyệt / 4 bảo hành đang mở / 08:30 ca bắt đầu trong fixture. Grid 2×2 Nhập kho, Xuất kho, Bảo hành, Thẻ NFC; CTA Quét hoặc nhập mã; danh sách chứng từ gần đây; bottom nav năm mục. | Điều hướng bằng route hiện có, giữ selected tab; Xem tất cả của chứng từ gần đây mở Lịch sử theo HANDOFF. Mở từng dòng đúng document/case ID; chuông mở thông báo, avatar mở Cá nhân. |

## Ràng buộc hình thức riêng

Màn một cột; hero trên cùng và card KPI đè phần chuyển nền; bốn tác vụ hai cột; scanner CTA nổi bật; ba dòng chứng từ minh họa PN-0001/PX-0004/BH-001; nút quét tròn nhô giữa bottom nav. Không thiết kế dashboard desktop rộng.

Trước khi sửa, ghi số đo có nguồn của board này: vùng nội dung, header/footer, padding/gap, font, control, radius, icon và crop ảnh. Ưu tiên CSS/component thật; số đo từ ảnh phải ghi estimated. Không áp token chung chưa được xác minh và không render cả ảnh board thành giao diện.

## Logic và dữ liệu riêng

1. Không thay cấu trúc hoặc nhãn/ảnh của baseline đã khóa. Nếu copy cũ Chờ duyệt mâu thuẫn nghiệp vụ mới, ghi ngoại lệ cần chốt cho đúng nhãn; không đổi toàn màn và không suy ra App được phép duyệt.
2. KPI và badge là dữ liệu, không hardcode production từ ảnh. Chưa biết API/định nghĩa chỉ số thì ghi UNKNOWN, không đếm suy từ trang đã tải.
3. Một kho Hoa Nam; không thêm switcher nhiều kho hoặc hành vi đổi kho.
4. Hiển thị quyền và kiểm guard cho route/action; thẻ nhìn thấy không được mở quyền ghi bằng cách bỏ kiểm tra.
5. Bottom nav và vùng nội dung không chồng lên nhau; không thêm camera tự mở chỉ vì đứng ở Home.

## Các ca nghiệm thu bắt buộc

| ID | Điều kiện đạt |
|---|---|
| P02.A01 | Ảnh Home giữ đúng vị trí hero, KPI, grid, CTA, chứng từ và bottom nav; checksum baseline không đổi. |
| P02.A02 | Xem tất cả mở đúng hub lịch sử và Back giữ trạng thái Home. |
| P02.A03 | Mỗi tác vụ đến đúng luồng, truyền đúng ID khi mở chứng từ. |
| P02.A04 | Vai trò không có quyền không thực hiện được action dù nhập route trực tiếp. |
| P02.A05 | Tên dài/số badge nhiều chữ số không phá bố cục; đánh giá responsive tách khỏi ảnh tham chiếu. |

Ngoài các ca trên, capture và đối chiếu từng panel ở viewport tham chiếu hợp lệ. Kiểm tra responsive/keyboard/focus và state tương tác liên quan theo contract. Báo riêng visual, behavior và integration; fixture không đủ để đánh dấu tích hợp PASS.

## Điểm phải xác minh, không tự đoán

Chốt nghiệp vụ mới xác định đích Xem tất cả, nhưng không tự cho phép đổi visual Home đã khóa. Label KPI chưa có mapping backend phải báo riêng.

Chỉ chặn phần phụ thuộc quyết định chưa có; tiếp tục phần độc lập. Không tự thêm màn, quyền, API, enum hoặc quy tắc nghiệp vụ để che thông tin thiếu. Nêu câu hỏi cụ thể sau khi đã làm đủ phần khả thi.

## Thực hiện và bàn giao

1. Đọc tiến độ đã có, xác định source/target và các file liên quan. Nếu đã chạy 5 prompt cũ, giữ kết quả còn đúng. Không cài lại toàn bộ dự án hoặc quét lại asset/bundle khi đã có bằng chứng đủ.
2. Kiểm tra đủ 1 panel nêu trên, xác định component, state transition, data adapter và route/context cần nối; ghi quyết định có nguồn ngắn gọn, rồi triển khai ngay.
3. Dựng UI và hành vi cho tất cả panel trong phạm vi. Nếu chỉ có prototype, tách fixture rõ ràng; không tạo thông báo thành công production giả. Dùng lại component/adapter chung và nối dependency có sẵn.
4. Chạy các ca nghiệm thu, kiểm tra render và lệnh kiểm tra sẵn có của dự án phù hợp thay đổi. Chỉ mở rộng kiểm tra khi có rủi ro cụ thể; sửa lỗi còn trong phạm vi và kiểm lại phần bị ảnh hưởng.
5. Xuất `handoff/P02/REPORT.md`: source commit/target, file đã sửa, coverage từng P02.Sxx, kết quả P02.Axx, link ảnh actual và baseline, lệnh/kết quả thật, khác biệt còn lại và blocker. Cập nhật `SCREEN_COVERAGE.csv` và `RUN_STATE.json` chung.
6. Nếu phiên bị ngắt, lưu điểm đang làm để tiếp tục chính P02; không tạo prompt mới và không coi checkpoint là hoàn thành. Nếu dependency của prompt trước vừa được hoàn tất ở đây, cập nhật các dòng coverage liên quan bằng bằng chứng mới.

**Kết thúc bằng kết quả đã làm và bằng chứng. Không kết thúc ở “bạn có muốn tôi bắt đầu không?”. Không báo toàn bộ board đạt nếu có panel bị bỏ, chưa chạy hoặc tích hợp chưa xác minh.**
