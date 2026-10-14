# DEV — mở browser API thật

Hiện public GitHub Pages https://duc-nguyen98.github.io bị BE chặn CORS. OPTIONS thực trả 204 nhưng không Access-Control-Allow-Origin/Methods/Headers. GET /auth/me không token trả 401; chưa chạy smoke có đăng nhập.

Khuyến nghị DEV phục vụ site/ tại một đường dẫn như https://khohoanamdev.lptech.info.vn/test-preview/p01-p24-20261014/ theo release được duyệt. Đây là đường dẫn **đề xuất, chưa deploy hoặc xác nhận HTTP**. Không thêm API backend, không đổi schema/cờ, không proxy token sang host khác.

Nếu chọn Pages + CORS, cần security/DEV duyệt exact origin, credentials/headers và cache; không wildcard hoặc thay cấu hình prod để test. Bản harness hiện khóa cross-origin; mở nó là thay đổi FE riêng sau bằng chứng CORS, không tự bật qua query/localStorage.

Native Web build thật nằm tại [native-app/](native-app/). Build dùng `apps/wms-mobile` và relative `/wms-api`; để chạy API trên cùng origin, DEV phải mount static folder và proxy `/wms-api/` tới `https://khohoanamdev.lptech.info.vn/api/` theo cấu hình Nginx được duyệt. Pages chỉ chứng minh static bundle; không chứng minh proxy/auth/API.

Health mới khai SHA 709744875a039178f432574ce1b59aaa3b42395c. Main 38387890870 CANCELLED; Backlog 38387891139 FAILURE và annotation runner hết đĩa. Cần audit/test/release evidence đầy đủ, không coi deploy thủ công/health 200 là CI PASS.

P19_COMMAND_RECOVERY_ENABLED, P14_SHIFT_ENABLED, P12_MIXED_DOCUMENTS_ENABLED giữ policy OFF tới phê duyệt tương ứng; các cờ chưa được đọc live trong lượt chuẩn bị này. Historical mixed DEV approval không đồng nghĩa production approval.

P01 auth, owner writers, data scope, CORS, receipt/UNKNOWN và thiết bị phải nghiệm thu riêng. Các API POST/PUT/PATCH/DELETE trong mapping chỉ để đối chiếu contract, không executable trong collection/harness.

Không đưa .env, token/password/admin/proof, business raw HTTP/PII, local storage, logs hoặc Android signing keys vào public folder. Chỉ static UI fixture + route docs + empty collection variables.
