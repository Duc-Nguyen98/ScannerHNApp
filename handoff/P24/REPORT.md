# P24 r01 — Trạng thái Scanner

30/09/2026 · Contract v2.0 · **4/4 panel đã triển khai trong prototype**. Hình thức **AWAITING_USER_REVIEW**, hành vi **PASS_PROTOTYPE**, tích hợp **BLOCKED_PRODUCTION**. P23 r03 được user tạm chốt; state đồng bộ bổ sung sau.

[Review trước–sau](REVIEW.html) · [Nguồn/quyết định/số đo](DESIGN_TRACE.md) · [Coverage 24 board](COVERAGE_SUMMARY.md) · [State acceptance](STATE_ACCEPTANCE.csv) · [Preview](http://localhost:8766/flows/auth-session/?v=p24-r01)

## Nguồn và phạm vi

- Repo Duc-Nguyen98/ScannerHNApp, HEAD/baseline `da9f623a19d0359c3e80c14f8cc612636ec6ab78`; workspace `C:/Users/TAN MIE/Downloads/app_Scanner/ScannerHNApp`. Working copy có công việc P01–P23 và các chat khác chưa commit; không reset hoặc thay các thay đổi đó.
- Target HTML/CSS/JS prototype `docs/flows/`; nguồn nghiệp vụ HANDOFF, hình thức B24 do user cung cấp + UI_STANDARD đã khóa. DEV_PROPOSAL không được áp làm API. [B24 nguyên bản](evidence/revision-01/baseline/B24.png), SHA256 `AD3CC5FDEDAC0A6351778787F9B87FA7AD8D1E416110F7BE1C23CB0118BD9717`.
- Giữ 494×950 CSS px, scale đồng nhất, cuộn trong nội dung, component icon/dialog/reader đã có. Không sửa ảnh baseline, dist/gallery, footer Home/P03; không push/merge/deploy.

## Bốn panel

| ID | Thực thi và bằng chứng |
|---|---|
| P24.S01 CURRENT | Sheet owner P19; input13 đỏ/tồn12; handler chặn 0/âm/thập phân/chữ/vượt tồn/tồn chưa xác minh, kiểm lại khi confirm/Post. Giữ accepted list và version khi bị từ chối. [Actual](evidence/revision-01/after/S01-494x950.png) |
| P24.S02 CURRENT | Panel lỗi trong owner P19, giữ reason/mã nguồn và danh sách hợp lệ; Quét mã khác/Nhập lại mã về cùng phiếu. Back đóng reader trước, rồi về nhập mã. Không tự tạo nhập kho hoặc sửa tồn. [Actual](evidence/revision-01/after/S02-494x950.png) |
| P24.S03 CURRENT | P04/P05 gọi component waiting-web chung chỉ sau record đã đối chiếu yêu cầu. Monitor pastel, badge amber, mã phiếu/kho/số mã/thời gian từ nguồn; Xem lịch sử và các action cũ còn truy cập được. P19 Post vẫn thành công riêng Đã xuất. [Nhập mặc định](evidence/revision-01/after/S03-inbound-494x950.png) · [Xuất mặc định](evidence/revision-01/after/S03-outbound-494x950.png) · [B24 PN-0005/12](evidence/revision-01/after/B24-S03-inbound.png) · [B24 PX-0004/10](evidence/revision-01/after/B24-S03-outbound.png) |
| P24.S04 CURRENT | P20/P09 dùng case đóng thật của nguồn preview: badge xanh, lịch sử POSTED, đọc mã đã xuất, tải thêm nếu còn trang, link hồ sơ và Về lịch sử bảo hành P23. Không có CTA xuất mới; action/route/resume/stale submit vẫn chặn. UNKNOWN yêu cầu cũ giữ đường đối chiếu. [Actual BH-002/XLK-0003](evidence/revision-01/after/S04-494x950.png) · [Mẫu phân trang riêng](evidence/revision-01/after/S04-sample.png) |

## Khác biệt cần review

- Giữ hình học P19/P20 và khung494×950 hiện hành, không sao chép status bar/khung điện thoại390×844 của board cũ. Icon dùng palette nghiệp vụ được duyệt; màu trạng thái vẫn riêng.
- S03 thích ứng vào owner P04/P05: giữ header/footer và các lối Xem chứng từ/Nhập lượt mới/Trang chủ; thêm Xem lịch sử làm CTA chính. Footer nav kết quả P05 hiện có được giữ, không thay footerLOCK. Metadata bổ sung vẫn xem tại chứng từ theo ID.
- S02 mẫu có mã `BOX-NOT-RECEIVED` riêng để không làm hộp hợp lệ `BOX-LK-0002-01` của P19 trở thành chưa nhập. S04 mặc định dùng BH-002/XLK-0003 đúng owner; không đóng BH-001 hoặc chuyển receipt chỉ để khớp B24. Mẫu tải thêm là nguồn P20 riêng đã có, được ghi rõ ngoài app.
- B04 mặc định12 lượt =11 mã hợp lệ +1 trùng; không trình bày thành12 mã. Mẫu B24 opt-in riêng thực sự record12 mã khác nhau; PX-0004 là phiếu nguồn fixture riêng. Mở mẫu bằng link tải lại sẽ mất dữ liệu thử đang ở bộ nhớ trang.
- Visual chưa được user duyệt. Assertion geometry đạt không đồng nghĩa pixel-perfect hay nghiệm thu toàn app.

## Kiểm thử đã chạy

- **165/165 logic**: P24 mới6 ca cùng P19/P20/P21/P04/P05; [log](evidence/revision-01/logic.txt).
- **56 nhóm trình duyệt**: P24 chính5 + cạnh biên6 + P19 9 + P20 7 + P21 9 + P09 navigation11 + P23 9.
- **25 tổ hợp layout P24** (5 trạng thái gồm2 biến thể S03 × 5 viewport494×950,360×800,430×932,1440×900,340×420), kiểm cuộn ngang/footer/target44 CSS px. **4 viewport footer Home/P03**; regression P19/P20/P21/P23 còn kiểm layout của owner.
- Chromium DPR1, reduced-motion, font local, múi giờ Việt Nam. Có ảnh thật trước–sau; trước S04 và ảnh chính sau dùng cùng BH-002. B24 sample12 mã và mẫu phân trang không có ảnh trước trong app, ghi là nhánh bổ sung.
- Back/Escape/IME/focus/backdrop, lý do dài2000+/Unicode/raw giữ nguyên, stale sheet khi hồ sơ đóng, timeout record→UNKNOWN→đối chiếu cùng yêu cầu, double submit, receipt ID, logout rồi Back đã kiểm. Không test thiết bị/bàn phím ảo thật.
- Một lượt logic cũ còn kỳ vọng cho phép tồn null; cập nhật assertion theo yêu cầu P24 và chạy lại đạt. Script browser đời đầu P21/P23 dùng selector/đích route đã thay ở r03; wrapper dùng đúng adaptation r03 sẵn có, giữ assertion nghiệp vụ. Hai selector harness P05 confirm/P17 owner cũng đã sửa. Các log failure cũ giữ để truy vết; chỉ results cuối được tính PASS.

Lệnh tái lập (tại repo):
```text
node --test tests/scanner-states.test.mjs tests/component-issue*.test.mjs tests/component-history*.test.mjs tests/component-resume*.test.mjs tests/inbound.test.mjs tests/outbound.test.mjs
node scripts/check_p24.cjs
node scripts/check_p24_edges.cjs
node scripts/run_p24_regression.cjs check_p19.cjs
node scripts/run_p24_regression.cjs check_p20.cjs
node scripts/run_p24_regression.cjs check_p21.cjs
node scripts/run_p24_regression.cjs check_warranty_navigation.cjs
node scripts/run_p24_regression.cjs check_p23.cjs
# HOME_FOOTER_EVIDENCE_DIR=handoff/P24/evidence/revision-01/regression/footer
node scripts/check_home_footer_locked.cjs
node scripts/verify_p24.cjs
git diff --check
```
Lệnh footer cần đặt biến môi trường theo shell trước chạy để giữ evidence revision cũ. Wrapper regression chỉ đổi nơi lưu và áp selector/đích hiện hành; không bỏ assertion. [Kết quả P24](evidence/revision-01/after/results.json) · [Cạnh biên](evidence/revision-01/edges/results.json).

## File thay đổi và giới hạn

Danh sách/hash source cuối tại [SOURCE_MANIFEST.json](SOURCE_MANIFEST.json). P19 model/fixture/view/CSS; P20 view/CSS; shared waiting-web; P04/P05 view/CSS/fixture (P04 thêm sentAt và bộ mã opt-in); Home thêm callback lịch sử và công cụ P24. Test/script/handoff, UI_STANDARD, P23 acceptance và coverage/state được cập nhật. Không sửa owner warranty, resume hoặc Post policy khác.

Backend auth/permission/validate/record/Post/status, dữ liệu tồn thời điểm ghi, cursor thực và camera/NFC chưa xác minh. Thuộc tính issuable/reason và B24 sources là adapter preview, không phải schema backend đã chốt. Dữ liệu mất khi reload/logout; lịch sử tổng hợp preview chưa chứng minh đồng bộ WMS. Không có URL WMS được xác nhận. Không áp timeout15giây của nguồn đọc vào Post. Toàn bộ91 panel được kiểm kê theo báo cáo hiện có, không tuyên bố vừa kiểm thử lại hay nghiệm thu production cho toàn app.

## Mở review

Đăng nhập `minhanh / preview` → xác nhận phiên → mở **P24 · Trạng thái Scanner** ngoài khung app để chọn S01/S02/S04. S03 đi qua Nhập kho/Xuất kho, hoặc mở link mẫu B24 riêng trong công cụ rồi gửi bằng owner. P23 tạm chốt không bao gồm các thay đổi P24 này; P24 chờ user review.
