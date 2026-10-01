# P10 r10 — rà soát lỗi tương tác sau các nâng cấp

User yêu cầu rà kỹ và sửa lỗi UI/UX. Phạm vi đã kiểm/sửa: P10, helper vùng chạm/bàn phím và điểm quay về từ P14 trong Home. Giữ tiêu đề **Tài khoản của tôi căn giữa**, cấu trúc4 panel, footerLOCK và các thay đổi đồng thời P18/logoutWarning.

## Lỗi tái hiện và xử lý

Bộ audit mới trước sửa có **5 ca FAIL /2 ca PASS**, thuộc4 nhóm nguyên nhân. Sau sửa **7/7 PASS**. [Trước](evidence/revision-10/before/results.json), [sau](evidence/revision-10/after/results.json).

| Nguyên nhân | Bằng chứng trước sửa | Cách sửa |
|---|---|---|
| Vùng nhận bấm mở rộng chồng nhau khi chiều cao preview thấp |3 cặp hit-area giao nhau ở340×420 | Hàng menu, hàng ca, logout và CTA/dialog P10 có min-height thích ứng theo scale khi cần; không chỉ phủ một vùng bấm lớn lên hàng kế bên. Reference494 giữ kích thước cũ. |
| Padding dành cho bàn phím còn sót sau Done/blur | Giả lập visualViewport đóng lại vẫn còn488px inset | Helper xử lý focusout/Done/resize; xóa inset khi không còn field đang nhập. Cancel frame khi clear/dispose. Không đổi dữ liệu nhập hoặc tự submit. |
| Kết quả avatar đến sau khi route/view đã thay đổi vẫn mở dialog | Cả đổi route và rời rồi mở lại P10 đều xuất hiện1 dialog cũ | Feedback phải khớp viewVersion và route lúc bắt đầu. Áp dụng guard tương tự cho save; không phát thông báo thuộc màn cũ lên màn hiện tại. |
| Back từ Kết thúc ca push thêm trang Cá nhân | Browser Back lại mở P14 thay vì Home | Home lưu caller của lần vào Shift; Back dùng entry caller thật, chặn Back lặp. Deep-link không có caller dùng replace fallback, không tạo vòng lặp mới. |

Hai ca avatar bị cuộn khuất một phần và hit-area dialog nằm trong footer đã PASS trước sửa; giữ làm kiểm chứng bảo vệ biên, không gọi là lỗi đã sửa.

Trong vòng sửa min-height đã phát hiện nguy cơ co/giãn lặp khi control cuộn khỏi khung: helper cũ xóa luôn biến kích thước. Đã sửa để giữ kích thước layout khi control khuất, chỉ bỏ hit rectangle; giải phóng cả hai khi rời module. Quan sát resize từng control để cập nhật geometry sau khi layout thay đổi. Lần chạy có layout chưa ổn định không được tính PASS; kết quả cuối bên dưới đã chạy lại.

## Visual và giới hạn thay đổi

- Nguồn trước sửa: [CONTEXT_REVISION_10.md](CONTEXT_REVISION_10.md), P10-r09 hiện hành và yêu cầu sửa lỗi. Không tự chuyển thay đổi này thành baseline Designer.
- [Before cửa sổ thấp](evidence/revision-10/before/compact-profile-crop.png) / [After](evidence/revision-10/after/compact-profile.png), cùng viewport340×420, DPR1, Arial, fixture Minh Anh. Before là crop estimated x60–280/y0–420 từ [ảnh raw](evidence/revision-10/before/failure-1.png); không kéo dãn/đổi pixel. Có sai số làm tròn crop; không dùng pixel-diff để tự nghiệm thu.
- [Dialog sau sửa](evidence/revision-10/after/compact-dialog.png). Nút lớn hơn ở viewport thấp là lựa chọn triển khai để ngăn bấm nhầm, cần user xem actual; không đổi icon hoặc footer nav. Nội dung dài vẫn cuộn trong app.
- Reference494 và bốn panel giữ bố cục hiện hành; ảnh mới tại `evidence/revision-10/regression/`. Không thêm thông báo kết quả inline, không sửa copy/title vừa chốt.

