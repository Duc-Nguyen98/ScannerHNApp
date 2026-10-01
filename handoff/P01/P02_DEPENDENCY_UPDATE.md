# Cập nhật dependency trong P02 — 2026-09-25

Người dùng tạm chốt P01 và cho thực hiện P02. P01 không được coi là visual/backend PASS.

Đã nối P01.S02 → P02 sau `previewReady` tại entrypoint `app.mjs`; thêm stylesheet Home có scope riêng trong `index.html`, cập nhật ghi chú prototype. Auth controller/adapter, CSS và icon P01 giữ nguyên. Không bổ sung state nghiệp vụ P01. Text pending P02 bên trong controller cũ không còn render khi Home mount; giữ controller và contract test cũ nguyên byte để tránh sửa state chưa được yêu cầu.

[Bằng chứng P02](../P02/evidence/browser-results.json): login → confirmation → Home; danh tính Lan từ phiên; thiếu quyền/kho dừng/UNKNOWN không mở Home; logout/Back/reload không khôi phục Home. [33 regression tests](../P02/evidence/test-output.txt) PASS.

Dependency P02 ở mức prototype đã nối. P14 và auth/backend thật vẫn BLOCKED. Các khác biệt visual P01 theo revision04 giữ nguyên, chưa nghiệm thu lại.
