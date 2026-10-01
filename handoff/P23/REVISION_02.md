# P23 r02 — nâng cấp UI/UX
Ngày 30/09/2026 · Contract v2.0 · baseline da9f623a19d0359c3e80c14f8cc612636ec6ab78.

## Kết quả
Đã áp dụng sáu đề xuất user yêu cầu; giữ P23.S01–S04, khung 494×950 CSS px và footer Home/P03. Hành vi prototype đạt; hình thức **AWAITING_USER_REVIEW**; integration **BLOCKED_PRODUCTION**. P22 r03 vẫn tạm chốt, state đồng bộ bổ sung sau.

| Nâng cấp | Hành vi đã triển khai |
|---|---|
| Controls gọn | Xóa từ khóa riêng; Xóa bộ lọc giữ từ khóa và chỉ hiện khi có điều kiện; ngày/count cùng hàng, count ghi rõ số đã tải. |
| Card dễ đọc | Phân cấp trạng thái/nghiệp vụ/mã; “Vừa xem” theo ID và riêng từng danh sách; Back giữ cuộn/focus. |
| Timeline | Gom giờ/người thao tác; “Sự kiện mới nhất” chỉ khi tất cả timestamp hợp lệ và không hòa mốc mới nhất; không suy trạng thái hồ sơ từ event. |
| Ý nghĩa thống kê | Tách trạng thái phiên với kết quả chứng từ; nhãn hợp lệ theo nghiệp vụ; duplicate riêng; thiếu dữ liệu không thành 0. |
| Liên kết liên quan | Chỉ mở hồ sơ theo ID thật; receipt phải có liên kết explicit, POSTED, đúng case/kho và được owner kiểm lại khi bấm. |
| Tải lại | Chuyển về dock/toolbar chi tiết; footer chỉ Back; giữ cache/cuộn/focus khi tải lại và khi lỗi nguồn đọc. |

## Nguồn và giới hạn thiết kế
Bảng nguồn/quyết định trước sửa: [REVISION_02_CONTEXT.md](REVISION_02_CONTEXT.md). Baseline: [B23.png](evidence/revision-01/baseline/B23.png), SHA256 DDF7AE5493B7932184808EEF684B9406D2CEA88C074D7D8D64CFE7D298F97F09.
Ảnh actual trước–sau cùng viewport 494×950, DPR1, múi giờ Việt Nam, fixture B23: [REVIEW_02.html](REVIEW_02.html). Baseline gốc không sửa; bố cục r02 và nhánh liên kết là adaptation được phép triển khai, chưa được user nghiệm thu. Không dùng số test làm bằng chứng khớp raster Designer.

## Kiểm chứng
- 141/141 test logic, gồm 29 test P23 (19 có sẵn + 10 mới).
- 49 nhóm trình duyệt: P23 chính 9, cạnh biên 7, UX mới 8; hồi quy P22 7, P20 7, P09 11.
- 40 tổ hợp layout P23: 20 cơ bản + 10 nội dung dài + 10 controls/liên kết. Đây là kiểm geometry, không phải thêm 40 nhóm hành vi.
- Footer Home/P03: 4 viewport đạt; không đổi styles footer đã khóa.
- Nội dung dài, IME, picker, stale response, Back/focus, cache, missing/unknown ID và guard receipt được kiểm bằng fixture.
- Evidence tại `evidence/revision-02/`: `ux/results.json`, `regression/after/results.json`, `regression/edges/results.json`, `regression/{p22,p20,p09,footer}/`, `regression/logic.txt`.

Các lệnh tái lập:
```text
node scripts/run_p23_r02.cjs logic
node scripts/run_p23_r02.cjs check_p23.cjs
node scripts/run_p23_r02.cjs check_p23_edges.cjs
node scripts/check_p23_r02.cjs
node scripts/run_p23_r02.cjs check_p22.cjs
node scripts/run_p23_r02.cjs check_p20.cjs
node scripts/run_p23_r02.cjs check_warranty_navigation.cjs
node scripts/run_p23_r02.cjs check_home_footer_locked.cjs
node scripts/verify_p23_r02.cjs
```

## Phạm vi mã
Adapter P23: `warranty-session-view.mjs`, `warranty-session.css`, helper mới `warranty-session-experience.mjs`. Model/fixture thêm tham chiếu nội bộ `linkedReceiptId`, không phải contract backend. Home truyền nguồn owner và guard đích; P20 thêm `focusLinkedReceipt` chỉ focus receipt đã tải đúng ID, không gắn nhãn “Phiếu vừa xuất” hay tự phân trang. Shared primitives không đổi.

## Chưa xác minh
Nguồn production/schema phiên quét, phân quyền server, cursor/retention, thiết bị thật và lưu bền chưa xác minh. Nguồn phiên quét mặc định unavailable; B23 opt-in ở bộ mô phỏng ngoài app. Không dùng auth session hoặc tự gom scan thành phiên. Chỉ preview scope Hoa Nam được liên kết; không suy từ mã hiển thị. Giữ UNKNOWN đối chiếu trước retry; timeout 15 giây chỉ nguồn đọc preview, không áp vào Post. Reload/đăng xuất mất dữ liệu bộ nhớ. P24 chưa hoàn tất. Không push/merge/deploy; không sửa dist/gallery.

## Review
[Preview P23 r02](http://localhost:8766/flows/auth-session/?v=p23-r02): `minhanh / preview` → xác nhận phiên → Lịch sử → Bảo hành hoặc Phiên quét; chọn **Mẫu B23** ngoài khung app.
Tiếp theo: user review hình thức r02; giữ riêng visual/behavior/integration.
