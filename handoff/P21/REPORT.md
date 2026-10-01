# P21 r01 — Tiếp tục phiếu linh kiện

Đã triển khai **P21.S01–S04** trong preview có đăng nhập, nối owner P19 và đường tiếp tục tại Home/P09/P20. P20 r03 được user **tạm chốt trong yêu cầu P21 ngày29/09/2026**, các state đồng bộ bổ sung sau. P21 r01 **chờ user review hình thức**.

## Nguồn và phạm vi

- Repo ScannerHNApp; HEAD `da9f623a19d0359c3e80c14f8cc612636ec6ab78`; target_kind=`prototype`. Working copy có công việc các chat trước, giữ nguyên phần ngoài phạm vi. Không có package.json gốc để chạy build/lint production.
- Đã đọc P21_Tiep_tuc_phieu_linh_kien.md, BOARD_INDEX, Contract2.0, AGENTS/UI_STANDARD, HANDOFF và DEV_PROPOSAL. Proposal không được dùng làm API đã duyệt.
- [Bảng nguồn/số đo trước sửa](DESIGN_TRACE.md). [B21 nguyên gốc](evidence/revision-01/reference/B21.png), SHA256 `2615F46A810AE54EEC0E45C209D2DAD236F52457F7C3DEF57E2B2D576BAE1D0B`, khớp tệp user cung cấp; không chỉnh ảnh.
- [Review có baseline, nguồn trước và actual](REVIEW.html). Header86px, frame494×950 CSSpx, nội dung cuộn trong app; footer Home/P03 không đổi. Icon nghiệp vụ dùng palette chung; warning/verification dùng màu trạng thái riêng.

## Coverage

| Panel | Kết quả triển khai | Evidence |
|---|---|---|
| P21.S01 | Danh sách nhiều phiếu từ owner đúng actor/kho/phiên; count đúng dữ liệu; phiếu POSTED không còn là draft; mở bằng documentId | [Actual](evidence/revision-01/after/P21-S01-494x950.png), [2 phiếu](evidence/revision-01/edges/two-drafts.png) |
| P21.S02 | Đọc lại checkpoint từ adapter mô phỏng độc lập; kiểm khớp document/version/lines/case version/scan session trước tick và mở scan; dòng recorded khóa trong P21 và P19 | [Actual](evidence/revision-01/after/P21-S02-494x950.png) |
| P21.S03 | UNKNOWN mã/version conflict/lỗi đọc giữ dữ liệu, chặn mutation; hướng dẫn Web bằng text HANDOFF; không URL WMS giả; tải lại chỉ đọc | [Actual](evidence/revision-01/after/P21-S03-494x950.png), [reader](evidence/revision-01/edges/long-reader.png) |
| P21.S04 | Check đúng request owner; UNKNOWN ở lại; POSTED khớp mới mở kết quả P19; xác minh chưa Post giữ request/version và quay về bước kiểm tra, không auto-retry | [Actual](evidence/revision-01/after/P21-S04-494x950.png), [kết quả](evidence/revision-01/after/A04-confirmed.png) |

Disposition của cả4panel là CURRENT; không bỏ/gộp/đổi ID. `SCREEN_COVERAGE.csv` vẫn đủ24prompt/91panel.

## Nghiệm thu hành vi

- **P21.A01 PASS_PROTOTYPE:** đóng/mở màn giữ cùng owner/document/version/lines/scan session/checkpoint, không create lại. Nhiều draft độc lập; Home/P09/P20 chọn đúng ID. Đây là đóng/mở màn trong phiên, không phải đóng trình duyệt/reload.
- **P21.A02 PASS_PROTOTYPE:** recorded không có action xóa/sửa; handler P19 từ chối rescan/remove của dòng recorded; review giữ đúng dữ liệu.
- **P21.A03 PASS_PROTOTYPE:** mã chưa xác minh/version conflict không mở scan/Post kể cả deep link P19; định danh và mã được giữ, reader/dialog đọc đầy đủ. Lỗi đọc không được coi là danh sách rỗng.
- **P21.A04 PASS_PROTOTYPE:** timeout sau khi fixture commit → chỉ check cùng request → đúng một receipt/commit; chưa rõ vẫn khóa. Post hoàn tất khi chuyển sang P21 cập nhật UI qua subscription. Xác minh chưa Post không gửi lại tự động.
- **P21.A05 PASS_PROTOTYPE:** đổi actor/quyền/kho/auth session/hết phiên bị chặn; case đóng không quét/Post nhưng vẫn đối chiếu UNKNOWN cũ. Không serialize password/token vào checkpoint/evidence. Case version lệch không ghi đè.
- Hủy nguồn đọc khi Back/đổi màn, bỏ response muộn; timeout15giây chỉ cho checkpoint preview read, không áp vào Post. Nút tối thiểu44CSSpx, dialog trong app không backdrop-dismiss, Escape/Back/Tab/focus; nội dung dài giữ nguyên Unicode/HTML dạng text.

## Lệnh đã chạy và kết quả

