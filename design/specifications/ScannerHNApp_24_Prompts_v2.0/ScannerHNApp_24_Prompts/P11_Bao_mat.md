# P11 — Bảo mật

**Đây là prompt triển khai. Hãy thực hiện đến khi hoàn thành toàn bộ phạm vi dưới đây; không chỉ xác nhận đã hiểu hoặc trả về kế hoạch.**

## Contract và phạm vi

Áp dụng [00_CONTRACT_CHUNG.md](00_CONTRACT_CHUNG.md), phiên bản 2.0. Nếu đã đọc trong phiên này, sử dụng quyết định và tiến độ còn hiệu lực; không hỏi lại. Nếu file chưa được cung cấp hoặc không đọc được, nêu đúng phần thiếu, không tự bịa contract.

- ID cố định: **P11/24**. Board: **Bảo mật**. Nhóm: **LEGACY_ADAPTED — đối chiếu nghiệp vụ hiện hành**.
- Mục tiêu: Dựng đổi mật khẩu, validation mismatch, kết quả thành công và phiên đăng nhập.
- Phụ thuộc và kết nối: P10 trang tài khoản; P01 auth; P15 phiên hết hạn.
- Tận dụng source, component và kết quả đã có. Chỉ sửa phần cần thiết cho board này và dependency trực tiếp. Không tạo prompt triển khai thứ 25, không yêu cầu tôi viết prompt con cho từng panel.

## Nguồn phải xem

