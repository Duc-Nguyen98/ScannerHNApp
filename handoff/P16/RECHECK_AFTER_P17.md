# P16 r02 — kiểm tra lại sau P17

User tạm chốt P015 (P15), cho phép bổ sung state sau, và yêu cầu triển khai prompt16 theo contract UI đã khóa. Đã đọc lại prompt16, AGENTS/UI_STANDARD, source state/owner và đối chiếu ảnh B16 với actual hiện tại.

**P16 r02 đã có đủ phạm vi yêu cầu. Không phát hiện thiếu sót cần sửa trong các ca đã kiểm. Giữ nguyên mã giao diện và logic ứng dụng; không tạo lại module hoặc tăng revision UI chỉ vì nhận lại prompt.** Hình thức chờ user review; behavior PASS prototype; integration production BLOCKED.

## Bốn panel hiện hành

- P16.S01: loading/skeleton, giữ controls/nav, aria-busy/status, không báo rỗng khi chưa có kết quả.
- P16.S02: response thành công rỗng; CTA tạo theo quyền, đi qua P12 và owner P04/P05/P09 hiện hữu.
- P16.S03: no-results giữ query/bộ lọc, bỏ từng điều kiện, CTA sửa từ khóa/điều chỉnh bộ lọc đúng ngữ cảnh.
- P16.S04: lỗi có retry đúng truy vấn, single-flight, giữ cache cùng scope, không giả mã lỗi/giờ cập nhật hoặc biến null thành rỗng.

Giữ sáu cải tiến r02: filter chips; CTA theo nguyên nhân; nhãn cache cũ; debounce250ms/Enter/IME; scan availability; tải lại giữ dòng ID/scroll/focus. Shell494×950 scale đồng nhất, footerLOCK và các chuẩn dialog/nội dung dài giữ nguyên.

## Kiểm chứng mới

- `node --test tests/data-states.test.mjs tests/documents.test.mjs tests/document-progress.test.mjs tests/flow-guidance.test.mjs tests/dialog-route.test.mjs`: **38/38 PASS**. [Log](evidence/recheck-after-p17/node-tests.txt).
- `node handoff/P16/evidence/recheck-after-p17/runners/check_p16_ux.cjs`: **7/7 nhóm PASS**. [Kết quả](evidence/recheck-after-p17/ux/ux-results.json).
- `node handoff/P16/evidence/recheck-after-p17/runners/check_p16_reads.cjs`: **6/6 nhóm PASS**, gồm race, single-flight, null/error, P15 network/401/403, query dài. [Kết quả](evidence/recheck-after-p17/reads/results.json).
- `node handoff/P16/evidence/recheck-after-p17/runners/check_permissions.cjs`: **2/2 nhóm PASS**, read-only chặn cả click giả/deep link, CTA empty đi owner P04 và giữ ghi chú200. [Kết quả](evidence/recheck-after-p17/permissions/browser-results.json).

Runner lưu riêng được lấy từ script hiện có: đổi thư mục evidence; suite đọc kết thúc nhập bằng Enter cho hành vi debounce r02; suite quyền lấy đúng hai ca liên quan từ suite r01, không chạy lại block before lịch sử. Không sửa test ứng dụng hoặc ghi đè evidence r01/r02. Không pageerror trong các suite hoàn tất.

**20 ảnh actual mới**: bốn panel×494×950,360×800,430×932,1440×900,340×420; Chromium headless, DPR1, zoom1, Arial. Đã xem bốn ảnh494×950 và đối chiếu B16. Các controls ngày/count/sort và artwork theo adaptation r02 đã ghi nguồn, chưa phải pixel acceptance. Backend/auth/quyền và screen reader/thiết bị thật chưa được kiểm. Không dùng fixture để tuyên bố production PASS.

[Review hiện tại](REVIEW_CURRENT.html) · [Review trước–sau r02](REVIEW_02.html) · [Nguồn r02](REVISION_02_SOURCE_MAP.md) · [Manifest xác nhận source không đổi](evidence/recheck-after-p17/VERIFICATION.json).

## Tiếp tục

Đã ghi nhận lại P15 tạm chốt. Cập nhật checkpoint hiện tại về P16 theo yêu cầu, bảo toàn hoàn tất prototype P17-r01 và toàn bộ evidence/revision khác; không thêm P17 vào danh sách chưa triển khai. Vẫn đủ24prompt/91panel. Chưa push/merge/deploy.

Mở preview → đăng nhập **minhanh / preview** → xác nhận phiên → **Chứng từ** → mở **P16 · Trạng thái dữ liệu · r02** ngoài khung app và chọn S01/S02/S03/S04. Phần tiếp theo cần user review hình thức P16; integration thật vẫn chưa xác minh.
