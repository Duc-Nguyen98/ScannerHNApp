# P21 — 19 · Tiếp tục phiếu linh kiện

**Đây là prompt triển khai. Hãy thực hiện đến khi hoàn thành toàn bộ phạm vi dưới đây; không chỉ xác nhận đã hiểu hoặc trả về kế hoạch.**

## Contract và phạm vi

Áp dụng [00_CONTRACT_CHUNG.md](00_CONTRACT_CHUNG.md), phiên bản 2.0. Nếu đã đọc trong phiên này, sử dụng quyết định và tiến độ còn hiệu lực; không hỏi lại. Nếu file chưa được cung cấp hoặc không đọc được, nêu đúng phần thiếu, không tự bịa contract.

- ID cố định: **P21/24**. Board: **19 · Tiếp tục phiếu linh kiện**. Nhóm: **CURRENT — bộ hiện hành**.
- Mục tiêu: Triển khai board gốc19: phiếu dở, resume đúng phiếu, đối chiếu Web và kiểm tra kết quả xuất.
- Phụ thuộc và kết nối: P03 draft dialog; P19 scan/review/Post; P20 lịch sử; P22 shortcut phiếu dở.
- Tận dụng source, component và kết quả đã có. Chỉ sửa phần cần thiết cho board này và dependency trực tiếp. Không tạo prompt triển khai thứ 25, không yêu cầu tôi viết prompt con cho từng panel.

## Nguồn phải xem

