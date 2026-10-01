> Bản hiện hành: [P19 r03 — rà soát và sửa16 ca lỗi](REVISION_03.md) · [Review](REVIEW_03.html).

> Bản hiện hành: [P19 r02 — sáu nâng cấp UX](REVISION_02.md) · [Review trước–sau](REVIEW_02.html). Báo cáo r01 bên dưới là lịch sử.

# P19 r01 — Xuất linh kiện bảo hành

Đã triển khai **P19.S01–S04** trong app preview: quét/nhập mã → số lượng hộp → kiểm tra → kết quả xuất. **Visual: chờ user review. Behavior: PASS prototype trong phạm vi kiểm tra. Integration: BLOCKED production.** P18 r03 đã được user tạm chốt ngày 2026-09-29; state bổ sung để sau.

## Nguồn và phạm vi

- HEAD/baseline `da9f623a19d0359c3e80c14f8cc612636ec6ab78`; HTML/CSS/JS editable, không có package.json/build app ở gốc. Preview hiện hữu: `http://localhost:8766/flows/auth-session/`.
- Đọc prompt P19, Contract2.0, BOARD_INDEX, B19, AGENTS/UI_STANDARD, HANDOFF và DEV_PROPOSAL. Proposal chưa phải API được duyệt.
- B19 Git blob `584d2f160e97af003f7d6a175a660f7dd9893710`, trùng baseline; SHA256 `8add85c191c4ac872a00eab66d3461308aa7c78bcff22a5980bf6091ef94cfef`.
- [Nguồn và số đo](CONTEXT.md), [review hình ảnh](REVIEW.html), [acceptance](STATE_ACCEPTANCE.csv), [manifest file](evidence/revision-01/manifest.json).

## Kết quả

Giữ khung494×950, stepper, context hồ sơ, sheet số lượng và footer tổng/CTA. Icon lấy source có sẵn, màu nghiệp vụ theo palette chung; dialog trong app quản lý Back/Escape/focus, backdrop không đóng. Dữ liệu dài đọc đầy đủ qua component chung. Form số lượng không Post, hủy không sửa danh sách; tem đơn luôn1, hộp nhận số nguyên dương và kiểm tồn. Hai mã cho tổng3 linh kiện.

Post kiểm lại phiên/quyền/kho/case/tồn; chống gửi trùng. Chỉ receipt POSTED khớp yêu cầu mới mở S04. Timeout giữ document/request/version/scan-session, khóa ghi và đối chiếu trước retry. Phiếu đã xác nhận được P09 và phần linh kiện P18 đọc đúng case, dedup theo receipt ID. Phiếu mới có ID riêng; Back mở receipt cũ giữ nguyên. P14 chặn kết thúc ca khi P19 còn dở; P10 chặn đăng xuất chủ động lúc UNKNOWN/busy để tránh mất yêu cầu. Nháp thường cảnh báo trước mất bản nhập.

## Bằng chứng đã chạy

- **100/100 test Node**: P19 và owner/dependency liên quan; [log](evidence/revision-01/node-tests.txt).
- **9 nhóm browser chính + 8 nhóm edge**: A01–A05, IME, focus/Back, guard, P09/P14/P18, retry đúng yêu cầu và logout; [chính](evidence/revision-01/after/results.json), [edge](evidence/revision-01/edges/results.json).
- **20 tổ hợp layout**: bốn panel tại494×950,360×800,430×932,1440×900,340×420; short fixture vừa vùng cuộn, không tràn ngang; footer trong khung. DPR1, Chromium, zoom100%, local Public Sans, reduced motion.
- **11 nhóm hồi quy P09**, **3 nhóm logout P18**, **4 viewport footer Home/P03**: [P09](evidence/revision-01/p09-regression/navigation-results.json), [P18](evidence/revision-01/p18-logout-regression/results.json), [footer](evidence/revision-01/footer/results.json). Không thay stylesheet footerLOCK.
- Đã xem trực quan ảnh cuối cả4 panel. Không đặt ngưỡng pixel diff hoặc tự nghiệm thu visual. Hai lỗi locator của runner edge đã sửa (selector bắt dialog/reader ẩn ngoài P19); log lần cuối là kết quả có hiệu lực.

## Khác biệt và giới hạn

- Ảnh `bg_shelf_detail_4k_enhanced.jpg` được prototype tham chiếu nhưng thiếu trong checkout. Dùng `bg_warehouse_main_4k_enhanced.jpg` đã có trong approved pack; camera/đèn chưa kết nối. Không tải asset bên ngoài.
- XLK-0002 đã là receipt seed P09. Phiếu tương tác mới dùng `XLK-DEMO-…`, không ghi đè seed. Tồn1/12 của P19 là nguồn mô phỏng riêng; không coi số này là tồn P06/WMS hoặc kiểm chứng tính nhất quán lịch sử seed.
- Công cụ B19 nằm ngoài app, dùng instance riêng và receipt mô phỏng; không thêm vào lịch sử owner. URL success không tự cấp receipt.
- Chưa có contract/API production create/validate/Post/status/idempotency/stock-refetch. P20 đầy đủ, P21 lưu bền/khôi phục qua đăng nhập, P24 toàn board vẫn chờ triển khai. Mã đã ghi nhận được khóa bằng model, chưa tuyên bố P21 tích hợp xong.
- Dữ liệu chỉ giữ trong bộ nhớ trang. Reload/reset xóa fixture. Hết phiên không cấp quyền mới; khác actor/kho/phiên bị guard. Không có kiểm thử thiết bị/camera/WMS thật.

## File thay đổi

Module mới: `docs/flows/warranty-components/issue-{model,fixture,view,icons}.mjs`, `issue.css`. Điểm nối: auth-session/index.html, home/home-flow.mjs + home.mjs, warranty/warranty.mjs, attachments/view.mjs, profile/profile.mjs, recovery-shift/model.mjs + presentation.mjs. Test: `tests/component-issue.test.mjs`, `scripts/check_p19*.cjs`, `capture_p19_before.cjs`.

Giữ nguyên công việc có sẵn trong warranty-components/flow.js và index.html. Không sửa gallery/dist hoặc ảnh baseline; không push/merge/deploy. Coverage vẫn đủ24 prompt/91 panel, giữ toàn bộ ID.

## Cách review

Đăng nhập `minhanh / preview` → Bảo hành → BH-001 → tab **Linh kiện** → **Xuất linh kiện**. Hoặc mở bộ mô phỏng **P19** bên ngoài khung app để xem từng panel. Nhập `LK0001-HN001`, rồi `BOX-LK-0002-01` và số lượng2. Reload trước để lấy source mới và reset fixture.
