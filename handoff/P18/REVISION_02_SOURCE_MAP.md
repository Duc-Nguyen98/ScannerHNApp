# P18 r02 — nguồn trước sửa

User yêu cầu áp dụng cả6 đề xuất UX trong chat. Đây là authorization triển khai, chưa phải nghiệm thu visual. HEAD da9f623a19d0359c3e80c14f8cc612636ec6ab78, working copy prototype P18-r01; giữ các thay đổi khác.

| Phần | Baseline/component | Thay đổi được user cho phép | Lựa chọn triển khai cần review |
|---|---|---|---|
| S01 | B18 / r01 file rows | Tóm tắt trạng thái, tên/thumbnail mở file, action rõ, giữ thứ tự | Summary 14px; vùng chạm44px; trạng thái từng hàng, không reorder khi event đến |
| S02 | B18 / r01 PDF.js, shell494×950 | Zoom, double tap, vừa trang/vừa ngang, nhớ từng file | Toolbar cố định44px; zoom chỉ trong viewport tài liệu, giới hạn50–250%; fit tính theo viewport nội bộ; không scale AppShell |
| S03 | B18 / P09 / shared reader/dialog | Form lên trước, tóm tắt gọn, kỹ thuật/linh kiện thu gọn, CTA theo điều kiện | Case summary và details native, form chính không bị collapse; hint không phải toast; backend chưa có thì disabled |
| S04 | B18 fixture / P06 nguồn | Dấu chọn và chữ trạng thái, chi tiết cạnh grid, CTA phản ánh khả năng | Chi tiết cùng card grid, chỉ xem; thiếu nguồn đưa vị trí đã có lên trước; button về tra cứu không move |
| Back/context | Owner state và dialog-route | Giữ file/case/item/scroll/focus/form trong phiên; xác nhận trước mất nhập | Bộ nhớ per-instance theo context; guard đăng xuất chủ động khi có bản bàn giao; hết phiên vẫn theo P15, không giữ phiên trái phép |

Giữ header76px, card radius12/padding16 (r01 source), footerLOCK75px và CTA56; form nhập48px, textarea80/200ký tự. R02 đổi cấu trúc nhóm trong nội dung theo yêu cầu; số đo là lựa chọn thực thi, không CSS Designer xác minh. Không đổi91ID/24prompt, không ghi case/location/tồn hoặc mở UNKNOWN retry. Chụp before/after cùng494×950/DPR1 và4viewport phụ, snapshot source giữ tại evidence/revision-02/before/source.
