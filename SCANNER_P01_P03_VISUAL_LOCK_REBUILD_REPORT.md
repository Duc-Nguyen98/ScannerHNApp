# Hoa Nam Scanner — P01–P03 Visual Lock Rebuild

Ngày: 09/09/2026. Phạm vi: Login, Start Shift, Home, Global Scanner, Draft Confirm, Warehouse Paused Warning; shared presentation tối thiểu.

## 1. Executive summary

Đã thực hiện rebuild trong runtime bằng approved asset pack mới cung cấp. Blocker “không có asset local” của lần trước đã được giải quyết. Không còn dùng kết luận cũ đó để đánh giá bản này.

Functional/regression gate đạt trên bộ kiểm tra được chạy. Visual Lock gate tổng thể **chưa đạt**: chưa thể xác nhận cả sáu màn ≥95/100 và sai số ±2px. Không chạy P04; không commit, push hoặc deploy.

- [App tương tác local](http://127.0.0.1:4174/WMS_UIUX_HoaNamv2/app-scanner/)
- [Reference / Before / After](artifacts/scanner-visual-lock/index.html)
- [After screenshots — 18 ảnh](artifacts/scanner-visual-lock/implementation-after/)
- [So sánh riêng từng màn — 6 ảnh](artifacts/scanner-visual-lock/comparisons/)
- [QA và geometry](artifacts/scanner-visual-lock/qa/results.json)

Đây là app local với dữ liệu hiện có. Không gọi API production, không ghi dữ liệu production. Các thao tác gửi/ghi sổ trong QA chỉ chạy ở browser context local tách biệt.

## 2. Source of truth và asset provenance

References A/B/C: bản JPG người dùng cung cấp, lưu nguyên tại `artifacts/scanner-visual-lock/references/`.

Approved pack: `C:/Users/Admin/Desktop/HoaNam_Scanner_Approved_Asset_Pack/HoaNam_Scanner_Approved_Asset_Pack/`.

Manifest xác nhận các ảnh được raster-extracted từ sheet, không phải original Figma/vector masters. Chỉ dùng:

- `bg_warehouse_main.jpg`: warehouse hero chung Login/Shift/Home.
- `staff_warehouse.jpg`: compositing CSS trong Start Shift, không thêm stock photo.
- `icon_inbound.png`: package icon trong tác vụ Nhập kho.
- `logo_icon.png`: lưu nguồn đối chiếu; các cạnh/alpha của raster bị răng cưa khi đưa vào UI.
- `brand-mark.svg`: vẽ lại hình học scanner mark từ asset đã duyệt để hiển thị nét; không coi đây là vector master gốc.

Không dùng nguyên asset sheet làm background app. Không đưa phone mockup, bezel, giờ/pin giả, caption thuyết trình vào runtime. Badge/status vẫn là text và icon accessible, không dùng hình chụp chữ.

[Manifest nguồn và mapping](artifacts/scanner-visual-lock/asset-provenance.json).

## 3. Baseline issues → implementation

| Màn | BEFORE | AFTER |
|---|---|---|
| Login | Hero phẳng, branding chia dòng, card sát phía trên, không có icon field | Warehouse hero, branding ngang, title hai dòng, floating card, user/lock/eye, CTA có arrow, security surface và footer |
| Start Shift | Hero/form generic, avatar nhỏ, kho/status tách dòng, logout dạng text | Warehouse + staff hero, greeting/name, avatar tròn, kho/status cùng hàng, permission surface, play CTA, divider “hoặc”, logout outlined |
| Home | Hero phẳng, summary/tile cao, icons không có tonal surface | Hero ảnh kho, avatar initials từ session, summary 3 cột liền, task grid gọn, tonal icons, lookup bar và recent records compact |
| Launcher | Divider-only rows, icon không có nền | 4 bordered rows, tonal icons xanh lá/xanh dương/cam/tím, handle/close, nav còn nhìn thấy phía dưới nhưng background inert |
| Draft Confirm | Confirm nằm trong bottom sheet | Warning dialog đặt giữa vùng app theo vị trí reference, tiêu đề/copy centered, ba CTA giữ nguyên callback |
| Paused Warning | Chỉ có inline locked card | Bổ sung informational pause dialog trên nhánh denied-write hiện có; “Chỉ tra cứu”, “Đóng”; không đổi trạng thái kho |

Đã sửa MIME SVG/JPEG/PNG của server preview local; logo SVG được kiểm thử decode thành công. Đây là sửa preview delivery, không phải logic ứng dụng.

## 4. Reference / Before / After evidence

Mỗi ảnh so sánh có 3 cột: Reference | BEFORE | AFTER.

| Screen | Evidence 390×844 | Responsive |
|---|---|---|
| Login | [So sánh](artifacts/scanner-visual-lock/comparisons/login.png) | [360](artifacts/scanner-visual-lock/implementation-after/360-login.png) / [430](artifacts/scanner-visual-lock/implementation-after/430-login.png) |
| Start Shift | [So sánh](artifacts/scanner-visual-lock/comparisons/shift.png) | [360](artifacts/scanner-visual-lock/implementation-after/360-shift.png) / [430](artifacts/scanner-visual-lock/implementation-after/430-shift.png) |
| Home | [So sánh](artifacts/scanner-visual-lock/comparisons/home.png) | [360](artifacts/scanner-visual-lock/implementation-after/360-home.png) / [430](artifacts/scanner-visual-lock/implementation-after/430-home.png) |
| Global Scanner | [So sánh](artifacts/scanner-visual-lock/comparisons/launcher.png) | [360](artifacts/scanner-visual-lock/implementation-after/360-launcher.png) / [430](artifacts/scanner-visual-lock/implementation-after/430-launcher.png) |
| Draft Confirm | [So sánh](artifacts/scanner-visual-lock/comparisons/draft.png) | [360](artifacts/scanner-visual-lock/implementation-after/360-draft.png) / [430](artifacts/scanner-visual-lock/implementation-after/430-draft.png) |
| Paused Warning | [So sánh](artifacts/scanner-visual-lock/comparisons/paused.png) | [360](artifacts/scanner-visual-lock/implementation-after/360-paused.png) / [430](artifacts/scanner-visual-lock/implementation-after/430-paused.png) |

Crop reference là vùng app **ước lượng**, chuẩn hóa hiển thị về390×844. JPG phối cảnh/bo cạnh và tỷ lệ màn trong ba reference không hoàn toàn đồng nhất. Vì vậy không dùng gallery này như phép đo pixel-diff chứng nhận ±2px.

## 5. Visual review gate

Điểm dưới đây là đánh giá thủ công bảo thủ từ ảnh side-by-side, **không phải phần trăm pixel similarity**.

| Screen | Layout | Typography | Color | Spacing | Component match | Overall |
|---|---:|---:|---:|---:|---:|---:|
| Login | 95 | 92 | 94 | 93 | 94 | 93.6 |
| Start Shift | 94 | 93 | 91 | 93 | 91 | 92.4 |
| Home | 92 | 92 | 94 | 90 | 92 | 92.0 |
| Global Scanner | 95 | 94 | 96 | 95 | 95 | 95.0 |
| Draft Confirm | 95 | 94 | 96 | 94 | 96 | 95.0 |
| Warehouse Paused | 95 | 94 | 96 | 94 | 96 | 95.0 |

**Gate tổng thể FAIL:** Login/Shift/Home chưa đạt95. Ngay cả các hàng95 chỉ là visual review, không khẳng định mọi token đã đạt sai số±2px.

Sai lệch còn lại có evidence:

1. Warehouse/staff trong pack khác góc chụp, tỷ lệ và bố cục hero gốc. Staff là JPEG nền liền, không phải cutout nhân viên trong reference A. CSS đã scale/blend nhưng không thể tái tạo chính xác cảnh gốc từ các pixel khác nhau.
2. Typography của raster reference và Public Sans runtime còn khác perceived weight/line breaking. Giữ Public Sans như contract; không tự đổi font để “giống ảnh”.
3. Home tile/summary và metadata chưa trùng toàn bộ density reference; layout vẫn chịu dữ liệu thật từ store.
4. Card Login ở390: x14/y314/w362/h426; Shift: x14/y304/w362/h442.5. Đo implementation có thật trong capture JSON, nhưng reference chưa có tọa độ gốc có thể dùng để chứng nhận±2px.
5. Glyph logo đã được dựng nét lại, nhưng chưa phải vector logo gốc có thể xác nhận1:1.

**Blocker đối với chứng nhận pixel-lock:** nguồn cung cấp hiện có đủ để rebuild gần thiết kế, nhưng không chứa chính xác hero composited/typography measurement của ảnh A/B. Để giữ yêu cầu gần1:1 nghiêm ngặt, cần hero gốc hoặc export vùng UI không phối cảnh; phương án khác là người dùng xác nhận các sai lệch cụ thể của bản dùng approved pack này được chấp nhận. Không tự coi việc nhận asset pack là miễn trừ gate.

## 6. Business freeze và sai khác dữ liệu có chủ đích

- `useScannerAccess()` so sánh nguyên văn trước/sau: không đổi.
- SHA256 `lib/scanner-model.ts`, `lib/scanner-auth.ts`, `lib/scanner-auth-preview.ts`, `lib/scanner-policy.ts` khớp snapshot trước rebuild.
- Không sửa permission matrix, auth adapter, start-shift service, stock/Post, warranty eligibility, NFC, route guard hoặc scanner contexts.
- Home chỉ có chứng từ trong store; không thêm PX-0004/BH-001 vào danh sách docs để đủ3 rows.
- Ca chưa có timestamp: giữ “— / Đã vào ca”, không tự đặt08:30.
- Không tạo notification count3 hoặc nút notification giả chưa có chức năng.
- Giữ tên nav Trang chủ / Chứng từ / Quét mã / Lịch sử / Cá nhân, không đưa Tồn kho/Thêm từ reference C vào architecture.
- Draft dialog được chụp trên flow đang soạn thật, không chuyển Home để giả giống nền reference.
- Paused dialog mở trên denied-write route thật, không dựng màn tồn kho laptop trong reference C.
- “Chỉ tra cứu” điều hướng vào lookup đã có; “Đóng” chỉ đóng cảnh báo, locked screen vẫn giữ nguyên. Không tự mở quyền write.
- QA fixture paused dùng `?qa=1`; controls nhìn thấy phía sau trong evidence đó là harness test, không phải customer mode.

## 7. Test results

| Suite | Kết quả | Evidence |
|---|---|---|
| Model/Policy/Auth/Account/Intent | 31/31 PASS | Node test run; lệnh ở dưới |
| E2E nghiệp vụ | 36 checkpoints PASS:12×3 viewports | [e2e.json](artifacts/scanner-visual-lock/regression-e2e/e2e.json) |
| App shell overlays | 44/44 PASS:11×4 sizes | [qa.json](artifacts/scanner-visual-lock/regression-shell/qa.json) |
| Visual Lock states | 27 states:9×3 viewports | [results.json](artifacts/scanner-visual-lock/qa/results.json) |
| Accessibility tự động | 0 WCAG A/AA violations trong27 states | Cùng results.json |
| Console/page errors | 0 trong suites browser đã chạy | JSON từng suite |
| TypeScript scanner scope | PASS | `tsc -p tsconfig.scanner.json --pretty false` |
| Lint scoped components | PASS | oxlint scanner-auth/launcher/preview/home |
| Standalone build | Artifact build thành công và chạy được | Browser tests trên artifact4174 |
| Logo SVG | Decode thành công ở3 widths | `logo-svg-decodes` |

Build có cảnh báo Windows libuv sau prerender (`3221226505`) từ runtime có sẵn. Script chỉ chấp nhận mã này rồi kiểm tra output; không gọi đó là browser console error. Artifact đã được kiểm thử thật.

E2E đã chạy: Login→Shift→Home; inbound submit và Post; outbound recipient/quantity→submit retry/idempotency→Post; tra cứu tồn; docs search/empty; warranty parts submit/Post; warranty status/tabs; NFC bind/revoke; lịch sử. Stock không đổi trước Post; BOX-001 sau xuất3 còn17.

Overlay suite: launcher, draft, camera, manual, warehouse admin confirm, NFC confirm, warranty confirm, logout, avatar, dirty-password confirm, short/safe-area. Desktop1440×1000 kiểm tra overlay không tràn khỏi khung app.

## 8. Accessibility / mobile

- Phone360×800,390×844,430×932: không horizontal overflow, overlay/backdrop nằm trong app viewport.
- Labels và error association còn nguyên; username Enter→password; password Enter→submit; show/hide password hoạt động.
- Inline validation/credential error được chụp; không chỉ toast.
- Dialog ARIA name/description, background inert, focus trap, Escape/Back, focus restore chạy được.
- Launcher có4 actions; disabled vẫn có reason; no NFC/parts row.
- Continue draft giữ tên phiếu; discard chuyển outbound; không overwrite trước confirm.
- Reduced-motion và short-height/safe-area đã được kiểm tra trong shell suite.
- Scroll ở chiều cao420px vẫn đưa CTA login vào vùng nhìn thấy.
- **Chưa xác minh trên bàn phím iOS/Android thật**, VoiceOver/TalkBack thật, camera/NFC hardware. Không coi emulated viewport là kiểm thử thiết bị vật lý.
- 0 axe violations không đồng nghĩa toàn bộ accessibility đã hoàn hảo; cần manual assistive-tech UAT khi có thiết bị.

## 9. Files và cách chạy lại

Presentation: `components/scanner-auth.tsx`, `scanner-launcher.tsx`, `scanner-preview.tsx`, `scanner-visual-lock.css`, `scanner-approved-assets/`.

Delivery: `scripts/build-scanner-pages.mjs`, `serve-scanner-artifact.mjs`.

Evidence scripts:
- `scripts/capture-visual-lock-after.mjs`
- `scripts/qa-visual-lock.mjs`
- `scripts/build-visual-lock-gallery.mjs`

```powershell
npm run build:scanner
node scripts/serve-scanner-artifact.mjs
# Các lệnh dưới chạy ở terminal khác:
node scripts/capture-visual-lock-after.mjs
node scripts/qa-visual-lock.mjs
node scripts/build-visual-lock-gallery.mjs
node --test tests/scanner-intent.test.mjs tests/scanner-model.test.mjs tests/scanner-policy.test.mjs tests/scanner-auth.test.mjs tests/scanner-account.test.mjs
```

Giữ nguyên uncommitted changes từ P00–P03 có trước. Không sửa WMS/product preview ngoài Scanner.

## 10. Stop gate

Bản rebuild và evidence được bàn giao để review, **không phải bản đã được visual-lock phê duyệt**. Asset blocker cũ được giải quyết; blocker còn lại là chứng nhận khớp nghiêm ngặt với bố cục hero/source raster khác biệt nêu ở mục5.

Không thực hiện P04–P17. Không tự xuất bản.

VISUAL LOCK FAIL — DO NOT CONTINUE P04
