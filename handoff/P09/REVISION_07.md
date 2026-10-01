# P09 r07 — dialog cập nhật và lối về danh sách sau sửa chữa

User yêu cầu nâng cấp dialog Cập nhật xử lý theo ảnh1, bổ sung nút về trang quản lý danh sách sau khi cập nhật/Chờ bàn giao theo ảnh2, và rà soát luồng còn thiếu. Phạm vi: dialog của P09.S03, footer P09.S03/S04 và navigation liên quan. Giữ24 board,91 panel; không thêm trạng thái hoặc API.

## Đã áp dụng

- Dialog có tiêu đề/icon dùng chung, mã hồ sơ/model/serial để biết đang sửa đúng thiết bị. Chẩn đoán tùy chọn và Kết quả sửa chữa bắt buộc dùng cùng control một lớp viền, cao100px, counter căn phải, lỗi ngay dưới ô. Giữ policy fixture200 ký tự; bỏ khả năng kéo textarea làm vỡ dialog.
- Phần **Sau khi lưu → Chờ bàn giao** là khối thông tin riêng, nói rõ hồ sơ vẫn mở. Header/footer cố định, phần thân cuộn trong app; Hủy/Lưu kết quả có thứ bậc rõ ràng.
- Lưu giữ dialog ở trạng thái đang xử lý, khóa gửi trùng. Lỗi xác định hiển thị trong dialog và giữ nháp/request để thử lại. UNKNOWN khóa ô nhập và nút lưu, có Đối chiếu kết quả; đóng dialog không hủy hoặc mất request.
- Chỉ sau adapter xác nhận mới mở Kết quả sửa chữa. Back khi đang lưu không bị response về muộn kéo trở lại màn kết quả; hồ sơ vẫn phản ánh trạng thái đã xác nhận.
- S04 có **Xem hồ sơ** và **Về danh sách bảo hành** cố định ở footer. Phần thành công gọn lại để ưu tiên thông tin và hai lối đi.
- Hồ sơ S03 đang **Chờ bàn giao** cũng có nút Về danh sách bảo hành. Thao tác này giữ bộ lọc/tìm kiếm/sort/scroll đang có. Nếu trạng thái mới làm hồ sơ không còn khớp bộ lọc, hiển thị thông báo đúng mã/trạng thái; không âm thầm bỏ lọc.
- Navigation theo dõi điểm bắt đầu P09 và số bước đã đi trong phiên. Về danh sách quay về entry gốc, không push thêm danh sách sau kết quả. Luồng vào trực tiếp từ Home/P06 chưa có danh sách trước đó cũng được xử lý; Back tiếp trở về nguồn mở, không lặp hồ sơ/kết quả.
- Forward qua một marker dialog đã đóng được tính đúng vào đường quay về, không tự mở hoặc gửi lại thao tác. Reconcile từ danh sách tạo đúng đường trở lại hồ sơ của request trước khi hiển thị kết quả.

## Kiểm chứng

- `node scripts/check_warranty_update.cjs`: **11/11 nhóm PASS**, [update-results.json](evidence/revision-07/update-results.json). Bao gồm validation/counter, lỗi lưu và retry cùng request, gửi trùng, giữ tab/nháp, bộ lọc bị loại bởi trạng thái mới, hồ sơ chờ bàn giao, vào từ Home/P06 không có danh sách cũ, UNKNOWN/reconcile từ danh sách, Back trong lúc lưu, Forward qua dialog cũ.
- Dialog và màn kết quả được đo trên6 viewport494×1000,360×800,430×932,1440×900,340×420,1869×940; DPR1. Form cùng lề, textarea100px, footer trong app, không tràn ngang. [update-metrics.json](evidence/revision-07/update-metrics.json).
- **10/10 full P09 regression PASS**, [browser-results.json](evidence/revision-07/regression/browser-results.json). Kỳ vọng lỗi lưu được cập nhật sang lỗi ngay trong dialog thay vì đóng dialog rồi hiển thị bên ngoài.
- **11/11 Back/navigation regression PASS**, [navigation-results.json](evidence/revision-07/navigation-regression/navigation-results.json). Một lượt trước timeout khi tải lại login (trang chỉ có công cụ preview, chưa dựng form); chạy lại sạch cùng assertion đạt. Không bỏ guard hoặc relax test.
- **165/165 Node PASS**, [node-tests.txt](evidence/revision-07/node-tests.txt). Thêm ca kiểm validation update ở handler: whitespace/null/201 ký tự không tạo request,200 ký tự hợp lệ vẫn giữ Chờ bàn giao, chưa đóng hồ sơ.
- Vòng kiểm kích thước đầu đo trước khi ResizeObserver hoàn tất sau đổi viewport; sửa test chờ2 animation frame rồi đo, giữ nguyên assertion. Helper test mở details được sửa kiểm `open===null` thay vì coi chuỗi rỗng là đóng. Không sửa app để che lỗi test.
- Đã xem ảnh dialog sẵn sàng/lỗi và kết quả có hai CTA. Kiểm thử là fixture, không phải API/hardware production.

## Bằng chứng

[Dialog](evidence/revision-07/dialog-ready.png) · [Lỗi lưu giữ nội dung](evidence/revision-07/dialog-save-error.png) · [UNKNOWN](evidence/revision-07/dialog-unknown.png) · [Kết quả và hai nút](evidence/revision-07/result-494x1000.png) · [Về danh sách giữ bộ lọc](evidence/revision-07/return-preserves-filter.png).

## Bàn giao

Behavior PASS fixture; visual IN_PROGRESS/chờ user review; integration BLOCKED như r06. Không tự bàn giao/đóng hồ sơ, không thay tồn hoặc tạo phiếu linh kiện. Không sửa baseline/dist/gallery, không push/merge/deploy. Source HEAD vẫn da9f623…; target prototype.

Files: warranty/warranty.mjs, warranty-model.mjs, modal-history.mjs, style.css; auth-session/index.html; test update mới + cập nhật P09 regression; USER_FLOW, coverage và RUN_STATE. Các mẫu UI và Back đã chốt trước được giữ ngoài phạm vi trên.
