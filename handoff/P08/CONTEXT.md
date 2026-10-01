# P08 — nguồn, số đo và quyết định trước triển khai

2026-09-27 · revision P08-r01 · target_kind=prototype.

- VERIFIED_SOURCE: HEAD da9f623a19d0359c3e80c14f8cc612636ec6ab78, repo local ScannerHNApp. Working copy có P01–P07 và warranty history chưa commit; giữ toàn bộ. Không có AGENTS.md áp dụng trong workspace. Không package.json ở gốc; chạy static server scripts/serve_preview.py, Node test và browser scripts hiện có.
- User tạm chốt P07 r10, cho phép triển khai P08; không thay CSS/artwork/state P07. Checkpoint cũ next_action “Do not proceed P08” đã được chỉ thị mới thay thế.
- OBSERVED_IMAGE: B08 đính kèm 1672×941; SHA256 78aa9384caf3f2ed600ead4f1c8518a8c254fccaadc96d1e5c8483d5f4c67aa2. Board index P08=06_lich_su.png, 4 panel. docs/index.html tab Tất cả mapping cùng tên/path. Baseline chỉ tham chiếu, không làm UI.
- CONFIRMED_HANDOFF: docs/flows/warranty-components/HANDOFF.md; đã đọc DEV_PROPOSAL, không coi endpoints/schema đề xuất là đã duyệt.

## Số đo (trước code)

| Thành phần | B08 estimated, ảnh px | Target CSS / nguồn |
|---|---|---|
| Panel | x52–417 /453–818 /854–1219 /1255–1620; y30–870, khoảng365×840 |494×950 VERIFIED_SOURCE home/style.css .hn-screen, chỉ thị user |
| Header | vùng title y77–116; status bar y30–76 |86px gồm title/padding, bỏ status bar giả như P07 |
| Body | y116–793; lề14–15, card rộng336 |18px lề, body flex/scroller, margin-top −12, radius24 |
| Nav | y793–870,5 mục |reuse .hn-nav75px; Lịch sử active, không Quét mã |
| Filter |search40; chips36; date38; gap8–12 |50/44/48px, gap8–14, bo10–12 |
| Card list |cao75–85, icon56×58; gap9 |96–108px, tile70×70; gap10 |
| Text |title20, body14–17, small12–14 |title26, body18–20, metadata16; Arial nguồn P02–P07; font Designer chưa xác minh |
| Detail/session |card radius8–10, line xanh nhạt1, timeline dot22 |radius12,border1; dot27; icon26–44 |
| Daily grid |3 cột×2 hàng, gap6,cell101×102 |3 cột equal,minmax(0,1fr),gap8,height112 |
| Crop/artwork |icon hộp nâu ở list/day; không ảnh lớn |reuse SVG box repo; không sinh/tải/tracing asset; exact icon chưa khớp |

## Model / navigation

- P08 read-only dưới hub P22, Home Lịch sử/Xem tất cả vẫn đi hub. Thêm edge “Lịch sử chung” và “Hoạt động theo ngày”; không thay hub bằng list cũ.
- Shared fixture source cho P08 và P22/P23, không suy event NFC từ P07 tag state. Khi nguồn unavailable/error, không biến thành danh sách rỗng hay tổng0.
- CONFLICT fixture: P23 source PQ-0001 từng là5 lượt tra cứu 10/09; B08 là19=18+1 ngày09/09. Dùng fixture B08 theo yêu cầu P08 mới nhất cho PQ-0001 ở cả hai nơi, giữ PQ-0002/PQ-0003. Chỉ là correction dữ liệu demo, không đổi production contract. Document result tách trạng thái phiên; quantity NFC=0, duplicate=0, accepted serial=1 trong fixture có khai báo.
- Thống kê ngày dùng tập fixture đầy đủ với ID hoạt động duy nhất và nhóm loại trừ nhau:09/09=12+6+4+3+5=30; các ngày khác có fixture riêng. Không suy tổng từ page hiển thị hoặc áp định nghĩa này lên production.
- Timeline chỉ event được seed; LS-0001 → PN-0005, “Gửi duyệt” đổi “Gửi phiếu lên Web”; chưa ghi sổ. P12/P18 chỉ context pending, không giả tải file hay mở chứng từ thật.
- P08 có4 panel; dialog lọc, empty/error/unavailable/tab là state cùng panel, không thêm prompt/màn ngoài danh mục.
