# P19 — 17 · Xuất linh kiện bảo hành

**Đây là prompt triển khai. Hãy thực hiện đến khi hoàn thành toàn bộ phạm vi dưới đây; không chỉ xác nhận đã hiểu hoặc trả về kế hoạch.**

## Contract và phạm vi

Áp dụng [00_CONTRACT_CHUNG.md](00_CONTRACT_CHUNG.md), phiên bản 2.0. Nếu đã đọc trong phiên này, sử dụng quyết định và tiến độ còn hiệu lực; không hỏi lại. Nếu file chưa được cung cấp hoặc không đọc được, nêu đúng phần thiếu, không tự bịa contract.

- ID cố định: **P19/24**. Board: **17 · Xuất linh kiện bảo hành**. Nhóm: **CURRENT — bộ hiện hành**.
- Mục tiêu: Triển khai board gốc 17: quét linh kiện/mã hộp → nhập quantity → xác nhận xuất trực tiếp → thành công.
- Phụ thuộc và kết nối: Case P09; thành công về P20; resume P21; exception P24. Reuse editable source docs/flows/warranty-components/flow.js, các scene scan/quantity/review/success.
- Tận dụng source, component và kết quả đã có. Chỉ sửa phần cần thiết cho board này và dependency trực tiếp. Không tạo prompt triển khai thứ 25, không yêu cầu tôi viết prompt con cho từng panel.

## Nguồn phải xem

