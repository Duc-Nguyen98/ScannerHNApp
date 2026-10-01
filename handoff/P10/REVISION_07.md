# P10 r07 — trả tiêu đề về vị trí cũ

User yêu cầu không căn giữa, giữ vị trí mặc định trước r06; đồng thời yêu cầu đề xuất câu chữ thay “Cá nhân”.

- Khôi phục `.p10-hero h1 { margin-left:58px }`; bỏ justify-content:center chỉ thêm ở r06. Không sửa avatar/footer/header màn con.
- Đề xuất **“Tài khoản của tôi”** cho tiêu đề S01: bao quát hồ sơ, quyền và bảo mật. Chưa tự đổi nhãn khi user mới yêu cầu đề xuất. Tab nav khóa vẫn là “Cá nhân”.
- Thay đổi CSS/metadata, không đổi behavior hoặc integration. Bản r06 căn giữa bị thay thế bởi chỉ thị mới này; các nâng cấp r05 khác giữ nguyên.
- Source HEAD `da9f623a19d0359c3e80c14f8cc612636ec6ab78`; target prototype. Không chạy lại test logic cho việc trả CSS về giá trị cũ.
