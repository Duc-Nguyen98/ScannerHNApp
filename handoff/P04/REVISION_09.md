# P04 r09 — rà soát kỹ UI/UX sau nâng cấp

User yêu cầu rà lại và khắc phục các lỗi lặt vặt. Phạm vi Nhập kho và điểm nối Home/P03/P17/P12; source hiện tại đã nối P17, không quay lại behavior r08 cũ. Đọc AGENTS/UI_STANDARD hiện hành; giữ khung494×950, footerLOCK, icon palette chung, action feedback và readable content. Giữ công việc đồng thời của task khác.

## Nguồn / đối chiếu

| Phần | Nguồn | Quyết định |
|---|---|---|
| Form/scan/review/result | B04 và các yêu cầu user trước | Không thêm panel hoặc đổi nghiệp vụ |
| Back giữ context | Yêu cầu user + UX r08 | Lưu vị trí cuộn riêng từng bước/phiếu, không reset cả trang |
| Nội dung dài | HN-readable-content-v1 | Dùng shared reader2dòng ở giá trị; nút bên ngoài button, giữ full string |
| Trạng thái/UNKNOWN | P17 và shared action contract mới | Giữ luồng exception hiện tại; không trả về inline feedback cũ |
| Spacing reader trong summary/serial | Implementation adaptation | Grid có cột riêng cho reader/count, cần visual review |

## Lỗi có bằng chứng trước–sau

1. **Back mất vị trí danh sách mã:** tại S02 cuộn440px → Review → Back trước sửa về0px. Nay lưu scroll theo step; giữ list expanded/filter/raw, không tự thêm hay xóa mã. Rời module rồi quay lại cũng có vị trí đã lưu; lượt mới xóa toàn bộ scroll context cũ.
2. **NCC dài kéo review rất cao:** fixture nguồn2000+ ký tự làm hàng NCC cao892px. Nay giá trị xem gọn2dòng, Xem đầy đủ mở shared reader có Back/Escape/focus. Mã NCC và nhãn giữ nguyên.
3. **NCC dài làm chính ô chọn bị phình:** trước sửa trigger cao896px. Nay trigger gọn, reader nằm ngoài button theo contract (không nested button). NCC được lưu đầy đủ; không sửa catalogue thật hoặc cắt dữ liệu để đạt layout.

Đã áp dụng cùng reader cho metadata tóm tắt ở màn kết quả, không rút gọn trạng thái quan trọng. Reader/count của serial dùng grid riêng để tránh tranh chiều ngang khi raw/serial rất dài. Ghi chú vẫn200 ký tự input như đã chốt. Không đổi kích thước/control khi giá trị ngắn.

## Các nhánh đã rà nhưng không phát hiện lỗi trong lần chạy

- Lọc Trùng hiển thị ngay dòng đúng, giữ totals và accepted; đổi lọc giữ mã nhập tay chưa gửi.
- Mở/thu SKU giữ focus và trigger nhìn thấy, đủ11 mã hợp lệ; không lặp mã trùng.
- Mã sai → P17.S01 → Nhập mã giữraw/filter/scroll/accepted/focus.
- UNKNOWN → P17.S04 không có Nhập lượt mới, kiểm tra kết quả giữ nguyên request và không record thêm; sau xác nhận mới mở lượt sạch.
- Serial2100+ ký tự có reader nguyên văn, số lượng riêng, không overflow.
- S04 metadata dài, dialog và footer nằm trong app ở6 viewport; Back/Escape đóng reader trước.

## Kiểm chứng

- [Audit ban đầu](evidence/revision-09/before/results.json):2 lỗi được bắt; [probe ô chọn](evidence/revision-09/select-before/results.json): thêm lỗi chiều cao ô NCC. Các case PASS trước sửa không được tính là lỗi đã sửa.
- [Audit cuối](evidence/revision-09/after/results.json): **11/11 nhóm PASS**, bao gồm6 viewport340×420,390×844,494×1000,768×1024,1440×1000,1869×940; không pageerror.
- `node --test tests/inbound.test.mjs tests/documents.test.mjs`: **45/45 PASS**. [Log](evidence/revision-09/node-tests.txt). Không gọi đây là toàn repo PASS.
- Reader context250/2100 ký tự: **2/2 PASS**, [kết quả](evidence/revision-09/context-long/results.json).
- Hồi quy catalogue: **6/6 nhóm PASS**,6viewport trên server riêng; [kết quả cuối](evidence/revision-09/catalogue-final/browser-results.json). Tổng **19 nhóm/case browser PASS**, không pageerror trong các kết quả cuối.
- Lượt catalogue đầu trên server8766 không tới được login trong30s; lưu [log](evidence/revision-09/catalogue/failure.json), không tính PASS. Dùng server kiểm thử riêng8774; script catalogue được cập nhật expectation UNKNOWN sang panelP17.S04 hiện hành, không xóa test bảo toàn request.

## Ảnh thực tế

- Back: [trước](evidence/revision-09/before/01-back-scroll.png) / [sau](evidence/revision-09/after/01-back-scroll.png).
- Ô NCC dài390×844: [trước](evidence/revision-09/select-before/05-long-selected.png) / [sau](evidence/revision-09/after/05-long-selected.png).
- Review NCC dài390×844: [trước](evidence/revision-09/before/05-long-supplier.png) / [sau](evidence/revision-09/after/05-long-supplier.png).
- [Kết quả dài494×1000](evidence/revision-09/after/06-result-494x1000.png); [kết quả340×420](evidence/revision-09/after/06-result-340x420.png).

Before/after dùng cùng fixture, viewport/DPR1. Nguồn dài được route-mock trong browser riêng, gồm HTML literal/Unicode; không đổi dữ liệu ứng dụng. Đã xem ảnh actual; không resize/mask baseline, không tự tuyên bố pixel-perfect hoặc visual được user duyệt. Hình thức reader mới chờ review.

## File và giới hạn

Sửa `inbound.mjs` (scroll per-step, readable metadata), `select-control.mjs` (readable selected value outside trigger), `style.css` (reader grid), cache/import. Thêm `check_inbound_ui_audit.cjs`; bổ sung output/base option cho scripts kiểm thử. Không sửa flow/adapter/controller P17/backend hay footerLOCK.

Logic lưu/gửi/đối chiếu và persistence vẫn là prototype. Reload/đóng tab mất nháp fixture; backend/camera/keyboard thiết bị thật chưa kiểm chứng. Không mở rộng module khác hoặc ghi đè checkpoint đang làm của task khác; không push/merge/deploy. Kết luận chỉ áp dụng các nhánh đã kiểm, không cam kết mọi tình huống ngoài môi trường kiểm thử đều không có lỗi.
