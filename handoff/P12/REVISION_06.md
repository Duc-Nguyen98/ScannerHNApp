# P12 r06 · Sửa sai lệch có đối chiếu nguồn

**Visual chưa được nghiệm thu.** Phản hồi user cho thấy việc báo “đã đồng bộ” dựa trên test hành vi/overflow trước đây chưa đủ để chứng minh giao diện đúng thiết kế. Bản r06 sửa các điểm có thể xác định từ B12 và component hiện hành; không tự nâng kết quả thành visual PASS.

## Xác định đúng nguồn và sai lệch

- B12/Contract2.0/P12 prompt là nguồn panel. SHA-256 baseline giữ nguyên `bb73f81c628986d6a763d4a846f19229e60898ef016eb02022926603bea776ad` tại HEAD `da9f623…`.
- Frame494×950, footer, operation-icons, dialog, long-text là các contract bổ sung của user. Chúng có thể làm actual khác ảnh cũ ở đúng phạm vi đã yêu cầu; không đồng nghĩa toàn revision đã được duyệt.
- Sai lệch có thể xác định: glyph “+” phụ thuộc font, nút sort không nhãn dễ nhầm tải xuống, filter label/caret không cùng cấu trúc, selected tile viền đôi khác B12, form trung gian Xuất/Bảo hành không có baseline riêng.
- B12 chỉ minh họa form tạo Nhập. Hai form trung gian trước đây là lựa chọn triển khai, không được gọi là thiết kế đã chốt. Date editability/required vẫn thiếu contract; không tự bật date picker.

[Bảng nguồn/quyết định từng vùng](evidence/revision-06/design-trace.json) · [So sánh trước–sau](evidence/revision-06/REVIEW.md).

## Đã sửa

1. **Danh sách:** nút thêm44×44 dùng SVG nét mảnh ở giữa; thời gian và trạng thái là hai ô48px rộng bằng nhau, có icon/label/chevron rõ. Trạng thái mở bộ chọn riêng và chỉ commit khi Áp dụng. Sort dùng nhãn Mới nhất/Cũ nhất/Thứ tự ban đầu trong results toolbar theo nguồn P08, không dùng mũi tên dễ nhầm download. Đây là adaptation cần review, không phải chi tiết nguyên gốc B12.
2. **Tạo Nhập:** giữ hierarchy B12; selected tile nền đậm, cùng border1px nên không nhảy kích thước; giữ pastel operation icon. Note editor112px là số đo triển khai ước lượng để cân form, không phải CSS Designer được xác minh; policy200 ký tự không đổi. Ngày hiển thị bằng output “Chưa tạo phiếu / Hệ thống cấp”, không phải input có giá trị giả.
3. **Xuất/Bảo hành:** bản review mặc định mở trực tiếp P05/P09 từ ô loại. Không tạo thêm form trung gian hoặc draft owner mới. Nhập vẫn ở P12.S04 rồi dùng P04. Header Back và browser Back đều giữ được nội dung P12; phiếu đã có dùng confirmation trước resume, không ghi đè/double-create. Nút Về Trang chủ của owner vẫn về Home.
4. **Khả năng đọc:** row cuối danh sách có thể cuộn hoàn toàn lên trên scan-circle footer. Giữ tab detail, note readers, PDF và các contract đã khóa trước đó.

**Lựa chọn Xuất/Bảo hành chưa nhận phản hồi riêng của user trong lượt này.** Tôi đã hỏi hai phương án và dùng reuse owner làm phương án mặc định có thể review theo yêu cầu P12. Không ghi phương án đó là đã được user duyệt. Nếu user chọn giữ bước trung gian, cần bản bố cục được review riêng trước khi áp dụng, không trở lại form suy diễn cũ.

## Kiểm tra đã chạy

- **69 Node PASS**: documents/inbound/outbound/dialog-route/query-date-policy. [Log](evidence/revision-06/node-tests.txt).
- **7 nhóm repair behavior/layout PASS**,12 viewport captures S01/S04 tại494×950,360×800,430×932,1440×900,340×420,1869×940; typed filter/sort, status cancel/apply, row cuối, source owner route, header/browser Back, draft identity. [Kết quả](evidence/revision-06/repair-results.json).
- **12 nhóm data regression PASS**: source24 docs, serial/PDF/404/P09/P04 receipt/logout. [Kết quả](evidence/revision-06/data-regression/browser-results.json).
- **7 nhóm readable text PASS**: rỗng/ngắn/250/2000+/multiline/Unicode/HTML, full note749, long fields, input guard. [Kết quả](evidence/revision-06/text-regression/text-spacing-results.json).
- Tổng26 nhóm browser; không cộng các revision cũ vào kết quả lượt này. Code khác/production/hardware không được suy là PASS.
- `repair-results.json` ghi rõ `visual_acceptance=NOT_GRANTED`. Thư mục before là capture trực tiếp đầu lượt sửa; ảnh user giữ dưới user-1/2/3.png. Full runtime captures dùng Chromium,DPR1, cùng494×950. Không kéo méo baseline để giả pixel match.

## Chặn tái diễn việc báo quá mức

Đã bổ sung **HN-visual-evidence-v1** vào AGENTS/UI_STANDARD: bắt buộc bảng source và before/after, chụp cả nhánh form, phân biệt estimate/adaptation/user-approved; không lấy lời báo cáo của agent hoặc số test làm chứng cứ user đã duyệt. Không tự sửa baseline, không tự đặt ngưỡng diff để tự nghiệm thu.

P12.S01–S04 giữ visual `IN_PROGRESS`, implementation/behavior được ghi riêng, integration `BLOCKED`. Giao diện r06 cần user review; exact font, một số product artwork và policy ngày/backend vẫn chưa xác minh. B12 phone ảnh và runtime494×950 khác tỷ lệ; comparison theo component/topology và contract bổ sung, không claim pixel-perfect.

## File chính

P12 documents.mjs/style.css, auth-session stylesheet revision; inbound/outbound optional onBack và Home caller marker để header Back đúng caller (mặc định cũ vẫn onHome); script capture/check; AGENTS/UI_STANDARD; handoff/checkpoints/coverage. Home có công việc P13 đồng thời: chỉ patch callback cần cho P12, giữ phần notifications và không đổi checkpoint current_prompt của chat đó.
