# P18 r03 — rà soát và sửa lỗi UI/UX

Đã sửa toàn bộ **11 ca lỗi tái hiện trong đợt audit**, kèm kiểm tra sâu hơn về tải tệp, render PDF, bàn phím và mobile. Các ca trước sửa có FAIL thực, sau sửa PASS; không lấy số test r02 làm bằng chứng giao diện đã đúng.

**Visual:** đã xem ảnh actual và đối chiếu trước–sau, chờ user review. **Behavior:** PASS trong phạm vi prototype đã kiểm. **Integration:** upload/handoff/location production vẫn BLOCKED. Giữ 24prompt/91panel, bốn ID P18, footerLOCK và nghiệp vụ hiện hành; không ghi case/location/tồn.

Source HEAD `da9f623a19d0359c3e80c14f8cc612636ec6ab78`; target `docs/flows` tại workspace ScannerHNApp. [Nguồn/quyết định trước sửa](REVISION_03_SOURCE_MAP.md), [review trước–sau](REVIEW_03.html), [snapshot và patch](evidence/revision-03/source-changes.patch), [manifest](evidence/revision-03/manifest.json).

## Lỗi đã tái hiện và khắc phục

| Ca | Trước sửa | Sau sửa |
|---|---|---|
| R03-01 | Footer form nhảy từ759.22→782.22px khi đủ checklist/người nhận; vùng nhập đổi chiều cao | Ô hướng dẫn/nút giữ vị trí, dùng disabled thay vì xóa control. Cùng ca đo759.22→759.22px |
| R03-02 | Chọn ô khác làm nhóm Thông tin lưu trữ đang mở bị đóng | Chỉ cập nhật selected và số liệu ô, giữ nguyên details, DOM, focus và scroll |
| R03-03 | Panel vị trí của P06 lại nhấn tab Chứng từ | Tab Quét mã/tra cứu đúng owner; không sửa token/kích thước footer |
| R03-04 | Tab vào node PDF text1px làm bung một đoạn văn bản và thay bố cục viewer | Bỏ điểm Tab vô hình; nút **Văn bản** mở dialog đọc cuộn được, Back/Đóng trả focus và giữ pan |
| R03-05 | Ký tự zoom/menu nhỏ do font kế thừa (zoom computed17px thay dự tính24) | SVG plus/minus/more24px từ Lucide có sẵn trong Git, nét1.8; không tải asset ngoài |
| R03-06 | Bấm zoom đến giới hạn làm focus rơi về BODY | Giữ focus ở control, aria-disabled cùng handler guard chặn vượt biên |
| R03-07 | Tăng zoom làm điểm đọc giữa trang x0.4548→0.3901/y0.4357→0.3737 | Neo theo tỷ lệ trang/tâm viewport hoặc điểm chạm; kết quả x0.4548→0.4549/y0.4357→0.4346, sai số biên/rounding nhỏ, không nhảy đoạn đọc |
| R03-08 | Nguồn attachments=null bị hiển thị0tệp/rỗng | Hiện chưa tải được/chưa xác minh số tệp, giữ context chứng từ, có Tải lại |
| R03-09 | Nguồn đã phục hồi nhưng queue giữ snapshot empty | Đọc lại metadata owner; quay lại hiển thị đủ hai tệp P12, không cần reset phiên |
| R03-10 | Tệp đã gỡ khỏi owner vẫn tải được từ danh sách/cache cũ | Kiểm ID/URL/version/nguồn ở thời điểm hành động và sau fetch; không phát download nếu tệp thay đổi hoặc không còn khả dụng |
| R03-11 | Hồ sơ đã trả khách vẫn hiện form readonly với ngày hôm nay2026-09-29 dù không có receipt bàn giao | Variant chỉ đọc hiện Chưa xác minh cho dữ liệu chưa có nguồn, không tự điền ngày/checklist/người nhận. CTA về đúng hồ sơ; badge tái dùng màu trạng thái P09 |

Evidence: [10 probes trước](evidence/revision-03/before/audit.json) → [10 probes sau](evidence/revision-03/after/audit.json), [audit hồ sơ đóng trước–sau](evidence/revision-03/closed-audit.json). Before được chụp trước sửa; ca hồ sơ đóng dùng interception source snapshot r02 thật, không hoàn nguyên working copy. Baseline B18 giữ nguyên tại revision01.

## Các nhánh được sửa/kiểm thêm

- **Fit/zoom:** khi zoom tùy chỉnh, picker hiển thị Thu/phóng tự chọn; chọn lại Vừa chiều rộng/Vừa trang thực sự reset. Mode event input/change trùng không render hai lần. Dữ liệu trang lưu lỗi được clamp vào trang tồn tại.
- **Lỗi renderer:** thoát busy, ẩn canvas lỗi, hiện Thử lại, không để controls hoạt động với trang chưa sẵn sàng. Read text của trang cũ được khóa trong lúc chuyển trang. Popup Văn bản không làm thay đổi paper/pan.
- **Download:** phản hồi Đang tải ngay trên nút, chống bấm lặp; controller download tách khỏi viewer. Byte cache gắn identity, không dùng PDF cũ dưới tên/URL/version mới. Kiểm cả thay metadata sau khi xem và gỡ tệp giữa lúc fetch.
- **Nguồn không hợp lệ:** phân biệt null/malformed/duplicate ID với empty đã xác minh. Số dòng linh kiện không hiện0 nếu owner chưa xác nhận nguồn.
- **Nhóm chi tiết:** giữ expansion theo item/case; bỏ toggle event từ node đã rời DOM để không ghi nhầm state. Bấm CTA về cùng hồ sơ dùng Back caller, không tạo vòng history mới.
- **Scope:** controls sau dialog bị guard; callback muộn/rời route/thu hồi quyền không phát download/ghi đè màn khác. Giữ guard actor/kho/auth-session, UNKNOWN không mở retry và hồ sơ đã trả khách chỉ đọc.

