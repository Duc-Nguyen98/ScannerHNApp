# P10 — Cá nhân

**Đây là prompt triển khai. Hãy thực hiện đến khi hoàn thành toàn bộ phạm vi dưới đây; không chỉ xác nhận đã hiểu hoặc trả về kế hoạch.**

## Contract và phạm vi

Áp dụng [00_CONTRACT_CHUNG.md](00_CONTRACT_CHUNG.md), phiên bản 2.0. Nếu đã đọc trong phiên này, sử dụng quyết định và tiến độ còn hiệu lực; không hỏi lại. Nếu file chưa được cung cấp hoặc không đọc được, nêu đúng phần thiếu, không tự bịa contract.

- ID cố định: **P10/24**. Board: **Cá nhân**. Nhóm: **LEGACY_ADAPTED — đối chiếu nghiệp vụ hiện hành**.
- Mục tiêu: Dựng Cá nhân, Chỉnh sửa hồ sơ, Công việc & quyền và Tài khoản & bảo mật.
- Phụ thuộc và kết nối: P01/P02 identity; P11 đổi mật khẩu/session; P14 kết thúc ca; P15 guard.
- Tận dụng source, component và kết quả đã có. Chỉ sửa phần cần thiết cho board này và dependency trực tiếp. Không tạo prompt triển khai thứ 25, không yêu cầu tôi viết prompt con cho từng panel.

## Nguồn phải xem

