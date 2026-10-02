# Báo cáo dataset bàn giao Tester P01–P24

## Kết quả

Đã xuất riêng dữ liệu cho đủ 24 board và 91 panel của ScannerHNApp. Mỗi file `P01.json` … `P24.json` có cùng schema để Tester dùng thống nhất:

- `panels`: panel ID, tên màn và trạng thái nguồn.
- `fixtures`: dữ liệu nghiệp vụ hiện có của board, lấy từ adapter/model trong source.
- `mapping`: quan hệ panel → fixture → permission → rule → test case.
- `fields`: trường dữ liệu, kiểu, bắt buộc, nhạy cảm và giới hạn khi đã có trong prototype.
- `testCases`: bốn nhánh cho từng panel: happy path, least privilege, scope/boundary và UNKNOWN/idempotency.
- `sourceRefs`: file source hoặc handoff mà Tester có thể đối chiếu.

`RBAC_CATALOG.json` bổ sung 9 role B2B, 40 permission key, scope tenant–organization–warehouse, 8 actor fixture và 15 rule. `RBAC_ROLE_PERMISSION.csv` là ma trận đầy đủ allow/deny; `PANEL_INDEX.csv` và `TEST_CASE_INDEX.csv` dùng để lọc nhanh trong Excel hoặc công cụ test.

## Phân biệt source và mở rộng test

Dữ liệu `source-fixture` phản ánh preview hiện tại: `fixture-minhanh`, `fixture-lan`, `Kho Hoa Nam`, PN/PX/BH/NFC/PQ/XLK IDs, mã sản phẩm, serial, tồn, status, receipt, cursor và các nhánh UNKNOWN/timeout/error.

Ma trận RBAC B2B mở rộng được đánh dấu `proposed-test`. Các role như `tenant_owner`, `org_admin`, `warehouse_manager`, `auditor`, `viewer`, `warranty_agent`, `device_operator` và `integration_service` là dữ liệu kiểm thử để chạy khi có adapter RBAC thật; không ghi nhận chúng như quyền production đã cấp.

## Độ phủ và kiểm tra

- 24/24 board files.
- 91/91 panel IDs không trùng.
- 364 test case, bốn case cho mỗi panel.
- 40 permission key và 9 role được resolve trong mọi board matrix.
- 15 rule kiểm soát, gồm scope, session owner, least privilege, SoD, unknown/reconcile, idempotency, closed case, thiết bị và không lộ dữ liệu nhạy cảm.
- CSV index: 91 panel rows, 364 case rows, 360 role-permission rows.
- `VALIDATION.json`: PASS.

Độ phủ bàn giao dữ liệu được đặt mục tiêu 99% trên ma trận fixture + RBAC. Các phần production cần nguồn bổ sung vẫn được đánh dấu rõ: IdP claims/role binding, tenant/org hierarchy API, warehouse policy, approval/SoD, audit/retention/PII, API receipt/status, camera/NFC thật và persistence bền.

## Cách chạy kiểm tra

```powershell
node scripts/export_tester_dataset.cjs
node scripts/export_tester_csv.cjs
node scripts/refresh_tester_manifest.cjs
node scripts/validate_tester_dataset.cjs
```

Các lệnh trên chỉ tạo lại artifact bàn giao; không sửa runtime UI/UX hoặc dữ liệu production.
