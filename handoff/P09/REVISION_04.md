# P09 r04 — chỉ hiện mô tả khi chọn Khác, căn lề form

User ngày 2026-09-28 làm rõ: bấm option Khác mới hiện mô tả; chưa chọn hoặc chọn lỗi còn lại phải ẩn. Đồng thời yêu cầu nâng cấp căn lề/viền thuận mắt. Phạm vi **P09.S02**, giữ 4 panel và nghiệp vụ.

## Đã thực hiện

- Chọn lỗi áp dụng ngay trong một thao tác, đóng hộp chọn; không cần bấm Áp dụng lần nữa. Chỉ picker lỗi P09 dùng tùy chọn `commitOnChange`; filter/sort các màn khác giữ Hủy/Áp dụng như trước.
- Chưa chọn: không render textarea mô tả. Bấm **Khác**: render ngay textarea bắt buộc. Bấm bất kỳ 17 lỗi còn lại: gỡ textarea khỏi DOM ngay. Bấm lại lựa chọn hiện tại cũng đóng picker. Search/Đóng/Escape trước khi chọn không thay giá trị.
- Giữ nháp Khác khi chuyển lựa chọn nhưng không gửi mô tả đang ẩn; giữ guard required/200 ký tự/UNKNOWN/session từ r03. Không thay danh mục hoặc enum backend.
- `faultOther`, note và accessories dùng cùng renderer `intakeField`: nhãn, control, counter cùng lề; chiều rộng bằng nhau, textarea 88 px, radius 8 px. Bỏ lớp nền/padding 14 px/viền trái 3 px của Khác gây thụt lề và viền lồng nhau.
- Nhãn bắt buộc và tùy chọn thống nhất; viền focus chuyển sang border/shadow nhẹ, lỗi vẫn có viền đỏ và chữ. Giữ keyboard focus rõ. Header/footer/app 494×950 vàscan r02 không đổi.

## Kiểm chứng

- **164/164 Node PASS**: [node-tests.txt](evidence/revision-04/node-tests.txt).
- **7/7 nhóm fault browser PASS**: [fault-results.json](evidence/revision-04/fault-results.json). Kiểm ngay từ trạng thái chưa chọn, chọn Khác, và **từng option trong 17 lựa chọn còn lại**. Kiểm chọn lại cùng giá trị, nháp/Back, required/confirm/UNKNOWN.
- **6 viewport**: kiểm form và dialog ở 494×1000,360×800,430×932,1440×900,340×420,1869×940; DPR1. Assertion lề trái/lề phải cáccontrol lệch dưới 1 px do scale, textarea 88 px, radius 8 px; không overflow, footer/dialog trongapp. [fault-metrics.json](evidence/revision-04/fault-metrics.json).
- **10/10 nhóm full P09 regression PASS**: [browser-results.json](evidence/revision-04/regression/browser-results.json).
- **7/7 nhóm shared dialog/history regression PASS**: [browser-results.json](evidence/revision-04/shared-dialog-regression/browser-results.json). Callers mặc định vẫn cần Áp dụng, không bị đổi sang chọn ngay.
- Lượt faulttest đầu timeout vì `.check()` chờ radio checked sau khi picker đã đóng/gỡ khỏi DOM đúng hành vi mới. Đổi thao tác thành click và assert model/visibility ngay sau chọn; mọi validation giữ nguyên. Lượt cuối 7/7 PASS.
- Đã xem actual [lỗi thường, ô mô tả ẩn](evidence/revision-04/standard-fault.png) và [Khác, cácô cùnglề](evidence/revision-04/form-494x1000.png). Visual chờ user review; không dùng test làm nghiệm thu thẩm mỹ.

## Bàn giao

Behavior PASS fixture; visual IN_PROGRESS; integration BLOCKED theo các báo cáo trước. Không gọi API/hardware mới, không push/merge/deploy, không đổi baseline. Coverage giữ 91 ID.

File: warranty/warranty.mjs + style.css; shared/choice-dialog.mjs (opt-in lựa chọn tức thì, guard callback một lần); auth-session/index.html;3 browser scripts và bàn giao. RUN_STATE ghi P09-r04. Source model vàfault-options không đổi.