- Ảnh đính kèm: [references/B10.png](references/B10.png).
- [Ảnh gốc tại commit đã đối chiếu](https://github.com/Duc-Nguyen98/ScannerHNApp/blob/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/01_UPDATED_BOARDS/08_ca_nhan.png) · [Mở ảnh trực tiếp](https://raw.githubusercontent.com/Duc-Nguyen98/ScannerHNApp/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/01_UPDATED_BOARDS/08_ca_nhan.png).
- [Tab Tất cả của gallery chính](https://duc-nguyen98.github.io/ScannerHNApp/) — chọn đúng tên board trên; không dùng gallery phụ 22 mục làm danh mục đầy đủ.
- Commit tham chiếu: `da9f623a19d0359c3e80c14f8cc612636ec6ab78`. Đường dẫn board: `design/01_Main/BOARDS/01_UPDATED_BOARDS/08_ca_nhan.png`.
- Nếu branch triển khai đã thay đổi, ghi source commit thực tế và chênh lệch liên quan; không tự đổi phạm vi hoặc thay ảnh baseline.
- Xem HANDOFF và DEV_PROPOSAL kèm trong references khi hành vi liên quan; chỉ HANDOFF chốt mới có quyền thay nghiệp vụ cũ. Proposal chưa phải API được duyệt.

## Chi tiết từng màn / trạng thái phải triển khai

Đối chiếu từng panel của ảnh; ID bên dưới dùng để kiểm kê, không bắt tạo route riêng. Không bỏ panel chỉ vì dùng lại component. Với panel cũ bị thay nghiệp vụ, lưu disposition=MIGRATED và bằng chứng thay thế.

| ID | Màn / trạng thái | Bố cục, nội dung cần dựng | Hành vi, điều kiện và kết quả |
|---|---|---|---|
| P10.S01 | Cá nhân | Header navy với avatar MA/tên/chức danh/Kho Hoa Nam; menu Chỉnh sửa hồ sơ, Công việc & quyền, Tài khoản & bảo mật, Kết thúc ca, Đăng xuất; version footer và bottom nav. | Mỗi menu đến đúng module; kết thúc ca khác đăng xuất. Không hiện version1.0.0 cứng nếu metadata build khác. |
| P10.S02 | Chỉnh sửa hồ sơ | Avatar có camera; họ tên, biệt danh, điện thoại; email/role/kho có lock và ghi chú quản trị quản lý; CTA Lưu thay đổi. | Chỉ patch field được phép; validate theo profile contract; avatar qua upload hiện có. Cancel/Back xử lý dirty state theo component chung. |
| P10.S03 | Công việc & quyền | Card vai trò/kho khóa; grid sáu quyền Nhập/Xuất/Bảo hành/NFC/Chứng từ/Tra cứu; notice quyền do quản trị viên cấp. | Read-only: tick biểu diễn quyền thật, không phải checkbox cấp quyền. Không cho đổi kho hoặc nâng quyền từ màn này. |
| P10.S04 | Tài khoản & bảo mật | Ba hàng Đổi mật khẩu, Phiên đăng nhập, Thông tin bảo mật; notice bảo vệ tài khoản. | Đổi mật khẩu/session nối P11; thông tin bảo mật chỉ nội dung đã có nguồn. Không tự thêm 2FA, OTP, sinh khóa hoặc danh sách thiết bị giả. |

## Ràng buộc hình thức riêng

Giữ avatar/hero profile, card menu icon trái chevron phải, phân biệt nút Đăng xuất đỏ, khóa field và layout grid quyền; không tạo trang quản trị RBAC trên App.

Trước khi sửa, ghi số đo có nguồn của board này: vùng nội dung, header/footer, padding/gap, font, control, radius, icon và crop ảnh. Ưu tiên CSS/component thật; số đo từ ảnh phải ghi estimated. Không áp token chung chưa được xác minh và không render cả ảnh board thành giao diện.

## Logic và dữ liệu riêng

1. Actor ID/role/warehouse/email do nguồn xác thực/quản trị quyết định; không cho client ghi lại bằng request profile.
2. Không chỉnh P01/P02 chỉ để phù hợp tên fixture profile; mọi nơi dùng cùng profile state.
3. Đăng xuất phải theo session hiện có, không xóa toàn bộ localStorage làm mất phiếu dở ngoài policy.
4. Kết thúc ca giao P14 xử lý phiếu dở; không làm alias của logout.
5. Chưa có contract chỉnh hồ sơ/avatar thì dựng UI preview và đánh dấu action tích hợp bị chặn, không giả báo đã lưu.

## Các ca nghiệm thu bắt buộc

| ID | Điều kiện đạt |
|---|---|
| P10.A01 | Lưu tên/điện thoại hợp lệ cập nhật đúng nơi và không gửi role/kho/email bị khóa. |
| P10.A02 | Tick quyền không thể thao tác để tự cấp quyền. |
| P10.A03 | Back khi chưa lưu không âm thầm gửi dữ liệu. |
| P10.A04 | Menu bảo mật/session/kết thúc ca mở đúng màn; Logout không gọi End shift giả. |
| P10.A05 | Avatar upload lỗi giữ ảnh cũ; preview fixture không ghi tài khoản thật. |

Ngoài các ca trên, capture và đối chiếu từng panel ở viewport tham chiếu hợp lệ. Kiểm tra responsive/keyboard/focus và state tương tác liên quan theo contract. Báo riêng visual, behavior và integration; fixture không đủ để đánh dấu tích hợp PASS.

## Điểm phải xác minh, không tự đoán

Họ tên/điện thoại có dấu * trong ảnh không đủ xác định policy API; kiểm nguồn và không bịa regex/length.

Chỉ chặn phần phụ thuộc quyết định chưa có; tiếp tục phần độc lập. Không tự thêm màn, quyền, API, enum hoặc quy tắc nghiệp vụ để che thông tin thiếu. Nêu câu hỏi cụ thể sau khi đã làm đủ phần khả thi.

## Thực hiện và bàn giao

1. Đọc tiến độ đã có, xác định source/target và các file liên quan. Nếu đã chạy 5 prompt cũ, giữ kết quả còn đúng. Không cài lại toàn bộ dự án hoặc quét lại asset/bundle khi đã có bằng chứng đủ.
2. Kiểm tra đủ 4 panel nêu trên, xác định component, state transition, data adapter và route/context cần nối; ghi quyết định có nguồn ngắn gọn, rồi triển khai ngay.
3. Dựng UI và hành vi cho tất cả panel trong phạm vi. Nếu chỉ có prototype, tách fixture rõ ràng; không tạo thông báo thành công production giả. Dùng lại component/adapter chung và nối dependency có sẵn.
4. Chạy các ca nghiệm thu, kiểm tra render và lệnh kiểm tra sẵn có của dự án phù hợp thay đổi. Chỉ mở rộng kiểm tra khi có rủi ro cụ thể; sửa lỗi còn trong phạm vi và kiểm lại phần bị ảnh hưởng.
5. Xuất `handoff/P10/REPORT.md`: source commit/target, file đã sửa, coverage từng P10.Sxx, kết quả P10.Axx, link ảnh actual và baseline, lệnh/kết quả thật, khác biệt còn lại và blocker. Cập nhật `SCREEN_COVERAGE.csv` và `RUN_STATE.json` chung.
6. Nếu phiên bị ngắt, lưu điểm đang làm để tiếp tục chính P10; không tạo prompt mới và không coi checkpoint là hoàn thành. Nếu dependency của prompt trước vừa được hoàn tất ở đây, cập nhật các dòng coverage liên quan bằng bằng chứng mới.

**Kết thúc bằng kết quả đã làm và bằng chứng. Không kết thúc ở “bạn có muốn tôi bắt đầu không?”. Không báo toàn bộ board đạt nếu có panel bị bỏ, chưa chạy hoặc tích hợp chưa xác minh.**
