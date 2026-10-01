# Rà soát ổn định P01–P09 — 2026-09-28

## Kết quả và phạm vi

Đã rà soát các module hiện có trong prototype, sửa lỗi dựng trùng hub Lịch sử khi Back, chặn callback iframe đã rời DOM, khởi động lại server localhost đã cũ và kiểm tra các luồng liên màn. Không thêm P10–P24, không đổi 24 board/91 panel, không sửa baseline/dist/gallery, không push/merge/deploy.

Target `prototype`, source tham chiếu `da9f623a19d0359c3e80c14f8cc612636ec6ab78`. Working copy có cập nhật đồng thời P04/P05/P06/P07/P09 và hạ tầng tải app từ các công việc khác; giữ nguyên, kiểm lại phần giao nhau. `AGENTS.md` và `docs/flows/shared/UI_STANDARD.md` đã đọc. Chưa nghiệm thu visual tuyệt đối hoặc production backend/hardware.

## Các vấn đề và cách xử lý

| Vấn đề | Xử lý / bằng chứng |
| --- | --- |
| Back về Lịch sử tạo2 iframe thay vì1 | Lưu dấu route + history state của iframe đã dựng; bỏ lần dựng trùng do popstate/hashchange cho cùng entry. [Before](evidence/before-audit.json) ghi2≠1; [after](evidence/after-audit.json) ghi PASS. Không bỏ qua Back sang query/state khác. |
| Callback load/click từ iframe cũ có thể chạy sau khi đã rời màn | Kiểm `frame.isConnected` trước khôi phục view/đổi route/check session; test phát load trên iframe đã tháo xác nhận vẫn ở Home, không logout/repaint. |
| Tiêu đề tab lưu tên màn trước sau khi về Home / mở pending / hub | Bản cập nhật đồng thời đã bổ sung tiêu đề đúng route; giữ lại và xác minh bằng từng đường đi Nhập/Xuất/Tra cứu/NFC/Bảo hành→Home, Chứng từ pending, Lịch sử. |
| Một số lần tải mới chỉ có khối prototype, không có app | Server cũ PID7832 chạy từ27/09 chưa nhận nâng cấp backlog/exclusive-bind/no-store hiện có. Xác minh đúng command rồi thay bằng server cập nhật localhost8766 (PID5076 khi khởi động), log tại evidence/server-*.txt. Test lỗi tải module có chủ đích xác nhận hiện thông báo và nút retry, retry khôi phục form login. Không tự retry giao dịch nghiệp vụ. |
| Test màu icon báo sai ở viewport sau khi tắt/bật stylesheet | Test re-enable CSS với no-store có thể fetch bất đồng bộ. Đợi màu thực sự khôi phục rồi mới đo/capture tiếp; không thay palette để hợp thức hóa test. |
| Test backdrop dùng tọa độ385px ngoài app đã scale | Script được cập nhật theo bounding box/fraction thực, không đổi backdrop đã chốt. P03 regression dùng geography fixture P05 để không phụ thuộc dịch vụ địa chỉ thật. Đã bỏ import/mock trùng phát sinh do hai cập nhật đồng thời. |

## Kiểm chứng

