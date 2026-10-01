# P14 r03 · Khắc phục audit và nâng cấp ba màn còn lại

**Đã áp dụng gói đề xuất user duyệt, giữ nguyên4panel P14.S01–S04.** Visual chờ user review; behavior PASS prototype cho các ca đã chạy; integration production vẫn BLOCKED. Đây không phải nghiệm thu WMS/thiết bị.

## Thay đổi

| Màn / lỗi audit | Kết quả r03 |
|---|---|
| S01 / F05 | Dock56px, lề24, Enter qua form owner. UNKNOWN chỉ nói yêu cầu khôi phục; dock đổi sang Đối chiếu, không giữ nút gửi lại. Busy có nhãn theo thao tác. |
| S03 / F01 | presentation.mjs là nguồn chung của banner/CTA/disabled. UNKNOWN dùng warning và check; không còn banner xanh ready. Danh sách xem trong lúc pending chỉ đọc. |
| S03 / F03 | Mã phiếu hai dòng, reader shared ngoài nút; full string giữ nguyên. Nhiều phiếu phải chọn dòng cụ thể, một phiếu có mã trên CTA. |
| S03 / F04 | Nhớ scroll/focus theo panel trong phiên; sau mở đúng owner và Back phục hồi vị trí, không hydrate hoặc tạo phiếu mới. |
| S04 / F02 | Count/list/details dùng receipt.request.records; identity/kho/startTime cũng được chốt trong request kết thúc. Tạo phiếu xuất mới không thêm vào tổng kết cũ. |
| S03/S04 list | Dialog nghiệp vụ cùng openAppModal/createDialogRoute, mã–loại–trạng thái; kỹ thuật thu gọn. S03 chọn đúngID/version/scanSession/actor/kho. S04 xem lịch sử chỉ đọc; tiếp tục phiếu hiện hành qua Home. |
| S04 layout | Link/thẻ nháp có vùng bấm>=44px; ngàydd/MM/yyyy, ca qua đêm ghi ngày ở cả mốc bắt đầu/kết thúc; giữKPI/dockHome/footerLOCK. |

S03 dock chứa action chính theo tình trạng: lưu / đối chiếu / kết thúc. End bị khóa vẫn có lý do rõ khi chưa đủ điều kiện. SourceUNKNOWN phải mở owner đối chiếu; lưu nháp không tự hóa giải kết quả chưa rõ. Không tự bàn giao/chuyển quyền hoặc tạo ca mới sau khi đã kết thúc.

S02 r02 được giữ và kiểm hồi quy. Không sửa CSS/model chung, Home/profile/auth entry trong revision này. Mã mới tại `recovery-shift/presentation.mjs`, `record-dialog.mjs`; sửa `view.mjs`, `style.css`, `model.mjs`. Snapshot shift chỉ thuộc adapter preview, không phải schema backend được duyệt.

## Nguồn / hình thức

SourceHEAD `da9f623a19d0359c3e80c14f8cc612636ec6ab78`; target prototype HTML/CSS/ES modules, working copy có thay đổi chat khác được giữ. [Quyết định trước code](UI_UX_REVISION_03.md), [audit gốc](AUDIT_REMAINING_2026-09-29.md), [review trước–sau](REVIEW_03.html).

Before/after cùng494×950 CSSpx/DPR1/Arial, clock2026-09-29T08:30+07, minhanh. B14/ảnh gốc không sửa. Dock/action/context list là thay đổi user cho phép triển khai, chưa tự coi là Designer/user đã nghiệm thu hình thức. Ảnh states/stress có nhãn và fixture test riêng.

## Kiểm tra

- `node --test tests/recovery-shift.test.mjs tests/p14-presentation.test.mjs`: **24/24 PASS**. Kiểm UNKNOWN precedence, guard, snapshot count/identity/startTime không đổi, copy riêng recovery, model save/end/reconciliation và chống trùng. [Log](evidence/revision-03/node-tests.txt).
- `node scripts/check_p14_upgrade.cjs`: **8/8 nhóm PASS**, giải quyếtF01–F05. Bao gồm Enter/dock, one-modal/Back/trap/backdrop, pending list readonly, ca qua đêm, count1/list1 sau phiếu mới, nguồn0/UNKNOWN,12phiếu, mã250/2200, chọn chính xác owner và Back giữscroll/focus. [Kết quả](evidence/revision-03/upgrade-results.json).
- `P14_EVIDENCE_DIR=…/revision-03/regression node scripts/check_recovery_shift.cjs`: **16/16 nhóm PASS**, đủ4panel×6viewport; A01–A05, save/error/UNKNOWN, logout/late result, footer/nav, reader. [Kết quả](evidence/revision-03/regression/browser-results.json).
- `P14_RECEIPT_DIR=…/revision-03/receipt-regression node scripts/check_p14_receipt.cjs`: **6/6 nhóm PASS** hồi quyS02 r02, clipboard native/failure,250/2200ký tự, fixedCTA/6viewport. [Kết quả](evidence/revision-03/receipt-regression/receipt-results.json).
- `P14_CAPTURE_DIR=…/revision-03/{before,after} P14_FIXED_TIME=2026-09-29T08:30:00+07:00 node scripts/capture_recovery_shift.cjs`: ảnh4panel trước–sau. Tổng kết mẫu cuối **695px nội dung/695px vùng cuộn**, không cuộn dư; ngang494/494 và CTA trướcnav. [Geometry cuối](evidence/revision-03/after/final-summary-layout.json).

Tổng **30 nhóm browser +24 tests Node**. Chromium headless/DPR1/zoom1;494×950,360×800,430×932,1440×900,340×420,1869×940. Không pageerror trong suite đạt. Browser overrides nhiềuphiếu/giátrị dài chỉ ở test, không có test hook mới trong app. Viewport thấp không chứng minh bàn phím thiết bị thật; hardware/production NOT_RUN.

Scripts có env để evidence không đè revision cũ; selector test cập nhật theo form dock được user duyệt. Syntax đã kiểm. Không có package/build pipeline tại target. Kiểm thêm list readonly sau pending và cân spacing8px cho S04 sau review actual; lưu actual cuối, không sửa baseline để hợp thức hóa.

## Bàn giao

[ẢnhS01](evidence/revision-03/after/P14-S01.png) · [S02](evidence/revision-03/after/P14-S02.png) · [S03](evidence/revision-03/after/P14-S03.png) · [S04](evidence/revision-03/after/P14-S04.png). [UNKNOWN đã sửa](evidence/revision-03/after/S03-end-unknown.png), [chi tiết tổng kết](evidence/revision-03/after/S04-snapshot-list.png).

Coverage/RUN_STATE đã cập nhật; audit cũ giữ lịch sử và đánh dấu resolved bởi r03. Giữ24board/91panel; P15–P24 chưa hoàn tất. Recovery delivery, shift policy/persistence/aggregate/backend/P21 còn chờ contract; không push/merge/deploy.
