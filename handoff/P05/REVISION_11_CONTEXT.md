# P05 r11 — rà soát UI/UX lần hai

Nguồn: user yêu cầu rà soát kỹ lỗi nhỏ phát sinh sau r10. Giữ4 panel, khung494×950, các chuẩn chung hiện hành và tích hợp P17/P16 mới của workspace. Không suy lỗi từ thay đổi module khác; không quay lại luồng ngoại lệ cũ.

| Phần | Nguồn giữ nguyên | Sửa có căn cứ |
|---|---|---|
| Form/card giao hàng/click/select/quét/review | r10, chỉ thị user và shared UI chuẩn | Audit7 thao tác trước sửa đều đạt; giữ behavior hiện tại |
| Popup tìm địa giới | r07 neo theo trigger, r08 tinh gọn | Đã tái hiện lọc1 kết quả làm popup cao300→109px và nhảy363px; giữ side/height cho mỗi phiên mở, chỉ thích nghi khi viewport/anchor đổi |
| Keyboard popup | Semantic listbox/option đã có | Đã tái hiện ↑ chọn mục áp chót và End focus mục cuối không cuộn tới; sửa chỉ số/reveal |
| Dialog source/recipient/group, reader, exception | Component dùng chung/UI_STANDARD/P17 | Giữ nguồn chung; không thay callback/nghiệp vụ/phiếu |

Before nằm ở `evidence/revision-11/edges-before/` (3 lỗi) và `before/` (7 nhóm ổn định đã xác minh). Chụp after cùng494×1000/DPR1/fixture/mock tỉnh. Đây là sửa ổn định popup, không nghiệm thu pixel theo B05; visual cần user review. Không thêmAPI/đổi baseline/push/merge/deploy.
