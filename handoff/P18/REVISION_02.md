# P18 r02 — sáu nâng cấp UX

Theo yêu cầu **“Áp dụng đề xuất cho tôi”**, đã triển khai cả6 đề xuất. Visual chờ user review; behavior PASS prototype; integration production vẫn BLOCKED. Giữ4panel P18,24prompt/91panel, khung494×950, footerLOCK, dialog và reader chung. Không ghi case/location/tồn, không thay điều kiện gửi hoặc quyền backend.

HEAD `da9f623a19d0359c3e80c14f8cc612636ec6ab78`; target `docs/flows` ở workspace hiện tại. [Nguồn trước sửa](REVISION_02_SOURCE_MAP.md), [review trước–sau](REVIEW_02.html), [evidence](evidence/revision-02), [patch dependency](evidence/revision-02/source-changes.patch).

## Kết quả theo đề xuất

1. **Form bàn giao lên trước:** summary giữ case/status/sản phẩm/serial; checklist, người nhận, ngày, ghi chú ở ngay dưới. Mặc định đọc được đủ các trường nhập tại494×950. Kỹ thuật/ngày tiếp nhận/linh kiện chuyển vào nhóm mở rộng, giữ nguyên nguồn P09 và POSTED ledger; nhãn rõ số **dòng linh kiện**. Trạng thái mở/đóng được nhớ theo case.
2. **Hướng dẫn theo điều kiện:** footer nêu trạng thái hồ sơ/khả năng hiện tại ngay từ đầu, cập nhật trường còn thiếu theo input mà không render lại form hay mất caret. “Đến mục cần bổ sung” đưa focus đúng trường; validation aria-invalid theo trường đã chạm. Hồ sơ Đang kiểm tra có CTA **Về hồ sơ cập nhật xử lý** đúng ID; Chờ bàn giao có nút xác nhận disabled và lý do chưa khả dụng. Điền đủ/tick checkbox không tự cấp quyền đóng case. Hồ sơ đã trả khách chỉ đọc.
3. **Tệp dễ thao tác:** tóm tắt số sẵn sàng/đang tải/cần xử lý; mở tệp bằng tên hoặc thumbnail; Tải xuống/Thử lại/Dừng tải lên có nhãn và target44px. Event chỉ thay đúng hàng theo ID, giữ nguyên DOM và thứ tự các hàng khác. UNKNOWN không có retry. Bộ mẫu B18 vẫn tách khỏi các attachment nguồn P12.
4. **Viewer đọc chi tiết:** zoom50–250%, nút tăng/giảm, double click và double tap; Vừa trang/Vừa chiều rộng. Chỉ nội dung PDF/ảnh thay kích thước; khung app/header/toolbar/footer không scale riêng. PDF render lại từ byte thật để giữ độ rõ. Nhớ trang/chế độ/mức phóng/pan riêng theo file + document + nguồn fixture/owner trong phiên. Tệp khác không dùng nhầm trạng thái. Download vẫn nguyên byte nguồn. Render có số thứ tự để kết quả cũ không ghi đè khi đổi trang/zoom.
5. **Vị trí dễ đọc:** ô có nhãn Còn chỗ/Đầy/Trống, dấu✓ và aria-pressed; phần thông tin ô đặt ngay dưới grid trong cùng card. Thiếu schema thì ưu tiên vị trí đã có trong nguồn P06, không suy capacity. Thông tin pallet/khay/kho vẫn có đường đọc trong nhóm mở rộng. CTA **Về tra cứu** mở đúng item; không còn nút xác nhận có vẻ khả dụng rồi mới báo chưa hỗ trợ.
6. **Back và bảo vệ bản nhập:** giữ scroll/focus đúng file và caller P12/P09/P06; xử lý cặp popstate/hashchange để lần render thứ hai không mất focus. Giữ form theo case trong phiên, không ghi localStorage. Đăng xuất chủ động cảnh báo mất bản nhập. P10 và P14 ghép cảnh báo vào dialog đăng xuất sẵn có, không thêm dialog xác nhận thứ hai; Hủy/Back giữ dữ liệu. Kết thúc ca không xóa bản nhập; hết phiên vẫn theo P15, không bị guard giữ lại phiên không hợp lệ.

## Kiểm chứng thực chạy

