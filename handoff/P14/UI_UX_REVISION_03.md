# P14 r03 · quyết định trước code

User yêu cầu áp dụng đề xuất trong AUDIT_REMAINING_2026-09-29.md. Phạm vi S01/S03/S04 và hồi quy S02; giữ4ID/24board/91panel. S02 r02, footerLOCK và baseline B14 không sửa.

| Phần | Nguồn | Áp dụng |
|---|---|---|
| S01 dock | User duyệt proposal, dock S02 r02 | 56px/lề24, submit liên kết form; UNKNOWN đổi thành Đối chiếu |
| S03 trạng thái | F01 audit + contractUNKNOWN | Một presentation state; busy/pending/guard/unfinished/ready đồng bộ banner/CTA |
| S03 danh sách | B14 + user proposal | Mã2dòng/reader shared, loại/trạng thái; nhiều phiếu chọn rõ; list dialog cùng primitive app-modal/dialog-route |
| S03 context | F04 audit + user proposal | Scroll/focus riêng panel theo phiên; không storage, không đổi ownerID/version/codes |
| S04 tổng kết | F02 audit + user proposal | Count/list/details lấy receipt.request.records; identity/time cũng đóng băng từ yêu cầu kết thúc |
| S04 metadata | User proposal + S02 typography | Ngày dd/MM/yyyy; overnight có ngày ở hai mốc; hai cột khi không có action |
| Controls | UI_STANDARD + user proposal | Action phụ tối thiểu44px; tổng kết read-only, tiếp tục phiếu qua nguồn hiện hành Home |

Lựa chọn triển khai: dock S03 chứa duy nhất action chính theo trạng thái (lưu/đối chiếu/kết thúc). Nút Kết thúc ca disabled vẫn có khi còn phiếu dở, với lý do rõ; Tiếp tục ở vùng danh sách. Dialog Tổng kết chỉ đọc snapshot, không tự mở lại/bàn giao ca cũ. Chi tiết kỹ thuật nằm trong disclosure trong cùng dialog, không chồng overlay.

Before/after: cùng494×950 CSSpx/DPR1, clock2026-09-29T08:30+07. Stress fixtures chỉ dùng trong test. Backend/policy ca mới chưa xác minh. Visual cần user review sau triển khai.
