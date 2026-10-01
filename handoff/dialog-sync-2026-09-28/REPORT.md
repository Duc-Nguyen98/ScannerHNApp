# Đồng bộ P01–P10 theo P11 r03 / HN-action-feedback-v1

Ngày 28/09/2026. User yêu cầu kiểm tra và áp dụng chuẩn dialog, nền khóa, focus/Back/Escape và bố cục không cuộn dư từ P11 r03 về P01–P10.

**Đã triển khai và kiểm chứng trong prototype.** Giữ 35 panel P01–P10 và danh mục91 panel toàn bộ; không đổi baseline, artwork gốc, data/API contract, nghiệp vụ ghi kho hoặc trạng thái nghiệm thu production. Visual mới chờ user review. Source gốc `da9f623a19d0359c3e80c14f8cc612636ec6ab78`; repo `C:/Users/TAN MIE/Downloads/app_Scanner/ScannerHNApp`.

## Mapping và kết quả

| Phạm vi | Đồng bộ chính | Bố cục / phần giữ nguyên |
|---|---|---|
| P01.S01–S02 | Login/recovery/guard/UNKNOWN dùng dialog; logout xác nhận Hủy/Đăng xuất; required ở field | Cùng tọa độ494×950, co đồng nhất; hero/footer ổn định, card cuộn khi dài; giữ artwork và nội dung nền. UNKNOWN Để sau/Đối chiếu chỉ mở hướng dẫn thiếu nguồn, không gửi lại start |
| P02.S01 | Dialog tên đầy đủ chuyển từ browser top-layer vào app; đích chưa nối dùng dialog trên màn hiện tại | Thêm vùng cuộn nội bộ Home để wheel không cuộn cả trang/đẩy nav; danh tính, KPI, tác vụ không đổi |
| P03.S01–S04 | Giữ4 panel dialog nghiệp vụ; lỗi/UNKNOWN cập nhật mô tả của dialog hiện hữu, không thêm banner/lớp mới. Kết quả lưu/bỏ fixture có Đã hiểu sau khi đóng route dialog cũ | S04 xác nhận bỏ phiếu khóa header/nav nền và focus trong dialog. S01–S03 là panel nghiệp vụ có hành động/điều hướng đã chốt, không biến thành popup chung hoặc gỡ guard kho dừng |
| P04.S01–S04 | Tổng quát/failure/UNKNOWN/dependency → dialog; giữ validation mã và phiếu tại vị trí thích hợp | S04 đã vừa khung; S04 full result không thêm popup thành công trùng; gửi Web chưa đổi tồn |
| P05.S01–S04 | Đổi phiếu Hủy/Đổi phiếu, không đổi dữ liệu trước confirm; failure/UNKNOWN/dependency → dialog | S04 bỏ7px cuộn dư bằng giảm whitespace11px; nội dung dài còn cuộn; giữ P17.S02 |
| P06.S01–S04 | Filter chưa hỗ trợ, thao tác thiếu điều kiện, đích chưa nối → dialog; hint chế độ chọn NFC vẫn tại màn | S03 bỏ12px cuộn dư; lookup chỉ đọc; query/category/scroll/serial/date validation giữ nguyên |
| P07.S01–S04 | Lỗi/khóa/xung đột/UNKNOWN/copy → dialog; chi tiết có Back riêng; copy thay rồi phục hồi chi tiết, không chồng overlay | S02 bỏ29px cuộn dư quanh artwork; giữ phone/waves/keyframes/reduced-motion r10. S04 vẫn full result và receipt |
| P08.S01–S04 +6 trang dùng chung | Copy/ngày cũ → dialog; filter/sort Back đóng trước, Hủy/Reset không commit; callback clipboard muộn không mở sai trang | Giữ query/scroll/date90 ngày VN, danh sách/chi tiết dài cuộn; loading/empty/source-error vẫn là data state |
| P09.S01–S04 | Intake xác nhận đủ dữ liệu rồi success đã xác minh; lỗi update đóng form trước dialog, giữ nháp; UNKNOWN Để sau/Đối chiếu | Giữ8 hồ sơ/5 phiếu/8 linh kiện, hồ sơ đã trả chỉ đọc, S04 result riêng. Kết quả ngắn vừa khung; dài vẫn cuộn |
| P10.S01–S04 | Menu/quyền/profile/ca/logout giữ nghiệp vụ; dialog dùng component/style chung; backdrop không đóng | Giữ các chỉnh sửa r03 của chat khác, dirty draft, focus/Back, nút logout đỏ; trạng thái chưa lưu có slot cố định, không phải toast kết quả |

Field validation, hint tĩnh, dữ liệu loading/empty/readonly/pending và panel kết quả có ID không bị chuyển thành dialog dư thừa. Không mở popup cho mỗi mã quét đã nhận; counters/ledger là thông tin bền. Không báo thành công trước receipt/đối chiếu.

## Component và contract

- `shared/action-dialog.mjs`/`.css`: giao diện dùng chung, alias action cho caller, semantic tone, overlay trong app. Mở rộng stylesheet sang P01 `#app`, giữ kiểu của Home `#home-app`.
- `shared/action-feedback.mjs`: queue một thông báo sau rich form/dialog, bắt native Back trước router, callback chạy sau khi history marker đóng. Epoch + clear/dispose hủy cả onConfirm/onClose cũ; không chạy hành động từ phiên/màn đã rời.
- `choice-dialog.mjs`: backdrop mặc định không đóng; các form/picker giữ Apply-only hoặc lựa chọn tức thì đã được duyệt riêng.
- Chuẩn đã ghi vào `AGENTS.md`, `shared/UI_STANDARD.md`, `handoff/CONTRACT_CONTEXT.md`. User đã cho phép áp dụng các màn cũ trong P01–P10; không tự đổi nghiệp vụ hoặc thêm prompt/panel.

