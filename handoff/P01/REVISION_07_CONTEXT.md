# P01 r07 — rà soát lại theo yêu cầu user

Nguồn: B01 và P01 r03/r06; shared UI_STANDARD hiện hành. User yêu cầu rà soát kỹ và khắc phục lỗi lặt vặt, không yêu cầu thiết kế lại.

| Phần | Căn cứ | Phạm vi sửa |
|---|---|---|
| Login IME/Caps/keyboard | P01 r06 đã yêu cầu, lỗi tái hiện trong tab audit | Sửa lifecycle và focus, không sửa giá trị/policy credential |
| Recovery Back | P14 caller hiện hữu | Tiêu thụ đúng history entry, không thêm màn hay gửi recovery |
| Confirmation | strict guard + trạng thái nguồn hiện hữu | Đồng bộ badge/metadata khi state đổi, đọc đủ tên dài |
| UNKNOWN | dialog đối chiếu hiện hữu | Có đường mở lại hướng dẫn sau Để sau; không tạo API đối chiếu hoặc retry start |
| Home handoff | r06 lazy loading | Phục hồi focus keyboard khi vào Home; giữ guard/session/owner |

Ảnh trước sửa: evidence/revision-07-audit. Trạng thái kho đổi được tái hiện bằng adapter fixture thay thế trong response của tab test, không sửa adapter production/fixture file. Các kiểm thử injection không là bằng chứng nguồn thật. Giữ màu/icon/art/header/footerLOCK/baseline/24board/91panel. Nếu sửa trạng thái ngoài raster, đánh dấu adaptation chờ user review.
