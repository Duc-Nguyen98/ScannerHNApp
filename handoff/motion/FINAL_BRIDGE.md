# FINAL_BRIDGE — source sau MOTION_P24

MOTION_RELEASE_GATE hiện **READY_FOR_FINAL**, chỉ trong phạm vi UI_FIXTURE. Đây là bàn giao để chạy FINAL ở yêu cầu tiếp theo; M24 chưa commit/push/deploy. Hãy đọc gate và xác minh source thực tế trước khi thực thi, không dùng câu này làm bằng chứng thay thế.

- Source commit: `da9f623a19d0359c3e80c14f8cc612636ec6ab78` + working copy hiện hành.
- App source hash: `9138cf689297094c291963dfdf9c04041728c338e71691c84185d448cd1a2fe9`; diff identity M24: `9c736e2bae52d5b27bfa000fd0923b56ce0dc64b1c60e29a65fdbafb378b9e08`.
- Manifest: [M24/SOURCE_MANIFEST.json](M24/SOURCE_MANIFEST.json); [gate](MOTION_RELEASE_GATE.json); [coverage](MOTION_COVERAGE.csv); [runtime inventory](M24/RUNTIME_STATE_INVENTORY.json).
- Fixture: `hn-flow-gate-2026-09-30-v1`, giữ namespace/scenario và mapping trong [manifest](../flow/FIXTURE_MANIFEST.json).
- Token: MOTION_CONTRACT1.0/M00; SHA256 `821c354df5e1288fbdcc1d89e3f4f3fe6e1364b408cc973aa406c3326d1dda8a`. Core/engine/owners hiện hành giữ nguyên.
- Contract nghiệp vụ v2 và chốt mới: [CONTRACT_CONTEXT](../CONTRACT_CONTEXT.md), AGENTS/UI_STANDARD hiện hành và HANDOFF. Không khôi phục yêu cầu cũ đã được user thay đổi.

Khi user yêu cầu chạy [FINAL gốc](ScannerHNApp_FINAL_Noi_Luong_Public_Preview_v1.0.md), thực thi trên source này. Giữ routing, data owner, seed, ID, auto/OS-reduced/off, native scroll và single-owner primitives. Không dựng lại24board, thêm engine/virtualizer hoặc sửa dist/gallery để thay source. FINAL kiểm những thiếu sót có bằng chứng và build/public theo quyền trong yêu cầu FINAL, không tái coi integration/hardware là PASS vì mock.

Review controls nằm ngoài app: auto tôn trọng OS, reduced/off giữ đầy đủ nội dung/quyền/operation. FINAL bổ sung version/link scene theo prompt gốc và kiểm deep link/refresh/assets/public anonymous. Nếu đổi router/fixture/token/guard thì kiểm lại phần evidence chịu ảnh hưởng trước khi phát hành. Source hash đổi cần refresh release identity và ghi trace, không dùng gate cũ cho build khác.

Đã kiểm:24board/91panel;765logic; M24 24 nhóm/3mode; FLOW_GATE12×3 hành trình; M19 21nhóm; P24 11nhóm;15geometry;25layout và4footer. Motion visual chờ review; backend/hardware/durable persistence và target-device FPS chưa xác minh. File FINAL đi kèm được sao chép nguyên byte; authorization của nội dung FINAL chỉ áp khi user yêu cầu chạy FINAL, không phải lệnh publish trong lượt M24.
