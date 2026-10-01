# P08 r15 — nền đồng nhất và badge số lượng

Phạm vi user: màu nền lệch trên Hoạt động theo ngày, bỏ câu ghi chú cuối, thiết kế số kết quả/tổng/số hoạt động trong danh sách.

## Đã áp dụng
- App/body/scroll S04 cùng canvas#fcfeff, không còn nềnscroll#f5f8fb khác body. Thẻ trắng cùng viền#dceafa và không box-shadow; không còn dải màu thừa do nền khác nhau.
- Ô thống kê thường/icon-tile/badge dùng cùng xanh nhạt#f0f7ff của control ngày. Ô Tổng cộng giữ accent đã chốt để phân cấp; không dùng màu trạng thái để mã hóa nhóm nghiệp vụ.
- Bỏ hẳn câu Dữ liệu lịch sử được lưu trữ để tra cứu, đối soát và báo cáo khi cần thiết khỏi markup S04, không chỉẩn bằngCSS.
- countBadge shared dùng cho số kết quả ở6history views, Tổng của danh sách và5 nhóm hoạt động. Badge readonly, numbersemibold, border/radius/type chung.
- Badge kết quả cùng lề trái datebar; badge nhóm cùng chiều rộng112px và thẳng mép phải. Toolbar cho phép wrap khi thiếu chỗ.
- Các dòng Nhập kho/Xuất kho/Bảo hành/NFC/Chứng từ là nhóm hoạt động, không phải trạng thái; giữ nguyên nhãn/điều hướng và dùng badge số lượng, không gán trạng thái giả.
- Không đổi picker r14, query/range/states hoặc nguồn dữ liệu.

## Kiểm chứng đúngr15
- Badge suite3/3 nhóm PASS:6views countđúng; daily6viewport ởcảtop/bottom, canvas3layers giống nhau, cards không shadow, badge align, không overflow/nav overlap.
- Đo số nhóm19/10/6/5/8; range08–09/09=>15/8/5/4/6,total38; waiting=>23; drilldown=>15; querynone=>0; sourceunavailable=>khôngbadge số/khônggrid, không0giả.
- Unified regression7/7 PASS, gồm list/filter/Back/P05shared selectors, nguồn r15 nhưng dùng cùngassertions đã chốt; evidence riêng.
- Node toàn workspace146/146 PASS.
- Đã xem ảnh dailytop/dailybottom vàNhập-xuất. Visual user acceptancepending; integrationNOT_RUN.

## Evidence
evidence/revision-15/badge-results.json; daily-top-494x1000.png; daily-bottom-494x1000.png và5viewportkhác;6historyviewcaptures; unified-regression/browser-results.json; node-tests.txt.

Giữ91panel/24prompt, baseline vàdata. Không push/merge/deploy.
