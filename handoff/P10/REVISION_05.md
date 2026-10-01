# P10 r05 — đường tắt hồ sơ, vùng chạm và bàn phím

Ngày2026-09-29. User yêu cầu áp dụng đề xuất UI/UX; triển khai các ưu tiên đã nêu (vùng chạm thực tế, avatar/tên mở hồ sơ, keyboard form), thêm nhận biết chức năng chưa sẵn sàng và kiểm hành trình. Phạm vi code: P10 và hai helper presentation opt-in. Không tự nhận toàn bộ App đã được nâng cấp hay nghiệm thu.

## Nguồn và thay đổi

Bảng nguồn trước sửa: [CONTEXT_REVISION_05.md](CONTEXT_REVISION_05.md). Baseline B10/r04 giữ nguyên. Source HEAD `da9f623a19d0359c3e80c14f8cc612636ec6ab78`; prototype HTML/CSS/ES modules trong `docs/flows/`. Tiếp nhận và bảo toàn các thay đổi đã có từ chat khác: action-dialog, readable-content, Home/P12/P13 và P14; không quay lại cơ chế dialog cũ.

| Đề xuất | Thực hiện / bằng chứng |
|---|---|
| Vùng chạm sau scale | `shared/scaled-controls.mjs/.css` đo vùng nhận bấm theo CSS viewport; P10 opt-in. Back/Xóa trước rộng360 hiển thị khoảng32px, nay vùng nhận bấm khoảng44px (sai số layout subpixel <0.1px). Giữ kích thước icon; không sửa footer/nav. Có kiểm click thực ngoài mép icon Xóa. |
| Đường tắt hồ sơ | Avatar và tên là hai button riêng mở P10.S02, dùng cùng handler/dirty guard với menu. Enter/Space native; Back khôi phục đúng trigger. Tên dài dùng reader chung đặt ngoài button, không lồng button. |
| Keyboard | Name/nickname dùng Next, phone dùng tel/inputmode và Done. Enter chuyển field; Done đóng nhập và đưa focus tới CTA nếu enabled, không tự submit. Enter đang composition tiếng Việt không chuyển field; giữ nguyên số0 đầu, khoảng trắng và Unicode. Event change-only từ autofill đồng bộ draft. |
| Giữ ngữ cảnh | Dùng state/guard hiện có. Kiểm Back/Forward, focus, không remount trùng; trong hành trình Tra cứu→chi tiết→Back vẫn giữ query. Không tạo store hoặc route cạnh tranh với owner. |
| Phản hồi và khả dụng | Dùng dialog hành động/kết quả chung, giữ dirty helper r04. Hiển thị hint tĩnh “Chưa hỗ trợ thay ảnh đại diện” và “Chức năng lưu hồ sơ chưa sẵn sàng.” trước khi bấm; nguồn là capability preview BLOCKED, không suy backend. Không thêm toast/result inline hoặc giả thành công. |

Tối ưu form theo lựa chọn triển khai cần user review: avatar trong editor96→88px, giảm khoảng đệm card để dành chỗ cho hint và vẫn thấy field kho cuối ở reference494×950. Hero avatar108px giữ nguyên. Name/reader có min-height theo tỷ lệ để hai vùng bấm không chồng nhau khi tên dài; đã tái hiện overlap khoảng3px ở width360 rồi xử lý, đo cuối không còn overlap.

`form-navigation.mjs` chỉ cuộn scroller form và bổ sung scroll room khi visualViewport che field; không đọc password, không đổi validation hay mutation. Resize/scroll/observer được giải phóng khi rời P10/logout; helper không ảnh hưởng footer khóa hoặc màn khác. Không gọi API, camera, NFC, upload hay gửi dữ liệu thật.

## Visual trước–sau

Các cặp dưới cùng viewport, DPR1, zoom1, font Arial, fixture Minh Anh và trạng thái không sửa. Không kéo méo ảnh hoặc tự đặt ngưỡng pixel để nghiệm thu.

