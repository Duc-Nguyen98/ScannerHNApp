# P09 r05 — sửa user flow và điều hướng Trở về

User báo Back bỏ qua tiến trình, nhảy sang tab khác rồi về Home. Đã tái hiện bốn lỗi bằng browser trên source đang chạy, lưu [before.json](evidence/revision-05/before.json):

| Tình huống | Lỗi trước sửa |
|---|---|
| Tiếp nhận → Tra cứu → Back | Đi thẳng `#home` vì P06 không có thông tin màn gọi P09 |
| Tiếp nhận → hồ sơ vừa xác nhận → Back | Đi về Danh sách, bỏ qua form Tiếp nhận |
| Tab Lịch sử hồ sơ → cập nhật → kết quả → Xem hồ sơ | Đổi thành tab Thông tin, mất tab đang làm |
| Hộp chọn lỗi đang mở → browser Back | Màn phía sau chuyển về Danh sách nhưng hộp vẫn còn |

## Sửa trong phạm vi

- P09 lưu nguồn mở màn trong history entry. Back tiêu thụ một bước đã có, thay vì push thêm trang danh sách vào lịch sử. Deep link không có màn gọi dùng fallback trong Bảo hành.
- P06 chỉ mang context quay về P09 khi được mở từ P09. Context đi cùng các bước con P06 và có khóa theo phiên Home. Chọn serial hoặc Back về P09 quay về đúng entry ban đầu; không tạo vòng điều hướng mới. P06 độc lập và chọn sản phẩm cho NFC giữ hành vi riêng.
- Giữ tab/scroll đúng trước khi chuyển màn; không reset tab về info sau cập nhật. Xem hồ sơ/Back từ kết quả về đúng tab gọi. Danh sách khôi phục focus vào hồ sơ đã mở.
- Mỗi modal P09 có một history entry cùng URL. Browser Back đóng modal trước. Khi đóng bằng UI, chờ hoàn tất việc trả entry rồi mới gửi request/chuyển màn; tránh cuộc đua giữa popstate và submit. Forward tới marker cũ không tự mở hoặc xác nhận thao tác.
- Serial chuyển từ P06 được tiêu thụ một lần, không đọc lại khi Back/Forward để xóa request cũ. Response muộn không tự điều hướng nếu người dùng đã rời màn. Reconcile vẫn dùng đúng request origin.
- Chặn double Back nhanh ở nút UI để không bỏ qua hai bước. Logout/dispose xóa trạng thái điều hướng trong bộ nhớ, không phục hồi phiên qua Back.
- Không đổi giao diện r04, danh mục lỗi, trạng thái nghiệp vụ, policy, dữ liệu/ledger, baseline hoặc số panel. Không gọi API/hardware mới.

## Kiểm chứng

- `node scripts/check_warranty_navigation.cjs`: **11/11 nhóm PASS**, [navigation-results.json](evidence/revision-05/navigation-results.json). Bao gồm các lỗi tái hiện, P06 nhiều cấp, chọn serial quay về form, dialog Back, giữ tab và nội dung cập nhật dở, double Back, UNKNOWN request/session/version, Forward và logout.
- **164/164 test logic PASS**, [node-tests.txt](evidence/revision-05/node-tests.txt).
- Hồi quy P09 **10/10**, P06 **11/11**, Home **14/14**; lưu trong các thư mục `regression`, `lookup-regression`, `home-regression` của r05.
- Hồi quy fault picker **7/7** và NFC **11/11 PASS**, lưu trong `fault-regression`, `nfc-regression`. Tổng **64 nhóm browser PASS**.
- Test cũ được cập nhật đúng quy tắc mới: hồ sơ mở từ Tiếp nhận phải Back về Tiếp nhận trước Danh sách; BH-001 mở trực tiếp từ Home thì Back một lần về Home. Không bỏ validation hay assertion request.
- Evidence màn đích: [Tra cứu trở về form](evidence/revision-05/lookup-back-to-intake.png), [Back khỏi xác nhận vẫn ở form](evidence/revision-05/confirmation-back-keeps-form.png), [Kết quả trở về tab Lịch sử](evidence/revision-05/result-back-to-events.png).

Mô tả đầy đủ và sơ đồ: [USER_FLOW.md](USER_FLOW.md). Visual tiếp tục chờ user review theo r04; behavior PASS fixture khi các bộ kiểm hoàn tất; integration vẫn BLOCKED, production/hardware NOT_RUN.

Files: `warranty/modal-history.mjs` mới; `warranty/warranty.mjs`; `home/home.mjs`; `lookup/lookup.mjs`; navigation test mới và cập nhật hai browser test; bàn giao/coverage/RUN_STATE. Giữ nguyên 24 board,91 IDs và công việc có trước; không push/merge/deploy.
