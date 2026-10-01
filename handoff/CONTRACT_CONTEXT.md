# ScannerHNApp — Context chung đang áp dụng

## Bổ sung đã chốt 2026-09-28 — P11 r03

User đã yêu cầu mở rộng đồng bộ về P01–P10. Xem `handoff/dialog-sync-2026-09-28/REPORT.md` cho phân loại mỗi panel, kiểm thử và giới hạn. Không coi đợt này là nghiệm thu production hay phê duyệt các board khác đang được chat khác triển khai.

User yêu cầu khóa chuẩn thông báo dạng dialog confirm cho màn sau. Có hiệu lực theo `docs/flows/shared/UI_STANDARD.md` mục **HN-action-feedback-v1** và `AGENTS.md`: xác nhận trước thao tác dùng Hủy/tên hành động, kết quả đã xác minh dùng Đã hiểu/Đóng; không chèn dòng báo kết quả vào body hoặc đặt Hủy sau khi thao tác đã hoàn tất. Giữ validation tại field, hint tĩnh và các panel kết quả có ID. Dùng component chung `shared/action-dialog.mjs`/`.css`, overlay trong app, không chồng, focus/Back/Escape đầy đủ. Không tự mở rộng sang thay UI hàng loạt các board đã chốt.

Contract v2.0; thiết lập 2026-09-25 theo yêu cầu người dùng. Nguồn đầy đủ: `C:/Users/TAN MIE/Downloads/00_CONTRACT_CHUNG.md`. Bộ prompt và BOARD_INDEX: `C:/Users/TAN MIE/Downloads/ScannerHNApp_24_Prompts_v2.0/ScannerHNApp_24_Prompts/`.

## Ràng buộc mới sau phản hồi LOCKED (có hiệu lực cao hơn quyết định agent cũ)

- Người dùng yêu cầu không tự suy luận/thay thế ngoài nguồn; vấn đề hoặc phát sinh cần hỏi và nhận confirm trước khi tiếp phần liên quan. Xác nhận sửa trước chỉ cho sửa bám mẫu, không mở khóa/redesign.
- Asset có tên approved hoặc component có sẵn KHÔNG tự chứng minh đúng B01. Xác minh đúng source/crop/icon; thiếu thì báo riêng, không âm thầm thế “gần giống”.
- “Giống100%” là mục tiêu người dùng, không phải trạng thái mặc định. Sai khác nhìn thấy=visual FAIL. API thiếu=integration BLOCKED. Unit tests/fixture không dùng làm visual acceptance.
- P01 revision02 đã sửa bố cục và icon có nguồn; hero/logo chưa được thay vì chưa xác minh tài nguyên chính xác. Không sinh ảnh, tracing, vẽ logo mới hoặc sửa baseline để làm actual có vẻ đạt.
- Evidence mới phải ghi scroll/crop/viewport/DPR/font và xem actual thật trước kết luận. Bảo toàn lịch sử báo cáo; đính chính rõ thay vì sửa/xóa bằng chứng cũ.

## Context nền