| Lệnh | Kết quả/bằng chứng |
|---|---|
| `node scripts/test_p21.cjs` | **156/156 PASS**, gồm20test P21 và hồi quy owner/domain; [log](evidence/revision-01/after/node-tests.txt) |
| `node scripts/check_p21.cjs` | **9/9 nhóm PASS**; [results](evidence/revision-01/after/browser-results.json); **20 panel/viewport** [layout](evidence/revision-01/after/layout.json) |
| `node scripts/check_p21_edges.cjs` | **6/6 nhóm PASS**; [results](evidence/revision-01/edges/results.json) |
| `node scripts/regression_p21.cjs check_p19.cjs` | **9/9 nhóm PASS**,20layoutP19; [results](evidence/revision-01/p19-regression/results.json) |
| `node scripts/regression_p21.cjs check_p20.cjs` | **7/7 nhóm PASS**; [results](evidence/revision-01/p20-regression/after/results.json) |
| `node scripts/regression_p21.cjs check_p20_edges.cjs` | **5/5 nhóm PASS**; [results](evidence/revision-01/p20-regression/edges/results.json) |
| `node scripts/regression_p21.cjs check_warranty_navigation.cjs` | **11/11 nhóm PASS**; [results](evidence/revision-01/p09-regression/navigation-results.json) |
| `node scripts/regression_p21.cjs check_home_footer_locked.cjs` | **4viewport PASS**, footer Home/P03; [results](evidence/revision-01/footer/results.json) |
| `node --check` moduleP21/P19/Home; `git diff --check` | exit0 |

Tổng **47 nhóm browser**, không cộng layout/footer vào số nhóm. Wrapper ghi evidence mới vào P21, không đè báo cáo cũ; chỉ thích nghi assertion tiếp tục từ P20 qua P21 trước khi về P19. Các lỗi lượt đầu được giữ trong failure.json để truy vết: selector test bắt cả dialog ẩn, test đếm nút reader ẩn; đã sửa bộ kiểm. Kiểm nhánh lặp cùng fixture phát hiện owner cũ bị giữ khi URL không đổi, đã sửa và kiểm lại. Lượt server ngừng phục vụ/Chromium bị sandbox chặn không tính lỗi ứng dụng.

Capture: viewport494×950CSSpx, DPR1, zoom100%, Public Sans local, timezone Asia/Ho_Chi_Minh, reduced-motion. Fixture B21 dùng thời gian nguồn10/09/2026 14:42; phiếu thật trong preview lấy thời gian hiện tại. Nguồn trước ở `before/*.png` chạy cùng browser viewport nhưng khung source cũ390px; không resize méo hoặc giả pixel-diff với frame494px đã được user khóa. Đã xem ảnh actual bốn panel, trước–sau cấu trúc và nhánh lỗi/reader. Số layout PASS không chứng minh Designer/user đã nghiệm thu.

## File và điểm nối

- Mới: `docs/flows/warranty-components/resume-model.mjs`, `resume-view.mjs`, `resume.css`; `tests/component-resume.test.mjs`; scripts kiểmP21/hồi quy, handoff/evidence.
- Sửa dependency: `issue-model.mjs` thêm guard/checkpoint wrapper hook, `issue-view.mjs` giữ một owner và fixtureP21 riêng; `home/home.mjs`, `home/home-flow.mjs` route/shortcut/lifecycle; `auth-session/index.html` stylesheet; UI_STANDARD và coverage/RUN_STATE.
- P03 callback có context phiếu bảo hành chỉ chuyển P21 khi khớp owner/session/version; context không khớp bị chặn, không cấp phiếu mới. **Nguồn draft riêng của P03 hiện chỉ là fixture nhập kho**, không được tự đổi thành phiếu linh kiện. Kiểm toàn luồng P03 với nguồn phiếu linh kiện production còn BLOCKED; không tuyên bố đã tích hợp backend.
- P22 hub có quyết định user trước đó bỏ shortcut/notice: giữ nguyên, không tự thêm lại. P21 có CTA về hub Lịch sử; P22 full board vẫn pending. P14 tiếp tục chặn kết thúc ca khi còn draft/UNKNOWN vì chưa có lưu bền.

## Khác biệt cần review và giới hạn

- Adaptation từ B21 sang khung494×950 đã khóa; không vẽ statusbar/home indicator giả. Icon linh kiện đổi sang pastel nghiệp vụ bảo hành theo chuẩn user; hai CTA chính mỗi panel giữ hierarchy.
- S01 mở phiếu bằng nút Tiếp tục rõ ràng trong card để reader nằm ngoài action, không lồng button. Copy dùng “đang giữ/giữ lúc” ở dữ liệu page-memory để không hứa đã lưu WMS. Có đường xem định danh đối chiếu; action tải lại chỉ đọc ở vùng cuộn S03. Đây là lựa chọn triển khai chờ review.
- **Visual AWAITING_USER_REVIEW; behavior PASS_PROTOTYPE; integration BLOCKED_PRODUCTION.** API nguồn checkpoint/phiếu/version/status, cơ chế lưu bền qua reload/logout và URL Web chưa xác minh; camera/NFC/keyboard ảo thiết bị thật NOT_RUN. Không tự định nghĩa endpoint hay chính sách backend.
- Preview chỉ giữ trong bộ nhớ trang/phiên; **reload hoặc logout làm mất phiếu**. Chưa có bằng chứng nguồn thật nên các tick trong kịch bản là xác minh fixture, không xác minh WMS. Bộ mô phỏng ghi rõ ngoài khung app.

Mở [preview](http://localhost:8766/flows/auth-session/?v=p21-r01), đăng nhập `minhanh / preview` → Bắt đầu ca → mở bộ mô phỏng **P21 · Tiếp tục phiếu linh kiện** ngoài khung app để xem4panel. Luồng sử dụng: P09/P20 → xuất/quét → quay lại → P21; Home hiện phiếu linh kiện đang làm. Không push/merge/deploy; không sửa dist/gallery/baseline.
