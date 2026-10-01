# P13 r05 — menu ổn định khi mở chi tiết

Đã sửa theo ảnh và yêu cầu user2026-09-29. Nguyên nhân là rule `.p13-detail-screen>.hn-nav{display:none}` ẩn menu cho cảS02/S04. [Phương án và bảng nguồn trước sửa](UI_UX_REVISION_05.md).

## Thay đổi

- Bỏ rule ẩn menu. Cả4 panel P13 giữ nguyên menu5 mục Home/P03, không tạo bản sao hoặc đổi style footer đã khóa.
- Khung494×950/header/điều hướng đứng yên; chỉ nội dung trong app cuộn.
- CTA chi tiết nằm trong dock phía trên menu, padding đáy44px để không chạm scan-circle; S02 có padding đáy nội dung48px. Thông báo kho/NFC không có chứng từ không hiện dock giả.
- Cả thông báo thường, thông báo có chứng từ và chi tiết chờWeb đều cùng policy. P03 mở từ menu vẫn đóng về đúng panel/ID/scroll; Back về danh sách giữ tab/số tin đã tải/scroll.

Chỉ CSS layout P13 thay đổi, auth entry đổi CSS revision, nhãn công cụ review r05. Không đổi model/read receipt/cursor/số chưa đọc hay quyền/backend. B13 detail cũ không có nav nhưng user đã yêu cầu sửa rõ, không dùng baseline cũ để tiếp tục ẩn menu.

## Kiểm chứng thực chạy

- `P13_DETAIL_PHASE=before/after node scripts/capture_notification_detail.cjs` (đặt biến bằng PowerShell):8 ảnh4 nhánh trước/sau, cùng494×950,DPR1,Arial,Asia/Ho_Chi_Minh. Nhánh kho dùng đúng event `p13-count-review-00832` trong ảnh user.
- `node scripts/check_notification_detail_nav.cjs`: **5 nhóm PASS**, gồm35 case geometry (5 nhánh ×7viewport). Có đúng1 menu/5 mục, style khớp Home khóa, CTA không giao vùng scan-circle. Kiểm menuHome/Chứng từ/Cá nhân/Lịch sử rồiBack; Quét mã/Escape/Back giữID/scroll; reader dài khóa nền gồmnav và trảfocus; giữ20 tin/All/scroll sauBack. [Kết quả](evidence/revision-05/detail-nav-results.json).
- `NOTIFICATIONS_EVIDENCE_DIR=handoff/P13/evidence/revision-05/regression node scripts/check_notifications.cjs`: **14 nhóm PASS**, kiểm4panel và24 geometry capture, scope/P12/read failure/dialog/reader/footer/logout. Assertion nav đổi từẩnS02/S04 sanghiện cả4 theo yêu cầu mới. [Kết quả](evidence/revision-05/regression/browser-results.json).
- Tổng **19 nhóm browser**, không pageerror. Viewport494×950,465×875(gần ảnh user),360×800,430×932,1440×900,340×420,1869×940. Không chạy lại unit logic vì thay đổi trình bày;21NodePASS r04 giữ là lịch sử, không báo chạy mới. Không nghiệm thuWMS/phần cứng.

## Đối chiếu hình thức

| Nhánh | Trước | Sau |
|---|---|---|
| Thông báo kho đúng event user | [Trước](evidence/revision-05/before-warehouse.png) | [Sau](evidence/revision-05/after-warehouse.png) |
| Phiếu nhậpPN-0005 | [Trước](evidence/revision-05/before-document.png) | [Sau](evidence/revision-05/after-document.png) |
| Chi tiết chờWeb | [Trước](evidence/revision-05/before-waiting.png) | [Sau](evidence/revision-05/after-waiting.png) |
| Không tìm thấy | [Trước](evidence/revision-05/before-missing.png) | [Sau](evidence/revision-05/after-missing.png) |

Đã xem actual kho/chứng từ; bố cục mới là adaptation theo phản hồi user. Visual **USER_REVIEW_PENDING**, behavior **PASS_PROTOTYPE**, integration **BLOCKED_PRODUCTION**. Không dùng số test để tự chốt visual. Footer gốc không sửa; giữ đủ4ID/91panel và công việc chat khác.

File sửa: `docs/flows/notifications/style.css`, nhãn review trong `notifications.mjs`, CSS query trong `auth-session/index.html`, assertion nav trong scriptP13. Mới: capture/kiểmnav, proposal/report/evidence r05. RUN_STATE/coverage cập nhật, evidence trước giữ nguyên. Không push/merge/deploy.