- Giữ đúng 24 prompt/24 board: 2 original + 10 updated + 6 new + 6 current; 91 panel tối thiểu. P01=2, P02=1, P03–P24=4. P19→board17, P20→18, … P24→22; không suy ID từ số ảnh.
- Yêu cầu mới của người dùng ưu tiên trong phạm vi được chỉ định. Board locked quyết định hình thức; HANDOFF chốt mới quyết định nghiệp vụ chỗ chỉ rõ thay đổi. DEV_PROPOSAL vẫn PROPOSED. Gắn nguồn OBSERVED_IMAGE / VERIFIED_SOURCE / CONFIRMED_HANDOFF / PROPOSED / UNKNOWN / CONFLICT.
- Target hiện tại là prototype editable trong `docs/flows/`, không phải dist hoặc production. Không thay gallery thành app, không sửa bundle, không dùng ảnh board làm UI. Giữ nguyên bytes LOCKED_ORIGINALS, assets và thay đổi người dùng có trước. Không push/merge/deploy/thông báo thật.
- Nhập/xuất chính: quét/validate → kiểm tra → gửi Web → Chờ xử lý trên Web; không Duyệt/Post và không tự thay tồn. Linh kiện bảo hành là ngoại lệ Post trực tiếp, chỉ Đã xuất sau backend xác nhận.
- Một kho Hoa Nam; actor/quyền/kho từ phiên; role không thay permission guard. Khóa kho sau mã đầu. Mỗi tem linh kiện=1; quantity hộp theo contract, không trộn số lượt/mã/hộp/SKU/quantity.
- Resume đúng phiếu/version/mã. Không xóa mã server tùy ý, không coi UNKNOWN là success, không gửi lại mù/tạo phiếu bù. Lịch sử linh kiện chỉ POSTED đúng case; DRAFT riêng; tải thêm giữ trang/scroll và dedup ID.
- NFC cần event thật, không suy lịch sử từ current status; scan session khác auth session. Hồ sơ trả khách chỉ đọc, guard cả deep link/handler.
- Khôi phục, phiên/ca, closing, capacity/location và event API chưa chốt: UI/fixture có nguồn, integration chưa xác minh. Không tự thêm OTP/2FA/quyền/API/auto-notify.
- Token phải theo màn và có nguồn; số đo ảnh ghi estimated. Không áp palette/390×844/font/card của board17–22 lên originals. Chỉ asset/font/icon đã có; thiếu ghi rõ. Không device/status-bar giả.
- Kiểm từng panel/state/validation, responsive/focus; fixture không phải integration PASS. Không tự đặt ngưỡng pixel-diff. Xuất REPORT/state acceptance/ảnh actual thật, SCREEN_COVERAGE.csv và RUN_STATE.json. Chỉ thực thi P đang được yêu cầu; dependency route chưa có ghi pending.

Ownership: P01 auth; P02 Home/AppShell; P03 dialog; P04/P05 nhập/xuất; P06 lookup; P07 NFC; P08 history; P09 warranty; P10 profile; P11 security; P12 documents; P13 Web tracking; P14 recovery/shift; P15 system; P16 data; P17 scan errors; P18 attachments/location; P19 issue; P20 POSTED history; P21 resume; P22 NFC audit; P23 warranty/scan history; P24 terminal validation.

Tiến độ v2 nằm ở repo root `RUN_STATE.json` và `SCREEN_COVERAGE.csv`. Hồ sơ chuỗi5 cũ ở `../contract-work` được giữ nguyên; thay đổi history cũ được kiểm hồi quy, không gán P20 PASS khi chưa chạy P20.


## 2026-09-28 · HN-readable-content-v1 đã khóa

User yêu cầu áp dụng UI/UX nội dung dài của P12 r05 về P01–P11 và bắt buộc cho P12 trở đi. Đã triển khai component shared/readable-text.mjs/.css, policy chi tiết trong shared/UI_STANDARD.md và AGENTS.md. Ghi chú2 dòng, mô tả3 dòng + đọc đầy đủ; không cắt nguồn/đổi limit input; giữ warning/confirmation/password theo owner. Evidence: handoff/readable-content-2026-09-28/REPORT.md (268 Node/96 nhóm browser). Đây là contract UI, không chốt backend hoặc pixel acceptance toàn app.


## 2026-09-29 · P13 tạm chốt; triển khai P14 r01

User tạm chốt P13-r06 và cho phép bổ sung state sau. Không nâng production thành PASS. P14 đã dựng đủ4panel theo B14 và shell494×950/contract UI khóa; behavior fixture đã kiểm, visual chờ user review. Recovery/end-shift/aggregate thật chưa chốt; xem handoff/P14/REPORT.md. P15–P24 chưa hoàn tất.
