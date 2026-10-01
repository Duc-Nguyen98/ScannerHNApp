# P02 — Trang chủ LOCKED: bàn giao phần độc lập

## Hiện hành r15 — nâng cấp6 hạng mục UX

Đã áp dụng shortcut phiếu dở đúngowner/ID, tilefeedback, giữ inner-scrollHome, kiểm pipeline nhập mã liên tục, phục hồi filtered-empty và ngày Hôm nay/Hôm qua theoUTC+7. Home max3recent/footerLOCK giữ nguyên; códraft thì body cuộn để đọc đủ.346Node/11nhómUX/6nhómrecent/4viewportfooter PASS trong prototype. [Revision15 và evidence](REVISION_15_UX.md). Visual nhánh mới cần userreview, không backendPASS.

## Hiện hành r14 —3 chứng từ mới nhất, Xem tất cả mở P12

User2026-09-29 yêu cầu đổi đích Xem tất cả từ Lịch sử sang quản lýChứng từ. Đã lấy tối đa3 row mới nhất từ nguồn P12 dùng chung, mở đúng detailID, refresh khi quay lạiHome; Xem tất cả mở P12 đủ dữ liệu/mới nhất, tabLịch sử giữP22.28Node/6nhóm browser/4viewport footer PASS; visual/userreview vàbackend vẫn tách riêng. [Revision14 và before/after](REVISION_14_RECENT.md).

## Hiện hành r13 — vùng bấm/nền phản hồi phủ toàn ô KPI

Theo yêu cầu “áp dụng theo cả khung”, đưa padding dọc từ card chung vào từng ô: hai buttonKPI phủ toàn chiều cao96px bên trong card98px, không chỉ dải số/nhãn. Giữ căn nội dung, divider inset16px bằng pseudo-element không chặn click; góc ô đầu theo góc card. Hover/press/focus trên toàn ô, không gạch chân. Kiểm hit-test sát mép trên/dưới, click mép dưới cả2 KPI vẫn đến đúng danh sách; no text underline. [Checks](evidence/revision-13-full-tile/checks.json) · [Hover toàn ô](evidence/revision-13-full-tile/waiting-hover.png). Chỉ sửa CSS KPI/cache style; footer, handlers và giờ ca không đổi.

## Hiện hành r12 — KPI không gạch chân

KPI dùng feedback trên toàn ô: hover nền nhẹ, pressed nền rõ hơn, focus-visible riêng; không gạch chân, không làm nhảy bố cục. Giữ handler/filter và footerLOCK. [Revision12 và bằng chứng](REVISION_12_INTERACTION.md).

## Hiện hành r11 — nền trắng, căn đều nội dung

Home dùng nền trắng cùng tông footerLOCK (footer không thay đổi); gutter20px chung cho header/sections; KPI grid2 hàng để button/div thẳng hàng; nhóm chứng từ có divider/viền nhẹ.5 viewport layout,4 viewport footerLOCK và6 nhóm KPI regression PASS. [Revision11/ảnh/số đo](REVISION_11_LAYOUT.md). Chờ user review mẫu mới, không nâng integration.

## Hiện hành r10 — KPI điều hướng theo trạng thái

Hai KPI trở thành button mở P12 waiting (Chờ xử lý trên Web) và P09 open (tiếp nhận/kiểm tra/chờ bàn giao). Số đếm dùng chung nguồn danh sách:5 phiếu/4 hồ sơ fixture, không còn số1 minh họa. Back/chi tiết/Về danh sách giữ filter, mở module bình thường không bị presetKPI ghi đè.32 Node tests,6 nhóm browser và4viewport footerLOCK PASS. [Revision10](REVISION_10_KPI_ROUTES.md). Không thêm quyền duyệt/Post và không suy tổng backend từ fixture.

## Hiện hành r09 — đơn giản hai dòng phụ

