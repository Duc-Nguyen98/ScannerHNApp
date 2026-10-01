# P20 r02 — áp dụng6 cải tiến UX

Đã áp dụng cả6 đề xuất theo yêu cầu user. Giữ P20.S01–S04, frame494×950, Public Sans/icon pastel, dialog/readable contract, footer Home/P03. Không sửa source P19, dist/gallery, ảnh baseline hoặc policy backend; không push/deploy. Source HEAD `da9f623a19d0359c3e80c14f8cc612636ec6ab78`; target prototype, working tree nhiều module của chat khác được giữ.

## Thay đổi

1. **Thông tin hồ sơ** nằm ngay dưới context, trước lịch sử; vẫn về owner P09 và Back phục hồi vị trí.
2. **Tóm tắt phiếu** tách số SKU và tổng quantity. Phiếu >3 loại mặc định hiện3; Xem thêm/Thu gọn nhớ theo case/document trong phiên. Thiếu quantity/SKU không suy thành0. Phiếu ngắn vẫn hiện đầy đủ.
3. **Xem mã đã xuất** mở dialog chỉ đọc bằng action-feedback dùng chung. Nhãn SKU/tên/mã/số lượng riêng; giữ nguyên mã gốc, Unicode/newline/HTML và2100+ký tự; thiếu dữ liệu ghi Chưa xác minh. Không suy UNIT/BOX từ prefix. Back/Escape/Đóng trả focus đúng nút, backdrop không đóng, không chồng overlay.
4. **Phiếu vừa xuất** nối marker từ receipt POSTED P19 qua P09 sang P20. Kiểm owner/case/ID; không tin tham số URL. Highlight/focus1lần khi chủ động mở lịch sử, marker navigation được tiêu thụ; Back không tự kéo lại tới phiếu.
5. **Phiếu đang làm** tại footer hiển thị ID/counts owner P19; DRAFT tiếp tục đúngdocument, UNKNOWN hướng dẫn đối chiếu trước retry. Không thêm cơ chế lưu bền/P21 và không phát thêm Post.
6. **Phần mới tải** có marker và nút Đến phiếu vừa tải đặt ở ranh giới trang cũ/mới. Chỉ tính ID mới sau dedup, không tự kéo người dùng tới phần mới; giữ scroll/focus. Không toast hoặc thông báo thành công thừa.

## Nguồn và visual

[Bảng quyết định/số đo trước sửa](REVISION_02_CONTEXT.md). [Review trước–sau4panel và nhánh mới](REVIEW_02.html). Trước: `evidence/revision-02/before/panels`, snapshot source scoped cùng thư mục. Sau: `after` và `ux`. Cùng494×950 CSSpx/DPR1/local Public Sans/timezoneVN/reduced-motion/zoom100%; capture4panel cùng fixture. `long-history` là fixture opt-in riêng, không thêm phiếu vào ledger chung.

Đã xem actual S01, dialog mã ngắn/dài, phiếu mới xuất, marker tải thêm và footer nháp. Link đầu trang/summary/controls làm danh sách cao hơn r01; nội dung dài cuộn bên trong, header/footer ổn định. Dialog mã nhiều dòng không có baseline raster riêng; dùng component khóa, hình thức mới vẫn chờ user review. Không dùng test hoặc proposal làm bằng chứng nghiệm thu Designer.

## Kết quả thực chạy

| Lệnh | Kết quả/evidence revision-02 |
|---|---|
| `node scripts/capture_p20_r02_before.cjs` | 4panel trước +7nhóm r01 PASS; `before/panels/results.json` |
| `node scripts/run_p20_r02.cjs scripts/test_p20_logic.cjs` | **111/111 PASS** (15test presentation mới +96r01); `node-tests.txt` |
| `node scripts/run_p20_r02.cjs scripts/check_p20.cjs` | **7 nhóm PASS**; `after/results.json` |
| `node scripts/run_p20_r02.cjs scripts/check_p20_edges.cjs` | **5 nhóm PASS**; `edges/results.json` |
| `node scripts/check_p20_r02_ux.cjs` | **8 nhóm PASS**,15layout tương tác/5viewport +1dialog reference; `ux/results.json` |
| `node scripts/run_p20_r02.cjs scripts/check_p20_layout.cjs` | **20 tổ hợp4panel×5viewport PASS**; `layout/metrics.json` |
| `node scripts/run_p20_r02.cjs scripts/check_p19.cjs` | **9 nhóm PASS**,20layoutP19; `p19-regression/results.json` |
| `node scripts/check_warranty_navigation.cjs` với evidence dirr02 | **11 nhóm PASS**; `p09-navigation/navigation-results.json` |
| `node scripts/check_home_footer_locked.cjs` với evidence dirr02 | **4viewport PASS**; `footer/results.json` |
| `node scripts/capture_p20_r02_scroll.cjs` | **2 ảnh/control visibility PASS**, S02/S03 cuộn cuối; `scroll/results.json` |

P20.A01–A05 vẫn PASS fixture. Tổng20nhóm P20 riêng +20nhóm hồi quy P19/P09. `node --check` view/Home và `git diff --check` exit0. Không có package.json gốc, không bịa build/lint production. Trình duyệt desktop mô phỏng viewport không thay kiểm thử bàn phím ảo/thiết bị thật.

Kiểm thử mã dài dùng interception source fixture trong browser test riêng, không sửa file dữ liệu hay response backend. Trong vòng kiểm: sửa test bấm load trước khi first-fetch hết loading, sửa nhãn test số lượng cho đúng1mã/2linh kiện; failure.json giữ lịch sử, kết quả cuối đọc results.json. Preview8766 ban đầu không chạy, đã khởi động lại server có sẵn, không deploy.

## File và trạng thái

Mới: `history-experience.mjs`, `tests/component-history-experience.test.mjs`, `scripts/capture_p20_r02_before.cjs`, `run_p20_r02.cjs`, `check_p20_r02_ux.cjs`. Chỉnh cục bộ: `history-view.mjs`, `history.css`, `history-fixture.mjs`; `home/home.mjs` chỉ chuyển marker receipt đã xác minh. Các source đặt trong `docs/flows/warranty-components` trừ đường dẫn đã ghi khác.

Cập nhật handoff/r02, coverage4panel và RUN_STATE; giữ r01 và P19 tạm chốt. **Visual: AWAITING_USER_REVIEW; behavior: PASS_PROTOTYPE; integration: BLOCKED_PRODUCTION.** Backend history pagination/scope/permissions và thiết bị thật chưa xác minh. Preview chỉ giữ bộ nhớ trang, reload mất phiếu/trạng thái mở rộng. Không thêm tìm kiếm/bộ lọc hoặc triển khai các board P21–P24 trong revision này.
