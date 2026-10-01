# P04/P05 audit r02 — nguồn trước sửa

User yêu cầu rà soát sâu và sửa lỗi UI/UX sau sáu nâng cấp thao tác. Phạm vi subtask: P04/P05; không đổi business contract, owner, footerLOCK, 494×950, ID panel hoặc shared primitives do root phụ trách.

| Nguồn | Giữ / áp dụng |
|---|---|
| Baseline B04/B05 và UI_STANDARD | Bốn panel mỗi board, cấu trúc khung/header/footer, các bước nghiệp vụ |
| User sáu nâng cấp 30/09/2026 | Nhập tay liên tục, camera gọn, so sánh đổi phiếu |
| HN-action-feedback / HN-readable-content | Một dialog, nền inert, full text trong vùng cuộn; không chèn toast làm đổi layout |
| Actual source trước sửa | before-source chứa bản module/CSS/helper hiện tại ngay trước audit |
| Lựa chọn triển khai | Chỉ sửa lỗi tái hiện, hình thức mới chờ review; không tự gọi visual PASS |

Không gọi API thực trong kiểm thử; địa giới mock qua route. Browser riêng, không thao tác tab/nháp của user. Không push/deploy/phần cứng hoặc persistence.
