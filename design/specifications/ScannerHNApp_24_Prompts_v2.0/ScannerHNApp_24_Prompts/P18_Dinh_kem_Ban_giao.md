# P18 — Đính kèm bàn giao

**Đây là prompt triển khai. Hãy thực hiện đến khi hoàn thành toàn bộ phạm vi dưới đây; không chỉ xác nhận đã hiểu hoặc trả về kế hoạch.**

## Contract và phạm vi

Áp dụng [00_CONTRACT_CHUNG.md](00_CONTRACT_CHUNG.md), phiên bản 2.0. Nếu đã đọc trong phiên này, sử dụng quyết định và tiến độ còn hiệu lực; không hỏi lại. Nếu file chưa được cung cấp hoặc không đọc được, nêu đúng phần thiếu, không tự bịa contract.

- ID cố định: **P18/24**. Board: **Đính kèm bàn giao**. Nhóm: **LEGACY_ADAPTED — đối chiếu nghiệp vụ hiện hành**.
- Mục tiêu: Bao phủ đủ bốn panel: danh sách tệp, viewer, bàn giao bảo hành và vị trí linh kiện; không bỏ panel cuối vì tên board chỉ nói đính kèm/bàn giao.
- Phụ thuộc và kết nối: P12 document; P09 warranty; P06 item/location; nguồn upload/file/download và contract handoff.
- Tận dụng source, component và kết quả đã có. Chỉ sửa phần cần thiết cho board này và dependency trực tiếp. Không tạo prompt triển khai thứ 25, không yêu cầu tôi viết prompt con cho từng panel.

## Nguồn phải xem