| Bộ kiểm | Kết quả / bằng chứng |
| --- | --- |
| Toàn bộ Node tests | **191/191 PASS**, [log](evidence/node-final.txt). Đây là snapshot test lúc chạy; không suy bao phủ mọi state/backend. |
| Audit liên màn mới | **15 nhóm PASS**: tiêu đề, Back chỉ1 iframe, callback cũ, dialog tên/focus, logout/inert, startup fail/retry, không JS exception. [results](evidence/after-audit.json) |
| Home | **14 nhóm PASS**,7 capture, [results](evidence/home-final/browser-results.json) |
| Nhập kho | **11 nhóm PASS**, [results](evidence/inbound-final/browser-results.json) |
| Xuất kho lifecycle | **8 nhóm PASS**: terminal→new attempt, retry cùng request, nháp, UNKNOWN và late receipt. [results](evidence/outbound/browser-results.json) |
| NFC | **4 nhóm PASS**:5 thẻ trong1 phiên, selector/read invalidation, UNKNOWN/reconcile, chuỗi dài/alignment. [results](evidence/nfc/results.json) |
| Bảo hành↔Tra cứu | **11 nhóm PASS**: giữ draft/serial/filter/scroll/tab, modal Back, Back lặp, UNKNOWN, logout. [results](evidence/warranty-final/navigation-results.json) |
| Chuẩn icon UI | **6 nhóm PASS**, Home6 viewport và P03/P04/P05/P06/P07/hub; palette/nét đúng, geometry giữ nguyên. [results](evidence/icons-final/system-icon-results.json) |
| Dialog P03 | **16 nhóm PASS**,29 captures, không JS error/request ngoài allowlist; geography đã mock bằng fixture. [results](evidence/dialogs-final/browser-results.json). Failure trước đó giữ làm chẩn đoán, không tính PASS. |

Lệnh đã thực thi: `node --test tests/*.test.mjs tests/*.test.cjs`, `node scripts/check_flow_audit.cjs`, cùng `check_home.cjs`, `check_inbound.cjs`, `check_outbound_lifecycle.cjs`, `check_nfc_repeat.cjs`, `check_warranty_navigation.cjs`, `check_system_icon_standard.cjs`, `check_dialogs.cjs` với evidence directory riêng cho audit. Các assertions thất bại do server cũ/tọa độ test/CSS async/geography đã được phân tích, giữ log failure và chạy lại bộ bị ảnh hưởng. Không đổi expected nghiệp vụ để che lỗi.

## UI/UX và đề xuất tiếp theo

- **Đã giữ/kiểm:** icon cùng palette pastel theo UI_STANDARD, nét1.8; semantic status tách nghiệp vụ; Home vừa khung, công cụ ngoài app; tên2 từ cuối, giữ tên gốc; focus/Back/UNKNOWN trong phạm vi các ca trên.
- **Ưu tiên1:** duy trì bộ regression liên màn này trong quy trình trước bàn giao; đặc biệt route có modal/iframe và kết quả async. Không cần thêm board hoặc thay thiết kế.
- **Ưu tiên2, cần review thiết kế:** thống nhất các modal nhỏ như xem tên với component modal trong khung app; cân nhắc mô tả loading/empty/error dùng cùng văn phong ở các module. Hiện chưa tự thay modal tên đã được chốt hoặc redraw màn LOCKED.
- **Ưu tiên3, trước production:** xác nhận typography/assets gốc và touch target trên máy thật. Fit-to-screen hiện là trình xem thiết kế; không coi controls đã scale là nghiệm thu native mobile. Nối auth/API/permission/idempotency/reconcile và kiểm hardware theo contract thực.

## File thay đổi trực tiếp của lượt audit này

- `docs/flows/home/home.mjs`: dấu route cho iframe tránh dựng trùng.
- `docs/flows/history/embedded-history.mjs`: bỏ callback của iframe đã tháo.
- `scripts/check_flow_audit.cjs`: kiểm chứng mới và lưu before/after.
- `scripts/check_system_icon_standard.cjs`: evidence override và chờ CSS khôi phục.
- `scripts/check_dialogs.cjs`: cùng cập nhật hiện có, dùng helper geography fixture và loại import trùng; tọa độ theo bounds được giữ từ cập nhật đồng thời.
- Báo cáo/evidence/checkpoint audit. Các title/bootstrap/server/module business được cập nhật đồng thời đã được giữ nguyên, không tự nhận toàn bộ là diff của lượt này.

Behavior: PASS trong các ca final được liệt kê. Visual: review-needed theo blocker từng P. Integration: BLOCKED/NOT_RUN theo từng P, không kết luận toàn hệ thống hết lỗi hoặc production-ready.