Bỏ hướng dẫn “Chọn nghiệp vụ để bắt đầu →” vì dư và giống link giả. Giữ Xem tất cả dạng chữ gọn không mũi tên, vẫn mở hub Lịch sử. FooterLOCK/KPI/giờ ca không đổi. Click/Enter/Back/focus và2 viewport đã kiểm. [Revision09](REVISION_09_LINKS.md).

## Hiện hành r08 — phục hồi footer LOCK

Đã bỏ override footer r06 làm sai mẫu chốt, khôi phục đúng footer Home/P03 theo P03 revision04. KPI tăng padding, bỏ nhãn UTC+7 nhỏ ở mép; thời điểm ca r07 giữ nguyên.4 viewport kiểm cụ thể footerLOCK và parity Home/P03 PASS. [Revision08 và ảnh thực](REVISION_08_FOOTER_LOCK.md). Toàn mẫu Home chưa được user chấp nhận; không tự nâng visual tổng thể thành PASS.

## Cập nhật mới nhất r07 — Ca bắt đầu

Theo yêu cầu mới, thay clock chạy bằng **Ca bắt đầu HH:mm:ss UTC+7** lấy từ receipt xác nhận phiên P01, giữ cố định trong session. Không hardcode08:30, không lấy thời gian render; logout reset; UNKNOWN không tạo mốc. Bố cục/màu r06 giữ nguyên.36 tests và6 nhóm browser PASS. [Revision07](REVISION_07_SHIFT.md). Nội dung clock chạy r06 bên dưới là lịch sử đã được thay thế.

## Cập nhật hiện hành r06 — đồng hồ Việt Nam và cân màu layout

Theo yêu cầu mới:3 cột KPI cân đều; đồng hồ HH:mm:ss UTC+7, nhãn Giờ Việt Nam;4 task cùng nền trắng, nền Home/nav liền mạch, giữ icon nghiệp vụ chuẩn và một màu xanh CTA. Clock theo giờ thiết bị, không coi là dữ liệu WMS realtime.9 tests và6 nhóm browser/5 viewport PASS. [Revision06 và ảnh thực](REVISION_06_CLOCK.md). Đây là thay đổi visual được yêu cầu mới, cần review hình thức; baseline không đổi.

## Revision05 — lời chào dùng hai từ cuối

Theo đề xuất mới của người dùng, tên trên lời chào lấy tối đa hai từ cuối (phân cách khoảng trắng), giữ tên một/hai từ; không sửa actor.name gốc. Ví dụ Nguyễn Thị Hoàng Ngọc Minh Anh → Minh Anh. Title/accessible label/dialog tiếp tục hiển thị họ tên đầy đủ. CSS ellipsis vẫn bảo vệ trường hợp hai từ rất dài hoặc chuỗi liền; chip trạng thái và chiều cao header giữ nguyên revision04. Sửa fixture long cũ ghép chức danh thành họ tên thuần để tránh hiển thị nhầm “Hoa Nam”. Không tự tách chức danh từ dữ liệu thật bằng dấu gạch.

`node scripts/check_home_names.cjs`:15/15 ca ở3 viewport PASS; kiểm đúng tên rút gọn, full-name dialog nguyên văn, Enter/Escape/focus/click, header/KPI/scale ổn định, P04–P07 smoke và logout cleanup. `node --check`/`git diff --check` exit0. [Kết quả](evidence/revision-05-names/results.json) · [Tên dài đã rút gọn](evidence/revision-05-names/1869-long.png). Các kết quả regression33/14 bên dưới thuộc revision04, không chạy lại trong revision05. Không thay status visual/backend toàn board.

## Cập nhật hiện hành — tên người dùng

Đã xử lý tên ngắn/bình thường/dài theo yêu cầu ngày2026-09-27: một dòng, ellipsis theo không gian thực, giữ font/dữ liệu tên, click/Enter xem đầy đủ; chip trạng thái tách khỏi lời chào. 15 ca name/viewport +14 nhóm hồi quy Home +33 Node tests PASS. [Revision04 và ảnh thực](REVISION_04_NAMES.md). Giữ nguyên triển khai P03–P07 có trước; toàn visual/backend chưa tự nâng PASS.

