# P12 r03 — đề xuất và sửa UX theo yêu cầu 2026-09-28

Nguồn: ảnh user Desktop/1.png–4.png; shared/UI_STANDARD.md; shared/detail-tabs.css; P09 hồ sơ/timeline/empty tại warranty/style.css. Mẫu tab đã có, không cần user xác nhận lại. Phạm vi là các màn và tab P12 được chỉ ra, giữ màn cũ và công việc chat khác.

1. Nguyên nhân mất tab: S03 render hàm products riêng, chỉ có context/search/cards; tab bar chỉ nằm trong detail(S02). Khắc phục: một detail dock dùng chung cho S02/S03, cùng header Chi tiết chứng từ. Giữ ID P12.S03 và route panel3; URL cũ vẫn mở được.
2. Header/context/tab bar/nav cố định; phần nội dung mỗi tab có scroller riêng. Theo shared P08/P09: font17, min-height48, underline teal, badge count tách nhãn như P09. Content sản phẩm co spacing hợp lý để3 dòng vẫn vừa khung.
3. Điều hướng: chọn tab hiện tại không thêm history entry, keyboard Left/Right/Home/End hoạt động qua cả4 tab. Giữ query theo document ID và scroll theo document+tab. Back/Forward không mất context; modal vẫn tiêu thụ Back trước.
4. Tài liệu: phân biệt [] (chưa có tệp) và null (chưa có nguồn). Empty card theo P09; phần Thông tin không hiện Xem tất cả khi0 tệp. Tệp có dữ liệu vẫn xem/tải thật.
5. Lịch sử: timeline quiet card + dot marker theo P09, có ngày/giờ/người thao tác/mô tả và số event, không tự tạo thêm sự kiện hoặc trạng thái.
6. Danh sách/Tạo: bảo toàn search/filter/date/scroll, validation và luồng tạo chung. Các kiểm tra r02 bao gồm hai màn này được chạy lại. Không mở rộng thành redesign P01–P24.

Visual chỉ được ghi đã kiểm bố cục sau capture, chờ user nghiệm thu; behavior và backend tách riêng.
