# P16/P17 — audit r03

User yêu cầu rà soát kỹ và khắc phục lỗi UI/UX. Phạm vi: P17 r02/P16 hiện hành và dependency trực tiếp P04/P05/P07. Root checkpoint hiện thuộc P18 r03 ở chat khác: giữ nguyên, chỉ bổ sung audit riêng và evidence P16/P17. Không diễn giải báo cáo agent thành nghiệm thu user mới.

Nguồn: AGENTS/UI_STANDARD hiện hành (bao gồm cập nhật P18), Contract2.0, nguồn r02 và ảnh actual before tại evidence/revision-03/before. Khung494×950, footerLOCK và bốn panel P17/P16 không đổi. Trước khi sửa đã chụp source của các file dự kiến chạm; các ca tái hiện dùng dữ liệu fixture, không WMS thật.

| Nhóm sửa | Nguồn/định hướng |
|---|---|
| CTA khi status unavailable | User-approved r02 “hành động thực sự khả dụng” + audit F01; đưa mở thông tin đối chiếu vào dock, không mở lại gửi |
| Vùng bấm disclosure | UI controls44px + audit F02; tăng hit area, giữ shell/footer |
| Focus có thể nhìn thấy | User-approved phục hồi thao tác + F03; explicit Nhập mã ưu tiên thấy caret, trở lại danh sách vẫn giữ scroll |
| Back/Escape ngoại lệ | Quản lý Back/focus + F04; entry UI tạm qua dialog-route hiện hữu; không thêm route nghiệp vụ hoặc retry mutation |
| Clipboard lifecycle | Dialog contract + F05/F06; hủy chờ UI khi rời màn và timeout hữu hạn, fallback thủ công, không tuyên bố clipboard thành công chưa xác minh |
| List async focus | User-approved r02 giữ focus + F07/F08; restore action theo khóa, dòng bị xóa dùng vùng danh sách |
| Mô tả tìm kiếm dài | HN-readable-content-v1 + F09;3dòng/Xem đầy đủ, nguyên query và dữ liệu |

Thay đổi nút/spacing nhỏ là adaptation để sửa lỗi trong phạm vi user yêu cầu. Visual vẫn cần review; nguyên nhân và kết quả tái hiện cụ thể được ghi trong findings.json và báo cáo cuối. Không tự mở rộng nghiệp vụ, không sửa P18/gallery/dist, không push/merge/deploy.


Kết quả cuối: F07/F08 đã PASS từ source mới hơn, không sửa code documents.mjs. F09 được xác nhận PASS sau khi sửa selector test theo reader P12 hiện hành; không thay data-states/view.mjs. F10 hit target reader là lỗi CSS riêng đã sửa. Các ghi chú dự kiến ở bảng trên không phải khẳng định mọi mục là lỗi đã tái hiện.
