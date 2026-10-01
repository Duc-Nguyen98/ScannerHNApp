# P14 · nguồn và số đo trước triển khai · r01

Source HEAD: da9f623a19d0359c3e80c14f8cc612636ec6ab78. Target prototype HTML/CSS/ES modules tại docs/flows; working copy P01–P13 được giữ nguyên. B14 do user cung cấp là baseline trực quan. User tạm chốt P13 r06 ngày 2026-09-29, có thể bổ sung state sau; không nghiệm thu production.

| Vùng | Nguồn | Áp dụng / độ chắc chắn |
|---|---|---|
| Bốn panel | OBSERVED_IMAGE B14, crop x30–383 /405–758 /781–1134 /1156–1509; y60–986 trên ảnh1536×1024 | estimated, chỉ tham chiếu bố cục; không lấy kích thước crop làm viewport |
| Khung | USER_CONFIRMED, home/style.css, auth-session/style.css | 494×950 CSS px, scale đồng nhất, header/footer cố định, body cuộn |
| Header | VERIFIED_SOURCE P13/P10 | 88px, nền gradient hiện có; title25px, back42×44; phụ đề kho18px của B14 |
| Padding/gap | B14 estimated + shared UI_STANDARD | lề24px, gap16px; recovery hero cách field32px |
| Font | VERIFIED_SOURCE modules | Arial18px/1.5; heading28px; reader1.6; không tuyên bố font gốc B14 |
| Controls | B14 estimated, P10/P13 components | nút56px, input58px, radius12px; form một field, receipt và grid summary giữ nguyên |
| Surface | USER_CONFIRMED UI chung + B14 | trắng liền, khối notice màu trạng thái; card viền nhẹ radius12px |
| Icon | VERIFIED_SOURCE profile/icons.mjs + operation-icons.css | SVG repo stroke1.8; ô44/56px pastel theo nghiệp vụ; success/warning tách palette |
| Footer | USER_CONFIRMED HN-footer-locked-v1 | dùng nguyên hn-nav Home khi đăng nhập; recovery không nav theo B14; S03 giữ menu chung là lựa chọn triển khai cần review |
| Nội dung dài | USER_CONFIRMED HN-readable-content-v1 | markers shared; ghi chú2 dòng, mô tả3 dòng, reader giữ nguyên nguồn |

Implementation choices cần review: bỏ status bar/khung máy giả; dùng shell494×950; nút Kết thúc ca có confirmation dùng shared action-feedback; bỏ lời hứa quản trị sẽ chủ động liên hệ và tự bàn giao ca sau. Chú thích proposal và nguồn fixture ở công cụ ngoài app. KPI12+6+4+3+5=30 là aggregate fixture B14, không lấy từ danh sách client. Kênh recovery, aggregate thật và policy end-shift production UNKNOWN theo README/Contract; DEV_PROPOSAL không phải contract API.
