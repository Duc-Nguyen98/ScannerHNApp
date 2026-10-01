# P12 r07 — thống nhất controls, Back theo trang, tiến trình chứng từ

Đã triển khai và kiểm tra trong preview; **chưa nghiệm thu visual**. Phạm vi theo feedback user ngày2026-09-29; giữ P12.S01–S04 và footer khóa. Backend vẫn chưa kết nối.

| Vùng | Nguồn | Thay đổi được yêu cầu / lựa chọn triển khai |
|---|---|---|
| Danh sách, search, tab loại, filter, sort | Component `history/history-controls.mjs`, CSS P08 hiện hành | User yêu cầu theo Lịch sử: dùng chung render/CSS, thêm shortcut scan có nhãn; vẫn có bốn loại của B12 |
| Header thêm, nội dung chi tiết/tạo | B12 + r06 | Giữ cấu trúc/ID; không thêm nghiệp vụ |
| Tab chi tiết | `shared/detail-tabs.css` của P08/P09 | Bỏ palette/weight override riêng P12, giữ dock cố định và badge số lượng |
| Back | Feedback user | Tab là trạng thái cùng trang, replaceState; Back về caller/list một lần, bảo toàn query/scroll |
| Timeline | Sự kiện hiện hữu + trạng thái nguồn P12/P09 | User yêu cầu warning/success. Card tiến trình và nhãn bước là thiết kế triển khai cần review; chỉ xanh hoàn tất nếu có sự kiện kết thúc tương ứng |
| Nội dung dài, dialogs, footer | Các contract đã khóa trong UI_STANDARD | Không đổi policy nhập hoặc giấu nội dung; giữ reader và navigation modal |

Không có baseline riêng cho card tiến trình mới. Không gọi số đo runtime là số đo Designer, không dùng test hành vi làm bằng chứng duyệt visual. Before/after: cùngChromium,494×950,DPR1,fixture sau đăng nhập mới.

## Các vấn đề đã xử lý

1. **Controls danh sách dùng chung implementation:** search50px, tab loại44px, ô ngày44px; ngày và trạng thái mở chung bộ lọc P08. Giữ Đặt lại–Hủy–Áp dụng và kiểm khoảng ngày Việt Nam. Sort có nhãn, scan chuyển xuống toolbar có tên truy cập; không dùng mũi tên giống tải file. Search của Sản phẩm dùng cùng primitive. Tất cả24 chứng từ vẫn truy cập được; bỏ count lặp trong tab Tất cả, số kết quả nằm ở toolbar theo Lịch sử.
2. **Bốn tab chi tiết:** màu/font/selected state/count lấy từ `shared/detail-tabs.css`, không giữ palette riêng P12. Dock không cuộn cùng nội dung. Cột cố định dành đủ chỗ cho label và badge; không xuống hai dòng và không đổi vị trí khi chọn tab. Tỷ lệ1:1.35:1.1:1 là lựa chọn triển khai cho494px, không gọi là số đo gốc Designer.
3. **Back theo trang:** same-document tabs replaceState, giữ context/caller; một lần Back rời chi tiết về danh sách hoặc kết quả owner đã mở nó. Browser Forward trở lại tab cuối. Query/filter/scroll mỗi vùng được giữ. Deep link/entry cũ thiếu caller xác minh dùng fallback về danh sách thay vì đi lùi chuỗi tab. Không thể xóa lịch sử cũ của trình duyệt; bảo đảm entry mới không tạo lại chuỗi tab. Chặn double-click trong lúc Back chưa xong, tránh render lặp khi cả popstate/hashchange cùng phát; focus về record mở trước đó. Dialog vẫn đóng trước route.
4. **Timeline có ý nghĩa nghiệp vụ:** card tổng quan luôn ở đầu nội dung; bước hiện tại màu warning + nhãn Bước hiện tại, bước cuối được xác nhận màu success + nhãn Hoàn tất. Các sự kiện trước giữ trung tính. Phiếu waiting chưa đổi tồn; posted chỉ xanh nếu có sự kiện ghi sổ tương ứng. Bảo hành ready vẫn vàng, returned có sự kiện trả khách mới xanh. Xuất linh kiện không kết thúc hồ sơ. Sự kiện thiếu/mâu thuẫn hiển thị Cần đối chiếu/Chưa đủ dữ liệu, không thêm mốc giả.
5. **Sort Thứ tự ban đầu:** sửa adapter vốn đang trả thứ tự giảm dần cho cả source; nay source giữ thứ tự nguồn, Cũ nhất/Mới nhất vẫn sắp theo thời gian.

