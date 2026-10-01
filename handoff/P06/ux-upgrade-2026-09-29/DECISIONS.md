# P06 UX upgrade — nguồn trước sửa

User2026-09-29 duyệt triển khai8 đề xuất trong chat. Scope áp dụng cụ thể: ưu tiên thao tác tra cứu trong4 panelP06 và giữ context các điểm nối; không redesign Home/footer, không thêm prompt/API. Repo hiện đã cóP13 và các chuẩn mới trong AGENTS/UI_STANDARD; không ghi đè tiến độ/module đang có.

| Thay đổi | Nguồn | Phân loại |
|---|---|---|
|4 panel/catalog/detail/stock/history, thông tin và tồn12/10/1/1|B06, Contract2.0|BASELINE giữ nguyên ID/data|
|Tồn/Lịch sử ngay dưới hero, trước actions/info/gallery|User duyệt đề xuất ưu tiên1|USER_CHANGE|
|Bộ chọn thời gian P08, lịch90ngày Việt Nam, Apply/Hủy/Reset|history/history-picker.mjs, shared/query-date-policy.mjs|VERIFIED_COMPONENT; mapping status slot sang loại giao dịch P06 là implementation choice|
|Enter mở đúng1 kết quả sau query, nhiều kết quả đưa focus vào list; IME không submit|User duyệt tối ưu tìm kiếm|USER_CHANGE; search live hiện có vẫn giữ|
|Count dữ liệu đã tải, query/filter chips, xóa lọc ngoài dialog|User duyệt phản hồi và bộ lọc|USER_CHANGE; không giả count tổng server|
|Ảnh lớn/đổi ảnh trong overlay, backdrop không đóng, Back/Esc/focus|User duyệt gallery; shared/app-modal/dialog-route|USER_CHANGE + VERIFIED_COMPONENT|
|Không có kết quả khác lỗi đọc; retry đọc giữ dữ liệu cũ đúng query/item|User duyệt state phản hồi|USER_CHANGE; lỗi mô phỏng từ adapterfixture, chưa có API|
|Dấu nhấn dòng vừa xem, giữ query/category/scroll|User duyệt quay lại vị trí làm việc|USER_CHANGE|
|Mã trùng/nhập sai phản hồi tại ô; unknown đối chiếu;1 primary mỗi bước|P04/P05 source hiện đã có manual-code status/guard/pending state|REUSE, không dựng lại mutation hoặc thay status|

Số đo lựa chọn triển khai P06: khung494×950 nhưHome; shortcut2 cột gap10, min-height56; chips font14 line20, control min36; picker dùng đúngCSS P08 đang có; image dialog rộng100% vùng modal (padding18), ảnhmax-height460, object-fit contain. Đây là implementation estimates, chưa tự tuyên bố Designer token hay visualPASS.

Before captures: evidence/before-{list,detail,history}.png tại494×1000,DPR1,Arial,fixture HN12346; cùng điều kiện sẽ capture after. BaselineB06 không sửa. Tổng24board/91panel giữ nguyên. Không push/merge/deploy.
