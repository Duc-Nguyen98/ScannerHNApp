# P16 — Dữ liệu quyết lỗi

**Đây là prompt triển khai. Hãy thực hiện đến khi hoàn thành toàn bộ phạm vi dưới đây; không chỉ xác nhận đã hiểu hoặc trả về kế hoạch.**

## Contract và phạm vi

Áp dụng [00_CONTRACT_CHUNG.md](00_CONTRACT_CHUNG.md), phiên bản 2.0. Nếu đã đọc trong phiên này, sử dụng quyết định và tiến độ còn hiệu lực; không hỏi lại. Nếu file chưa được cung cấp hoặc không đọc được, nêu đúng phần thiếu, không tự bịa contract.

- ID cố định: **P16/24**. Board: **Dữ liệu quyết lỗi**. Nhóm: **LEGACY_ADAPTED — đối chiếu nghiệp vụ hiện hành**.
- Mục tiêu: Dựng bốn trạng thái dữ liệu của danh sách chứng từ; tên gallery là 'Dữ liệu quyết lỗi', dùng tên này để map board, không coi đó là copy phải đưa vào UI.
- Phụ thuộc và kết nối: P12 danh sách chứng từ; dùng pattern cho list khác khi không đổi baseline; P15 lỗi auth/network đặc thù.
- Tận dụng source, component và kết quả đã có. Chỉ sửa phần cần thiết cho board này và dependency trực tiếp. Không tạo prompt triển khai thứ 25, không yêu cầu tôi viết prompt con cho từng panel.

## Nguồn phải xem