## Bằng chứng và kiểm tra

- [Ảnh trước–sau / trạng thái cần review](evidence/revision-07/REVIEW.md), [bảng xem ảnh](evidence/revision-07/REVIEW.html).
- **41 Node tests PASS:** documents, progress (7 nhóm), picker, query-date-policy, dialog-route, Home. [Log](evidence/revision-07/node-tests.txt).
- **11 nhóm consistency PASS:**9 đối chiếu computed styles của controls, filter/sort, repeated tabs + header/browser Back, legacy deep link, KPI scope, dialog Back,4 trạng thái tiến trình, dữ liệu mâu thuẫn,24 quan sát tab tại6 viewport. [Kết quả](evidence/revision-07/consistency-results.json).
- **9 nhóm tabs PASS:**4tabs/context/footer cố định tại6 viewport, keyboard, per-document query, independent scroll, Back/Forward, missing sources. [Kết quả](evidence/revision-07/tabs/tabs-results.json).
- **12 nhóm data PASS:**24 chứng từ, scope/serial, tải byte PDF thật, lỗi404, P09 dùng chung, P04 recorded receipt về owner bằng một Back, không tăng request/tồn, logout. [Kết quả](evidence/revision-07/data/browser-results.json).
- **7 nhóm long text PASS:**749ký tự và250/2000+/Unicode/newline/từ liền, full dialog, input200 và CTA. [Kết quả](evidence/revision-07/text/text-spacing-results.json).
- **5 nhóm History regression PASS:**6trang dùng controls, Reset/Cancel/Apply, ngày Việt Nam,90ngày, validation và Back. [Kết quả](evidence/revision-07/history-regression/reset-results.json).
- Tổng **44 nhóm browser** trong revision này. Các assertion cũ đòi Back qua từng tab được thay bằng yêu cầu mới một Back về trang cha; test kết quả owner cũng đổi từ hai Back thành một. Các lần debug thất bại lưu riêng; các file results ở trên là kết quả chạy hoàn tất. Không cộng số test revision cũ.

Server được kiểm trực tiếp: HTTP200, Cache-Control `no-store`, code trước sửa trả r06, sau sửa trả r07; SHA lưu trong before/after/runtime.json. Ảnh user có controls cũ hơn actual r06, không dùng ảnh đó làm actual-before thay cho capture. Để xem r07 cần tải mới trang; reload khởi tạo lại dữ liệu thử trong bộ nhớ theo contract đã có. Không reload tab đang mở của user trong quá trình kiểm.

## Giới hạn và bàn giao

- Visual **AWAITING_USER_REVIEW**, behavior **PASS_SCOPED_PREVIEW**, integration **BLOCKED_PRODUCTION**. Không tuyên bố pixel-perfect hoặc toàn app đạt production.
- Info nhiều field/tài liệu và timeline nhiều mô tả cần cuộn trong app; giữ khoảng dòng, không cắt dữ liệu để ép vừa. Tab/header/nav giữ ổn định. Footer/icon/dialog/long-note contracts được giữ.
- S04 giữ lựa chọn owner flow của r06; không suy diễn user đã duyệt riêng chiến lược đó. Artwork sản phẩm thiếu, policy ngày và contract WMS/P18 vẫn là giới hạn cũ.
- Các file chính: documents.mjs/document-model.mjs/document-progress.mjs/style.css; history-controls.mjs/style.css; shared/detail-tabs.css/UI_STANDARD.md; Home chỉ bổ sung marker caller khi mở documents; auth-session stylesheet version. P02/P13 và checkpoint `current_prompt` của chat khác được bảo toàn.