## Cập nhật revision03 — công cụ ngoài app, preview trọn màn

Theo ảnh khoanh đỏ `C:/Users/TAN MIE/Desktop/2.png`, đưa công cụ prototype sang panel riêng bên phải khi viewport rộng từ1050px; viewport hẹp đặt sau toàn bộ khung app, có border/background riêng. Bỏ bottom nav fixed theo cửa sổ: nav thuộc cuối khung app, không đè công cụ/chứng từ. Giảm padding dưới danh sách110→15px, giữ reference494×950. Wrapper preview thu/phóng đồng đều toàn UI tương tác theo chiều rộng/chiều cao khả dụng (không sửa baseline, không thay đổi tỷ lệ riêng từng thành phần). Các quy tắc mobile reflow cũ được thay bằng fit preview; đây là chế độ trình xem thiết kế, chưa là responsive production. Nội dung dài được đo lại bằng ResizeObserver, cleanup khi logout.

33/33 Node tests và14 nhóm browser checks PASS;7 capture/state tại494×950,360×800,430×932,1440×900,1264×712,tên dài vàUNKNOWN. Mỗi capture kiểm full screen trong viewport, tools ngoài app và hàng cuối trên nav. [Actual desktop thấp](evidence/P02-S01-1264.png), [metrics gồm scale/geometry](evidence/render-metrics.json). Evidence revision02 giữ trong `evidence/revision-02/`; checksum B02 không đổi. Cache version `p02-r03` để preview tải đúng source. Visual exact B02 vẫn FAIL do khác tài nguyên/font/texture; backend BLOCKED; P01 chỉ đổi version import/link, không đổi giao diện/auth.

## Cập nhật revision02 — khôi phục ảnh và icon

Theo phản hồi “Trang chủ đang bị mất hình ảnh và icon”, đã bật SVG có sẵn trong repo và thêm ảnh `bg_warehouse_main_4k_enhanced.jpg` cho hero. Nguyên nhân: cờ tài nguyên false và chưa có CSS ảnh cho hero; không phải file ảnh bị xóa. Giữ nguyên P01. 14 nhóm browser checks chạy lại PASS, ảnh actual và comparison trong `evidence/` được cập nhật; bằng chứng trước sửa giữ trong `evidence/revision-01/`. Visual vẫn FAIL theo LOCKED vì ảnh/logo/font/texture chưa khớp tuyệt đối; integration vẫn BLOCKED. Các ghi chú “chưa bật/chờ xác nhận” phía dưới là lịch sử revision01, đã được thay thế bởi cập nhật này.

**P02.S01 đã có layout và hành vi prototype; visual FAIL, tài nguyên BLOCKED chờ xác nhận; behavior fixture PASS; integration production BLOCKED. Chưa hoàn thành toàn bộ B02.**

## Nguồn / target

Contract v2.0; P02/24; source commit `da9f623a19d0359c3e80c14f8cc612636ec6ab78`, workspace `C:/Users/TAN MIE/Downloads/app_Scanner/ScannerHNApp`; `target_kind=prototype`. [Nguồn, số đo trước code và quyết định](CONTEXT.md). Không source production/build manifest mới; không sửa `dist`, gallery, board hoặc push/merge/deploy.

Đã đọc P02, BOARD_INDEX, contract, HANDOFF và DEV_PROPOSAL. HANDOFF chốt Home Xem tất cả → Lịch sử. Proposal không dùng làm API/quyền được duyệt. Gallery chính đã chọn Tất cả và xác minh Trang chủ đã khóa; [bằng chứng](evidence/gallery-check.json). Baseline đính kèm/gốc giống byte, SHA256 `ed0d7b90fdb66778cab0ff53b9537785e55ec60227d7666e5d7693f42eb15ef8` trước/sau.

## Kết quả triển khai