| Màn | Trước | Sau |
|---|---|---|
| Cá nhân494×1000 | [before](evidence/revision-05/before/profile-494.png) | [after](evidence/revision-05/after/profile-494.png) |
| Hồ sơ494×1000 | [before](evidence/revision-05/before/editor-494.png) | [after](evidence/revision-05/after/editor-494.png) |
| Cá nhân360×1000 | [before](evidence/revision-05/before/profile-360.png) | [after](evidence/revision-05/after/profile-360.png) |
| Hồ sơ360×1000 | [before](evidence/revision-05/before/editor-360.png) | [after](evidence/revision-05/after/editor-360.png) |

Trạng thái bổ sung: [reader tên dài](evidence/revision-05/after/name-reader.png), [tên dài360](evidence/revision-05/after/long-name-360.png). Bố cục/component và hành vi đã kiểm; **visual actual vẫn chờ người dùng review**, không tuyên bố pixel-perfect. Không có baseline Designer riêng cho hit area/keyboard/hint mới; chúng là adaptation trong yêu cầu nâng cấp.

## Kiểm chứng thực tế

- `node scripts/check_profile_ergonomics.cjs`: **8/8 nhóm PASS** — hai shortcut, long-name reader, keyboard/IME/không implicit save, autofill và capability, sáu viewport và vùng chạm, click sát mép, footer/lifecycle, hành trình liên tục.
- `$env:PROFILE_EVIDENCE_DIR='handoff/P10/evidence/revision-05/regression'; node scripts/check_profile.cjs`: **12/12 nhóm PASS**,24 trường hợp layout; có P11 và P14 hiện đã mount, logout khác end shift và phiếu dở giữ nguyên.
- `$env:PROFILE_STABILITY_EVIDENCE_DIR='handoff/P10/evidence/revision-05/stability'; node scripts/check_profile_stability.cjs`: **8/8 nhóm PASS**. Ca external-hash/dialog đổi trigger từ Shift sang Thông tin bảo mật vì P14 nay là module thật; không hạ tiêu chuẩn modal/URL. Lần đầu dùng trigger cũ thất bại do không còn pending dialog, không phải lỗi navigation mới.
- `node --test tests/profile.test.mjs tests/dialog-route.test.mjs tests/home.test.mjs tests/auth-session.test.mjs`: **30/30 PASS**; [log](evidence/revision-05/node-tests.txt).
- Tổng **28 nhóm browser**,30 test logic. Viewport494×1000,360×800,430×932,1440×900,340×420,1869×940; khung494×950 giữ, field đang focus thấy được, footer nằm trong app, không tràn ngang. [Metrics](evidence/revision-05/after/metrics.json), [hit overlap](evidence/revision-05/after/hit-overlap-review.json).
- Hành trình: đăng nhập/xác nhận→Home→Nhập kho→Home→Tra cứu/chi tiết/Back→Lịch sử→Cá nhân/chỉnh/bỏ hoặc tiếp tục→logout→Back. Không tạo phiếu thật để kiểm UI.

Chỉ đã chạy Chromium desktop/viewport emulation; **bàn phím và cảm ứng thiết bị thật NOT_RUN**. Không gọi việc đặt inputmode là bằng chứng bàn phímOS đã được kiểm. Không chạy full repo hoặc ghi kết quả r03/r04 thành test mới.

## File và giới hạn

Mới: `shared/scaled-controls.mjs`, `.css`, `shared/form-navigation.mjs`, `scripts/check_profile_ergonomics.cjs`.
Sửa: `profile/profile.mjs`, `profile/style.css`, `profile/profile-model.mjs` (capability preview + revision), `auth-session/index.html` (CSS), `scripts/check_profile_stability.cjs` (trigger hiện hành). Các helper mới chỉ P10 opt-in; không tự đổi các nút quét/bộ lọc hoặc footer của owner khác.

**Behavior:** PASS trong các ca nêu trên. **Integration:** backend profile/upload/per-capability vẫn BLOCKED. P11/P14 UI đã tồn tại do phần việc khác; chỉ kiểm điểm nối, không nhận quyền sửa nghiệp vụ của chúng. Không mở thêm panel, không sửa dist/gallery/baseline, không push/merge/deploy. Global RUN_STATE của prompt đang chạy được bảo toàn; thêm record P10 riêng.
