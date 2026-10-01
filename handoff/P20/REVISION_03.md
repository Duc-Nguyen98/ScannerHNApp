# P20 r03 — rà soát và sửa lỗi UI/UX

Đã xác nhận và sửa **14 ca lỗi** trong phạm vi P20 r02 và các đường nối trực tiếp. Giữ cả 6 cải tiến r02, P20.S01–S04, khung 494×950, footer Home/P03, icon/dialog/readable contracts. Không thay source P19, baseline, dist/gallery; không push/merge/deploy. HEAD `da9f623a19d0359c3e80c14f8cc612636ec6ab78`, target prototype, giữ công việc các chat khác.

## Lỗi có bằng chứng trước–sau

| ID | Trước sửa | Khắc phục |
|---|---|---|
| A01 | Mở rộng phiếu làm nút đang focus ra khỏi vùng nhìn thấy | Đưa control về trong vùng cuộn sau mở rộng/thu gọn, không cuộn cả trang. |
| A02 | Thu gọn khi đang tải giữ chiều cao cũ, để lại khoảng trắng hơn 1000 px | Chiều cao dự phòng chỉ tồn tại trong request; giải phóng khi kết thúc hoặc đổi số dòng. |
| A03 | Quay lại lịch sử mất focus trên phiếu vừa chọn | Nhớ focus bằng ID phiếu, tách khỏi nút tải/điều hướng. |
| A04 | Số lượng hợp lệ rất dài tràn cột 110 px | Cho số lượng wrap trong cột, không cắt hay thay dữ liệu. |
| A05 | Back từ deep link có thể vòng P20 → P09 → P20 | Fallback thay entry hiện tại, không tạo caller P20 giả. |
| A06 | Hồ sơ không tồn tại dẫn sang hồ sơ giả, phát cảnh báo và vòng Back | Về danh sách P09 không truyền ID không hợp lệ. |
| A09 | Trang chỉ có ID trùng vẫn giữ dấu vừa tải của trang trước | Xóa dấu và nút của batch cũ khi lần tải mới không thêm ID. |
| A10 | Tải trang tiếp làm mất focus hoặc dời nút đang dùng | Giữ DOM nút; không dời nút đang focus trong lúc request hoàn tất. |
| A11 | Bộ mô phỏng hiển thị mode lỗi không đúng hồ sơ | Đồng bộ selector với adapter của hồ sơ đang mở. |
| A12 | Bấm mở cùng màn thêm entry Back thừa | Không push history cho URL hiện tại. |
| A13 | Nguồn đọc treo giữ spinner vô hạn | Read-only timeout 15 giây; giữ danh sách/cursor, cho retry đọc; chặn response muộn. |
| A14 | Chuỗi cursor A → B → A có thể lặp tải vô hạn | Theo dõi cursor đã tiêu thụ; từ chối chu trình mà không mất trang cũ. |
| A15 | SKU/mã chỉ có khoảng trắng vẫn được tính đã biết | Nhận diện là Chưa xác minh; mã hợp lệ vẫn giữ nguyên khoảng trắng/ký tự gốc. |
| A16 | Hồ sơ đã trả khách khóa cả đối chiếu UNKNOWN | Tách read-guard khỏi write-guard; chỉ cho đối chiếu yêu cầu cũ, không xuất mới. |

[Audit trình duyệt bản r02](evidence/revision-03/baseline-verified/results.json): 10 FAIL / 2 PASS. A07 đổi case khi dialog đang mở đã PASS; A08 mã dài có reader vẫn PASS sau khi sửa assertion sai. A08 ban đầu dùng ngưỡng width95 px không có nguồn; đã bỏ ngưỡng đó, kiểm đúng vùng bấm44 px và đọc đủ250ký tự. Không tính A07/A08 là lỗi đã sửa.

[Node trước](evidence/revision-03/before/node-tests.txt): A13–A15 FAIL, giữ mã gốc PASS. [A16 trước](evidence/revision-03/baseline-verified/unknown-closed.json) FAIL. Lượt audit đầu bị localhost tắt, không tính là lỗi UI; đã khởi động lại server có sẵn và xác minh lại. Snapshot source trước sửa ở `before/source`; chạy baseline-verified bằng source snapshot trong browser, không rollback working tree. Fixture trang3, quantities lớn, mã dài và22SKU chỉ nằm trong test interception.

