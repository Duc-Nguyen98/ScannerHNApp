# FLOW LINK GATE

Ngày: 2026-09-30  
Phạm vi: `UI_FIXTURE`, prototype local, chưa animation, chưa deploy.

## Kết luận

**PASS trong phạm vi UI_FIXTURE**, theo `FLOW_GATE.json` và source hash tương ứng. Đủ 24 board, 91 panel; B01/B02 đã xử lý. M00 đã có harness kiểm chứng, có thể chạy `MOTION_P01`. Không đồng nghĩa production/backend/hardware hoặc visual đã được nghiệm thu.

## Source và worktree

- Git commit: `da9f623a19d0359c3e80c14f8cc612636ec6ab78`.
- Chỉ thấy branch `main` và một Git worktree; không có branch/worktree P01–P24 riêng truy cập được.
- Source tích hợp tại `C:/Users/TAN MIE/Downloads/app_Scanner/ScannerHNApp`. Giữ nguyên dirty/untracked source; không reset/clean, không tạo branch thay thế. Hash và inventory ở `SOURCE_MANIFEST.json`, `evidence/final-verification/git-inventory.txt`.
- Preview local: [http://127.0.0.1:8766/flows/auth-session/](http://127.0.0.1:8766/flows/auth-session/) (fixture `minhanh` / `preview`).

## Đã nối/sửa

1. Sửa vùng hit P03 để nút Đóng không phủ lên Nhập/Xuất.
2. Nối receipt đã xác minh từ P04/P05 vào nguồn lịch sử chung P08 bằng ID `receipt:<documentId>`, giữ guard UNKNOWN và không đổi tồn kho.
3. Nối P08 với P12/P18 chỉ qua mapping `sourceDocumentId`/`historyRecordId` explicit; PDF fixture được kiểm tra không rỗng; Back giữ context.
4. P08 không còn tự chọn `LS-0001`/`PQ-0001` khi URL thiếu ID. B08 và B23 cùng mã hiển thị vẫn là hai scenario riêng.
5. P03 runtime đọc projection từ owner P04/P05 hiện tại qua `scanner-dialogs/stock-owner-adapter.mjs`. Không suy mapping theo số PN; giữ document/session/version/accepted rows/metadata của owner. Resume kiểm fingerprint trước và sau khi dialog-route đóng, không tạo phiếu mới hoặc record thêm.
6. P03 save chỉ giữ bộ nhớ phiên fixture, không ghi WMS. Bỏ nháp được owner thực hiện sau xác nhận với đúng fingerprint, scope và trạng thái local chưa có request; UNKNOWN/recorded/saved không bị xóa. Hủy giữ dữ liệu. P14 loại projection P03 khỏi danh sách để không đếm trùng owner.
7. Giữ nguyên mẫu legacy PN-0001 ở review và guard âm tính; không sửa mã mẫu, không tự import vào stock owner. Runtime P03.S02 đã nối owner thật của prototype; mẫu thiếu mapping không còn là nguồn runtime của panel.

## Kiểm thử

- `node --test tests/*.mjs tests/*.cjs`: **675/675 PASS**.
- Syntax: **485 file, 0 lỗi**; `git diff --check`: PASS. Log tại `evidence/final-verification/`.
- **24/24 board suites PASS**: `evidence/acceptance-02/regression-runs.json`.
- **12/12 journeys PASS**: `evidence/journeys-acceptance-04/results.json`. J12 kiểm cả owner nhập/xuất qua P03 và P14, resume/save/cancel/discard, số lần record và tồn không thay đổi.
- P05 được kiểm lại sau sửa cleanup cache địa chỉ tại `evidence/post-discard-guard/`; unit test xác nhận bỏ nháp xuất không chạm nháp nhập đồng thời.
- **7/7 nhóm bổ sung PASS**: `evidence/remaining-02/results.json`. Kiểm các nhánh NFC xác nhận/receipt, P12 tạo phiếu, P13 chờ Web, P15 mất quyền, P16 tải/lỗi/retry, P18 handoff/location và sáu entry của hub P22.
- **91/91 panel tham chiếu có evidence**: `PANEL_EVIDENCE.json`. Ghi nhận panel hiển thị chỉ là bằng chứng bổ sung; PASS đi kèm assertion của suite/journey, không suy từ DOM xuất hiện đơn thuần. P24 state dùng cùng owner P19/P04/P05/P20, không tạo panel mới giả.
- Test cũ được cập nhật theo ownership/contract đang có: feedback dùng dialog, kết quả P04 mở P12 thật, ngoại lệ về P17; nhánh NFC/bảo hành/session mới do P22/P23 kiểm, legacy B08 giữ riêng. Không bỏ guard để làm test xanh.
- Giữ log lỗi cũ và báo cáo gate trước sửa tại `history/pre-repair/`, `evidence/regression-runs.json`, `evidence/recheck/` và các lượt repair. Không xóa bằng chứng thất bại.

## Giới hạn còn lại

- B01/B02 không còn blocker của gate UI fixture hiện tại. Nếu cần import dữ liệu legacy ngoài review vào hệ thống thật, vẫn cần adapter/mapping được duyệt; không có chuyển đổi ngầm trong bản sửa này.
- Backend/WMS, camera/NFC thật, notification delivery và quyền production không có trong môi trường này; cần connected fixtures/credentials/hardware acceptance nếu muốn gate UI_CONNECTED/production.
- Không đổi Login/Home/footer CSS hoặc artwork, không reapprove visual. Không thêm animation vào ứng dụng. M00 chỉ có token/primitive và harness riêng; virtualization DEFERRED vì chưa có stress profile chứng minh cần thiết.

## Artifact

- [FLOW_GATE.json](./FLOW_GATE.json)
- [FLOW_GRAPH.csv](./FLOW_GRAPH.csv)
- [FLOW_PANEL_MATRIX.csv](./FLOW_PANEL_MATRIX.csv)
- [BOARD_CHECKS.json](./BOARD_CHECKS.json)
- [FIXTURE_MANIFEST.json](./FIXTURE_MANIFEST.json)
- [SOURCE_MANIFEST.json](./SOURCE_MANIFEST.json)
- [EVIDENCE_SUMMARY.md](./EVIDENCE_SUMMARY.md)
- [PANEL_EVIDENCE.json](./PANEL_EVIDENCE.json)
- [M00 REPORT](../motion/M00/REPORT.md)

Chạy tiếp `MOTION_P01` trên source tích hợp này. Từng consumer vẫn phải được kiểm auto/reduced/off trước khi bật motion. Chưa commit/push/deploy.
