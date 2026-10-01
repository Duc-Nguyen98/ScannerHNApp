# P10 r09 — căn giữa Tài khoản của tôi

User yêu cầu căn giữa tiêu đề hiện tại “Tài khoản của tôi”. Chỉ thị mới thay thế lựa chọn căn trái ở r07/r08.

Nguồn: typography và hero của P10 hiện có; thay đổi được user yêu cầu là vị trí ngang. Chỉ đặt justify-content:center cho heading bên trong `.p10-hero` và margin-left:0 cho h1. Header màn con có Back, avatar, footerLOCK và nhãn nav “Cá nhân” giữ nguyên. Không đổi behavior/integration.

Ảnh trước tham chiếu `evidence/revision-08/profile.png` tại viewport494×1000/DPR1; ảnh sau và geometry trong `evidence/revision-09`. Không viết test logic cho CSS căn chỉnh.

Kiểm browser:494×1000 và360×1000, DPR1; sai lệch tâm0px, không overflow, nav Cá nhân giữ nguyên. [Ảnh actual](evidence/revision-09/profile-494.png).
