# P20 r02 — user yêu cầu áp dụng cả6 đề xuất UX

Nguồn: yêu cầu hiện tại “Áp dụng đề xuất cho tôi” sau6 đề xuất P20. Đây là cho phép triển khai, chưa phải nghiệm thu hình thức.

| Thay đổi | Nguồn/giới hạn |
|---|---|
| Link thông tin hồ sơ dưới context | User-approved UX; giữ context B20 và owner P09 |
| Tóm tắt/thu gọn phiếu | User-approved UX; >3 SKU mới thu gọn; lưu trạng thái theo case/document trong phiên; không suy missing quantity thành0 |
| Xem mã gốc | Dialog action-feedback hiện có, chỉ đọc; không tạo endpoint/copy policy mới; không suy loại tem từ chuỗi mã |
| Phiếu vừa xuất | Chỉ receipt POSTED xác minh của owner P19 qua caller P09; không tin URL tự khai; focus1lần khi chủ động mở |
| Phiếu dở tại footer | ID/counts từ owner hiện hữu; UNKNOWN đối chiếu trước; không bổ sung policy P21 |
| Phần mới tải | ID mới sau dedup; giữ scroll/focus, nút chủ động đi đến phần mới; không dùng toast |

Số đo giữ từ r01: frame494×950, header86px; scroll padding20/gap14; card radius12/padding18; icon md44/sm32; footer padding18/20/24 và CTA60. Controls mới min44px, summary14px/1.5, label14px. Footer P20 có thêm context khi tồn tại pending; footer Home/P03 bất biến. Sizing các nhánh mới là implementation choice cần review, không phải số đo Designer. Giữ Public Sans/local icon/palette chung, dialog/readable contract.

Trước sửa: chụp4panel theo r01 hiện hành, viewport494×950/DPR1, cùng fixture; snapshot source scoped vào evidence/revision-02/before. Không thay baseline B20/r01 artifacts. Không sửa source P19 hoặc nghiệp vụ Post.
