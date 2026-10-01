# Sáu cải tiến UI/UX Hoa Nam — 30/09/2026

Đã áp dụng theo yêu cầu “Áp dụng đề xuất cho tôi”. Giữ 24 board / ít nhất 91 panel, AppShell 494×950, footerLOCK, icon, dialog và các guard nghiệp vụ. Các bản chốt cũ vẫn là lịch sử; **giao diện mới chờ user review**. [Nguồn thiết kế và phạm vi](DESIGN_TRACE.md) · [Xem trước–sau](REVIEW.html).

## Kết quả

| Đề xuất | Đã triển khai |
|---|---|
| 1. Vùng bấm dễ dùng | P01–P11 mở rộng các nút Back, xóa/tìm/lọc, copy và action dialog được chỉ định lên tối thiểu khoảng 44px sau co khung. Dành không gian thật cho control; P03 header/close và hàng copy NFC không chồng tác vụ. P10 dùng controller hiện có. Footer và lịch không bị đổi. |
| 2. Nhập mã tập trung | P04/P05 thu vùng minh họa camera từ 128 xuống 40px khi mở Nhập tay. Input giữ kết nối DOM và focus khi nhận mã; Enter trong IME không gửi. 494×1000 thấy ô nhập, bộ đếm và mã gần nhất; cửa sổ 340×420 dùng cuộn nội bộ cho danh sách. |
| 3. Mở lại sản phẩm | P06 hiển thị tối đa 3 sản phẩm Vừa xem khi query trống. Chỉ nhớ ID trong phiên theo actor/kho/danh mục; đọc lại nguồn khi mở, xóa khi logout. |
| 4. Tìm UID bằng Enter | P07 mở chi tiết khi có một kết quả đầy đủ đã xác minh; nhiều hoặc nguồn partial chuyển focus dòng đầu. Chặn rỗng/IME/nguồn lỗi; không tự liên kết. |
| 5. Ngày nhanh | P06 dùng Hôm nay / 7 / 30 / 90 ngày của picker P08. Apply mới lưu; Hủy/Back không commit. Sửa lệch mặc định ngày fixture cũ về Tất cả ngày. |
| 6. Xác nhận rõ thay đổi | P05 đổi phiếu xem người nhận, điện thoại, số lượng, nhóm hàng, địa chỉ, ghi chú trước→sau. Hủy không tạo ID; confirm quá hạn khi bản nhập đổi bị chặn. Văn bản dài cuộn trong một dialog. |

Lưu nháp qua đóng/tải lại app là định hướng dài hạn, cần contract riêng và không nằm trong sáu hạng mục. Không triển khai storage/backend mới trong đợt này.

## Kiểm chứng

| Phạm vi | Kết quả cuối |
|---|---|
| Logic các module liên quan | **214/214 PASS**, 19 file test riêng biệt. [Log](node-tests.txt). Các tổng Node của agent là tập con, không cộng lần nữa. |
| Shared vùng bấm | **12 nhóm / 66 lượt đo** ở 6 viewport, [verified/results.json](touch/verified/results.json). |
| Bấm thực tế và lifecycle | **9 nhóm PASS**, kiểm 9 điểm mỗi target, P03/clear/copy/password/Back và cô lập P10/board sau. [verified-edges](touch/verified-edges/results.json). |
| Hồi quy P10 | **7 nhóm PASS**, [profile-regression](touch/profile-regression/results.json). |
| Hồi quy P11 | **7 nhóm PASS**, [security-regression](touch/security-regression/results.json). |
| Footer Home/P03 | **4 viewport PASS**, [bằng chứng](touch/verified-footer/). |
| P04/P05 | **41 nhóm browser PASS**, gồm nhập liên tục/IME/UNKNOWN/source diff/Back/select. [Báo cáo chi tiết](p04-p05/REPORT.md). |
| P06 và đường nối | **33 nhóm browser PASS**, gồm Vừa xem/ngày/nguồn lỗi/logout/NFC và hồi quy bảo hành. [Báo cáo chi tiết](p06/REPORT.md). |
| P07 | **20 nhóm browser PASS**, Enter + liên kết liên tiếp/UNKNOWN + picker/copy. [Báo cáo chi tiết](p07/REPORT.md). |

Các suite cuối không ghi nhận pageerror. Kết quả chỉ cho prototype và những ca đã kiểm; không suy toàn ứng dụng hoặc backend đã nghiệm thu. Ma trận chính: 494×1000, 360×800, 430×932, 1440×900, 340×420, 1869×940; nhóm nhập/xuất dùng thêm 390×844, 768×1024, 1440×1000.

## Nguồn và giới hạn visual

Trước–sau cùng dữ liệu/viewport/DPR trong từng bộ. Root chụp 66 trạng thái trước khi thay shared; source trước được lưu `input/`. Đã xem actual nhập tay, diff đổi phiếu, recent, picker ngày, P03 và copy NFC. Bố cục mới là adaptation được cho phép triển khai; không có raster Designer riêng để gọi pixel-perfect.

Kiểm kích thước ban đầu chưa đủ: bấm 9 điểm phát hiện copy NFC absolute bị hàng dưới che. Review độc lập phát hiện close P03 chồng tác vụ đầu và Back header còn nhỏ. Đã dành chiều cao hàng/header và đặt close vào grid; kiểm lại đạt. Log trung gian được giữ, không gọi là bằng chứng PASS. Một số lỗi test cũ là selector khớp cả recent/list hoặc kỳ vọng Escape S04 đóng hết thay vì về S02; chỉ sửa test đúng luồng, giữ kiểm nghiệp vụ.

Bàn phím mềm/cảm ứng/thiết bị kho thật, camera/NFC/WMS và lưu nháp bền **NOT_RUN/BLOCKED**. Không gọi API mới, không push/merge/deploy, không sửa baseline/dist/gallery. Không tải lại tab người dùng đang có nháp. Giữ checkpoint P23 và công việc các chat khác; tracking đợt này được thêm riêng.

## Tái hiện

```powershell
$env:UX_TOUCH_PHASE='after'
$env:UX_TOUCH_OUT='handoff/ux-upgrade-2026-09-30/touch/new-run'
node scripts/check_ux_touch_upgrade.cjs
$env:UX_TOUCH_EDGE_OUT='handoff/ux-upgrade-2026-09-30/touch/new-edges'
node scripts/check_ux_touch_edges.cjs
```

Lệnh từng nhóm và env output xem báo cáo P04/P05, P06, P07. Luôn dùng thư mục mới để giữ bằng chứng lịch sử. Source checksum và danh sách nguồn ở `source-sha256.json`; trạng thái tổng hợp ở `SUMMARY.json`.
