# P13 — nguồn và số đo trước triển khai r01

Source HEAD: da9f623a19d0359c3e80c14f8cc612636ec6ab78. Working copy có P01–P12 và đồng bộ UI chưa commit; giữ nguyên. Target là prototype HTML/CSS/JS `docs/flows`, không phải dist/gallery hay WMS.

Nguồn: B13 đính kèm (1536×1024); `design/01_Main/BOARDS/02_NEW_BOARDS/11_thong_bao_phe_duyet.png`; Contract v2.0; `docs/flows/warranty-components/HANDOFF.md` mục Quy tắc UI/Tài liệu cũ; `shared/UI_STANDARD.md`. DEV_PROPOSAL không chốt notification API/quyền đọc. P12 r05 được user tạm chốt ở lượt này, chưa nghiệm thu production.

| Hạng mục | Số đo/nguồn | Mức chắc chắn |
|---|---|---|
| Crop panel B13 | S01 x30–383, S02 x406–757, S03 x779–1132, S04 x1154–1508; y99–972 | estimated từ ảnh; không dùng làm viewport |
| Khung app | 494×950 CSS px, scale đồng nhất | khóa user; `home/style.css .hn-screen` |
| Header | 88px, padding14px 20px 26px; title25px/1.3 | component P12 `.p12-header`, kế thừa màn đã tạm chốt |
| Body | nối bo24px, overlap12px; padding20px 24px; vùng trong cuộn | P12 component; B13 bo khoảng18px trên ảnh (estimated) |
| Footer | min75px, padding8px, radius23px; scan62px | HN-footer-locked-v1; dùng đúng nav hiện có |
| Card/gap | ảnh card inset14–18px/gap9–12px (estimated); triển khai padding18px/gap16px, nhóm24px | điều chỉnh theo readable contract ở khung494 |
| Font | Arial hiện có; body18px/1.5; title25px; metadata15–16px | P12/home CSS; không tự tải font |
| Control | min44px; filter48px; CTA54px | component hiện có; B13 estimated control33–52px raster |
| Icon | ô44/56px, nét1.8, radius10/12px | UI_STANDARD md/lg và operation-icons.css |
| Reader | note2 dòng; narrative3 dòng; reader1.6 | HN-readable-content-v1, shared/readable-text |
| Surface | trắng/card trên nền #f1f7f9; header gradient hiện có | Home/P12 components; không sao chép nền board |

S03/S04 disposition MIGRATED theo HANDOFF: bỏ quyết định duyệt và form từ chối, theo dõi Web chỉ đọc. Khu vực thay thế là candidate cần user review, không LOCKED/pixel-perfect. S01/S02 giữ cấu trúc thông báo; preview events tách module, không bịa service/push hay giả badge production. Badge Home sẽ đọc số chưa đọc từ cùng nguồn preview P13 thay vì hằng số độc lập. Danh sách chờ đọc chung P12, không suy document ID từ prefix.
