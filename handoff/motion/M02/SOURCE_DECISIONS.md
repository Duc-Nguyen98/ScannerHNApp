# M02 — quyết định trước triển khai

- User yêu cầu thực thi MOTION_P02_Trang_chu.md ngày30/09/2026. Đọc file và MOTION_CONTRACT từ bộ Desktop v1.0, FLOW_GATE/FLOW_REPORT, M00 REPORT/OWNERSHIP, M01 REPORT, AGENTS/UI_STANDARD và context contract v2 đã lưu (nguồn Downloads cũ không còn tại M01).
- FLOW_GATE PASS UI_FIXTURE; M00 sẵn sàng, primitive đã promote ở M01. Giữ dữ liệu/24board/91panel và trạng thái business integration. Repo dirty/untracked giữ nguyên.
- Dòng “Xem tất cả vào hub lịch sử” trong file motion mâu thuẫn chỉ thị user đã chốt P12; giữ P12, tab Lịch sử tiếp tục hubP22. File cũng yêu cầu dùng chốt nghiệp vụ mới. Không dùng motion đổi route.
- Baseline là Home r16 và các sửa flow/priority-touch còn hiệu lực, footerLOCK/P03 r04; nguồn trước sửa và actual trong evidence/before*. Không đổi raster B02, hero/font/icon hoặc geometry.
- Tái sử dụng createMotionController M00: press100ms, selected nav notice140ms, route180ms tại Home shell. Dùng fade nội dung đến trên một cây live; cây đi rời/hidden ngay, không clone giữ lớp UI cũ hoặc trì hoãn route để fade-out. Hero/nav/scale không nằm trong fade nội dung Home.
- Không motion theo query/field, không animate lại grid/record khi Back, không count-up. Quyền/guard và nội dung cập nhật ngay. Security removal cancel ngay. Không thêm thư viện, observer/scroller/overlay manager/virtualizer.
- Auto tôn trọng OS reduce; route/press reduced/off0ms, selected opacity reduced≤80ms/off0. Nút review ngoài app giữ cùng policy từ P01; không tạo option full vượt OS.
- Phạm vi regression: các entry trực tiếp P02→P03/P04/P05/P06/P07/P09/P10/P12/P13/P22, Home Back/scroll/focus, guard/UNKNOWN và primitive consumerP01. Chưa rollout nội bộ các board khác.
