# P13 r06 — nội dung trước, metadata sau

User yêu cầu áp dụng đề xuất ngay trong lượt này. Phạm vi S02; giữ4 IDs và toàn bộ luồng r01–r05.

| Nguồn | Áp dụng |
|---|---|
| Đề xuất user đã yêu cầu triển khai | Tiêu đề → một thời gian → nguồn gửi/kho → nội dung → thông tin bổ sung |
| Hình trước/screenshot user | Metadata đang chiếm phần lớn phía trên nội dung; lặp thời gian |
| Shared UI contract | Lề24px, iconmd44px/gap14px, group24px, leading1.5, narrative3 dòng +reader, footer khóa |
| Lựa chọn triển khai cụ thể | `Thông tin chi tiết` dùng native details/summary, mặc định đóng, chứa loại thông báo và thông tin nguồn có nhãn đầy đủ; nhớ trạng thái theo event khi Back |
| Chứng từ liên quan | Mã/loại/trạng thái hiện trực tiếp sau nội dung, không bị giấu trong disclosure; CTA hiện hữu giữ nguyên |

Loại thông báo kho/NFC không dùng nhãn Loại chứng từ. Thời gian chỉ xuất hiện một lần dưới tiêu đề. Dòng nguồn gọn `actor · warehouse`; khi mở metadata, actor/kho có nhãn riêng để đối chiếu đầy đủ. Không thêm event/version/API giả hoặc CTA cho thông báo kho. Nút thử mark-read chỉ xuất hiện khi thao tác thất bại, không nhấp nháy lúc tự đánh dấu; receipt/guard/count giữ nguyên.

Disclosure không tạo history entry, keyboard Enter/Space theo native semantics, không overlay. Reader dùng controller AppShell đã có. Mở chứng từ rồi Back giữ open state; đổi sang event khác không lấy trạng thái của event trước. Giữ dock CTA trên menu có khoảng cách scan-circle r05.

Before/after cùng494×950,DPR1,bộ dữ liệu source ban đầu/event review. Chụp kho, chứng từ, không tìm thấy và S04 trước/sau để chứng minh phần ngoài phạm vi giữ nguyên. Kiểm disclosure mở/đóng, dữ liệu đầy đủ, missing/long content, đúng ID, Back/pagination/menu. Đây là adaptation theo đề xuất được cho phép thực hiện; actual visual vẫn chờ review.
