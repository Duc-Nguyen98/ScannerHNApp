# P08 r22 — nâng cấp thao tác sáu trang Lịch sử

Ngày29/09/2026. User duyệt áp dụng đề xuất UX trong chat; không suy ra user đã nghiệm thu hình thức của bản render mới.

## Đã triển khai

1. **Nhớ riêng từng trang trong phiên:** Lịch sử chung, Hoạt động theo ngày, Nhập/Xuất, NFC, Bảo hành, Phiên quét. Giữ query, ngày, trạng thái, nghiệp vụ, sort, số hàng đã tải và vị trí cuộn khi mở lại từ hub. Back dùng entry gốc. Nhánh drilldown từ Tổng quan không ghi đè context Lịch sử chung. Cache thuộc controller của phiên, không storage lâu dài; đăng xuất/login mới trở về mặc định.
2. **Dấu bộ lọc hoạt động:** chấm nhỏ trên nút khi có ngày hoặc trạng thái; aria-label nêu đang áp dụng. Ngày/trạng thái đang dùng vẫn hiển thị rõ ở controls hiện có. Loại nghiệp vụ/search có dấu hiệu riêng nên không cộng vào chấm ngày/trạng thái.
3. **Khoảng ngày nhanh:** Hôm nay,7ngày,30ngày,90ngày. N ngày bao gồm hôm nay và N−1 ngày trước, theo giờ Việt Nam tại thời điểm bấm. Chọn nhanh chỉ đổi bản nháp, giữ status; Apply mới commit, Hủy/Escape/Back không đổi lọc đã áp dụng. Nhãn được chọn có nền/viền nhẹ và aria-pressed. Ngày thứ90 tính lùi theo policy cũ vẫn được chọn thủ công; không đổi giới hạn today−90..today.
4. **Hôm nay trong lịch con không đổi:** chỉ về tháng hiện tại, không chọn ngày và không sửa endpoint khác. Reset vẫn đặt cả hai ô về ngày hiện tại và status All. Validation khoảng đảo ngược/ngày ngoài giới hạn vẫn dùng logic chung.
5. **Rỗng/lỗi có hướng xử lý:** không khớp có Bỏ điều kiện lọc (giữ nghiệp vụ/scope/sort); nguồn rỗng có Làm mới; lỗi/chưa khả dụng có Thử lại, giữ bộ lọc. Tổng quan thiếu coverage không bị biến thành0; có Đổi bộ lọc.
6. **Vùng chạm và focus:** bổ sung min44px CSS cho nút nhỏ trong phạm vi P08; card vẫn bấm toàn hàng. Mở picker focus heading, không tự bật input/bàn phím. Header/footer dialog cố định, body cuộn. Không đổi footer LOCK.
7. **Phản hồi thao tác:** dùng dialog kết quả chung đã có; khóa nút sao chép trong lúc pending và chặn gọi lặp. Không thêm banner/toast làm nhảy bố cục hoặc dialog thừa sau mỗi lần lọc.

## Phạm vi / thiết kế

- Bảng truy xuất nguồn trước sửa: REVISION_22_SCOPE.md. Before/after cùng494×1000,DPR1,ngày29/09/2026,nguồn mặc định.
- Giữ palette/icon nghiệp vụ và card/status hiện có. Quick ranges grid2×2, chấm lọc, copy/button44px và empty state là adaptation theo yêu cầu; cần user review hình thức.
- P12/P13 dùng chung controls/picker: quickRanges là opt-in; không tự áp dụng thay đổi UX ngoài sáu trang Lịch sử. Đã kiểm caller P12 còn picker cũ và có Apply.
- Chỉ đọc dữ liệu lịch sử; không đổi dữ liệu, API, quyền, ID panel, baseline hoặc current_prompt của công việc khác. Không push/merge/deploy.

## Kiểm chứng cuối

### Behavior

- Node30/30: history*.test.mjs, business-history, query-date-policy, ui-operation-standard.
- check_history_ux_r22.cjs14/14: sáu trang presets/Cancel/Apply/indicator, Today/giờ VN/Back, sáu context/scroll độc lập, drilldown không ghi đè, P12 opt-out, empty/error recovery, sáu viewport, copy chống lặp + feedback Back, logout xóa context.
- check_history_search_stability.cjs6/6: identity/focus input, composition mô phỏng, kết quả live, empty/reset và Back giữ query trên cả sáu trang.
- Cả hai bộ browser cuối không có pageerror. Syntax check history/history-picker PASS.

### Visual

- 12 ảnh before và12 ảnh after-final tại cùng điều kiện. Đã trực tiếp xem Lịch sử chung, bộ lọc, dấu lọc đang bật và không có kết quả.
- Dialog kiểm6viewport:494×1000,360×800,430×932,1440×900,340×420,1869×940; footer trong dialog ở cả đầu/cuối body scroll; không tràn ngang; focus trap; nút mới44px CSS.
- Đây là kiểm bố cục và review actual, không phải pixel-perfect hoặc user visual acceptance. Bàn phím mềm/IME thiết bị thật chưa được kiểm; thu nhỏ viewport không thay thế kiểm tra thiết bị thật.

### Integration

Không thực hiện kiểm backend/NFC thật. Các thông số kiểm thử phản ánh source tại thời điểm chạy, không chứng nhận các module đang được chat khác chỉnh.

## Evidence / lỗi kiểm thử giữ lại

- `evidence/revision-22/verified/results.json`:14/14 cuối.
- `evidence/revision-22/search-regression/results.json`:6/6 cuối.
- `evidence/revision-22/before/` và `after-final/`: ảnh đối chiếu.
- `checks/failure.json`: selector hn-action-dialog khớp cả dialog tên Home đang đóng; đã scope dialog[open].
- `checks-final/failure.json`: selector P12 filter khớp cả nút phễu lẫn thanh ngày; đã chọn nút phễu đầu tiên. Không nới assertion ứng dụng để vượt test.
- Các evidence lỗi và ảnh after trung gian giữ nguyên, không dùng làm kết quả cuối.

## File / checkpoint

Sửa history.mjs, history-controls.mjs, history-picker.mjs, embedded-history.mjs, style.css; thêm history-ux.mjs, tests/history-ux.test.mjs và scripts capture/check r22. Giữ coverage24board/91baseline IDs và trạng thái nghiệm thu cũ; không thêm panel. RUN_STATE thêm checkpoint riêng P08, không ghi đè current_prompt của chat khác.

SHA256 source cuối: history.mjs `2B6400A0E6C04D24DB8F357C0C29054565148A010E170F3B757C7D7C284EF16C`; picker `8EA86CDE0AE4C0C1864291267AB1E331E6892F793A489E5127658B6203D485E7`; controls `A0A81548A1AB2AC39D1712DF345F6538CB4314F0AE9DD09499386354BB10259E`; style `F1D6688B0077AAAC90D1FDABA3B0E7E86AA8971BE3B872AAD0C89AA1E68ED41A`.
