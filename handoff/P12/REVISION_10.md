# P12 r10 — rà soát lỗi UI/UX

Đã sửa các lỗi tái hiện theo yêu cầu user. Phạm vi: P12.S01–S04 và component/lifecycle liên quan; bảo toàn P16/P17/P18 và các module owner đã được nối thêm trong workspace. Visual chờ user review; backend chưa được nghiệm thu.

Nguồn hình thức: r08/r09, shared History controls/detail tabs/readable/dialog, contract494×950. Lượt này ưu tiên sửa lỗi tái hiện; không mở một đợt thiết kế lại hoặc thay nghiệp vụ. Ảnh before/after được lấy từ cùng harness Chromium,DPR1,494×950 và6viewport. Visual vẫn cần user review.

## Lỗi xác định và sửa ở nguyên nhân

| Lỗi | Nguyên nhân | Bản sửa |
|---|---|---|
| Enter khi tìm NCC tự Apply lựa chọn đang bị ẩn | Native submit của form dùng draft cũ | Enter tìm kiếm chỉ đưa focus tới kết quả; Enter trên radio chọn draft. Apply mới commit ở picker thông thường. Không chặn Enter của IME; giữ commitOnChange ở caller có chủ ý |
| Tìm sản phẩm không khớp nhưng vẫn ghi2 dòng | Counter đọc toàn bộ source, input chỉ thay danh sách | Counter cập nhật theo kết quả, ghi rõ dòng phù hợp; tổng quantity/SKU của chứng từ giữ nguyên |
| Mã dài liền ký tự đẩy cả danh sách ngang ra ngoài | Grid dùng min-content tự nới track; tên chưa wrap | Track `minmax(0,1fr)`, min-width0, mã tối đa2 dòng và wrap-anywhere; chi tiết/copy vẫn đọc đủ chuỗi gốc |
| Copy báo `&lt;`/`&amp;` thay vì ký tự thật | Escape hai lần trước dialog | Truyền text nguyên văn; dialog tự escape đúng một lần |
| PDF chậm như không phản hồi, Back không chạy | Chỉ đặt busy nội bộ; Back chặn busy; fetch không có timeout | Spinner/aria-busy trên nút, chặn tải trùng, Back/đổi route hủy request; timeout15giây và dialog lỗi; retry giữ context |

Trong lúc kiểm bản sửa tải file, phát hiện thêm mất focus do disable nút tải. Đã phục hồi focus về nút sau khi tải thành công nếu người dùng chưa chuyển focus; không giành focus từ dialog/trang mới. Callback của request đã hủy không tự tải file hoặc bật dialog muộn ở màn khác.

## Kiểm chứng

- **8 nhóm audit chính PASS**, gồm36 ảnh/bố cục tại6viewport ×6 trạng thái (list,info,products,files,events,create). Kiểm Enter/search/IME, long identifier, copy ký tự đặc biệt, download chậm/Back, timeout/404/retry/PDF bytes và không overflow ngang/footer. [Kết quả](evidence/revision-10/after/audit-results.json).
- **2 nhóm attachment PASS:** keyboard focus sau download và Back từ P18 viewer về đúng ID/tabFiles. [Kết quả](evidence/revision-10/after/audit-Attachment-results.json).
- Hai ca keyboard được chạy lại sau bổ sung Enter trên radio; là kiểm lại trong8 nhóm trên, không cộng thêm. [Kết quả cuối](evidence/revision-10/after/audit-Enter-results.json).
- **8 nhóm guidance regression PASS:** supplier MRU/cancel, owner validation, exact draft resume, UNKNOWN→P17.S04, not-recorded qua Back/Forward giữ request rồi retry, outbound send once/inventoryDelta0,6viewport/reload. [Kết quả](evidence/revision-10/guidance/guidance-results.json).
- **7 nhóm create/dialog regression PASS:** metadata/form/note200, supplier footer/scroll6viewport, Cancel/Escape/Back/focus, tên dài, các route owner. [Kết quả](evidence/revision-10/create-regression/create-results.json).
- **1 nhóm P09 shared-choice PASS:** backdrop, Cancel/Back/Escape và commitOnChange của fault picker không đổi. [Kết quả](evidence/revision-10/choice-regression.json).
- Tổng **26 nhóm browser PASS**, không cộng số test cũ hoặc lần debug. Không thêm unit test lặp markup cho sửa UI; `git diff --check` đạt. Các file results kết thúc đều không có pageerror.

Before audit tái hiện4 lỗi hành vi; ca mã dài được bổ sung với chuỗi không có dấu phân tách và đo card so với khung thật: card tràn tới821.6px trong shell494px. Assertion đầu chỉ kiểm scrollWidth của inline node là chưa đủ, đã sửa cách đo bằng bounding rect; không dùng kết quả đó để báo giao diện đạt. Hình before/after mã dài chứng minh thay đổi width/wrap. [Before hành vi](evidence/revision-10/before/audit-results.json), [before đo card](evidence/revision-10/before/audit-focused-results.json).

Harness r09 từng chờ UNKNOWN tại P04.S03 nên báo timeout khi workspace đã nối P17.S04. Đã cập nhật đúng panel hiện hành và kiểm lại request/disabled-retry thực tế; không đổi luồng mới trở về bản cũ để làm test xanh.

## Bàn giao

[Ảnh và các trạng thái r10](evidence/revision-10/REVIEW.html). Giữ phong cách r08/r09, footerLOCK và ID panel. Lượt này không thêm màn hoặc sửa baseline. Các ảnh Enter trước thao tác nhìn giống nhau; lỗi đó được chứng minh bằng trạng thái dialog/giá trị sau phím Enter trong log, không dùng ảnh tĩnh làm bằng chứng hành vi.

Các file sửa chính: documents.mjs/style.css, shared/choice-dialog.mjs và version CSS; harness hồi quy, UI_STANDARD, coverage và checkpoint P12. Giữ code P16/P17/P18/Home/Nhập/Xuất của các chat khác. Root current_prompt không bị đổi.

Kết quả là **PASS_SCOPED_PREVIEW**, visual **AWAITING_USER_REVIEW**, integration **BLOCKED_PRODUCTION**. Đây không phải tuyên bố mọi màn P01–P24 hoặc mọi thiết bị production hết lỗi. Không dùng API/phần cứng mới, không push/merge/deploy. Reload preview nhận r10 và đặt lại dữ liệu thử theo contract hiện có.
