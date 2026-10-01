# Read-only review: shared feedback, P01 and P02

Ngày 28/09/2026. Phạm vi đọc: `shared/action-feedback.mjs`, `shared/dialog-route.mjs`, `auth-session/app.mjs`, `home/home.mjs` và model guard liên quan. Không sửa source chung/P01/P02 trong lượt review; root xử lý các phát hiện. Bảo toàn phần P12 đang được chat khác triển khai.

## Phát hiện đã phối hợp sửa

1. **Callback confirm bị trễ sau clear:** `action-feedback.mjs` giữ callback trong closure khi modal đóng và chờ history. `clear()` chỉ sửa `current`, không hủy callback đã capture; reset/rời rồi kích hoạt lại có thể chạy hành động cũ. Root thêm epoch trong clear/dispose và kiểm epoch trước callback.
2. **Dialog mới bị treo sau clear:** phiên bản epoch đầu tiên return ngay khi lệch epoch. Nếu `clear(); show(new)` xảy ra lúc history đang đóng, `new` nằm queue nhưng không có lần drain tiếp theo. Harness tái hiện `title:null`. Root đổi nhánh epoch lỗi để drain queue hiện hành khi còn active, đồng thời bỏ callbacks cũ.
3. **P01 UNKNOWN thiếu hành động Đối chiếu:** trước sửa, `startUnknown` chỉ có Đã hiểu. Root bổ sung Để sau/Đối chiếu; Đối chiếu dẫn tới thông báo chưa có nguồn tích hợp, không replay start hoặc giả xác minh. Ca UI thực tế do root suite kiểm.

## Kiểm chứng cuối cho helper

`node scripts/check_shared_feedback_lifecycle.cjs` → **6/6 cases PASS**, không pageerror. Chạy trên document cô lập cùng origin, không thay state P01/P02 hoặc fixture user.

| Case | onConfirm / onClose | Dialog còn lại |
|---|---|---|
| Confirm bình thường | 1 / 1 | Không |
| Confirm rồi clear, inactive → active | 0 / 0 | Không |
| Confirm rồi clear và show mới ngay | 0 / 0 của cũ | Một dialog mới |
| Queue thông báo sau confirm bình thường | 1 / 1 | Một dialog kế tiếp |
| Queue sau rich dialog | 0 / 0 | Rich đóng trước, một feedback hiện sau |
| Dispose khi callback còn chờ history | 0 / 0 | Không |

Bằng chứng: [shared-feedback-lifecycle.json](shared-feedback-lifecycle.json). Normal/clear/reactivate/queue/dispose và không chồng overlay đã được xác minh sau bản sửa cuối. Ngoài các mục trên, không tìm thấy lỗi actionable khác trong phần P01/P02 được đọc; đây không phải xác nhận toàn bộ tích hợp/backend.
