# P10 r10 — nguồn và phạm vi trước audit

User yêu cầu rà soát kỹ và sửa lỗi UI/UX. Bản nền là P10-r09: tiêu đề Tài khoản của tôi căn giữa; footerLOCK; nhóm menu/logout r02; form/dirty/keyboard/touch r03–r05. Giữ các thay đổi đồng thời P14/P18 và warning logout.

| Nguồn | Áp dụng |
|---|---|
| User mới nhất | Sửa lỗi tái hiện được; không tự redesign hoặc đổi nghiệp vụ |
| AGENTS/UI_STANDARD | Dialog/readable/footer/icon contract mới nhất; before–after cùng điều kiện; kết quả test không thay visual acceptance |
| Current source | Hit-area mở rộng44px, form keyboard inset, P10 async feedback và Home/P14 caller cần stress test |
| Lựa chọn triển khai | Nếu hit-area chồng nhau hoặc tràn khỏi vùng nút: ưu tiên đúng mục tiêu và biên cuộn; có thể tăng vùng hàng ở viewport thấp, không đổi icon/reference494 hoặc nav |

Ca bổ sung tại scripts/check_profile_edge_audit.cjs; evidence before giữ trước sửa. Không cần contract backend mới cho sửa history/lifecycle/geometry. Không push/deploy hay gọi API/phần cứng.
