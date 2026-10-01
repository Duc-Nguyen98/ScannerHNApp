# P02 UX r15 — áp dụng6 đề xuất (2026-09-29)

[Bảng nguồn và quyết định trước sửa](REVISION_15_CONTEXT.md). User yêu cầu áp dụng toàn bộ6 đề xuất; phạm vi prototype hiện có, không mở prompt/màn mới. Source đã có nâng cấp đồng thời P04/P05/P06/P07/P08/P09/P12/P14; giữ các thay đổi đó, dùng lại helper/owner, không tự nhận toàn bộ là diff của lượt này.

## Mapping6 hạng mục

| Hạng mục | Kết quả áp dụng |
| --- | --- |
|1. Tiếp tục phiếu | Home có section có điều kiện cho phiếu nhập/xuất owner đang giữ. Tái sử dụng `pendingStockRun`, thêm yêu cầu documentId/scanSessionId/version và phiên hợp lệ. Không có draft thì không chiếm chỗ.2owner có2phiếu thì hiện2 dòng riêng. Label UNKNOWN=Cần đối chiếu, busy=Đang gửi phiếu. |
|2. Phản hồi toàn thẻ | `shared/list-actions.css`: hover/pressed đổi nền nhẹ cho thẻ tác vụ, recent và các dòng danh sách P06–P09/P12/P13; focus giữ rõ, reduced-motion không transition; không tô lại icon/badge severity, không scale layout/override footer. |
|3. Back giữ ngữ cảnh | Bổ sung lưu/khôi phục **inner scroll `.hn-main`** của Home (trước chỉ window.scrollY), cả qua detail và P03 overlay. Giữ filter/query/scroll/focus theo owner hiện có; xác minh recent/P12/NFC/lookup/history flows liên quan. Resume entry có journey trong memory, không nhận marker cũ của phiên khác. |
|4. Nhập mã liên tục | Tái sử dụng pipeline P04/P05 đã có: mã hợp lệ xóa ô, giữ focus; duplicate/invalid giữ mã để sửa, không tăng accepted. Không thêm banner kết quả trái dialog contract, không mở camera hoặc giả hardware. Browser đã kiểm P04 nhiều mã/trùng/lỗi và P05 focus/resume. |
|5. Rỗng có phục hồi | Thêm shared `clearFilterButton` cho Chứng từ/Bảo hành/nhánh lọc Thông báo. Dùng lại clear/relax của Tra cứu/NFC/Lịch sử đã được cập nhật đồng thời. Chỉ reset view đọc, không xóa dữ liệu; loading/error/UNKNOWN không bị coi là rỗng. P08 giữ phạm vi nghiệp vụ theo handler đã có. |
|6. Thời gian gần đây | Home dùng `shared/recent-time.mjs`: Hôm nay/Hôm qua theo Asia/Ho_Chi_Minh; ngày cũ dùng ngày cụ thể và thêm năm khi khác năm. datetime/title/accessible label vẫn đầy đủ. Refresh khi trở vềHome, tab visible và mốc nửa đêm; không phải backend realtime. |

## An toàn dữ liệu và lifecycle

- Resume chỉ truyền documentId của snapshot owner đang giữ; không cấp ID mới, không ghép scan theo thời gian. P04/P05 giữ document/version/scanSession/accepted/request. Kiểm lại ID trước khi mở; owner đã chuyển run thì báo không còn phiếu đó, không vô tình mở phiếu mới.
- Các owner có callback chỉ để Home đọc lại shortcut/KPI/recent sau cập nhật; không đưa quyền ghi vào Home. UNKNOWN tiếp tục chặn resend, chỉ đối chiếu nguồn theo owner. Callback/dispose/đóng phiên không khôi phục nháp cũ bằng Back.
- Home vẫn max3recent. Khi có shortcut, body được cuộn dưới footer cố định; không bỏ bớt/cắt record để ép vừa. Đã kiểm hàng cuối đọc được ở360px. FooterLOCK không đổi.
- Nháp chỉ trong bộ nhớ phiên prototype; reload/đóng tab không phải cơ chế lưu backend. Backend/máy quét/bàn phím điện thoại thật NOT_RUN.

## Kết quả chạy thật

- `node --test tests/*.test.mjs tests/*.test.cjs`: **346/346 PASS** tại snapshot cuối đã chạy. [Log](evidence/revision-15-ux/node-tests.txt).
- `node scripts/check_home_ux.cjs`: **11 nhóm PASS**: baseline không draft, relative date; scan P04; resume identity; inner-scroll/focus + P03Cancel; UNKNOWN exact request; clear filters4module; history recovery; notification unread recovery; tilepaint; P05scan/resume +2draft360; logout/Back cleanup. [Results](evidence/revision-15-ux/results.json).
- Recent regression: **6 nhóm PASS**,4viewport. [Results](evidence/revision-15-ux/recent-regression/results.json).
- FooterLOCK regression: **4viewport PASS**, Home/P03 paint/geometry parity, KPI/shift giữ nguyên. [Results](evidence/revision-15-ux/footer-regression/results.json).
- Module syntax checks và `git diff --check`:exit0.
- Lần test UNKNOWN đầu chờ success sau đổi modeconfirmed dù request ban đầu không có receipt; app đúng khi vẫnUNKNOWN. Đã đổi test sang timeout-recorded có receipt rồi đối chiếu, không sửa logic để tạo thành công giả. Lần testclear P06 dùng selector quá rộng (3control), đã định vị nút trong empty state. Failure artifacts lưu lịch sử, không coi là kết quả cuối.

## Visual evidence và giới hạn

QA494×950,DPR1, clock2026-09-28T01:15:20Z cố định chỉ trong browser. [Before Home](evidence/revision-15-ux/before-home.png) / [After Home](evidence/revision-15-ux/after-home.png). [Before empty P12](evidence/revision-15-ux/before-empty-documents.png) / [After empty P12](evidence/revision-15-ux/empty-documents.png).

Nhánh mới: [Một phiếu dở](evidence/revision-15-ux/home-draft.png) · [UNKNOWN](evidence/revision-15-ux/home-unknown.png) · [Hai phiếu/360px](evidence/revision-15-ux/two-drafts-360.png) · [Scan](evidence/revision-15-ux/scan-ready.png) · [Empty Bảo hành](evidence/revision-15-ux/empty-warranty.png) · [NFC](evidence/revision-15-ux/empty-nfc.png) · [Tra cứu](evidence/revision-15-ux/empty-lookup.png) · [Lịch sử](evidence/revision-15-ux/empty-history.png) · [Thông báo](evidence/revision-15-ux/empty-notifications.png).

Shortcut và empty-action mới là adaptation được user yêu cầu, chưa có raster Designer cho nhánh này. Có before/after đại diện component ởHome/P12; không có ảnhbefore đầy đủ cho mỗi nhánh con ở các module đang sửa đồng thời. Không gọi visualPASS/pixel-perfect từ test hành vi. Cần user review hình thức; production vẫn theo blocker từngP.

## File ownership

Thêm Home pending-work, shared recent-time/list-actions JS+CSS; Home markup/refresh/lifecycle/scroll/date scheduling; P04/P05 thêm callback `onStateChange` chỉ đọc; P12/P09/P13 thêm clear-action; P01 entry loadstyle/cache. Import unused ban đầu tại P06/P07/P08 đã bỏ, không thay hành vi các module đó trong lượt này. Source controllers/business contract không bị đổi bởi shortcut. Thêm unit HomeUX và browsercheck; giữ current_prompt P14/các báo cáo của task khác trong RUN_STATE.