## Kiểm chứng và bằng chứng

| Bộ kiểm | Kết quả | Bằng chứng |
|---|---|---|
| Snapshot Node workspace | **250/250 PASS** | [node-tests-workspace.txt](node-tests-workspace.txt) |
| P01/P02/P03/P10 audit | **17 nhóm PASS**,66 panel×viewport captures, wheel ổn định | [root/verified-02/results.json](root/verified-02/results.json) |
| P04/P05 | **23 nhóm PASS**,66 lượt đo layout;53 targeted Node | [Báo cáo](p04-p05/REPORT.md) |
| P06/P07 | **42 nhóm PASS**,48 panel×viewport +12 dialog;33 targeted Node | [Báo cáo](p06-p07/REPORT.md) |
| P08/P09 | **46 nhóm PASS**,61 lượt đo;50 targeted Node | [Báo cáo](p08-p09/REPORT.md) |
| P10 hồi quy | **12 nhóm PASS** | [profile-regression/browser-results.json](profile-regression/browser-results.json) |
| Shared controller lifecycle | **7 ca browser PASS** | [shared-feedback-lifecycle.json](p04-p05/shared-feedback-lifecycle.json) |
| P11 hồi quy đường nối P01 | **11 nhóm PASS** | [security-regression/results.json](security-regression/results.json) |
| P11 layout/dialog | **7 nhóm PASS** | [security-layout-regression/results.json](security-layout-regression/results.json) |

Tổng **140 nhóm browser P01–P10**, thêm7 ca lifecycle chung và18 nhóm hồi quy P11. Không cộng targeted Node lần nữa vào250 vì có giao nhau. Node PASS là snapshot tại thời điểm log, không nghiệm thu toàn bộ source của chat khác đang sửa đồng thời.

- Câu lệnh chính: `node --test` với danh sách file `rg --files tests -g '*.test.mjs' -g '*.test.cjs'`; các suite browser có command/env trong báo cáo nhóm.
- Root: `$env:SYNC_ROOT_EVIDENCE_DIR='handoff/dialog-sync-2026-09-28/root/verified-02'; node scripts/check_dialog_sync_root.cjs`. Kết quả6 viewport gồm494×1000,360×800,430×932,1440×900,340×420,1869×940. Nhóm P04/P05 dùng ma trận riêng gồm340×420,390×844,494×1000,768×1024,1440×1000,1869×940; tất cả giữ app494×950.
- P10: `PROFILE_EVIDENCE_DIR=.../profile-regression node scripts/check_profile.cjs`; P11: `SECURITY_LIVE_EVIDENCE_DIR=.../security-regression node scripts/check_security_live_preview.cjs`, `SECURITY_LAYOUT_EVIDENCE_DIR=.../security-layout-regression node scripts/check_security_dialog_layout.cjs`. Các env được đặt bằng `$env:` trên PowerShell.
- Kiểm Hủy, Enter/Tab, backdrop, Back/Escape, focus trở về, duplicate submit, UNKNOWN ID/session/version, context reentry, callback muộn và long-content; lỗi form tại field không mất. Không pageerror trong các lượt cuối của các suite nêu trên.

## Diễn biến và giới hạn

- Đã trực tiếp xem actual login P01, xác nhận logout P10, và ảnh đại diện các nhóm P04–P09. Font Designer/pixel match chưa xác minh; không đặt ngưỡng pixel-diff tự nghiệm thu.
- Lượt đầu root cần chờ2 animation frame sau resize; lỗi wheel trên Home là thật và đã sửa bằng scroller nội bộ. Lượt P03 đầu phát hiện thông báo kết quả mở quá sớm trước khi history cũ đóng; đã sửa thứ tự. Giữ logs/failure ở thư mục các lượt trước, kết quả cuối là `verified-02`.
- Có nguồn P12 do chat khác thêm đồng thời. Không reset/ghi đè, không kiểm hoặc gán nghiệm thu P12. Test đích chưa nối của Home dùng P13 để tránh giả định P12 còn pending. Current prompt/checkpoint khác được bảo toàn; đợt này thêm audit record riêng.
- Một lần P01 bootstrap timeout trong suite P08/P09 khi nguồn đang được cập nhật; chạy lại đầy đủ đạt, giữ failure. Không khẳng định tình trạng tải máy chủ hết mọi lỗi từ một suite.
- **Đính chính nguồn evidence:** script stability P09 cũ có đường output hardcode, khiến5 ảnh và1 JSON r08 bị làm mới ngoài ý muốn. Đã sửa script, lưu bằng chứng hiện tại đúng thư mục audit và thêm ghi chú nổi bật vào báo cáo r08; không tìm được bản gốc để phục hồi, không tái tạo giả evidence lịch sử. Xem [manifest provenance](p08-p09/EVIDENCE_PROVENANCE.json).
- Backend/WMS/camera/NFC/clipboard hệ điều hành thật không được nghiệm thu từ fixture/mocks. Không thêm API/hardware/persistence, không push/merge/deploy hoặc sửa dist/gallery/baseline.

[Gallery kiểm tra](REVIEW.html) · [Ảnh tổng quan](dialog-sync-overview.png) · [Mapping35 panel](PANEL_REVIEW.csv).
