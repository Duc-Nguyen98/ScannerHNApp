# P17 r01 — nguồn trước triển khai

Source HEAD da9f623a19d0359c3e80c14f8cc612636ec6ab78; target prototype trong docs/flows. Working copy có P01–P16 chưa commit; lưu bản source dependency trước chỉnh trong evidence/revision-01/before/source. Không sửa baseline/gallery/dist.

| Thành phần | Nguồn | Quyết định |
|---|---|---|
| Bốn panel và cảnh báo/khung camera đỏ/card/CTA | OBSERVED_IMAGE B17.png, board 15_ngoai_le_quet_fixed.png, prompt P17 | Giữ ID S01–S04, dựng HTML/CSS riêng theo panel; owner P04/P05/P07 |
| Khung màn | CONFIRMED_HANDOFF + chỉ thị user 494×950 CSS px | Scale đồng nhất bằng AppShell hiện hữu; không status bar/home-indicator giả |
| Header/content | B17 estimated: mỗi màn x≈28/406/781/1156, y≈111, w≈354–357, h≈832; header nội dung y≈158–209; body x inset≈14–16, gaps≈12–14 raster px | Dùng header owner 63px, overlap14px, content16px; đây là adaptation theo shell đã khóa, không giả là CSS Designer |
| Font/control/card | B17 estimated: title≈20px, body≈16px, CTA≈52px, card radius≈12px raster | Arial owner P04/P05/P07; title22/32, body16/24, control56, radius14 CSS px; cần user review |
| Footer S01 | HN-footer-locked-v1 trong UI_STANDARD, home/style.css .hn-nav | Hiện component chung, không đổi style; S02–S04 dùng dock hành động owner |
| Icon | HN-operation-icon-v1 | Dùng icon source scanner-dialogs/home/lookup, ô pastel theo nghiệp vụ; warning đỏ/cam riêng |
| Camera | B17 ảnh kiện hàng có barcode, chưa thấy asset riêng xác minh đúng | Tái dùng ảnh kho P04, center/cover, reticle đỏ và nhãn Camera chưa kết nối; khác biệt phải công bố |
| Dialog/nội dung dài | HN-action-feedback-v1 / HN-readable-content-v1 | Panel ngoại lệ có ID giữ nguyên, không mở thêm dialog thông báo trùng; field validation và reader hiện có |
| UNKNOWN | P17.A04/A05 + HANDOFF, không dùng DEV_PROPOSAL làm API | Chủ phiếu giữ request/document/scan session/version/mã; check chỉ đọc; resend chỉ phản hồi khớp request và cho phép retry |
| NFC conflict | P17.S03 + P07 source | Mapping do adapter trả; Xem liên kết dùng dialog chỉ đọc P07; không đổi UID mẫu thành B17 nếu fixture khác |

Visual chưa nghiệm thu. Nguồn backend, thiết bị thật và API status/resend production chưa có. Không biến UNKNOWN Post linh kiện thành record nhập/xuất; P21/P24 còn pending.