| Kiểm tra | Kết quả / evidence |
|---|---|
| Logic P18 + owner liên quan | **82/82 PASS**, `node --test tests/attachments.test.mjs tests/attachment-experience.test.mjs tests/documents.test.mjs tests/warranty.test.mjs tests/lookup.test.mjs tests/home.test.mjs tests/profile.test.mjs tests/recovery-shift.test.mjs`; [log](evidence/revision-02/node-tests.txt) |
| UX và acceptance P18 | **11 nhóm PASS**, `node scripts/check_p18.cjs` chạy suite hiện hành `check_p18_ux.cjs`; [kết quả](evidence/revision-02/ux-results.json) |
| Nội dung dài và callback muộn | **4 nhóm PASS**, `node scripts/check_p18_edges.cjs`; Unicode/newline/2000+, reader/Back/backdrop/focus, note200, late PDF response, image viewer; [kết quả](evidence/revision-02/edges/results.json) |
| Đăng xuất / kết thúc ca / hết phiên | **3 nhóm PASS**, `node scripts/check_p18_logout.cjs`; [kết quả](evidence/revision-02/logout/results.json) |
| Hồi quy tab P12 | **9 nhóm PASS**, `DOCUMENTS_TABS_EVIDENCE_DIR=handoff/P18/evidence/revision-02/p12-tabs node scripts/check_documents_tabs.cjs`; [kết quả](evidence/revision-02/p12-tabs/tabs-results.json) |
| Footer Home/P03 | **4 viewport PASS**, `HOME_FOOTER_EVIDENCE_DIR=handoff/P18/evidence/revision-02/footer node scripts/check_home_footer_locked.cjs`; [kết quả](evidence/revision-02/footer/results.json) |
| Layout và capture | **20 tổ hợp PASS** (4panel×5viewport), `node scripts/capture_p18_revision.cjs`; [metrics](evidence/revision-02/layout-results.json) |

Syntax các module sửa và `git diff --check` đạt; diff Git chỉ bao phủ tracked, patch snapshot bổ sung cho source untracked. Không có package build/lint được tự suy đoán. Không có pageerror trong các suite hoàn tất. Test r01 được lưu trước khi entry runner chuyển sang suite r02; assertions CTA/dialog cũ đã được thay bằng hành vi user vừa yêu cầu, không bỏ các guard A01–A05.

Before/after chụp cùng Chromium headless, Arial, DPR1/zoom1, reduced motion, timezone Asia/Ho_Chi_Minh;494×950,360×800,430×932,1440×900,340×420. Chờ font/image decode. Đã xem actual bốn panel, fit/zoom PDF, nhóm chi tiết mở và viewport thấp. Vùng document ở mức phóng lớn chủ ý có cuộn ngang/dọc riêng; phần app không tràn ngang. Không đặt ngưỡng pixel-diff hay tự coi hình thức đạt từ các assertion geometry.

Trong kiểm tra đã sửa repaint thừa lúc observer viewer khởi tạo và lỗi focus do navigation phát hai event. Một số lượt đầu của harness dùng selector trùng với nút nền hoặc bấm nav đang ẩn; đã sửa selector/đường đi và chạy lại. Các failure.json là diagnostic lịch sử; results.json của suite hoàn tất là kết quả cuối.

## File và phạm vi

- `attachments/experience.mjs` mới: helper presentation cho summary/guidance/fit/dirty draft; không có API ghi.
- `attachments/view.mjs`, `style.css`: bố cục, controls, viewer lifecycle, lưu context theo ID, event chỉ cập nhật hàng liên quan. Giữ `model.mjs`, `fixture-adapter.mjs`, PDF fixture và vendor hiện có.
- `home/home.mjs`: nối callback mở đúng case/item, restore caller, cảnh báo đăng xuất fixture. `profile/profile.mjs` và `recovery-shift/view.mjs` thêm callback nội dung cảnh báo **optional**, mặc định rỗng; không đổi contract logout/end-shift/auth hoặc các revision hình thức P10/P14 đã có.
- Test/capture/report/review/state/coverage theo r02. Source snapshot và checksum tại [manifest](evidence/revision-02/manifest.json). Không reset công việc khác, không push/merge/deploy.

## Giới hạn còn lại

- Visual r02 là adaptation theo đề xuất user cho phép, **chưa nghiệm thu hình thức**. Card tệp có thể cao hơn vì nhãn action/target44px; nội dung vẫn cuộn trong app. Các nhóm kỹ thuật/lưu trữ được thu gọn, không bỏ dữ liệu/panel.
- Upload thật, quyền/receipt/đối chiếu, bàn giao/đóng hồ sơ và schema/mutation vị trí vẫn thiếu nguồn/policy; integration **BLOCKED**. Không dùng fixture20 hoặc file progress75% làm dữ liệu production.
- Double tap đã kiểm bằng pointer event mô phỏng, chưa kiểm cảm ứng/camera/NFC/screen reader trên thiết bị thật. Browser hard reload/đóng tab vẫn reset preview; giữ bản nhập chỉ trong instance phiên hiện tại. Hết phiên hoặc các luồng bảo mật bắt buộc không bị cảnh báo mất nháp ngăn cản.
- P17 vẫn tạm chốt; P16 giữ trạng thái review trước đó; P19–P24 chưa được triển khai trong revision này.

[Mở ứng dụng](http://localhost:8766/flows/auth-session/) · `minhanh / preview`. Bộ P18 bên ngoài app mở các fixture. Xem [review r02](REVIEW_02.html) để đối chiếu từng panel trước–sau và các nhánh mở rộng/zoom.
