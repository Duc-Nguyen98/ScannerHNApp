# P12 r06 · Đối chiếu để review giao diện

**Chưa nghiệm thu visual.** Các ảnh actual dưới đây là bản sửa cần review, không phải bằng chứng “khớp pixel” hay bản Designer mới.

## Nguồn

[B12 gốc](../revision-01/baseline-B12.png) giữ nguyên. B12 chứa4 panel trong ảnh1536×1024; mỗi phone khoảng344×887 (estimated, có status bar). Runtime được user khóa494×950 và không dựng status bar giả. Vì khác tỷ lệ, không kéo méo ảnh để tạo overlay/diff rồi tự kết luận PASS.

## So sánh cùng điều kiện runtime

Chromium,494×950 CSS px,DPR1, cùng tài khoản/dataset mặc định. “Trước” lấy trực tiếp source đầu lượt sửa, “Sau” là r06.

| Màn | Trước | Bản sửa để review |
|---|---|---|
| Danh sách | [r05 actual](before/list.png) | [r06 actual](list-494x950.png) |
| Tạo Nhập | [r05 actual](before/create-inbound.png) | [r06 actual](create-inbound-494x950.png) |
| Chọn Xuất | [Form trung gian cũ](before/create-outbound.png) | [Luồng P05 hiện có](create-outbound-owner.png) |
| Chọn Bảo hành | [Form trung gian cũ](before/create-warranty.png) | [Luồng P09 hiện có](create-warranty-owner.png) |

Hai nhánh Xuất/Bảo hành dùng phương án mặc định tái sử dụng owner, **chưa nhận lựa chọn/duyệt riêng từ user**. Đây không phải tuyên bố B12 có hai form đó.

## Cần nhìn khi review

- Plus nằm giữa control tròn, không lệch theo font.
- Ngày/trạng thái là hai ô ngang bằng nhau; sắp xếp có nhãn rõ, không giống tải file.
- Form Nhập giữ thứ tự nghiệp vụ → thông tin cơ bản → kho → nhà cung cấp → ngày chưa cấp → ghi chú → CTA.
- Ô chọn có nền đậm giống trạng thái selected trong B12; icon nghiệp vụ vẫn pastel theo contract mới.
- Ngày là metadata chưa cấp, không phải giá trị đã lưu. Chỉnh ngày/backend policy còn thiếu nguồn.
- Xuất/Bảo hành dùng màn đã có, không tạo request hoặc draft song song; Back giữ bản nhập P12.

Chi tiết phân loại nguồn và các điểm khác biệt: [design-trace.json](design-trace.json).
