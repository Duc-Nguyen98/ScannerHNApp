# Native repaired preview — 14/10/2026

Target: apps/wms-mobile. Bản mới: native-repaired/ (không phải gallery HTML hoặc bản native cũ).

Đã sửa P13 recipient/cursor/no-body PATCH/authoritative count/GET timeout/no read-all; P20 proof/nullable/posted time/scoped owner/header/partial hydration và native read-only view từ P09. P09/P11 pin exact runtime 70974487 với guard origin/tier/session giữ nguyên.

Native release tests: **2402/2402 PASS, 128/128 suite PASS**. Full typecheck PASS; lint phạm vi sửa PASS/0 warnings. Build 1053 module, fingerprint a9c1f3abc9e4b15300fc5b5fc0d023be6cdf8e86ca1429e15eb3ae7917fef9c3. Test source không phải authenticated smoke/UAT.

Public Pages chỉ kiểm UI, không có /wms-api proxy hoặc CORS vào BE. Static build dùng direct canonical API khi đặt cùng origin BE; local Web tiếp tục proxy fixed DEV. URL BE /test-preview/p01-p24-20261014/ vẫn cần DEV triển khai riêng.

Các protocol/binding mới P18/P19/P21/P22/P23 chưa được tuyên bố hoàn tất native trong bản repair. Giữ các gate/operator approvals; không đổi key/request legacy để vượt protocol, không bật P14/recovery/production từ preview.

Login + public health local đã kiểm; chưa đăng nhập hoặc chạy stock/upload/NFC/password/revoke/END live. P20 UI mới còn visual/device review. Muốn nghiệm thu toàn 24, cần owner integration và evidence từng luồng, không chỉ một link hoặc màu xanh Jest.
