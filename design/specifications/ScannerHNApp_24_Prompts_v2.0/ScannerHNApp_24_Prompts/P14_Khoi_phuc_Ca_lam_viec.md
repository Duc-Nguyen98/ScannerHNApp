# P14 — Khôi phục ca

**Đây là prompt triển khai. Hãy thực hiện đến khi hoàn thành toàn bộ phạm vi dưới đây; không chỉ xác nhận đã hiểu hoặc trả về kế hoạch.**

## Contract và phạm vi

Áp dụng [00_CONTRACT_CHUNG.md](00_CONTRACT_CHUNG.md), phiên bản 2.0. Nếu đã đọc trong phiên này, sử dụng quyết định và tiến độ còn hiệu lực; không hỏi lại. Nếu file chưa được cung cấp hoặc không đọc được, nêu đúng phần thiếu, không tự bịa contract.

- ID cố định: **P14/24**. Board: **Khôi phục ca**. Nhóm: **LEGACY_ADAPTED — đối chiếu nghiệp vụ hiện hành**.
- Mục tiêu: Dựng đủ bốn panel Khôi phục tài khoản, Yêu cầu đã tiếp nhận, Kết thúc ca và Tổng kết ca; giữ rõ các cơ chế còn là đề xuất.
- Phụ thuộc và kết nối: P01 quên mật khẩu; P10 kết thúc ca; P03 draft dialog; P21 tiếp tục phiếu.
- Tận dụng source, component và kết quả đã có. Chỉ sửa phần cần thiết cho board này và dependency trực tiếp. Không tạo prompt triển khai thứ 25, không yêu cầu tôi viết prompt con cho từng panel.

## Nguồn phải xem