- Layout một cột: brand/identity từ phiên, chip kho, KPI đè chuyển nền, grid2×2, scanner CTA, ba chứng từ và bottom nav5. Không status bar/home indicator giả. Chưa bật ảnh/logo/icon thay thế do chưa có xác nhận; những ô glyph trống là thiếu sót công khai, không phải thiết kế mới được nghiệm thu. Arial kế thừa môi trường P01 phục vụ đo scaffold, không coi là font Designer đã duyệt.
- P01 → P02 ngay trong document, giữ phiên in-memory; reload yêu cầu đăng nhập lại. Giữ nguyên auth controller/adapter/CSS/icon P01. Không lưu credential/session vào URL/history/storage. Không tạo ca thật.
- Xem tất cả và tab Lịch sử dùng hub prototype có sẵn `warranty-components/?mode=screen&scene=history-hub`. Không sửa source hub. Browser Back và nút Về Trang chủ giữ Home DOM, scroll/focus, selected tab. Iframe dùng source cũ, chưa phải integration API hay nghiệm thu P22.
- Route descriptors: Nhập→P04, Xuất→P05, quét/nhập mã→P06, NFC→P07, Bảo hành→P09, avatar/Cá nhân→P10, Chứng từ→P12, chuông→P13. Vì chưa có implementation đúng đích, hiện dependency trung thực, không màn thành công giả. Các dòng truyền `documentId=PN-0001`, `documentId=PX-0004`, `caseId=BH-001` trong namespace fixture.
- Guard cùng controller cho click/direct hash: cần P01 previewReady, kho active, permission `warehouseOperations === true`. Không dùng role label; không phát minh permission module. Guard production/backend vẫn UNKNOWN.
- Data adapter riêng: fixture1/4/08:30/badge3, không đếm từ3 dòng. UNKNOWN hiện rõ thay vì fallback số mock. Kịch bản tên dài/badge12345, nguồn UNKNOWN và logout nằm ngoài UI Home trong công cụ prototype.

## Nghiệm thu

| Ca | Kết quả | Giới hạn |
| --- | --- | --- |
| P02.A01 | FAIL visual; checksum PASS | thiếu hero/logo/icon; typography/texture chưa khớp; không tự đặt ngưỡng pixel |
| P02.A02 | PASS prototype | hub có sẵn mở đúng; native Back giữ scroll/focus/selected tab; backend chưa kiểm |
| P02.A03 | PASS navigation contract; integration BLOCKED | mọi lối vào map đúng P/ID; các module thiếu chỉ pending |
| P02.A04 | PASS fixture guard | direct route/handler bị chặn khi chưa đăng nhập/thiếu quyền/kho dừng/UNKNOWN/logout; backend module quyền chưa có |
| P02.A05 | PASS responsive fixture | tên dài/badge5 chữ số không tràn ngang; responsive tách reference |

[State acceptance](STATE_ACCEPTANCE.csv) · [33 tests Node](evidence/test-output.txt) · [14 nhóm kiểm tra browser](evidence/browser-results.json) · [Số đo render](evidence/render-metrics.json).

Lệnh thật: `node --test tests/auth-session.test.mjs tests/auth-session-visual-contract.test.mjs tests/home.test.mjs tests/warranty-component-history.test.cjs`:33 PASS/0 FAIL (27 có trước +6 mới). `node scripts/check_home.cjs`:14 nhóm PASS/6 viewport/state captures, không JS errors/request ra ngoài localhost. `node --check` các module Home/P01 touched và `git diff --check` exit0. Git cảnh báo LF/CRLF tại source history có trước; không sửa file đó. Không chạy build/lint/typecheck giả khi không có config app.

Lần browser đầu FAIL vì UNKNOWN KPI tràn360px; đã sửa specificity/ẩn glyph phụ khi metric UNKNOWN và chạy lại PASS. [Log lần lỗi](evidence/browser-failure.json) lưu lịch sử, không phải kết quả cuối. Keyboard focus/Enter và camera không tự mở đã kiểm qua browser; thiết bị mobile/bàn phím thật/NFC/camera thật NOT_RUN.

