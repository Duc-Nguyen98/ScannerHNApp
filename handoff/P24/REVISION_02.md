# P24 r02 — sáu cải tiến UI/UX

30/09/2026 · User yêu cầu “Áp dụng đề xuất cho tôi” cho cả6 đề xuất. **Đã triển khai đủ6**, hình thức **AWAITING_USER_REVIEW**, hành vi **PASS_PROTOTYPE**, tích hợp **BLOCKED_PRODUCTION**. P23 r03 giữ tạm chốt; state đồng bộ bổ sung sau.

[Review trước–sau](REVIEW_02.html) · [Nguồn/quyết định](REVISION_02_CONTEXT.md) · [State acceptance](STATE_ACCEPTANCE_02.csv) · [Manifest](SOURCE_MANIFEST_02.json) · [Preview](http://localhost:8766/flows/auth-session/?v=p24-r02)

| Đề xuất | Kết quả |
|---|---|
| 1 · S01 so sánh số lượng | Khi sửa BOX đã có trong bản soạn, hiện Đang chọn2 → Sau xác nhận3. Input không hợp lệ/tồn chưa rõ không hiển thị số lượng sau như thể đã hợp lệ; submit bị guard từ chối giữ lượng cũ. Mở hộp mới không giả đã có dòng0. Hủy/Back giữ bản soạn và focus; không tính tồn sau Post. |
| 2 · S02 giữ ngữ cảnh | Thẻ gọn hiển thị số mã hợp lệ được giữ và documentId từ cùng owner. “Sửa mã vừa nhập” giữ mã/focus, còn Quét mã khác về cùng phiếu. ID dài có reader; reason nguồn và accepted list không bị đổi. |
| 3 · S03 mở đúng phiếu | CTA chính Xem phiếu PN/PX… mở P12 bằng documentId đã record, không tra theo mã hiển thị. Xem lịch sử chuyển xuống nhóm phụ; giữ Nhập lượt mới/Trang chủ. Nhãn dài gọn2dòng, số nguyên vẹn ở summary/reader. |
| 4 · S03 hai mốc rõ nghĩa | Đã gửi phiếu có dấu xác nhận; Chờ xử lý trên Web có nhãn amber. Dòng Chưa ghi sổ · Chưa đổi tồn tách rõ record và Post. Không dựng event/thời gian xử lý Web. P19 thành công vẫn là Đã xuất, UNKNOWN không thành result. |
| 5 · S04 một notice | Notice chỉ đọc đặt ngay dưới context; bỏ bản lặp ở footer khi không có phiếu cần xử lý. Giữ thông tin pending/UNKNOWN và lỗi quyền thực, không che cảnh báo đối chiếu. |
| 6 · S04 quá trình bảo hành | Nhóm liên kết gọn có Xem thông tin hồ sơ và Xem quá trình bảo hành tới P23.S02 cùng caseId. Caller được tạo trong bộ nhớ phiên, marker giả không tạo đích Back. Back nút/trình duyệt phục hồi P20 đúng danh sách/cursor/cuộn/focus; không đọc lại trang đã tải. |

## Nguồn và hình thức

Source HEAD `da9f623a19d0359c3e80c14f8cc612636ec6ab78`, working copy P24 r01 + công việc chat khác hiện có. Target prototype HTML/CSS/JS. Baseline B24 và các primitive đã khóa giữ nguyên; r02 là adaptation được user yêu cầu, cần review hình thức. [B24](evidence/revision-01/baseline/B24.png).

Before/after dùng494×950 CSS px, DPR1, font local, reduced-motion, timezone VN; thêm5 viewport gồm360×800,430×932,1440×900,340×420. Source trước sửa lưu tại evidence/revision-02/before/source. UUID phiếu mẫu được tạo riêng mỗi lần chạy nên khác chuỗi; không dùng UUID ảnh trước làm ID app mới.

Ảnh5 trạng thái chính tại before/after và after/after; nhánh sheet sửa số lượng có ảnh riêng before/ux/S01-edit.png và after/ux/S01-edit.png. S04 dùng đúng BH-002/XLK-0003 cho ảnh chính; mẫu phân trang riêng để kiểm giữ trang và cuộn. Reader nhãn2000+ dùng dữ liệu presentation tổng hợp trên kết quả đã record, không tính là dữ liệu WMS hoặc xác nhận production.

## Kiểm chứng

- **170/170 test logic**:165 r01 +5 ca helper/presentation r02.
- **50 nhóm trình duyệt**: P24 chính5 (bổ sung assertion CTA/mốc/ID cho cả nhập và xuất), edge6, UX r02 5, P19 9, P20 7, P21 9, P23 9.
- **35 tổ hợp layout P24**:25 chính +5 sheet sửa lượng +5 nhãn phiếu dài. Header/footer nằm trong khung, không tràn ngang; target chính kiểm44 CSS px. Các regression có layout owner riêng, không cộng vào35.
- **4 viewport footer Home/P03** giữ mẫu khóa. Không sửa footer CSS Home/P03.
- Nội dung dài/Unicode/HTML escaping, reader/Back/Escape/focus, IME, stale sheet khi case đóng, UNKNOWN/double submit/đối chiếu, ID receipt, logout Back tiếp tục qua kiểm tra. Giữ lịch sử của user chưa áp thêm policy sản phẩm/backend.
- Assertion cũ P20 tìm chữ Đã trả khách trong footer đã được chuyển sang notice mới đúng đề xuất5; giữ assertion disabled/guard. Log lần chạy cũ giữ để truy vết, kết quả cuối dùng results.json. R01 evidence không ghi đè.

Lệnh (từ repo):
```text
node --test tests/scanner-states*.test.mjs tests/component-issue*.test.mjs tests/component-history*.test.mjs tests/component-resume*.test.mjs tests/inbound.test.mjs tests/outbound.test.mjs
node scripts/run_p24_r02.cjs check_p24.cjs after
node scripts/run_p24_r02.cjs check_p24_edges.cjs after
node scripts/check_p24_r02.cjs after
node scripts/run_p24_r02.cjs regression check_p19.cjs
node scripts/run_p24_r02.cjs regression check_p20.cjs
node scripts/run_p24_r02.cjs regression check_p21.cjs
node scripts/run_p24_r02.cjs regression check_p23.cjs
# Set HOME_FOOTER_EVIDENCE_DIR=handoff/P24/evidence/revision-02/after/footer
node scripts/check_home_footer_locked.cjs
node scripts/verify_p24_r02.cjs
git diff --check
```

## Phạm vi và giới hạn

Chỉ presentation/adapter P19, P20, P04/P05, shared waiting-web, caller P23 từ P20, Home callback; helper số lượng mới không ghi dữ liệu. Các model guard/record/Post/resume/history, fixture backend, shared modal/reader và gallery/dist không đổi. [Manifest](SOURCE_MANIFEST_02.json) ghi file/hash cuối; snapshot nguồn trước và ảnh r01 còn nguyên.

Giữ24 board/91 ID; bổ sung evidence coverage các nhánh P24/P04.S04/P05.S04/P20.S01/P23.S02, không coi việc cho phép nâng cấp là tạm chốt giao diện r02. Backend/stock/permissions/event mapping/thiết bị thật/lưu bền chưa xác minh. Dữ liệu bộ nhớ mất khi reload hoặc đăng xuất. Không push/merge/deploy.

Mở preview, đăng nhập minhanh / preview rồi xác nhận phiên. S01 sửa số lượng: công cụ P19 → review → Sửa tại BOX. S02/S04: công cụ P24 ngoài khung app. S03: gửi phiếu qua Nhập/Xuất; CTA mới mở đúng phiếu vừa gửi. Hình thức r02 chờ user review.
