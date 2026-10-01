# P19 r03 — rà soát và sửa lỗi UI/UX

Đã tái hiện **16 ca lỗi trên r02**, sửa nguyên nhân và kiểm lại bằng cùng kịch bản trình duyệt. Bộ audit19 ca đạt19/19;3 ca còn lại là kiểm tra phòng hồi quy đã đạt từ trước. Giữ4panel P19.S01–S04, khung494×950, footer Home/P03 và điều kiện Post/UNKNOWN.

**Behavior: PASS_PROTOTYPE trong phạm vi kiểm tra. Visual: AWAITING_USER_REVIEW. Integration: BLOCKED_PRODUCTION.**

## Các ca tái hiện và sửa

| Ca | Lỗi trước sửa | Kết quả r03 |
|---|---|---|
| A01 | Thu gọn nhập tay mất focus vào body | Focus trở lại nút Nhập tay |
| A02 | Kiểm tra → Quét mất focus/vị trí chọn chữ | Giữ bản nhập, focus và selection theo phiếu |
| A03 | Xác nhận xóa dòng mất focus | Focus dòng còn lại; giữ vị trí cuộn |
| A04 | Rời màn khi IME đang mở khiến Enter sau đó không nhận mã | Reset composition theo vòng đời DOM/route |
| A05 | BOX vừa sửa không lên đầu “mới nhất” | Nhớ thứ tự nhận theo phiếu; không đổi thứ tự dòng owner/request |
| A06 | SKU/tên/mã dài tràn ngang sheet | Wrap đầy đủ trong body cuộn, header/footer cố định |
| A07 | SKU dài tràn card | Excerpt2dòng + Xem đầy đủ dùng shared reader; không cắt dữ liệu |
| A08 | Enter khi đang composition ở số lượng xác nhận quá sớm | Chờ composition kết thúc |
| A09 | Mã rỗng mở dialog chung | Validation ngay field, giữ focus và bố cục |
| A10 | Back trong header P09 sau khi về từ P19 lại mở P19 | Bỏ caller giả `#home` trên entry mới; header về danh sách P09. Native browser Back vẫn duyệt lịch sử thực, không tự gửi lại |
| A11 | Xác nhận số lượng không đổi vẫn tăng version/xóa request | No-op giữ version/request; vẫn kiểm lại tồn trước khi chấp nhận |
| A12 | Vùng bấm Back/xóa/đóng chỉ40px | Tối thiểu44 CSS px; đồng bộ Hủy/Quay lại quét/reader cục bộ |
| A13 | Nội dung dài đẩy ô số lượng đang focus khỏi vùng thấy | Cuộn body của sheet để ô số lượng xuất hiện ngay |
| A14 | Post ghi “Đang kiểm tra” và làm mất focus; đóng lỗi không về CTA | Phân biệt “Đang xuất”/“Đang đối chiếu”; giữ focus trong app, trả đúng CTA |
| A15 | Xóa dòng cuối mất điểm thao tác tiếp | Post bị khóa, focus Quay lại quét, nhập lại được |
| A19 | Hộp còn1 vẫn mặc định2; hết tồn vẫn mở form bất khả thi | Default theo tồn đã xác minh; hết tồn/tồn sai bị chặn trước sheet |

Ngoài ra bỏ nhãn “Hộp số01” cố định không có nguồn, dùng “Tồn khả dụng”; placeholder mã ngắn đủ đọc. Nội dung nhận mã được thông báo qua live region không làm dịch layout. Không thay policy lưu bền hoặc production API.

## Kiểm chứng bản cuối

| Nhóm | Kết quả | Evidence |
|---|---|---|
| Logic P19 và owner liên quan |107/107|evidence/revision-03/node-tests.txt|
| Audit r03 |19/19;16 ca fail ở r02 đã pass|before/audit/results.json và audit/results.json|
| P19 luồng chính |9 nhóm +20 tổ hợp layout|after/results.json|
| P19 ngoại lệ |8 nhóm|edges/results.json|
| Sáu cải tiến r02 |8 nhóm +15 tổ hợp layout|ux/results.json|
| Dữ liệu dài/validation/reader/UNKNOWN |30 tổ hợp:6 trạng thái ×5 viewport|long-layout/results.json|
| P09 điều hướng |11 nhóm|p09-regression/navigation-results.json|
| P18 đăng xuất/bản nhập |3 nhóm|p18-logout/results.json|
| Footer Home/P03 |4 viewport|footer/results.json|

Tổng **58 nhóm browser,65 tổ hợp layout P19 và4 viewport footer**. Layout kiểm width/height494×950, tràn ngang, vị trí footer, số overlay và vùng bấm; dữ liệu dài cuộn thật bên trong. Viewport494×950,360×800,430×932,1440×900,340×420; DPR1. Không có pageerror trong các kết quả cuối.

Đã xem ảnh thực tế của sheet dữ liệu dài, manual SKU dài, lỗi mã rỗng, review ngắn, reader và UNKNOWN. [Review trước–sau](REVIEW_03.html), [nguồn/phạm vi](REVISION_03_CONTEXT.md). Snapshot r02 được render qua response routing từ source đã lưu trước sửa, cùng viewport và fixture; không rollback checkout. Mỗi ca before dừng khi assertion lỗi, vì vậy ảnh thể hiện điểm lỗi, không luôn cùng bước cuối after. ID và thời điểm phiếu phát sinh khác giữa lần chạy.

## Giới hạn và tiếp tục

Preview vẫn là fixture trong bộ nhớ trang; reload mất dữ liệu. Chưa kiểm chứng camera/scan/bàn phím ảo trên thiết bị thật hoặc WMS production. Không khẳng định mọi lỗi có thể xảy ra đã bị loại bỏ;16 ca đã tái hiện được đều có kiểm tra hồi quy đạt. Hình thức cần user review, không suy nghiệm thu từ số test. P18 tạm chốt và các revision chat khác được giữ;24board/91panel không đổi.

Mở http://localhost:8766/flows/auth-session/ → tải lại → minhanh / preview → Bảo hành → BH-001 → Linh kiện → Xuất linh kiện. Mã thử LK0001-HN001 và BOX-LK-0002-01.
