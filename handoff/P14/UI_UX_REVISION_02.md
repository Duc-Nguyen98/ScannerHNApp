# P14 r02 · receipt layout · trước sửa

User yêu cầu áp dụng toàn bộ đề xuất ở lượt trước. Phạm vi P14.S02, giữ bốn ID và nghiệp vụ.

| Quyết định | Nguồn | Thực thi |
|---|---|---|
| Ba hàng metadata/icon pastel | B14 + component r01 | Giữ nhãn, dữ liệu, thứ tự; palette shared |
| Ba cột44px/nội dung co giãn/tác vụ44px | User duyệt proposal r02 | Grid rõ vị trí; bỏ float; mọi hàng thẳng cột |
| Padding16px, hàng12px; divider bắt đầu cột chữ | User duyệt proposal | Hàng đầu/cuối không cộng đúp khoảng ngoài |
| Label16/value18, gap4/leading1.5 | User duyệt proposal | Chỉ receipt, không sửa compact summary |
| Copy icon/vùng44×44 | User duyệt + SVG copy từ nfc/nfc.mjs | Giữ aria-label/title; clipboard từ mã nguồn đầy đủ; feedback dialog |
| HH:mm · dd/MM/yyyy theo VN | User duyệt | Chỉ format timestamp, không sửa receipt ID/time |
| Về Đăng nhập cố định56px/lề24 | User duyệt + p14-actions đã có | Dock ngoài scroller, nằm trong AppShell |
| Hai dòng + reader | UI_STANDARD HN-readable-content-v1 | Controller shared; copy action ngoài reader/value |

Before/after cùng494×950 CSS px, DPR1, Arial, giờ cố định2026-09-29T02:21:00+07, username minhanh. Baseline B14 giữ nguyên; ảnh user khoanh là feedback, không phải baseline mới. Visual cần user review sau triển khai. Backend không thay đổi.
