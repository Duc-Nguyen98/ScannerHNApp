# P05 revision11 — audit thao tác thực và sửa popup địa giới

Yêu cầu: rà soát UI/UX kỹ thêm lần nữa, xử lý lỗi nhỏ phát sinh. Đã đọc AGENTS/UI_STANDARD và giữ các tích hợp mới của workspace: ngoại lệ đi P17, trạng thái/đối chiếu mới, source/recipient/group dùng shared choice dialog; không rollback về hành vi cũ chỉ để chạy script r10.

## Phát hiện có thể tái hiện

Trước sửa, [edge probes](evidence/revision-11/edges-before/results.json) có3 lỗi:

1. Tìm tỉnh từ14 mục còn1 mục khiến popup cao300→109 CSS px và đổi từ trên xuống dưới trigger (y319.97→682.97, nhảy363px). Ô tìm kiếm nhảy dù caret vẫn active.
2. Nhấn ArrowUp khi focus ở ô tìm kiếm chọn mục áp chót thay vì mục cuối (code110 thay111 trong catalogue test).
3. Nhấn End để mở popup focus vào mục cuối nhưng không cuộn mục đó vào phần nhìn thấy.

Ngược lại7 nhóm thao tác tự nhiên ban đầu **đã đạt**, không tuyên bố chúng là lỗi đã sửa: click từ địa chỉ vào nhóm hàng; chuyển focus sang quantity; mở lại shipping card; mở Nhập tay khi có raw chưa submit; filter từ nhiều→rỗng; Back từ P17.S02 giữ phiếu; quick-edit quay về review giữ mã. [Before](evidence/revision-11/before/results.json).

## Sửa

- Popup chốt hướng mở và chiều cao mong muốn cho mỗi phiên mở; tìm kiếm/lọc/không kết quả không thay kích thước hoặc chuyển phía. Chỉ tính lại giới hạn theo viewport/anchor và đổi phía khi phía cũ không còn khoảng trống dùng được. Đóng→mở lại lấy hình học mới.
- Khi không có kết quả, thông báo được căn giữa phần còn lại dưới ô tìm, không đặt ở đáy một vùng trắng. Không đổi màu/palette/control khác.
- Keyboard xử lý riêng index=-1 khi đang ở search; ArrowUp tới mục cuối, ArrowDown tới đầu; Home/End khi mở từ trigger chọn đúng đầu/cuối. Target option luôn được reveal trong list, kể cả popup có ô tìm kiếm. Không thay selected value cho tới Enter/Space/click.
- Giữ click ngoài/Escape/Tab, focus return, lọc không dấu, một popup tại một thời điểm, phương thức lựa chọn chung cho3 trường metadata. Không đổi dữ liệu địa giới/validation/nghiệp vụ hoặc số lượng.

## Kiểm chứng

- **418/418 Node workspace PASS**: [log](evidence/revision-11/node-tests.txt). Đây là tổng tại thời điểm chạy có cả công việc ngoàiP05; không lấy số test làm nghiệm thu hình thức.
- **6 nhóm edge cases PASS**: [final](evidence/revision-11/edges-final/results.json), gồm3 lỗi ban đầu, mở lại list đã cuộn,6viewport với tìm1/0/tất cả và giữ footer, raw không mất khi repaint. Viewport340×420/390×844/494×1000/768×1024/1440×1000/1869×940.
- **7 nhóm tương tác tự nhiên hồi quy PASS**: [after](evidence/revision-11/after-isolated/results.json). Tổng13 nhóm browser, không pageerror ở kết quả cuối.
- Bản after chạy trên server local riêng8768 cùng checkout để tránh tải đồng thời server8766; test dùng mock địa giới, không chạm tab đang có nháp của user. Một lượt8766 chờ #username timeout trước khi có test case giữ log `edges-after/results.json`, không coi là lỗi đã sửa trong component.

## Visual/source

Bảng nguồn trước sửa: [CONTEXT](REVISION_11_CONTEXT.md). Actual cùng494×1000/DPR1 và query`ho chi minh`, cùng catalogue/phiếu:

- [Trước: popup đổi phía/co nhỏ](evidence/revision-11/edges-before/search-position.png).
- [Sau: cùng kết quả, giữ vị trí/chiều cao](evidence/revision-11/edges-final/search-one-result.png).
- [Không khớp](evidence/revision-11/edges-final/search-position.png);6 ảnh`stable-{width}.png` kiểm cạnh app/footer.

Đã xem ảnh actual. Đây là sửa interaction của popup được yêu cầu, không có raster riêng Designer cho nhánh search để tuyên bố pixel-perfect; visual vẫn chờ user review. Không đổi form/cards/sticky scan/draft guard hoặc cấu trúc4 panel. Những lượt không tái hiện lỗi chỉ ghi đã kiểm, không ghi là đã sửa.

WMS/camera/hardware chưa kiểm chứng; API địa giới live không chạy lại vì không sửa lớp network. Không ghi storage, push/merge/deploy; giữ checkpoint hiện hành và91 baseline panel. Không bảo đảm trước mọi lỗi ngoài các ca kiểm tra đã ghi.
