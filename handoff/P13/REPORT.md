# P13 — r01: Thông báo / Theo dõi phiếu chờ Web

**Cập nhật user2026-09-29:** tạm chốt P13-r06, sẽ bổ sung state sau. Các nhận xét chờ review dưới đây là lịch sử từng revision; integration production không thay đổi.

**Revision mới nhất:** [r07 — audit UI/UX](REVISION_07.md). [r06 — nội dung trước, metadata sau](REVISION_06.md) giữ mốc tạm chốt. [r05 — menu và layout chi tiết](REVISION_05.md) được giữ. [r04 — badge và số lượng lớn](REVISION_04.md) được giữ. [r03 — tải thêm10 thông báo](REVISION_03.md) được giữ. [r02 — viền/lề](REVISION_02.md) được giữ. Nội dung bên dưới lưu kết quả r01.

Đã triển khai đủ bốn panel trong prototype; hành vi được kiểm tra bằng fixture. **Visual chờ user review; integration production BLOCKED.** P12 r05 được user tạm chốt trong lượt này, các state đồng bộ có thể bổ sung sau.

## Nguồn và phạm vi

- Source HEAD `da9f623a19d0359c3e80c14f8cc612636ec6ab78`; target `docs/flows` HTML/CSS/JS, working copy có P01–P12 chưa commit và thay đổi từ chat khác. Giữ các thay đổi đó. Không sửa dist/gallery/baseline, không push/merge/deploy.
- B13 đính kèm khớp SHA256 với Git blob: `34490e3317a14b17e9ad43772796325745bd278f7402fb68e4282f917f144f69`. Board chưa materialize trên working tree nên đọc Git blob để lưu bản đối chiếu, không đổi source. [Xác minh](evidence/revision-01/baseline-verification.json), [baseline](evidence/revision-01/baseline-B13.png), [số đo trước code](MEASUREMENTS.md).
- Nghiệp vụ: HANDOFF Quy tắc UI/Tài liệu cũ; Contract v2.0 và UI_STANDARD khóa footer, action feedback, readable content. DEV_PROPOSAL không nâng thành contract backend.

## Coverage

| Panel | Triển khai | Disposition | Visual / Behavior / Integration |
|---|---|---|---|
| P13.S01 | Chuông Home; danh sách, Chưa đọc/Tất cả, dấu chưa đọc, thời gian, mô tả/status và đường theo dõi Web | LEGACY_ADAPTED | IN_PROGRESS / PASS fixture / BLOCKED |
| P13.S02 | Chi tiết event, metadata, mô tả đủ/reader, CTA theo đúng document ID | LEGACY_ADAPTED | IN_PROGRESS / PASS fixture / BLOCKED |
| P13.S03 | List phiếu chờ Web, bộ lọc nhập/xuất và banner chỉ đọc | MIGRATED | IN_PROGRESS / PASS fixture / BLOCKED |
| P13.S04 | PN-0005: 11 sản phẩm, 3 SKU 5/4/2; kho/ghi chú/trạng thái, Xem chứng từ và hướng dẫn Web | MIGRATED | IN_PROGRESS / PASS fixture / BLOCKED |

[Ảnh tổng quan](evidence/revision-01/P13-overview.png) · [S01](evidence/revision-01/P13-S01.png) · [S02](evidence/revision-01/P13-S02.png) · [S03](evidence/revision-01/P13-S03.png) · [S04](evidence/revision-01/P13-S04.png).

Giữ cấu trúc card/list/detail B13. S03/S04 thay vùng approval theo HANDOFF, là candidate chưa LOCKED. Không sao chép status bar/khung máy raster. Dùng nền/shell, icon pastel, footer chung hiện có. Ghi chú 2 dòng, narrative 3 dòng, có Xem đầy đủ khi đo thấy bị rút gọn. Header/footer ổn định, nội dung dài cuộn trong app. S04 cuộn để xem đủ các SKU/ghi chú; không cắt dữ liệu để ép vừa viewport.

## Điều chỉnh dữ liệu có nguồn

