# P03 revision 04 — Dùng footer Home P02 LOCKED

Chỉ thị mới: footer P03 phải đồng bộ theo footer Home P02 đã chốt. Chỉ thị này thay yêu cầu footer vuông/màu scan riêng ở các revision trước; **backdrop vẫn vuông góc và tối 80%, màu nút dialog vẫn theo P01**.

## Thực hiện

- P03 tiếp tục sử dụng chính node `.hn-nav` do Home tạo, với cùng SVG/icon, nhãn, thứ tự và trạng thái tab của caller. Không tạo một footer khác.
- Xóa toàn bộ override P03 về màu, padding, kích thước nút/icon, radius, shadow, căn nhãn và vị trí scan-circle. Footer kế thừa trực tiếp `docs/flows/home/style.css`: min-height75px, padding8px, radius23px ở hai góc trên, icon25px, scan-circle62px/icon31px, màu scan #007399, màu/nhấn tab theo Home.
- Override duy nhất dành cho footer P03 là vị trí neo đáy khung overlay. Host đọc chiều cao footer thực tế qua `offsetHeight`, không dùng con số67px cũ; dialog/sheet tránh vùng footer và nút scan nhô lên.
- Không sửa `home/style.css`, icon Home, baseline P02, hành vi nghiệp vụ hoặc P04. Chiều rộng/scale khung P03 vẫn theo responsive đã có; mẫu footer dùng cùng CSS responsive theo chiều rộng khung, không đổi kích thước toàn bộ P03 sang Home.

File thay đổi: `docs/flows/scanner-dialogs/style.css`, `docs/flows/home/home.mjs` (đo footer), `docs/flows/auth-session/index.html`, `app.mjs` (version tài nguyên), `scripts/check_dialogs.cjs`.

## Kiểm chứng

- [P03: 14 nhóm PASS, 29 captures](evidence/revision-04/browser-results.json); [metrics](evidence/revision-04/render-metrics.json).
- Mỗi capture so sánh trực tiếp footer khi ở P03 với footer đã đọc từ P02 trước khi mở dialog: `innerHTML` giống nhau; computed height/min-height/padding/radius/background/color/font/gap/alignment/shadow/fill/stroke/margin của các nút, SVG và span giống nhau. Vị trí neo footer không nằm trong phép so sánh vì P03 là overlay; chiều rộng cột đáp ứng theo khung.
- Bỏ các assertion hình học footer riêng từ revision03 (radius0, scan nhô21px); thay bằng phép so sánh với **nguồn P02 thực tế**. Assertions backdrop vuông, lề đối xứng, neo đáy, không cắt cạnh phải, không đè tác vụ cuối, Tab/focus và nghiệp vụ vẫn giữ.
- [Home: 14 nhóm hồi quy PASS](evidence/revision-04/home-regression/browser-results.json), 7 captures. Không lỗi JavaScript hay request ngoài localhost trong lần chạy cuối.
- Đã xem ảnh actual [S01](evidence/revision-04/P03-S01-394.png); [S02](evidence/revision-04/P03-S02-394.png). Ma trận viewport giữ như r03, gồm chiều cao bàn phím mô phỏng.

Lệnh: đặt `$env:DIALOG_EVIDENCE_DIR='handoff/P03/evidence/revision-04'` rồi `node scripts/check_dialogs.cjs`; đặt HOME_EVIDENCE_DIR cùng thư mục `home-regression` rồi `node scripts/check_home.cjs`.

Lần kiểm đầu phát hiện container footer kế thừa màu ink P03; đã bỏ màu screen override để nó kế thừa Home. `browser-failure.json`/`failure.png` là log trước sửa; `browser-results.json` mới là kết quả cuối. Evidence các revision trước giữ nguyên. Không chạy lại Node unit tests cho thay đổi giao diện này.

Yêu cầu đồng bộ component footer đã kiểm PASS. Không nâng visual toàn bộ B03 thành pixel-perfect; các giới hạn font/texture cũ và integration production vẫn còn.
