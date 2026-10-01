# P23 r01 — nguồn và quyết định trước triển khai

Ngày 30/09/2026. HEAD thực tế `da9f623a19d0359c3e80c14f8cc612636ec6ab78`; working copy có nhiều thay đổi P01–P22, được giữ nguyên. Target: prototype HTML/CSS/JS `docs/flows/auth-session` + module `history`. Không sửa gallery/dist/baseline.

| Phần | Nguồn | Áp dụng |
|---|---|---|
| B23 S01–S04 | OBSERVED_IMAGE, prompt P23/BOARD_INDEX | Danh sách bảo hành, timeline, danh sách phiên, chi tiết + stat strip; giữ bốn ID |
| Khung | user chốt 494×950 CSS px; Home fitPreview | Co đồng nhất, không dùng kích thước ảnh làm viewport |
| Header | VERIFIED_SOURCE history/style.css `.p08-header` | 86px, padding16px 20px 24px; tiêu đề26px/1.2; back44px |
| Nội dung | B23 + P22 CSS đã tạm chốt | padding20px, gap14px, card radius12px/border1px; card padding18px là adaptation cho frame494 |
| Font | prototype warranty-components/fonts | Public Sans local; body16px/1.5, phụ14px; title22px |
| Controls | history/style.css + history-controls | Search50px, tabs44px; minimum target44px; giữ dock ngoài vùng cuộn |
| Footer | B23 có CTA quay lại; P22 `.p22-footer` | padding16px 20px 20px, CTA56px; KHÔNG đổi nav Home/P03 |
| Icon | UI_STANDARD + operation-icons.css | Ô md44px/icon26px; palette nghiệp vụ duy nhất; SVG có sẵn |
| Timeline/stat strip | OBSERVED_IMAGE | timeline dọc; ba cột accepted/rejected/quantity, duplicate hiển thị riêng; không gộp số lượt và quantity |
| Crop | B23 ảnh3584×2080 | Bốn phone x khoảng144/980/1816/2653, y228, w782 h1690 (estimated); ảnh cũ390×844 khác frame hiện hành, không pixel-diff kéo méo |

Business: HANDOFF có ưu tiên; DEV_PROPOSAL chỉ tham khảo, không gọi endpoint đề xuất. Bảo hành đọc trực tiếp owner shared/warranty-cases, không tạo bảng lịch sử khác; timeline chỉ events có ID. Phiên quét tách nguồn; mặc định unavailable, mẫu B23 opt-in bên ngoài app. Không suy session từ thời gian hoặc auth. Giữ missing khác0. Hồ sơ đóng chỉ đọc, link đúng case sang P20; không thêm mutation. Filter lịch sử mặc định Tất cả ngày; picker shared Apply-only. Back/filter/scroll riêng từng danh sách trong phiên.

Nhánh empty/error/unavailable, tìm kiếm phiên và picker ngày là adaptation từ component hiện hữu, cần user review, không phải raster Designer riêng. Visual luôn AWAITING_USER_REVIEW đến khi user duyệt.