- Ảnh đính kèm: [references/B14.png](references/B14.png).
- [Ảnh gốc tại commit đã đối chiếu](https://github.com/Duc-Nguyen98/ScannerHNApp/blob/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/02_NEW_BOARDS/12_khoi_phuc_va_ca_fixed.png) · [Mở ảnh trực tiếp](https://raw.githubusercontent.com/Duc-Nguyen98/ScannerHNApp/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/02_NEW_BOARDS/12_khoi_phuc_va_ca_fixed.png).
- [Tab Tất cả của gallery chính](https://duc-nguyen98.github.io/ScannerHNApp/) — chọn đúng tên board trên; không dùng gallery phụ 22 mục làm danh mục đầy đủ.
- Commit tham chiếu: `da9f623a19d0359c3e80c14f8cc612636ec6ab78`. Đường dẫn board: `design/01_Main/BOARDS/02_NEW_BOARDS/12_khoi_phuc_va_ca_fixed.png`.
- Nếu branch triển khai đã thay đổi, ghi source commit thực tế và chênh lệch liên quan; không tự đổi phạm vi hoặc thay ảnh baseline.
- Xem HANDOFF và DEV_PROPOSAL kèm trong references khi hành vi liên quan; chỉ HANDOFF chốt mới có quyền thay nghiệp vụ cũ. Proposal chưa phải API được duyệt.

## Chi tiết từng màn / trạng thái phải triển khai

Đối chiếu từng panel của ảnh; ID bên dưới dùng để kiểm kê, không bắt tạo route riêng. Không bỏ panel chỉ vì dùng lại component. Với panel cũ bị thay nghiệp vụ, lưu disposition=MIGRATED và bằng chứng thay thế.

| ID | Màn / trạng thái | Bố cục, nội dung cần dựng | Hành vi, điều kiện và kết quả |
|---|---|---|---|
| P14.S01 | Khôi phục tài khoản | Header Kho Hoa Nam; icon người; mô tả hỗ trợ khôi phục; input tên đăng nhập; notice liên hệ quản trị; Gửi yêu cầu hỗ trợ. | Không thêm OTP/email magic link/reset password. Gửi qua cơ chế được xác nhận; thiếu kênh thì dựng preview đúng board và chặn action tích hợp thay vì giả gửi. |
| P14.S02 | Yêu cầu đã tiếp nhận | Check xanh; trạng thái Chờ quản trị viên xác minh; tên đăng nhập, thời gian, mã yêu cầu có copy; Về Đăng nhập. | Chỉ hiện receipt khi có kết quả hợp lệ hoặc fixture trong preview. Không tự hứa quản trị sẽ liên hệ bằng kênh/thời gian chưa chốt. |
| P14.S03 | Kết thúc ca có phiếu dở | Banner Còn 1 phiếu chưa hoàn tất; danh sách phiếu; Tiếp tục phiếu/Lưu nháp trước khi kết thúc; Kết thúc ca disabled. | Duy trì guard chưa hoàn tất theo policy có thật; lưu nháp giữ đúng ID. Không xóa phiếu hoặc tự submit/Post để cho kết thúc ca. |
| P14.S04 | Tổng kết ca | Thông tin người/kho/08:30–17:30/ngày; KPI nhập12/xuất6/bảo hành4/NFC3/chứng từ5/tổng30 fixture; phiếu nháp1; Về Trang chủ. | KPI từ aggregate đã định nghĩa; draft được giữ cho tiếp tục theo contract, không tự chuyển quyền sở hữu ca sau. End shift không mặc định logout. |

## Ràng buộc hình thức riêng

Giữ các màn hỗ trợ ít trường, success receipt, end-shift warning và grid summary; chú thích 'Đề xuất' trong board phải được thể hiện trong tài liệu/preview developer, không chuyển thành lời hứa sản phẩm.

Trước khi sửa, ghi số đo có nguồn của board này: vùng nội dung, header/footer, padding/gap, font, control, radius, icon và crop ảnh. Ưu tiên CSS/component thật; số đo từ ảnh phải ghi estimated. Không áp token chung chưa được xác minh và không render cả ảnh board thành giao diện.

## Logic và dữ liệu riêng

1. README xác định recovery/end shift là cơ chế cần BA chốt; cho phép dựng UI và fixture, không tự làm backend workflow.
2. Tên đăng nhập không phải display name; đừng tự dùng Minh Anh làm username hợp lệ.
3. Không làm lộ tài khoản có tồn tại qua thông báo nếu auth policy hiện có không cho phép.
4. Request ID/time do hệ thống trả về; fixture RQ... không dùng production.
5. Không xóa draft khi kết thúc ca; việc transfer/handoff draft cần quyền/contract rõ ràng.

## Các ca nghiệm thu bắt buộc

| ID | Điều kiện đạt |
|---|---|
| P14.A01 | Không có OTP/2FA/auto-reset phát sinh ngoài nguồn. |
| P14.A02 | Không mở receipt khi request lỗi hoặc chưa gửi. |
| P14.A03 | Phiếu dở giữ End shift bị chặn; continue mở đúng phiếu. |
| P14.A04 | Lưu draft lỗi/timeout không cho báo kết thúc ca thành công. |
| P14.A05 | KPI fixture30 có định nghĩa; summary không được tự ghép từ số dòng client đã tải. |

Ngoài các ca trên, capture và đối chiếu từng panel ở viewport tham chiếu hợp lệ. Kiểm tra responsive/keyboard/focus và state tương tác liên quan theo contract. Báo riêng visual, behavior và integration; fixture không đủ để đánh dấu tích hợp PASS.

## Điểm phải xác minh, không tự đoán

Cả nhận yêu cầu recovery và điều kiện kết thúc ca cần chốt theo nguồn; UI_READY không được ghi INTEGRATION_PASS.

Chỉ chặn phần phụ thuộc quyết định chưa có; tiếp tục phần độc lập. Không tự thêm màn, quyền, API, enum hoặc quy tắc nghiệp vụ để che thông tin thiếu. Nêu câu hỏi cụ thể sau khi đã làm đủ phần khả thi.

## Thực hiện và bàn giao

1. Đọc tiến độ đã có, xác định source/target và các file liên quan. Nếu đã chạy 5 prompt cũ, giữ kết quả còn đúng. Không cài lại toàn bộ dự án hoặc quét lại asset/bundle khi đã có bằng chứng đủ.
2. Kiểm tra đủ 4 panel nêu trên, xác định component, state transition, data adapter và route/context cần nối; ghi quyết định có nguồn ngắn gọn, rồi triển khai ngay.
3. Dựng UI và hành vi cho tất cả panel trong phạm vi. Nếu chỉ có prototype, tách fixture rõ ràng; không tạo thông báo thành công production giả. Dùng lại component/adapter chung và nối dependency có sẵn.
4. Chạy các ca nghiệm thu, kiểm tra render và lệnh kiểm tra sẵn có của dự án phù hợp thay đổi. Chỉ mở rộng kiểm tra khi có rủi ro cụ thể; sửa lỗi còn trong phạm vi và kiểm lại phần bị ảnh hưởng.
5. Xuất `handoff/P14/REPORT.md`: source commit/target, file đã sửa, coverage từng P14.Sxx, kết quả P14.Axx, link ảnh actual và baseline, lệnh/kết quả thật, khác biệt còn lại và blocker. Cập nhật `SCREEN_COVERAGE.csv` và `RUN_STATE.json` chung.
6. Nếu phiên bị ngắt, lưu điểm đang làm để tiếp tục chính P14; không tạo prompt mới và không coi checkpoint là hoàn thành. Nếu dependency của prompt trước vừa được hoàn tất ở đây, cập nhật các dòng coverage liên quan bằng bằng chứng mới.

**Kết thúc bằng kết quả đã làm và bằng chứng. Không kết thúc ở “bạn có muốn tôi bắt đầu không?”. Không báo toàn bộ board đạt nếu có panel bị bỏ, chưa chạy hoặc tích hợp chưa xác minh.**
