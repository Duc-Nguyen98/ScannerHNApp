# P12 r09 — áp dụng5 đề xuất trải nghiệm tạo phiếu

Đã triển khai theo yêu cầu user. Nguồn: proposal5 mục được user yêu cầu áp dụng; P12r08, owner P04/P05, shared choice/dialog, UI_STANDARD. Giữ các panel, không bổ sung API/quyền/storage. Visual chờ review; backend chưa tích hợp.

| Mục | Cách triển khai |
|---|---|
| Tiến trình | Component ba bước dùng P12.S04 và P04/P05.S01–S03, không phải panel mới; kết quả vẫn waiting Web |
| Chọn NCC | Current + ba NCC gần đây trong phiên, search không dấu/code, count; Apply mới lưu; không reorder giữa lúc chọn |
| Phiếu dở | Đọc snapshot owner đúng actor/kho; mở exact documentId; UNKNOWN không gửi lại, not-recorded giữ request |
| Trước gửi | Loại phiếu + quantity + SKU, đối tác từ review hiện hữu; không thêm confirm trùng với bước Kiểm tra |
| Validation/busy | Giữ field validation và bản nhập, focus lỗi đầu; kiểm chống gửi trùng, thông báo theo dialog contract |

Số đo và bố cục mới là adaptation để review, không phải visual sign-off. Evidence trước–sau cùng494×950,DPR1,Chromium.

## Kết quả áp dụng

1. Component `flowProgress` dùng chung3 bước ở P12.S04 và P04/P05.S01–S03. Bước hiện tại có nhãn/aria-current, bước đã đi qua đánh dấu. Không tạo tab điều hướng bỏ qua validation, không gộp panel. S04 kết quả của owner vẫn waiting Web, không hiển thị giả luồng kho đã hoàn tất.
2. Hộp NCC P12 ưu tiên giá trị đã chọn, sau đó các ID vừa dùng (tối đa3ID, không lặp current), rồi danh mục. Có nhãn Hiện tại/Gần đây và số kết quả; tìm tên không dấu hoặc mã NCC. Badge không tham gia tìm kiếm. Không đổi vị trí hàng khi đang chọn. Chỉ Apply cập nhật giá trị/MRU; Cancel/Escape/Back không lưu. MRU thuộc instance Home trong phiên, nhận cả lựa chọn NCC hợp lệ từ P04 và việc sử dụng trên phiếu; không localStorage, reload/login mới khởi tạo lại.
3. S04 có thẻ phiếu đang làm từ snapshot P04/P05 đúng actor/kho. Nhãn phân biệt bước soạn, busy, UNKNOWN và đã đối chiếu chưa ghi nhận. Resume dùng exactdocumentId và marker riêng cho browser Back/Forward; không tạo lại draft hoặc thay request/scanSession/version. UNKNOWN mở màn có Đối chiếu, không tự retry. Phiếu đã ghi nhận không còn trong nhóm đang làm. Không tự dựng draft bảo hành khi nguồn P09 không cung cấp cùng contract.
4. Bước Kiểm tra thêm khối Loại phiếu/Số lượng/Số SKU. Đối tác/địa chỉ/danh sách sản phẩm vẫn ở review của owner. Không thêm dialog xác nhận trùng lặp; CTA là Gửi phiếu lên Web hoặc Gửi lại phiếu đúng trạng thái. Busy ghi Đang gửi/Đang đối chiếu; kết quả đã xác minh vẫn Chờ xử lý trên Web, inventoryDelta0.
5. Rà soát và kiểm chứng validation hiện hữu: tập trung lỗi đầu, giữ dữ liệu, chặn gửi thiếu thông tin/soạn thiếu, và chặn submit trùng. Không nhân bản validation, thay policy200 hoặc chuyển lỗi field thành toast.

## Kiểm chứng

- **75 Node PASS:** flow-guidance, documents, inbound, outbound, dialog-route.3 ca mới kiểm MRU/session isolation, resume đúng identity/actor/kho/UNKNOWN/not-recorded và quantity khác SKU. [Log](evidence/revision-09/node-tests.txt).
- **8 nhóm browser guidance PASS:** MRU/current/search/count/cancel; progress; validation note; exact resume; UNKNOWN chặn retry; not-recorded qua Back/Forward giữ cùng request rồi gửi đúng một lần; outbound required shipping/restore/send;6viewport form/progress/CTA; reload reset MRU. [Kết quả](evidence/revision-09/guidance-results.json).
- **7 nhóm create regression PASS:** r08 metadata/form/dialog bounds,6viewport, supplier cancel/apply/keyboard, tên dài, owner routes, note/supplier chuyển P04. [Kết quả](evidence/revision-09/create-regression/create-results.json).
- **1 nhóm P09 choice regression PASS:** default options/commitOnChange/Back/Escape không đổi. [Kết quả](evidence/revision-09/p09-choice-results.json).
- Tổng **16 nhóm browser** trong r09; không cộng test r08. Các lần debug timeout khởi tạo và harness nằm ở failure log, không được tính PASS. Một lỗi routing phát hiện: explicit resume cần đi qua adapter resumeExisting, không phải route dependency chưa tích hợp; đã sửa và kiểm panel owner thực sự hiển thị, không chỉ đọc snapshot ẩn.

## Evidence và giới hạn

[Bảng ảnh r09](evidence/revision-09/REVIEW.html). Có before/after của P12 create/supplier và P04 info/scan/review cùng viewport/DPR. **Không có capture P05-before hoàn tất trong lượt này**: harness trước sửa dừng khi thử bấm nav Home bị ẩn ở owner. P05-after có3 capture nguồn hiện tại, không gắn nhãn giả là cặp trước–sau hoặc pixel-match. Hình P05 vẫn cần review với nguồn đã chốt và các thay đổi đồng thời của chat owner.

P04/P05/Home có công việc đồng thời trong workspace (scan, shipping, Home resume/recent/shift). Chỉ ghép progress/totals/supplier history và callback/marker P12; giữ các phần đang có. Checkpoint current_prompt toàn workspace không bị đổi. Báo cáo này không nhận nghiệm thu thay cho chat owner hoặc cho toàn app.

Visual **AWAITING_USER_REVIEW**, behavior **PASS_SCOPED_PREVIEW**, integration **BLOCKED_PRODUCTION**. Không kết nối API mới, phần cứng, push/merge/deploy; không sửa baseline/gallery/dist. Dữ liệu thử/MRU/phiếu dở vẫn chỉ trong bộ nhớ; không hứa giữ qua reload.
