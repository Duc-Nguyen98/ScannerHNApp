# P09 r06 — đồng bộ tab và thiết kế lại bố cục Hồ sơ bảo hành

User yêu cầu sửa toàn bộ bố cục P09.S03 trong ảnh `C:/Users/TAN MIE/Desktop/1.png`, đặc biệt tab phải đồng bộ với trang Lịch sử. Đã áp dụng trong prototype; giữ4 panel P09,91 ID baseline, nghiệp vụ và điều hướng r05.

## Phương án đã áp dụng

1. **Tóm tắt hồ sơ:** một card14px bo góc chứa ảnh máy, mã BH, trạng thái, model/serial; ngày tiếp nhận/cập nhật nằm trong hàng metadata gọn. Màu chữ phân cấp theo hệ thống, không dùng toàn bộ chữ đậm xanh navy như trước.
2. **Tabs:** lấy mẫu **Chi tiết Lịch sử P08.S02**, tách ba rule CSS hiện hữu vào `shared/detail-tabs.css` để P08/P09 cùng dùng. Tab đang chọn có nền nhẹ/gạch chân teal; count tách badge. Tabs có thể giữ trên vùng cuộn để tiếp tục đổi nội dung. Tab danh sách/Lịch sử nghiệp vụ không bị thay mẫu.
3. **Thông tin:** card bảng label/value thẳng cột, lỗi/chẩn đoán/ghi chú dễ đọc; model và serial đã nằm trong phần tóm tắt nên không lặp thêm bên dưới. Preview linh kiện và lối xem chi tiết nằm trong một card riêng. Thao tác chỉnh sửa/cập nhật gom về CTA Cập nhật xử lý hiện có.
4. **Linh kiện:** phân biệt **1 phiếu /2 mã /3 linh kiện** theo fixture XLK-0002. Mỗi phiếu có đầu thẻ mã/ngày/trạng thái; dòng linh kiện có icon, SKU, tên và số lượng căn phải. Chỉ dùng phiếu POSTED đúng case trong dữ liệu đã tải, không suy toàn bộ ledger.
5. **Tác vụ:** hai nút phiếu dở/xuất linh kiện cùng chiều cao và khoảng cách, gom vào một nhóm. Vì hai chức năng vẫn chưa tích hợp P19/P21, chúng hiển thị disabled kèm giải thích, không giả lập khả năng thao tác. Handler bảo vệ hồ sơ đóng vẫn giữ nguyên.
6. **Footer:** giữ hai CTA. Trong tab Linh kiện, nút phụ là **Thông tin hồ sơ**, tránh lặp nút Xem linh kiện ngay tại tab đó; chỉ chuyển sang tab có sẵn. Tab khác vẫn có Xem linh kiện. Cập nhật xử lý giữ luồng xác nhận/receipt r05.
7. **Lịch sử:** timeline card theo cùng cách trình bày của Lịch sử, có ngày giờ/người thao tác và marker; không thêm sự kiện giả. Hồ sơ đóng/thiếu ledger có trạng thái đọc rõ ràng, không hiển thị0 khi thiếu dữ liệu.

## Nguồn và phạm vi

- Đã đọc AGENTS.md, UI_STANDARD.md, RUN_STATE r05, CSS/render của Chi tiết Lịch sử và P09 hiện tại trước sửa.
- Tabs có nguồn thực thi từ history/style.css (r05 detail rules); palette/count từ P08 r15; icon pastel từ operation-icons.css. Ảnh máy vẫn là asset P06 đã được phép, chưa có artwork Designer chính xác.
- Source HEAD vẫn `da9f623a19d0359c3e80c14f8cc612636ec6ab78`. Target prototype. Không đổi model/adapter, enum, counter definition, các màn P09 khác hoặc baseline.

## Kiểm chứng

- `node scripts/check_warranty_detail.cjs`: **6/6 nhóm PASS**, [detail-results.json](evidence/revision-06/detail-results.json). Đo computed styles của tab P09 và P08 đang chạy: font/line-height/màu/nền/radius/padding/underline/weight khớp trực tiếp.
- **18 ảnh matrix:**3 tab ×6 viewport494×1000,360×800,430×932,1440×900,340×420,1869×940. DPR1; shell494×950; tab chia đều; không overflow ngang/nút; footer và nội dung không đè nhau. [detail-metrics.json](evidence/revision-06/detail-metrics.json).
- Kiểm quantity/codes/documents, button context, tác vụ chưa khả dụng, bàn phím Arrow/Home/End, giữ scroll theo tab, identifier dài, hồ sơ đóng và dữ liệu thiếu.
- **11/11 navigation regression PASS**, [navigation-results.json](evidence/revision-06/navigation-regression/navigation-results.json): Back/Forward, modal, P06 caller, tab cũ, UNKNOWN và logout giữ nguyên.
- **10/10 full P09 regression PASS**, [browser-results.json](evidence/revision-06/regression/browser-results.json).
- **7/7 history regression PASS**, [browser-results.json](evidence/revision-06/history-regression/browser-results.json). CSS tab P08 chỉ được chuyển về file dùng chung, không redesign P08.
- **164/164 Node PASS**, [node-tests.txt](evidence/revision-06/node-tests.txt). Tổng34 nhóm browser trong revision này đạt.
- Lượt detail test đầu điều hướng trước khi xác nhận phiên kết thúc nên timeout. Sửa test chờ Home hiển thị rồi mới đi P08; không sửa auth/guard để vượt test. Lượt cuối6/6PASS.
- Đã xem ảnh actual ba tab, cuối vùng cuộn và closed/empty. Visual vẫn chờ user review; không dùng kết quả test thay nghiệm thu hình thức.

## Xem nhanh

[Thông tin](evidence/revision-06/info-494x1000.png) · [Linh kiện](evidence/revision-06/parts-494x1000.png) · [Lịch sử](evidence/revision-06/events-494x1000.png) · [Mẫu tab P08](evidence/revision-06/history-tab-reference.png) · [Hồ sơ đóng](evidence/revision-06/closed-no-ledger.png).

Files: `warranty/warranty.mjs`, `warranty/style.css`; `shared/detail-tabs.css` mới; `history/style.css` chuyển rule tabs; `auth-session/index.html`; UI_STANDARD; detail test mới + navigation test cho phép thư mục evidence riêng; coverage/RUN_STATE/bàn giao.

Behavior PASS fixture; visual IN_PROGRESS; integration vẫn BLOCKED theo r05. Không push/merge/deploy, không gọi API/hardware mới, không mở rộng chức năng xuất/bàn giao chưa được tích hợp.