## Ảnh actual / đối chiếu

Reference **diagnostic estimated**, 494×950 CSS px, DPR1, zoom1, Chromium headless; Arial; fixture B02; no animation. Crop app B02 `(522,48)-(1016,998)` loại OS chrome, giữ toàn vùng app; chưa có viewport/DPR/font/ngưỡng pixel được Designer xác minh. Không sửa/resize/mask baseline.

- [Actual494](evidence/P02-S01-494.png) · [Baseline/actual cạnh nhau](evidence/comparison-S01.png) · [Checksum/crop](evidence/baseline-comparison.json).
- [360×800](evidence/P02-S01-360.png) · [430×932](evidence/P02-S01-430.png) · [desktop1440×900](evidence/P02-S01-1440.png).
- [Tên dài/badge](evidence/P02-long-name-360.png) · [UNKNOWN](evidence/P02-unknown-360.png) · [Hub đã nối](evidence/history-connected.png) · [Focus](evidence/keyboard-focus.png).

Actual494: KPI y183/h98; grid y338/h177; scanner y527/h82 (baseline estimated525); recent y661/h199 (baseline estimated658); nav y875/h75. Các số đo chỉ chứng minh vị trí tương đối, không chứng minh pixel-perfect. Có padding cuộn để hàng cuối luôn truy cập được phía trên nav trên viewport thấp.

## File / checkpoint

Mới: `docs/flows/home/{index.html,home.mjs,home-flow.mjs,fixture-adapter.mjs,style.css,icons.mjs,assets.mjs}`, `tests/home.test.mjs`, `scripts/check_home.cjs`, báo cáo/evidence P02. P01 sửa đúng entrypoint `app.mjs` và thêm stylesheet Home/cập nhật ghi chú công cụ tại `index.html`; không thay giao diện P01. Icon module chuẩn bị từ SVG có trong Git tree và source cũ, có dẫn license, nhưng chưa bật khi thiếu xác nhận.

Đã cập nhật root `SCREEN_COVERAGE.csv` (đủ91 panel) và `RUN_STATE.json`. Snapshot RUN_STATE trước P02 lưu tại [INPUT_RUN_STATE.json](INPUT_RUN_STATE.json). P01.S02 chỉ bổ sung bằng chứng dependency Home đã nối; không nâng visual/backend thành PASS. Người dùng tạm chốt P01; không tự bổ sung state P01.

## Ba nhóm còn cần chốt / nguồn

1. **Tài nguyên:** câu hỏi async đã gửi: có cho phép dùng tạm nền kho/font P01 và icon repo, ghi rõ sai khác không? Chưa có trả lời nên `TEMPORARY_ASSETS_APPROVED=false`. Đã xem background main: có lối đi/kệ kho nhưng chưa có bằng chứng crop/texture khớp B02; không coi thư mục approved là phê duyệt. Không dùng hình board làm UI. Khi được xác nhận mới bật và capture lại toàn bộ ảnh bị ảnh hưởng.
2. **Dữ liệu:** nhãn LOCKED “Phiếu chờ duyệt”/“Chờ duyệt” giữ nguyên theo P02; mapping backend/KPI/badge/ca UNKNOWN. Không suy ra App có quyền duyệt. Cần định nghĩa chỉ số và quyết định nhãn trước nối dữ liệu thật.
3. **Integration:** cần source/adapter/session/backend quyền thực và các module P04/P05/P06/P07/P09/P10/P12/P13. Chỉ giữ dependency, không tự triển khai các prompt khác. P22 reused fixture chưa được nghiệm thu riêng.

Mở `http://127.0.0.1:8766/flows/home/` → P01, nhập `minhanh`/`preview`, bấm Bắt đầu ca làm việc để vào Home. Server: `python scripts/serve_preview.py`.