## Kiểm chứng sau sửa

- `node scripts/audit_p20_r03.cjs after`: **12/12 nhóm PASS**, gồm 10 lỗi UI/navigation và2nhánh đã đúng. [Kết quả](evidence/revision-03/after/results.json).
- `node scripts/audit_p20_unknown_closed.cjs after`: **1/1 PASS**, cùng requestID, Post count không tăng. [Kết quả](evidence/revision-03/after/unknown-closed.json).
- `node scripts/test_p20_r03.cjs after`: **117/117 PASS**. Có timeout, callback muộn sau retry, cancel nguồn không hỗ trợ abort, cursorcycle, thiếu dữ liệu. [Log](evidence/revision-03/after/node-tests.txt).
- `node scripts/run_p20_r03.cjs scripts/check_p20.cjs`: **7 nhóm PASS**; `check_p20_edges.cjs`: **5 nhóm PASS**; `check_p20_r02_ux.cjs`: **8 nhóm PASS**. [Regression](evidence/revision-03/regression/after/results.json), [edges](evidence/revision-03/regression/edges/results.json), [UX](evidence/revision-03/regression/ux/results.json).
- `check_p20_layout.cjs` qua wrapper r03: **20 tổ hợp panel/viewport PASS**. UX thêm15 tổ hợp tương tác/5viewport (+1dialog reference). [Metrics](evidence/revision-03/regression/layout/metrics.json).
- `check_p19.cjs` qua wrapper r03: **9 nhóm PASS**,20layoutP19. [Results](evidence/revision-03/p19-regression/results.json).
- `check_warranty_navigation.cjs` với evidence dir r03: **11 nhóm PASS**. [Results](evidence/revision-03/p09-navigation/navigation-results.json).
- `check_home_footer_locked.cjs` với evidence dir r03: **4viewport PASS**. [Results](evidence/revision-03/footer/results.json).
- `node --check` history-view/model và Home; `git diff --check`: exit0. Không có package.json gốc nên không bịa build/lint production.

Tổng **53 nhóm browser** (13audit +20P20 +9P19 +11P09), không cộng lẫn số layout/footer vào số nhóm. Test fixture không đồng nghĩa production. Kết quả cuối là results.json; failures/lượt trước được lưu để truy vết.

## Hình thức và phạm vi

[Review r03](REVIEW_03.html) có ảnh trước–sau lỗi tái hiện và4panel hiện tại. Actual494×950 CSSpx, DPR1, zoom100%, local Public Sans, timezone Asia/Ho_Chi_Minh, reduced-motion cho audit. Đã xem ảnh actual expand/collapse/số lượng lớn và nhánh UNKNOWN. Giữ header86px, cardradius12, padding/gap hiện hành; thay đổi chỉ wrap nội dung và vị trí/focus. Nội dung dài vẫn cuộn, không giấu trạng thái để ép vừa khung. Không tự gọi visual PASS/pixel-perfect.

Files: `history-view.mjs`, `history-model.mjs`, `history-experience.mjs`, `history-fixture.mjs`, `history.css` trong `docs/flows/warranty-components`; Home chỉ sửa fallback/no-op cùng route. Test mới: `tests/component-history-r03.test.mjs`, `scripts/audit_p20_r03.cjs`, `audit_p20_unknown_closed.cjs`, `test_p20_r03.cjs`, `run_p20_r03.cjs`. Cập nhật coverage/RUN_STATE không giảm24board/91panel.

**Visual: AWAITING_USER_REVIEW. Behavior: PASS trong phạm vi đã kiểm. Integration: BLOCKED production; thiết bị thật/keyboard ảo NOT_RUN.** Timeout15giây là giới hạn đọc của preview, không thay chính sách backend hay request ghi. Không retry Post, không đổi tồn, không tự đóng case. Dữ liệu preview vẫn trong bộ nhớ trang, reload mất phiếu. Không tuyên bố toàn ứng dụng không còn lỗi hoặc mở rộng sang P21–P24.

