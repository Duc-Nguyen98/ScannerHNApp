# P03 r07 — Nạp bản sửa lên tab preview đang dùng

Ngày 2026-09-27. Người dùng báo backdrop vẫn đóng và footer không chuyển màn sau r06.

Đã tái hiện cả hai lỗi trên chính tab 5 của Codex in-app browser trước khi reload: footer không xuất hiện trong accessibility tree, click Lịch sử không chuyển, click backdrop trả về Home. HTTP localhost trả đúng mã r06 với no-store nhưng tab đang mở vẫn giữ controller cũ trong bộ nhớ. Kiểm tra headless trước đó chưa chứng minh tab đang dùng đã nhận bản sửa.

Đã cập nhật phiên bản toàn chuỗi import index.html → app.mjs → home.mjs → dialogs.mjs → dialog-flow.mjs thành p03-backdrop-r07 và reload chính tab. Đăng nhập lại fixture vì phiên prototype chỉ nằm trong bộ nhớ; không thêm lưu phiên hay tự động reload khi đang thao tác.

## Bằng chứng trên tab thực tế

- Bấm ba điểm backdrop: giữ nguyên P03.S01 và #home.
- Bấm footer Trang chủ: mở Home; Quét mã: mở/giữ picker.
- Bấm footer Lịch sử: mở #p02/history và hub Lịch sử thao tác.
- Bấm Chứng từ/Cá nhân: mở đúng #p02/documents, #p02/profile; báo dependency P12/P10 chưa tích hợp.
- Bấm Nhập kho trong picker: mở #p02/inbound, P04 bước 1.
- Để sẵn picker trên tab cho người dùng thử. Instrumentation chẩn đoán click đã gỡ.

[Log kiểm chứng](evidence/revision-07/live-checks.json). Ảnh: [backdrop](evidence/revision-07/live-backdrop.png), [Lịch sử](evidence/revision-07/live-history.png), [Chứng từ](evidence/revision-07/live-documents.png), [Cá nhân](evidence/revision-07/live-profile.png), [Nhập kho](evidence/revision-07/live-inbound.png).

R07 chỉ sửa phiên bản module và kiểm chứng live; 118 Node/16 nhóm P03/14 nhóm Home của r06 là kết quả lịch sử, không ghi là chạy lại. Visual toàn board vẫn chưa được nghiệm thu; backend/hardware chưa kiểm. Không sửa baseline, không mở rộng prompt, không push/merge/deploy.
