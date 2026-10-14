# Native repaired final — 14/10/2026

Target apps/wms-mobile; bản mới ở native-repaired-final/. Các bản trước giữ nguyên lịch sử.

- **2403 test / 128 suite PASS**, 0 fail; full typecheck PASS, lint phạm vi sửa PASS/0 warnings.
- P13 recipient/cursor/body-less PATCH/server counts/GET timeout, không read-all hoặc fake empty.
- P20 owner/header/proof/nullable, theo kho/case/POSTED, bounded detail hydration, native read-only view từ P09 và chặn response cũ khi đổi phiên/quyền.
- P09/P11 pin 70974487, origin/tier/generation guard giữ; không mở P09 writer hoặc production.
- Same-origin transport vào đúng DEV; local Web proxy fixed DEV giữ nguyên. Public Pages chỉ xem UI vì không có proxy/CORS vào BE.

Build/code tests không phải authenticated owner smoke/UAT. P20 UI mới còn visual/device review. Protocol/binding mới P18/P19/P21/P22/P23 vẫn cần owner integration riêng; không nâng request legacy sang protocol mới hoặc bật P14/recovery/full activation để vượt gate.

DEV cần mount static build tại cùng origin BE trước khi tester đăng nhập kiểm API. Không password/token/admin/proof/PII trong gói. Không BE deploy/migration/seed hoặc mutation live trong lượt sửa này.
