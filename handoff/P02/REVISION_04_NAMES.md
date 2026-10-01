# P02 revision04 — tên ngắn, bình thường và dài

2026-09-27. Yêu cầu: đề xuất và áp dụng cách xử lý độ dài tên theo ảnh `C:/Users/TAN MIE/Desktop/1.png`. Source HEAD vẫn da9f623…; working tree đã có P03–P07 và được giữ nguyên. Phạm vi sửa: lời chào P02 và version import/style tại entrypoint P01; không thay auth/danh tính/quyền/backend.

## Quy tắc được áp dụng

- Giữ nguyên `actor.name`, không tự lấy tên cuối, viết tắt, cắt chuỗi dữ liệu hoặc giảm font theo độ dài.
- Lời chào một dòng34px, font28px. “Chào bạn,” có vùng riêng; tên dùng `min-width:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis`. Rút gọn theo chiều rộng render thực tế, không phân loại bằng số ký tự.
- Tên ngắn/bình thường đủ chỗ hiện toàn bộ. Tên quá dài hiện dấu …; tên luôn là nút có hover underline, title và accessible label chứa tên đầy đủ.
- Click/chạm/Enter mở dialog native “Tên đầy đủ”: textContent an toàn, wrap cả chuỗi không khoảng trắng, max-height có scroll; nút Đóng/Escape/backdrop đóng. Native modal quản lý focus và trả về nút tên. Route change/logout đóng và cleanup dialog.
- Chip trạng thái ở dòng Kho Hoa Nam, bỏ absolute overlay. Hàng kho/status28px, giảm margin intro24→14 giữ vị trí lời chào/KPI cho fixture baseline. Tên dài không đẩy section bên dưới và không làm cơ chế fitPreview thu nhỏ cả màn.
- Thêm fixture An / Nguyễn Minh Anh / chuỗi240 ký tự không khoảng trắng. Giữ fixture Minh Anh mặc định và stress long cũ. Tất cả chỉ trong bộ nhớ, không sửa profile thật.

## Kết quả thực chạy

- `node scripts/check_home_names.cjs`: **15/15** ca (5 fixtures × viewport1869×940,494×950,360×800). Assertions: hero/KPI/scale bằng baseline tại cùng viewport; font28px; badge không giao heading; không overflow ngang; short/normal không ellipsis; long/unbroken ellipsis; màn vẫn vừa viewport.
- Mỗi ca kiểm mở/đóng tên bằng Enter/Escape và click/nút Đóng, focus quay lại đúng; nội dung dialog bằng chính xác actor.name; không tràn ngang. Kiểm thêm route dismissal, P04–P07 smoke và logout cleanup. Không JS error.
- `HOME_EVIDENCE_DIR=handoff/P02/evidence/revision-04-names/regression node scripts/check_home.cjs`: **14 nhóm PASS**,7 captures, không external request/JS error.
- `node --test tests/auth-session.test.mjs tests/auth-session-visual-contract.test.mjs tests/home.test.mjs tests/warranty-component-history.test.cjs`: **33/33 PASS**. `git diff --check`: exit0, cảnh báo CRLF ở source warranty có trước.
- Lần đầu check_names không chạy do server dừng; lần kế locator summary mơ hồ do thêm P03–P07. Đã bật server/sửa test locator theo nhãn P02, chạy lại PASS. File failure là lịch sử thử, `results.json` là kết quả cuối.

## Bằng chứng

[Kết quả/số đo](evidence/revision-04-names/results.json) · [Tên ngắn](evidence/revision-04-names/1869-short.png) · [Bình thường](evidence/revision-04-names/1869-normal.png) · [Tên dài](evidence/revision-04-names/1869-long.png) · [Dialog mobile](evidence/revision-04-names/360-full-name.png) · [Hồi quy Home](evidence/revision-04-names/regression/browser-results.json).

File sửa: `home/home.mjs`, `home/style.css`, version cache tại `auth-session/app.mjs` và `index.html`; thêm `scripts/check_home_names.cjs`. Không sửa modules P03–P07. Đây là runtime state phục vụ P02.S01, không board/prompt mới. Visual toàn B02 và backend vẫn giữ trạng thái trước; test này chỉ chứng minh sửa lỗi tên trong prototype, không xác nhận pixel-perfect/backend/hardware.