- Ảnh đính kèm: [references/B21.png](references/B21.png).
- [Ảnh gốc tại commit đã đối chiếu](https://github.com/Duc-Nguyen98/ScannerHNApp/blob/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/02_NEW_BOARDS/19_tiep_tuc_phieu_linh_kien.png) · [Mở ảnh trực tiếp](https://raw.githubusercontent.com/Duc-Nguyen98/ScannerHNApp/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/02_NEW_BOARDS/19_tiep_tuc_phieu_linh_kien.png).
- [Tab Tất cả của gallery chính](https://duc-nguyen98.github.io/ScannerHNApp/) — chọn đúng tên board trên; không dùng gallery phụ 22 mục làm danh mục đầy đủ.
- Commit tham chiếu: `da9f623a19d0359c3e80c14f8cc612636ec6ab78`. Đường dẫn board: `design/01_Main/BOARDS/02_NEW_BOARDS/19_tiep_tuc_phieu_linh_kien.png`.
- Nếu branch triển khai đã thay đổi, ghi source commit thực tế và chênh lệch liên quan; không tự đổi phạm vi hoặc thay ảnh baseline.
- Xem HANDOFF và DEV_PROPOSAL kèm trong references khi hành vi liên quan; chỉ HANDOFF chốt mới có quyền thay nghiệp vụ cũ. Proposal chưa phải API được duyệt.

Các scene tương ứng panel bên dưới (fixture prototype, không phải bằng chứng backend hoạt động):

- P21.S01: [drafts](https://duc-nguyen98.github.io/ScannerHNApp/flows/warranty-components/?mode=screen&scene=drafts).
- P21.S02: [resume](https://duc-nguyen98.github.io/ScannerHNApp/flows/warranty-components/?mode=screen&scene=resume).
- P21.S03: [reconcile](https://duc-nguyen98.github.io/ScannerHNApp/flows/warranty-components/?mode=screen&scene=reconcile).
- P21.S04: [post-check](https://duc-nguyen98.github.io/ScannerHNApp/flows/warranty-components/?mode=screen&scene=post-check).

[Source flow.js](https://github.com/Duc-Nguyen98/ScannerHNApp/blob/da9f623a19d0359c3e80c14f8cc612636ec6ab78/docs/flows/warranty-components/flow.js) · [style.css](https://github.com/Duc-Nguyen98/ScannerHNApp/blob/da9f623a19d0359c3e80c14f8cc612636ec6ab78/docs/flows/warranty-components/style.css) · [HANDOFF](https://github.com/Duc-Nguyen98/ScannerHNApp/blob/da9f623a19d0359c3e80c14f8cc612636ec6ab78/docs/flows/warranty-components/HANDOFF.md).

## Chi tiết từng màn / trạng thái phải triển khai

Đối chiếu từng panel của ảnh; ID bên dưới dùng để kiểm kê, không bắt tạo route riêng. Không bỏ panel chỉ vì dùng lại component. Với panel cũ bị thay nghiệp vụ, lưu disposition=MIGRATED và bằng chứng thay thế.

| ID | Màn / trạng thái | Bố cục, nội dung cần dựng | Hành vi, điều kiện và kết quả |
|---|---|---|---|
| P21.S01 | Phiếu đang thực hiện — drafts | Header, badge1 phiếu; card XLK-0002/BH-001/kho/thời gian, đã lưu1 mã1 linh kiện; notice phiếu đã xuất chỉ xem lịch sử. | Mở đúng document/session theo trạng thái đã lưu, không create mới. Nhiều draft nếu nguồn có phải render bằng data, không hardcode một. |
| P21.S02 | Tiếp tục đúng phiếu — resume | Context case/phiếu chưa xuất, kho khóa; danh sách mã đã lưu với lock và badge Đã lưu trên phiếu; checklist đã tải/xác minh/chưa xuất; Tiếp tục quét/Kiểm tra phiếu. | Tải lại version/lines/checkpoint từ nguồn thật. Chỉ mở scan khi dữ liệu được xác minh; recorded line không xóa tùy ý. Không cần scan lại mã cũ. |
| P21.S03 | Cần đối chiếu trên Web — reconcile | Icon monitor/cảnh báo chưa xác minh mã; summary phiếu/case/kho/lần lưu; Hướng dẫn đối chiếu và Về phiếu đang thực hiện. | Giữ nguyên phiếu và mã; chặn scan/gửi lại khi unknown. Hướng dẫn theo URL được cấu hình hoặc text có nguồn; không auto-repair/create phiếu bù. |
| P21.S04 | Kiểm tra kết quả xuất — post-check | Icon clock; thông báo yêu cầu đã gửi, không gửi lại; summary XLK-0002/BH-001/2 mã/3 linh kiện; Kiểm tra kết quả/Đối chiếu trên Web. | Tra trạng thái bằng khóa hợp lệ. POSTED→success/history; chưa rõ→ở lại; xác nhận chưa Post xử lý theo contract, không retry mù. |

## Ràng buộc hình thức riêng

Phân biệt amber phiếu dở, lock dòng đã lưu, checkpoint tick có ý nghĩa nguồn; trạng thái unknown không dùng check xanh. Summary giữ rõ cùng một ID.

Trước khi sửa, ghi số đo có nguồn của board này: vùng nội dung, header/footer, padding/gap, font, control, radius, icon và crop ảnh. Ưu tiên CSS/component thật; số đo từ ảnh phải ghi estimated. Không áp token chung chưa được xác minh và không render cả ảnh board thành giao diện.

## Logic và dữ liệu riêng

1. documentId, version, codes, scan checkpoint phải được giữ xuyên đóng/mở theo cơ chế đã chốt.
2. Không coi cache có dữ liệu là server đã xác minh; tick VERIFICATION chỉ khi có evidence.
3. Resume không tạo lại phiếu hoặc gửi lại mã recorded; conflict version cần tải/đối chiếu thay vì ghi đè.
4. Auth_session khác scan_session; không lưu token vào checkpoint hoặc hình chụp evidence.
5. Post đã thành công không cho quay về scan như draft; chỉ đọc lịch sử.

## Các ca nghiệm thu bắt buộc

| ID | Điều kiện đạt |
|---|---|
| P21.A01 | Đóng/mở lại giữ XLK-0002 và mã đã xác minh; API create không bị gọi lại. |
| P21.A02 | Recorded line không bị xóa trong resume/review. |
| P21.A03 | UNKNOWN→reconcile chặn scan/resubmit và không mất local/server reference. |
| P21.A04 | Timeout Post→check status, thấy POSTED mở kết quả đúng một giao dịch. |
| P21.A05 | Version conflict/case đóng không tiếp tục scan; log không chứa secret. |

Ngoài các ca trên, capture và đối chiếu từng panel ở viewport tham chiếu hợp lệ. Kiểm tra responsive/keyboard/focus và state tương tác liên quan theo contract. Báo riêng visual, behavior và integration; fixture không đủ để đánh dấu tích hợp PASS.

## Điểm phải xác minh, không tự đoán

Cơ chế checkpoint ở đây là dữ liệu nghiệp vụ trong app, khác file ghi tiến độ của AI. Không dùng file RUN_STATE của agent làm nguồn draft người dùng.

Chỉ chặn phần phụ thuộc quyết định chưa có; tiếp tục phần độc lập. Không tự thêm màn, quyền, API, enum hoặc quy tắc nghiệp vụ để che thông tin thiếu. Nêu câu hỏi cụ thể sau khi đã làm đủ phần khả thi.

## Thực hiện và bàn giao

1. Đọc tiến độ đã có, xác định source/target và các file liên quan. Nếu đã chạy 5 prompt cũ, giữ kết quả còn đúng. Không cài lại toàn bộ dự án hoặc quét lại asset/bundle khi đã có bằng chứng đủ.
2. Kiểm tra đủ 4 panel nêu trên, xác định component, state transition, data adapter và route/context cần nối; ghi quyết định có nguồn ngắn gọn, rồi triển khai ngay.
3. Dựng UI và hành vi cho tất cả panel trong phạm vi. Nếu chỉ có prototype, tách fixture rõ ràng; không tạo thông báo thành công production giả. Dùng lại component/adapter chung và nối dependency có sẵn.
4. Chạy các ca nghiệm thu, kiểm tra render và lệnh kiểm tra sẵn có của dự án phù hợp thay đổi. Chỉ mở rộng kiểm tra khi có rủi ro cụ thể; sửa lỗi còn trong phạm vi và kiểm lại phần bị ảnh hưởng.
5. Xuất `handoff/P21/REPORT.md`: source commit/target, file đã sửa, coverage từng P21.Sxx, kết quả P21.Axx, link ảnh actual và baseline, lệnh/kết quả thật, khác biệt còn lại và blocker. Cập nhật `SCREEN_COVERAGE.csv` và `RUN_STATE.json` chung.
6. Nếu phiên bị ngắt, lưu điểm đang làm để tiếp tục chính P21; không tạo prompt mới và không coi checkpoint là hoàn thành. Nếu dependency của prompt trước vừa được hoàn tất ở đây, cập nhật các dòng coverage liên quan bằng bằng chứng mới.

**Kết thúc bằng kết quả đã làm và bằng chứng. Không kết thúc ở “bạn có muốn tôi bắt đầu không?”. Không báo toàn bộ board đạt nếu có panel bị bỏ, chưa chạy hoặc tích hợp chưa xác minh.**