- Ảnh đính kèm: [references/B18.png](references/B18.png).
- [Ảnh gốc tại commit đã đối chiếu](https://github.com/Duc-Nguyen98/ScannerHNApp/blob/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/02_NEW_BOARDS/16_dinh_kem_ban_giao_fixed.png) · [Mở ảnh trực tiếp](https://raw.githubusercontent.com/Duc-Nguyen98/ScannerHNApp/da9f623a19d0359c3e80c14f8cc612636ec6ab78/design/01_Main/BOARDS/02_NEW_BOARDS/16_dinh_kem_ban_giao_fixed.png).
- [Tab Tất cả của gallery chính](https://duc-nguyen98.github.io/ScannerHNApp/) — chọn đúng tên board trên; không dùng gallery phụ 22 mục làm danh mục đầy đủ.
- Commit tham chiếu: `da9f623a19d0359c3e80c14f8cc612636ec6ab78`. Đường dẫn board: `design/01_Main/BOARDS/02_NEW_BOARDS/16_dinh_kem_ban_giao_fixed.png`.
- Nếu branch triển khai đã thay đổi, ghi source commit thực tế và chênh lệch liên quan; không tự đổi phạm vi hoặc thay ảnh baseline.
- Xem HANDOFF và DEV_PROPOSAL kèm trong references khi hành vi liên quan; chỉ HANDOFF chốt mới có quyền thay nghiệp vụ cũ. Proposal chưa phải API được duyệt.

## Chi tiết từng màn / trạng thái phải triển khai

Đối chiếu từng panel của ảnh; ID bên dưới dùng để kiểm kê, không bắt tạo route riêng. Không bỏ panel chỉ vì dùng lại component. Với panel cũ bị thay nghiệp vụ, lưu disposition=MIGRATED và bằng chứng thay thế.

| ID | Màn / trạng thái | Bố cục, nội dung cần dựng | Hành vi, điều kiện và kết quả |
|---|---|---|---|
| P18.S01 | Tệp đính kèm PN-0005 | Context phiếu, bốn file mẫu: PDF sẵn sàng; ảnh upload75% có cancel; PDF lỗi có Thử lại; ảnh hoàn tất; các action Xem/Tải xuống/menu. | Bind từng attachment ID/upload task; tiến độ thật, retry đúng file. Chỉ loại/size theo policy, không tự đặt limit từ kích thước ví dụ. |
| P18.S02 | Xem tài liệu 1/2 | Metadata PDF, nội dung viewer, paginator trang1/2 với Prev/Next và CTA Tải xuống/overflow. | Render file thật trong preview/test được cấp. Không thay PDF bằng ảnh giả rồi nói đã có viewer; đổi trang giữ document/file ID. |
| P18.S03 | Bàn giao bảo hành BH-001 | Thông tin hồ sơ/sản phẩm/serial/trạng thái/kỹ thuật; linh kiện thay thế; checkbox đã kiểm tra; người nhận, ngày, ghi chú; Xác nhận bàn giao. | Được board ghi đề xuất cần chốt điều kiện đóng hồ sơ. Dựng UI/validation được xác nhận; mutation chỉ theo policy. Không tự coi tick checkbox là quyền đóng case. |
| P18.S04 | Vị trí linh kiện kho | Thông tin linh kiện, pallet/khay/kho khóa; lưới A1/A2/A3/B1/B2/B3 với selected A2, legend, chi tiết vị trí và CTA Xác nhận vị trí. | Board thể hiện occupancy/capacity nhưng chưa có schema xác nhận cho App: giữ fixture visual trong preview; production chỉ map field đã có. Không suy sức chứa/ô trống hoặc thực hiện move/unmap khi bấm. |

## Ràng buộc hình thức riêng

Giữ list file có trạng thái theo hàng, PDF viewer một trang, form handoff và grid vị trí. Số liệu 12/20,5/20,20/20,8/20,0/20,20/20 là fixture hình ảnh, không phải master capacity được chứng minh.

Trước khi sửa, ghi số đo có nguồn của board này: vùng nội dung, header/footer, padding/gap, font, control, radius, icon và crop ảnh. Ưu tiên CSS/component thật; số đo từ ảnh phải ghi estimated. Không áp token chung chưa được xác minh và không render cả ảnh board thành giao diện.

## Logic và dữ liệu riêng

1. Đính kèm PDF/JPG/PNG theo policy đã xác minh; không gửi file/tài khoản thật chỉ để test giao diện.
2. Không tự thêm delete attachment nếu menu chưa có đặc tả; cancel upload khác xóa file đã lưu.
3. Date/receiver và checklist bàn giao không tự quyết định kết thúc bảo hành; chỉ server/contract được chốt.
4. Không đem hạn chế/logic của dự án Web putaway khác vào App; cũng không mặc định App được phép thay vị trí từ ảnh cũ.
5. Vị trí/capacity nguồn chưa có phải UNKNOWN/PROPOSED, không đổi board thành kho đầy/sức chứa thật.

## Các ca nghiệm thu bắt buộc

| ID | Điều kiện đạt |
|---|---|
| P18.A01 | Upload progress/cancel/error/retry độc lập từng file, không reset cả danh sách. |
| P18.A02 | Viewer Next/Prev đúng trang, download đúng file và quyền. |
| P18.A03 | Handoff lỗi/thiếu điều kiện không đổi case thành Đã trả khách. |
| P18.A04 | Chọn ô chỉ đổi selection UI; không thay stock/location nếu mutation chưa được chốt. |
| P18.A05 | Không có source capacity thì production không hiển thị số20 như dữ liệu thật; coverage panel vị trí ghi visual/behavior theo kết quả kiểm thật, integration_status=BLOCKED và evidence nêu rõ preview fixture. |

Ngoài các ca trên, capture và đối chiếu từng panel ở viewport tham chiếu hợp lệ. Kiểm tra responsive/keyboard/focus và state tương tác liên quan theo contract. Báo riêng visual, behavior và integration; fixture không đủ để đánh dấu tích hợp PASS.

## Điểm phải xác minh, không tự đoán

Panel vị trí và bàn giao cần policy/schema cụ thể. Không loại chúng khỏi bộ24, không tự sửa nghiệp vụ để hoàn tất giả.

Chỉ chặn phần phụ thuộc quyết định chưa có; tiếp tục phần độc lập. Không tự thêm màn, quyền, API, enum hoặc quy tắc nghiệp vụ để che thông tin thiếu. Nêu câu hỏi cụ thể sau khi đã làm đủ phần khả thi.

## Thực hiện và bàn giao

1. Đọc tiến độ đã có, xác định source/target và các file liên quan. Nếu đã chạy 5 prompt cũ, giữ kết quả còn đúng. Không cài lại toàn bộ dự án hoặc quét lại asset/bundle khi đã có bằng chứng đủ.
2. Kiểm tra đủ 4 panel nêu trên, xác định component, state transition, data adapter và route/context cần nối; ghi quyết định có nguồn ngắn gọn, rồi triển khai ngay.
3. Dựng UI và hành vi cho tất cả panel trong phạm vi. Nếu chỉ có prototype, tách fixture rõ ràng; không tạo thông báo thành công production giả. Dùng lại component/adapter chung và nối dependency có sẵn.
4. Chạy các ca nghiệm thu, kiểm tra render và lệnh kiểm tra sẵn có của dự án phù hợp thay đổi. Chỉ mở rộng kiểm tra khi có rủi ro cụ thể; sửa lỗi còn trong phạm vi và kiểm lại phần bị ảnh hưởng.
5. Xuất `handoff/P18/REPORT.md`: source commit/target, file đã sửa, coverage từng P18.Sxx, kết quả P18.Axx, link ảnh actual và baseline, lệnh/kết quả thật, khác biệt còn lại và blocker. Cập nhật `SCREEN_COVERAGE.csv` và `RUN_STATE.json` chung.
6. Nếu phiên bị ngắt, lưu điểm đang làm để tiếp tục chính P18; không tạo prompt mới và không coi checkpoint là hoàn thành. Nếu dependency của prompt trước vừa được hoàn tất ở đây, cập nhật các dòng coverage liên quan bằng bằng chứng mới.

**Kết thúc bằng kết quả đã làm và bằng chứng. Không kết thúc ở “bạn có muốn tôi bắt đầu không?”. Không báo toàn bộ board đạt nếu có panel bị bỏ, chưa chạy hoặc tích hợp chưa xác minh.**
