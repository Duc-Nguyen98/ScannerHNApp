# P08 r14 — dialog bộ lọc thoáng và ngày mặc định

Phạm vi: shared filter của6 trang Lịch sử. User gọi5dialog ởcuối yêu cầu nhưng đồng thời chỉ rõ áp dụng6màncon; cùng component được cập nhật cho cả6. Không đổi sort/calendar/P05 choice layout.

## UI/UX
- Từ ngày/Đến ngày xếp dọc2hàng, field50px, nhãn riêng, gap14px. Không chen2 ô ngày/calendar vào cùng1hàng hẹp.
- Header nhóm tiêu đề và context; đệm20px, khoảng cách nhóm22px. Radio48px giữ nhãn nghiệp vụ, không thêm trạng thái.
- Bỏ note Định dạng dd/mm/yyyy (placeholder chỉ hiện khi ô thực sự trống).
- Đặt lại là button outline thực sự, không còn textlink Xóa ngày & trạng thái. Footer3 cột bằng nhau, cao>=48px: Đặt lại/Hủy/Áp dụng.
- Date input dùng viền ngoài nhẹ, không khungfocus xanh bên trong; focus bàn phím radio/button vẫn rõ. Calendar vàP05choicedialog không bị rule filter-only tác động.

## Ngày/bản nháp
- Khi committed from/to đều trống: mở filter điền2ô bằng ngày hiện tại Asia/Ho_Chi_Minh. Không hardcode ví dụ27/09/2025.
- Chỉ áp dụng sau Apply. Mặc định trang vẫn Tất cả ngày; mở/Hủy/Escape không tự lọc.
- Range đã áp được giữ nguyên khi mở lại. Legacy1ôtrống không tự bị ghi đè thành hôm nay.
- Đặt lại giữ chức năng cũ: bỏ2ngày vàstatus trongdraft; Apply=>Tất cả ngày. Cancel=>bộ lọc committed cũ. Mở lại All-days tạo draft hôm nay mới.
- Luật90ngày, datevalidation và đổi tháng vẫn giữ nguyên.

## Kiểm chứng
- check_history_filter_r14.cjs:3/3 groups PASS.6 dialog×6viewport=36captures. Đo datefields stacked/thẳng lề;3buttonfooter ngang/cùng rộng/cao>=48; dialog trongapp, không tràn; Tab trap/Escape restore.
- Test mặc định clock27/09/2026, rollover28/09/2026; unit test cả27/09/2025 để chứng minh không hardcode year.
- Kiểm rangecũ/resetcancel/resetapply/reopen/todayapply/future/day91 invalid.
- Shared regression r14:7/7 PASS. Các assertion cần lọc mọi ngày đã explicit clear2input trước Apply theo hành vi draft mới; không thay kỳ vọng nghiệp vụ.
- Node toàn workspace146/146 PASS.
- Đã xem ảnh actual General/Bảo hành. Visual user review pending. IntegrationNOT_RUN; không push/merge/deploy.

## Evidence
evidence/revision-14/filter-results.json; history-general-494x1000.png; warranty-494x1000.png; calendar.png; reset-draft.png; các viewport còn lại; unified-regression/browser-results.json; node-tests.txt.
Giữ baseline/source dữ liệu/91panel/24prompt; thay đổi scoped shared filter.
