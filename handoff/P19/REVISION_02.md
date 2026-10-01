# P19 r02 — sáu cải tiến UX

Đã áp dụng yêu cầu “Áp dụng đề xuất cho tôi”. Giữ P19.S01–S04, khung494×950 và footer Home/P03. **Behavior: PASS prototype; visual: AWAITING_USER_REVIEW; integration: BLOCKED_PRODUCTION.**

1. Nhập tay: camera64px, ẩn hàng nút chế độ trùng với nút Thu gọn, ưu tiên ô nhập và các mã mới nhất. Nhận mã hợp lệ giữ nguyên DOM ô nhập, xóa mã đã nhận và trả focus; không tạo toast.
2. Dòng BOX chưa ghi nhận có nút **× số lượng · Sửa** ở Kiểm tra. Dùng lại sheet và owner số lượng; Hủy/Back giữ số cũ và trả focus. Tem đơn giữ1; đã ghi nhận/UNKNOWN không sửa.
3. Ô số lượng tự chọn toàn bộ; khóa giảm tại1, khóa tăng tại tồn đã xác minh. Dữ liệu sai báo tại field; thiếu tồn không suy thành0.
4. P09 hiển thị **Tiếp tục phiếu · N mã / Q linh kiện** trong đúng hồ sơ/actor/kho/phiên. Tiếp tục truyền ID hiện hữu, không tạo phiếu mới. UNKNOWN hiển thị **Đối chiếu kết quả xuất**.
5. UNKNOWN đưa hướng dẫn ngay dưới hồ sơ; phần **Chi tiết đối chiếu** mở rộng chứa nguyên ID phiếu/yêu cầu/phiên quét/version, nhớ trạng thái mở trong phiên.
6. Sau kết quả được xác minh, CTA hoặc Back trong header về đúng P09/Linh kiện và focus, cuộn, viền phiếu mới. Marker tiêu thụ một lần; nền tab đặc tránh chữ chồng khi cuộn.

## Kiểm chứng

| Nhóm | Kết quả | Evidence |
|---|---|---|
| Logic P19 và owner liên quan |104/104|evidence/revision-02/node-tests.txt|
| P19 cơ bản |9 nhóm,20 tổ hợp panel/viewport|evidence/revision-02/after/results.json|
| P19 ngoại lệ |8 nhóm|evidence/revision-02/edges/results.json|
| Sáu cải tiến |8 nhóm,15 tổ hợp trạng thái/viewport|evidence/revision-02/ux/results.json|
| Điều hướng P09 |11 nhóm|evidence/revision-02/p09-regression/navigation-results.json|
| Đăng xuất/bản nhập P18 |3 nhóm|evidence/revision-02/p18-logout/results.json|
| Footer Home/P03 |4 viewport|evidence/revision-02/footer/results.json|

Tổng39 nhóm browser,35 tổ hợp layout P19 và4 viewport footer. Không có pageerror trong các runner. Các lỗi layout phát hiện trước khi hoàn tất đã sửa: thừa cuộn nhỏ ở review, nút resume bị chia nửa chiều ngang, nền tab trong suốt khi cuộn, Back header chưa truyền ID receipt. File after/failure.json và failure.png là dấu vết lượt kiểm tra ban đầu; kết quả cuối là results.json.

## Nguồn hình thức và đối chiếu

[Bảng nguồn trước sửa](REVISION_02_CONTEXT.md), [xem trước–sau](REVIEW_02.html). R01 giữ ở REVIEW_01.html và evidence/revision-01. Bốn panel chụp lại cùng viewport494×950/DPR1/fixture B19. Sáu trạng thái UX có ảnh before/after cùng viewport, số lượng và case; before được render lại bằng6 module/CSS r01 đã lưu, qua response routing của Playwright, không rollback workspace. R01 cần mở lại nhập tay sau khi nhận mã; sửa BOX phải quét lại vì chưa có nút review. ID ngẫu nhiên/thời điểm phiếu khác giữa lần chạy, không dùng pixel-diff để tự nghiệm thu.

Đã xem ảnh thực tế của nhập liên tục, sheet, review, UNKNOWN, resume và phiếu mới P09. Layout mới là adaptation theo đề xuất user cho phép triển khai; không tự coi là Designer đã nghiệm thu. Khoảng cách card review8px là lựa chọn triển khai để giữ nút sửa44px và fixture ngắn vừa khung; dữ liệu dài vẫn cuộn nội bộ.

## Giới hạn

Chỉ mô phỏng trong bộ nhớ trang; reload mất phiếu. Kiểm tra focus bằng Chromium desktop không chứng minh bàn phím ảo/scan hardware trên thiết bị thật. Production create/Post/status/idempotency/stock chưa tích hợp; P20/P21/P24 chưa hoàn tất. Giữ UNKNOWN trước retry và chỉ thành công khi receipt đúng ID/context được xác minh. Không thay policy đóng hồ sơ hoặc quyền backend.

Preview: http://localhost:8766/flows/auth-session/ · minhanh / preview. Tải lại trang, vào Bảo hành → BH-001 → Linh kiện → Xuất linh kiện. Mã thử LK0001-HN001 và BOX-LK-0002-01. Bộ mô phỏng nằm ngoài app.
