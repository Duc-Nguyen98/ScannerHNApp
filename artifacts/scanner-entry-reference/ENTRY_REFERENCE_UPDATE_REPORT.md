# Login + Xác nhận phiên — cập nhật chi tiết theo reference A

Ngày09/09/2026. Phạm vi: hai màn vào app. Không sửa Home, Global Scanner, footer điều hướng hoặc business flow. Không chạy P04; chưa commit/push/deploy.

## Kết quả

- Hai footer dùng chung component, cùng chính xác câu **KẾT NỐI CON NGƯỜI - VẬN HÀNH HIỆU QUẢ**, dưới dòng **HOA NAM SCANNER**; có hai đường ngang hai bên như ảnh Login.
- Rebuild spacing/typography theo vùng app436×918 trong reference, co giãn theo chiều rộng app chứ không theo cửa sổ desktop. Không đưa bezel, camera notch, pin/giờ hoặc home indicator giả vào runtime.
- Login: branding/hero hai dòng, floating card, label/input, user/lock/eye, forgot link, CTA arrow, shield/security surface được căn lại theo ảnh.
- Xác nhận phiên: greeting/name, motto **MỖI / THAO TÁC / TẠO NÊN / GIÁ TRỊ**, avatar/role/chevron, warehouse mark, green dot status, Info icon, play icon trên tonal tile, chevron CTA, divider “hoặc”, logout outlined.
- Nhân viên dùng approved staff asset với CSS silhouette clip, thay ghép ảnh chữ nhật có viền nền lộ; warehouse vẫn dùng approved warehouse asset. Không thêm stock photo mới.
- Giữ mock/session hiện có; không đổi credentials, shift service, warehouse paused, route guard, permission, Inventory/Post, Warranty hoặc NFC.

## Cấu trúc code

- `components/scanner-entry-reference.css`: một lớp trình bày scoped `.vl-entry`, chỉ Login/Shift.
- `components/scanner-auth.tsx`: thay markup/icon/footer; `useScannerAccess()` nguyên vẹn được đối chiếu SHA256.
- Gỡ các override Login/Shift cũ trong `scanner-visual-lock.css` để không còn hai bộ style tranh nhau.
- `scanner-entry-ui.css` giữ nguyên cho recovery và shared entry states; màn Quên mật khẩu vẫn hoạt động và được test.
- `AGENTS.md` ghi nhận slogan chung đã được duyệt.
- `scripts/build-scanner-pages.mjs` đưa CSS mới vào standalone artifact.

## Reference / Before / After

- [Gallery](index.html)
- [Login](comparison-login.png)
- [Xác nhận phiên](comparison-shift.png)
- [Ảnh360/390/430/436 và desktop](after/)
- [Landmarks đã đo](landmarks.json)

Reference crop được đọc thủ công tại x212/y58 (Login), x800/y58 (Shift). Mốc đo dựa vào vùng nội dung, không bezel. Gallery giữ slogan Shift cũ ở cột Reference để nhìn thấy việc đổi slogan theo yêu cầu mới.

Các mốc trọng tâm được kiểm tra: card, hai input, avatar, CTA chính, security surface, logout. Sai số vị trí/kích thước cụ thể nằm trong `landmarks.json`; không suy rộng từ một vài hình chữ nhật sang khẳng định mọi pixel đã giống100%.

## Kiểm thử

| Hạng mục | Kết quả |
|---|---|
| 360×800 /390×844 /430×932 /436×918 /desktop1440×1000 | PASS |
| Login, validation, error, forgot, shift, Home, shift-paused | 35 state captures/axe checks |
| Label association, focus Next, Enter submit, password show/hide | PASS |
| Login loading disable, CTA không đổi chiều cao | PASS |
| Inline error và field validation | PASS |
| Reload Shift, bắt đầu ca→Home | PASS |
| Logout và deep-link guard | PASS |
| Kho paused vào ca read-only, write tasks khóa | PASS |
| Chiều cao420px, safe-area, reduced motion | PASS |
| Console/page errors trong entry suite | 0 |
| axe WCAG A/AA violations trong entry suite | 0 |
| Auth/shift/policy unit tests | 17/17 PASS |
| E2E nhập/xuất/Post, parts, warranty, NFC, history | 36 checkpoints PASS trên3 viewport |
| TypeScript scanner và scoped oxlint | PASS |

[Entry QA](after/qa.json) · [E2E](e2e/e2e.json) · [Hashes](after/source-hashes.json).

Safe-area/keyboard ở đây là mô phỏng viewport thấp và thao tác cuộn; chưa phải kiểm thử iOS/Android keyboard hoặc VoiceOver/TalkBack trên máy thật.

## Regression Home và business freeze

SHA256 của Home component/CSS, main app, launcher, shell/overlay, auth adapter, policy, model và design fixtures khớp Before. Auth hook cũng khớp. Không thay dữ liệu mock đã duyệt.

Home Before/After được so cả PNG và decoded pixels: PNG không identical byte-for-byte; khác biệt decoded chỉ tối đa1 mức màu trên255 tại vùng ảnh hero, không phải thay bố cục hoặc nội dung. Phần dưới hero không có pixel khác. [Chi tiết](home-pixel-check.json).

Build trên Windows có cảnh báo libuv sau prerender như runtime hiện có; artifact hoàn chỉnh được kiểm tra bằng browser thực tế trên4174.

## Kết luận phạm vi này

Implementation và functional/accessibility/regression checks: **PASS**. Footer hai màn được kiểm tra đúng nội dung100% theo chuỗi yêu cầu.

Không chứng nhận toàn bộ ảnh render “pixel-identical100%”: ảnh kho/nhân viên là approved asset pack và glyph/font raster của reference khác engine render runtime. Các so sánh Before/After và tọa độ được cung cấp đầy đủ để đối chiếu, không tự nâng Visual Lock P01–P03 toàn app thành PASS và không chạy prompt tiếp theo.
