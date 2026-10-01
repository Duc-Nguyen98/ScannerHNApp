# P01 — Đăng nhập & Xác nhận phiên

**Đây là prompt triển khai. Hãy thực hiện đến khi hoàn thành toàn bộ phạm vi dưới đây; không chỉ xác nhận đã hiểu hoặc trả về kế hoạch.**

## Contract và phạm vi

Áp dụng [00_CONTRACT_CHUNG.md](00_CONTRACT_CHUNG.md), phiên bản 2.0. Nếu đã đọc trong phiên này, sử dụng quyết định và tiến độ còn hiệu lực; không hỏi lại. Nếu file chưa được cung cấp hoặc không đọc được, nêu đúng phần thiếu, không tự bịa contract.

- ID cố định: **P01/24**. Board: **Đăng nhập & Xác nhận phiên**. Nhóm: **ORIGINAL — đã khóa**.
- Mục tiêu: Dựng hoặc kiểm tra giữ nguyên hai màn đã khóa: Đăng nhập và Xác nhận phiên làm việc.
- Phụ thuộc và kết nối: Nền tảng xác thực/source auth hiện có; liên kết quên mật khẩu sang P14, thành công sang P02. Không đợi P14 mới dựng form đăng nhập.
- Tận dụng source, component và kết quả đã có. Chỉ sửa phần cần thiết cho board này và dependency trực tiếp. Không tạo prompt triển khai thứ 25, không yêu cầu tôi viết prompt con cho từng panel.

## Nguồn phải xem

