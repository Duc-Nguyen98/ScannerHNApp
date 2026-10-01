# P01 revision 02 — sửa sau xác nhận của người dùng

## Authority / phạm vi

Người dùng xác nhận “sửa trước theo mẫu giống 100%”, sau đề nghị sửa bố cục/khoảng cách/icon có nguồn và giữ chặn phần hero/logo chưa xác minh. “100%” là mục tiêu, KHÔNG phải kết quả nghiệm thu được mặc định. Không thay baseline, không sinh/tracing ảnh, không vẽ logo mới, không đổi auth hoặc tự mở P02–P24.

Nguồn phản hồi: `C:/Users/TAN MIE/Desktop/2.png` (khung xanh=baseline, đỏ=actual). B01 LOCKED vẫn là nguồn hình thức; ảnh khoanh không thay baseline. Source commit không đổi `da9f623a19d0359c3e80c14f8cc612636ec6ab78`.

## Số đo dùng khi sửa (OBSERVED_IMAGE / estimated, không phải CSS original)

Đối chiếu tại crop diagnostic438×834. S01 crop(211,114,438,834); S02(800,114,438,834). Không dựng khung máy/status bar trong UI.

| Vùng | Mốc B01 estimated trong crop | Thay đổi |
| --- | --- | --- |
| Card S02 | x≈11, y276, width≈416, bottom≈760 | margin11; padding22/20/21 |
| Identity | x31, avatar y298/70; line y383; chevron phía phải | avatar70; khoảng19; chevron-right thay arrow |
| Kho/status | tile x31/y400/48; text x93; badge x≈285/h28 | tile48; caption13; badge122; chấm9 |
| Ghi chú quyền | x31/y469/width376/h74 | padding16×15, gap13; text15/21 |
| Bắt đầu ca | x31/y563/width376/h70 | CirclePlay trong ô44; chevron-right; nhãn18 |
| Đăng xuất | x31/y681/width376/h58 | LogOut đúng nghĩa, bỏ arrow thay thế |
| Footer | brand y≈789; caption/rule quanh815 | khoảng28; 2 rule tối đa40, gap16 |
| Login | input1 y≈343; CTA y≈563; notice y≈653 | paddingtop30; fieldgap23; CTA margin23 |

## Phát hiện mới / sửa nhận định nguồn

Các lần trước bỏ qua dependency tree nên nhận định thiếu toàn bộ icon là chưa đầy đủ. Đã đọc đích danh source Lucide v1.31.0 có trong Git tree: `node_modules/lucide-react/dist/esm/icons/{chevron-right,circle-play,log-out,eye,user,shield-check,warehouse}.mjs` và LICENSE. Đã tái sử dụng đúng geometry, không tải thư viện/icon bên ngoài. Source được đóng gói nhỏ trong `sourced-icons.mjs` để prototype static chạy độc lập, license giữ đủ ISC/MIT. Màu/lớp nền và thứ tự node warehouse là trình bày CSS theo B01, không thay đường path.

Khi đối chiếu actual, Warehouse Lucide có góc/đỉnh bo không sát B01. Bản cuối tái sử dụng lại geometry `ICONS.warehouse` trong source prototype `flow.js`, tách compound path thành các subpath để tô mái/thân xanh và cửa trắng (không vẽ path mới). Các icon còn lại dùng Lucide như trên.

Không suy nguồn Lucide là bằng chứng raster B01 giống tuyệt đối. Original logo, texture avatar, ảnh hero chính xác và font gốc vẫn chưa được xác minh. Giữ nguyên chúng ở revision này theo giới hạn đã trình người dùng; không coi fallback cũ là đạt.

## Sửa cách báo cáo

- Sai khác đã nhìn thấy = visual FAIL, không che bằng BLOCKED. Integration thiếu source/API vẫn BLOCKED.
- 22 tests cũ chỉ chứng minh fixture behavior và regression, không chứng minh LOCKED visual PASS.
- Metrics cũ của S01/438 ghi screen.top=-140: capture cũ không cùng scroll crop; không dùng nó làm bằng chứng visual tương đương. Evidence revision02 phải ghi scrollY=0, screen.top=0 trước capture; không xóa/chỉnh ảnh cũ.
- Đổi loading text selector thành `.button-label` để không xóa CirclePlay mới; không đổi state machine/auth adapter.

## Kết quả đã kiểm tra

- **27/27 tests PASS**: 12 auth fixture +10 history regression +5 structural/icon/immutability. `node --check`2 module đã sửa exit0. Đây KHÔNG phải 27 ca pixel visual.
- Browser: mắt giữ9 ký tự gồm2 dấu cách cuối; sai mật khẩu ở login; login đi confirmation; CirclePlay còn nguyên khi loading; P02 pending không báo ca thật; logout/hash guard, thiếu quyền/kho dừng/UNKNOWN đều chặn như trước. [browser-checks.json](evidence/revision-02/browser-checks.json).
- Keyboard/Tab ở viewport thu nhỏ360×400 đến được CTA (top232.6/bottom298.6 trong400px), focus outline hiện. Chưa thử bàn phím thiết bị thật.
- Bốn viewport438×834,360×800,430×932,1440×900 ×2 panel không tràn ngang. Tại438: card S01 y285/h469; S02 y276/h483.8, notice y468.8/h74, CTA y562.8/h70. Các số này so với mốc estimated B01; chưa có CSS/DPR baseline gốc để xác nhận pixel-perfect.
- Screenshot final là JPEG nguyên bytes từ browser surface (`getScreenshot`), không ảnh sinh/chỉnh/resize. Tất cả capture final ghi scrollY=0/screenTop=0; viewport/scale/DPR trong [capture-manifest.json](evidence/revision-02/capture-manifest.json). Ảnh CDP trung gian có lỗi scale khi đổi viewport và2 file JPEG đuôi PNG được chuyển vào `diagnostic-rejected/`, KHÔNG dùng nghiệm thu; không xóa bằng chứng.
- Auth controller/fixture/history/ảnh baseline có checksum đúng trước sửa; không thay logic API, gallery hoặc dist. Không push/deploy.

## Ảnh cuối / phần chưa đạt

[S01 actual438](evidence/revision-02/P01-S01-438.jpg) · [S02 actual438](evidence/revision-02/P01-S02-438.jpg) · [S01 so sánh đầy đủ](evidence/revision-02/comparison-S01.png) · [S02 so sánh đầy đủ](evidence/revision-02/comparison-S02.png).

Visual toàn P01 vẫn **FAIL / chưa giống100%** vì hero/logo, font/texture và nét icon raster chưa trùng. Icon loại sai và nhiều sai lệch card đã sửa; không chuyển status sang PASS chỉ vì source đã có. Integration production vẫn BLOCKED, ngoài revision giao diện này. Hero/logo không bị tự thay sau khi người dùng yêu cầu phải có xác nhận.

File sửa: `app.mjs`, `style.css`, thêm `sourced-icons.mjs`, `ICONS-LICENSE.txt`, thêm5 structural tests; báo cáo/coverage/checkpoint/compare script. Không tạo dependency mới.
