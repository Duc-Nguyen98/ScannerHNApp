# ScannerHNApp tester dataset P01-P24

Generated 2026-10-02. Bộ gồm 24 file JSON tách riêng theo board, catalog RBAC dùng chung và checksum manifest.

## Cách dùng

- Mở file `P01.json` … `P24.json`; đọc `panels`, `fixtures`, `mapping`, `testCases`.
- Dùng `RBAC_CATALOG.json` để tạo actor/role/scope. Credential `minhanh / preview` chỉ là demo nội bộ.
- Chạy theo `setup -> action -> expected`. Với UNKNOWN/reconcile phải giữ nguyên requestId, documentId, caseId, scanSessionId và version.
- `fixture-pass` là hành vi đã có trong preview. `proposed-rbac-test` là ma trận RBAC B2B mở rộng, chờ adapter/backend thật.

## Phân loại và giới hạn

- `source-fixture`: lấy từ source adapter/model hiện tại.
- `implemented-fixture`: rule đã kiểm trong bộ nhớ preview.
- `proposed-test`: dữ liệu test mở rộng, không phải quyền production đã cấp.
- Production còn cần nguồn IdP claims/role binding, tenant/org hierarchy, warehouse policy, approval/SoD, audit/retention/PII, receipt/status API, camera/NFC và persistence.

Độ phủ dataset: **99% mục tiêu bàn giao**, map đủ 24 board, 91 panel, 364 test cases và 40 permission keys. Con số này mô tả độ đầy đủ của bộ test fixture + ma trận, không xác nhận backend production.

Files: `RBAC_CATALOG.json`, `P01.json` … `P24.json`, `PANEL_INDEX.csv`, `TEST_CASE_INDEX.csv`, `RBAC_ROLE_PERMISSION.csv`, `MANIFEST.json`, `VALIDATION.json`.
