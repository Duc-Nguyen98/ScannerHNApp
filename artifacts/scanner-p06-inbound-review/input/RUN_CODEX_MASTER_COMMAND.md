# CODEX MASTER EXECUTION COMMAND — HOA NAM SCANNER

Hãy thực thi nhiệm vụ bằng cách đọc và tuân thủ **đồng thời** các file tôi đính kèm:

1. `COMMON_HOANAM_SCANNER_OPERATIONAL_PRO.md`
2. Prompt giai đoạn hiện tại: `Pxx_....md`
3. Các ảnh reference được prompt Px yêu cầu, nếu có.
4. Report PASS của prompt liền trước, nếu prompt hiện tại có precondition.

## QUY TẮC THỰC THI

- COMMON là contract chung bắt buộc.
- Prompt Px xác định scope cụ thể của lần chạy hiện tại.
- Không được tự mở rộng scope sang prompt kế tiếp.
- Không được tự chạy nhiều phase trong một lần.
- Không được thay đổi business rule để làm UI dễ hơn.
- Không được redesign ngoài phạm vi chỉ vì thấy “có thể đẹp hơn”.
- Không được dùng desktop preview behavior thay cho mobile runtime behavior.
- Mọi modal/dialog/bottom sheet phải nằm trong app viewport như app thật.
- Preview là specification trực quan cho Mobile App Developer; implementation phải đủ rõ để Dev dựng gần như 1:1 mà không tự suy luận interaction hoặc layout.

## TRƯỚC KHI CODE

1. Xác nhận precondition của Px.
2. Audit source hiện tại và xác định chính xác file/component liên quan.
3. Đối chiếu ảnh positive/negative reference nếu prompt yêu cầu.
4. Viết ngắn gọn Implementation Plan.
5. Chỉ sau đó mới sửa code.

## SAU KHI CODE

Bắt buộc:

1. Build/typecheck/lint trong phạm vi phù hợp.
2. Chạy unit/domain regression liên quan.
3. Chạy visual/mobile QA ở:
   - 360×800
   - 390×844
   - 430×932
4. Capture BEFORE/AFTER.
5. Kiểm tra console/page errors.
6. Kiểm tra keyboard/safe-area/overlay nếu liên quan.
7. Kiểm tra RBAC/paused/draft/business regression nếu liên quan.
8. Tạo đúng report Markdown mà prompt Px yêu cầu.

## PASS / FAIL

Không tự PASS nếu thiếu evidence.

Nếu bất kỳ Acceptance Criteria bắt buộc nào FAIL:

- ghi rõ FAIL
- liệt kê root cause
- fix recommendation
- kết luận `Pxx FAIL — FIX REQUIRED`
- STOP

Nếu tất cả đạt:

- kết luận đúng chuỗi PASS được yêu cầu trong prompt Px
- STOP
- không tự chạy prompt tiếp theo.

BẮT ĐẦU THỰC THI PROMPT Px ĐƯỢC ĐÍNH KÈM.