- Ảnh đính kèm: [references/B16.png](references/B16.png).
- [Ảnh gốc tại commit đã đối chiếu](https://github.com/Duc-Nguyen98/ScannerHNApp/blob/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/02_NEW_BOARDS/14_du_lieu_quyet_loi_fixed.png) · [Mở ảnh trực tiếp](https://raw.githubusercontent.com/Duc-Nguyen98/ScannerHNApp/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/02_NEW_BOARDS/14_du_lieu_quyet_loi_fixed.png).
- [Tab Tất cả của gallery chính](https://duc-nguyen98.github.io/ScannerHNApp/) — chọn đúng tên board trên; không dùng gallery phụ 22 mục làm danh mục đầy đủ.
- Commit tham chiếu: `da9f623a19d0359c3e80c14f8cc612636ec6ab78`. Đường dẫn board: `design/01_Main/BOARDS/02_NEW_BOARDS/14_du_lieu_quyet_loi_fixed.png`.
- Nếu branch triển khai đã thay đổi, ghi source commit thực tế và chênh lệch liên quan; không tự đổi phạm vi hoặc thay ảnh baseline.
- Xem HANDOFF và DEV_PROPOSAL kèm trong references khi hành vi liên quan; chỉ HANDOFF chốt mới có quyền thay nghiệp vụ cũ. Proposal chưa phải API được duyệt.

## Chi tiết từng màn / trạng thái phải triển khai

Đối chiếu từng panel của ảnh; ID bên dưới dùng để kiểm kê, không bắt tạo route riêng. Không bỏ panel chỉ vì dùng lại component. Với panel cũ bị thay nghiệp vụ, lưu disposition=MIGRATED và bằng chứng thay thế.

| ID | Màn / trạng thái | Bố cục, nội dung cần dựng | Hành vi, điều kiện và kết quả |
|---|---|---|---|
| P16.S01 | Đang tải chứng từ | Giữ header/search/tabs/bottom nav; skeleton card có avatar/text/badge và spinner/Đang tải chứng từ. | Đang chờ lần tải đầu, chưa kết luận empty. aria-busy/status phù hợp; không gọi spinner vô hạn khi có lỗi. |
| P16.S02 | Chưa có chứng từ | Empty illustration tài liệu, tiêu đề Chưa có chứng từ và CTA Tạo chứng từ. | Chỉ khi response thành công và dataset thực sự rỗng trong scope phù hợp. CTA create theo quyền, điều hướng P12/P04/P05/P09. |
| P16.S03 | Không tìm thấy kết quả | Giữ từ khóa PN-9999 trên search, copy nhắc từ khóa; Xóa bộ lọc/Sửa từ khóa. | Filtered-empty khác dataset-empty. Clear filter và chỉnh query theo hành vi đã định nghĩa; không tự xóa dữ liệu hoặc tạo phiếu mới. |
| P16.S04 | Không tải được dữ liệu | Cloud/error illustration, mô tả dữ liệu chưa cập nhật, Thử lại, mã lỗi nếu nguồn cung cấp. | Retry đúng truy vấn hiện tại; không hiển thị mã HN-ERR-01 giả trong production. Nếu đã có dữ liệu trước đó, giữ dữ liệu cũ khi phù hợp và báo stale/error theo component sẵn có. |

## Ràng buộc hình thức riêng

Giữ vùng controls và kích thước list giữa bốn state để tránh layout nhảy; skeleton không giả làm dữ liệu; khối empty/error căn theo vùng nội dung chứ không đè bottom nav.

Trước khi sửa, ghi số đo có nguồn của board này: vùng nội dung, header/footer, padding/gap, font, control, radius, icon và crop ảnh. Ưu tiên CSS/component thật; số đo từ ảnh phải ghi estimated. Không áp token chung chưa được xác minh và không render cả ảnh board thành giao diện.

## Logic và dữ liệu riêng

1. Chỉ xử lý UI state data, không tạo API chứng từ thứ hai.
2. Response lỗi/timeout/null chưa xác định không được map thành []; tránh kết luận 'không có chứng từ'.
3. Phân biệt initial loading với load-more ở P20; không dùng màn skeleton toàn trang cho lỗi trang tiếp theo.
4. Race giữa query A/B không cho response cũ ghi đè query mới.
5. CTA tạo mới không cấp quyền viết cho tài khoản chỉ xem.

## Các ca nghiệm thu bắt buộc

| ID | Điều kiện đạt |
|---|---|
| P16.A01 | Delay → loading; success[] → empty; filter không khớp → no-results; reject → error, không lẫn bốn state. |
| P16.A02 | Thử lại giữ filters và chỉ gửi một request pending. |
| P16.A03 | Clear filter phục hồi list đúng, sửa từ khóa focus input. |
| P16.A04 | Response đến sai thứ tự không đổi kết quả truy vấn hiện tại. |
| P16.A05 | Account read-only không tạo chứng từ từ empty state; keyboard/screen reader nhận status. |

Ngoài các ca trên, capture và đối chiếu từng panel ở viewport tham chiếu hợp lệ. Kiểm tra responsive/keyboard/focus và state tương tác liên quan theo contract. Báo riêng visual, behavior và integration; fixture không đủ để đánh dấu tích hợp PASS.

## Điểm phải xác minh, không tự đoán

Không tự triển khai spinner toàn ứng dụng hoặc thay state của màn khóa khi chỉ cần component list.

Chỉ chặn phần phụ thuộc quyết định chưa có; tiếp tục phần độc lập. Không tự thêm màn, quyền, API, enum hoặc quy tắc nghiệp vụ để che thông tin thiếu. Nêu câu hỏi cụ thể sau khi đã làm đủ phần khả thi.

## Thực hiện và bàn giao

1. Đọc tiến độ đã có, xác định source/target và các file liên quan. Nếu đã chạy 5 prompt cũ, giữ kết quả còn đúng. Không cài lại toàn bộ dự án hoặc quét lại asset/bundle khi đã có bằng chứng đủ.
2. Kiểm tra đủ 4 panel nêu trên, xác định component, state transition, data adapter và route/context cần nối; ghi quyết định có nguồn ngắn gọn, rồi triển khai ngay.
3. Dựng UI và hành vi cho tất cả panel trong phạm vi. Nếu chỉ có prototype, tách fixture rõ ràng; không tạo thông báo thành công production giả. Dùng lại component/adapter chung và nối dependency có sẵn.
4. Chạy các ca nghiệm thu, kiểm tra render và lệnh kiểm tra sẵn có của dự án phù hợp thay đổi. Chỉ mở rộng kiểm tra khi có rủi ro cụ thể; sửa lỗi còn trong phạm vi và kiểm lại phần bị ảnh hưởng.
5. Xuất `handoff/P16/REPORT.md`: source commit/target, file đã sửa, coverage từng P16.Sxx, kết quả P16.Axx, link ảnh actual và baseline, lệnh/kết quả thật, khác biệt còn lại và blocker. Cập nhật `SCREEN_COVERAGE.csv` và `RUN_STATE.json` chung.
6. Nếu phiên bị ngắt, lưu điểm đang làm để tiếp tục chính P16; không tạo prompt mới và không coi checkpoint là hoàn thành. Nếu dependency của prompt trước vừa được hoàn tất ở đây, cập nhật các dòng coverage liên quan bằng bằng chứng mới.

**Kết thúc bằng kết quả đã làm và bằng chứng. Không kết thúc ở “bạn có muốn tôi bắt đầu không?”. Không báo toàn bộ board đạt nếu có panel bị bỏ, chưa chạy hoặc tích hợp chưa xác minh.**