## Kiểm chứng thực chạy

| Bộ kiểm | Kết quả |
|---|---|
| `node --test tests/attachments.test.mjs tests/attachment-experience.test.mjs tests/documents.test.mjs tests/warranty.test.mjs tests/lookup.test.mjs tests/home.test.mjs tests/profile.test.mjs tests/recovery-shift.test.mjs` | **85/85 PASS** — [log](evidence/revision-03/node-tests.txt) |
| `P18_AUDIT_PHASE=after node scripts/audit_p18_r03.cjs` | **10/10 PASS sau sửa**,10/10 FAIL trước sửa — [audit](evidence/revision-03/after/audit.json) |
| `node scripts/audit_p18_closed.cjs` | **1/1 ca trước FAIL/sau PASS**, ngày, read-only, màu status và Back đúng owner — [log](evidence/revision-03/closed-audit.json) |
| `node scripts/check_p18_r03_edges.cjs` | **5/5 nhóm PASS**, text dialog, phiên bản byte, pending duplicate/remove, render failure/retry, invalid restored page — [log](evidence/revision-03/edges/results.json) |
| `node scripts/check_p18.cjs` | **11/11 nhóm hồi quy UX PASS** — [log](evidence/revision-03/regression/ux-results.json) |
| `node scripts/check_p18_edges.cjs` | **4/4 nhóm PASS**, Unicode2000+, reader, note200, callback đến muộn, ảnh thật — [log](evidence/revision-03/long-content/results.json) |
| `node scripts/check_p18_logout.cjs` | **3/3 nhóm PASS**, cảnh báo mất bản nhập, end-shift khác logout, hết phiên — [log](evidence/revision-03/logout/results.json) |
| `node scripts/check_p18_mobile.cjs` | **2/2 nhóm PASS**, touch emulation390×844/DPR2, xoay844×390, viewport390×480, viewer/text/dialog/form/location — [log](evidence/revision-03/mobile/results.json) |
| `DOCUMENTS_TABS_EVIDENCE_DIR=handoff/P18/evidence/revision-03/p12-tabs node scripts/check_documents_tabs.cjs` | **9/9 nhóm PASS** — [log](evidence/revision-03/p12-tabs/tabs-results.json) |
| `HOME_FOOTER_EVIDENCE_DIR=handoff/P18/evidence/revision-03/footer node scripts/check_home_footer_locked.cjs` | **4/4 viewport PASS** — [log](evidence/revision-03/footer/results.json) |
| `node scripts/capture_p18_revision.cjs` | **20/20 tổ hợp layout PASS**,4panel×5viewport — [metrics](evidence/revision-03/after/layout-results.json) |

Syntax module sửa và `git diff --check` đạt. Tracked diff không bao phủ source untracked có sẵn nên có snapshot patch riêng. Không có pageerror trong các suite hoàn tất. Lượt audit đầu dừng ở cache-empty đã được giữ trong failure.json; sau đó thêm probe độc lập để kiểm riêng nguồn phục hồi và tệp bị gỡ. Render-error test chèn một lỗi đọc trang qua interception vào browser test, không sửa vendor/PDF nguồn.

Capture reference494×950 CSSpx/DPR1/Arial/zoom1/reduced motion; thêm360×800,430×932,1440×900,340×420. Có ảnh đầu/cuối nội dung, lỗi, pending, reader và closed. Đã xem actual cả4panel, closed, reader và zoom. Không đổi ảnh baseline/đặt ngưỡng diff để tự PASS visual. Touch/keyboard-sized viewport là Chromium emulation, chưa phải thiết bị/keyboard thật.

## File thay đổi và ranh giới

- `attachments/view.mjs`, `style.css`, `experience.mjs`, `icons.mjs`: các sửa ở trên. `home/home.mjs` chỉ sửa active tab của panel vị trí. `model.mjs`, upload fixture transport và backend contracts không đổi.
- Dùng lại reader/action dialog, P09 status badge và SVG từ Git HEAD. Không sửa CSS footer Home/P03 hoặc palette nghiệp vụ.
- Test/probe/capture/review/report và tracker theo revision03. Giữ revision01/02, giữ P17 tạm chốt, các revision P12–P14 và công việc chat khác. Không push/merge/deploy.

Đợt rà soát đã khắc phục các lỗi tái hiện trong phạm vi trên. Visual r03 vẫn cần review hình thức; upload thật, receipt/close-case và schema/mutation vị trí vẫn chưa có policy/adapter đã chốt. Không gọi prototype PASS là production PASS. P19–P24 không thuộc đợt này.

[Review trước–sau r03](REVIEW_03.html) · [Mở/tải lại ứng dụng](http://localhost:8766/flows/auth-session/) · `minhanh / preview`.
