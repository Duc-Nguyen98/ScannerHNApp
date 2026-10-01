# P21 r02 — áp dụng6đề xuất UI/UX

User yêu cầu **Áp dụng đề xuất**: triển khai đủ6cải tiến trong phạm vi P21, giữ P21.S01–S04, frame494×950 và P20r03 tạm chốt. Target prototype; HEAD da9f623a19d0359c3e80c14f8cc612636ec6ab78. [Review trước–sau](REVIEW_02.html), [nguồn trước sửa](REVISION_02_CONTEXT.md).

| Đề xuất | Thực thi và giới hạn |
|---|---|
| 1. Chạm cả thẻ | Một button semantic cho toàn thẻ, feedback hover/pressed/focus; Enter/Space hoạt động. Reader ở ngoài button, không lồng control. Nhớ cuộn/focus theo danh sách và ID; Back giữ đúng phiếu. |
| 2. Context gọn | Gom phiếu/hồ sơ/sản phẩm/trạng thái/thời gian thành card đầu màn S02. Thời gian dùng recent-time chung theo ngày Việt Nam; full date bằng title/aria-label. ID gốc vẫn có reader/dialog, không cắt dữ liệu. |
| 3. Readiness sát CTA | Footer S02 có số mã/tổng linh kiện + Có thể tiếp tục quét chỉ khi đã xác minh và đủ điều kiện. Loading/UNKNOWN/case đóng/quyền bị chặn có lý do, không dùng lời sẵn sàng giả. |
| 4. CTA theo nguyên nhân | Lỗi nguồn đọc/timeout → Tải lại dữ liệu; mã/version không khớp → Hướng dẫn đối chiếu; Post UNKNOWN → Kiểm tra kết quả xuất. readIssue chỉ là classification preview, không phải enum backend. Tải lại không gọi Post. |
| 5. Copy đối chiếu | Trong dialog có Sao chép thông tin đối chiếu; allowlist phiếu/hồ sơ/request/scanSession/version/checkpoint/mã gốc. Thành công chỉ khi clipboard Promise xác nhận; lỗi/timeout giữ text để copy thủ công. Không token/password/auth session. Đóng/Back không copy, không chồng overlay hoặc callback muộn sau rời màn. |
| 6. Marker/receipt | Đánh dấu Vừa tiếp tục đúng ID trong phiên. Đối chiếu live preview POSTED → P20 đúng case/receipt; dùng marker và focus một lần của P20 đã có, kiểm lại receipt từ owner. FixtureB21 vẫn tách biệt, tới kết quảP19 không nhập vào lịch sử live. UNKNOWN giữ phiếu, không tự retry. |

## Kiểm chứng

- `node scripts/run_p21_r02.cjs test_p21.cjs`: **159/159 PASS**, gồm23test P21; [log](evidence/revision-02/regression/after/node-tests.txt).
- `node scripts/check_p21_r02.cjs`: **9/9 nhóm UX PASS**; [kết quả](evidence/revision-02/ux/results.json). Có native click/Enter/Space, reader ngoài thẻ, copy success/fail/cancel/stale callback, read-error vs mismatch, footer closed-case, cuộn/focus danh sách4phiếu, POSTED đúng receipt P20 và tiêu thụ focus marker.
- `node scripts/run_p21_r02.cjs check_p21.cjs`: **9/9 nhóm PASS**, **20 tổ hợp panel/viewport**; [kết quả](evidence/revision-02/regression/after/browser-results.json), [layout](evidence/revision-02/regression/after/layout.json).
- `node scripts/run_p21_r02.cjs check_p21_edges.cjs`: **6/6 nhóm PASS**; [kết quả](evidence/revision-02/regression/edges/results.json). Nhiều phiếu, nội dung Unicode dài, read cancellation/error, Post trả về khi đổi màn, UNKNOWN/not-posted.
- `node scripts/run_p21_r02.cjs regression_p21.cjs check_home_footer_locked.cjs`: **4viewport PASS**; [footer](evidence/revision-02/regression/footer/results.json).
- `node --check` resume-model/view/experience/Home, `git diff --check`: exit0. Không có build production trong repo.

Tổng24nhóm browser, không cộng layout/footer vào số nhóm. Clipboard đã kiểm bằng mock Promise success/reject/pending; clipboard thật và thiết bị thật chưa nghiệm thu. Lượt đầu localhost tắt được giữ log; đã khởi động lại server có sẵn. Không ghi đè evidence r01. Wrapper chỉ cập nhật assertion kết quả live POSTED chuyển sang P20 theo đề xuất6; giữ kiểm receipt/request/closed-case.

## Hình thức và nguồn

Ảnh actual4panel tại [after](evidence/revision-02/after), ảnhr01 tại [before](evidence/revision-02/before); cùng494×950CSSpx, DPR1, zoom100%, local Public Sans, timezone Asia/Ho_Chi_Minh và fixtureB21. Đã xem ảnh context/footer, thẻ focus/marker, nhánh lỗi đọc và dialog copy. Body dài tiếp tục cuộn trong app, không ép ẩn thông tin; chưa có baseline Designer riêng cho copy/read-error, đây là adaptation theo user duyệt triển khai. Header86px/cardradius12px, palette và footer khóa được giữ. Bộ mô phỏng ngoài app giữ tách biệt.

File: `resume-experience.mjs` mới; `resume-view.mjs`, `resume-model.mjs`, `resume.css`; Home thêm callback receipt đã kiểm chứng; `component-resume-experience.test.mjs`, scripts/check và evidence. Không sửa dist/gallery/ảnh baseline, không push/merge/deploy. Chỉ bổ sung phân loại read-error và presentation/navigation, không thêm API/quyền/đổi tồn.

**Visual AWAITING_USER_REVIEW; behavior PASS_PROTOTYPE; integration BLOCKED_PRODUCTION.** P20 tiếp tục tạm chốt; r02P21 chưa được user nghiệm thu hình thức. Preview vẫn giữ dữ liệu trong bộ nhớ trang; reload/logout mất phiếu. Backend checkpoint/status/retention và WMS URL chưa có; source mô phỏng không chứng minh production. P22–P24 full boards chưa hoàn tất.
