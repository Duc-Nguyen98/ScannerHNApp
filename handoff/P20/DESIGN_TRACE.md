# P20 r01 — nguồn và số đo trước triển khai

Ngày 2026-09-29. HEAD thực tế = baseline `da9f623a19d0359c3e80c14f8cc612636ec6ab78`; working tree có nhiều module chưa commit của các chat trước, giữ nguyên. Target: prototype HTML/CSS/JS trong `docs/flows`, không sửa dist/gallery. Không có package.json gốc.

User tạm chốt P19 r03 trong yêu cầu hiện tại; các state đồng bộ bổ sung sau. Đây không phải nghiệm thu production.

| Hạng mục | Baseline/nguồn | Áp dụng P20 |
|---|---|---|
| Panel | B20, P20.S01–S04, BOARD_INDEX | Giữ 4 ID CURRENT; loading/error inline cuối danh sách |
| Frame | Prototype cũ 390×844; user khóa mới 494×950 | AppShell hiện có, scale đồng nhất; không dùng kích thước ảnh làm viewport |
| Header/footer | `issue.css` `.p19-header`/`.p19-footer` | Reuse geometry 86px; footer padding18/20/24, CTA60px; không status bar/gesture giả |
| Body | `issue.css` `.p19-scroll` | padding20px, gap14px, radius24px, offset−12px; cuộn nội bộ |
| Card | B20 white context + grouped receipts; prototype card radius12/padding15 | radius12, border1; padding18 từ P19 đã điều chỉnh cho frame494 |
| Font | local Public Sans, `issue.css` | title24/1.3; body17/1.5; metadata14–15px; labels19–21px |
| Controls | B20 load more + footer CTA | inline load/retry54px, CTA60px, Back44px, focus-visible từ P19 |
| Icon | B20 wrench/doc/box; UI_STANDARD icon lock | SVG có sẵn, stroke1.8; pastel warranty/documents; md44px, sm32px; không tạo ảnh |
| Baseline crop | B20 3584×2080, 4 phone cards | Toàn ảnh giữ nguyên; không raster-diff vì frame/platform và palette được user đổi; bố cục 4 panel quan sát từ ảnh, không coi là CSS chính xác |

VERIFIED_SOURCE: AGENTS, UI_STANDARD, issue.css, warranty.mjs, shared/warranty-cases.mjs. CONFIRMED_HANDOFF: chỉ POSTED đúng case, dedup ID, giữ cursor/dữ liệu khi lỗi. USER_CHANGE: frame494×950, icon pastel, dialog/readable text, P19 tạm chốt. IMPLEMENTATION_CHOICE (cần review): P20 là trang lịch sử riêng mở từ tab Linh kiện P09, quay lại P09 để xem thông tin/quá trình; không thay layout P09 đã có.

Adapter read nội bộ dùng fixture nguồn chung P09 + receipt đã xác minh của P19. Demo 4 panel dùng tập B20 riêng, không thêm vào sổ P09. Cursor fixture không phải endpoint/backend contract. Không có nguồn thành công thì không hiện empty hay số0. Production pagination/scope/ID còn chờ xác minh.
