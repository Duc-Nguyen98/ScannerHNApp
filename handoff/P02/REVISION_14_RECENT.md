# P02 r14 —3 chứng từ mới nhất và Xem tất cả → Chứng từ

2026-09-29. [Bảng nguồn/quyết định trước sửa](REVISION_14_CONTEXT.md). User yêu cầu đề xuất số bản ghi tối ưu và áp dụng, đổi Xem tất cả sang màn quản lý Chứng từ. Chọn **tối đa3 bản ghi** để giữ Home là nơi xem nhanh, vừa khung cùng tác vụ/footer; không tăng lên5 làm đẩy nội dung trên màn này.

## Triển khai

- Xóa3 dòng minh họa cố định tháng4 ở Home. Dùng cùng nguồn `mergeDocuments` của P12: chứng từ fixture + hồ sơ P09 + receipt gửiWeb đã xác minh của P04/P05; chỉ kho trong phiên. Không tạo dataset Home thứ hai, không đếm một trang dữ liệu để giả tổng server.
- Sắp day/time giảm dần, cùng timestamp tie-break theoID ổn định (P12 dùng cùng sort), lấy tối đa3. Ít hơn3 hiển thị số thực; rỗng/UNKNOWN có nội dung phù hợp, không tự chèn row. Bản ghi thiếu/sai thời gian không được tự gán giờ hiện tại để xếp “mới nhất”, vẫn nằm trong nguồn P12 để tra cứu.
- Mỗi dòng hiển thị **mã, loại, trạng thái, thời gian**; ngày/năm đầy đủ ở datetime/title/accessible label. Chi tiết đối tác/serial/tệp ở P12. Đây là lựa chọn summary gọn, không cắt/lưu đè thông tin nguồn.
- Bấm row mở P12.S02 bằng đúng `doc` ID, không lấy số hiển thị làm ID, không tự suy module từ PN/PX/BH. HeaderBack/nativeBack về callerHome. Nguồn thay đổi làm row đã bấm ra khỏi top3 thì focus trở về heading Chứng từ gần đây.
- **Xem tất cả → P12.S01**, `entry=home-recent`, reset query/type/status/date và sort mới nhất. Entry này giữ filter riêng khi đi detail/Back, không ghi đè bộ lọc normal/KPI; mở mới từ Home luôn bắt đầu đầy đủ. Tab Lịch sử vẫn là hubP22. Chỉ thị mới thay mapping cũ Xem tất cả→Lịch sử, đã ghi AGENTS để tránh quay lại mapping cũ.
- Khi quay lại Home, cập nhật recent khi dữ liệu thay đổi; giữ node/focus nếu dữ liệu không đổi. FooterLOCK,3KPI/giờ ca và handlers khác không thay đổi.

## Kiểm chứng

- `node --test tests/home-recent.test.mjs tests/home.test.mjs tests/home-kpi.test.mjs tests/documents.test.mjs`: **28/28 PASS**. Top3 khớp P12; qua tháng/năm; tieID; dedup; không mutation source;0/1record; timestamp sai; UNKNOWN; receipt mới; scope kho.
- `node scripts/check_home_recent.cjs`: **6 nhóm PASS**,4viewport494×950/360×800/430×932/1264×712, không JS errors. ExactID/Back/focus, P12all24 mới nhất/resetquery, giữ view riêng, tabHistory vẫn đúng, refresh khi shared source đổi, row rời top3 có focus fallback, UNKNOWN không rowgiả. Không horizontal overflow và hàng cuối ở trên footer.
- `HOME_FOOTER_EVIDENCE_DIR=.../footer-regression node scripts/check_home_footer_locked.cjs`: **4 viewport PASS**.
- `git diff --check`:exit0. Scriptcheck_home cũ đã cập nhật các assertion trực tiếp liên quan route/rowHome mới; không lấy những assertionP13/badge cũ trong script đó làm nghiệm thu lượt này.

## Hình thức / nguồn chưa xác minh

Before/after cùng494×950,DPR1, fixtureclock2026-09-29T01:15:20Z (chỉ test). [Before](evidence/revision-14-recent/before.png) · [After](evidence/revision-14-recent/after.png) · [Danh sách đầy đủ](evidence/revision-14-recent/all-documents.png) · [Results](evidence/revision-14-recent/results.json) · [Node log](evidence/revision-14-recent/node-tests.txt).

Actual mặc định mới nhất hiện PX-0011,PN-0011,PX-0010 theo trường ngày/giờ trong source, thay PN-0001/PX-0004/BH-001 minh họa. Đây là dữ liệu fixture, chưa phải danh sách production. Không có nguồn xác nhận `day/time` là server-createdAt/updatedAt production; khi nối backend phải dùng timestamp đã được chốt. Không đổi baseline ảnh, không tuyên bố visualpixelPASS hoặc realtime/backendPASS.

Files: Home recent-documents mới, fixture-adapter/home/style(empty-state); P12 document-model(tie-break), documents(entry filter isolation); cacheentryP01; AGENTS mappingmới; unit/browser checks và handoff/checkpoint. Không push/merge/deploy, không tự thực hiện prompt mới.
