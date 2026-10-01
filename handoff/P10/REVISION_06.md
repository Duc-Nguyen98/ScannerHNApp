# P10 r06 — căn giữa tiêu đề Cá nhân

User chỉ rõ vùng tiêu đề trong ảnh và duyệt phương án căn giữa ngày2026-09-29.

| Nguồn | Quyết định trước sửa |
|---|---|
| B10/r05 | Hero navy, tiêu đề26px/600, hàng48px; avatar và menu hiện có |
| Source thực | `.p10-hero h1` có margin-left58px; không có Back ở S01 |
| Chỉ thị user | Căn giữa tiêu đề theo toàn bộ header; giữ typography, chiều cao, avatar và các header màn con |
| Triển khai | Chỉ `.p10-hero .p10-heading` justify-content:center và `.p10-hero h1` margin-left:0. Padding hero đối xứng24px nên tâm trùng AppShell |

Target prototype, HEAD `da9f623a19d0359c3e80c14f8cc612636ec6ab78`. Không đổi nghiệp vụ, footerLOCK, dialog, input hay số panel. Bằng chứng trước/sau cùng fixture, DPR1, viewport494×1000 ở `evidence/revision-06/`. Visual actual chờ review, không tự coi là pixel-perfect.

Kiểm geometry thực:4 viewport494×1000,360×800,430×932,1440×900; tâm tiêu đề lệch dưới0.1 CSS px so với tâm shell. Bounding box avatar và footer không đổi ở reference; cả3 header màn con vẫn có Back và không bị căn giữa. Không viết test logic mới cho CSS này. [Ảnh sau](evidence/revision-06/after-494.png), [ảnh trước](evidence/revision-06/before.png), [metrics](evidence/revision-06/metrics.json). Behavior/integration không thay đổi; backend vẫn chưa xác minh.
