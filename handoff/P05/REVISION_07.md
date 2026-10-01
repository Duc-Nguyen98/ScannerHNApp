# P05 revision07 — popup không xô form và địa chỉ theo tỉnh/quận

Yêu cầu: khắc phục option lệch/đẩy giao diện và bổ sung Tỉnh/Thành phố → Quận/Huyện → Địa chỉ chi tiết, lấy danh mục từ https://provinces.open-api.vn/.

## Cách sửa và giới hạn phạm vi

- Thay danh sách nằm trong bố cục form của r06 bằng popup absolute neo theo tọa độ trigger, cùng chiều rộng. Portal nằm trong `.p05-app` để tính đúng tỷ lệ preview 494×950. Tự mở lên/xuống theo khoảng trống trong phần thân; tối đa300 CSS px và cuộn nội bộ. Không tăng chiều cao biểu mẫu, không đẩy field/CTA. Resize/scroll cập nhật neo; trigger ra khỏi vùng nhìn thì đóng. Chỉ một popup; đóng khi hide/render/dispose; bàn phím/Esc/Tab/click ngoài và trạng thái đã chọn được giữ.
- Danh sách hơn10 mục có tìm nhanh không phân biệt dấu/hoa thường và trạng thái không tìm thấy. Search chỉ lọc dữ liệu đã tải trong tab.
- Cụm địa chỉ riêng gồm nhãn thứ tự1/2/3, thông tin bộ địa giới, địa chỉ đã lưu làm tham khảo, preview địa chỉ đầy đủ. Không suy đoán mã địa giới từ chuỗi địa chỉ cũ. Khách đã có hoặc vãng lai đều cần chọn đúng tỉnh rồi quận mới mở ô địa chỉ chi tiết.
- Đổi tỉnh xóa quận và detail; đổi quận xóa detail. Chọn lại cùng mục giữ nguyên. Đổi khách/phiếu reset địa chỉ phụ thuộc; không xóa mã đã quét hoặc nháp ngoài phạm vi thay đổi. Mã tỉnh/quận, tên và version được lưu trong document/request, review hiển thị địa chỉ ghép đầy đủ. Request pending/UNKNOWN/final giữ bất biến như các revision trước.

## Nguồn địa giới và xử lý tải

Trang nhà cung cấp xác định **v1 trước sáp nhập07/2025**, **v2 sau07/2025**. Dùng **v1** vì yêu cầu user có cấp Quận/Huyện; đã giải thích trong commentary và ghi rõ trên UI, không gọi đây là địa giới hiện hành. Nguồn: https://provinces.open-api.vn/ .

- GET `https://provinces.open-api.vn/api/v1/` khi mở P05, rồi `p/{provinceCode}?depth=2` khi chọn tỉnh. Không gọi depth3, không tải tất cả quận của mọi tỉnh. Không gửi tên khách/phone/detail tới bên thứ ba, credentials omit/referrer no-referrer.
- Cache và gộp request cùng khóa trong bộ nhớ tab; không cache lỗi. Timeout8s bằng AbortController; lỗi tải/schema hiển thị Thử lại và giữ lựa chọn tỉnh. Kiểm cấu trúc/mã trùng/parent tỉnh trước khi sử dụng.
- Token và document/province identity chặn kết quả quận trả muộn sau đổi tỉnh/phiếu; dispose không cập nhật. Flow cũng chặn địa chỉ khi chưa có tỉnh/quận đúng, kiểm lại quan hệ từ catalogue trước next/scan/send. Không chỉ disable trên UI.
- Không tự fallback sang danh mục bịa hoặc bộ v2. Khi API lỗi, người dùng cần thử lại; không cho gửi địa chỉ chưa kiểm tra.

## Kiểm chứng

- **130/130 Node PASS**, gồm22 outbound và5 bài địa giới mới: gates/parent, reset giữ mã, frozen request, stale response đổi tỉnh/phiếu/dispose, cache/coalescing/schema, timeout/retry. [Log](evidence/revision-07/node-tests.txt). Tổng bao gồm công việc P08 hiện có, không quy mọi test mới cho revision này.
- Browser địa giới/popup **7 nhóm PASS**, **30 case bố cục** (5 select×6 viewport): so sánh chính xác tọa độ/height/scrollTop của field/footer trước-sau mở popup, cùng chiều rộng và nằm trong phần thân. Failure/retry, tìm dấu, reset/cache, keyboard/switch/resize, review/send/UNKNOWN/fresh được kiểm. [Kết quả](evidence/revision-07/browser-results.json).
- Hồi quy: metadata8, validation8, UX8, select8, lifecycle8, P05/P04 regression12 =52 nhóm; cộng7 mới = **59 nhóm browser PASS**. Không pageerror ở các suite. Các suite dùng route mock địa giới riêng để kiểm lặp lại, không giả làm tích hợp thật.
- **API thật trong Chromium PASS** không mock:63 tỉnh/thành v1,22 quận/huyện HCM; CORS, chọn79→760→nhập detail→next. Chỉ GET danh mục, không request body. [Kết quả](evidence/revision-07/live-api-results.json).
- Ảnh thật đã xem: [quận/huyện popup](evidence/revision-07/live-district-popup.png), [tìm tỉnh](evidence/revision-07/live-province-search.png); ảnh test: [địa chỉ đầy đủ](evidence/revision-07/02-address-complete.png), [lỗi district](evidence/revision-07/01-district-error.png).
- Sửa các script hồi quy để chủ động chọn địa giới khi setup trước bước quét; giữ các assertion phiếu/quantity/request/UNKNOWN/P04. Riêng regression theo dõi request cho phép đúng domain API địa giới user đã yêu cầu.

WMS/backend ghi phiếu/camera vẫn chưa tích hợp; API địa giới được kiểm riêng và không đại diện cho các integration đó. Visual mới chờ user review; bàn phím/thiết bị thật chưa kiểm chứng. Giữ P08 checkpoint và công việc hiện có/91 panel; không sửa baseline, push/merge/deploy hoặc reload tab nháp user.