- Ảnh đính kèm: [references/B01.jpg](references/B01.jpg).
- [Ảnh gốc tại commit đã đối chiếu](https://github.com/Duc-Nguyen98/ScannerHNApp/blob/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/00_LOCKED_ORIGINALS/01_Dang_nhap_va_Xac_nhan_phien_ORIGINAL.jpg) · [Mở ảnh trực tiếp](https://raw.githubusercontent.com/Duc-Nguyen98/ScannerHNApp/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/00_LOCKED_ORIGINALS/01_Dang_nhap_va_Xac_nhan_phien_ORIGINAL.jpg).
- [Tab Tất cả của gallery chính](https://duc-nguyen98.github.io/ScannerHNApp/) — chọn đúng tên board trên; không dùng gallery phụ 22 mục làm danh mục đầy đủ.
- Commit tham chiếu: `da9f623a19d0359c3e80c14f8cc612636ec6ab78`. Đường dẫn board: `design/01_Main/BOARDS/00_LOCKED_ORIGINALS/01_Dang_nhap_va_Xac_nhan_phien_ORIGINAL.jpg`.
- Nếu branch triển khai đã thay đổi, ghi source commit thực tế và chênh lệch liên quan; không tự đổi phạm vi hoặc thay ảnh baseline.
- Xem HANDOFF và DEV_PROPOSAL kèm trong references khi hành vi liên quan; chỉ HANDOFF chốt mới có quyền thay nghiệp vụ cũ. Proposal chưa phải API được duyệt.

## Chi tiết từng màn / trạng thái phải triển khai

Đối chiếu từng panel của ảnh; ID bên dưới dùng để kiểm kê, không bắt tạo route riêng. Không bỏ panel chỉ vì dùng lại component. Với panel cũ bị thay nghiệp vụ, lưu disposition=MIGRATED và bằng chứng thay thế.

| ID | Màn / trạng thái | Bố cục, nội dung cần dựng | Hành vi, điều kiện và kết quả |
|---|---|---|---|
| P01.S01 | Đăng nhập | Nền kho tối phủ xanh, logo/brand ở trên, tiêu đề Quản lý kho Hoa Nam; card trắng chứa Tên đăng nhập, Mật khẩu, nút mắt, Quên mật khẩu?, CTA Đăng nhập, khối quyền truy cập và footer thương hiệu. | Nhập thông tin; mắt chỉ đổi cách hiển thị; submit qua auth adapter có sẵn. Thành công mở Xác nhận phiên, không nhảy thẳng bỏ qua màn này nếu luồng hiện hành yêu cầu. |
| P01.S02 | Xác nhận phiên làm việc | Ảnh nhân sự trong kho, lời chào có tên; card avatar/chức danh, Kho Hoa Nam + trạng thái, ghi chú quyền; CTA Bắt đầu ca làm việc và Đăng xuất. | Lấy danh tính/quyền/kho từ phiên hợp lệ. Bắt đầu ca theo cơ chế hiện có; Đăng xuất xóa đúng phiên. Kho ngừng hoặc không có quyền áp dụng guard P03/P15, không báo ca đã bắt đầu giả. |

## Ràng buộc hình thức riêng

Giữ đúng thứ tự, tỷ lệ hero/card và crop ảnh của hai màn; không đổi nền, thương hiệu, văn bản cố định, màu hoặc tạo bộ icon mới. Khung iPhone, island và status bar trong ảnh là phần trình bày thiết bị: xác minh AppShell trước khi render, không vẽ lặp status bar hệ điều hành.

Trước khi sửa, ghi số đo có nguồn của board này: vùng nội dung, header/footer, padding/gap, font, control, radius, icon và crop ảnh. Ưu tiên CSS/component thật; số đo từ ảnh phải ghi estimated. Không áp token chung chưa được xác minh và không render cả ảnh board thành giao diện.

## Logic và dữ liệu riêng

1. Ảnh gốc LOCKED_ORIGINALS giữ nguyên byte; mọi chênh lệch phải có bằng chứng, không dùng cải thiện UX làm lý do redesign.
2. Tên Minh Anh/MA là dữ liệu minh họa; production bind dữ liệu tài khoản. Kho, vai trò và trạng thái không do client tự gán.
3. Username trim/case/Unicode và password policy phải lấy đúng contract auth hiện hành; không tự bịa min/max hoặc đổi password khi submit.
4. Chưa có API auth hoặc bắt đầu ca thì hoàn thành preview bằng fixture tách biệt, ghi integration BLOCKED; không làm login giả trong bản production.
5. Xử lý submitting, lỗi xác thực và focus bằng component hiện có; state chưa có mẫu không được tự coi là baseline được duyệt. Không thêm OTP/2FA/social login.

## Các ca nghiệm thu bắt buộc

| ID | Điều kiện đạt |
|---|---|
| P01.A01 | Đối chiếu riêng cả hai ảnh crop nội dung màn; ảnh gốc checksum không đổi. |
| P01.A02 | Nút mắt không đổi giá trị mật khẩu; thông tin sai không vào Home; nhấp submit liên tiếp không tạo nhiều yêu cầu đang chạy. |
| P01.A03 | Phiên hợp lệ hiển thị đúng tên/quyền/kho; đăng xuất không quay lại màn bảo vệ bằng Back. |
| P01.A04 | Bàn phím mở vẫn tiếp cận được input/CTA; không chèn status bar giả vào app thật. |
| P01.A05 | Thiếu quyền/kho dừng không cho bắt đầu thao tác kho; kết quả chưa xác định không hiện thành công. |

Ngoài các ca trên, capture và đối chiếu từng panel ở viewport tham chiếu hợp lệ. Kiểm tra responsive/keyboard/focus và state tương tác liên quan theo contract. Báo riêng visual, behavior và integration; fixture không đủ để đánh dấu tích hợp PASS.

## Điểm phải xác minh, không tự đoán

Không suy cơ chế tạo ca làm việc từ nhãn Bắt đầu ca. Nếu auth/session khác nguồn đã khóa, ghi rõ khác biệt và chỉ hỏi quyết định thực sự cần.

Chỉ chặn phần phụ thuộc quyết định chưa có; tiếp tục phần độc lập. Không tự thêm màn, quyền, API, enum hoặc quy tắc nghiệp vụ để che thông tin thiếu. Nêu câu hỏi cụ thể sau khi đã làm đủ phần khả thi.

## Thực hiện và bàn giao

1. Đọc tiến độ đã có, xác định source/target và các file liên quan. Nếu đã chạy 5 prompt cũ, giữ kết quả còn đúng. Không cài lại toàn bộ dự án hoặc quét lại asset/bundle khi đã có bằng chứng đủ.
2. Kiểm tra đủ 2 panel nêu trên, xác định component, state transition, data adapter và route/context cần nối; ghi quyết định có nguồn ngắn gọn, rồi triển khai ngay.
3. Dựng UI và hành vi cho tất cả panel trong phạm vi. Nếu chỉ có prototype, tách fixture rõ ràng; không tạo thông báo thành công production giả. Dùng lại component/adapter chung và nối dependency có sẵn.
4. Chạy các ca nghiệm thu, kiểm tra render và lệnh kiểm tra sẵn có của dự án phù hợp thay đổi. Chỉ mở rộng kiểm tra khi có rủi ro cụ thể; sửa lỗi còn trong phạm vi và kiểm lại phần bị ảnh hưởng.
5. Xuất `handoff/P01/REPORT.md`: source commit/target, file đã sửa, coverage từng P01.Sxx, kết quả P01.Axx, link ảnh actual và baseline, lệnh/kết quả thật, khác biệt còn lại và blocker. Cập nhật `SCREEN_COVERAGE.csv` và `RUN_STATE.json` chung.
6. Nếu phiên bị ngắt, lưu điểm đang làm để tiếp tục chính P01; không tạo prompt mới và không coi checkpoint là hoàn thành. Nếu dependency của prompt trước vừa được hoàn tất ở đây, cập nhật các dòng coverage liên quan bằng bằng chứng mới.

**Kết thúc bằng kết quả đã làm và bằng chứng. Không kết thúc ở “bạn có muốn tôi bắt đầu không?”. Không báo toàn bộ board đạt nếu có panel bị bỏ, chưa chạy hoặc tích hợp chưa xác minh.**
