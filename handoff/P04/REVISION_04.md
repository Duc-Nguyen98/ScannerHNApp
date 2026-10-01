# P04 revision04 — lượt nhập mới không giữ kết quả cũ

## Nguyên nhân và giải pháp đã triển khai

Home giữ một `mountInbound` trong phiên xác nhận. Trước sửa, `start()` chỉ tạo document khi chưa có; sau thành công, `recorded=true`, step4 và document vẫn tồn tại. Cả action Home và P03 cùng mở controller này nên đều kẹt màn thành công. Adapter còn dùng một receipt và định danh fixture cố định, không phù hợp nhiều lượt liên tiếp.

Giải pháp: controller sở hữu vòng đời lượt, phân biệt hiển thị lại route với re-entry sau khi rời route, và phân biệt kết quả **đã xác định** với **chưa xác định**. Home gọi `leave()` khi chuyển khỏi inbound; cả hai lối vào gọi cùng `start()`.

| Trạng thái trước khi rời | Mở lại Nhập kho |
|---|---|
| Record đã xác nhận | Lượt mới Bước1; reset mã/bộ đếm/ghi chú/request/kết quả/UI phụ |
| Từ chối xác định hoặc check xác nhận chưa record | Lượt mới Bước1; giữ snapshot lượt trước trong bộ nhớ phiên |
| Chưa gửi/đang làm dở | Tiếp tục đúng document/session/version/mã |
| Đang gửi | Giữ yêu cầu đang chạy, chặn gửi trùng |
| Timeout/UNKNOWN/receipt không khớp | Giữ nguyên phiếu/yêu cầu; phải đối chiếu, không reset mù |
| Resume có documentId cụ thể | Không tự chuyển thành phiếu mới hoặc đổi document |

Ở màn gửi thất bại xác định thêm nút **Về Trang chủ**. Nếu người dùng ở nguyên màn và retry, dùng cùng request, chưa tạo lượt mới. Kết quả không bị reset ngay khi vừa nhận phản hồi. Thông báo validation hoặc lỗi scan không được coi là kết thúc toàn phiếu.

Adapter fixture tạo documentId/scanSessionId riêng cho mỗi lượt (`-run-2`, `-run-3`...), request counter không reset. Lưu receipt theo requestId để receipt cũ không thay thế lượt mới. `PN-0005` vẫn là **mã hiển thị mẫu B04**, không tự tăng mã phiếu server hoặc đề xuất schema production. Adapter thật phải cấp/map định danh/mã theo contract đã duyệt. Snapshot kết thúc lưu trong `finishedRuns()` ở bộ nhớ controller, không sửa/xóa server, không phải tích hợp P12 hoặc lưu bền; đóng tab/logout/reload vẫn mất dữ liệu fixture như trước.

## Kiểm chứng

- `node --test tests/*.mjs tests/*.cjs`: **63/63 PASS**, 6 test vòng đời mới +57 cũ. [Output](evidence/revision-04/node-tests.txt).
- Tests mới gồm nhiều lượt với request khác nhau, giữ receipt cũ; failed/not-recorded làm mới sau thoát; draft/UNKNOWN giữ nguyên; thoát khi đang gửi và nhận kết quả muộn; explicit resume/warehouse/permission guard; receipt cũ không xác nhận lượt mới.
- **7 nhóm browser thực PASS**: thành công→action Home mới; thành công→P03 mới; thất bại→P03 mới; draft→Back giữ dữ liệu; UNKNOWN→Back/P03 giữ request và khóa gửi; check xác nhận→Home mới không thêm record; thất bại→action Home mới. Kiểm thêm manual/expanded flags không rò sang lượt mới. [Kết quả](evidence/revision-04/browser-results.json).
- [Thành công](evidence/revision-04/01-completed.png), [Home mở lượt mới](evidence/revision-04/02-home-fresh.png), [P03 mở lượt mới](evidence/revision-04/03-picker-fresh.png), [thất bại](evidence/revision-04/04-failed.png), [UNKNOWN được giữ](evidence/revision-04/05-unknown-preserved.png), [sẵn sàng lượt kế tiếp](evidence/revision-04/06-ready-next-run.png).
- Browser console không có error. Syntax checks 4 module/script PASS. Test guard lần đầu kỳ vọng message không đổi; sửa assertion cho phép thông báo guard nhưng vẫn assert toàn bộ dữ liệu giữ nguyên; rerun63 PASS.
- Sửa kỳ vọng cũ `check_inbound.cjs` vốn yêu cầu mở lại vẫn ở step4 thành step1 + mã rỗng/request null. Không chạy lại full headless browser suites lần này; dùng kiểm trực tiếp trên in-app browser nêu trên.

## Phạm vi file

`inbound-flow.mjs` vòng đời/terminal state/snapshot; `fixture-adapter.mjs` định danh và receipt riêng; `inbound.mjs` reset UI phụ và CTA thất bại; `home.mjs` thông báo rời route; cache entry/import r04; tests và hồ sơ. Giữ khung LOCKED P02/P04 494×950 của revision03, không sửa CSS layout.

Đã kiểm trong **prototype**, backend/camera/API thật vẫn chưa xác minh. Không Post, không tăng tồn, không push/merge/deploy. Preview để tại Bước1 lượt sạch với scenario xác nhận record.