- Ảnh đính kèm: [references/B11.png](references/B11.png).
- [Ảnh gốc tại commit đã đối chiếu](https://github.com/Duc-Nguyen98/ScannerHNApp/blob/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/01_UPDATED_BOARDS/09_bao_mat.png) · [Mở ảnh trực tiếp](https://raw.githubusercontent.com/Duc-Nguyen98/ScannerHNApp/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/01_UPDATED_BOARDS/09_bao_mat.png).
- [Tab Tất cả của gallery chính](https://duc-nguyen98.github.io/ScannerHNApp/) — chọn đúng tên board trên; không dùng gallery phụ 22 mục làm danh mục đầy đủ.
- Commit tham chiếu: `da9f623a19d0359c3e80c14f8cc612636ec6ab78`. Đường dẫn board: `design/01_Main/BOARDS/01_UPDATED_BOARDS/09_bao_mat.png`.
- Nếu branch triển khai đã thay đổi, ghi source commit thực tế và chênh lệch liên quan; không tự đổi phạm vi hoặc thay ảnh baseline.
- Xem HANDOFF và DEV_PROPOSAL kèm trong references khi hành vi liên quan; chỉ HANDOFF chốt mới có quyền thay nghiệp vụ cũ. Proposal chưa phải API được duyệt.

## Chi tiết từng màn / trạng thái phải triển khai

Đối chiếu từng panel của ảnh; ID bên dưới dùng để kiểm kê, không bắt tạo route riêng. Không bỏ panel chỉ vì dùng lại component. Với panel cũ bị thay nghiệp vụ, lưu disposition=MIGRATED và bằng chứng thay thế.

| ID | Màn / trạng thái | Bố cục, nội dung cần dựng | Hành vi, điều kiện và kết quả |
|---|---|---|---|
| P11.S01 | Đổi mật khẩu | Header/back; mô tả theo chính sách hệ thống; ba input mật khẩu hiện tại, mật khẩu mới, xác nhận mới với nút mắt; hint và CTA Lưu mật khẩu. | Bắt buộc đúng policy backend; mắt độc lập theo field; submit chỉ khi form hợp lệ. Không trim, normalize hoặc ghi log password. |
| P11.S02 | Xác thực thông tin — lỗi | Giữ nguyên form, viền đỏ tại xác nhận mật khẩu và dòng Mật khẩu xác nhận chưa khớp. | Mismatch được kiểm cục bộ, focus/aria-error đúng input; sửa khớp thì xóa lỗi phù hợp. Sai mật khẩu hiện tại là lỗi server riêng, không đổi thành mismatch. |
| P11.S03 | Đã đổi mật khẩu | Check xanh, copy mật khẩu đã cập nhật, card tài khoản/kho/thời gian; CTA Tài khoản & bảo mật. | Chỉ hiện khi đổi thật thành công. Chính sách hủy phiên hoặc yêu cầu đăng nhập lại lấy từ auth contract; không tự quyết giữ/xóa mọi session. |
| P11.S04 | Phiên đăng nhập | Thiết bị hiện tại, OS/app/thời gian/vị trí nếu có; thiết bị khác với CTA Đăng xuất từ xa. | Dùng session ID từ backend, tách current session; revoke đúng phiên được chọn và xác minh kết quả. Không dùng user-agent tự suy để tạo danh sách thiết bị thật. |

## Ràng buộc hình thức riêng

Giữ ba input cao/bo góc theo mẫu, eye icon, khoảng trắng và CTA đáy; hai nhóm thiết bị rõ ràng. Không dựng form đổi mật khẩu bằng ảnh hoặc text type thay password.

Trước khi sửa, ghi số đo có nguồn của board này: vùng nội dung, header/footer, padding/gap, font, control, radius, icon và crop ảnh. Ưu tiên CSS/component thật; số đo từ ảnh phải ghi estimated. Không áp token chung chưa được xác minh và không render cả ảnh board thành giao diện.

## Logic và dữ liệu riêng

1. Không tự đặt min8/regex phức tạp hoặc yêu cầu đổi định kỳ khi nguồn chưa nêu.
2. Không lưu password trong log, báo cáo, checkpoint hay localStorage; fixture không dùng credential thật.
3. Không suy vị trí chính xác từ IP/device nếu backend không cung cấp; field thiếu không tự điền Hà Nội.
4. Phiên đăng nhập không phải phiên quét P23; không dùng auth token làm ID hiển thị.
5. Quản lý phiên được README đánh dấu cần chốt cơ chế: thiếu API revoke phải ghi blocker, không xóa dòng UI giả làm đăng xuất.

## Các ca nghiệm thu bắt buộc

| ID | Điều kiện đạt |
|---|---|
| P11.A01 | Mật khẩu xác nhận khác → lỗi đúng field, không gọi submit. |
| P11.A02 | Eye không đổi input value; không làm lộ password ở summary/log. |
| P11.A03 | Server từ chối → không mở success; double-submit bị khóa trong lúc gửi. |
| P11.A04 | Revoke phiên khác không tự revoke current; lỗi revoke giữ dòng và báo lỗi. |
| P11.A05 | Policy phiên sau đổi mật khẩu có evidence, không tự bỏ qua route guard. |

Ngoài các ca trên, capture và đối chiếu từng panel ở viewport tham chiếu hợp lệ. Kiểm tra responsive/keyboard/focus và state tương tác liên quan theo contract. Báo riêng visual, behavior và integration; fixture không đủ để đánh dấu tích hợp PASS.

## Điểm phải xác minh, không tự đoán

Chỉ dựng/test tính năng bằng tài khoản fixture/test được cấp; prompt không yêu cầu agent đổi mật khẩu tài khoản cá nhân thật của người dùng.

Chỉ chặn phần phụ thuộc quyết định chưa có; tiếp tục phần độc lập. Không tự thêm màn, quyền, API, enum hoặc quy tắc nghiệp vụ để che thông tin thiếu. Nêu câu hỏi cụ thể sau khi đã làm đủ phần khả thi.

## Thực hiện và bàn giao

1. Đọc tiến độ đã có, xác định source/target và các file liên quan. Nếu đã chạy 5 prompt cũ, giữ kết quả còn đúng. Không cài lại toàn bộ dự án hoặc quét lại asset/bundle khi đã có bằng chứng đủ.
2. Kiểm tra đủ 4 panel nêu trên, xác định component, state transition, data adapter và route/context cần nối; ghi quyết định có nguồn ngắn gọn, rồi triển khai ngay.
3. Dựng UI và hành vi cho tất cả panel trong phạm vi. Nếu chỉ có prototype, tách fixture rõ ràng; không tạo thông báo thành công production giả. Dùng lại component/adapter chung và nối dependency có sẵn.
4. Chạy các ca nghiệm thu, kiểm tra render và lệnh kiểm tra sẵn có của dự án phù hợp thay đổi. Chỉ mở rộng kiểm tra khi có rủi ro cụ thể; sửa lỗi còn trong phạm vi và kiểm lại phần bị ảnh hưởng.
5. Xuất `handoff/P11/REPORT.md`: source commit/target, file đã sửa, coverage từng P11.Sxx, kết quả P11.Axx, link ảnh actual và baseline, lệnh/kết quả thật, khác biệt còn lại và blocker. Cập nhật `SCREEN_COVERAGE.csv` và `RUN_STATE.json` chung.
6. Nếu phiên bị ngắt, lưu điểm đang làm để tiếp tục chính P11; không tạo prompt mới và không coi checkpoint là hoàn thành. Nếu dependency của prompt trước vừa được hoàn tất ở đây, cập nhật các dòng coverage liên quan bằng bằng chứng mới.

**Kết thúc bằng kết quả đã làm và bằng chứng. Không kết thúc ở “bạn có muốn tôi bắt đầu không?”. Không báo toàn bộ board đạt nếu có panel bị bỏ, chưa chạy hoặc tích hợp chưa xác minh.**