- B13 minh họa 5 thông báo cùng tab Chưa đọc(3); r01 lọc đúng: Chưa đọc có3, Tất cả có5. Count lấy cùng nguồn events preview, không badge hằng số độc lập.
- PN-0005 dùng document ID `fixture-inbound-0005`, thời gian tạo **08:32** từ P12; thông báo **09:20** là thời điểm event riêng. S03 có **5 phiếu chờ (3 nhập/2 xuất)** từ P12, không thêm PX-0005 giả chỉ để khớp ảnh.
- Copy “cần duyệt/đã duyệt” của ví dụ được chuyển theo HANDOFF; thông báo NFC là event thiết kế quá khứ, không chứng nhận phần cứng hiện tại. Năm events lưu bộ nhớ riêng từng auth session. Reload khôi phục nguồn ban đầu.
- Không gọi notifications service thật, approve/reject/Post hay URL Web tự suy. Không thay tồn, không tạo phiếu, không ghi đè draft/version.

## Nghiệm thu

| Case | Kết quả trong prototype |
|---|---|
| A01 | PASS: đủ4 ID, S03/S04 MIGRATED có trace HANDOFF |
| A02 | PASS: không có control/handler/endpoint approve/reject/Post trong module; điều hướng chỉ đọc |
| A03 | PASS: ID chính xác tới P12, scope phiên/actor/kho fixture; missing ID không có CTA |
| A04 | PASS: thiếu URL vẫn có hướng dẫn; không bịa link |
| A05 | PASS: lỗi mark-read không mất event/count/filter; read chỉ cập nhật sau receipt; request lặp được gộp, receipt muộn khác phiên bị bỏ |

- `node --test tests/notifications.test.mjs tests/documents.test.mjs tests/home.test.mjs tests/dialog-route.test.mjs`: **36/36 PASS**, gồm10 ca P13. [Log](evidence/revision-01/node-tests.txt).
- `node scripts/check_notifications.cjs`: **14/14 nhóm PASS**, gồm24 capture layout (4 panel ×6 viewport), dialog lỗi/hướng dẫn, lỗi tải/rỗng/loading, Unicode/newline/từ liền dài250+/2000+, scope ID, Back/scroll/focus/Tab, logout, badge về0, receipt về muộn sau Back đồng bộ list/count, footer Home/P03/P13 cùng chuẩn. [Kết quả](evidence/revision-01/browser-results.json).
- `$env:DOCUMENTS_TABS_EVIDENCE_DIR='handoff/P13/evidence/revision-01/p12-regression'; node scripts/check_documents_tabs.cjs`: **9/9 nhóm PASS**, ghi evidence riêng không đè revision P12. [Kết quả](evidence/revision-01/p12-regression/tabs-results.json).
- Chromium headless, DPR1, CSS viewport494×950,360×800,430×932,1440×900,340×420,1869×940; Arial hệ thống, scale shell đồng nhất, không zoom riêng thành phần. P13 timezone Asia/Ho_Chi_Minh. Không pageerror ở các suite browser.
- Lần kiểm tra đầu phát hiện mount reader trùng với AppShell: đã bỏ controller phụ, tái dùng markers và kiểm lại PASS. Một assertion Home KPI bị thay đổi đồng thời ở chat khác; chạy lại file hiện tại PASS, không sửa/reset công việc đó. Source scan test ban đầu trùng tên hàm `notification()` với constructor browser; đã sửa biểu thức để kiểm đúng constructor.

Không có package.json/build pipeline ứng dụng trong target; chạy syntax/Node/browser trực tiếp. Không chạy suite toàn repo, hardware hay WMS; kết quả trên không phải chứng nhận production.

## File và bàn giao

Mới: `docs/flows/notifications/{notification-model.mjs,notifications.mjs,style.css,README.md}`, `tests/notifications.test.mjs`, `scripts/check_notifications.cjs`, `handoff/P13/*`. Sửa dependency trực tiếp: `home/home.mjs` mount/lifecycle/route/unread store; `auth-session/index.html` stylesheet. Không sửa component shared hoặc source P12 cho P13. Cập nhật `SCREEN_COVERAGE.csv`/`RUN_STATE.json` và ghi quyết định tạm chốt P12 tại metadata chung.

Production còn thiếu nguồn events/list, contract mark-read và quyền đọc đối tượng thực, URL Web được vận hành cấp. Phần đề xuất ở [README module](../../docs/flows/notifications/README.md). P24 chưa triển khai; P13 chỉ tái dùng WAITING_WEB đã có. Bước tiếp theo: user review hình thức P13 r01; nối adapter khi có contract được duyệt.
