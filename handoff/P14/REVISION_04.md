# P14 r04 · Căn chỉnh Kết thúc ca / Tổng kết ca

Đã áp dụng đề xuất user duyệt sau ảnh1/2. **Visual chờ user review; behavior PASS prototype cho các ca đã chạy; integration production BLOCKED.** Giữ đủ4panel,24board/91panel; S01/S02 và footerLOCK giữ nguyên.

## S03 · Thao tác tập trung

- Bỏ CTA Tiếp tục riêng ngoài danh sách; trong mỗi thẻ có nhãnTiếp tục và vẫn mở đúng ownerID/version/scanSession/actor/kho. Reader2dòng/fulltext r03 giữ.
- Save/Check và End nằm cùng dock trước nav, nút56px/lề24/gap12. Unfinished: Save primary+End disabled; UNKNOWN: Check primary+End disabled; ready: End primary. Khi busy/blocked vẫn giữ lý do/guard, không tự gửi lại.
- Bỏ khối End/hướng dẫn lặp trong body. Banner là nguồn thông báo duy nhất; nútEnd có aria-describedby nối đúngp14-shift-status.
- Lưu thành công không tự kết thúc ca; confirmation riêng và receipt verified mới mởS04.

## S04 · Kho riêng, ngày–giờ cùng hàng

- Kho fullwidth. Ngày và thời gian cùng hàng2cột; mỗi field dùng icon44, label16/value18, gap4, leading1.5. Padding16, nhóm16, một đường phân cách nhẹ dưới kho.
- Ca qua đêm hoặc thiếu mốc bắt đầu chuyển ngày/thời gian sang toàn chiều rộng; không cắt ngày ở hai mốc.
- Tiêu đề Kết quả công việc cách metadata20px; gridKPI cách tiêu đề12px. Không đổi nguồn KPI hoặc snapshot tổng kết.
- Mẫu thường có726px nội dung trong vùng695px, cuộn31px để xem hết phần nháp. Đây là thay đổi spacing/font theo đề xuất: không giảm chữ hoặc che dữ liệu để ép vừa ảnh; Home CTA/nav cố định. [Geometry](evidence/revision-04/after/final-summary-layout.json), [ảnh cuối nội dung](evidence/revision-04/after/S04-bottom.png).

## Nguồn / trước–sau

HEAD `da9f623a19d0359c3e80c14f8cc612636ec6ab78`; target prototype HTML/CSS/ES modules. [Bảng quyết định trước code](UI_UX_REVISION_04.md), [review r04](REVIEW_04.html). Before/after494×950 CSSpx/DPR1/Arial, fixtureminhanh, clock2026-09-29T08:30+07. Baseline B14 và ảnh feedback không sửa. Phương án bố cục được user cho triển khai, chưa tự nâng thành nghiệm thu visual.

Sửa source `recovery-shift/view.mjs` và `style.css`. Model, presentation state, record dialog, auth/Home/P10 source không đổi ở r04. Không ghi WMS hoặc thay quyền/policy ca. Giữ công việc chat khác trong working copy.

## Kiểm chứng

- `node scripts/check_p14_layout_r04.cjs`: **4/4 nhóm PASS**. DockS03/aria-describedby/6viewport; metadata2cột/padding16/font16–18/gap20–12; cuộn/dock cố định; overnightfullwidth. [Results](evidence/revision-04/layout-results.json).
- `P14_EVIDENCE_DIR=…/revision-04/regression node scripts/check_recovery_shift.cjs`: **16/16 nhóm PASS**; đủ4panel×6viewport, A01–A05, save/error/UNKNOWN/reconcile/late receipt/logout, reader và fixedfooter. [Results](evidence/revision-04/regression/browser-results.json).
- `P14_UPGRADE_DIR=…/revision-04/upgrade-regression node scripts/check_p14_upgrade.cjs`: **8/8 nhóm PASS**; không tái xuất lỗi auditF01–F05, snapshot1/list1 sau phiếu mới,0/12phiếu/ownerUNKNOWN/longtext/Back. [Results](evidence/revision-04/upgrade-regression/upgrade-results.json).
- `P14_RECEIPT_DIR=…/revision-04/receipt-regression node scripts/check_p14_receipt.cjs`: **6/6 nhóm PASS**; S02r02, nativeclipboard/failure/250–2200/reader/focus/6viewport. [Results](evidence/revision-04/receipt-regression/receipt-results.json).

Tổng **34 nhóm browser PASS**, không pageerror trong lần chạy cuối. Viewport494×950,360×800,430×932,1440×900,340×420,1869×940; Chromiumheadless/DPR1. Bàn phím thiết bị thật/hardware/backend NOT_RUN. Không chạy lại modelNode vì model không đổi;24Node của r03 là evidence lịch sử, không báo như đã chạy mới.

Ca Back mới: khi đổi từ CTA riêng sang row cuối trong danh sách dài, kiểm thử phát hiện scroll về0 trong lúc reader đo/clamp. Đã sửa restore theo đúng render còn active sau vòng đo của shared reader; không callback qua route/logout/modal. Ca12phiếu/mã250–2200/Back/focus đã chạy lại đạt. Lần test đầu dùng linkXem tất cả ở đầu trang nên click tự cuộn về0: sửa kịch bản sang row cuối có owner thật, không sửa kỳ vọng để che lỗi. File upgrade-failure.json giữ log trước sửa; final là upgrade-results.json. Một lỗi cú pháp script chỉnh file ban đầu không ghi source; đã sửa trước lần kiểm cuối.

## Bàn giao

[Trước–sauS03](REVIEW_04.html) · [S03 actual](evidence/revision-04/after/P14-S03.png) · [S04 actual](evidence/revision-04/after/P14-S04.png) · [overnight](evidence/revision-04/after/S04-overnight.png). Source manifest và evidence theo revision mới, không đè r03. Cập nhật RUN_STATE/coverage. Không push/merge/deploy; recovery/shift/persistence/aggregate/P21 thật vẫn chờ contract. P15–P24 chưa hoàn tất.