- Ảnh đính kèm: [references/B19.png](references/B19.png).
- [Ảnh gốc tại commit đã đối chiếu](https://github.com/Duc-Nguyen98/ScannerHNApp/blob/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/02_NEW_BOARDS/17_xuat_linh_kien_bao_hanh.png) · [Mở ảnh trực tiếp](https://raw.githubusercontent.com/Duc-Nguyen98/ScannerHNApp/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/02_NEW_BOARDS/17_xuat_linh_kien_bao_hanh.png).
- [Tab Tất cả của gallery chính](https://duc-nguyen98.github.io/ScannerHNApp/) — chọn đúng tên board trên; không dùng gallery phụ 22 mục làm danh mục đầy đủ.
- Commit tham chiếu: `da9f623a19d0359c3e80c14f8cc612636ec6ab78`. Đường dẫn board: `design/01_Main/BOARDS/02_NEW_BOARDS/17_xuat_linh_kien_bao_hanh.png`.
- Nếu branch triển khai đã thay đổi, ghi source commit thực tế và chênh lệch liên quan; không tự đổi phạm vi hoặc thay ảnh baseline.
- Xem HANDOFF và DEV_PROPOSAL kèm trong references khi hành vi liên quan; chỉ HANDOFF chốt mới có quyền thay nghiệp vụ cũ. Proposal chưa phải API được duyệt.

Các scene tương ứng panel bên dưới (fixture prototype, không phải bằng chứng backend hoạt động):

- P19.S01: [scan](https://duc-nguyen98.github.io/ScannerHNApp/flows/warranty-components/?mode=screen&scene=scan).
- P19.S02: [quantity](https://duc-nguyen98.github.io/ScannerHNApp/flows/warranty-components/?mode=screen&scene=quantity).
- P19.S03: [review](https://duc-nguyen98.github.io/ScannerHNApp/flows/warranty-components/?mode=screen&scene=review).
- P19.S04: [success](https://duc-nguyen98.github.io/ScannerHNApp/flows/warranty-components/?mode=screen&scene=success).

[Source flow.js](https://github.com/Duc-Nguyen98/ScannerHNApp/blob/da9f623a19d0359c3e80c14f8cc612636ec6ab78/docs/flows/warranty-components/flow.js) · [style.css](https://github.com/Duc-Nguyen98/ScannerHNApp/blob/da9f623a19d0359c3e80c14f8cc612636ec6ab78/docs/flows/warranty-components/style.css) · [HANDOFF](https://github.com/Duc-Nguyen98/ScannerHNApp/blob/da9f623a19d0359c3e80c14f8cc612636ec6ab78/docs/flows/warranty-components/HANDOFF.md).

## Chi tiết từng màn / trạng thái phải triển khai

Đối chiếu từng panel của ảnh; ID bên dưới dùng để kiểm kê, không bắt tạo route riêng. Không bỏ panel chỉ vì dùng lại component. Với panel cũ bị thay nghiệp vụ, lưu disposition=MIGRATED và bằng chứng thay thế.

| ID | Màn / trạng thái | Bố cục, nội dung cần dựng | Hành vi, điều kiện và kết quả |
|---|---|---|---|
| P19.S01 | Quét linh kiện / mã hộp — scan | Header Xuất linh kiện bảo hành, stepper Quét mã/Kiểm tra/Kết quả, context BH-001; camera ảnh kệ kho, Bật đèn/Nhập mã, count mã và last accepted; note chỉ thêm vào danh sách; CTA Kiểm tra linh kiện. | Tem đơn LK0001-HN001 → qty1; mã hộp BOX-LK-0002-01 mở quantity sheet. Khi chưa có dòng, CTA review disabled; no stock mutation khi quét. |
| P19.S02 | Nhập số lượng hộp — quantity | Sheet có grip/X, SKU LK-0002 Adapter nguồn24V, mã hộp, tồn khả dụng12; input stepper mặc định2, helper và Xác nhận số lượng/Hủy. | Chỉ số nguyên dương, không vượt tồn nếu server cung cấp; confirm thêm/cập nhật đúng dòng pending. Hủy không thay accepted list. Chưa Post. |
| P19.S03 | Xác nhận xuất linh kiện — review | Stepper bước2; context BH-001, kho khóa; hai cards linh kiện/mã hộp có qty1/2 và action bỏ nếu được phép; footer2 mã/hộp, tổng3 linh kiện; CTA Xác nhận xuất linh kiện. | Validation lại tồn/quyền/trạng thái case; dòng server recorded không được bỏ tùy ý. Submit theo API thật; khóa double submit và kiểm unknown theo P21. |
| P19.S04 | Xuất thành công — success | Stepper bước3, check xanh, Đã xuất; tóm tắt XLK-0002/BH-001/2 mã/3 linh kiện; Về hồ sơ bảo hành. | Chỉ vào khi backend xác nhận Post; cập nhật nguồn lịch sử P20 và tồn từ phản hồi/refetch. Không tạo success chỉ vì click hoặc request đang gửi. |

## Ràng buộc hình thức riêng

Theo CSS prototype Public Sans, palette teal, phone reference390×844 CSS px khi mode=screen; không áp phone shell/board caption vào app thật. Giữ stepper, section hierarchy, bottom sheet và footer tổng/CTA.

Trước khi sửa, ghi số đo có nguồn của board này: vùng nội dung, header/footer, padding/gap, font, control, radius, icon và crop ảnh. Ưu tiên CSS/component thật; số đo từ ảnh phải ghi estimated. Không áp token chung chưa được xác minh và không render cả ảnh board thành giao diện.

## Logic và dữ liệu riêng

1. Đây là ngoại lệ Post trực tiếp trên App, KHÔNG đổi thành Gửi phiếu lên Web như nhập/xuất chính.
2. 2 mã/hộp khác tổng3 linh kiện; quantity phải sum dòng, không dùng length list.
3. Một kho; khóa warehouse sau mã đầu; không có switch kho.
4. Thêm/bỏ item chưa xác nhận và dòng đã ghi nhận server có quyền khác nhau; reuse P21 guard.
5. Nếu chỉ triển khai prototype, giữ fixture và ghi rõ DEMO; tích hợp production không dùng namespace localStorage preview làm backend.

## Các ca nghiệm thu bắt buộc

| ID | Điều kiện đạt |
|---|---|
| P19.A01 | Fixture tem đơn1 + hộp2 cho2 mã/3 linh kiện xuyên suốt review/success. |
| P19.A02 | Quantity0/âm/thập phân/không phải số/13 khi tồn12 bị từ chối; hủy sheet không thêm dòng. |
| P19.A03 | Review rỗng không submit; double click không tạo hai Post. |
| P19.A04 | Response lỗi/timeout không mở success; unknown đi kiểm kết quả. |
| P19.A05 | Post xác nhận mới hiện Đã xuất; case đóng chặn qua P24. |

Ngoài các ca trên, capture và đối chiếu từng panel ở viewport tham chiếu hợp lệ. Kiểm tra responsive/keyboard/focus và state tương tác liên quan theo contract. Báo riêng visual, behavior và integration; fixture không đủ để đánh dấu tích hợp PASS.

## Điểm phải xác minh, không tự đoán

Source prototype có action fake/fixture phục vụ demo; dùng để hiểu tương tác, không coi setTimeout hoặc localStorage là bằng chứng backend đã Post.

Chỉ chặn phần phụ thuộc quyết định chưa có; tiếp tục phần độc lập. Không tự thêm màn, quyền, API, enum hoặc quy tắc nghiệp vụ để che thông tin thiếu. Nêu câu hỏi cụ thể sau khi đã làm đủ phần khả thi.

## Thực hiện và bàn giao

1. Đọc tiến độ đã có, xác định source/target và các file liên quan. Nếu đã chạy 5 prompt cũ, giữ kết quả còn đúng. Không cài lại toàn bộ dự án hoặc quét lại asset/bundle khi đã có bằng chứng đủ.
2. Kiểm tra đủ 4 panel nêu trên, xác định component, state transition, data adapter và route/context cần nối; ghi quyết định có nguồn ngắn gọn, rồi triển khai ngay.
3. Dựng UI và hành vi cho tất cả panel trong phạm vi. Nếu chỉ có prototype, tách fixture rõ ràng; không tạo thông báo thành công production giả. Dùng lại component/adapter chung và nối dependency có sẵn.
4. Chạy các ca nghiệm thu, kiểm tra render và lệnh kiểm tra sẵn có của dự án phù hợp thay đổi. Chỉ mở rộng kiểm tra khi có rủi ro cụ thể; sửa lỗi còn trong phạm vi và kiểm lại phần bị ảnh hưởng.
5. Xuất `handoff/P19/REPORT.md`: source commit/target, file đã sửa, coverage từng P19.Sxx, kết quả P19.Axx, link ảnh actual và baseline, lệnh/kết quả thật, khác biệt còn lại và blocker. Cập nhật `SCREEN_COVERAGE.csv` và `RUN_STATE.json` chung.
6. Nếu phiên bị ngắt, lưu điểm đang làm để tiếp tục chính P19; không tạo prompt mới và không coi checkpoint là hoàn thành. Nếu dependency của prompt trước vừa được hoàn tất ở đây, cập nhật các dòng coverage liên quan bằng bằng chứng mới.

**Kết thúc bằng kết quả đã làm và bằng chứng. Không kết thúc ở “bạn có muốn tôi bắt đầu không?”. Không báo toàn bộ board đạt nếu có panel bị bỏ, chưa chạy hoặc tích hợp chưa xác minh.**
