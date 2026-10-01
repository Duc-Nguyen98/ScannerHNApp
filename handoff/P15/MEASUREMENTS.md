# P15 r01 — nguồn và số đo trước triển khai

Ngày 2026-09-29. HEAD da9f623a19d0359c3e80c14f8cc612636ec6ab78; target docs/flows HTML/CSS/JS. Working copy chứa công việc P01–P14 của các chat khác (phần lớn untracked); không reset hoặc coi đó là thay đổi P15.

| Thành phần | Nguồn | Số đo / quyết định |
|---|---|---|
| Bốn panel | B15.png 1774×887, BOARD_INDEX P15 | Crop estimated: (53,67,388,785), (480,67,387,785), (905,67,388,785), (1332,67,388,785). Board là ảnh tham chiếu, không viewport |
| Khung | User khóa; home/style.css .hn-screen | 494×950 CSS px; scale đồng nhất; không status bar giả |
| Header | B15 cấu trúc; P14 .p14-header component | 100px, padding14px 20px 24px; title25px; nút Back44px |
| Footer | HN-footer-locked-v1; home/style.css .hn-nav | Dùng nguyên node/footer caller, 5 menu; min-height75px, icon25px, scan62px; không CSS override footer |
| Nội dung | B15 estimated | Bề mặt sáng, card trắng; S01–03 icon/copy/CTA căn giữa; S04 hai card riêng |
| Lề/gap | P14 component + lựa chọn adaptation | Lề24px, gap16px; card padding20px; radius16px (B15 estimated khoảng16px) |
| Typography | P14 thực thi / B15 estimated | Arial hiện có; body18/27px; tiêu đề26/34px; trạng thái18px; không tải font mới |
| Control | P14/shared hiện có | CTA56px radius12px, gap12px; target Back44×44px |
| Icon | SVG sẵn có trong repo | Stroke1.8, không tracing; hero112px trong ô144px pastel trạng thái; thiết bị56px/icon30px; không dùng màu nghiệp vụ cho lỗi |
| Scroll | UI_STANDARD | Nội dung cuộn riêng; header/footer cố định; dialog dùng action-feedback chung |

User tạm chốt P14 r05 trong yêu cầu hiện tại, cho phép bổ sung state sau; không suy nghiệm thu production. P15.S02 giữ footer theo B15 nhưng guard mọi mục khi phiên hết hạn. Không tạo mục Hệ thống trong navigation sản phẩm; chỉ công cụ preview và lỗi từ caller mở P15. Header/hero glyph và nền là adaptation từ component, chưa được Designer duyệt pixel. Gallery online không truy cập được qua web tool; dùng BOARD_INDEX, ảnh đính kèm và source cùng commit làm nguồn. Before cho board mới là B15, không giả ảnh actual cũ.
