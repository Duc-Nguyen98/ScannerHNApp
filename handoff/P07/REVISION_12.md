# P07 r12 — Nâng cấp UI/UX theo đề xuất được user chấp thuận

29/09/2026. User yêu cầu áp dụng7 đề xuất trong chat. Giữ4 panel P07, artwork B07 và sóng vô hạn; không thay footer Home/P03 hoặc nghiệp vụ đã chốt. Workspace đã có P13 và các đồng bộ dialog/readable-content từ công việc khác, không ghi lùi tiến độ đó.

## Nguồn

[Bảng nguồn trước sửa](REVISION_12_SOURCE_MAP.md): baseline B07 cho khung/panel/artwork; user29/09 cho phạm vi7 nâng cấp; shared action-feedback/dialog-route/UI_STANDARD cho component. Spacing/font/hit area mới là lựa chọn triển khai để user review, chưa phải số đo Designer.

## Đã triển khai

1. **Hướng dẫn theo trạng thái:** Sẵn sàng đọc → Đang đọc mô phỏng → Đã đọc UID; các trạng thái kho dừng, không hỗ trợ, thiếu quyền, đọc lỗi/thẻ bị khóa không hiển thị Sẵn sàng. Bước xác minh nói rõ khi đang kiểm tra hoặc cần đối chiếu. Không coi đọc UID là liên kết thành công.
2. **Phục hồi ngay trong dialog:** đọc lỗi có Đọc lại; thẻ đã liên kết/khóa có Chọn thẻ khác; thất bại đã xác định có Thử liên kết lại; UNKNOWN có Kiểm tra kết quả/Để sau. Tái sử dụng createActionFeedback; callback chạy sau khi đóng dialog, không chồng overlay. Không tự retry.
3. **Liên kết tiếp rõ sản phẩm:** thông báo Đang liên kết tiếp cho sản phẩm bên dưới nằm sát card có mã/tên/SKU/serial; nút Đổi sản phẩm riêng tái sử dụng picker P06. UID cũ được xóa theo flow hiện có, vẫn phải đọc và xác minh lại.
4. **Tìm kiếm:** nút X44px xóa query, trạng thái rỗng hướng dẫn UID/mã/SKU/serial và có Xóa tìm kiếm và bộ lọc. resetFilters cập nhật query/tab cùng lần, không đổi item/request hoặc ghi dữ liệu.
5. **Copy gọn:** dấu tích và nhãn Đã sao chép ở vị trí nút2.2s, aria-live, không tăng chiều cao bảng/dialog. Lỗi clipboard vẫn dùng dialog chung, trở lại detail sau đóng; không chồng overlay. Ngoại lệ copy thành công mới của P07 được ghi trong UI_STANDARD, không áp cho hành động ghi hay module khác.
6. **Vùng chạm:** Back/thêm ở header, Copy, xóa query và Back dialog có hộp tương tác tối thiểu44×44 CSS px; giữ SVG nhỏ và khoảng cách phù hợp. Đây là kích thước trong shell494px, preview thu tỷ lệ không phải chứng nhận kích thước vật lý trên thiết bị thật.
7. **Back:** tái sử dụng dialog-route đã có; thêm nút Back rõ trên dialog chi tiết. UI Back/Back trình duyệt/Escape đóng dialog trước, không tự gửi request; trả focus về thẻ nguồn, giữ query/tab/scroll. Không viết router thứ hai.

“Chọn thẻ khác” về bước đọc, chọn UID demo chưa dùng và đưa focus tới bộ mô phỏng liên quan. Các tools vẫn ngoài app theo quy tắc hiện tại. Khi đang cố tình mô phỏng conflict/locked, không âm thầm đổi kịch bản thành Bình thường; người kiểm thử chủ động thay kịch bản. Không gọi camera/NDEFReader/hardware/WMS.

## Ảnh trước–sau

Cùng viewport494×1000, DPR1, Chromium, fixture mặc định: [trước](evidence/revision-12/before), [sau](evidence/revision-12/after). Cặp list/empty/detail/ready/read/verify/success/next-product/read-error/unknown-dialog/unknown-pending. Nhịp animation là runtime nên phase có thể khác; không dùng pixel-diff để tự nghiệm thu.

- [Trước màn đọc](evidence/revision-12/before/ready.png) → [Sau](evidence/revision-12/after/ready.png).
- [Trước liên kết tiếp](evidence/revision-12/before/next-product.png) → [Sau](evidence/revision-12/after/next-product.png).
- [Trước lỗi đọc](evidence/revision-12/before/read-error.png) → [Sau](evidence/revision-12/after/read-error.png).
- [Copy tại chỗ](evidence/revision-12/after/copied.png), [lỗi copy](evidence/revision-12/after/copy-denied.png), [không tìm thấy](evidence/revision-12/after/empty.png).

Đã xem ảnh thực tế ready, liên kết tiếp, copy và lỗi đọc. Chưa có baseline riêng cho các nhánh UX mới; before/after là bằng chứng thay đổi, không phải bằng chứng Designer đã nghiệm thu. Visual mới chờ user review.

## Kiểm chứng

- **323/323 Node PASS**, [log](evidence/revision-12/node-tests.txt). Thêm1 unit test resetFilters atomic/read-only/session guard; số còn lại thuộc bộ hiện có toàn workspace.
- **12 nhóm UX PASS**, [kết quả](evidence/revision-12/after/results.json): clear/reset; Copy/Back; liên kết tiếp; retry một lần không link; chọn thẻ không tự đổi failure scenario; UNKNOWN giữ ID đối chiếu; P06 đổi sản phẩm; unavailable states; Back/focus; badge copy tự hết không reflow; clipboard denied không chồng dialog.
- Bao gồm **24 capture** cho4 trạng thái chính ×6 viewport494×1000,360×800,430×932,1440×900,340×420,1869×940; không tràn ngang, nội dung nằm trên footer, touch target>=44CSSpx. Các ảnh nhánh lỗi bổ sung ở cùng fixture/viewport để review, không coi hình thức tự PASS.
- **11 nhóm NFC regression PASS**, [kết quả](evidence/revision-12/regression/browser-results.json): receipt, duplicate submit, picker, lỗi/UNKNOWN, kho dừng, Back/Forward, dialog/keyboard, logout;0pageerror/0external request/hardware NOT_RUN.
- **4 nhóm repeat PASS**, [kết quả](evidence/revision-12/repeat/results.json):5 UID liên tiếp, request mới, UNKNOWN và text dài/cuộn cuối.
- Script core được sửa kỳ vọng copy success thành feedback tại nút, và dismiss dialog bằng cancel nếu có thay vì vô tình kích hoạt CTA phục hồi mới. Không bỏ các assertion nghiệp vụ.
- Lượt capture trước đầu tiên báo strict-selector do dialog tên Home cũng có class hn-action-dialog; scope lại `[open]` rồi chạy đạt. Đây là lỗi selector test, không đổi app để che lỗi.

## Bàn giao

Files UI: nfc/nfc.mjs, nfc/style.css; model chỉ thêm resetFilters; auth entry cache p07-r12; UI_STANDARD thêm ngoại lệ copy riêng P07. Tests: check_nfc_upgrade.cjs mới, check_nfc.cjs cập nhật kỳ vọng, tests/nfc.test.mjs bổ sung ca reset.

Không thay API/quyền/OTP/storage; không push/merge/deploy. Coverage giữ91 ID. Production NFC/capability/backend vẫn chưa xác minh; đây là prototype fixture. Current prompt/tiến độ P13 và các module khác được giữ, ghi r12 vào key riêng p07_ux_upgrade.