## Kết quả kiểm chứng thật

| Lệnh/phạm vi | Kết quả |
|---|---|
| `PROFILE_EDGE_EVIDENCE_DIR=.../before node scripts/check_profile_edge_audit.cjs` |5 FAIL/2 PASS trước sửa; dùng làm regression evidence |
| `PROFILE_EDGE_EVIDENCE_DIR=.../after node scripts/check_profile_edge_audit.cjs` |7/7 PASS sau sửa |
| `PROFILE_EVIDENCE_DIR=handoff/P10/evidence/revision-10/regression node scripts/check_profile.cjs` |12/12 nhóm PASS,24 layout captures |
| `PROFILE_ERGONOMICS_EVIDENCE_DIR=handoff/P10/evidence/revision-10/ergonomics node scripts/check_profile_ergonomics.cjs` |8/8 nhóm PASS, gồm keyboard/IME/autofill, tên dài, vùng chạm và hành trình liên tục |
| `node --test tests/profile.test.mjs tests/dialog-route.test.mjs tests/home.test.mjs tests/auth-session.test.mjs` |31/31 PASS; [log](evidence/revision-10/node-tests.txt) |

Tổng cuối **27 nhóm browser PASS +31 test logic**. Env thực tế thiết lập bằng `$env:...` trong PowerShell. Ma trận494×1000,360×800,430×932,1440×900,340×420,1869×940. Giữ kiểm dirty Back/Forward, default P11/P14 edges, logout giữ phiếu dở/không phục hồi phiên, reader/focus, footer, resize và continuous Home→Nhập→Tra cứu→Lịch sử→P10→logout. Không chạy full repo hoặc nhận kết quả từ revision cũ làm kết quả mới.

Kiểm bàn phím dùng visualViewport mô phỏng và Chromium desktop; cảm ứng/keyboard thiết bị thật **NOT_RUN**. UI production/profile save/avatar/permissions chưa có contract thật vẫn **BLOCKED**. Giữ nguyên nghiệp vụ P14/P18; chưa gọi API/phần cứng/mutation ngoài fixture.

## Môi trường và khả năng tái hiện

Các lần chạy đầu gặp timeout tải module/trang trống nên không dùng để kết luận lỗi sản phẩm. Máy chủ8766 hiện hữu PID16116 được kiểm đúng command `scripts/serve_preview.py --port8766`. Lệnh tạo máy chủ QA riêng bị automatic approval review chặn với lý do duy nhất “blocked by policy”; không tạo server đó, không tìm cách vượt chặn. Tiếp tục trên8766; audit mới tái sử dụng trang đã tải và reset fixture giữa case để giảm số lần tải module. Các case có assertions cuối đều chạy trên source thực.

## File và bàn giao

Sửa `profile/profile.mjs`, `style.css`, `profile-model.mjs`; `shared/form-navigation.mjs`, `shared/scaled-controls.mjs`; `home/home.mjs` chỉ caller/Back P14; `auth-session/index.html` revision CSS. Mới `scripts/check_profile_edge_audit.cjs`; `scripts/check_profile_ergonomics.cjs` thêm env output để không ghi đè evidence r05. Source checksum tại `evidence/revision-10/source-sha256.json`.

HEAD `da9f623a19d0359c3e80c14f8cc612636ec6ab78`; target prototype. Giữ24 prompt/91 panel, không sửa baseline/dist/gallery, không push/merge/deploy. Global RUN_STATE của P18 đang thực hiện được giữ; chỉ cập nhật record P10.

**Visual:** sửa các vùng lỗi, actual chờ user review. **Behavior:** PASS trong phạm vi ca đã chạy. **Integration:** không suy PASS backend hoặc tuyên bố toàn app hết mọi lỗi.
