# P05 revision 02 — Lượt xuất kế tiếp

Yêu cầu: sau kết quả thành công/thất bại đã xác định, mở Xuất kho từ Home hoặc Quét mã → Xuất kho phải về Bước1 sạch; bảo toàn nháp/đang gửi/UNKNOWN. Source HEAD vẫn da9f623a19d0359c3e80c14f8cc612636ec6ab78; target prototype docs/flows.

## Nguyên nhân và bằng chứng trước sửa

Flow đã có reset khi `active=false`, nhưng mở picker ngay trên màn kết quả không gọi leave. Chọn lại Xuất kho giữ `active=true`, nên start trả lại step4. Test mới thất bại **4 !== 1**: [Node trước sửa](evidence/revision-02/before-node.txt), [browser trước sửa](evidence/revision-02/before-browser.json), [ảnh trước sửa](evidence/revision-02/before-failure.png).

Không khẳng định đã tái hiện cả hai đường Home bị lỗi: chúng PASS trên source local trước sửa và tab người dùng số4 cũng về Bước1 khi thử Home → Xuất kho. Nhánh picker tại kết quả tái hiện được. Các tab mở trước đó có thể vẫn giữ module đã nạp; đây là khả năng, không phải nguyên nhân đã chứng minh.

## Giải pháp đã áp dụng

- Home và P03 picker truyền rõ `newAttempt` cho thao tác mở Xuất kho; không chỉ dựa vào cờ đã rời màn.
- Chỉ reset khi outcome thuộc `recorded` hoặc `not-recorded`, không busy, không UNKNOWN, và không resume theo documentId.
- Lưu snapshot lượt kết thúc trong audit bộ nhớ có trước rồi tạo documentId/scanSessionId khác; xóa request/accepted/attempts/outcome/exception và trở về step1. PX-0005 vẫn là mã hiển thị baseline, không phải ID production.
- Dismiss picker/repaint giữ màn kết quả; chọn nghiệp vụ mới mới tạo lượt. Nháp/đang gửi/UNKNOWN luôn giữ dữ liệu. Retry trên cùng phiếu thất bại giữ nguyên request.
- Cập nhật version import ở entry/app/home/outbound/flow để lần tải mới lấy bản sửa. Không đổi thiết kế/nguồn baseline, không sửa P04 controller, không Post, không xóa server.
- Tab người dùng số4 được kiểm tra đang ở kết quả xác định, trở về lượt trắng rồi mới reload bản sửa; đã đăng nhập fixture lại, để Bước1 sẵn kiểm tra. Các tab khác không reload để tránh mất nháp chưa biết.

## Kiểm chứng

- `node --test tests/*.mjs tests/*.cjs`: **77/77 PASS** (14 P05).
- `node scripts/check_outbound_lifecycle.cjs`: **8 nhóm PASS** — success Home/task; success Home/picker; result picker cancel/reenter; failed cả hai đường và retry; native Back cả hai đường; draft; UNKNOWN/reconcile; pending kết thúc khi ở Home.
- Regression P05: **12 nhóm PASS**, gồm P04 nhập/receipt; P03: **14 nhóm PASS**; Home lần chạy lại: **14 nhóm PASS**. Home lần đầu chạy song song timeout ở nút thoát iframe history (không lỗi JS); giữ log thất bại, rerun độc lập PASS không sửa app/test cho nhánh đó. Không suy lỗi transient đã được sửa bởi P05.
- Kết quả và ảnh: [lifecycle](evidence/revision-02/browser-results.json), [Node](evidence/revision-02/node-tests.txt), [P05](evidence/revision-02/outbound-regression/browser-results.json), [Home](evidence/revision-02/home-regression-rerun/browser-results.json), [P03](evidence/revision-02/dialog-regression/browser-results.json).
- [Lượt sạch từ Home](evidence/revision-02/02-home-fresh.png), [lượt sạch từ picker](evidence/revision-02/03-picker-fresh.png), [UNKNOWN giữ nguyên](evidence/revision-02/05-unknown.png), [sẵn sàng lượt sau](evidence/revision-02/06-next-run.png). Đã xem ảnh actual Bước1, không đổi layout.

File sửa: outbound-flow.mjs, outbound.mjs, home/home.mjs, auth-session/app.mjs và index.html; tests/outbound.test.mjs; scripts/check_outbound_lifecycle.cjs (mới), scripts/check_outbound.cjs (output directory option); báo cáo/coverage/run state.

Behavior PASS fixture. Visual vẫn giữ trạng thái chờ duyệt/khác biệt đã ghi trong REPORT; backend/hardware BLOCKED/NOT_RUN. Nháp và audit chỉ ở bộ nhớ, reload mất. Không push/merge/deploy, không chuyển P06.
