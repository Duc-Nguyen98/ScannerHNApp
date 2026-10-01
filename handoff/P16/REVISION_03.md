# P16 r03 — rà soát và sửa lỗi UI/UX

Đã tái hiện và sửa sáu nhóm lỗi trong P16/P12 và entry preview. Giữ source cập nhật P17/P18, footerLOCK, shell494×950, quyền/ID và các owner nghiệp vụ. Không đổi model/API/fixture nghiệp vụ hoặc tự push/merge/deploy.

## Lỗi và kết quả

| Lỗi tái hiện trước sửa | Khắc phục | Bằng chứng |
|---|---|---|
| Query dài làm vùng cuộn cao2135px trong524px; CTA bắt đầu ởy2405 khi navy875 | Mô tả tối đa3dòng, Xem đầy đủ dùng dialog cuộn; chuỗi gốc giữ nguyên. Sau sửa scroll524px, CTA ởy759 | before/audit.json, after/audit.json; query-2000.png |
| Response đọc thay toàn toolbar, focus scan rơi vềBODY | Cập nhật toolbar tại chỗ, giữ node/button identity | audit-results.json |
| Sort đang mở, response đến khiến đóng dialog vềH1 | Giữ trigger, phục hồi focus theo node/selector khi cần | audit-results.json |
| Dòng đang focus bị xóa khỏi response mới, focus rơi vềBODY | Phục hồi ID nếu còn; nếu không còn thì focus vùng danh sách, không tự chọn/mở dòng khác | empty-focus.png |
| Áp dụng filter/sort dựng lại màn và mất vị trí bàn phím | Lưu trigger theo ngữ nghĩa trước dialog; Hủy/Apply/Back/Escape trả đúng nút | filter-focus.png |
| Entry chỉ bắt import reject, import chậm có thể để trang trắng | Fallback HTML hiện ngay; thông báo chờ/chậm/lỗi; tải lại do người dùng bấm. Không auto-reload hoặc đoán lỗi mạng | startup-results.json; p17-regression/failure.png là lần quan sát trước sửa |

## Phạm vi source và nguồn hình thức

HEAD tham chiếu `da9f623a19d0359c3e80c14f8cc612636ec6ab78`, target prototype HTML/CSS/JS. Đọc AGENTS/UI_STANDARD và trạng thái mới nhất; P18 đang là công việc chung hiện hành nên RUN_STATE chung chỉ thêm mục audit P16, không ghi đè current_prompt P18.

Sửa `documents/documents.mjs`, `data-states/view.mjs/style.css`, `auth-session/bootstrap.mjs/index.html`. Query reader dùng adapter P12 + `isTextTruncated` dùng chung; modal/focus/Back dùng dialog route/AppModal hiện hữu. CSS mới chỉ clamp3dòng và nút reader36px; các số đo shell/header/control/nav kế thừa r02. Fallback startup dùng vùng preview đã có, không đổi màn Login đã khóa. Đây là sửa lỗi theo yêu cầu; hình thức vẫn chờ user review.

## Kiểm chứng

- `node scripts/check_p16_r03.cjs`: **7/7 nhóm PASS**; query250/2000/từ liền/Unicode/HTML, reader nguyên văn, Back/Escape/backdrop/Tab, focus toolbar/dialog/dòng biến mất, filter/Back giữ context. Sáu viewport494×950,360×800,430×932,1440×900,340×420,1869×940.
- `check_documents_tabs.cjs`, output riêng `p12-tabs`: **9/9 nhóm PASS**, gồm P18 PDF viewer → Back về đúng chứng từ/tab.
- `node scripts/check_p16_local_transport.cjs`: **7/7 nhóm UX PASS**, giữ20capture của bốn panel×5viewport, debounce/IME/race/anchor/guard. Suite cung cấp file source qua request interception để tách khỏi máy chủ preview chậm; không gọi backend.
- `node scripts/check_preview_startup.cjs`: **5/5 ca PASS** cho pending/slow/success/reject/retry, module dependency được mock để tái hiện ổn định.
- `node scripts/check_p16_local_transport.cjs p17`: **7/7 nhóm PASS**. Wrapper cập nhật assertion theo source hiện hành: thiếu nguồn thì không có Check, có Thông tin đối chiếu và Gửi lại vẫn disabled; không sửa owner để chiều test cũ. Bao gồm copy/callback muộn/UNKNOWN/P16 announcement và focus.
- FooterLOCK: **4/4 viewport PASS**. Node data-states/documents/document-progress/flow-guidance/dialog-route: **38/38 PASS**. Syntax + `git diff --check` đạt.

Tổng **39 nhóm/ca/viewport browser hoàn tất**, không pageerror trong các suite app đạt; startup cố ý mô phỏng module reject. Ảnh Chromium headless, Arial, DPR1, zoom1; không có ngưỡng pixel-diff tự đặt.

**Giới hạn và kiểm chưa hoàn tất:** máy chủ8766 có các lần module tải chậm khiến hai lượt regression dừng trước Login; đây là lý do thêm loading/recovery và dùng transport tĩnh để kiểm UI. Không tuyên bố đã xử lý nguyên nhân hiệu năng máy chủ. Lượt đầu của P17 regression dừng ở selector cũ: source P04 hiện hành đã thay Check bằng Thông tin đối chiếu khi thiếu nguồn. Đã đối chiếu source, cập nhật assertion trong wrapper và chạy lại đủ7nhóm đạt; không đảo ngược thay đổi owner mới. P16 retry/announcement/focus được kiểm riêng trong suite audit; backend/phần cứng/screen reader thật chưa kiểm.

[Review r03](REVIEW_03.html) · [Audit trước](evidence/revision-03/before/audit.json) · [Audit sau](evidence/revision-03/after/audit.json) · [Kết quả regression](evidence/revision-03/verification-summary.json). Không khẳng định toàn bộ app không còn lỗi ngoài các nhánh đã kiểm.
