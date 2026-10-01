# FLOW LINK GATE

Ngày: 2026-09-30  
Phạm vi: `UI_FIXTURE`, prototype local, chưa animation, chưa deploy.

## Kết luận

**INCOMPLETE**. Source hiện tại có đủ 24 board và 91 panel. Chưa chuyển sang `MOTION_P00`.

## Source và worktree

- Git commit: `da9f623a19d0359c3e80c14f8cc612636ec6ab78`.
- Chỉ thấy branch `main` và một Git worktree; không có branch/worktree P01–P24 riêng truy cập được.
- Giữ nguyên dirty/untracked source; hash và inventory đầy đủ ở `SOURCE_MANIFEST.json`, `evidence/git-inventory.txt`.
- Preview local: [http://127.0.0.1:8766/flows/auth-session/](http://127.0.0.1:8766/flows/auth-session/) (fixture `minhanh` / `preview`).

## Đã nối/sửa

1. Sửa vùng hit P03 để nút Đóng không phủ lên Nhập/Xuất.
2. Nối receipt đã xác minh từ P04/P05 vào nguồn lịch sử chung P08 bằng ID `receipt:<documentId>`, giữ guard UNKNOWN và không đổi tồn kho.
3. Nối P08 với P12/P18 chỉ qua mapping `sourceDocumentId`/`historyRecordId` explicit; PDF fixture được kiểm tra không rỗng; Back giữ context.
4. P08 không còn tự chọn `LS-0001`/`PQ-0001` khi URL thiếu ID. B08 và B23 cùng mã hiển thị vẫn là hai scenario riêng.

## Kiểm thử

- `node --test tests/*.mjs tests/*.cjs`: **668/668 PASS**.
- Syntax check: **476 file, 0 lỗi**; `git diff --check`: pass.
- 11 journey entry hiện hành J01–J11 PASS tại `evidence/journeys-final-02/results.json`, bao gồm P03/P04/P05, P08/P12/P18, P09/P19/P20/P21, P22/P23 unavailable, refresh/logout, UNKNOWN và closed-case guard.
- Regression suite P01–P24 được lưu riêng dưới `evidence/regression/`; log lịch sử không bị ghi đè. Một số suite cũ nonzero do selector/fixture expectation trước các contract mới; đối chiếu trong `evidence/regression-runs.json` và `evidence/recheck/regression-runs.json`.

## Thiếu và nguồn cần cung cấp

- **B01, thiết yếu: P03.S02**. Draft legacy `PN-0001` (`fixture-p03-scan-*`, `FIXTURE-HN-0001/0002`) không có owner P04/P05 tương ứng. UI giữ nguyên dữ liệu và chặn tại dependency dialog, không tạo phiếu thay thế. Cần adapter/contract ánh xạ `documentId`, `scanSessionId`, `version`, `operation`, accepted rows, supplier/warehouse scope và chính sách save/discard; hoặc quyết định migrate rõ ràng sang owner P04/P05. Không map theo mã PN hiển thị.
- **B02, xác minh**. Chưa có bằng chứng mới cho mọi essential edge của cả 91 panel; graph đánh dấu `SOURCE_REVIEWED`, không giả `PASS`. Cần cập nhật các suite cũ và chạy bổ sung các cạnh còn thiếu.
- Backend/WMS, camera/NFC thật, notification delivery và quyền production không có trong môi trường này; cần connected fixtures/credentials/hardware acceptance nếu muốn gate UI_CONNECTED/production.

## Artifact

- [FLOW_GATE.json](./FLOW_GATE.json)
- [FLOW_GRAPH.csv](./FLOW_GRAPH.csv)
- [FLOW_PANEL_MATRIX.csv](./FLOW_PANEL_MATRIX.csv)
- [BOARD_CHECKS.json](./BOARD_CHECKS.json)
- [FIXTURE_MANIFEST.json](./FIXTURE_MANIFEST.json)
- [SOURCE_MANIFEST.json](./SOURCE_MANIFEST.json)
- [EVIDENCE_SUMMARY.md](./EVIDENCE_SUMMARY.md)

Gate chỉ có thể chuyển `READY_FOR_MOTION` sau khi B01 được cung cấp và B02 hoàn tất.
