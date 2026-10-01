# P10 r02 — nhóm menu Cá nhân và hành động Đăng xuất

User duyệt áp dụng phương án ở chat sau ảnh `C:/Users/TAN MIE/Desktop/1.png`. Phạm vi: P10.S01 và hình thức nút xác nhận logout; giữ 4 panel, không đổi nghiệp vụ.

- Ba mục hồ sơ/quyền/bảo mật chung một card trắng, hàng cao80px, phân cách1px; icon pastel md44/icon26 theo chuẩn chung. Bỏ ba mô tả lặp nghĩa.
- Kết thúc ca tách hàng riêng, giữ mô tả phân biệt luồng ca và phiên đăng nhập.
- Đăng xuất là nút rộng toàn nội dung, cao56px, radius12px, cách hàng ca20px; nền `#b42318`, chữ/icon trắng căn giữa. Bỏ chevron và mô tả đăng xuất.
- Bỏ footer “Bản xem trước · P10-r01” và “Hoa Nam Scanner – Operational Pro” trong app. Revision r02 còn trong công cụ review ngoài app.
- Dialog logout dùng Hủy / Đăng xuất, nút xác nhận cùng màu đỏ. Escape, Back hoặc Hủy chỉ đóng dialog. Dirty dialog và các CTA lưu khác giữ màu/hành vi trước.

## Kiểm chứng

- `$env:PROFILE_EVIDENCE_DIR='handoff/P10/evidence/revision-02'; node scripts/check_profile.cjs`: **12/12 nhóm PASS**, 24 layout captures (4 panel × 6 viewport), không lỗi JS hoặc request ngoài localhost.
- Đã xem trực quan [màn Cá nhân](evidence/revision-02/profile.png) và [dialog đăng xuất](evidence/revision-02/logout-dialog.png). [Thông số ghi nhận](evidence/revision-02/logout-review.json): nút56px, nền cả hai nút rgb(180,35,24), chữ trắng; Escape và browser Back đều giữ phiên.
- Hồi quy sẵn có kiểm đủ editor dirty state, profile identity, readonly, quyền, P11/P14 pending, dialog scanner, logout và bảo toàn localStorage fixture.
- Không viết test logic mới cho chỉnh sửa bố cục/màu. Không chạy lại toàn repo; backend và phần cứng chưa tích hợp, không suy kết quả production từ fixture.

Visual: thực thi phương án user đã duyệt, ảnh actual sẵn sàng review. Behavior: PASS trong phạm vi prototype. Integration: BLOCKED như r01.

## File

`docs/flows/profile/profile.mjs`, `style.css`, `profile-model.mjs`; `auth-session/index.html` version CSS; `scripts/check_profile.cjs` thêm thư mục output qua env để giữ evidence r01. Cập nhật REPORT/REVIEW, coverage, RUN_STATE và evidence theo r02. Các màn P01–P09 và gallery/dist không sửa.
