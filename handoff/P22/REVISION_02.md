# P22 r02 — áp dụng sáu nâng cấp UI/UX

Đã áp dụng cả6đề xuất theo yêu cầu user. **Visual AWAITING_USER_REVIEW; behavior PASS_PROTOTYPE; integration BLOCKED_PRODUCTION.** Giữ4panel, S01 MIGRATED theo chốt trước, Home Xem tất cả→P12, hub6/no shortcut phiếu dở, khung494×950 và footerLOCK. P21 r03 vẫn tạm chốt, state đồng bộ bổ sung sau.

[Review trước–sau](REVIEW_02.html) · [Nguồn/quyết định trước sửa](REVISION_02_CONTEXT.md) · [Số đo cùng điều kiện](evidence/revision-02/comparison-metrics.json).

| Nâng cấp | Kết quả |
|---|---|
| Controls gọn | Search50, tabs44, ngày/count/tải lại chung hàng; dock303→206px, vùng list480→577px (**+97px**), thấy3thẻ đầy đủ thay vì2 ở494×950/DPR1. Nhãn phụ12–14px, nút/reader tối thiểu44px theo kiểm layout. |
| Xóa riêng | × từ khóa giữ DOM/input và các điều kiện khác; chip ngày/status/type bỏ riêng; empty có Xóa từ khóa/Điều chỉnh bộ lọc. Apply mới commit picker. |
| Thẻ dễ đọc | Loại + trạng thái, UID/serial có nhãn, giờ/actor ở hàng cuối. “Vừa xem” theo đúng event ID khi Back, giữ focus/cuộn. |
| Thay thẻ | Nhóm Thẻ trước→Thẻ thay thế, reason ngay dưới nếu nguồn có; Thông tin đối chiếu mở rộng theo event trong phiên. Không suy UID cũ khi nguồn thiếu. |
| Sao chép | UID/serial/gói allowlist raw string; giữ newline/Unicode; lỗi cho đọc/chọn mã nguyên vẹn trong dialog. Chặn trùng, không báo phản hồi cũ sau điều hướng/đổi scope/data hoặc chồng overlay. |
| Tải lại | Sẵn có trên list đã có dữ liệu. Giữ kết quả cùng nguồn, bộ lọc, input/IME, scroll anchor theo event và focus. Khi đọc lỗi/chưa khả dụng ghi rõ “kết quả lần đọc trước”; nguồn rỗng đã xác nhận mới thay cache bằng rỗng. Không bịa timestamp cập nhật. |

## Kiểm chứng

- `node scripts/run_p22_r02.cjs test_p22.cjs`: **83/83 logic PASS** (14test mới, tổng27P22); [log](evidence/revision-02/regression/logic/node-tests.txt).
- `node scripts/check_p22_r02.cjs`: **9/9 nhóm UX**, [kết quả](evidence/revision-02/ux/results.json); 10 tổ hợp long list/detail×5viewport tại [layout](evidence/revision-02/ux/layout.json). Bao gồm chip độc lập, marker, clipboard success/failure/late/duplicate, reload lỗi/khôi phục, focus, IME và picker trong lúc đang đọc.
- `node scripts/run_p22_r02.cjs check_p22.cjs`: **7/7 nhóm hồi quy**, đủ20panel×viewport; [kết quả](evidence/revision-02/regression/after/results.json), [layout](evidence/revision-02/regression/after/layout.json).
- `node scripts/run_p22_r02.cjs check_p22_edges.cjs`: **8/8 nhóm hồi quy**; HomeP12, date bounds, timeout15s, các owner hub, legacy ID, scope login; [kết quả](evidence/revision-02/regression/edges/results.json).
- Tổng **24 nhóm trình duyệt** (không cộng layout vào số nhóm); không pageerror trong lượt đạt. Clipboard được stub có kiểm payload, **không chứng minh clipboard thiết bị thật**.
- `$env:HOME_FOOTER_EVIDENCE_DIR='handoff/P22/evidence/revision-02/footer'; node scripts/check_home_footer_locked.cjs`: **4viewport PASS**, [kết quả](evidence/revision-02/footer/results.json).
- `node scripts/measure_p22_r02.cjs`: before/after cùng494×950/DPR1/source fixture. Before dùng snapshot source r01 được lưu trước sửa qua route interception chỉ trong test, không thay source app/baseline. R02 fontlocal, zoom mặc định. Viewport kiểm494×950/360×800/430×932/1440×900/340×420.
- `node --check` module view/experience và `git diff --check`: exit0. Không có package build production ở target prototype.

Trong kiểm UX phát hiện specificity CSS chung làm reader thấp hơn44px: đã sửa selector cục bộ P22, kiểm lại long-layout đạt. Một lượt harness gặp selector dialog chưa phân biệt open/closed: đã sửa harness; failure cũ giữ trong thư mục UX để truy vết, `results.json` là lượt cuối đạt. Không lấy số test để tự nghiệm thu hình thức.

## Source / bàn giao

Baseline/HEAD `da9f623a19d0359c3e80c14f8cc612636ec6ab78`; target `prototype`, workspace ScannerHNApp hiện tại. File app sửa chỉ `docs/flows/history/nfc-audit-view.mjs`, `nfc-audit.css`; thêm `nfc-audit-experience.mjs`. Không sửa owner P07/P19–P21 hoặc schema backend. Tái dùng historyControls/picker và actionFeedback/readable; không thay shared implementation. Tests/scripts: nfc-audit-experience.test.mjs, check_p22_r02.cjs, run_p22_r02.cjs, measure_p22_r02.cjs. Coverage/RUN_STATE/UI_STANDARD cập nhật theo revision; giữ đủ91ID.

Ảnh r01 S01–S04/source được lưu tại `evidence/revision-02/before`. After đủ4panel và nhánh chips/UIDreplacement/copy/cacheerror/longtext. Đã xem trực quan ảnh compact, replacement, chips, cached-error, copy-error và các panel r01; user vẫn cần review adaptation r02. Khoảng trắng nguồn-read được giữ để trạng thái ngắn không đẩy bố cục; status là trạng thái nguồn, không phải toast kết quả thao tác.

Backend audit source, mapping/quyền/cursor và hardware/lưu bền chưa xác minh; không gọi endpoint DEV_PROPOSAL. Dữ liệu preview trong bộ nhớ, reload/logout mất. Không suy current tag thành lịch sử, không ghi thẻ/đổi tồn, không push/merge/deploy, không sửa dist/gallery hoặc baseline. P23/P24 full boards chưa hoàn tất.

Preview: `http://localhost:8766/flows/auth-session/?v=p22-r02`, `minhanh / preview` → Lịch sử→NFC→ngoài khung app chọn Mẫu B22. Default unavailable giữ nguyên. Bộ mô phỏng thêm “Lần tải lại” để thử lỗi/chậm mà không đổi dataset, tách khỏi “Nguồn xem thử”.
