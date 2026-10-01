# P17 r02 — sáu nâng cấp UX được user yêu cầu

User đã yêu cầu “Áp dụng đề xuất cho tôi” cho cả sáu đề xuất P16–P17. **Đã triển khai; visual chờ review; behavior PASS prototype; integration production chưa xác minh.** Giữ bốn ID P17, nguyên các panel P16 và24prompt/91panel; không sửa footerLOCK, không Post nhập/xuất, không overwrite NFC hoặc mở khóa gửi lại khi UNKNOWN.

## Thay đổi

1. **Ngữ cảnh phiếu cố định:** S01/S02/S04 có dòng số phiếu + số mã hợp lệ ngay dưới header. Số đếm lấy từ accepted của owner, không tính mã lỗi; thiếu dữ liệu không suy thành0. Dòng dài dùng reader sẵn có.
2. **CTA thực sự khả dụng:** S01 ưu tiên **Nhập mã** khi camera chưa kết nối, nút phụ **Về danh sách mã**; giữ mã gốc. Renderer hỗ trợ lựa chọn theo khả năng camera; các owner hiện không có camera adapter thật nên không tuyên bố camera sẵn sàng và không kích hoạt phần cứng từ fixture.
3. **Trở lại đúng thao tác:** P04/P05 giữ filter, scroll, focus và selection theo documentID khi đóng ngoại lệ. Chọn Nhập mã mở lại ô nhập, chọn toàn bộ mã lỗi để sửa; attempts vẫn giữ raw. NFC Hủy khôi phục vùng đọc, mapping không đổi.
4. **Đối chiếu ba trạng thái:** idle là **Chưa xác định kết quả gửi**; request đang đọc là **Đang kiểm tra kết quả gửi…**; thiếu nguồn status là **Cần đối chiếu trên Web**. Gửi lại vẫn disabled; nút check pending dùng aria-disabled và guard owner để giữ focus mà không gửi trùng. Mục thông tin đối chiếu đang mở được giữ qua repaint.
5. **Sao chép yêu cầu:** trong Thông tin đối chiếu, sao chép whitelist số phiếu/loại/requestID/documentID/scanSession/version. Kiểm phiên, actor, kho, quyền và đúng identity request trước thao tác. Không sao chép dòng hàng, ghi chú, số điện thoại hay token. Thành công dùng dialog Đã hiểu; clipboard bị từ chối dùng dialog Đóng có văn bản để sao chép thủ công. Callback đến sau khi rời màn/đổi request không mở dialog.
6. **Thông báo tiếp cận và focus:** live region bền đọc trạng thái ngắn P16/P17, không đọc lại toàn bộ danh sách. P16 retry mất nút tạm thời thì giữ focus ở vùng danh sách; hoàn tất vẫn ở vị trí đó. Check P17 pending giữ focus nút. Kết quả chỉ thông báo theo receipt của cùng request/phiếu; rời màn xóa thông báo, không phát kết quả cũ cho phiếu mới.

## Source và hình thức

HEAD `da9f623a19d0359c3e80c14f8cc612636ec6ab78`, target prototype `docs/flows`, bộ nguồn/contract trong r01 giữ hiệu lực. [Nguồn trước sửa](REVISION_02_SOURCE_MAP.md), [review trước–sau](REVIEW_02.html).

- Mới `shared/status-announcer.mjs`, `scan-exceptions/experience.mjs`; shared presentation `scan-exceptions/view.mjs/style.css` cập nhật.
- Nối lifecycle tại `inbound/inbound.mjs`, `outbound/outbound.mjs`, `nfc/nfc.mjs`; P16 accessibility tại `documents/documents.mjs` và `data-states/view.mjs`.
- Không đổi state machine flow, fixture adapter nghiệp vụ, request mutation, quyền backend hoặc router Home. Copy guard chỉ dùng quyền preview hiện hành, không tạo permission enum/API mới.
- Context44px tối thiểu, camera S01 giảm vùng minh họa xuống212px để vừa khung. S02 giảm padding/gap card, S04 giảm khoảng cách hero; font16/24 và CTA56px giữ. Đây là adaptation theo yêu cầu, chưa raster sign-off. Nội dung dài vẫn cuộn, không cắt dữ liệu.
- Before được render từ snapshot r01 qua request interception, không thay working copy. After cùng Chromium headless/DPR1/zoom1/Arial; default494×950 cùng360×800,430×932,1440×900,340×420. Bộ before và after đều4panel×5viewport; nhánh copy mới không có baseline Designer riêng.

## Kiểm chứng

- `node --test tests/exception-experience.test.mjs tests/scan-exceptions.test.mjs tests/inbound.test.mjs tests/outbound.test.mjs tests/nfc.test.mjs tests/data-states.test.mjs tests/documents.test.mjs tests/dialog-route.test.mjs`: **122/122 PASS**. [Log](evidence/revision-02/node-tests.txt).
- `node scripts/check_p17_experience.cjs`: **7/7 nhóm UX PASS**: P04/P05 restore, whitelist/copy fallback, focus pending, missing status, callback muộn và P16 live region/focus. [Kết quả](evidence/revision-02/ux/results.json).
- `$env:P17_EVIDENCE_DIR='handoff/P17/evidence/revision-02/regression'; $env:P17_FIT_DEFAULT='1'; node scripts/check_p17.cjs`: **6/6 nhóm P17 PASS**,20capture; kiểm default không overflow nội dung, khung494×950 và CTA nằm trong app. [Kết quả](evidence/revision-02/regression/browser-results.json).
- `node handoff/P17/evidence/revision-02/check-p16.cjs`: **7/7 nhóm P16 UX PASS**, runner dùng suite hiện hành và đổi riêng output. [Kết quả](evidence/revision-02/p16-regression/ux-results.json).
- `$env:HOME_FOOTER_EVIDENCE_DIR='handoff/P17/evidence/revision-02/footer'; node scripts/check_home_footer_locked.cjs`: **4/4 viewport PASS**. [Kết quả](evidence/revision-02/footer/results.json).
- Syntax module và `git diff --check` đạt; diff-check Git không đại diện toàn bộ source prototype untracked nên lưu [patch](evidence/revision-02/changes.patch) và [manifest](evidence/revision-02/manifest.json). Không pageerror trong các suite hoàn tất.

Đã xem actual S01/S02/S04, dialog clipboard lỗi và các trạng thái mới. Kiểm tra phát hiện Chromium làm blur nút clipboard khi disabled; đã đặt lại trigger trước mở dialog và test Escape trả focus đạt. Log/capture lỗi trung gian giữ riêng diagnostics, không thay kết quả chạy cuối.

## Giới hạn và cách thử

Hình thức mới **chờ user review**. Clipboard success/failure được kiểm bằng adapter test trình duyệt; chưa xác minh clipboard trên thiết bị triển khai. Semantics live-region/focus đã kiểm DOM/keyboard; chưa có buổi test bằng screen reader thật. Camera/NFC và WMS/status/permission production vẫn chưa xác minh. Các khác biệt asset/fixture của r01 giữ nguyên. Không push/merge/deploy.

Preview: đăng nhập `minhanh / preview`. Nhập kho → quét/nhập mã lỗi để xem CTA và ngữ cảnh; gửi với kịch bản Timeout để mở S04, mở **Thông tin đối chiếu → Sao chép thông tin yêu cầu**. Chọn **Thiếu nguồn tra trạng thái** trong bộ kiểm tra ngoài app để xem nhánh cần đối chiếu Web. P16 vào **Chứng từ** và dùng bộ chọn dữ liệu ngoài app như r02 hiện hành.
